import { chromium } from 'playwright';

// Visual verification for the fashion-1 storefront template.
// Usage: npx tsx scripts/screenshot-fashion1.ts [business-slug]
const BASE = process.env.BASE_URL || 'http://localhost:3000';
const SLUG = process.argv[2] || 'ssfhfh';

const targets = [
  { path: `/business/${SLUG}/home`, out: 'scripts/fashion1-home.png' },
  { path: `/business/${SLUG}/shop`, out: 'scripts/fashion1-shop.png' },
  { path: `/business/${SLUG}/about`, out: 'scripts/fashion1-about.png' },
  { path: `/business/${SLUG}/contact`, out: 'scripts/fashion1-contact.png' },
];

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
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
