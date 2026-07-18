const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  
  page.on('console', msg => console.log('CONSOLE:', msg.type(), msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.message));
  
  await page.goto('http://localhost:3000/business/cmqt0zboh00kv7vxd8x4hhv8t/home', { waitUntil: 'domcontentloaded', timeout: 240000 });
  await page.waitForTimeout(10000);
  
  const bodyText = await page.$eval('body', el => el.innerText);
  console.log('Has services:', bodyText.includes('ما نقدمه'));
  console.log('Has products:', bodyText.includes('المنتجات'));
  console.log('Has gallery:', bodyText.includes('معرض الصور'));
  console.log('Has working hours:', bodyText.includes('أوقات العمل'));
  
  await page.screenshot({ path: '/tmp/business-home-new.png', fullPage: true });
  console.log('Screenshot saved');
  
  await browser.close();
})();
