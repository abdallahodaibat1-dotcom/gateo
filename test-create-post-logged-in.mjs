import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: '/usr/bin/google-chrome',
  });

  const context = await browser.newContext();
  const page = await context.newPage();

  const logs = [];
  const errors = [];
  const network = [];

  page.on('console', msg => {
    const entry = `[${msg.type()}] ${msg.text()}`;
    logs.push(entry);
    console.log(entry);
  });

  page.on('pageerror', err => {
    const entry = `[PAGE ERROR] ${err.message}`;
    errors.push(entry);
    console.error(entry);
  });

  page.on('response', resp => {
    const status = resp.status();
    const url = resp.url();
    if (status >= 400) {
      const entry = `[HTTP ${status}] ${url}`;
      network.push(entry);
      console.error(entry);
    }
  });

  page.on('requestfailed', req => {
    const entry = `[REQUEST FAILED] ${req.url()} — ${req.failure()?.errorText || 'unknown'}`;
    network.push(entry);
    console.error(entry);
  });

  // Step 1: Login
  console.log('=== Step 1: Logging in ===');
  await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle' });
  
  await page.fill('input[type="email"], input[name="email"]', 'browser@test.com');
  await page.fill('input[type="password"], input[name="password"]', 'testpass123');
  await page.click('button[type="submit"]');
  
  // Wait for navigation after login
  try {
    await page.waitForURL('**/feed', { timeout: 10000 });
    console.log('✅ Logged in, redirected to feed');
  } catch {
    console.log('Current URL after login attempt:', page.url());
  }

  // Step 2: Go to create-post
  console.log('\n=== Step 2: Navigating to /create-post ===');
  await page.goto('http://localhost:3000/create-post', { waitUntil: 'networkidle', timeout: 30000 });

  const currentUrl = page.url();
  console.log('URL:', currentUrl);
  console.log('Title:', await page.title());

  if (currentUrl.includes('/login')) {
    console.log('\n⚠️  REDIRECTED TO LOGIN — auth session not persisting');
  } else {
    console.log('\n✅ Create-post page loaded while logged in');
    
    // Wait for hydration
    await page.waitForTimeout(3000);
    
    const bodyText = await page.locator('body').innerText({ timeout: 5000 }).catch(() => 'N/A');
    console.log('\n=== Body Text (first 1000 chars) ===');
    console.log(bodyText.slice(0, 1000));
    
    // Check for form elements
    const hasTextarea = await page.locator('textarea').count();
    const hasFileInput = await page.locator('input[type="file"]').count();
    const hasSubmit = await page.locator('button[type="submit"]').count();
    console.log('\n=== Form Elements ===');
    console.log('Textareas:', hasTextarea);
    console.log('File inputs:', hasFileInput);
    console.log('Submit buttons:', hasSubmit);
  }

  await page.screenshot({ path: 'create-post-logged-in.png', fullPage: true });
  console.log('\nScreenshot saved to create-post-logged-in.png');

  console.log('\n=== Summary ===');
  console.log('Console logs:', logs.length);
  console.log('Page errors:', errors.length);
  console.log('Network errors:', network.length);
  if (errors.length) console.log('Errors:', errors);
  if (network.length) console.log('Network errors:', network);

  await browser.close();
})();
