#!/usr/bin/env tsx
/**
 * Link Checker Script
 * Crawls all pages and checks for broken links
 */

import { chromium } from 'playwright'

const BASE_URL = process.env.BASE_URL || 'http://localhost:3002'
const visited = new Set<string>()
const brokenLinks: { page: string; link: string; status?: number; error?: string }[] = []
const validLinks = new Set<string>()

// Pages to check
const pagesToCheck = [
  '/',
  '/solutions',
  '/solutions/it-staffing',
  '/solutions/cross-border',
  '/solutions/training',
  '/consulting',
  '/consulting/competencies',
  '/consulting/services',
  '/industries',
  '/industries/information-technology',
  '/industries/healthcare',
  '/careers',
  '/careers/join-our-team',
  '/careers/open-positions',
  '/resources',
  '/academy-info',
  '/contact',
  '/company/about',
]

async function checkPage(url: string) {
  if (visited.has(url)) return
  visited.add(url)

  console.log(`\n🔍 Checking: ${url}`)

  const browser = await chromium.launch()
  const page = await browser.newPage()

  try {
    const response = await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 })
    
    if (!response || response.status() >= 400) {
      console.log(`❌ Page error: ${response?.status()}`)
      brokenLinks.push({ page: url, link: url, status: response?.status() })
      await browser.close()
      return
    }

    console.log(`✅ Page loaded: ${response.status()}`)

    // Get all links on the page
    const links = await page.$$eval('a[href]', (anchors) =>
      anchors.map((a) => ({
        href: (a as HTMLAnchorElement).href,
        text: a.textContent?.trim() || '',
      }))
    )

    console.log(`📎 Found ${links.length} links`)

    // Check each link
    for (const { href, text } of links) {
      const fullUrl = new URL(href, BASE_URL).href

      // Skip external links, mailto, tel, and anchors
      if (
        !fullUrl.startsWith(BASE_URL) ||
        fullUrl.startsWith('mailto:') ||
        fullUrl.startsWith('tel:') ||
        fullUrl.includes('#')
      ) {
        continue
      }

      // Skip if already checked
      if (validLinks.has(fullUrl)) {
        continue
      }

      try {
        const linkResponse = await page.goto(fullUrl, { waitUntil: 'domcontentloaded', timeout: 10000 })
        
        if (!linkResponse || linkResponse.status() >= 400) {
          console.log(`  ❌ Broken: ${fullUrl} (${linkResponse?.status()}) - "${text}"`)
          brokenLinks.push({
            page: url,
            link: fullUrl,
            status: linkResponse?.status(),
          })
        } else {
          validLinks.add(fullUrl)
          console.log(`  ✅ OK: ${fullUrl.replace(BASE_URL, '')}`)
        }
      } catch (error) {
        console.log(`  ❌ Error: ${fullUrl} - ${(error as Error).message}`)
        brokenLinks.push({
          page: url,
          link: fullUrl,
          error: (error as Error).message,
        })
      }
    }
  } catch (error) {
    console.log(`❌ Failed to load page: ${(error as Error).message}`)
    brokenLinks.push({
      page: url,
      link: url,
      error: (error as Error).message,
    })
  } finally {
    await browser.close()
  }
}

async function main() {
  console.log('🚀 Starting link check...')
  console.log(`📍 Base URL: ${BASE_URL}`)
  console.log(`📄 Pages to check: ${pagesToCheck.length}\n`)

  for (const page of pagesToCheck) {
    const fullUrl = `${BASE_URL}${page}`
    await checkPage(fullUrl)
  }

  // Print summary
  console.log('\n\n' + '='.repeat(80))
  console.log('📊 SUMMARY')
  console.log('='.repeat(80))
  console.log(`✅ Pages checked: ${visited.size}`)
  console.log(`✅ Valid links: ${validLinks.size}`)
  console.log(`❌ Broken links: ${brokenLinks.length}`)

  if (brokenLinks.length > 0) {
    console.log('\n❌ BROKEN LINKS:')
    console.log('='.repeat(80))
    
    brokenLinks.forEach(({ page, link, status, error }) => {
      console.log(`\nPage: ${page}`)
      console.log(`Link: ${link}`)
      if (status) console.log(`Status: ${status}`)
      if (error) console.log(`Error: ${error}`)
    })

    process.exit(1)
  } else {
    console.log('\n✅ All links are valid!')
    process.exit(0)
  }
}

main().catch((error) => {
  console.error('Fatal error:', error)
  process.exit(1)
})



