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

const modal = page.locator('div').filter({ hasText: 'اكتشفي مجتمعكِ وتواصلي مع من حولكِ' }).first();
const style = await modal.evaluate(el => {
  const computed = window.getComputedStyle(el);
  return {
    top: computed.top,
    left: computed.left,
    transform: computed.transform,
    position: computed.position,
  };
});
console.log('Modal style:', style);

const box = await modal.boundingBox();
console.log('Modal box:', box);

await browser.close();
