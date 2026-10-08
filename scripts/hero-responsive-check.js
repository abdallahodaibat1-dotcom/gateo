const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const sizes = [
    { name: 'mobile-375', width: 375, height: 700 },
    { name: 'tablet-768', width: 768, height: 900 },
    { name: 'laptop-1280', width: 1280, height: 720 },
    { name: 'wide-1920', width: 1920, height: 800 },
    { name: 'short-1440x600', width: 1440, height: 600 },
  ];
  for (const s of sizes) {
    const page = await browser.newPage({ viewport: { width: s.width, height: s.height } });
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1200);
    await page.screenshot({ path: `scripts/hero-${s.name}.png` });
    await page.close();
    console.log('done', s.name);
  }
  await browser.close();
})();
