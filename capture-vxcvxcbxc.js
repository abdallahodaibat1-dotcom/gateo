const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();
  try {
    await page.goto('http://localhost:3000/business/vxcvxcbxc/home', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'vxcvxcbxc-desktop.png', fullPage: true });
    console.log('desktop saved vxcvxcbxc-desktop.png');
    await page.setViewportSize({ width: 375, height: 812 });
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'vxcvxcbxc-mobile.png', fullPage: true });
    console.log('mobile saved vxcvxcbxc-mobile.png');
  } catch (e) { console.error(e); process.exit(1); }
  await browser.close();
})();
