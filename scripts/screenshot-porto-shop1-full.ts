import { chromium } from 'playwright';

(async () => {
  const url = process.argv[2] || 'http://localhost:3000/business/porto-shop1-demo-1782129545638/home';
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1600, height: 900 } });
  await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(3000);
  await page.screenshot({ path: 'scripts/porto-shop1-full-fixed.png', fullPage: true });
  await browser.close();
  console.log('Full-page screenshot saved to scripts/porto-shop1-full-fixed.png');
})();
