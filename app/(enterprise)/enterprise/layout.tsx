import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { TRPCProvider } from '@/providers/trpc-provider'
import { EnterpriseSidebar } from '@/components/enterprise/sidebar/EnterpriseSidebar'
export default async function EnterpriseLayout({
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
  // Check if user is part of an organization
  const { data: membership } = await supabase
    .from('organization_members')
    .select(`
      role,
      organizations(
        id,
        name,
        logo_url
      )
    `)
    .eq('user_id', user.id)
    .single()
  if (!membership || !['manager', 'admin', 'owner'].includes(membership.role)) {
    redirect('/academy')
  }
  return (
    <TRPCProvider>
      <div className="flex h-screen bg-gray-50">
        <EnterpriseSidebar 
          organization={membership.organizations}
          userRole={membership.role}
        />
        <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto px-4 py-8 max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </TRPCProvider>
  )
}
