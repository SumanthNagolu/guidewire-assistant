'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';

// Validation schemas
const signUpSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
});

const studentSignUpSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  phone: z.string().optional(),
  linkedin: z.string().url('Invalid LinkedIn URL').optional().or(z.literal('')),
});

const candidateSignUpSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  phone: z.string().min(1, 'Phone is required'),
  currentTitle: z.string().optional(),
  yearsOfExperience: z.number().min(0).optional(),
});

const clientSignUpSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  companyName: z.string().min(1, 'Company name is required'),
  phone: z.string().min(1, 'Phone is required'),
  industry: z.string().optional(),
  companySize: z.string().optional(),
});

const signInSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

const profileSetupSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  assumedPersona: z.string().min(1, 'Please select an assumed persona'),
  preferredProductId: z.string().min(1, 'Please select a preferred product'),
});

// API Response type
type ApiResponse<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
  redirectTo?: string;
};

export async function signUp(formData: FormData): Promise<ApiResponse> {
  const supabase = await createClient();

  // Parse and validate form data
  const rawData = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
    firstName: formData.get('firstName') as string,
    lastName: formData.get('lastName') as string,
  };

  const validation = signUpSchema.safeParse(rawData);
  if (!validation.success) {
    return {
      success: false,
      error: validation.error.issues[0].message,
    };
  }

  const { email, password, firstName, lastName } = validation.data;

  try {
    // Sign up user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
          user_type: 'user',
        },
      },
    });

    if (authError) {
      // Provide user-friendly error messages
      if (authError.message.includes('already registered') || authError.message.includes('already been registered')) {
        return { 
          success: false, 
          error: 'This email is already registered. Please log in instead.' 
        };
      }
      return { success: false, error: authError.message };
    }

    if (!authData.user) {
      return { success: false, error: 'Failed to create user' };
    }

    // Check if this is a duplicate signup attempt (user exists but email not confirmed)
    // Supabase allows this, but we should inform the user
    if (authData.user.identities && authData.user.identities.length === 0) {
      return {
        success: false,
        error: 'An account with this email already exists. Please check your email for the confirmation link or log in.',
      };
    }

    // Note: User profile is automatically created by database trigger (handle_new_user)
    // See database/migrations/004-enhanced-signup-trigger.sql

    revalidatePath('/', 'layout');
    
    // Return success with helpful message based on email confirmation status
    const message = authData.user.email_confirmed_at 
      ? 'Account created successfully! You can now log in.' 
      : 'Account created! Please check your email to verify your account.';
    
    return {
      success: true,
      data: { 
        needsEmailVerification: !authData.user.email_confirmed_at,
        message 
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred',
    };
  }
}

export async function signUpStudent(formData: FormData): Promise<ApiResponse> {
  const supabase = await createClient();

  // Parse and validate form data
  const rawData = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
    firstName: formData.get('firstName') as string,
    lastName: formData.get('lastName') as string,
    phone: formData.get('phone') as string || undefined,
    linkedin: formData.get('linkedin') as string || undefined,
  };

  const validation = studentSignUpSchema.safeParse(rawData);
  if (!validation.success) {
    return {
      success: false,
      error: validation.error.issues[0].message,
    };
  }

  const { email, password, firstName, lastName, phone, linkedin } = validation.data;

  try {
    // Sign up user with student metadata
    // Enable email confirmation by setting emailRedirectTo
    // For production, use the full domain; for local dev, use localhost
    const appUrl = process.env.NODE_ENV === 'production' 
      ? 'https://www.intimeesolutions.com'
      : 'http://localhost:3000';
    
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${appUrl}/auth/callback`,
        data: {
          first_name: firstName,
          last_name: lastName,
          phone,
          linkedin,
          user_type: 'student',
          role: 'student',
        },
      },
    });

    if (authError) {
      if (authError.message.includes('already registered') || authError.message.includes('already been registered')) {
        return { 
          success: false, 
          error: 'This email is already registered. Please log in instead.' 
        };
      }
      return { success: false, error: authError.message };
    }

    if (!authData.user) {
      return { success: false, error: 'Failed to create account' };
    }

    if (authData.user.identities && authData.user.identities.length === 0) {
      return {
        success: false,
        error: 'An account with this email already exists. Please check your email for the confirmation link or log in.',
      };
    }

    revalidatePath('/', 'layout');
    
    // Redirect to confirmation page - email will be sent automatically by Supabase
    return {
      success: true,
      redirectTo: '/signup/student/confirmation',
      data: { 
        email,
        message: 'Account created! Please check your email to verify your account and complete your registration.',
        needsEmailVerification: true,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred',
    };
  }
}

export async function signUpCandidate(formData: FormData): Promise<ApiResponse> {
  const supabase = await createClient();

  // Parse and validate form data
  const rawData = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
    firstName: formData.get('firstName') as string,
    lastName: formData.get('lastName') as string,
    phone: formData.get('phone') as string,
    currentTitle: formData.get('currentTitle') as string || undefined,
    yearsOfExperience: formData.get('yearsOfExperience') ? parseInt(formData.get('yearsOfExperience') as string) : undefined,
  };

  const validation = candidateSignUpSchema.safeParse(rawData);
  if (!validation.success) {
    return {
      success: false,
      error: validation.error.issues[0].message,
    };
  }

  const { email, password, firstName, lastName, phone, currentTitle, yearsOfExperience } = validation.data;

  try {
    // Sign up user with candidate metadata
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
          phone,
          current_title: currentTitle,
          years_of_experience: yearsOfExperience,
          user_type: 'candidate',
          role: 'candidate',
        },
      },
    });

    if (authError) {
      if (authError.message.includes('already registered') || authError.message.includes('already been registered')) {
        return { 
          success: false, 
          error: 'This email is already registered. Please log in instead.' 
        };
      }
      return { success: false, error: authError.message };
    }

    if (!authData.user) {
      return { success: false, error: 'Failed to create account' };
    }

    if (authData.user.identities && authData.user.identities.length === 0) {
      return {
        success: false,
        error: 'An account with this email already exists. Please check your email for the confirmation link or log in.',
      };
    }

    revalidatePath('/', 'layout');
    
    return {
      success: true,
      redirectTo: '/candidate/profile',
      data: { 
        message: 'Account created! Complete your profile to find your perfect job match.',
        needsEmailVerification: !authData.user.email_confirmed_at,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred',
    };
  }
}

export async function signUpClient(formData: FormData): Promise<ApiResponse> {
  const supabase = await createClient();

  // Parse and validate form data
  const rawData = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
    firstName: formData.get('firstName') as string,
    lastName: formData.get('lastName') as string,
    companyName: formData.get('companyName') as string,
    phone: formData.get('phone') as string,
    industry: formData.get('industry') as string || undefined,
    companySize: formData.get('companySize') as string || undefined,
  };

  const validation = clientSignUpSchema.safeParse(rawData);
  if (!validation.success) {
    return {
      success: false,
      error: validation.error.issues[0].message,
    };
  }

  const { email, password, firstName, lastName, companyName, phone, industry, companySize } = validation.data;

  try {
    // Sign up user with client metadata
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
          phone,
          company_name: companyName,
          industry,
          company_size: companySize,
          user_type: 'client',
          role: 'client',
        },
      },
    });

    if (authError) {
      if (authError.message.includes('already registered') || authError.message.includes('already been registered')) {
        return { 
          success: false, 
          error: 'This email is already registered. Please log in instead.' 
        };
      }
      return { success: false, error: authError.message };
    }

    if (!authData.user) {
      return { success: false, error: 'Failed to create account' };
    }

    if (authData.user.identities && authData.user.identities.length === 0) {
      return {
        success: false,
        error: 'An account with this email already exists. Please check your email for the confirmation link or log in.',
      };
    }

    revalidatePath('/', 'layout');
    
    return {
      success: true,
      redirectTo: '/client/pending-approval',
      data: { 
        message: 'Thank you for registering! Your account is pending approval. We\'ll notify you via email once approved.',
        needsEmailVerification: !authData.user.email_confirmed_at,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred',
    };
  }
}

export async function signIn(formData: FormData): Promise<ApiResponse> {
  const supabase = await createClient();

  // Parse and validate form data
  const rawData = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  };

  const validation = signInSchema.safeParse(rawData);
  if (!validation.success) {
    return {
      success: false,
      error: validation.error.issues[0].message,
    };
  }

  const { email, password } = validation.data;

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    if (!data.user) {
      return { success: false, error: 'Login failed' };
    }

    // Check if profile setup is complete
    type ProfileCheck = { onboarding_completed: boolean };

    const { data: profile } = await supabase
      .from('user_profiles')
      .select('onboarding_completed')
      .eq('id', data.user.id)
      .single<ProfileCheck>();

    revalidatePath('/', 'layout');

    if (!profile?.onboarding_completed) {
      return { success: true, redirectTo: '/profile-setup' };
    }

    // ========================================================================
    // UNIFIED ROLE-BASED ROUTING
    // ========================================================================

    // Get user roles
    const { data: userRoles } = await supabase
      .from('user_roles')
      .select('role_name')
      .eq('user_id', data.user.id);

    // Determine redirect URL based on role
    let redirectTo = '/dashboard'; // Default fallback

    if (userRoles && userRoles.length > 0) {
      // Check roles in priority order
      const roleNames = userRoles.map((ur: any) => ur.role_name).filter(Boolean);
      
      // Admin roles get highest priority
      if (roleNames.includes('admin') || roleNames.includes('ceo')) {
        redirectTo = '/admin';
      }
      // HR roles
      else if (roleNames.includes('hr_manager') || roleNames.includes('recruiter')) {
        redirectTo = '/hr/dashboard';
      }
      // Employee roles
      else if (roleNames.includes('employee') || roleNames.includes('manager')) {
        redirectTo = '/employee/dashboard';
      }
      // Student role
      else if (roleNames.includes('student')) {
        redirectTo = '/academy';
      }
    }

    return { success: true, redirectTo };
  } catch (error) {
    if (error instanceof Error && error.message.includes('NEXT_REDIRECT')) {
      throw error; // Re-throw redirect errors
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred',
    };
  }
}

export async function signInWithGoogle(): Promise<ApiResponse> {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
      },
    });

    if (error) {
      return { success: false, error: error.message };
    }

    if (data.url) {
      redirect(data.url);
    }

    return { success: true };
  } catch (error) {
    if (error instanceof Error && error.message.includes('NEXT_REDIRECT')) {
      throw error;
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred',
    };
  }
}

export async function signOut(): Promise<ApiResponse> {
  const supabase = await createClient();

  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath('/', 'layout');
    redirect('/login');
  } catch (error) {
    if (error instanceof Error && error.message.includes('NEXT_REDIRECT')) {
      throw error;
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred',
    };
  }
}

// Student profile completion after email verification
export async function completeStudentProfile(formData: FormData): Promise<ApiResponse> {
  const supabase = await createClient();

  // Get current user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { success: false, error: 'Not authenticated' };
  }

  try {
    // Extract form data
    const profileData = {
      first_name: formData.get('firstName') as string,
      last_name: formData.get('lastName') as string,
      full_name: `${formData.get('firstName')} ${formData.get('lastName')}`,
      phone: formData.get('phone') as string,
      linkedin: formData.get('linkedin') as string,
      country: formData.get('country') as string,
      state: formData.get('state') as string,
      location: formData.get('state') ? `${formData.get('state')}, ${formData.get('country')}` : formData.get('country'),
      current_title: formData.get('currentTitle') as string,
      company: formData.get('company') as string,
      years_of_experience: formData.get('yearsOfExperience') as string,
      education: formData.get('education') as string,
      interested_roles: formData.get('interestedRoles') as string, // JSON string
      interested_technologies: formData.get('interestedTechnologies') as string, // JSON string
      learning_goals: formData.get('learningGoals') as string,
      onboarding_completed: true,
    };

    // Validate required fields
    if (!profileData.first_name || !profileData.last_name || !profileData.phone || !profileData.country) {
      return { success: false, error: 'Please fill in all required fields' };
    }

    // Parse and validate interested roles and technologies
    const interestedRoles = JSON.parse(profileData.interested_roles || '[]');
    const interestedTechnologies = JSON.parse(profileData.interested_technologies || '[]');

    if (interestedRoles.length === 0 || interestedTechnologies.length === 0) {
      return { success: false, error: 'Please select at least one role and one technology' };
    }

    // Update user profile
    const { error: updateError } = await supabase
      .from('user_profiles')
      .update({
        first_name: profileData.first_name,
        last_name: profileData.last_name,
        full_name: profileData.full_name,
        phone: profileData.phone,
        location: profileData.location,
        onboarding_completed: true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    if (updateError) {
      console.error('Error updating profile:', updateError);
      return { success: false, error: 'Failed to update profile' };
    }

    // Store additional student-specific data in a metadata JSON field or separate table
    // For now, we'll update the user_metadata
    await supabase.auth.updateUser({
      data: {
        linkedin: profileData.linkedin,
        country: profileData.country,
        state: profileData.state,
        current_title: profileData.current_title,
        company: profileData.company,
        years_of_experience: profileData.years_of_experience,
        education: profileData.education,
        interested_roles: interestedRoles,
        interested_technologies: interestedTechnologies,
        learning_goals: profileData.learning_goals,
        profile_completed_at: new Date().toISOString(),
      },
    });

    revalidatePath('/', 'layout');
    
    return {
      success: true,
      data: { message: 'Profile completed successfully!' },
    };
  } catch (error) {
    console.error('Error completing profile:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred',
    };
  }
}

export async function resendVerificationEmail(email: string): Promise<ApiResponse> {
  const supabase = await createClient();
  
  try {
    const appUrl = process.env.NODE_ENV === 'production' 
      ? 'https://www.intimeesolutions.com'
      : 'http://localhost:3000';
    
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
      options: {
        emailRedirectTo: `${appUrl}/auth/callback`,
      },
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { 
      success: true, 
      data: { message: 'Verification email resent successfully!' } 
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to resend email',
    };
  }
}

export async function updateProfile(formData: FormData): Promise<ApiResponse> {
  const supabase = await createClient();

  
  // Get current user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
        return { success: false, error: 'Not authenticated' };
  }

  
  // Parse and validate form data
  const rawData = {
    firstName: formData.get('firstName') as string,
    lastName: formData.get('lastName') as string,
    assumedPersona: formData.get('assumedPersona') as string,
    preferredProductId: formData.get('preferredProductId') as string,
  };

  
  const validation = profileSetupSchema.safeParse(rawData);
  if (!validation.success) {
        return {
      success: false,
      error: validation.error.issues[0].message,
    };
  }

  const { firstName, lastName, assumedPersona, preferredProductId } = validation.data;

  
  try {
    // First, check if profile exists
        const { data: existingProfile, error: checkError } = await supabase
      .from('user_profiles')
      .select('id, email, first_name, last_name')
      .eq('id', user.id)
      .maybeSingle();

    if (checkError) {
            return { success: false, error: `Failed to check profile: ${checkError.message}` };
    }

    if (!existingProfile) {
            return { 
        success: false, 
        error: 'User profile not found. Please contact support or try signing up again.' 
      };
    }

    
    // Update user profile
        const { error: updateError, data: updatedData } = await supabase
      .from('user_profiles')
      .update({
        first_name: firstName,
        last_name: lastName,
        assumed_persona: assumedPersona,
        preferred_product_id: preferredProductId,
        onboarding_completed: true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)
      .select();

    if (updateError) {
            return { success: false, error: `Update failed: ${updateError.message}` };
    }

    if (!updatedData || updatedData.length === 0) {
            return { 
        success: false, 
        error: 'Failed to update profile. Please check permissions.' 
      };
    }

        
    revalidatePath('/', 'layout');
    redirect('/dashboard');
  } catch (error) {
    if (error instanceof Error && error.message.includes('NEXT_REDIRECT')) {

      throw error;
    }
        return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred',
    };
  }
}

