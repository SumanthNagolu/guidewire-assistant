import React from 'react'
import { render as rtlRender } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { TRPCProvider } from '@/providers/trpc-provider'
import { ThemeProvider } from 'next-themes'
import { Toaster } from '@/components/ui/toaster'

// Create a custom render function that includes all providers
function render(ui: React.ReactElement, options = {}) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        cacheTime: 0,
      },
    },
  })

  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <TRPCProvider>
          <ThemeProvider attribute="class" defaultTheme="light">
            {children}
            <Toaster />
          </ThemeProvider>
        </TRPCProvider>
      </QueryClientProvider>
    )
  }

  return rtlRender(ui, { wrapper: Wrapper, ...options })
}

// Re-export everything from testing library
export * from '@testing-library/react'
export { render }

// Test data factories
export const createMockUser = (overrides = {}) => ({
  id: 'test-user-id',
  email: 'test@example.com',
  first_name: 'Test',
  last_name: 'User',
  role: 'student',
  onboarding_completed: true,
  ...overrides,
})

export const createMockTopic = (overrides = {}) => ({
  id: 'test-topic-id',
  product_id: 'test-product-id',
  title: 'Test Topic',
  description: 'Test topic description',
  slug: 'test-topic',
  duration_minutes: 30,
  difficulty_level: 'beginner',
  is_active: true,
  sort_order: 1,
  content: {
    theory: 'Test theory content',
    examples: ['Example 1', 'Example 2'],
  },
  prerequisites: [],
  ...overrides,
})

export const createMockLearningBlock = (overrides = {}) => ({
  id: 'test-block-id',
  topic_id: 'test-topic-id',
  title: 'Test Learning Block',
  type: 'theory',
  content: {
    type: 'theory',
    markdown: '# Test Content',
    estimatedTime: 5,
  },
  order_index: 0,
  duration_minutes: 5,
  xp_reward: 10,
  is_required: true,
  ...overrides,
})

export const createMockAchievement = (overrides = {}) => ({
  id: 'test-achievement-id',
  name: 'Test Achievement',
  description: 'Complete a test',
  icon: '\ud83c\udfc6',
  category: 'progress',
  xp_reward: 50,
  rarity: 'common',
  requirements: {
    type: 'topics_completed',
    value: 1,
  },
  ...overrides,
})

export const createMockOrganization = (overrides = {}) => ({
  id: 'test-org-id',
  name: 'Test Organization',
  slug: 'test-org',
  owner_id: 'test-user-id',
  subscription_plan_id: 'enterprise',
  settings: {},
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides,
})

// Mock API responses
export const mockSuccessResponse = (data: any) => ({
  data,
  error: null,
})

export const mockErrorResponse = (message: string) => ({
  data: null,
  error: { message },
})

// Wait utilities
export const waitFor = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))


