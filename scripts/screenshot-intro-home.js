const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  page.on('console', (msg) => console.log('CONSOLE:', msg.type(), msg.text()));
  page.on('pageerror', (err) => console.log('PAGE ERROR:', err.message));
  page.on('response', (res) => {
    if (res.status() >= 400) {
      console.log('RESPONSE ERROR:', res.status(), res.url());
    }
  });

  const start = Date.now();
  await page.goto('http://localhost:3000/business/cmqt0zboh00kv7vxd8x4hhv8t/home', {
    waitUntil: 'domcontentloaded',
    timeout: 240000,
  });
  const loadTime = Date.now() - start;
  console.log(`Initial page load (domcontentloaded): ${loadTime}ms`);

  await page.waitForTimeout(3000);

  const bodyText = await page.$eval('body', (el) => el.innerText);
  console.log('Has services:', bodyText.includes('ما نقدمه'));
  console.log('Has working hours:', bodyText.includes('أوقات العمل'));
  console.log('Has promo:', bodyText.includes('عروض حصرية'));

  await page.screenshot({ path: 'business-intro-home-final.png', fullPage: true });
  console.log('Screenshot saved to business-intro-home-final.png');

  await browser.close();
})();
