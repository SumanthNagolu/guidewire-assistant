"use client";
import { useEffect, useState } from 'react';
import { useSupabase } from '@/providers/supabase-provider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Trophy,
  Medal,
  Award,
  Star,
  Target,
  TrendingUp,
  Zap,
  Crown,
  Heart,
  Users,
  Flame,
  Gift,
  Shield,
  Sparkles,
} from 'lucide-react';
interface LeaderboardEntry {
  rank: number;
  user_id: string;
  user: {
    first_name: string;
    last_name: string;
    avatar_url?: string;
  };
  points: number;
  achievements: number;
  streak: number;
  change?: 'up' | 'down' | 'same';
  changeValue?: number;
}
interface Achievement {
  id: string;
  name: string;
  display_name: string;
  description: string;
  type: string;
  category: string;
  icon_url?: string;
  badge_color?: string;
  rarity: string;
  points_value: number;
  earned?: boolean;
  earned_at?: string;
  progress?: number;
}
interface Activity {
  id: string;
  user: {
    first_name: string;
    last_name: string;
    avatar_url?: string;
  };
  activity: string;
  points: number;
  timestamp: string;
}
export default function GamificationPage() {
  const { supabase, user } = useSupabase();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [userStats, setUserStats] = useState({
    rank: 0,
    totalPoints: 0,
    todayPoints: 0,
    weekPoints: 0,
    currentStreak: 0,
    longestStreak: 0,
    achievementCount: 0,
    nextMilestone: 0,
  });
  const [timeRange, setTimeRange] = useState('week');
  const [category, setCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetchGamificationData();
  }, [timeRange, category]);
  const fetchGamificationData = async () => {
    setLoading(true);
    try {
      // Fetch leaderboard data
      const leaderboardData: LeaderboardEntry[] = [
        { rank: 1, user_id: '1', user: { first_name: 'John', last_name: 'Smith' }, points: 2850, achievements: 15, streak: 12, change: 'same' },
        { rank: 2, user_id: '2', user: { first_name: 'Sarah', last_name: 'Johnson' }, points: 2720, achievements: 14, streak: 8, change: 'up', changeValue: 1 },
        { rank: 3, user_id: '3', user: { first_name: 'Mike', last_name: 'Wilson' }, points: 2650, achievements: 12, streak: 15, change: 'down', changeValue: 1 },
        { rank: 4, user_id: '4', user: { first_name: 'Emily', last_name: 'Davis' }, points: 2480, achievements: 11, streak: 5, change: 'up', changeValue: 2 },
        { rank: 5, user_id: '5', user: { first_name: 'David', last_name: 'Brown' }, points: 2350, achievements: 10, streak: 7, change: 'same' },
      ];
      setLeaderboard(leaderboardData);
      // Fetch achievements
      const achievementsData: Achievement[] = [
        {
          id: '1',
          name: 'first_placement',
          display_name: 'First Placement',
          description: 'Complete your first successful placement',
          type: 'milestone',
          category: 'performance',
          rarity: 'common',
          points_value: 100,
          earned: true,
          earned_at: '2024-01-15',
          progress: 100,
        },
        {
          id: '2',
          name: 'speed_demon',
          display_name: 'Speed Demon',
          description: 'Complete 5 submissions in a single day',
          type: 'badge',
          category: 'performance',
          rarity: 'rare',
          points_value: 200,
          earned: true,
          earned_at: '2024-01-20',
          progress: 100,
        },
        {
          id: '3',
          name: 'team_player',
          display_name: 'Team Player',
          description: 'Help 10 team members with their tasks',
          type: 'badge',
          category: 'teamwork',
          rarity: 'rare',
          points_value: 150,
          earned: false,
          progress: 70,
        },
        {
          id: '4',
          name: 'streak_master',
          display_name: 'Streak Master',
          description: 'Maintain a 30-day activity streak',
          type: 'streak',
          category: 'growth',
          rarity: 'epic',
          points_value: 500,
          earned: false,
          progress: 40,
        },
        {
          id: '5',
          name: 'quality_champion',
          display_name: 'Quality Champion',
          description: 'Achieve 95% candidate satisfaction rate',
          type: 'badge',
          category: 'quality',
          rarity: 'epic',
          points_value: 300,
          earned: true,
          earned_at: '2024-02-01',
          progress: 100,
        },
        {
          id: '6',
          name: 'innovator',
          display_name: 'Innovator',
          description: 'Suggest 5 process improvements that get implemented',
          type: 'special',
          category: 'innovation',
          rarity: 'legendary',
          points_value: 1000,
          earned: false,
          progress: 20,
        },
      ];
      setAchievements(achievementsData);
      // Fetch recent activities
      const activitiesData: Activity[] = [
        { id: '1', user: { first_name: 'John', last_name: 'Smith' }, activity: 'Completed job submission', points: 50, timestamp: '2 hours ago' },
        { id: '2', user: { first_name: 'Sarah', last_name: 'Johnson' }, activity: 'Achieved Quality Champion badge', points: 300, timestamp: '3 hours ago' },
        { id: '3', user: { first_name: 'Mike', last_name: 'Wilson' }, activity: 'Screened 10 candidates', points: 100, timestamp: '5 hours ago' },
        { id: '4', user: { first_name: 'Emily', last_name: 'Davis' }, activity: 'Placed candidate', points: 200, timestamp: '1 day ago' },
        { id: '5', user: { first_name: 'David', last_name: 'Brown' }, activity: 'Extended 7-day streak', points: 70, timestamp: '1 day ago' },
      ];
      setActivities(activitiesData);
      // Set user stats
      setUserStats({
        rank: 8,
        totalPoints: 1850,
        todayPoints: 120,
        weekPoints: 580,
        currentStreak: 7,
        longestStreak: 15,
        achievementCount: 8,
        nextMilestone: 2000,
      });
    } catch (error) {
      } finally {
      setLoading(false);
    }
  };
  const getAchievementIcon = (achievement: Achievement) => {
    const icons: Record<string, any> = {
      performance: Target,
      teamwork: Users,
      quality: Star,
      innovation: Sparkles,
      growth: TrendingUp,
    };
    return icons[achievement.category] || Trophy;
  };
  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
      case 'rare':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'epic':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'legendary':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
  };
  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Medal className="h-5 w-5 text-orange-600" />;
      default:
        return null;
    }
  };
  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Gamification Center</h2>
          <p className="text-muted-foreground">
            Track your progress, earn achievements, and compete with your team
          </p>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[150px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="week">This Week</SelectItem>
            <SelectItem value="month">This Month</SelectItem>
            <SelectItem value="all">All Time</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {/* User Stats Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Your Rank</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">#{userStats.rank}</div>
            <p className="text-xs text-muted-foreground">
              Top 20% of all users
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Points</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStats.totalPoints.toLocaleString()}</div>
            <div className="flex items-center text-xs">
              <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
              <span className="text-green-600">+{userStats.todayPoints} today</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
            <Flame className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStats.currentStreak} days</div>
            <p className="text-xs text-muted-foreground">
              Best: {userStats.longestStreak} days
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Achievements</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStats.achievementCount}</div>
            <Progress value={(userStats.achievementCount / achievements.length) * 100} className="mt-2 h-1" />
          </CardContent>
        </Card>
      </div>
      {/* Next Milestone Card */}
      <Card className="border-primary">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Next Milestone</CardTitle>
              <CardDescription>
                {userStats.nextMilestone - userStats.totalPoints} points to reach {userStats.nextMilestone.toLocaleString()} points
              </CardDescription>
            </div>
            <Gift className="h-8 w-8 text-primary" />
          </div>
        </CardHeader>
        <CardContent>
          <Progress 
            value={(userStats.totalPoints / userStats.nextMilestone) * 100} 
            className="h-3"
          />
          <div className="flex justify-between text-sm mt-2">
            <span>{userStats.totalPoints.toLocaleString()} points</span>
            <span>{userStats.nextMilestone.toLocaleString()} points</span>
          </div>
        </CardContent>
      </Card>
      {/* Tabs */}
      <Tabs defaultValue="leaderboard" className="space-y-4">
        <TabsList>
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="activities">Recent Activities</TabsTrigger>
          <TabsTrigger value="rewards">Rewards</TabsTrigger>
        </TabsList>
        {/* Leaderboard Tab */}
        <TabsContent value="leaderboard">
          <Card>
            <CardHeader>
              <CardTitle>Team Leaderboard</CardTitle>
              <CardDescription>
                Top performers for {timeRange === 'today' ? 'today' : timeRange === 'week' ? 'this week' : timeRange === 'month' ? 'this month' : 'all time'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {leaderboard.map((entry) => (
                  <div
                    key={entry.user_id}
                    className={`flex items-center justify-between p-4 rounded-lg border ${
                      entry.rank <= 3 ? 'bg-gradient-to-r from-yellow-50 to-transparent dark:from-yellow-900/20' : ''
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center w-8">
                        {getRankIcon(entry.rank) || (
                          <span className="text-lg font-bold text-muted-foreground">
                            {entry.rank}
                          </span>
                        )}
                      </div>
                      <Avatar>
                        <AvatarImage src={entry.user.avatar_url} />
                        <AvatarFallback>
                          {entry.user.first_name[0]}{entry.user.last_name[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">
                          {entry.user.first_name} {entry.user.last_name}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>{entry.points.toLocaleString()} points</span>
                          <span>{entry.achievements} achievements</span>
                          <div className="flex items-center gap-1">
                            <Flame className="h-3 w-3" />
                            <span>{entry.streak} day streak</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {entry.change && entry.changeValue && (
                        <div className={`flex items-center text-sm ${
                          entry.change === 'up' ? 'text-green-600' : 
                          entry.change === 'down' ? 'text-red-600' : 
                          'text-gray-500'
                        }`}>
                          {entry.change === 'up' ? '↑' : entry.change === 'down' ? '↓' : '−'}
                          {entry.change !== 'same' && entry.changeValue}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        {/* Achievements Tab */}
        <TabsContent value="achievements">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Achievements</CardTitle>
                  <CardDescription>
                    Unlock achievements by completing challenges and reaching milestones
                  </CardDescription>
                </div>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="performance">Performance</SelectItem>
                    <SelectItem value="teamwork">Teamwork</SelectItem>
                    <SelectItem value="quality">Quality</SelectItem>
                    <SelectItem value="innovation">Innovation</SelectItem>
                    <SelectItem value="growth">Growth</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {achievements
                  .filter(a => category === 'all' || a.category === category)
                  .map((achievement) => {
                    const Icon = getAchievementIcon(achievement);
                    return (
                      <Card 
                        key={achievement.id}
                        className={`${achievement.earned ? '' : 'opacity-60'}`}
                      >
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className={`p-2 rounded-lg ${
                                achievement.earned 
                                  ? 'bg-primary/10 text-primary' 
                                  : 'bg-gray-100 text-gray-400 dark:bg-gray-800'
                              }`}>
                                <Icon className="h-5 w-5" />
                              </div>
                              <div>
                                <p className="font-medium">{achievement.display_name}</p>
                                <Badge className={getRarityColor(achievement.rarity) + ' text-xs mt-1'}>
                                  {achievement.rarity}
                                </Badge>
                              </div>
                            </div>
                            {achievement.earned && (
                              <CheckCircle className="h-5 w-5 text-green-600" />
                            )}
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground mb-2">
                            {achievement.description}
                          </p>
                          {!achievement.earned && achievement.progress !== undefined && (
                            <div>
                              <div className="flex justify-between text-xs mb-1">
                                <span>Progress</span>
                                <span>{achievement.progress}%</span>
                              </div>
                              <Progress value={achievement.progress} className="h-1" />
                            </div>
                          )}
                          {achievement.earned && achievement.earned_at && (
                            <p className="text-xs text-muted-foreground">
                              Earned on {new Date(achievement.earned_at).toLocaleDateString()}
                            </p>
                          )}
                          <div className="flex justify-between items-center mt-2">
                            <span className="text-xs font-medium">
                              +{achievement.points_value} points
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        {/* Activities Tab */}
        <TabsContent value="activities">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activities</CardTitle>
              <CardDescription>
                Live feed of team achievements and milestones
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activities.map((activity) => (
                  <div key={activity.id} className="flex items-center gap-4">
                    <Avatar>
                      <AvatarImage src={activity.user.avatar_url} />
                      <AvatarFallback>
                        {activity.user.first_name[0]}{activity.user.last_name[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="text-sm">
                        <span className="font-medium">
                          {activity.user.first_name} {activity.user.last_name}
                        </span>{' '}
                        {activity.activity}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {activity.timestamp}
                      </p>
                    </div>
                    <Badge variant="secondary">
                      +{activity.points} points
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        {/* Rewards Tab */}
        <TabsContent value="rewards">
          <Card>
            <CardHeader>
              <CardTitle>Rewards & Benefits</CardTitle>
              <CardDescription>
                Unlock exclusive rewards as you progress
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      <Shield className="h-5 w-5 text-blue-600" />
                      <CardTitle className="text-base">Bronze Tier</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-2">0 - 1,000 points</p>
                    <ul className="text-sm space-y-1">
                      <li>• Basic badge display</li>
                      <li>• Weekly progress reports</li>
                      <li>• Team recognition</li>
                    </ul>
                  </CardContent>
                </Card>
                <Card className="border-primary">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      <Shield className="h-5 w-5 text-gray-400" />
                      <CardTitle className="text-base">Silver Tier</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-2">1,001 - 5,000 points</p>
                    <ul className="text-sm space-y-1">
                      <li>• Custom avatar frame</li>
                      <li>• Priority support</li>
                      <li>• Monthly bonus points</li>
                      <li>• Early feature access</li>
                    </ul>
                    <Progress value={85} className="mt-2" />
                    <p className="text-xs text-muted-foreground mt-1">
                      150 points to unlock
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      <Crown className="h-5 w-5 text-yellow-500" />
                      <CardTitle className="text-base">Gold Tier</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-2">5,001+ points</p>
                    <ul className="text-sm space-y-1">
                      <li>• Exclusive rewards</li>
                      <li>• Leadership opportunities</li>
                      <li>• Quarterly bonuses</li>
                      <li>• VIP event invitations</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
