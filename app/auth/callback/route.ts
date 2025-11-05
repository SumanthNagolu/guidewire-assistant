import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const origin = requestUrl.origin;

  if (code) {
    const supabase = await createClient();
    
    // Exchange code for session
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      // Check if user profile exists
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('id, onboarding_completed')
        .eq('id', data.user.id)
        .single();

      // Create profile if it doesn't exist (for OAuth users)
      if (!profile) {
        const metadata = data.user.user_metadata;
        await (supabase.from('user_profiles') as any).insert({
          id: data.user.id,
          email: data.user.email!,
          first_name: metadata.full_name?.split(' ')[0] || metadata.name?.split(' ')[0] || null,
          last_name: metadata.full_name?.split(' ').slice(1).join(' ') || metadata.name?.split(' ').slice(1).join(' ') || null,
          role: 'user',
          onboarding_completed: false,
        });

        // Redirect to profile setup
        return NextResponse.redirect(`${origin}/profile-setup`);
      }

      // If profile exists but onboarding not completed
      if (!profile.onboarding_completed) {
        return NextResponse.redirect(`${origin}/profile-setup`);
      }

      // Redirect to dashboard if everything is set up
      return NextResponse.redirect(`${origin}/dashboard`);
    }
  }

  // Redirect to login on error
  return NextResponse.redirect(`${origin}/login`);
}

