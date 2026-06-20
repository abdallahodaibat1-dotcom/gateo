import { chromium } from 'playwright';

const BASE = process.env.BASE_URL || 'http://localhost:3000';
const CHROME_PATH = process.env.PLAYWRIGHT_CHROME_PATH || process.env.CHROME_PATH;

const firstName = 'فهد';
const lastName = 'السعود';
const email = `onboard_${Date.now()}@gateo.com`;
const phone = `5${Math.floor(10000000 + Math.random() * 89999999)}`;
const password = 'TestPass123';

async function run() {
  const launchOptions = { headless: true };
  if (CHROME_PATH) {
    launchOptions.executablePath = CHROME_PATH;
  }
  const browser = await chromium.launch(launchOptions);
  const context = await browser.newContext({ locale: 'ar-SA' });
  const page = await context.newPage();

  try {
    console.log('1. Registering and auto-login...');
    await page.goto(`${BASE}/register`, { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForSelector('input[name="firstName"]', { timeout: 20000 });
    await page.fill('input[name="firstName"]', firstName);
    await page.fill('input[name="lastName"]', lastName);
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="phone"]', phone);
    await page.fill('input[name="password"]', password);
    await page.check('input[type="checkbox"]');

    await Promise.all([
      page.waitForURL(`${BASE}/onboarding`, { timeout: 30000 }),
      page.click('button[type="submit"]'),
    ]);

    console.log('2. Onboarding page reached...');
    await page.waitForSelector('text=استكمل معلومات حسابك الشخصي', { timeout: 20000 });

    // Select gender
    await page.getByText('ذكر').first().click();

    // Select interests
    await page.getByText('رياضة').first().click();
    await page.getByText('تقنية').first().click();
    await page.getByText('أعمال').first().click();

    // Save
    await Promise.all([
      page.waitForURL(`${BASE}/`, { timeout: 30000 }),
      page.getByText('حفظ ومتابعة').first().click(),
    ]);

    console.log('3. Redirected to home after onboarding.');

    // Verify DB via API
    await page.goto(`${BASE}/api/account/me`);
    const apiResponse = await page.textContent('pre');
    const data = JSON.parse(apiResponse || '{}');
    console.log('Profile onboardingCompleted:', data.profile?.onboardingCompleted);

    if (!data.profile?.onboardingCompleted) {
      throw new Error('onboardingCompleted not set');
    }

    console.log('✅ Onboarding E2E test passed');
  } catch (err) {
    console.error('❌ Test failed:', err.message);
    await page.screenshot({ path: 'scripts/test-onboarding-error.png', fullPage: true });
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
}

run();
