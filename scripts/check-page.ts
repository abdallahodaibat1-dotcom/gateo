import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const requests: string[] = [];
  page.on('request', (req) => requests.push(req.url()));
  page.on('console', (msg) => console.log('CONSOLE:', msg.text()));
  page.on('pageerror', (err) => console.log('PAGE ERROR:', err.message));
  await page.goto('http://localhost:3000/business/rt-lg-health-demo-spa/home', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await new Promise((r) => setTimeout(r, 3000));
  const title = await page.title();
  console.log('TITLE:', title);
  console.log('REQUESTS:', requests.filter((r) => r.includes('businesses') || r.includes('business/')).join('\n'));
  await browser.close();
})();
