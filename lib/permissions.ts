import { createClient } from '@/lib/supabase/server';

/**
 * Permission Utility Functions
 * Provides helper functions for checking and managing user permissions
 */

export type Permission = {
  id: string;
  name: string;
  description?: string;
  category?: string;
};

export type RoleTemplate = {
  id: string;
  role_name: string;
  display_name: string;
  description?: string;
};

/**
 * Check if a user has a specific permission
 * Checks both role-based permissions and user-specific overrides
 */
export async function hasPermission(
  userId: string,
  permissionName: string
): Promise<boolean> {
  const supabase = await createClient();

  try {
    // Get user's role
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', userId)
      .single();

    if (!profile) return false;

    // Admin has all permissions
    if (profile.role === 'admin') return true;

    // Check user-specific permissions first (overrides)
    const { data: userPerm } = await supabase
      .from('user_permissions')
      .select('granted')
      .eq('user_id', userId)
      .eq('permission_id', (
        await supabase
          .from('permissions')
          .select('id')
          .eq('name', permissionName)
          .single()
      ).data?.id || '')
      .single();

    if (userPerm) {
      return userPerm.granted;
    }

    // Check role-based permissions
    const { data: rolePerms } = await supabase
      .from('role_templates')
      .select(`
        role_template_permissions!inner(
          permission_id,
          permissions!inner(name)
        )
      `)
      .eq('role_name', profile.role)
      .single();

    if (!rolePerms) return false;

    // Check if permission exists in role's permissions
    const hasRolePerm = (rolePerms as any).role_template_permissions?.some(
      (rtp: any) => rtp.permissions?.name === permissionName
    );

    return hasRolePerm || false;
  } catch (error) {
    console.error('Error checking permission:', error);
    return false;
  }
}

/**
 * Check if a user has any of the specified permissions
 */
export async function hasAnyPermission(
  userId: string,
  permissionNames: string[]
): Promise<boolean> {
  for (const permission of permissionNames) {
    if (await hasPermission(userId, permission)) {
      return true;
    }
  }
  return false;
}

/**
 * Check if a user has all of the specified permissions
 */
export async function hasAllPermissions(
  userId: string,
  permissionNames: string[]
): Promise<boolean> {
  for (const permission of permissionNames) {
    if (!(await hasPermission(userId, permission))) {
      return false;
    }
  }
  return true;
}

/**
 * Get all permissions for a user
 */
export async function getUserPermissions(userId: string): Promise<Permission[]> {
  const supabase = await createClient();

  try {
    // Get user's role
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', userId)
      .single();

    if (!profile) return [];

    // Get role-based permissions
    const { data: roleTemplate } = await supabase
      .from('role_templates')
      .select(`
        role_template_permissions(
          permissions(id, name, description, category)
        )
      `)
      .eq('role_name', profile.role)
      .single();

    let permissions: Permission[] = [];

    if (roleTemplate) {
      permissions = (roleTemplate as any).role_template_permissions?.map(
        (rtp: any) => rtp.permissions
      ) || [];
    }

    // Get user-specific permission overrides
    const { data: userPerms } = await supabase
      .from('user_permissions')
      .select(`
        granted,
        permissions(id, name, description, category)
      `)
      .eq('user_id', userId);

    if (userPerms) {
      // Apply overrides
      userPerms.forEach((up: any) => {
        const existingIndex = permissions.findIndex(
          (p) => p.id === up.permissions.id
        );
        if (up.granted && existingIndex === -1) {
          // Add granted permission
          permissions.push(up.permissions);
        } else if (!up.granted && existingIndex !== -1) {
          // Remove denied permission
          permissions.splice(existingIndex, 1);
        }
      });
    }

    return permissions;
  } catch (error) {
    console.error('Error getting user permissions:', error);
    return [];
  }
}

/**
 * Grant a permission to a user (override role-based permission)
 */
export async function grantPermission(
  userId: string,
  permissionName: string,
  grantedBy: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  try {
    // Get permission ID
    const { data: permission } = await supabase
      .from('permissions')
      .select('id')
      .eq('name', permissionName)
      .single();

    if (!permission) {
      return { success: false, error: 'Permission not found' };
    }

    // Insert or update user permission
    const { error } = await supabase
      .from('user_permissions')
      .upsert({
        user_id: userId,
        permission_id: permission.id,
        granted: true,
        granted_by: grantedBy,
        granted_at: new Date().toISOString(),
      });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Revoke a permission from a user
 */
export async function revokePermission(
  userId: string,
  permissionName: string,
  revokedBy: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  try {
    // Get permission ID
    const { data: permission } = await supabase
      .from('permissions')
      .select('id')
      .eq('name', permissionName)
      .single();

    if (!permission) {
      return { success: false, error: 'Permission not found' };
    }

    // Insert or update user permission (denied)
    const { error } = await supabase
      .from('user_permissions')
      .upsert({
        user_id: userId,
        permission_id: permission.id,
        granted: false,
        granted_by: revokedBy,
        granted_at: new Date().toISOString(),
      });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Get all available permissions grouped by category
 */
export async function getAllPermissions(): Promise<Record<string, Permission[]>> {
  const supabase = await createClient();

  try {
    const { data: permissions } = await supabase
      .from('permissions')
      .select('*')
      .order('category', { ascending: true })
      .order('name', { ascending: true });

    if (!permissions) return {};

    // Group by category
    const grouped: Record<string, Permission[]> = {};
    permissions.forEach((perm) => {
      const category = perm.category || 'other';
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(perm);
    });

    return grouped;
  } catch (error) {
    console.error('Error getting all permissions:', error);
    return {};
  }
}

/**
 * Get permissions for a specific role template
 */
export async function getRolePermissions(roleName: string): Promise<Permission[]> {
  const supabase = await createClient();

  try {
    const { data: roleTemplate } = await supabase
      .from('role_templates')
      .select(`
        role_template_permissions(
          permissions(id, name, description, category)
        )
      `)
      .eq('role_name', roleName)
      .single();

    if (!roleTemplate) return [];

    return (roleTemplate as any).role_template_permissions?.map(
      (rtp: any) => rtp.permissions
    ) || [];
  } catch (error) {
    console.error('Error getting role permissions:', error);
    return [];
  }
}

/**
 * Update permissions for a role template
 */
export async function updateRolePermissions(
  roleName: string,
  permissionIds: string[]
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  try {
    // Get role template ID
    const { data: roleTemplate } = await supabase
      .from('role_templates')
      .select('id, is_system')
      .eq('role_name', roleName)
      .single();

    if (!roleTemplate) {
      return { success: false, error: 'Role template not found' };
    }

    // Don't allow modifying system roles
    if (roleTemplate.is_system) {
      return { success: false, error: 'Cannot modify system role permissions' };
    }

    // Delete existing permissions
    await supabase
      .from('role_template_permissions')
      .delete()
      .eq('role_template_id', roleTemplate.id);

    // Insert new permissions
    const inserts = permissionIds.map((permId) => ({
      role_template_id: roleTemplate.id,
      permission_id: permId,
    }));

    const { error } = await supabase
      .from('role_template_permissions')
      .insert(inserts);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Permission constants for easy reference
 */
export const PERMISSIONS = {
  // Users
  USERS_VIEW: 'users.view',
  USERS_CREATE: 'users.create',
  USERS_EDIT: 'users.edit',
  USERS_DELETE: 'users.delete',
  USERS_MANAGE_ROLES: 'users.manage_roles',

  // Candidates
  CANDIDATES_VIEW: 'candidates.view',
  CANDIDATES_CREATE: 'candidates.create',
  CANDIDATES_EDIT: 'candidates.edit',
  CANDIDATES_DELETE: 'candidates.delete',
  CANDIDATES_ASSIGN: 'candidates.assign',

  // Clients
  CLIENTS_VIEW: 'clients.view',
  CLIENTS_CREATE: 'clients.create',
  CLIENTS_EDIT: 'clients.edit',
  CLIENTS_DELETE: 'clients.delete',
  CLIENTS_APPROVE: 'clients.approve',

  // Jobs
  JOBS_VIEW: 'jobs.view',
  JOBS_CREATE: 'jobs.create',
  JOBS_EDIT: 'jobs.edit',
  JOBS_DELETE: 'jobs.delete',
  JOBS_PUBLISH: 'jobs.publish',

  // Applications
  APPLICATIONS_VIEW: 'applications.view',
  APPLICATIONS_MANAGE: 'applications.manage',
  APPLICATIONS_INTERVIEW: 'applications.interview',

  // Placements
  PLACEMENTS_VIEW: 'placements.view',
  PLACEMENTS_CREATE: 'placements.create',
  PLACEMENTS_MANAGE: 'placements.manage',

  // Timesheets
  TIMESHEETS_VIEW: 'timesheets.view',
  TIMESHEETS_SUBMIT: 'timesheets.submit',
  TIMESHEETS_APPROVE: 'timesheets.approve',

  // Reports
  REPORTS_VIEW: 'reports.view',
  REPORTS_EXPORT: 'reports.export',
  REPORTS_ANALYTICS: 'reports.analytics',

  // HR
  HR_VIEW_EMPLOYEES: 'hr.view_employees',
  HR_MANAGE_LEAVE: 'hr.manage_leave',
  HR_MANAGE_BENEFITS: 'hr.manage_benefits',
  HR_PERFORMANCE_REVIEWS: 'hr.performance_reviews',

  // System
  SYSTEM_SETTINGS: 'system.settings',
  SYSTEM_AUDIT_LOGS: 'system.audit_logs',
  SYSTEM_INTEGRATIONS: 'system.integrations',
} as const;

