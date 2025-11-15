import { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { TeamDashboard } from '@/components/enterprise/dashboard/TeamDashboard'
export const metadata: Metadata = {
  title: 'Enterprise Dashboard | InTime Academy',
  description: 'Manage your team\'s learning progress',
}
export default async function EnterpriseDashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return null
  }
  const { data: membership } = await supabase
    .from('organization_members')
    .select(`
      *,
      organizations(*)
    `)
    .eq('user_id', user.id)
    .single()
  if (!membership || !membership.organizations) {
    return null
  }
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Enterprise Dashboard
        </h1>
        <p className="text-gray-600 mt-2">
          Monitor and manage your team's learning progress
        </p>
      </div>
      <TeamDashboard 
        organizationId={membership.organizations.id}
        userRole={membership.role}
      />
    </div>
  )
}
