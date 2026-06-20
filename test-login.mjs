import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext();
const page = await context.newPage();

page.on('console', msg => console.log('PAGE LOG:', msg.text()));
page.on('pageerror', err => console.log('PAGE ERROR:', err.message));
page.on('response', async resp => {
  if (resp.url().includes('/api/auth/callback/credentials')) {
    console.log('CREDENTIALS RESPONSE:', resp.status(), await resp.headerValue('location'));
  }
});

await page.goto('http://localhost:3000/login');
await page.waitForSelector('input[type="email"]');
await page.fill('input[type="email"]', 'abdallah.odaibat1@gmail.com');
await page.fill('input[type="password"]', 'abdallah');
await page.click('button[type="submit"]');
await page.waitForTimeout(3000);

console.log('URL after login:', page.url());
const error = await page.locator('text=البريد أو كلمة المرور غير صحيحة').isVisible().catch(() => false);
console.log('Error visible:', error);

await browser.close();
