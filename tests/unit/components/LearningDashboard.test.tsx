import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@/tests/utils/test-utils'
import { LearningDashboard } from '@/components/academy/learning-dashboard/LearningDashboard'
import { mockRouter } from '@/tests/mocks/trpc'

describe('LearningDashboard', () => {
  const mockUserProfile = {
    id: 'test-user-id',
    first_name: 'Test',
    last_name: 'User',
  }

  it('should render loading state initially', () => {
    mockRouter.learning.getStats.useQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    })

    mockRouter.learning.getNextTopic.useQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    })

    mockRouter.gamification.getRecentActivity.useQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    })

    render(<LearningDashboard userProfile={mockUserProfile} />)

    expect(screen.getByTestId('stats-skeleton')).toBeInTheDocument()
  })

  it('should display user stats when loaded', () => {
    const mockStats = {
      topics_completed: 5,
      overall_progress: 65,
      current_level: 3,
      total_xp: 450,
      learning_streak: 7,
    }

    mockRouter.learning.getStats.useQuery.mockReturnValue({
      data: mockStats,
      isLoading: false,
      error: null,
    })

    mockRouter.learning.getNextTopic.useQuery.mockReturnValue({
      data: null,
      isLoading: false,
      error: null,
    })

    mockRouter.gamification.getRecentActivity.useQuery.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    })

    render(<LearningDashboard userProfile={mockUserProfile} />)

    expect(screen.getByText('5')).toBeInTheDocument() // Topics completed
    expect(screen.getByText('65%')).toBeInTheDocument() // Progress
    expect(screen.getByText('Level 3')).toBeInTheDocument()
    expect(screen.getByText('7 days')).toBeInTheDocument() // Streak
  })

  it('should display daily missions when next topic is available', () => {
    const mockNextTopic = {
      id: 'next-topic-id',
      title: 'Advanced PolicyCenter',
      description: 'Learn advanced features',
      estimated_time: 30,
      xp_reward: 50,
    }

    mockRouter.learning.getStats.useQuery.mockReturnValue({
      data: {
        topics_completed: 0,
        overall_progress: 0,
        current_level: 1,
        total_xp: 0,
        learning_streak: 0,
      },
      isLoading: false,
      error: null,
    })

    mockRouter.learning.getNextTopic.useQuery.mockReturnValue({
      data: mockNextTopic,
      isLoading: false,
      error: null,
    })

    mockRouter.gamification.getRecentActivity.useQuery.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    })

    render(<LearningDashboard userProfile={mockUserProfile} />)

    expect(screen.getByText('Today\'s Mission')).toBeInTheDocument()
    expect(screen.getByText('Advanced PolicyCenter')).toBeInTheDocument()
    expect(screen.getByText('+50 XP')).toBeInTheDocument()
  })

  it('should show recent achievements', () => {
    const mockAchievements = [
      {
        id: 'ach-1',
        type: 'achievement_unlocked',
        description: 'Earned "Fast Learner" achievement',
        xp_earned: 100,
        created_at: new Date().toISOString(),
        metadata: {
          achievement_name: 'Fast Learner',
          achievement_icon: '⚡',
        },
      },
    ]

    mockRouter.learning.getStats.useQuery.mockReturnValue({
      data: {
        topics_completed: 0,
        overall_progress: 0,
        current_level: 1,
        total_xp: 0,
        learning_streak: 0,
      },
      isLoading: false,
      error: null,
    })

    mockRouter.learning.getNextTopic.useQuery.mockReturnValue({
      data: null,
      isLoading: false,
      error: null,
    })

    mockRouter.gamification.getRecentActivity.useQuery.mockReturnValue({
      data: mockAchievements,
      isLoading: false,
      error: null,
    })

    render(<LearningDashboard userProfile={mockUserProfile} />)

    expect(screen.getByText('Recent Achievements')).toBeInTheDocument()
    expect(screen.getByText(/Fast Learner/)).toBeInTheDocument()
    expect(screen.getByText('+100 XP')).toBeInTheDocument()
  })

  it('should handle error states gracefully', () => {
    mockRouter.learning.getStats.useQuery.mockReturnValue({
      data: null,
      isLoading: false,
      error: { message: 'Failed to fetch stats' },
    })

    mockRouter.learning.getNextTopic.useQuery.mockReturnValue({
      data: null,
      isLoading: false,
      error: null,
    })

    mockRouter.gamification.getRecentActivity.useQuery.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    })

    render(<LearningDashboard userProfile={mockUserProfile} />)

    // Should still render but with default values
    expect(screen.getByText('Hi, Test! \ud83d\udc4b')).toBeInTheDocument()
  })
})