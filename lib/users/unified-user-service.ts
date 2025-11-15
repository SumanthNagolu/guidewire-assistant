import { createClient } from '@/lib/supabase/server';
import { cache, cacheKeys } from '@/lib/redis';
import { loggers } from '@/lib/logger';
import { eventBus } from '@/lib/events/event-bus';

// User types
export interface UnifiedUser {
  id: string;
  email: string;
  fullName?: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  phone?: string;
  roles: UserRole[];
  profiles: UserProfile[];
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserRole {
  id: string;
  code: string;
  name: string;
  permissions: string[];
  assignedAt: Date;
  assignedBy?: string;
}

export interface UserProfile {
  type: 'student' | 'employee' | 'admin';
  data: Record<string, any>;
  isActive: boolean;
}

// Unified User Service
export class UnifiedUserService {
  private static instance: UnifiedUserService;

  private constructor() {}

  static getInstance(): UnifiedUserService {
    if (!UnifiedUserService.instance) {
      UnifiedUserService.instance = new UnifiedUserService();
    }
    return UnifiedUserService.instance;
  }

  // Get unified user by ID or email
  async getUser(identifier: string): Promise<UnifiedUser | null> {
    // Check cache first
    const cacheKey = cacheKeys.userProfile(identifier);
    const cached = await cache.get<UnifiedUser>(cacheKey);
    if (cached) return cached;

    const supabase = await createClient();

    // Determine if identifier is email or ID
    const isEmail = identifier.includes('@');
    
    // Get base user profile
    const query = supabase
      .from('user_profiles')
      .select(`
        *,
        user_roles!inner(
          role_id,
          assigned_at,
          assigned_by,
          roles!inner(
            id,
            code,
            name,
            permissions
          )
        )
      `);

    const { data: userProfile, error } = isEmail
      ? await query.eq('email', identifier).single()
      : await query.eq('id', identifier).single();

    if (error || !userProfile) {
      loggers.system.error('User not found', { identifier, error });
      return null;
    }

    // Build unified user object
    const unifiedUser = await this.buildUnifiedUser(userProfile);

    // Cache for 1 hour
    await cache.set(cacheKey, unifiedUser, 3600);

    // Emit user accessed event
    await eventBus.emit('user:accessed', {
      userId: unifiedUser.id,
      accessedAt: new Date(),
    });

    return unifiedUser;
  }

  // Build unified user from database data
  private async buildUnifiedUser(userProfile: any): Promise<UnifiedUser> {
    const supabase = await createClient();

    // Get roles
    const roles: UserRole[] = userProfile.user_roles?.map((ur: any) => ({
      id: ur.roles.id,
      code: ur.roles.code,
      name: ur.roles.name,
      permissions: ur.roles.permissions || [],
      assignedAt: new Date(ur.assigned_at),
      assignedBy: ur.assigned_by,
    })) || [];

    // Get profiles based on roles
    const profiles: UserProfile[] = [];

    // Check for student profile
    if (roles.some(r => r.code === 'student')) {
      const { data: studentProfile } = await supabase
        .from('student_profiles')
        .select('*')
        .eq('user_id', userProfile.id)
        .single();

      if (studentProfile) {
        profiles.push({
          type: 'student',
          data: studentProfile,
          isActive: true,
        });
      }
    }

    // Check for employee profile
    if (roles.some(r => ['employee', 'recruiter', 'hr_manager', 'admin'].includes(r.code))) {
      const { data: employeeRecord } = await supabase
        .from('employee_records')
        .select('*')
        .eq('user_id', userProfile.id)
        .single();

      if (employeeRecord) {
        profiles.push({
          type: 'employee',
          data: employeeRecord,
          isActive: employeeRecord.employment_status === 'active',
        });
      }
    }

    // Check for admin profile
    if (roles.some(r => r.code === 'admin')) {
      profiles.push({
        type: 'admin',
        data: { isSuper: roles.some(r => r.code === 'super_admin') },
        isActive: true,
      });
    }

    return {
      id: userProfile.id,
      email: userProfile.email,
      fullName: userProfile.full_name,
      firstName: userProfile.first_name,
      lastName: userProfile.last_name,
      avatarUrl: userProfile.avatar_url,
      phone: userProfile.phone,
      roles,
      profiles,
      metadata: {
        onboardingCompleted: userProfile.onboarding_completed,
        createdAt: userProfile.created_at,
        updatedAt: userProfile.updated_at,
      },
      createdAt: new Date(userProfile.created_at),
      updatedAt: new Date(userProfile.updated_at),
    };
  }

  // Create user with role
  async createUser(
    email: string,
    password: string,
    role: string,
    additionalData?: Partial<UnifiedUser>
  ): Promise<UnifiedUser> {
    const supabase = await createClient();

    try {
      // Create auth user
      const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });

      if (authError) throw authError;

      // Create user profile
      const { data: userProfile, error: profileError } = await supabase
        .from('user_profiles')
        .insert({
          id: authUser.user.id,
          email,
          full_name: additionalData?.fullName,
          first_name: additionalData?.firstName,
          last_name: additionalData?.lastName,
          avatar_url: additionalData?.avatarUrl,
          phone: additionalData?.phone,
        })
        .select()
        .single();

      if (profileError) throw profileError;

      // Assign role
      await this.assignRole(authUser.user.id, role);

      // Create appropriate profile
      await this.createProfileForRole(authUser.user.id, role, additionalData);

      // Emit user created event
      await eventBus.emit('user:created', {
        userId: authUser.user.id,
        email,
        role,
        createdAt: new Date(),
      });

      // Return unified user
      return await this.getUser(authUser.user.id) as UnifiedUser;

    } catch (error) {
      loggers.system.error('User creation failed', error);
      throw error;
    }
  }

  // Assign role to user
  async assignRole(userId: string, roleCode: string, assignedBy?: string): Promise<void> {
    const supabase = await createClient();

    // Get role ID
    const { data: role } = await supabase
      .from('roles')
      .select('id')
      .eq('code', roleCode)
      .single();

    if (!role) throw new Error(`Role ${roleCode} not found`);

    // Assign role
    await supabase
      .from('user_roles')
      .insert({
        user_id: userId,
        role_id: role.id,
        assigned_by: assignedBy,
      });

    // Clear cache
    await cache.delete(cacheKeys.userProfile(userId));

    // Emit role assigned event
    await eventBus.emit('user:role_assigned', {
      userId,
      roleCode,
      assignedBy,
      assignedAt: new Date(),
    });
  }

  // Create profile for role
  private async createProfileForRole(
    userId: string,
    role: string,
    data?: any
  ): Promise<void> {
    const supabase = await createClient();

    switch (role) {
      case 'student':
        await supabase
          .from('student_profiles')
          .insert({
            user_id: userId,
            preferred_product_id: data?.preferredProductId,
            assumed_persona: data?.assumedPersona,
            experience_level: data?.experienceLevel || 'beginner',
          });
        break;

      case 'employee':
      case 'recruiter':
      case 'hr_manager':
        await supabase
          .from('employee_records')
          .insert({
            user_id: userId,
            employee_id: await this.generateEmployeeId(),
            department_id: data?.departmentId,
            designation: data?.designation,
            employment_type: data?.employmentType || 'full-time',
            hire_date: new Date().toISOString(),
            work_location: data?.workLocation,
          });
        break;
    }
  }

  // Generate unique employee ID
  private async generateEmployeeId(): Promise<string> {
    const prefix = 'EMP';
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `${prefix}${year}${random}`;
  }

  // Update user
  async updateUser(userId: string, updates: Partial<UnifiedUser>): Promise<UnifiedUser> {
    const supabase = await createClient();

    // Update base profile
    if (updates.email || updates.fullName || updates.firstName || updates.lastName) {
      await supabase
        .from('user_profiles')
        .update({
          email: updates.email,
          full_name: updates.fullName,
          first_name: updates.firstName,
          last_name: updates.lastName,
          avatar_url: updates.avatarUrl,
          phone: updates.phone,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);
    }

    // Clear cache
    await cache.delete(cacheKeys.userProfile(userId));

    // Emit user updated event
    await eventBus.emit('user:updated', {
      userId,
      updates,
      updatedAt: new Date(),
    });

    // Return updated user
    return await this.getUser(userId) as UnifiedUser;
  }

  // Check permissions
  async hasPermission(userId: string, permission: string): Promise<boolean> {
    const user = await this.getUser(userId);
    if (!user) return false;

    return user.roles.some(role => 
      role.permissions.includes(permission) || 
      role.permissions.includes('*')
    );
  }

  // Get users by role
  async getUsersByRole(roleCode: string): Promise<UnifiedUser[]> {
    const supabase = await createClient();

    const { data: users } = await supabase
      .from('user_profiles')
      .select(`
        *,
        user_roles!inner(
          roles!inner(code)
        )
      `)
      .eq('user_roles.roles.code', roleCode);

    if (!users) return [];

    // Build unified users
    const unifiedUsers = await Promise.all(
      users.map(user => this.buildUnifiedUser(user))
    );

    return unifiedUsers;
  }

  // Search users
  async searchUsers(query: string, filters?: {
    roles?: string[];
    isActive?: boolean;
  }): Promise<UnifiedUser[]> {
    const supabase = await createClient();

    let dbQuery = supabase
      .from('user_profiles')
      .select('*')
      .or(`email.ilike.%${query}%,full_name.ilike.%${query}%,first_name.ilike.%${query}%,last_name.ilike.%${query}%`);

    const { data: users } = await dbQuery;

    if (!users) return [];

    // Build and filter unified users
    let unifiedUsers = await Promise.all(
      users.map(user => this.buildUnifiedUser(user))
    );

    // Apply filters
    if (filters?.roles) {
      unifiedUsers = unifiedUsers.filter(user =>
        user.roles.some(role => filters.roles!.includes(role.code))
      );
    }

    return unifiedUsers;
  }

  // Migrate legacy user data
  async migrateLegacyUser(oldUserId: string, newUserId: string): Promise<void> {
    const supabase = await createClient();

    // Start transaction-like operation
    try {
      // Update all references
      const tables = [
        'topic_completions',
        'quiz_attempts',
        'ai_conversations',
        'productivity_sessions',
        'employee_records',
        'student_profiles',
      ];

      for (const table of tables) {
        await supabase
          .from(table)
          .update({ user_id: newUserId })
          .eq('user_id', oldUserId);
      }

      // Emit migration event
      await eventBus.emit('user:migrated', {
        oldUserId,
        newUserId,
        migratedAt: new Date(),
      });

      loggers.system.info('User migrated', { oldUserId, newUserId });

    } catch (error) {
      loggers.system.error('User migration failed', error);
      throw error;
    }
  }

  // Deactivate user
  async deactivateUser(userId: string, reason?: string): Promise<void> {
    const supabase = await createClient();

    // Update employment status if employee
    await supabase
      .from('employee_records')
      .update({ employment_status: 'inactive' })
      .eq('user_id', userId);

    // Disable auth account
    await supabase.auth.admin.updateUserById(userId, {
      ban_duration: '87600h', // 10 years
    });

    // Clear cache
    await cache.delete(cacheKeys.userProfile(userId));

    // Emit deactivation event
    await eventBus.emit('user:deactivated', {
      userId,
      reason,
      deactivatedAt: new Date(),
    });

    loggers.system.info('User deactivated', { userId, reason });
  }
}

// Export singleton
export const unifiedUserService = UnifiedUserService.getInstance();
