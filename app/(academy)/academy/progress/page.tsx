import { Metadata } from 'next'
import { ProgressOverview } from '@/components/academy/progress/ProgressOverview'
export const metadata: Metadata = {
  title: 'Progress | InTime Academy',
  description: 'Track your learning progress and achievements',
}
export default function ProgressPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Your Progress
        </h1>
        <p className="text-gray-600 mt-2">
          Track your learning journey and see how far you've come
        </p>
      </div>
      <ProgressOverview />
    </div>
  )
}
