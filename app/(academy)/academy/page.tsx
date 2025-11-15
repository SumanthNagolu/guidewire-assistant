import { Metadata } from 'next'
import { LearningDashboard } from '@/components/academy/learning-dashboard/LearningDashboard'
import { createClient } from '@/lib/supabase/server'
export const metadata: Metadata = {
  title: 'Academy Dashboard | InTime Academy',
  description: 'Track your learning progress and achievements',
}
export default async function AcademyDashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return null
  }
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('first_name, last_name')
    .eq('id', user.id)
    .single()
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {profile?.first_name}! 👋
        </h1>
        <p className="text-gray-600 mt-2">
          Ready to continue your learning journey? Let's make today count!
        </p>
      </div>
      <LearningDashboard />
    </div>
  )
}
