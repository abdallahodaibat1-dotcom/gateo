import { prisma } from '../src/lib/db';
import { chromium } from 'playwright';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const EMAIL = process.env.TEST_EMAIL || 'user-1@realistic.gateo.com';
const PASSWORD = process.env.TEST_PASSWORD || 'demo123';
const TEST_SLUG = 'design-library-demo-' + Date.now();

interface CookieJar {
  [name: string]: string;
}

async function login(email: string, password: string): Promise<CookieJar> {
  const jar: CookieJar = {};

  const csrfRes = await fetch(`${BASE_URL}/api/auth/csrf`);
  const csrfData = (await csrfRes.json()) as { csrfToken: string };
  collectCookies(csrfRes.headers, jar);

  const body = new URLSearchParams({
    emailOrPhone: email,
    password,
    csrfToken: csrfData.csrfToken,
    callbackUrl: '/',
  });

  const loginRes = await fetch(`${BASE_URL}/api/auth/callback/credentials`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Cookie: cookieString(jar),
    },
    body,
    redirect: 'manual',
  });
  collectCookies(loginRes.headers, jar);
  return jar;
}

function collectCookies(headers: Headers, jar: CookieJar) {
  const rawCookies = headers.getSetCookie?.() || [];
  for (const raw of rawCookies) {
    const [nameValue] = raw.split(';');
    const [name, ...valueParts] = nameValue.split('=');
    if (name) {
      jar[name.trim()] = valueParts.join('=').trim();
    }
  }
}

function cookieString(jar: CookieJar): string {
  return Object.entries(jar)
    .map(([k, v]) => `${k}=${v}`)
    .join('; ');
}

const logoUrl = 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=400&h=400&fit=crop';

async function applyStoreWithDesign(jar: CookieJar) {
  const user = await prisma.user.findUnique({ where: { email: EMAIL }, include: { Business: true } });
  if (!user) throw new Error('Test user not found');
  if (user.Business) {
    console.log('🧹 Removing existing business for test user:', user.Business.slug);
    await prisma.business.delete({ where: { id: user.Business.id } });
  }

  const category = await prisma.category.findFirst({ where: { type: 'BUSINESS' } });
  if (!category) throw new Error('No business category found');
  const subcategory = await prisma.subcategory.findFirst({ where: { categoryId: category.id } });
  const country = await prisma.country.findFirst();
  if (!country) throw new Error('No country found');

  const body = {
    name: 'Design Library Demo Store',
    slug: TEST_SLUG,
    description: 'متجر تجريبي لاختبار مكتبة التصاميم الجديدة واستخراج الألوان من الشعار.',
    categoryId: category.id,
    subcategoryId: subcategory?.id || undefined,
    acceptedTerms: true,
    websiteType: 'STORE',
    designId: 'store-porto-shop1',
    themeColors: {
      primaryColor: '#ec4899',
      secondaryColor: '#a855f7',
      accentColor: '#f59e0b',
      backgroundColor: '#ffffff',
      surfaceColor: '#ffffff',
      textColor: '#1a1a2e',
    },
    logo: logoUrl,
    cover: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600&h=900&fit=crop',
    gallery: [
      'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&h=600&fit=crop',
    ],
    products: [
      {
        name: 'Classic White Sneakers',
        description: 'حذاء رياضي كلاسيكي أبيض مناسب للإطلالات اليومية.',
        price: 199,
        comparePrice: 299,
        quantity: 50,
        category: 'Shoes',
        image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&h=600&fit=crop',
      },
    ],
    countryId: country.id,
    city: 'الرياض',
    address: '123 Demo Street, الرياض',
    phone: '+123 5678 890',
    email: 'demo@design-library.gateo.com',
    workingHours: [
      { day: 'Mon - Sun', open: '9:00 AM', close: '8:00 PM' },
    ],
    fieldValues: {},
  };

  const res = await fetch(`${BASE_URL}/api/businesses/apply`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: cookieString(jar),
    },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  if (!res.ok) {
    console.error('Apply response:', data);
    throw new Error(`Apply failed: ${res.status}`);
  }
  console.log('✅ Store created via designId:', data.business?.slug || TEST_SLUG);
  return TEST_SLUG;
}

async function verifyDatabase(slug: string) {
  const business = await prisma.business.findUnique({
    where: { slug },
    include: { BusinessTheme: true },
  });
  if (!business) throw new Error('Business not found in database');
  if (!business.BusinessTheme) throw new Error('BusinessTheme not created');

  console.log('🎨 Theme record:', {
    designId: business.BusinessTheme.designId,
    presetId: business.BusinessTheme.presetId,
    homeTemplate: business.BusinessTheme.homeTemplate,
    primaryColor: business.BusinessTheme.primaryColor,
    secondaryColor: business.BusinessTheme.secondaryColor,
  });

  if (business.BusinessTheme.designId !== 'store-porto-shop1') {
    throw new Error(`Expected designId store-porto-shop1, got ${business.BusinessTheme.designId}`);
  }
  if (business.BusinessTheme.homeTemplate !== 'porto-shop1') {
    throw new Error(`Expected homeTemplate porto-shop1, got ${business.BusinessTheme.homeTemplate}`);
  }
}

async function captureStore(slug: string) {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    locale: 'ar',
    viewport: { width: 1600, height: 900 },
  });
  const page = await context.newPage();

  const url = `${BASE_URL}/business/${slug}`;
  console.log('🌐 Opening store:', url);
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(4000);

  const screenshotPath = `scripts/test-design-library-flow.png`;
  await page.screenshot({ path: screenshotPath, fullPage: true });
  console.log('📸 Screenshot saved:', screenshotPath);

  const checks = {
    storeName: await page.locator('text=Design Library Demo Store').first().isVisible().catch(() => false),
    product: await page.locator('text=Classic White Sneakers').first().isVisible().catch(() => false),
  };

  await browser.close();
  return checks;
}

async function main() {
  console.log('🔑 Logging in as test user...');
  const jar = await login(EMAIL, PASSWORD);

  console.log('🛒 Creating store with designId...');
  const slug = await applyStoreWithDesign(jar);

  console.log('🗄️ Verifying database...');
  await verifyDatabase(slug);

  console.log('📷 Capturing store page...');
  const checks = await captureStore(slug);

  console.log('\n✅ Test completed successfully!');
  console.log('Store URL:', `${BASE_URL}/business/${slug}`);
  console.log('Checks:', checks);

  await prisma.$disconnect();
}

main().catch(async (err) => {
  console.error('❌ Test failed:', err);
  await prisma.$disconnect();
  process.exit(1);
});
