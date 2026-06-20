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

const userBtn = page.locator('button:has(img[alt=""])').first();
await userBtn.click();
await page.waitForTimeout(1000);

// Check multiple elements
const texts = ['عرض الملف الشخصي', 'الإعدادات', 'حجوزاتي', 'محفوظاتي', 'تسجيل الخروج', 'لوحة العمل'];
for (const t of texts) {
  const visible = await page.locator(`text=${t}`).first().isVisible().catch(() => false);
  console.log(t, ':', visible);
}

// Get drawer bounding box
const drawer = page.locator('div').filter({ hasText: 'عرض الملف الشخصي' }).first();
const box = await drawer.boundingBox().catch(() => null);
console.log('Drawer box:', box);

await browser.close();
