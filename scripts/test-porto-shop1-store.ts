import { prisma } from '../src/lib/db';
import { chromium } from 'playwright';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const EMAIL = process.env.TEST_EMAIL || 'user-1@realistic.gateo.com';
const PASSWORD = process.env.TEST_PASSWORD || 'demo123';
const TEST_SLUG = 'porto-test-' + Date.now();

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

async function applyStore(jar: CookieJar) {
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

  const products = [
    {
      name: 'قص شعر احترافي',
      description: 'قص شعر متكامل مع غسيل وتصفيف',
      price: 120,
      comparePrice: 150,
      quantity: 100,
      category: 'قص الشعر',
      image: 'https://picsum.photos/seed/haircut/600/600',
    },
    {
      name: 'صبغة شعر كاملة',
      description: 'صبغة شعر بألوان متعددة بجودة عالية',
      price: 250,
      comparePrice: 300,
      quantity: 50,
      category: 'الصبغات',
      image: 'https://picsum.photos/seed/coloring/600/600',
    },
    {
      name: 'تركيب اظافر',
      description: 'تركيب اظافر اكريليك مع طلاء',
      price: 180,
      quantity: 80,
      category: 'الأظافر',
      image: 'https://picsum.photos/seed/nails/600/600',
    },
  ];

  const body = {
    name: 'صالون بوتو تست',
    slug: TEST_SLUG,
    description: 'متجر تجريبي لاختبار قالب بوتو شوب ١',
    categoryId: category.id,
    subcategoryId: subcategory?.id || undefined,
    acceptedTerms: true,
    websiteType: 'STORE',
    themePresetId: 'beauty',
    homeTemplate: 'porto-shop1',
    logo: 'https://picsum.photos/seed/logo/400/400',
    cover: 'https://picsum.photos/seed/cover/1600/900',
    gallery: [
      'https://picsum.photos/seed/g1/800/600',
      'https://picsum.photos/seed/g2/800/600',
    ],
    products,
    countryId: country.id,
    city: 'الرياض',
    address: 'شارع التجريبي، الرياض',
    phone: '0512345678',
    email: 'test@porto-shop1.gateo.com',
    workingHours: [
      { day: 'السبت', open: '09:00', close: '21:00' },
      { day: 'الأحد', open: '09:00', close: '21:00' },
      { day: 'الإثنين', open: '09:00', close: '21:00' },
      { day: 'الثلاثاء', open: '09:00', close: '21:00' },
      { day: 'الأربعاء', open: '09:00', close: '21:00' },
      { day: 'الخميس', open: '09:00', close: '21:00' },
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
  console.log('✅ Store created:', data.business?.slug || TEST_SLUG);
  return TEST_SLUG;
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
  await page.waitForTimeout(3000);

  const screenshotPath = `scripts/test-porto-shop1-store.png`;
  await page.screenshot({ path: screenshotPath, fullPage: true });
  console.log('📸 Screenshot saved:', screenshotPath);

  const checks = {
    storeName: await page.locator('text=صالون بوتو تست').first().isVisible().catch(() => false),
    product1: await page.locator('text=قص شعر احترافي').first().isVisible().catch(() => false),
    product2: await page.locator('text=صبغة شعر كاملة').first().isVisible().catch(() => false),
    product3: await page.locator('text=تركيب اظافر').first().isVisible().catch(() => false),
    price: await page.locator('text=120').first().isVisible().catch(() => false),
    addToCart: await page.locator('text=أضف للسلة').first().isVisible().catch(() => false),
  };

  await browser.close();
  return checks;
}

async function main() {
  console.log('🔑 Logging in as test user...');
  const jar = await login(EMAIL, PASSWORD);

  console.log('🛒 Creating test store with Porto Shop1 template...');
  const slug = await applyStore(jar);

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
