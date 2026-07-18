const { chromium } = require('playwright');

const BUSINESS_URL = 'http://localhost:3000/business/cmqt0zboh00kv7vxd8x4hhv8t/home';
const SHOP_URL = 'http://localhost:3000/business/cmqt0zboh00kv7vxd8x4hhv8t/shop';

async function capture(page, name, viewport) {
  await page.setViewportSize(viewport);
  await page.goto(BUSINESS_URL, { waitUntil: 'domcontentloaded', timeout: 240000 });
  await page.waitForTimeout(3000);
  await page.screenshot({ path: `${name}.png`, fullPage: true });
  console.log(`Screenshot saved: ${name}.png`);
}

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

  // Desktop homepage
  await capture(page, 'demo-spa-home-desktop', { width: 1440, height: 900 });

  // Mobile homepage
  await capture(page, 'demo-spa-home-mobile', { width: 390, height: 844 });

  // Shop page desktop
  await page.goto(SHOP_URL, { waitUntil: 'domcontentloaded', timeout: 240000 });
  await page.waitForTimeout(3000);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.screenshot({ path: 'demo-spa-shop-desktop.png', fullPage: true });
  console.log('Screenshot saved: demo-spa-shop-desktop.png');

  const bodyText = await page.$eval('body', (el) => el.innerText);
  console.log('Has products:', bodyText.includes('المنتجات') || bodyText.includes('لمسة نور'));

  await browser.close();
})();
