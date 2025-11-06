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
    // See database/FIX-SIGNUP-TRIGGER.sql

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
      redirect('/profile-setup');
    }

    redirect('/dashboard');
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

export async function updateProfile(formData: FormData): Promise<ApiResponse> {
  const supabase = await createClient();

  console.log('[updateProfile] Starting profile update...');

  // Get current user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    console.error('[updateProfile] Auth error:', userError);
    return { success: false, error: 'Not authenticated' };
  }

  console.log('[updateProfile] User authenticated:', user.id);

  // Parse and validate form data
  const rawData = {
    firstName: formData.get('firstName') as string,
    lastName: formData.get('lastName') as string,
    assumedPersona: formData.get('assumedPersona') as string,
    preferredProductId: formData.get('preferredProductId') as string,
  };

  console.log('[updateProfile] Raw form data:', rawData);

  const validation = profileSetupSchema.safeParse(rawData);
  if (!validation.success) {
    console.error('[updateProfile] Validation failed:', validation.error.issues);
    return {
      success: false,
      error: validation.error.issues[0].message,
    };
  }

  const { firstName, lastName, assumedPersona, preferredProductId } = validation.data;

  console.log('[updateProfile] Validated data:', {
    firstName,
    lastName,
    assumedPersona,
    preferredProductId,
    userId: user.id,
  });

  try {
    // First, check if profile exists
    console.log('[updateProfile] Checking if profile exists...');
    const { data: existingProfile, error: checkError } = await supabase
      .from('user_profiles')
      .select('id, email, first_name, last_name')
      .eq('id', user.id)
      .maybeSingle();

    if (checkError) {
      console.error('[updateProfile] Error checking profile:', checkError);
      return { success: false, error: `Failed to check profile: ${checkError.message}` };
    }

    if (!existingProfile) {
      console.error('[updateProfile] Profile does not exist for user:', user.id);
      return { 
        success: false, 
        error: 'User profile not found. Please contact support or try signing up again.' 
      };
    }

    console.log('[updateProfile] Profile found:', existingProfile);

    // Update user profile
    console.log('[updateProfile] Attempting database update...');
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
      console.error('[updateProfile] Database update error:', updateError);
      return { success: false, error: `Update failed: ${updateError.message}` };
    }

    if (!updatedData || updatedData.length === 0) {
      console.error('[updateProfile] No rows updated - possible RLS issue');
      return { 
        success: false, 
        error: 'Failed to update profile. Please check permissions.' 
      };
    }

    console.log('[updateProfile] Database updated successfully:', updatedData);
    console.log('[updateProfile] Revalidating paths and redirecting to dashboard...');

    revalidatePath('/', 'layout');
    redirect('/dashboard');
  } catch (error) {
    if (error instanceof Error && error.message.includes('NEXT_REDIRECT')) {
      console.log('[updateProfile] Redirect triggered (expected behavior)');
      throw error;
    }
    console.error('[updateProfile] Unexpected error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred',
    };
  }
}

