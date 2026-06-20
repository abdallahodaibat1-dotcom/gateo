const { chromium } = require('playwright');
const fs = require('fs');

const cookieFile = 'fresh_cookies.txt';

function parseNetscapeCookies(filePath) {
  const lines = fs.readFileSync(filePath, 'utf-8').split('\n').filter(l => l.trim() && (!l.startsWith('#') || l.startsWith('#HttpOnly_')));
  return lines.map(line => {
    const parts = line.split('\t');
    const [domain, flag, path, secure, expiration, name, ...valueParts] = parts;
    return {
      name,
      value: valueParts.join('\t'),
      domain: domain.replace(/^#HttpOnly_/, ''),
      path,
      expires: expiration === '0' ? -1 : Number(expiration),
      httpOnly: domain.startsWith('#HttpOnly_'),
      secure: secure === 'TRUE',
      sameSite: 'Lax',
    };
  });
}

(async () => {
  const browser = await chromium.launch({ headless: true, channel: 'chrome' });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const cookies = parseNetscapeCookies(cookieFile);
  console.log('Adding cookies:', cookies.map(c => c.name));
  await context.addCookies(cookies);
  const stored = await context.cookies();
  console.log('Stored cookies:', stored.map(c => c.name));

  const page = await context.newPage();

  await page.goto('http://localhost:3000/feed', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);
  console.log('Feed URL:', page.url());
  await page.screenshot({ path: 'feed-with-ads.png', fullPage: true });
  console.log('Saved feed-with-ads.png');

  await page.goto('http://localhost:3000/ads/create', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  console.log('Ads create URL:', page.url());
  await page.screenshot({ path: 'ads-create.png', fullPage: true });
  console.log('Saved ads-create.png');

  await browser.close();
})();
