import { chromium } from 'playwright';

const BASE = process.env.BASE_URL || 'http://localhost:3000';
const CHROME_PATH = process.env.PLAYWRIGHT_CHROME_PATH || process.env.CHROME_PATH;

(async () => {
  const launchOptions = { headless: true };
  if (CHROME_PATH) {
    launchOptions.executablePath = CHROME_PATH;
  }
  const browser = await chromium.launch(launchOptions);
  const page = await browser.newPage();

  try {
    await page.goto(`${BASE}/register`, { waitUntil: 'networkidle', timeout: 120000 });

    // Wait for the country select to load (loading spinner disappears)
    await page.waitForSelector('input[aria-label="بحث الدولة"]', { timeout: 10000 });

    // Click the country select container
    await page.locator('input[aria-label="بحث الدولة"]').first().click();

    // Type 'sa' to search
    await page.keyboard.type('السعودية');

    // Check that Saudi Arabia appears
    const sa = await page.locator('button', { hasText: '🇸🇦' }).first();
    const visible = await sa.isVisible().catch(() => false);
    console.log('Saudi Arabia visible:', visible);
    if (!visible) throw new Error('Saudi Arabia not visible in country dropdown');

    // Press Escape to close
    await page.keyboard.press('Escape');
    console.log('✅ Country selector test passed');
  } catch (e) {
    console.error('❌ Test failed:', e.message);
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
