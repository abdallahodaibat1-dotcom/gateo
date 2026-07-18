import { prisma } from '../src/lib/db';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const EMAIL = process.env.TEST_EMAIL || 'user-1@realistic.gateo.com';
const PASSWORD = process.env.TEST_PASSWORD || 'demo123';
const TEST_SLUG = 'intro-design-demo-' + Date.now();

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

async function main() {
  const jar = await login(EMAIL, PASSWORD);

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
    name: 'Intro Design Demo',
    slug: TEST_SLUG,
    description: 'موقع تعريفي تجريبي لاختبار مكتبة التصاميم.',
    categoryId: category.id,
    acceptedTerms: true,
    websiteType: 'INTRO',
    designId: 'intro-medical',
    themeColors: {
      primaryColor: '#0ea5e9',
      secondaryColor: '#14b8a6',
      accentColor: '#f97316',
      backgroundColor: '#f8fafc',
      surfaceColor: '#ffffff',
      textColor: '#0f172a',
    },
    logo: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=400&h=400&fit=crop',
    cover: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1600&h=900&fit=crop',
    services: [
      {
        name: 'استشارة طبية',
        description: 'استشارة طبية شاملة مع أخصائي.',
        price: 200,
        duration: 60,
        image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600&h=600&fit=crop',
      },
    ],
    countryId: country.id,
    city: 'جدة',
    address: '123 Medical Street, جدة',
    phone: '+123 5678 890',
    email: 'demo@intro-design.gateo.com',
    workingHours: [
      { day: 'Mon - Sun', open: '9:00 AM', close: '5:00 PM' },
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

  const business = await prisma.business.findUnique({
    where: { slug: TEST_SLUG },
    include: { BusinessTheme: true },
  });
  if (!business?.BusinessTheme) throw new Error('Theme not created');

  if (subcategory) {
    await prisma.businessSubcategory.create({
      data: { businessId: business.id, subcategoryId: subcategory.id },
    });
  }

  console.log('✅ Intro site created:', TEST_SLUG);
  console.log('🎨 Theme record:', {
    designId: business.BusinessTheme.designId,
    presetId: business.BusinessTheme.presetId,
    homeTemplate: business.BusinessTheme.homeTemplate,
  });

  if (business.BusinessTheme.designId !== 'intro-medical') {
    throw new Error(`Expected designId intro-medical, got ${business.BusinessTheme.designId}`);
  }
  if (business.BusinessTheme.homeTemplate !== 'default') {
    throw new Error(`Expected homeTemplate default for intro, got ${business.BusinessTheme.homeTemplate}`);
  }

  console.log('✅ Intro design flow test passed');
  await prisma.$disconnect();
}

main().catch(async (err) => {
  console.error('❌ Test failed:', err);
  await prisma.$disconnect();
  process.exit(1);
});
