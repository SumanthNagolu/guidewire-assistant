import { Metadata } from 'next'
import { AchievementsList } from '@/components/academy/achievements/AchievementsList'
export const metadata: Metadata = {
  title: 'Achievements | InTime Academy',
  description: 'Track your accomplishments and unlock rewards',
}
export default function AchievementsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Achievements
        </h1>
        <p className="text-gray-600 mt-2">
          Unlock achievements as you progress through your learning journey
        </p>
      </div>
      <AchievementsList />
    </div>
  )
}
