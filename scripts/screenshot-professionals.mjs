import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true, executablePath: '/usr/bin/google-chrome' });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

await page.goto('http://localhost:3000/businesses/medical-services', { waitUntil: 'networkidle' });
await page.screenshot({ path: '/home/abdalah/code/gateo/professionals-medical.png', fullPage: true });
console.log('Screenshot: professionals-medical.png');

const firstLink = await page.$eval('a[href^="/profile/"]', el => el.getAttribute('href'));
console.log('First profile:', firstLink);

if (firstLink) {
  await page.goto('http://localhost:3000' + firstLink, { waitUntil: 'networkidle' });
  await page.screenshot({ path: '/home/abdalah/code/gateo/profile-detail.png', fullPage: true });
  console.log('Screenshot: profile-detail.png');
}

await browser.close();
