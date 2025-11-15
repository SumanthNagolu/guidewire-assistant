import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { TRPCProvider } from '@/providers/trpc-provider'
import { AcademySidebar } from '@/components/academy/sidebar/AcademySidebar'
export default async function AcademyLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }
  // Check if user has completed onboarding
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('onboarding_completed')
    .eq('id', user.id)
    .single()
  if (!profile?.onboarding_completed) {
    redirect('/profile-setup')
  }
  return (
    <TRPCProvider>
      <div className="flex h-screen bg-gray-50">
        <AcademySidebar />
        <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto px-4 py-8 max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </TRPCProvider>
  )
}
