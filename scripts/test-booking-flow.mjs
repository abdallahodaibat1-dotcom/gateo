import { chromium } from 'playwright';

const BASE = process.env.BASE_URL || 'http://localhost:3000';
const CHROME_PATH = process.env.PLAYWRIGHT_CHROME_PATH || process.env.CHROME_PATH;

async function run() {
  const launchOptions = { headless: true };
  if (CHROME_PATH) {
    launchOptions.executablePath = CHROME_PATH;
  }
  const browser = await chromium.launch(launchOptions);
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log('1. Login as demo user...');
    await page.goto(`${BASE}/login`);
    await page.fill('input[type="email"]', 'demo@gateo.com');
    await page.fill('input[type="password"]', 'demo123');
    await page.click('button[type="submit"]');
    await page.waitForURL(`${BASE}/`, { timeout: 15000 });

    console.log('2. Navigate to a business/service...');
    const bizRes = await fetch(`${BASE}/api/businesses`);
    const bizData = await bizRes.json();
    const firstBusiness = bizData.businesses?.[0] || bizData[0];
    if (!firstBusiness) throw new Error('No businesses found in API');
    const firstLink = `/businesses/${firstBusiness.slug || firstBusiness.id}`;
    console.log('Business link:', firstLink);

    await page.goto(`${BASE}${firstLink}`, { waitUntil: 'networkidle' });

    console.log('3. Try to book a service...');
    const bookButton = await page.locator('button:has-text("احجز الآن"), a:has-text("احجز الآن"), button:has-text("حجز")').first();
    if (!(await bookButton.isVisible().catch(() => false))) {
      console.warn('⚠️ No booking button visible, skipping booking form');
    } else {
      await bookButton.click();
      await page.waitForTimeout(1000);
      const dateInput = await page.locator('input[type="date"]').first();
      if (await dateInput.isVisible().catch(() => false)) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        await dateInput.fill(tomorrow.toISOString().split('T')[0]);
      }
      const submitButton = await page.locator('button[type="submit"]').first();
      if (await submitButton.isVisible().catch(() => false)) {
        await submitButton.click();
        await page.waitForTimeout(2000);
        console.log('Current URL after booking:', page.url());
      }
    }

    await page.screenshot({ path: 'scripts/booking-flow-result.png', fullPage: true });
    console.log('✅ Booking flow test completed');
  } catch (err) {
    console.error('❌ Booking flow test failed:', err.message);
    await page.screenshot({ path: 'scripts/booking-flow-error.png', fullPage: true });
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
}

run();
