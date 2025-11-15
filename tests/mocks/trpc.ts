import { vi } from 'vitest'

// Mock tRPC router with all procedures
export const mockRouter = {
  learning: {
    getTopics: {
      useQuery: vi.fn(() => ({
        data: [],
        isLoading: false,
        error: null,
      })),
    },
    getTopic: {
      useQuery: vi.fn(() => ({
        data: null,
        isLoading: false,
        error: null,
      })),
    },
    startTopic: {
      useMutation: vi.fn(() => ({
        mutate: vi.fn(),
        mutateAsync: vi.fn(),
        isLoading: false,
      })),
    },
    completeTopic: {
      useMutation: vi.fn(() => ({
        mutate: vi.fn(),
        mutateAsync: vi.fn(),
        isLoading: false,
      })),
    },
    getLearningPath: {
      useQuery: vi.fn(() => ({
        data: null,
        isLoading: false,
        error: null,
      })),
    },
    getNextTopic: {
      useQuery: vi.fn(() => ({
        data: null,
        isLoading: false,
        error: null,
      })),
    },
    getStats: {
      useQuery: vi.fn(() => ({
        data: {
          topics_completed: 0,
          overall_progress: 0,
          current_level: 1,
          total_xp: 0,
          learning_streak: 0,
        },
        isLoading: false,
        error: null,
      })),
    },
    getLearningBlocks: {
      useQuery: vi.fn(() => ({
        data: [],
        isLoading: false,
        error: null,
      })),
    },
    startLearningBlock: {
      useMutation: vi.fn(() => ({
        mutate: vi.fn(),
        mutateAsync: vi.fn(),
        isLoading: false,
      })),
    },
    completeLearningBlock: {
      useMutation: vi.fn(() => ({
        mutate: vi.fn(),
        mutateAsync: vi.fn(),
        isLoading: false,
      })),
    },
  },
  gamification: {
    getUserLevel: {
      useQuery: vi.fn(() => ({
        data: {
          current_level: 1,
          current_xp: 0,
          xp_for_next_level: 100,
          total_xp: 0,
          title: 'Beginner',
        },
        isLoading: false,
        error: null,
      })),
    },
    getAchievements: {
      useQuery: vi.fn(() => ({
        data: [],
        isLoading: false,
        error: null,
      })),
    },
    getUserAchievements: {
      useQuery: vi.fn(() => ({
        data: [],
        isLoading: false,
        error: null,
      })),
    },
    getLeaderboard: {
      useQuery: vi.fn(() => ({
        data: {
          entries: [],
          userRank: null,
        },
        isLoading: false,
        error: null,
      })),
    },
    getRecentActivity: {
      useQuery: vi.fn(() => ({
        data: [],
        isLoading: false,
        error: null,
      })),
    },
    getXPHistory: {
      useQuery: vi.fn(() => ({
        data: [],
        isLoading: false,
        error: null,
      })),
    },
    claimAchievement: {
      useMutation: vi.fn(() => ({
        mutate: vi.fn(),
        mutateAsync: vi.fn(),
        isLoading: false,
      })),
    },
  },
  ai: {
    generateLearningPath: {
      useMutation: vi.fn(() => ({
        mutate: vi.fn(),
        mutateAsync: vi.fn(),
        isLoading: false,
      })),
    },
    generateProjectPlan: {
      useMutation: vi.fn(() => ({
        mutate: vi.fn(),
        mutateAsync: vi.fn(),
        isLoading: false,
      })),
    },
    askMentor: {
      useMutation: vi.fn(() => ({
        mutate: vi.fn(),
        mutateAsync: vi.fn(),
        isLoading: false,
      })),
    },
    getMentorConversations: {
      useQuery: vi.fn(() => ({
        data: [],
        isLoading: false,
        error: null,
      })),
    },
    enhanceContent: {
      useMutation: vi.fn(() => ({
        mutate: vi.fn(),
        mutateAsync: vi.fn(),
        isLoading: false,
      })),
    },
    generateInterviewQuestions: {
      useMutation: vi.fn(() => ({
        mutate: vi.fn(),
        mutateAsync: vi.fn(),
        isLoading: false,
      })),
    },
    analyzeResume: {
      useMutation: vi.fn(() => ({
        mutate: vi.fn(),
        mutateAsync: vi.fn(),
        isLoading: false,
      })),
    },
    generateStudyPlan: {
      useMutation: vi.fn(() => ({
        mutate: vi.fn(),
        mutateAsync: vi.fn(),
        isLoading: false,
      })),
    },
    getAIUsageStats: {
      useQuery: vi.fn(() => ({
        data: {
          totalRequests: 0,
          requestsByType: {},
          tokensUsed: 0,
        },
        isLoading: false,
        error: null,
      })),
    },
  },
  enterprise: {
    getMyOrganization: {
      useQuery: vi.fn(() => ({
        data: null,
        isLoading: false,
        error: null,
      })),
    },
    getOrganization: {
      useQuery: vi.fn(() => ({
        data: null,
        isLoading: false,
        error: null,
      })),
    },
    getMembers: {
      useQuery: vi.fn(() => ({
        data: [],
        isLoading: false,
        error: null,
      })),
    },
    inviteMembers: {
      useMutation: vi.fn(() => ({
        mutate: vi.fn(),
        mutateAsync: vi.fn(),
        isLoading: false,
      })),
    },
    removeMember: {
      useMutation: vi.fn(() => ({
        mutate: vi.fn(),
        mutateAsync: vi.fn(),
        isLoading: false,
      })),
    },
    updateMemberRole: {
      useMutation: vi.fn(() => ({
        mutate: vi.fn(),
        mutateAsync: vi.fn(),
        isLoading: false,
      })),
    },
    getTeamProgress: {
      useQuery: vi.fn(() => ({
        data: null,
        isLoading: false,
        error: null,
      })),
    },
    getTeamAnalytics: {
      useQuery: vi.fn(() => ({
        data: null,
        isLoading: false,
        error: null,
      })),
    },
    createTeamGoal: {
      useMutation: vi.fn(() => ({
        mutate: vi.fn(),
        mutateAsync: vi.fn(),
        isLoading: false,
      })),
    },
    updateOrganizationSettings: {
      useMutation: vi.fn(() => ({
        mutate: vi.fn(),
        mutateAsync: vi.fn(),
        isLoading: false,
      })),
    },
    getOrganizationUsageStats: {
      useQuery: vi.fn(() => ({
        data: null,
        isLoading: false,
        error: null,
      })),
    },
    getPendingInvitations: {
      useQuery: vi.fn(() => ({
        data: [],
        isLoading: false,
        error: null,
      })),
    },
    cancelInvitation: {
      useMutation: vi.fn(() => ({
        mutate: vi.fn(),
        mutateAsync: vi.fn(),
        isLoading: false,
      })),
    },
  },
  useContext: vi.fn(),
  Provider: ({ children }: { children: React.ReactNode }) => children,
}


