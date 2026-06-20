import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true, channel: 'chrome' });
const context = await browser.newContext();
const page = await context.newPage();

page.on('console', msg => console.log('PAGE LOG:', msg.text()));
page.on('pageerror', err => console.log('PAGE ERROR:', err.message));

// Login first
await page.goto('http://localhost:3000/login');
await page.fill('input[type="email"]', 'abdallah.odaibat1@gmail.com');
await page.fill('input[type="password"]', 'abdallah');
await page.click('button[type="submit"]');
await page.waitForTimeout(3000);
console.log('URL after login:', page.url());

// Go to feed
await page.goto('http://localhost:3000/feed');
await page.waitForTimeout(2000);

// Click user menu button
const userBtn = page.locator('button:has(img[alt=""])').first();
console.log('User button visible:', await userBtn.isVisible().catch(() => false));
await userBtn.click();
await page.waitForTimeout(1000);

// Check if drawer is visible
const drawer = page.locator('text=عرض الملف الشخصي').first();
console.log('Drawer visible:', await drawer.isVisible().catch(() => false));

const html = await page.content();
console.log('Contains UserMenuDrawer:', html.includes('UserMenuDrawer'));
console.log('Contains bg-black/40:', html.includes('bg-black/40'));

await browser.close();
