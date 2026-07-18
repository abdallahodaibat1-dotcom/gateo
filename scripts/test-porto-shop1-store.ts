import { prisma } from '../src/lib/db';
import { chromium } from 'playwright';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const EMAIL = process.env.TEST_EMAIL || 'user-1@realistic.gateo.com';
const PASSWORD = process.env.TEST_PASSWORD || 'demo123';
const TEST_SLUG = 'porto-shop1-demo-' + Date.now();

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

const fashionProducts = [
  {
    name: 'New Balance Fresh Foam',
    description: 'حذاء رياضي مريح بتقنية Fresh Foam للركض والمشي اليومي',
    price: 199,
    comparePrice: 399,
    quantity: 50,
    category: 'Cloth, Watches',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=600&fit=crop',
    hoverImage: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=600&h=600&fit=crop',
    rating: 5,
  },
  {
    name: "Women's Jumper",
    description: 'سويتر نسائي أنيق ودافئ مناسب للخروج والعمل',
    price: 88,
    comparePrice: 199,
    quantity: 80,
    category: 'Dress, Trousers',
    image: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=600&h=600&fit=crop',
    hoverImage: 'https://images.unsplash.com/photo-1516762689617-e1cffcef479d?w=600&h=600&fit=crop',
    rating: 4,
  },
  {
    name: 'Leather women Tote Bag',
    description: 'حقيبة يد جلدية فاخرة بمساحة واسعة للاستخدام اليومي',
    price: 88,
    comparePrice: 99,
    quantity: 35,
    category: 'Dress, Trousers',
    image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&h=600&fit=crop',
    hoverImage: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=600&h=600&fit=crop',
    rating: 5,
  },
  {
    name: 'Sky Blue Women Suits',
    description: 'بدلة نسائية باللون السماوي مناسبة للعمل والمناسبات',
    price: 88,
    comparePrice: 99,
    quantity: 25,
    category: 'Dress, Trousers',
    image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&h=600&fit=crop',
    hoverImage: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=600&h=600&fit=crop',
    rating: 3.67,
  },
  {
    name: 'Beach Force Sunglasses',
    description: 'نظارات شمسية عصرية بحماية UV400 للشاطئ والخروج',
    price: 299,
    quantity: 60,
    category: 'Accessories',
    image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600&h=600&fit=crop',
    hoverImage: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=600&h=600&fit=crop',
    rating: 4.5,
  },
  {
    name: "Men's Showtheway Shoes",
    description: 'حذاء كاجوال رجالي أنيق للإطلالة اليومية',
    price: 55,
    quantity: 100,
    category: 'Shoes',
    image: 'https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?w=600&h=600&fit=crop',
    hoverImage: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&h=600&fit=crop',
    rating: 4,
  },
  {
    name: 'Batwing Sleeve Romper',
    description: 'أوفرول نسائي بأكمام خفاشية مناسب للصيف',
    price: 259,
    comparePrice: 299,
    quantity: 40,
    category: 'Dress',
    image: 'https://images.unsplash.com/photo-1502716119720-b23a93e5fe1b?w=600&h=600&fit=crop',
    hoverImage: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=600&h=600&fit=crop',
    rating: 4,
  },
  {
    name: "Men's Shoulder Bags",
    description: 'حقيبة كتف رجالية عملية وأنيقة للعمل والجامعة',
    price: 299,
    quantity: 30,
    category: 'Bags',
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&h=600&fit=crop',
    hoverImage: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&h=600&fit=crop',
    rating: 4,
  },
  {
    name: 'Panelled Lace-Up Sneakers',
    description: 'حذاء رياضي برباط بتصميم متعدد الألوان',
    price: 101,
    comparePrice: 111,
    quantity: 70,
    category: 'Shoes',
    image: 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=600&h=600&fit=crop',
    hoverImage: 'https://images.unsplash.com/photo-1607522370275-f14206abe5d3?w=600&h=600&fit=crop',
    rating: 4.5,
  },
];

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

  const products = fashionProducts.map((p) => ({
    name: p.name,
    description: p.description,
    price: p.price,
    comparePrice: p.comparePrice || undefined,
    quantity: p.quantity,
    category: p.category,
    image: p.image,
  }));

  const body = {
    name: 'Porto Shop1 Fashion',
    slug: TEST_SLUG,
    description: 'متجر أزياء تجريبي مستوحى من قالب Porto Shop1 الأصلي. نقدم تشكيلة واسعة من الأزياء والإكسسوارات والأحذية بجودة عالية وأسعار مميزة.',
    categoryId: category.id,
    subcategoryIds: subcategory ? [subcategory.id] : [],
    acceptedTerms: true,
    websiteType: 'STORE',
    designId: 'store-porto-shop1',
    logo: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=400&h=400&fit=crop',
    cover: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600&h=900&fit=crop',
    gallery: [
      'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800&h=600&fit=crop',
    ],
    products,
    countryId: country.id,
    city: 'الرياض',
    address: '123 Street Name, الرياض، المملكة العربية السعودية',
    phone: '+123 5678 890',
    email: 'contact@portoshop1-demo.gateo.com',
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
  await page.waitForTimeout(4000);

  const screenshotPath = `scripts/test-porto-shop1-store.png`;
  await page.screenshot({ path: screenshotPath, fullPage: true });
  console.log('📸 Screenshot saved:', screenshotPath);

  const checks = {
    storeName: await page.locator('text=Porto Shop1 Fashion').first().isVisible().catch(() => false),
    heroTitle: await page.locator('text=Summer Sale').first().isVisible().catch(() => false),
    product1: await page.locator('text=New Balance Fresh Foam').first().isVisible().catch(() => false),
    product2: await page.locator('text=Women').first().isVisible().catch(() => false),
    product3: await page.locator('text=Leather women Tote Bag').first().isVisible().catch(() => false),
    featuredSection: await page.locator('text=Featured Products').first().isVisible().catch(() => false),
    topRatedSection: await page.locator('text=Top Rated Products').first().isVisible().catch(() => false),
    footerContact: await page.locator('text=Contact Info').first().isVisible().catch(() => false),
  };

  await browser.close();
  return checks;
}

async function main() {
  console.log('🔑 Logging in as test user...');
  const jar = await login(EMAIL, PASSWORD);

  console.log('🛒 Creating Porto Shop1 fashion demo store...');
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
