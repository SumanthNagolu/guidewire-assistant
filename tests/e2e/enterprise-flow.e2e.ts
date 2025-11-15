import { test, expect } from '@playwright/test'

test.describe('Enterprise Flow E2E', () => {
  test.beforeEach(async ({ page }) => {
    // Set up enterprise user authentication
    await page.goto('/')
    await page.evaluate(() => {
      localStorage.setItem('supabase.auth.token', JSON.stringify({
        access_token: 'enterprise-mock-token',
        refresh_token: 'enterprise-mock-refresh',
        expires_at: Date.now() + 3600000,
      }))
      // Set organization context
      localStorage.setItem('organization_id', 'test-org-123')
    })
  })

  test('should access enterprise dashboard', async ({ page }) => {
    await page.goto('/enterprise')
    
    // Should show enterprise dashboard
    await expect(page.locator('[data-testid="enterprise-dashboard"]')).toBeVisible()
    
    // Should display organization name
    await expect(page.locator('[data-testid="org-name"]')).toContainText('Test Organization')
    
    // Should show key metrics
    await expect(page.locator('[data-testid="team-size-metric"]')).toBeVisible()
    await expect(page.locator('[data-testid="completion-rate-metric"]')).toBeVisible()
    await expect(page.locator('[data-testid="team-xp-metric"]')).toBeVisible()
    
    // Should show top performers
    await expect(page.locator('[data-testid="top-performers"]')).toBeVisible()
    await expect(page.locator('[data-testid="performer-card"]')).toHaveCountGreaterThan(0)
  })

  test('should manage team members', async ({ page }) => {
    await page.goto('/enterprise/members')
    
    // Should show team members list
    await expect(page.locator('[data-testid="members-table"]')).toBeVisible()
    
    // Click invite button
    await page.click('button:has-text("Invite Members")')
    
    // Should show invite dialog
    await expect(page.locator('[data-testid="invite-dialog"]')).toBeVisible()
    
    // Add email addresses
    await page.fill('textarea[placeholder*="email addresses"]', 'user1@example.com\nuser2@example.com')
    
    // Select role
    await page.selectOption('select[name="role"]', 'member')
    
    // Send invitations
    await page.click('button:has-text("Send Invitations")')
    
    // Should show success message
    await expect(page.locator('[data-testid="success-toast"]')).toBeVisible()
    await expect(page.locator('[data-testid="success-toast"]')).toContainText('2 invitations sent')
    
    // Dialog should close
    await expect(page.locator('[data-testid="invite-dialog"]')).not.toBeVisible()
    
    // Should show pending invitations
    await page.click('button:has-text("Pending Invitations")')
    await expect(page.locator('[data-testid="pending-invite"]')).toHaveCount(2)
  })

  test('should update member roles', async ({ page }) => {
    await page.goto('/enterprise/members')
    
    // Find first member row
    const memberRow = page.locator('[data-testid="member-row"]:first-child')
    
    // Open actions menu
    await memberRow.locator('button[aria-label="Actions"]').click()
    
    // Click change role
    await page.click('[data-testid="change-role-option"]')
    
    // Should show role change dialog
    await expect(page.locator('[data-testid="role-dialog"]')).toBeVisible()
    
    // Select new role
    await page.selectOption('select[name="newRole"]', 'manager')
    
    // Confirm change
    await page.click('button:has-text("Update Role")')
    
    // Should show success message
    await expect(page.locator('[data-testid="success-toast"]')).toBeVisible()
    await expect(page.locator('[data-testid="success-toast"]')).toContainText('Role updated')
    
    // Member row should update
    await expect(memberRow.locator('[data-testid="member-role"]')).toContainText('Manager')
  })

  test('should view team analytics', async ({ page }) => {
    await page.goto('/enterprise/analytics')
    
    // Should show analytics dashboard
    await expect(page.locator('[data-testid="analytics-dashboard"]')).toBeVisible()
    
    // Select date range
    await page.click('button:has-text("Last 30 Days")')
    await page.click('[data-testid="date-option"]:has-text("Last 90 Days")')
    
    // Charts should update
    await expect(page.locator('[data-testid="loading-indicator"]')).toBeVisible()
    await expect(page.locator('[data-testid="loading-indicator"]')).not.toBeVisible({ timeout: 5000 })
    
    // Should show various charts
    await expect(page.locator('[data-testid="progress-chart"]')).toBeVisible()
    await expect(page.locator('[data-testid="engagement-chart"]')).toBeVisible()
    await expect(page.locator('[data-testid="department-breakdown"]')).toBeVisible()
    
    // Export report
    await page.click('button:has-text("Export Report")')
    
    // Should show export options
    await expect(page.locator('[data-testid="export-menu"]')).toBeVisible()
    
    // Select PDF export
    await page.click('[data-testid="export-pdf"]')
    
    // Should trigger download
    const downloadPromise = page.waitForEvent('download')
    await downloadPromise
  })

  test('should create team learning goals', async ({ page }) => {
    await page.goto('/enterprise/goals')
    
    // Click create goal button
    await page.click('button:has-text("Create Team Goal")')
    
    // Fill in goal details
    await page.fill('input[name="title"]', 'Q1 Certification Target')
    await page.fill('textarea[name="description"]', 'All developers should complete PolicyCenter certification')
    
    // Set target
    await page.selectOption('select[name="targetType"]', 'certification')
    await page.fill('input[name="targetValue"]', '80')
    
    // Set deadline
    const futureDate = new Date()
    futureDate.setMonth(futureDate.getMonth() + 3)
    await page.fill('input[type="date"]', futureDate.toISOString().split('T')[0])
    
    // Select team/department
    await page.selectOption('select[name="department"]', 'engineering')
    
    // Create goal
    await page.click('button:has-text("Create Goal")')
    
    // Should show success and new goal in list
    await expect(page.locator('[data-testid="success-toast"]')).toBeVisible()
    await expect(page.locator('[data-testid="goal-card"]:has-text("Q1 Certification Target")')).toBeVisible()
    
    // Should show progress indicator
    await expect(page.locator('[data-testid="goal-progress"]')).toContainText('0%')
  })

  test('should manage organization settings', async ({ page }) => {
    await page.goto('/enterprise/settings')
    
    // Should show settings tabs
    await expect(page.locator('[role="tablist"]')).toBeVisible()
    
    // Click on branding tab
    await page.click('[role="tab"]:has-text("Branding")')
    
    // Upload logo
    const fileInput = page.locator('input[type="file"][name="logo"]')
    await fileInput.setInputFiles('./tests/fixtures/test-logo.png')
    
    // Set brand colors
    await page.fill('input[name="primaryColor"]', '#007bff')
    await page.fill('input[name="secondaryColor"]', '#6c757d')
    
    // Save branding
    await page.click('button:has-text("Save Branding")')
    await expect(page.locator('[data-testid="success-toast"]')).toBeVisible()
    
    // Switch to SSO tab
    await page.click('[role="tab"]:has-text("SSO")')
    
    // Configure SSO
    await page.selectOption('select[name="ssoProvider"]', 'okta')
    await page.fill('input[name="ssoTenantId"]', 'test-tenant-123')
    await page.fill('input[name="ssoClientId"]', 'client-456')
    
    // Save SSO settings
    await page.click('button:has-text("Configure SSO")')
    await expect(page.locator('[data-testid="success-toast"]')).toBeVisible()
  })

  test('should manage subscription and billing', async ({ page }) => {
    await page.goto('/enterprise/billing')
    
    // Should show current plan
    await expect(page.locator('[data-testid="current-plan"]')).toContainText('Enterprise')
    
    // Should show usage stats
    await expect(page.locator('[data-testid="seats-usage"]')).toBeVisible()
    await expect(page.locator('[data-testid="seats-usage"]')).toContainText('25 / 50 seats')
    
    // Click upgrade button
    await page.click('button:has-text("Add More Seats")')
    
    // Should show upgrade dialog
    await expect(page.locator('[data-testid="upgrade-dialog"]')).toBeVisible()
    
    // Increase seats
    await page.fill('input[name="additionalSeats"]', '25')
    
    // Should show price calculation
    await expect(page.locator('[data-testid="price-preview"]')).toContainText('$2,500/month')
    
    // Proceed to checkout
    await page.click('button:has-text("Proceed to Payment")')
    
    // Should redirect to Stripe checkout (mocked in test)
    await expect(page).toHaveURL(/checkout\.stripe\.com/)
  })

  test('should generate team reports', async ({ page }) => {
    await page.goto('/enterprise/reports')
    
    // Select report type
    await page.selectOption('select[name="reportType"]', 'monthly-progress')
    
    // Select departments
    await page.click('input[value="engineering"]')
    await page.click('input[value="product"]')
    
    // Set date range
    const startDate = new Date()
    startDate.setMonth(startDate.getMonth() - 1)
    await page.fill('input[name="startDate"]', startDate.toISOString().split('T')[0])
    await page.fill('input[name="endDate"]', new Date().toISOString().split('T')[0])
    
    // Generate report
    await page.click('button:has-text("Generate Report")')
    
    // Should show loading
    await expect(page.locator('[data-testid="generating-report"]')).toBeVisible()
    
    // Wait for report
    await expect(page.locator('[data-testid="report-preview"]')).toBeVisible({ timeout: 10000 })
    
    // Should show report sections
    await expect(page.locator('[data-testid="executive-summary"]')).toBeVisible()
    await expect(page.locator('[data-testid="department-breakdown"]')).toBeVisible()
    await expect(page.locator('[data-testid="individual-progress"]')).toBeVisible()
    await expect(page.locator('[data-testid="recommendations"]')).toBeVisible()
    
    // Email report
    await page.click('button:has-text("Email Report")')
    await page.fill('input[name="emailRecipients"]', 'manager@example.com, director@example.com')
    await page.click('button:has-text("Send")')
    
    await expect(page.locator('[data-testid="success-toast"]')).toBeVisible()
    await expect(page.locator('[data-testid="success-toast"]')).toContainText('Report sent to 2 recipients')
  })
})


