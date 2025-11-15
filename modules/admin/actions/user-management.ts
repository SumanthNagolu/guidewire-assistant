'use server';

import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';
import crypto from 'crypto';

// Validation schemas
const createUserSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  role: z.string().min(1, 'Role is required'),
  teamId: z.string().optional(),
  region: z.string().optional(),
  stream: z.string().optional(),
  location: z.string().optional(),
  jobTitle: z.string().optional(),
  employmentType: z.string().optional(),
  startDate: z.string().optional(),
  reportingTo: z.string().optional(),
  costCenter: z.string().optional(),
  groupName: z.string().optional(),
  sendWelcomeEmail: z.boolean().optional(),
});

type ApiResponse<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
};

export async function createInternalUser(
  formData: z.infer<typeof createUserSchema>
): Promise<ApiResponse> {
  const supabase = await createClient();

  // Check if current user is admin
  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser();

  if (!currentUser) {
    return { success: false, error: 'Not authenticated' };
  }

  const { data: currentProfile } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('id', currentUser.id)
    .single();

  if (currentProfile?.role !== 'admin') {
    return { success: false, error: 'Unauthorized: Admin access required' };
  }

  // Validate input
  const validation = createUserSchema.safeParse(formData);
  if (!validation.success) {
    return {
      success: false,
      error: validation.error.issues[0].message,
    };
  }

  const data = validation.data;

  try {
    // Generate a temporary password
    const tempPassword = crypto.randomBytes(12).toString('base64');

    // Create user in auth.users using admin API
    const { data: newUser, error: authError } = await supabase.auth.admin.createUser({
      email: data.email,
      password: tempPassword,
      email_confirm: true,
      user_metadata: {
        first_name: data.firstName,
        last_name: data.lastName,
        phone: data.phone,
        role: data.role,
        user_type: 'internal',
      },
    });

    if (authError) {
      if (authError.message.includes('already registered')) {
        return {
          success: false,
          error: 'This email is already registered.',
        };
      }
      return { success: false, error: authError.message };
    }

    if (!newUser.user) {
      return { success: false, error: 'Failed to create user account' };
    }

    // Update user profile with organizational details
    const { error: profileError } = await supabase
      .from('user_profiles')
      .update({
        full_name: `${data.firstName} ${data.lastName}`,
        first_name: data.firstName,
        last_name: data.lastName,
        phone: data.phone,
        role: data.role,
        team_id: data.teamId || null,
        region: data.region || null,
        stream: data.stream || null,
        location: data.location || null,
        job_title: data.jobTitle || null,
        employment_type: data.employmentType || null,
        start_date: data.startDate || null,
        reporting_to: data.reportingTo || null,
        cost_center: data.costCenter || null,
        group_name: data.groupName || null,
        is_active: true,
        onboarding_completed: true,
      })
      .eq('id', newUser.user.id);

    if (profileError) {
      console.error('Error updating profile:', profileError);
      // Don't fail the whole operation, profile might have been created by trigger
    }

    // Send welcome email if requested
    if (data.sendWelcomeEmail) {
      // Send password reset email to allow user to set their own password
      await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password`,
      });
    }

    return {
      success: true,
      data: {
        userId: newUser.user.id,
        email: data.email,
        message: 'User created successfully',
      },
    };
  } catch (error) {
    console.error('Error creating user:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred',
    };
  }
}

export async function updateUserProfile(
  userId: string,
  updates: Partial<z.infer<typeof createUserSchema>>
): Promise<ApiResponse> {
  const supabase = await createClient();

  // Check if current user is admin
  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser();

  if (!currentUser) {
    return { success: false, error: 'Not authenticated' };
  }

  const { data: currentProfile } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('id', currentUser.id)
    .single();

  if (currentProfile?.role !== 'admin') {
    return { success: false, error: 'Unauthorized: Admin access required' };
  }

  try {
    const updateData: any = {};

    if (updates.firstName || updates.lastName) {
      updateData.full_name = `${updates.firstName || ''} ${updates.lastName || ''}`.trim();
      if (updates.firstName) updateData.first_name = updates.firstName;
      if (updates.lastName) updateData.last_name = updates.lastName;
    }

    if (updates.phone !== undefined) updateData.phone = updates.phone;
    if (updates.role) updateData.role = updates.role;
    if (updates.teamId !== undefined) updateData.team_id = updates.teamId || null;
    if (updates.region !== undefined) updateData.region = updates.region || null;
    if (updates.stream !== undefined) updateData.stream = updates.stream || null;
    if (updates.location !== undefined) updateData.location = updates.location || null;
    if (updates.jobTitle !== undefined) updateData.job_title = updates.jobTitle || null;
    if (updates.employmentType !== undefined) updateData.employment_type = updates.employmentType || null;
    if (updates.startDate !== undefined) updateData.start_date = updates.startDate || null;
    if (updates.reportingTo !== undefined) updateData.reporting_to = updates.reportingTo || null;
    if (updates.costCenter !== undefined) updateData.cost_center = updates.costCenter || null;
    if (updates.groupName !== undefined) updateData.group_name = updates.groupName || null;

    const { error } = await supabase
      .from('user_profiles')
      .update(updateData)
      .eq('id', userId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: { message: 'User updated successfully' } };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred',
    };
  }
}

export async function deactivateUser(userId: string): Promise<ApiResponse> {
  const supabase = await createClient();

  // Check if current user is admin
  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser();

  if (!currentUser) {
    return { success: false, error: 'Not authenticated' };
  }

  const { data: currentProfile } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('id', currentUser.id)
    .single();

  if (currentProfile?.role !== 'admin') {
    return { success: false, error: 'Unauthorized: Admin access required' };
  }

  try {
    const { error } = await supabase
      .from('user_profiles')
      .update({
        is_active: false,
        deleted_at: new Date().toISOString(),
      })
      .eq('id', userId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: { message: 'User deactivated successfully' } };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred',
    };
  }
}

export async function resendWelcomeEmail(email: string): Promise<ApiResponse> {
  const supabase = await createClient();

  // Check if current user is admin
  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser();

  if (!currentUser) {
    return { success: false, error: 'Not authenticated' };
  }

  const { data: currentProfile } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('id', currentUser.id)
    .single();

  if (currentProfile?.role !== 'admin') {
    return { success: false, error: 'Unauthorized: Admin access required' };
  }

  try {
    // Send password reset email
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password`,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: { message: 'Welcome email sent successfully' } };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred',
    };
  }
}

