/**
 * Supabase Mock Utilities for Testing
 * Provides mock Supabase client for unit and integration tests
 */

export function createMockSupabaseClient() {
  const mockQuery = {
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    neq: jest.fn().mockReturnThis(),
    gt: jest.fn().mockReturnThis(),
    gte: jest.fn().mockReturnThis(),
    lt: jest.fn().mockReturnThis(),
    lte: jest.fn().mockReturnThis(),
    in: jest.fn().mockReturnThis(),
    contains: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValue({ data: null, error: null }),
    maybeSingle: jest.fn().mockResolvedValue({ data: null, error: null }),
  };
  
  return {
    auth: {
      getUser: jest.fn().mockResolvedValue({ data: { user: null }, error: null }),
      signInWithPassword: jest.fn().mockResolvedValue({ data: { user: null, session: null }, error: null }),
      signOut: jest.fn().mockResolvedValue({ error: null }),
      signUp: jest.fn().mockResolvedValue({ data: { user: null, session: null }, error: null }),
    },
    from: jest.fn(() => mockQuery),
    storage: {
      from: jest.fn(() => ({
        upload: jest.fn().mockResolvedValue({ data: { path: 'test.jpg' }, error: null }),
        download: jest.fn().mockResolvedValue({ data: new Blob(), error: null }),
        remove: jest.fn().mockResolvedValue({ data: null, error: null }),
      })),
    },
    rpc: jest.fn().mockResolvedValue({ data: null, error: null }),
  };
}

export function mockUser(overrides = {}) {
  return {
    id: 'user-123',
    email: 'test@example.com',
    created_at: new Date().toISOString(),
    ...overrides,
  };
}

export function mockProfile(overrides = {}) {
  return {
    id: 'user-123',
    role: 'admin',
    first_name: 'Test',
    last_name: 'User',
    email: 'test@example.com',
    onboarding_completed: true,
    created_at: new Date().toISOString(),
    ...overrides,
  };
}

