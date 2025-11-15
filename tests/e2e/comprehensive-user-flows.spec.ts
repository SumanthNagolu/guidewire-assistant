import { test, expect, Page } from '@playwright/test';

// Test configuration
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

// Test users
const TEST_USERS = {
  student: {
    email: 'test.student@example.com',
    password: 'TestPass123!',
    role: 'student'
  },
  employee: {
    email: 'test.employee@example.com', 
    password: 'TestPass123!',
    role: 'employee'
  },
  recruiter: {
    email: 'test.recruiter@example.com',
    password: 'TestPass123!',
    role: 'recruiter'
  },
  admin: {
    email: 'test.admin@example.com',
    password: 'TestPass123!',
    role: 'admin'
  },
  ceo: {
    email: 'test.ceo@example.com',
    password: 'TestPass123!',
    role: 'ceo'
  }
};

// Helper function to login (defined outside describe block for reuse)
async function login(page: Page, email: string, password: string) {
  await page.goto(`${BASE_URL}/login`);
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForNavigation();
}

test.describe('🎯 Comprehensive User Flow Tests', () => {

  // Helper function to check all links on a page
  async function testAllLinks(page: Page, currentUrl: string) {
    const links = await page.$$eval('a[href]', links => 
      links.map(link => ({
        href: link.getAttribute('href'),
        text: link.textContent?.trim(),
        isExternal: link.getAttribute('href')?.startsWith('http')
      }))
    );

    console.log(`Found ${links.length} links on ${currentUrl}`);
    
    for (const link of links) {
      if (link.href && !link.isExternal && link.href !== '#') {
        test(`Link "${link.text}" (${link.href}) is accessible`, async () => {
          const response = await page.goto(link.href as string);
          expect(response?.status()).toBeLessThan(400);
        });
      }
    }
  }

  // Helper function to test all buttons
  async function testAllButtons(page: Page) {
    const buttons = await page.$$('button');
    console.log(`Found ${buttons.length} buttons`);
    
    for (let i = 0; i < buttons.length; i++) {
      const button = buttons[i];
      const buttonText = await button.textContent();
      const isDisabled = await button.isDisabled();
      
      if (!isDisabled) {
        test(`Button "${buttonText}" is clickable`, async () => {
          const isVisible = await button.isVisible();
          expect(isVisible).toBeTruthy();
        });
      }
    }
  }

  test.describe('📚 Student User Flow', () => {
    test.beforeEach(async ({ page }) => {
      await login(page, TEST_USERS.student.email, TEST_USERS.student.password);
    });

    test('Complete learning path', async ({ page }) => {
      // Navigate to academy
      await page.goto(`${BASE_URL}/academy`);
      await expect(page).toHaveURL(/.*academy/);

      // Check dashboard elements
      await expect(page.locator('h1')).toContainText(/dashboard|academy/i);
      
      // Navigate to topics
      await page.click('a[href*="/topics"]');
      await expect(page).toHaveURL(/.*topics/);
      
      // Select a topic
      const firstTopic = await page.locator('.topic-card').first();
      if (await firstTopic.isVisible()) {
        await firstTopic.click();
        
        // Start learning
        const startButton = page.locator('button:has-text("Start Learning")');
        if (await startButton.isVisible()) {
          await startButton.click();
          
          // Watch video/content
          await page.waitForTimeout(2000);
          
          // Mark as complete
          const completeButton = page.locator('button:has-text("Mark Complete")');
          if (await completeButton.isVisible()) {
            await completeButton.click();
          }
        }
      }

      // Test AI Mentor
      await page.goto(`${BASE_URL}/academy/ai-mentor`);
      await expect(page).toHaveURL(/.*ai-mentor/);
      
      // Send a message
      const chatInput = page.locator('textarea, input[type="text"]').first();
      if (await chatInput.isVisible()) {
        await chatInput.fill('What is PolicyCenter?');
        await page.keyboard.press('Enter');
        
        // Wait for response
        await page.waitForTimeout(3000);
        
        // Check if response appears
        const messages = await page.locator('.message, .chat-message').count();
        expect(messages).toBeGreaterThan(0);
      }

      // Take assessment
      await page.goto(`${BASE_URL}/academy/assessments`);
      const firstQuiz = page.locator('a[href*="/quiz"], button:has-text("Take Quiz")').first();
      if (await firstQuiz.isVisible()) {
        await firstQuiz.click();
        
        // Answer questions
        const questions = await page.locator('.question').count();
        for (let i = 0; i < questions; i++) {
          const firstOption = page.locator('.quiz-option, input[type="radio"]').first();
          if (await firstOption.isVisible()) {
            await firstOption.click();
          }
        }
        
        // Submit quiz
        const submitButton = page.locator('button:has-text("Submit")');
        if (await submitButton.isVisible()) {
          await submitButton.click();
        }
      }

      // Check progress
      await page.goto(`${BASE_URL}/academy/progress`);
      await expect(page).toHaveURL(/.*progress/);
      
      // Test all links on page
      await testAllLinks(page, await page.url());
      await testAllButtons(page);
    });
  });

  test.describe('👔 Employee User Flow', () => {
    test.beforeEach(async ({ page }) => {
      await login(page, TEST_USERS.employee.email, TEST_USERS.employee.password);
    });

    test('Complete daily workflow', async ({ page }) => {
      // Navigate to employee dashboard
      await page.goto(`${BASE_URL}/employee/dashboard`);
      
      // Check attendance
      const checkInButton = page.locator('button:has-text("Check In")');
      if (await checkInButton.isVisible()) {
        await checkInButton.click();
        await expect(page.locator('text=/checked in/i')).toBeVisible();
      }

      // View productivity
      await page.goto(`${BASE_URL}/productivity`);
      
      // Start session
      const startSessionButton = page.locator('button:has-text("Start Session")');
      if (await startSessionButton.isVisible()) {
        await startSessionButton.click();
        await page.waitForTimeout(2000);
      }

      // Check HR features
      await page.goto(`${BASE_URL}/hr/leave`);
      const applyLeaveButton = page.locator('button:has-text("Apply Leave")');
      if (await applyLeaveButton.isVisible()) {
        await applyLeaveButton.click();
        
        // Fill leave form
        await page.fill('input[name="startDate"]', '2025-12-01');
        await page.fill('input[name="endDate"]', '2025-12-02');
        await page.fill('textarea[name="reason"]', 'Personal work');
        
        const submitButton = page.locator('button[type="submit"]');
        if (await submitButton.isVisible()) {
          await submitButton.click();
        }
      }

      // Test all links and buttons
      await testAllLinks(page, await page.url());
      await testAllButtons(page);
    });
  });

  test.describe('🎯 Recruiter User Flow', () => {
    test.beforeEach(async ({ page }) => {
      await login(page, TEST_USERS.recruiter.email, TEST_USERS.recruiter.password);
    });

    test('Complete recruitment cycle', async ({ page }) => {
      // Navigate to platform
      await page.goto(`${BASE_URL}/platform`);
      
      // View jobs
      await page.goto(`${BASE_URL}/platform/jobs`);
      
      // Create new job
      const newJobButton = page.locator('button:has-text("New Job"), a:has-text("Create Job")');
      if (await newJobButton.isVisible()) {
        await newJobButton.click();
        
        // Fill job details
        await page.fill('input[name="title"]', 'Senior Developer');
        await page.fill('textarea[name="description"]', 'Looking for senior developer');
        await page.fill('input[name="location"]', 'Remote');
        
        const submitButton = page.locator('button[type="submit"]');
        if (await submitButton.isVisible()) {
          await submitButton.click();
        }
      }

      // View candidates
      await page.goto(`${BASE_URL}/platform/candidates`);
      
      // Search candidates
      const searchInput = page.locator('input[placeholder*="Search"]');
      if (await searchInput.isVisible()) {
        await searchInput.fill('JavaScript');
        await page.keyboard.press('Enter');
        await page.waitForTimeout(2000);
      }

      // View pipeline
      await page.goto(`${BASE_URL}/platform/pipeline`);
      
      // Test workflow
      await page.goto(`${BASE_URL}/platform/workflows`);
      
      // Test all links and buttons
      await testAllLinks(page, await page.url());
      await testAllButtons(page);
    });
  });

  test.describe('🔧 Admin User Flow', () => {
    test.beforeEach(async ({ page }) => {
      await login(page, TEST_USERS.admin.email, TEST_USERS.admin.password);
    });

    test('Complete admin tasks', async ({ page }) => {
      // Navigate to admin panel
      await page.goto(`${BASE_URL}/admin`);
      
      // Manage users
      await page.goto(`${BASE_URL}/admin/users`);
      
      // Create new user
      const newUserButton = page.locator('button:has-text("New User"), a:has-text("Add User")');
      if (await newUserButton.isVisible()) {
        await newUserButton.click();
        
        await page.fill('input[name="email"]', 'newuser@example.com');
        await page.fill('input[name="fullName"]', 'New User');
        await page.selectOption('select[name="role"]', 'student');
        
        const submitButton = page.locator('button[type="submit"]');
        if (await submitButton.isVisible()) {
          await submitButton.click();
        }
      }

      // Manage content
      await page.goto(`${BASE_URL}/admin/training-content`);
      
      // Upload content
      await page.goto(`${BASE_URL}/admin/training-content/content-upload`);
      
      // Analytics
      await page.goto(`${BASE_URL}/admin/training-content/analytics`);
      
      // System settings
      await page.goto(`${BASE_URL}/admin/settings`);
      
      // Test all admin links and buttons
      await testAllLinks(page, await page.url());
      await testAllButtons(page);
    });
  });

  test.describe('📊 CEO User Flow', () => {
    test.beforeEach(async ({ page }) => {
      await login(page, TEST_USERS.ceo.email, TEST_USERS.ceo.password);
    });

    test('View strategic dashboard', async ({ page }) => {
      // Navigate to CEO dashboard
      await page.goto(`${BASE_URL}/ceo/dashboard`);
      
      // Check KPIs
      await expect(page.locator('.kpi-card')).toHaveCount(4);
      
      // Switch tabs
      const tabs = ['overview', 'revenue', 'operations', 'people', 'predictions', 'strategic'];
      
      for (const tab of tabs) {
        const tabButton = page.locator(`button[value="${tab}"], [data-value="${tab}"]`);
        if (await tabButton.isVisible()) {
          await tabButton.click();
          await page.waitForTimeout(1000);
          
          // Verify tab content loads
          await expect(page.locator(`[data-state="active"][value="${tab}"]`)).toBeVisible();
        }
      }

      // Test real-time updates
      const refreshButton = page.locator('button:has-text("Refresh")');
      if (await refreshButton.isVisible()) {
        await refreshButton.click();
        await page.waitForTimeout(2000);
      }

      // Test strategic controls
      const strategicTab = page.locator('button[value="strategic"]');
      if (await strategicTab.isVisible()) {
        await strategicTab.click();
        
        // Test AI tuning
        const aiTuningButton = page.locator('button:has-text("AI Tuning")');
        if (await aiTuningButton.isVisible()) {
          await aiTuningButton.click();
        }
      }

      // Test all CEO dashboard links
      await testAllLinks(page, await page.url());
      await testAllButtons(page);
    });
  });

  test.describe('🌐 Public Website Flow', () => {
    test('Navigate all public pages', async ({ page }) => {
      await page.goto(BASE_URL);
      
      // Test navigation menu
      const navLinks = [
        { text: 'About', url: '/about' },
        { text: 'Programs', url: '/programs' },
        { text: 'Services', url: '/services' },
        { text: 'Contact', url: '/contact' },
        { text: 'FAQ', url: '/faq' }
      ];

      for (const link of navLinks) {
        const navLink = page.locator(`a:has-text("${link.text}")`).first();
        if (await navLink.isVisible()) {
          await navLink.click();
          await expect(page).toHaveURL(new RegExp(`.*${link.url}`));
          await page.goBack();
        }
      }

      // Test contact form
      await page.goto(`${BASE_URL}/contact`);
      await page.fill('input[name="name"]', 'Test User');
      await page.fill('input[name="email"]', 'test@example.com');
      await page.fill('textarea[name="message"]', 'Test message');
      
      const submitButton = page.locator('button[type="submit"]');
      if (await submitButton.isVisible()) {
        await submitButton.click();
        await page.waitForTimeout(2000);
      }

      // Test all public links
      await testAllLinks(page, await page.url());
    });
  });

  test.describe('🔍 Search and Navigation', () => {
    test('Test search functionality', async ({ page }) => {
      await login(page, TEST_USERS.student.email, TEST_USERS.student.password);
      
      // Find search input
      const searchInput = page.locator('input[placeholder*="Search"], input[type="search"]').first();
      if (await searchInput.isVisible()) {
        await searchInput.fill('PolicyCenter');
        await page.keyboard.press('Enter');
        await page.waitForTimeout(2000);
        
        // Check search results
        const results = await page.locator('.search-result, .result-item').count();
        expect(results).toBeGreaterThan(0);
      }
    });

    test('Test mobile menu', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      
      await page.goto(BASE_URL);
      
      // Open mobile menu
      const menuButton = page.locator('button[aria-label*="menu"], button.menu-toggle');
      if (await menuButton.isVisible()) {
        await menuButton.click();
        await page.waitForTimeout(500);
        
        // Check menu items
        const menuItems = await page.locator('.mobile-menu a, nav a').count();
        expect(menuItems).toBeGreaterThan(0);
      }
    });
  });

  test.describe('⚠️ Error Handling', () => {
    test('404 page handling', async ({ page }) => {
      await page.goto(`${BASE_URL}/non-existent-page`);
      
      // Should show 404 page
      await expect(page.locator('text=/404|not found/i')).toBeVisible();
      
      // Should have link to home
      const homeLink = page.locator('a[href="/"]');
      expect(await homeLink.isVisible()).toBeTruthy();
    });

    test('Form validation', async ({ page }) => {
      await page.goto(`${BASE_URL}/login`);
      
      // Try to submit empty form
      const submitButton = page.locator('button[type="submit"]');
      await submitButton.click();
      
      // Should show validation errors
      await expect(page.locator('text=/required|invalid/i')).toBeVisible();
      
      // Try invalid email
      await page.fill('input[name="email"]', 'invalid-email');
      await submitButton.click();
      
      // Should show email validation error
      await expect(page.locator('text=/invalid email/i')).toBeVisible();
    });

    test('API error handling', async ({ page }) => {
      await login(page, TEST_USERS.student.email, TEST_USERS.student.password);
      
      // Intercept API calls and force errors
      await page.route('**/api/**', route => {
        route.fulfill({
          status: 500,
          body: JSON.stringify({ error: 'Internal Server Error' })
        });
      });
      
      // Try to load data
      await page.goto(`${BASE_URL}/academy`);
      
      // Should show error message
      await expect(page.locator('text=/error|failed/i')).toBeVisible();
    });
  });

  test.describe('♿ Accessibility', () => {
    test('Keyboard navigation', async ({ page }) => {
      await page.goto(BASE_URL);
      
      // Tab through elements
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      
      // Check focus is visible
      const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
      expect(focusedElement).toBeTruthy();
      
      // Test Enter key on links
      await page.keyboard.press('Enter');
      await page.waitForTimeout(1000);
    });

    test('Screen reader labels', async ({ page }) => {
      await page.goto(BASE_URL);
      
      // Check for ARIA labels
      const buttons = await page.$$('button');
      for (const button of buttons) {
        const ariaLabel = await button.getAttribute('aria-label');
        const text = await button.textContent();
        expect(ariaLabel || text).toBeTruthy();
      }
      
      // Check for alt text on images
      const images = await page.$$('img');
      for (const img of images) {
        const alt = await img.getAttribute('alt');
        expect(alt).toBeTruthy();
      }
    });
  });

  test.describe('🎨 UI Components', () => {
    test('Test all modals', async ({ page }) => {
      await login(page, TEST_USERS.student.email, TEST_USERS.student.password);
      await page.goto(`${BASE_URL}/academy`);
      
      // Find all buttons that might open modals
      const modalTriggers = await page.$$('button[data-modal], button:has-text("Add"), button:has-text("Create"), button:has-text("New")');
      
      for (const trigger of modalTriggers) {
        if (await trigger.isVisible()) {
          await trigger.click();
          await page.waitForTimeout(500);
          
          // Check if modal opened
          const modal = page.locator('.modal, [role="dialog"], .dialog');
          if (await modal.isVisible()) {
            // Find close button
            const closeButton = page.locator('.modal button:has-text("Close"), .modal button:has-text("Cancel"), [aria-label="Close"]');
            if (await closeButton.isVisible()) {
              await closeButton.click();
            } else {
              // Try ESC key
              await page.keyboard.press('Escape');
            }
          }
        }
      }
    });

    test('Test dropdowns', async ({ page }) => {
      await page.goto(BASE_URL);
      
      // Find all dropdowns
      const dropdowns = await page.$$('select, [role="combobox"], .dropdown');
      
      for (const dropdown of dropdowns) {
        if (await dropdown.isVisible()) {
          await dropdown.click();
          await page.waitForTimeout(500);
          
          // Select first option
          const firstOption = page.locator('option, [role="option"]').first();
          if (await firstOption.isVisible()) {
            await firstOption.click();
          }
        }
      }
    });

    test('Test tooltips', async ({ page }) => {
      await page.goto(BASE_URL);
      
      // Find elements with tooltips
      const tooltipElements = await page.$$('[data-tooltip], [title], [aria-describedby]');
      
      for (const element of tooltipElements) {
        if (await element.isVisible()) {
          await element.hover();
          await page.waitForTimeout(500);
          
          // Check if tooltip appears
          const tooltip = page.locator('.tooltip, [role="tooltip"]');
          if (await tooltip.isVisible()) {
            // Move away to hide tooltip
            await page.mouse.move(0, 0);
          }
        }
      }
    });
  });
});

// Performance tests
test.describe('⚡ Performance Tests', () => {
  test('Page load times', async ({ page }) => {
    const pages = [
      '/',
      '/academy',
      '/platform',
      '/productivity',
      '/hr'
    ];

    for (const pagePath of pages) {
      const startTime = Date.now();
      await page.goto(`${BASE_URL}${pagePath}`);
      const loadTime = Date.now() - startTime;
      
      console.log(`${pagePath}: ${loadTime}ms`);
      expect(loadTime).toBeLessThan(3000); // Should load in under 3 seconds
    }
  });

  test('API response times', async ({ page }) => {
    await login(page, TEST_USERS.student.email, TEST_USERS.student.password);
    
    // Monitor API calls
    const apiCalls: Array<{ url: string; status: number; time: number }> = [];
    const startTimes = new Map<string, number>();
    
    page.on('request', request => {
      if (request.url().includes('/api/')) {
        startTimes.set(request.url(), Date.now());
      }
    });
    
    page.on('response', response => {
      if (response.url().includes('/api/')) {
        const startTime = startTimes.get(response.url());
        const time = startTime ? Date.now() - startTime : 0;
        apiCalls.push({
          url: response.url(),
          status: response.status(),
          time
        });
      }
    });

    await page.goto(`${BASE_URL}/academy`);
    await page.waitForTimeout(3000);

    // Check API response times
    for (const call of apiCalls) {
      console.log(`API: ${call.url} - ${call.time}ms`);
      expect(call.status).toBeLessThan(400);
    }
  });
});
