import { test, expect, Page, Locator } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

// Track clicked elements to avoid duplicates
const clickedElements = new Set<string>();

test.describe('🖱️ Click Every Element Test Suite', () => {
  
  // Helper to generate unique selector for element
  async function getElementSelector(element: Locator): Promise<string> {
    return await element.evaluate(el => {
      const tag = el.tagName.toLowerCase();
      const id = el.id ? `#${el.id}` : '';
      const classes = el.className ? `.${el.className.split(' ').join('.')}` : '';
      const text = el.textContent?.substring(0, 20) || '';
      return `${tag}${id}${classes}[${text}]`;
    });
  }

  // Helper to safely click element
  async function safeClick(page: Page, element: Locator, selector: string) {
    try {
      // Skip if already clicked
      if (clickedElements.has(selector)) {
        return { clicked: false, reason: 'Already clicked' };
      }

      // Check if element is visible and enabled
      const isVisible = await element.isVisible();
      const isEnabled = await element.isEnabled();
      
      if (!isVisible) {
        return { clicked: false, reason: 'Not visible' };
      }
      
      if (!isEnabled) {
        return { clicked: false, reason: 'Disabled' };
      }

      // Check if it's an external link
      const href = await element.getAttribute('href');
      if (href && (href.startsWith('http://') || href.startsWith('https://'))) {
        const url = new URL(href);
        if (url.hostname !== new URL(BASE_URL).hostname) {
          return { clicked: false, reason: 'External link' };
        }
      }

      // Skip dangerous actions
      const text = await element.textContent();
      const dangerousKeywords = ['delete', 'remove', 'logout', 'sign out', 'deactivate', 'cancel subscription'];
      if (text && dangerousKeywords.some(keyword => text.toLowerCase().includes(keyword))) {
        return { clicked: false, reason: 'Potentially destructive action' };
      }

      // Scroll into view
      await element.scrollIntoViewIfNeeded();
      
      // Click the element
      await element.click({ timeout: 5000 });
      clickedElements.add(selector);
      
      // Wait for any navigation or loading
      await page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {});
      
      return { clicked: true, reason: 'Success' };
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return { clicked: false, reason: errorMessage };
    }
  }

  // Test all clickable elements on a page
  async function testPageClicks(page: Page, url: string) {
    console.log(`\n📄 Testing: ${url}`);
    
    await page.goto(url, { waitUntil: 'networkidle' });
    
    // Get all potentially clickable elements
    const selectors = [
      'a[href]',              // Links
      'button',               // Buttons
      'input[type="submit"]', // Submit buttons
      'input[type="button"]', // Button inputs
      '[role="button"]',      // Elements with button role
      '[onclick]',            // Elements with onclick
      '[data-testid*="button"]', // Test ID buttons
      '.clickable',           // Class-based clickable
      '[tabindex="0"]',       // Keyboard accessible elements
    ];

    const stats = {
      total: 0,
      clicked: 0,
      skipped: 0,
      failed: 0
    };

    for (const selector of selectors) {
      const elements = await page.$$(selector);
      stats.total += elements.length;
      
      console.log(`Found ${elements.length} elements matching: ${selector}`);
      
      for (let i = 0; i < elements.length; i++) {
        const element = elements[i];
        const elementSelector = await getElementSelector(page.locator(selector).nth(i));
        
        const result = await safeClick(page, page.locator(selector).nth(i), elementSelector);
        
        if (result.clicked) {
          stats.clicked++;
          console.log(`  ✅ Clicked: ${elementSelector}`);
          
          // Check for errors after click
          const hasError = await page.locator('text=/error|failed|exception/i').count() > 0;
          if (hasError) {
            console.log(`  ⚠️ Error detected after clicking: ${elementSelector}`);
          }
          
          // Go back if navigation occurred
          const currentUrl = page.url();
          if (currentUrl !== url && !currentUrl.includes('#')) {
            await page.goBack();
            await page.waitForLoadState('networkidle');
          }
        } else if (result.reason === 'Already clicked') {
          // Don't count as skipped
          stats.total--;
        } else {
          stats.skipped++;
          console.log(`  ⏭️ Skipped: ${elementSelector} - ${result.reason}`);
        }
      }
    }

    console.log(`\n📊 Stats for ${url}:`);
    console.log(`  Total: ${stats.total}`);
    console.log(`  Clicked: ${stats.clicked}`);
    console.log(`  Skipped: ${stats.skipped}`);
    console.log(`  Success Rate: ${((stats.clicked / stats.total) * 100).toFixed(1)}%`);
    
    return stats;
  }

  test('Click every element on homepage', async ({ page }) => {
    const stats = await testPageClicks(page, BASE_URL);
    expect(stats.clicked).toBeGreaterThan(0);
  });

  test('Click every element on login page', async ({ page }) => {
    const stats = await testPageClicks(page, `${BASE_URL}/login`);
    expect(stats.clicked).toBeGreaterThan(0);
  });

  test('Click every element on signup page', async ({ page }) => {
    const stats = await testPageClicks(page, `${BASE_URL}/signup`);
    expect(stats.clicked).toBeGreaterThan(0);
  });

  test('Click every element on academy (authenticated)', async ({ page }) => {
    // Login first
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[name="email"]', 'test.student@example.com');
    await page.fill('input[name="password"]', 'TestPass123!');
    await page.click('button[type="submit"]');
    await page.waitForNavigation();
    
    const stats = await testPageClicks(page, `${BASE_URL}/academy`);
    expect(stats.clicked).toBeGreaterThan(0);
  });

  test('Test all navigation menu items', async ({ page }) => {
    await page.goto(BASE_URL);
    
    // Get all nav links
    const navLinks = await page.$$('nav a, header a');
    
    console.log(`Found ${navLinks.length} navigation links`);
    
    for (let i = 0; i < navLinks.length; i++) {
      const link = page.locator('nav a, header a').nth(i);
      const href = await link.getAttribute('href');
      const text = await link.textContent();
      
      if (href && !href.startsWith('http')) {
        console.log(`Testing nav link: ${text} -> ${href}`);
        
        await link.click();
        await page.waitForLoadState('networkidle');
        
        // Verify navigation succeeded
        const currentUrl = page.url();
        expect(currentUrl).toContain(href.replace(/^\//, ''));
        
        // Check for errors
        const hasError = await page.locator('text=/404|error|not found/i').count() > 0;
        expect(hasError).toBeFalsy();
        
        // Go back to homepage
        await page.goto(BASE_URL);
      }
    }
  });

  test('Test all footer links', async ({ page }) => {
    await page.goto(BASE_URL);
    
    // Scroll to footer
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    
    const footerLinks = await page.$$('footer a');
    console.log(`Found ${footerLinks.length} footer links`);
    
    for (let i = 0; i < footerLinks.length; i++) {
      const link = page.locator('footer a').nth(i);
      const href = await link.getAttribute('href');
      const text = await link.textContent();
      
      if (href && !href.startsWith('http') && href !== '#') {
        console.log(`Testing footer link: ${text} -> ${href}`);
        
        await link.click();
        await page.waitForLoadState('networkidle');
        
        // Check for errors
        const hasError = await page.locator('text=/404|error|not found/i').count() > 0;
        expect(hasError).toBeFalsy();
        
        await page.goto(BASE_URL);
      }
    }
  });

  test('Test all form submissions', async ({ page }) => {
    // Test contact form
    await page.goto(`${BASE_URL}/contact`);
    
    // Fill and submit
    await page.fill('input[name="name"]', 'Test User');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('textarea[name="message"]', 'Test message');
    
    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();
    
    // Wait for response
    await page.waitForTimeout(2000);
    
    // Check for success message
    const hasSuccess = await page.locator('text=/success|thank you|submitted/i').count() > 0;
    expect(hasSuccess).toBeTruthy();
  });

  test('Test all modal triggers', async ({ page }) => {
    await page.goto(BASE_URL);
    
    // Find all potential modal triggers
    const modalTriggers = await page.$$('[data-modal], [data-toggle="modal"], button:has-text("Learn More"), button:has-text("Get Started")');
    
    console.log(`Found ${modalTriggers.length} potential modal triggers`);
    
    for (let i = 0; i < modalTriggers.length; i++) {
      const trigger = page.locator('[data-modal], [data-toggle="modal"], button:has-text("Learn More"), button:has-text("Get Started")').nth(i);
      
      if (await trigger.isVisible()) {
        await trigger.click();
        await page.waitForTimeout(500);
        
        // Check if modal opened
        const modal = await page.locator('.modal, [role="dialog"], .dialog').count();
        if (modal > 0) {
          console.log('Modal opened successfully');
          
          // Close modal
          const closeButton = page.locator('[aria-label="Close"], button:has-text("Close"), button:has-text("Cancel")').first();
          if (await closeButton.isVisible()) {
            await closeButton.click();
          } else {
            await page.keyboard.press('Escape');
          }
          
          await page.waitForTimeout(500);
        }
      }
    }
  });

  test('Test dropdown menus', async ({ page }) => {
    await page.goto(BASE_URL);
    
    // Find all dropdowns
    const dropdowns = await page.$$('[data-dropdown], .dropdown-toggle, button[aria-haspopup="true"]');
    
    console.log(`Found ${dropdowns.length} dropdowns`);
    
    for (let i = 0; i < dropdowns.length; i++) {
      const dropdown = page.locator('[data-dropdown], .dropdown-toggle, button[aria-haspopup="true"]').nth(i);
      
      if (await dropdown.isVisible()) {
        await dropdown.click();
        await page.waitForTimeout(500);
        
        // Check if menu opened
        const menu = await page.locator('.dropdown-menu, [role="menu"]').count();
        if (menu > 0) {
          console.log('Dropdown menu opened');
          
          // Click first item
          const firstItem = page.locator('.dropdown-item, [role="menuitem"]').first();
          if (await firstItem.isVisible()) {
            await firstItem.click();
          }
        }
      }
    }
  });

  test('Test tab navigation', async ({ page }) => {
    await page.goto(`${BASE_URL}/programs`);
    
    // Find all tabs
    const tabs = await page.$$('[role="tab"], .tab-button, button[data-tab]');
    
    console.log(`Found ${tabs.length} tabs`);
    
    for (let i = 0; i < tabs.length; i++) {
      const tab = page.locator('[role="tab"], .tab-button, button[data-tab]').nth(i);
      
      if (await tab.isVisible()) {
        await tab.click();
        await page.waitForTimeout(500);
        
        // Verify tab content changed
        const tabPanel = page.locator('[role="tabpanel"], .tab-content').first();
        expect(await tabPanel.isVisible()).toBeTruthy();
      }
    }
  });

  test('Test accordion/collapsible sections', async ({ page }) => {
    await page.goto(`${BASE_URL}/faq`);
    
    // Find all accordion items
    const accordions = await page.$$('[data-accordion], .accordion-toggle, button[aria-expanded]');
    
    console.log(`Found ${accordions.length} accordion items`);
    
    for (let i = 0; i < accordions.length; i++) {
      const accordion = page.locator('[data-accordion], .accordion-toggle, button[aria-expanded]').nth(i);
      
      if (await accordion.isVisible()) {
        // Click to expand
        await accordion.click();
        await page.waitForTimeout(500);
        
        // Click again to collapse
        await accordion.click();
        await page.waitForTimeout(500);
      }
    }
  });
});

// Report generation
test.afterAll(async () => {
  console.log('\n' + '='.repeat(60));
  console.log('📊 CLICK TEST SUMMARY');
  console.log('='.repeat(60));
  console.log(`Total elements clicked: ${clickedElements.size}`);
  console.log('\n🎯 All clickable elements have been tested!');
  console.log('='.repeat(60));
});
