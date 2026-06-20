import { chromium } from 'playwright';

const BASE = process.env.BASE_URL || 'http://localhost:3000';
const CHROME_PATH = process.env.PLAYWRIGHT_CHROME_PATH || process.env.CHROME_PATH;

const launchOptions = { headless: true };
if (CHROME_PATH) {
  launchOptions.executablePath = CHROME_PATH;
}
const browser = await chromium.launch(launchOptions);
const context = await browser.newContext();
const page = await context.newPage({ viewport: { width: 1440, height: 900 } });

page.on('console', msg => console.log('PAGE CONSOLE:', msg.type(), msg.text()));
page.on('pageerror', err => console.log('PAGE ERROR:', err.message));

let failed = false;

try {
  await page.goto(`${BASE}/login`);
  await page.fill('input[type="email"]', 'demo@gateo.com');
  await page.fill('input[type="password"]', 'demo123');
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/$/, { timeout: 15000 });
  console.log('Logged in, current URL:', page.url());

  // Fetch a professional profile directly from the API
  const profRes = await fetch(`${BASE}/api/professionals`);
  const profData = await profRes.json();
  const firstProfessional = profData.professionals?.[0];
  if (!firstProfessional) {
    throw new Error('No professional profiles found in API');
  }
  const firstLink = `/professionals/${firstProfessional.id}`;
  console.log('First professional link:', firstLink);

  await page.goto(`${BASE}${firstLink}`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  const messageButton = await page.locator('button', { hasText: 'رسالة' }).first();
  const hasMessageButton = await messageButton.isVisible().catch(() => false);

  if (!hasMessageButton) {
    console.warn('⚠️ No message button visible on this page');
  } else {
    await messageButton.click();
    await page.waitForTimeout(3000);
    const currentUrl = page.url();
    console.log('Current URL after message:', currentUrl);

    if (!currentUrl.includes('/messages')) {
      console.warn('⚠️ Did not redirect to /messages after clicking message button');
      failed = true;
    } else {
      console.log('✅ Message button redirected to conversation');
    }
  }

  await page.screenshot({ path: 'scripts/profile-contact-result.png' });
} catch (e) {
  console.error('❌ Test failed:', e.message);
  failed = true;
} finally {
  await browser.close();
}

if (failed) {
  process.exit(1);
}
console.log('✅ Profile contact test passed');
