const { chromium } = require('playwright');
const fs = require('fs');

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
  await context.addCookies(parseNetscapeCookies('fresh_cookies.txt'));
  const page = await context.newPage();
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);
  await page.screenshot({ path: 'home-with-ads.png', fullPage: true });
  console.log('Saved home-with-ads.png');
  await browser.close();
})();
