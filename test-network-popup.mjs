import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true, channel: 'chrome' });
const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
const page = await context.newPage();

await page.goto('http://localhost:3000/login');
await page.fill('input[type="email"]', 'abdallah.odaibat1@gmail.com');
await page.fill('input[type="password"]', 'abdallah');
await page.click('button[type="submit"]');
await page.waitForTimeout(3000);
await page.goto('http://localhost:3000/feed');
await page.waitForTimeout(2000);

// Click "شبكتي" button
const networkBtn = page.locator('button:has-text("شبكتي")').first();
console.log('Network button visible:', await networkBtn.isVisible().catch(() => false));
await networkBtn.click();
await page.waitForTimeout(1000);

const popupTexts = ['شبكتي', 'المجموعات', 'قريبة مني', 'اقتراحات الأصدقاء'];
for (const t of popupTexts) {
  const visible = await page.locator(`text=${t}`).first().isVisible().catch(() => false);
  console.log(t, ':', visible);
}

await page.screenshot({ path: '/tmp/network-popup.png' });
console.log('Screenshot saved to /tmp/network-popup.png');

await browser.close();
