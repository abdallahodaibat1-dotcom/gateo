import { chromium } from 'playwright';
import path from 'path';

const businessUrl = process.env.BUSINESS_URL || 'http://localhost:3000/business/rt-lg-health-demo-spa';
const outputPath = process.env.OUTPUT_PATH || path.resolve(process.cwd(), 'beauty-salon-preview.png');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    locale: 'ar-SA',
  });
  const page = await context.newPage();

  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      console.error(`[browser error] ${msg.text()}`);
    }
  });
  page.on('pageerror', (err) => console.error(`[page error] ${err.message}`));

  console.log(`Navigating to ${businessUrl}`);
  await page.goto(businessUrl, { waitUntil: 'networkidle', timeout: 60000 });

  // Wait for hero background image to load
  await page.waitForSelector('[data-testid="beauty-hero"]', { timeout: 10000 }).catch(() => {
    console.warn('Hero selector not found');
  });

  // Scroll to bottom slowly to trigger lazy animations
  await page.evaluate(async () => {
    await new Promise<void>((resolve) => {
      let totalHeight = 0;
      const distance = 200;
      const timer = setInterval(() => {
        const scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;
        if (totalHeight >= scrollHeight) {
          clearInterval(timer);
          resolve();
        }
      }, 80);
    });
  });

  // Wait for reveal animations and images
  await page.waitForTimeout(2500);

  // Ensure all reveal elements are visible before screenshot
  await page.waitForFunction(
    () => {
      const hidden = Array.from(document.querySelectorAll('.reveal')).filter((el) => {
        const style = window.getComputedStyle(el);
        return style.opacity === '0' && style.transform !== 'none';
      });
      return hidden.length === 0;
    },
    { timeout: 10000 }
  ).catch(() => {
    console.warn('Some reveal elements remained hidden; forcing them visible');
    page.evaluate(() => {
      document.querySelectorAll('.reveal').forEach((el) => el.classList.add('in'));
    });
  });

  // Scroll back to top for clean full-page screenshot
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(600);

  await page.screenshot({ path: outputPath, fullPage: true });
  console.log(`Screenshot saved to ${outputPath}`);

  await browser.close();
})();
