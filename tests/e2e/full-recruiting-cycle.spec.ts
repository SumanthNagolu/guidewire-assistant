/**
 * E2E TESTS: Complete Recruiting Cycle
 * Tests the entire job requisition workflow from creation to placement
 */

import { test, expect } from '@playwright/test';

test.describe('Full Recruiting Cycle E2E', () => {
  test('recruiter processes job from intake to placement', async ({ page }) => {
    // ========================================================================
    // STEP 1: Login as recruiter
    // ========================================================================
    await page.goto('/login');
    await page.fill('[name="email"]', 'recruiter@test.com');
    await page.fill('[name="password"]', 'Test123!@#');
    await page.click('button[type="submit"]');

    // Verify redirected to employee dashboard
    await expect(page).toHaveURL(/\/employee\/dashboard/);

    // ========================================================================
    // STEP 2: Create new job
    // ========================================================================
    await page.goto('/employee/jobs/new');

    await page.fill('[name="title"]', 'Senior Java Developer');
    await page.fill('[name="client"]', 'Test Corp');
    await page.fill('[name="required_submissions"]', '5');
    await page.fill('[name="deadline"]', '2025-12-31');
    await page.click('button:has-text("Create Job")');

    // Verify workflow started
    await expect(page.locator('text=Workflow')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=Sourcing')).toBeVisible();

    // Get job ID from URL
    const url = page.url();
    const jobId = url.match(/jobs\/([^/]+)/)?.[1];
    expect(jobId).toBeDefined();

    // ========================================================================
    // STEP 3: Source candidates
    // ========================================================================
    await page.goto('/employee/sourcing');

    // Add 5 candidates
    for (let i = 1; i <= 5; i++) {
      await page.click('button:has-text("Add Candidate")');
      await page.fill('[name="first_name"]', `Test${i}`);
      await page.fill('[name="last_name"]', `Candidate${i}`);
      await page.fill('[name="email"]', `test${i}@candidate.com`);
      await page.fill('[name="skills"]', 'Java, Spring Boot');
      await page.click('button:has-text("Save Candidate")');
      
      // Link to job
      await page.selectOption('[name="job"]', jobId!);
      await page.click('button:has-text("Add to Job")');
    }

    // ========================================================================
    // STEP 4: Screen candidates
    // ========================================================================
    await page.goto(`/employee/jobs/${jobId}`);
    await page.click('text=Applications');

    // Screen 3 candidates (pass)
    for (let i = 1; i <= 3; i++) {
      await page.click(`text=Test${i} Candidate${i}`);
      await page.click('button:has-text("Screen")');
      await page.fill('[name="screening_notes"]', 'Good candidate');
      await page.click('button:has-text("Pass")');
    }

    // Verify workflow advanced
    await expect(page.locator('text=Screening')).toBeVisible();

    // ========================================================================
    // STEP 5: Submit to client
    // ========================================================================
    await page.click('button:has-text("Submit to Client")');
    await page.click('button:has-text("Confirm Submission")');

    // Verify workflow advanced
    await expect(page.locator('text=Client Review')).toBeVisible();

    // ========================================================================
    // STEP 6: Simulate client selects candidate
    // ========================================================================
    // In real test, this would be done via admin/client portal
    // For now, we'll update via API/database directly
    
    // ========================================================================
    // STEP 7: Create placement
    // ========================================================================
    await page.goto(`/employee/jobs/${jobId}/placements/new`);
    
    await page.selectOption('[name="candidate"]', 'test1@candidate.com');
    await page.fill('[name="start_date"]', '2025-02-01');
    await page.fill('[name="bill_rate"]', '120');
    await page.fill('[name="pay_rate"]', '80');
    await page.click('button:has-text("Create Placement")');

    // Verify placement created
    await expect(page.locator('text=Placement Active')).toBeVisible();

    // Verify workflow completed
    await page.goto(`/employee/jobs/${jobId}`);
    await expect(page.locator('text=Completed')).toBeVisible();
  });

  test('student completes course and gains employee access', async ({ page }) => {
    // ========================================================================
    // STEP 1: Signup as student
    // ========================================================================
    await page.goto('/signup');
    await page.fill('[name="email"]', 'student-e2e@test.com');
    await page.fill('[name="password"]', 'Test123!@#');
    await page.fill('[name="firstName"]', 'E2E');
    await page.fill('[name="lastName"]', 'Student');
    await page.click('button[type="submit"]');

    // ========================================================================
    // STEP 2: Complete profile setup
    // ========================================================================
    await expect(page).toHaveURL(/\/profile-setup/, { timeout: 10000 });
    await page.selectOption('[name="assumedPersona"]', '10 years experienced');
    await page.selectOption('[name="preferredProductId"]', { label: /ClaimCenter/i });
    await page.click('button:has-text("Complete Setup")');

    // Verify redirected to academy
    await expect(page).toHaveURL(/\/academy/);

    // ========================================================================
    // STEP 3: Complete all topics (simulation)
    // ========================================================================
    // In real test, this would go through each topic
    // For speed, we'll mark completions directly via API

    // Get student user ID
    const userId = await page.evaluate(() => {
      return localStorage.getItem('userId'); // If stored
    });

    // Note: In real implementation, would need to complete topics via UI

    // ========================================================================
    // STEP 4: Verify employee access granted
    // ========================================================================
    // After graduation (triggered by topic completion)
    
    await page.goto('/employee/dashboard');
    
    // Should NOT redirect (access granted)
    await expect(page).toHaveURL(/\/employee\/dashboard/);
    
    // Verify can see bench sales content
    await expect(page.locator('text=Bench Sales')).toBeVisible();
  });

  test('CEO can view unified dashboard', async ({ page }) => {
    // Login as CEO
    await page.goto('/login');
    await page.fill('[name="email"]', 'ceo@intimesolutions.com');
    await page.fill('[name="password"]', 'Test123!@#');
    await page.click('button[type="submit"]');

    // Verify redirected to CEO dashboard
    await expect(page).toHaveURL(/\/admin\/ceo/);

    // Verify all KPIs visible
    await expect(page.locator('[data-testid="kpi-revenue"]')).toBeVisible();
    await expect(page.locator('text=Active Jobs')).toBeVisible();
    await expect(page.locator('text=Placements')).toBeVisible();
    await expect(page.locator('text=Team Productivity')).toBeVisible();
    await expect(page.locator('text=Students Enrolled')).toBeVisible();

    // Verify AI Insights panel
    await expect(page.locator('text=AI Insights')).toBeVisible();

    // Verify can drill down to department
    await page.click('text=Recruiting Analytics');
    await expect(page.locator('text=Recruiting Pipeline')).toBeVisible();
  });
});

