import { Metadata } from 'next'
import { LeaderboardTable } from '@/components/academy/leaderboard/LeaderboardTable'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Trophy, Zap, Target, Users } from 'lucide-react'
export const metadata: Metadata = {
  title: 'Leaderboard | InTime Academy',
  description: 'See how you rank against other learners',
}
export default function LeaderboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Leaderboard
        </h1>
        <p className="text-gray-600 mt-2">
          Compete with fellow learners and climb the ranks
        </p>
      </div>
      {/* Weekly Challenges */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Target className="h-4 w-4 text-primary-600" />
              Weekly Challenge
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-primary-700">
              Complete 15 Topics
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Reward: 500 XP + Special Badge
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Zap className="h-4 w-4 text-yellow-600" />
              Bonus XP Active
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-yellow-700">
              2x XP Weekend
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Ends in 2 days
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-4 w-4 text-green-600" />
              Active Learners
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-700">
              1,247
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              This week
            </p>
          </CardContent>
        </Card>
      </div>
      <LeaderboardTable />
    </div>
  )
}
