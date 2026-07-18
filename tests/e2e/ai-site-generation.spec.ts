import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

interface CookieJar {
  [name: string]: string;
}

async function login(baseURL: string, email: string, password: string, provider: string) {
  const jar: CookieJar = {};

  const csrfRes = await fetch(`${baseURL}/api/auth/csrf`);
  const csrfData = (await csrfRes.json()) as { csrfToken: string };
  collectCookies(csrfRes.headers, jar);

  const body: Record<string, string> = {
    emailOrPhone: email,
    password,
    csrfToken: csrfData.csrfToken,
    callbackUrl: '/',
  };

  if (provider === 'admin-credentials') {
    body.email = email;
    delete body.emailOrPhone;
  }

  const loginRes = await fetch(`${baseURL}/api/auth/callback/${provider}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Cookie: cookieString(jar),
    },
    body: new URLSearchParams(body),
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

function toStorageState(jar: CookieJar) {
  const cookies = Object.entries(jar).map(([name, value]) => ({
    name,
    value,
    domain: 'localhost',
    path: '/',
    httpOnly: name.includes('session') || name.includes('csrf'),
    sameSite: 'Lax' as const,
  }));
  return { cookies, origins: [] as any[] };
}

test.describe('AI site generation flow', () => {
  test('user can generate a complete AI site end-to-end', async ({ page, baseURL, context }) => {
    // Create a fresh test user for this test because the Business model
    // enforces one business per user (`userId @unique`).
    const timestamp = Date.now();
    const testEmail = `ai-e2e-${timestamp}@gateo.local`;
    const testPassword = `TestPass${timestamp}!`;

    const registerRes = await fetch(`${baseURL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        firstName: 'AI',
        lastName: `E2E ${timestamp}`,
        email: testEmail,
        password: testPassword,
      }),
    });
    test.skip(!registerRes.ok, 'Failed to register fresh test user');

    // Log in as the fresh user using NextAuth credentials callback
    const jar = await login(baseURL!, testEmail, testPassword, 'credentials');
    const storageState = toStorageState(jar);
    await context.clearCookies();
    for (const cookie of storageState.cookies) {
      await context.addCookies([cookie]);
    }

    const businessName = `اختبار الذكاء الاصطناعي ${timestamp}`;

    // 1. Navigate to AI apply page while authenticated
    await page.goto('/business/apply/ai', { waitUntil: 'networkidle' });
    await page.waitForSelector('text=أدخل القليل، واحصل على موقع جاهز', { timeout: 30000 });

    // 2. Fetch a real business category
    const categoriesRes = await fetch(`${baseURL}/api/categories?type=BUSINESS`, {
      headers: { Cookie: cookieString(jar) },
    });
    test.skip(!categoriesRes.ok, 'Could not fetch business categories');
    const categoriesData = (await categoriesRes.json()) as {
      categories?: { id: string; name: string }[];
    };
    const categories = categoriesData.categories || [];
    const category = categories.find((c) => c.name.includes('أسنان')) || categories[0];
    test.skip(!category, 'No business category available for AI generation test');

    // 3. Fill the form
    await page.getByPlaceholder('مثال: عيادة الابتسامة').fill(businessName);
    await page.locator('select', { hasText: 'اختر التصنيف' }).selectOption(category.id);
    await page.getByPlaceholder('مثال: الرياض').fill('الرياض');
    await page.getByPlaceholder('مثال: عيادة أسنان متخصصة في التقويم وتبييض الأسنان...').fill(
      'عيادة أسنان متخصصة في التقويم وتبييض الأسنان'
    );

    // Brand style: professional (visible after scrolling)
    await page.getByText('احترافي وموثوق').click();

    // Submit
    await page.getByRole('button', { name: /إنشاء الموقع الذكي/ }).click();

    // 4. Wait for success state with generous timeout for image generation
    await page.waitForSelector('text=تم إنشاء موقعك بنجاح!', { timeout: 120000 });

    // 5. Extract generated site URL
    const previewLink = page.locator('a', { hasText: 'معاينة الموقع' });
    await expect(previewLink).toBeVisible({ timeout: 10000 });
    const siteUrl = await previewLink.getAttribute('href');
    expect(siteUrl).toBeTruthy();
    expect(siteUrl).toMatch(/^\/business\//);

    // 6. Visit the generated site and verify it renders
    await page.goto(siteUrl!, { waitUntil: 'networkidle' });
    await expect(page.locator('body')).toContainText(businessName, { timeout: 30000 });

    // 7. Verify generated images are present and are real images (not mock SVG placeholders)
    await page.waitForLoadState('networkidle');
    const images = page.locator('img');
    await expect(images.first()).toBeVisible({ timeout: 15000 });
    const imageCount = await images.count();
    expect(imageCount).toBeGreaterThan(0);

    const firstImageSrc = await images.first().getAttribute('src');
    expect(firstImageSrc).toBeTruthy();
    expect(firstImageSrc).not.toMatch(/^data:image\/svg\+xml/);
  });
});
