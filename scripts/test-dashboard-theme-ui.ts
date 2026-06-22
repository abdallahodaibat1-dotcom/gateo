import { chromium } from 'playwright';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const EMAIL = process.env.TEST_EMAIL || 'user-1@realistic.gateo.com';
const PASSWORD = process.env.TEST_PASSWORD || 'demo123';

async function login(page: any) {
  await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });
  await page.fill('input[name="emailOrPhone"]', EMAIL);
  await page.fill('input[name="password"]', PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForURL(`${BASE_URL}/`, { timeout: 10000 });
}

async function main() {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    locale: 'ar',
    viewport: { width: 1600, height: 900 },
  });
  const page = await context.newPage();

  console.log('🔑 Logging in...');
  await login(page);

  console.log('🎨 Opening theme dashboard...');
  await page.goto(`${BASE_URL}/business-dashboard/website/theme`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  const screenshotPath = 'scripts/test-dashboard-theme-ui.png';
  await page.screenshot({ path: screenshotPath, fullPage: false });
  console.log('📸 Dashboard screenshot saved:', screenshotPath);

  await browser.close();
  console.log('✅ Dashboard UI test completed');
}

main().catch((err) => {
  console.error('❌ Dashboard UI test failed:', err);
  process.exit(1);
});
