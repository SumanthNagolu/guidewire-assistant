# Academy LMS Testing Strategy

## Overview
Comprehensive testing strategy for the Academy LMS platform, ensuring quality, reliability, and performance across all features.

## Testing Pyramid

```
         /\
        /E2E\        (5%)  - Critical user journeys
       /------\
      /  Integ \     (20%) - API & Service integration
     /----------\
    /    Unit    \   (75%) - Component & Function level
   /--------------\
```

## Test Types

### 1. Unit Tests
**Framework:** Vitest + React Testing Library  
**Coverage Target:** 80%  
**Location:** `tests/unit/`

#### What to Test:
- Individual components in isolation
- Service layer business logic
- Utility functions
- Custom hooks
- Reducers and state management

#### Example Test Areas:
```typescript
// Component Testing
- LearningDashboard rendering
- TopicCard interaction
- XPIndicator animations
- AIMentorChat messaging

// Service Testing
- Learning path generation
- XP calculation
- Achievement validation
- Content transformation
```

### 2. Integration Tests
**Framework:** Vitest + Supertest  
**Coverage Target:** 70%  
**Location:** `tests/integration/`

#### What to Test:
- API endpoint functionality
- Database operations
- Service interactions
- Authentication flows
- Authorization checks

#### Example Test Areas:
```typescript
// API Testing
- tRPC procedures
- REST endpoints
- WebSocket connections
- File uploads

// Database Testing
- Transaction integrity
- RLS policies
- Trigger functions
- Data migrations
```

### 3. E2E Tests
**Framework:** Playwright  
**Coverage Target:** Critical paths only  
**Location:** `tests/e2e/`

#### Critical User Journeys:
1. **New User Onboarding**
   - Sign up → Profile setup → First topic → Complete learning block

2. **Learning Flow**
   - Browse topics → Start learning → Complete blocks → Earn XP → Unlock achievement

3. **AI Mentor Interaction**
   - Ask question → Get response → Follow suggestions → Generate project plan

4. **Enterprise Manager Flow**
   - View team → Invite members → Set goals → Generate reports

### 4. Performance Tests
**Framework:** k6  
**Target Metrics:**
- p95 latency < 500ms
- Error rate < 1%
- Concurrent users: 1000

#### Load Test Scenarios:
```javascript
// Gradual ramp-up
Stage 1: 0 → 10 users (2 min)
Stage 2: 10 users steady (5 min)
Stage 3: 10 → 50 users (2 min)
Stage 4: 50 users steady (5 min)
Stage 5: 50 → 100 users (2 min)
Stage 6: 100 users steady (5 min)
Stage 7: 100 → 0 users (5 min)
```

## Test Data Management

### Test Database
```yaml
Local: PostgreSQL container (Docker)
CI: PostgreSQL service
Seeds: tests/fixtures/seed.sql
Reset: Before each test suite
```

### Mock Data Factories
```typescript
createMockUser()
createMockTopic()
createMockOrganization()
createMockLearningBlock()
createMockAchievement()
```

### API Mocking
- External services: MSW (Mock Service Worker)
- AI APIs: Vitest mocks
- Payment APIs: Stripe test mode

## CI/CD Pipeline

### GitHub Actions Workflow
```yaml
on: [push, pull_request]

jobs:
  test:
    strategy:
      matrix:
        test-type: [unit, integration, e2e]
    
    steps:
      1. Checkout
      2. Setup Node
      3. Install deps
      4. Run tests
      5. Upload coverage
      6. Report results
```

### Quality Gates
- ✅ All tests passing
- ✅ Coverage > 80%
- ✅ No TypeScript errors
- ✅ No ESLint errors
- ✅ Performance benchmarks met

## Testing Best Practices

### 1. Test Organization
```typescript
describe('Feature/Component Name', () => {
  describe('Scenario/Method', () => {
    it('should do expected behavior', () => {
      // Arrange
      const data = setupTestData()
      
      // Act
      const result = performAction(data)
      
      // Assert
      expect(result).toBe(expected)
    })
  })
})
```

### 2. Component Testing
```typescript
// Good
it('should display user name when profile loads', () => {
  render(<UserProfile user={mockUser} />)
  expect(screen.getByText('John Doe')).toBeInTheDocument()
})

// Avoid
it('should work', () => {
  render(<UserProfile />)
  expect(screen.getByTestId('profile')).toBeTruthy()
})
```

### 3. Async Testing
```typescript
// Always await async operations
it('should load topics', async () => {
  render(<TopicList />)
  
  await waitFor(() => {
    expect(screen.getByText('PolicyCenter Basics')).toBeInTheDocument()
  })
})
```

### 4. Mock Management
```typescript
// Reset mocks between tests
beforeEach(() => {
  vi.clearAllMocks()
})

// Use specific mocks
vi.mock('@/lib/supabase/client', () => ({
  createClient: () => mockSupabase
}))
```

## Test Commands

```bash
# Unit Tests
npm run test:unit           # Run unit tests
npm run test:unit:watch     # Watch mode
npm run test:unit:coverage  # With coverage

# Integration Tests
npm run test:integration    # Run integration tests
npm run test:integration:ci # CI mode

# E2E Tests
npm run test:e2e            # Run E2E tests
npm run test:e2e:headed     # With browser UI
npm run test:e2e:debug      # Debug mode

# All Tests
npm run test                # Run all tests
npm run test:coverage       # Full coverage report

# Performance Tests
npm run test:perf           # Run performance tests
npm run test:load           # Run load tests
```

## Coverage Reports

### Targets by Module
| Module | Unit | Integration | Overall |
|--------|------|-------------|---------|
| Learning | 85% | 75% | 80% |
| AI Services | 80% | 70% | 75% |
| Gamification | 85% | 75% | 80% |
| Enterprise | 80% | 70% | 75% |
| Content | 75% | 65% | 70% |
| Auth | 90% | 85% | 87% |

### Coverage Exclusions
```javascript
// vitest.config.ts
coveragePathIgnorePatterns: [
  'node_modules',
  'tests',
  '.next',
  'public',
  '*.config.ts',
  '*.d.ts',
  'types/'
]
```

## Debugging Tests

### VS Code Configuration
```json
{
  "type": "node",
  "request": "launch",
  "name": "Debug Vitest",
  "runtimeExecutable": "npm",
  "runtimeArgs": ["run", "test:unit", "--", "--inspect-brk"],
  "console": "integratedTerminal"
}
```

### Playwright Debugging
```bash
# Debug specific test
npx playwright test --debug learning-flow.e2e.ts

# Use Playwright Inspector
npx playwright test --headed --project=chromium

# Generate test code
npx playwright codegen localhost:3000
```

## Test Maintenance

### Weekly Tasks
- Review failing tests
- Update test data
- Check coverage trends
- Update mocks for API changes

### Monthly Tasks
- Performance baseline update
- Load test scenario review
- Test suite optimization
- Documentation updates

### Quarterly Tasks
- Full E2E suite review
- Test strategy assessment
- Tool/framework updates
- Team training on new patterns

## Common Issues & Solutions

### Issue: Flaky E2E Tests
**Solution:** Use explicit waits and data-testid attributes
```typescript
await page.waitForSelector('[data-testid="loading"]', { state: 'hidden' })
await expect(page.locator('[data-testid="content"]')).toBeVisible()
```

### Issue: Slow Test Suite
**Solution:** Parallelize and use test.concurrent
```typescript
test.concurrent('test 1', async () => { /* ... */ })
test.concurrent('test 2', async () => { /* ... */ })
```

### Issue: Database State Conflicts
**Solution:** Use transactions and cleanup
```typescript
beforeEach(async () => {
  await db.transaction(async (tx) => {
    await tx.delete(tables.userProgress).where(/* ... */)
  })
})
```

## Resources

### Documentation
- [Vitest Docs](https://vitest.dev/)
- [Playwright Docs](https://playwright.dev/)
- [Testing Library](https://testing-library.com/)
- [k6 Performance Testing](https://k6.io/)

### Internal Guides
- [Writing Effective Tests](./guides/writing-tests.md)
- [Mock Data Patterns](./guides/mock-patterns.md)
- [CI/CD Pipeline](./guides/ci-cd.md)
- [Performance Benchmarks](./guides/benchmarks.md)

## Contact

**Test Lead:** testing@intimesolutions.com  
**QA Team:** qa-team@intimesolutions.com  
**Emergency:** +1-XXX-XXX-XXXX

---

*Last Updated: January 2025*  
*Version: 1.0.0*


