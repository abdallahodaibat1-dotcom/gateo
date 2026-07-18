const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();
  page.on('console', msg => console.log('CONSOLE:', msg.type(), msg.text()));
  page.on('pageerror', err => console.log('PAGEERROR:', err.message));
  try {
    await page.goto('http://localhost:3000/business/vxcvxcbxc/product/cmr187xj500027v0vykj4chf0', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'vxcvxcbxc-product.png', fullPage: true });
    console.log('saved vxcvxcbxc-product.png');
  } catch (e) { console.error(e); process.exit(1); }
  await browser.close();
})();
