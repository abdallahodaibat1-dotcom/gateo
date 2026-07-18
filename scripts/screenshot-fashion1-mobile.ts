import { chromium } from 'playwright';

const BASE = process.env.BASE_URL || 'http://localhost:3000';
const SLUG = process.argv[2] || 'ssfhfh';

const targets = [
  { path: `/business/${SLUG}/home`, out: 'scripts/fashion1-home-mobile.png' },
  { path: `/business/${SLUG}/shop`, out: 'scripts/fashion1-shop-mobile.png' },
];

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  for (const t of targets) {
    const url = BASE + t.path;
    console.log('Loading', url);
    const resp = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
    console.log('  status:', resp?.status());
    await page.waitForTimeout(3500);
    await page.screenshot({ path: t.out, fullPage: true });
    console.log('  saved:', t.out);
  }
  await browser.close();
})();
