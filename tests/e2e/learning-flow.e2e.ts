import { test, expect } from '@playwright/test'

test.describe('Learning Flow E2E', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('/')
    
    // Mock authentication - in real tests, you'd use actual auth
    await page.evaluate(() => {
      localStorage.setItem('supabase.auth.token', JSON.stringify({
        access_token: 'mock-token',
        refresh_token: 'mock-refresh',
        expires_at: Date.now() + 3600000,
      }))
    })
  })

  test('should complete onboarding flow', async ({ page }) => {
    await page.goto('/profile-setup')
    
    // Fill in profile information
    await page.fill('input[name="firstName"]', 'Test')
    await page.fill('input[name="lastName"]', 'User')
    await page.selectOption('select[name="role"]', 'developer')
    await page.selectOption('select[name="experienceLevel"]', 'intermediate')
    
    // Select goals
    await page.click('input[value="certification"]')
    await page.click('input[value="career-growth"]')
    
    // Complete onboarding
    await page.click('button:has-text("Complete Setup")')
    
    // Should redirect to academy dashboard
    await expect(page).toHaveURL('/academy')
    await expect(page.locator('h1:has-text("Welcome back")')).toBeVisible()
  })

  test('should navigate through learning topics', async ({ page }) => {
    await page.goto('/academy')
    
    // Wait for dashboard to load
    await page.waitForSelector('[data-testid="learning-dashboard"]')
    
    // Navigate to topics
    await page.click('a:has-text("Browse Topics")')
    await expect(page).toHaveURL('/academy/topics')
    
    // Select a product tab
    await page.click('[role="tab"]:has-text("PolicyCenter")')
    
    // Click on first topic
    await page.click('[data-testid="topic-card"]:first-child')
    
    // Should show topic detail page
    await expect(page.locator('h1')).toContainText('PolicyCenter')
    await expect(page.locator('button:has-text("Start Topic")')).toBeVisible()
  })

  test('should start and complete a learning block', async ({ page }) => {
    // Navigate directly to a topic
    await page.goto('/academy/topics/policycenter-basics')
    
    // Start the topic
    await page.click('button:has-text("Start Topic")')
    
    // Should show learning blocks
    await expect(page.locator('[data-testid="learning-blocks"]')).toBeVisible()
    
    // Click on first learning block
    await page.click('[data-testid="learning-block"]:first-child')
    
    // Should show block content
    await expect(page.locator('[data-testid="block-content"]')).toBeVisible()
    
    // Mark as complete
    await page.click('button:has-text("Mark as Complete")')
    
    // Should show XP reward animation
    await expect(page.locator('[data-testid="xp-reward"]')).toBeVisible()
    await expect(page.locator('[data-testid="xp-reward"]')).toContainText('+10 XP')
    
    // Progress should update
    await expect(page.locator('[data-testid="progress-bar"]')).toHaveAttribute('aria-valuenow', '25')
  })

  test('should interact with AI mentor', async ({ page }) => {
    await page.goto('/academy/ai-mentor')
    
    // Type a question
    const questionInput = page.locator('textarea[placeholder*="Ask your mentor"]')
    await questionInput.fill('How do I configure a custom field in PolicyCenter?')
    
    // Send the question
    await page.click('button:has-text("Send")')
    
    // Should show loading state
    await expect(page.locator('[data-testid="typing-indicator"]')).toBeVisible()
    
    // Wait for response (mocked in test environment)
    await expect(page.locator('[data-testid="mentor-response"]')).toBeVisible({ timeout: 10000 })
    
    // Should show follow-up questions
    await expect(page.locator('[data-testid="follow-up-questions"]')).toBeVisible()
    
    // Click a follow-up question
    await page.click('[data-testid="follow-up-question"]:first-child')
    
    // Should add the question to chat
    await expect(page.locator('[data-testid="chat-message"]:last-child')).toContainText('field validation')
  })

  test('should show gamification elements', async ({ page }) => {
    await page.goto('/academy')
    
    // Check XP indicator
    await expect(page.locator('[data-testid="xp-indicator"]')).toBeVisible()
    await expect(page.locator('[data-testid="xp-indicator"]')).toContainText('Level')
    
    // Navigate to achievements
    await page.click('a:has-text("Achievements")')
    await expect(page).toHaveURL('/academy/achievements')
    
    // Should show achievement categories
    await expect(page.locator('[data-testid="achievement-categories"]')).toBeVisible()
    
    // Filter by category
    await page.click('button:has-text("Progress")')
    
    // Should show filtered achievements
    await expect(page.locator('[data-testid="achievement-card"]')).toHaveCount(3, { timeout: 5000 })
    
    // Navigate to leaderboard
    await page.click('a:has-text("Leaderboard")')
    await expect(page).toHaveURL('/academy/leaderboard')
    
    // Should show leaderboard table
    await expect(page.locator('[data-testid="leaderboard-table"]')).toBeVisible()
    
    // Change timeframe
    await page.click('button:has-text("Monthly")')
    
    // Table should update
    await expect(page.locator('[data-testid="timeframe-badge"]')).toContainText('Monthly')
  })

  test('should track learning progress', async ({ page }) => {
    await page.goto('/academy/progress')
    
    // Should show progress overview
    await expect(page.locator('[data-testid="progress-overview"]')).toBeVisible()
    
    // Check key metrics
    await expect(page.locator('[data-testid="completion-rate"]')).toBeVisible()
    await expect(page.locator('[data-testid="current-level"]')).toBeVisible()
    await expect(page.locator('[data-testid="weekly-xp"]')).toBeVisible()
    await expect(page.locator('[data-testid="learning-streak"]')).toBeVisible()
    
    // Should show XP chart
    await expect(page.locator('[data-testid="xp-chart"]')).toBeVisible()
    
    // Should show recent activity
    await expect(page.locator('[data-testid="recent-activity"]')).toBeVisible()
    await expect(page.locator('[data-testid="activity-item"]')).toHaveCount(5, { timeout: 5000 })
  })

  test('should handle sequential learning restrictions', async ({ page }) => {
    await page.goto('/academy/topics')
    
    // Find a locked topic (with prerequisites)
    const lockedTopic = page.locator('[data-testid="topic-card"][data-locked="true"]:first-child')
    await expect(lockedTopic).toBeVisible()
    
    // Should show lock icon
    await expect(lockedTopic.locator('[data-testid="lock-icon"]')).toBeVisible()
    
    // Click on locked topic
    await lockedTopic.click()
    
    // Should show prerequisites message
    await expect(page.locator('[data-testid="prerequisites-alert"]')).toBeVisible()
    await expect(page.locator('[data-testid="prerequisites-alert"]')).toContainText('Complete the following topics first')
    
    // Start button should be disabled
    await expect(page.locator('button:has-text("Start Topic")')).toBeDisabled()
    
    // Should show prerequisite topics
    await expect(page.locator('[data-testid="prerequisite-topic"]')).toHaveCountGreaterThan(0)
  })

  test('should generate AI learning path', async ({ page }) => {
    await page.goto('/academy/ai-mentor')
    
    // Click on Learning Path tab
    await page.click('[role="tab"]:has-text("Learning Path")')
    
    // Fill in context form
    await page.selectOption('select[name="experienceLevel"]', 'intermediate')
    await page.click('input[value="certification"]')
    await page.fill('input[name="availableHours"]', '10')
    
    // Generate path
    await page.click('button:has-text("Generate Personalized Path")')
    
    // Should show loading state
    await expect(page.locator('[data-testid="generating-path"]')).toBeVisible()
    
    // Wait for generated path
    await expect(page.locator('[data-testid="generated-path"]')).toBeVisible({ timeout: 15000 })
    
    // Should show path details
    await expect(page.locator('[data-testid="path-title"]')).toBeVisible()
    await expect(page.locator('[data-testid="path-duration"]')).toContainText('weeks')
    await expect(page.locator('[data-testid="path-milestone"]')).toHaveCountGreaterThan(0)
    
    // Should allow saving the path
    await page.click('button:has-text("Save Learning Path")')
    await expect(page.locator('[data-testid="success-toast"]')).toBeVisible()
  })
})


