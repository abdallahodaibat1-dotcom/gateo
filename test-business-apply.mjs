import { chromium } from 'playwright';

const TEST_EMAIL = 'fresh1781127017@test.com';
const TEST_PASSWORD = 'fresh123';

(async () => {
  const browser = await chromium.connectOverCDP('http://localhost:9222');
  const context = browser.contexts()[0] || await browser.newContext();
  const page = context.pages()[0] || await context.newPage();

  const errors = [];
  const httpErrors = [];
  page.on('console', msg => console.log(`[${msg.type()}] ${msg.text()}`));
  page.on('pageerror', err => { errors.push(err.message); console.error(`[PAGE ERROR] ${err.message}`); });
  page.on('response', async resp => {
    const status = resp.status();
    const url = resp.url();
    if (status >= 400) {
      httpErrors.push({status, url});
      console.error(`[HTTP ${status}] ${url}`);
    }
  });

  // Step 0: Login
  console.log('=== Logging in ===');
  await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);

  await page.fill('input[type="email"]', TEST_EMAIL);
  await page.fill('input[type="password"]', TEST_PASSWORD);
  await page.click('button[type="submit"]');

  // Wait for login processing
  await page.waitForTimeout(8000);

  const afterLoginUrl = page.url();
  console.log('URL after login:', afterLoginUrl);

  if (afterLoginUrl.includes('/login')) {
    console.log('❌ Login failed - still on login page');
    const bodyText = await page.locator('body').innerText().catch(() => '');
    console.log('Body:', bodyText.slice(0, 300));
    await page.screenshot({ path: 'login-failed.png', fullPage: true });
    await browser.close();
    return;
  }

  console.log('✅ Login successful');
  await page.screenshot({ path: 'after-login.png', fullPage: true });

  // Go to apply page
  console.log('\n=== Going to /business/apply ===');
  await page.goto('http://localhost:3000/business/apply', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  if (page.url().includes('/login')) {
    console.log('⚠️ Redirected to login - session not persisted');
    await browser.close();
    return;
  }

  console.log('=== Step 1: Basic Info ===');
  await page.waitForSelector('input[placeholder*="صالون"]', { timeout: 15000 });

  const uniqueId = Date.now().toString(36).slice(-4);
  const salonName = 'صالون لمسة النور';
  const slug = `lamset-alnoor-${uniqueId}`;

  await page.fill('input[placeholder*="صالون"]', salonName);
  await page.fill('input[placeholder*="salon"]', slug);
  await page.fill('textarea[placeholder*="صفّي"]', 'صالون متخصص في العناية بالبشرة والشعر والمكياج. نقدم أجود الخدمات بأيدي خبيرات محترفات.');
  await page.selectOption('select', 'cmq6xg27900007vthw1reauid');

  await page.screenshot({ path: 'apply-step1.png' });
  console.log('Step 1 filled, slug:', slug);

  // Navigate through steps
  for (let i = 1; i <= 5; i++) {
    console.log(`=== Step ${i} -> ${i+1} ===`);
    const buttons = await page.locator('button').all();
    let clicked = false;
    for (const btn of buttons) {
      const html = await btn.innerHTML().catch(() => '');
      if (html.includes('ArrowLeft') || html.includes('arrow-left')) {
        await btn.click();
        clicked = true;
        break;
      }
    }
    if (!clicked) console.log('Next button not found for step', i);
    await page.waitForTimeout(1500);
    await page.screenshot({ path: `apply-step${i+1}.png` });
  }

  console.log('=== Step 6: Submit ===');
  const buttons = await page.locator('button').all();
  for (const btn of buttons) {
    const text = await btn.innerText().catch(() => '');
    if (text.includes('إنشاء') || text.includes('إرسال') || text.includes('تقديم')) {
      await btn.click();
      console.log('Clicked:', text);
      break;
    }
  }

  await page.waitForTimeout(5000);
  await page.screenshot({ path: 'apply-result.png', fullPage: true });

  console.log('\n=== Final URL ===', page.url());
  console.log('=== Title ===', await page.title());

  const bodyText = await page.locator('body').innerText().catch(() => 'N/A');
  console.log('\n=== Body (first 800 chars) ===');
  console.log(bodyText.slice(0, 800));

  console.log('\n=== HTTP Errors ===', httpErrors.length);
  httpErrors.forEach(e => console.log(`${e.status}: ${e.url}`));

  console.log('\n=== Summary ===');
  console.log('Page errors:', errors.length);

  await browser.close();
})();
