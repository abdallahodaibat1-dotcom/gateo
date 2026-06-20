import { chromium } from 'playwright';
import http from 'http';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const BASE = process.env.BASE_URL || 'http://localhost:3000';
const CHROME_PATH = process.env.PLAYWRIGHT_CHROME_PATH || process.env.CHROME_PATH;

const prisma = new PrismaClient();

function request(path, cookie) {
  return new Promise((resolve, reject) => {
    const req = http.request(
      BASE + path,
      {
        method: 'GET',
        headers: cookie ? { Cookie: cookie } : {},
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => resolve({ status: res.statusCode, body: data, location: res.headers.location }));
      }
    );
    req.on('error', reject);
    req.end();
  });
}

function cookieHeader(cookies) {
  return cookies.map((c) => `${c.name}=${c.value}`).join('; ');
}

async function login(browser, email, password, isAdmin = false) {
  const context = await browser.newContext();
  const page = await context.newPage();
  const loginUrl = isAdmin ? BASE + '/admin/login' : BASE + '/login';
  const successUrl = isAdmin ? BASE + '/admin-dashboard' : BASE + '/';
  await page.goto(loginUrl);
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForURL(successUrl, { timeout: 15000 });
  const cookies = await context.cookies();
  await context.close();
  return cookies;
}

async function ensureModerator() {
  console.log('Ensuring moderator user exists...');
  const email = 'moderator@gateo.com';
  let user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    user = await prisma.user.create({
      data: {
        email,
        phone: '+962777000001',
        password: bcrypt.hashSync('mod123', 10),
        firstName: 'Moderator',
        lastName: 'User',
        name: 'Moderator User',
        role: 'MODERATOR',
        accountType: 'USER',
        emailVerified: new Date(),
      },
    });
    await prisma.profile.create({
      data: {
        userId: user.id,
        onboardingCompleted: true,
        onboardingSkipped: false,
      },
    });
    console.log('✅ Moderator user created');
  } else {
    await prisma.user.update({ where: { id: user.id }, data: { role: 'MODERATOR' } });
    console.log('✅ Moderator user updated');
  }
}

async function main() {
  await ensureModerator();
  await prisma.$disconnect();

  const launchOptions = { headless: true };
  if (CHROME_PATH) {
    launchOptions.executablePath = CHROME_PATH;
  }
  const browser = await chromium.launch(launchOptions);

  let failed = false;

  console.log('=== Role: ADMIN ===');
  const adminCookies = await login(browser, 'admin@gateo.com', 'admin123', true);
  const adminApi = await request('/api/admin/categories', cookieHeader(adminCookies));
  console.log('GET /api/admin/categories:', adminApi.status, adminApi.status === 200 ? '✅' : '❌');
  if (adminApi.status !== 200) failed = true;
  const adminPage = await request('/admin-dashboard/categories', cookieHeader(adminCookies));
  console.log('GET /admin-dashboard/categories:', adminPage.status, adminPage.status === 200 ? '✅' : '❌');
  if (adminPage.status !== 200) failed = true;

  console.log('\n=== Role: MODERATOR ===');
  const modCookies = await login(browser, 'moderator@gateo.com', 'mod123');
  const modApi = await request('/api/admin/categories', cookieHeader(modCookies));
  console.log('GET /api/admin/categories:', modApi.status, modApi.status === 403 ? '✅' : '❌');
  if (modApi.status !== 403) failed = true;
  const modPage = await request('/admin-dashboard/categories', cookieHeader(modCookies));
  console.log('GET /admin-dashboard/categories:', modPage.status, 'redirect:', modPage.location, (modPage.status === 307 || modPage.location === '/') ? '✅' : '❌');
  if (modPage.status !== 307 && modPage.location !== '/') failed = true;

  console.log('\n=== Role: USER ===');
  const userCookies = await login(browser, 'demo@gateo.com', 'demo123');
  const userApi = await request('/api/admin/categories', cookieHeader(userCookies));
  console.log('GET /api/admin/categories:', userApi.status, userApi.status === 403 ? '✅' : '❌');
  if (userApi.status !== 403) failed = true;
  const userPage = await request('/admin-dashboard/categories', cookieHeader(userCookies));
  console.log('GET /admin-dashboard/categories:', userPage.status, 'redirect:', userPage.location, (userPage.status === 307 || userPage.location === '/') ? '✅' : '❌');
  if (userPage.status !== 307 && userPage.location !== '/') failed = true;

  console.log('\n=== Role: NO AUTH ===');
  const noAuthApi = await request('/api/admin/categories');
  console.log('GET /api/admin/categories:', noAuthApi.status, noAuthApi.status === 401 ? '✅' : '❌');
  if (noAuthApi.status !== 401) failed = true;
  const noAuthPage = await request('/admin-dashboard/categories');
  console.log('GET /admin-dashboard/categories:', noAuthPage.status, 'redirect:', noAuthPage.location, (noAuthPage.status === 307 || noAuthPage.location === '/login') ? '✅' : '❌');
  if (noAuthPage.status !== 307 && noAuthPage.location !== '/login') failed = true;

  await browser.close();

  if (failed) {
    console.error('\n❌ Role tests failed');
    process.exit(1);
  }
  console.log('\n✅ Role tests passed');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
