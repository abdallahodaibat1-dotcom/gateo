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

await page.locator('button:has-text("شبكتي")').first().click();
await page.waitForTimeout(1000);

const popup = page.locator('text=شبكتي').filter({ hasText: 'شبكتي' }).first();
const box = await popup.boundingBox().catch(() => null);
console.log('Popup box:', box);

await page.screenshot({ path: '/tmp/network-popup2.png' });
console.log('Screenshot saved');

await browser.close();
