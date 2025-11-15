import { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { TeamMembersList } from '@/components/enterprise/members/TeamMembersList'
export const metadata: Metadata = {
  title: 'Team Members | InTime Academy Enterprise',
  description: 'Manage your team members and invitations',
}
export default async function EnterpriseMembersPage() {
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
          Team Members
        </h1>
        <p className="text-gray-600 mt-2">
          View and manage your organization's members
        </p>
      </div>
      <TeamMembersList
        organizationId={membership.organizations.id}
        userRole={membership.role}
        organizationSeats={{
          purchased: membership.organizations.seats_purchased,
          used: membership.organizations.seats_used,
        }}
      />
    </div>
  )
}
