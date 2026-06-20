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

  console.log('Navigating to http://localhost:3000/create-post ...');
  const response = await page.goto('http://localhost:3000/create-post', { waitUntil: 'networkidle', timeout: 30000 });

  console.log('\n=== Page Load Result ===');
  console.log('URL:', page.url());
  console.log('Status:', response?.status());
  console.log('Title:', await page.title());

  // Wait a bit for client-side hydration/errors
  await page.waitForTimeout(3000);

  // Check if redirected to login
  const currentUrl = page.url();
  if (currentUrl.includes('/login')) {
    console.log('\n⚠️  PAGE WAS REDIRECTED TO LOGIN');
  }

  // Check for common error elements
  const bodyText = await page.locator('body').innerText({ timeout: 5000 }).catch(() => 'N/A');
  console.log('\n=== Body Text (first 500 chars) ===');
  console.log(bodyText.slice(0, 500));

  // Screenshot
  await page.screenshot({ path: 'create-post-test.png', fullPage: true });
  console.log('\nScreenshot saved to create-post-test.png');

  console.log('\n=== Summary ===');
  console.log('Console logs:', logs.length);
  console.log('Page errors:', errors.length);
  console.log('Network errors:', network.length);

  await browser.close();
})();
