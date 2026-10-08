import { test, expect } from '@playwright/test';

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
  test('user can generate a complete AI site end-to-end via the wizard', async ({ page, baseURL, context }) => {
    // Create a fresh test user because the Business model enforces one
    // business per user (`userId @unique`).
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

    // Fetch a real business category to select in step 2
    const categoriesRes = await fetch(`${baseURL}/api/categories?type=BUSINESS`, {
      headers: { Cookie: cookieString(jar) },
    });
    test.skip(!categoriesRes.ok, 'Could not fetch business categories');
    const categoriesData = (await categoriesRes.json()) as {
      categories?: { id: string; name: string }[];
    };
    const category = categoriesData.categories?.[0];
    test.skip(!category, 'No business category available for AI generation test');

    // 1. Wizard entry point redirects to the first step
    await page.goto('/business/apply/ai', { waitUntil: 'networkidle' });
    await expect(page).toHaveURL(/ai-wizard/);
    await expect(page.getByText('معلومات النشاط')).toBeVisible();

    // 2. Step 1: business info
    await page.getByPlaceholder('مثال: عيادة الابتسامة').fill(businessName);
    // Country dropdown (custom component): focus opens the list, pick first country
    await page.getByText('اختر الدولة').click();
    await page.waitForTimeout(500);
    await page.locator('button').filter({ hasText: /🇸🇦|🇦🇪|🇪🇬|🇰🇼/ }).first().click();
    await page.getByPlaceholder('مثال: الرياض').fill('الرياض');
    await page.getByRole('button', { name: 'التالي' }).click();

    // 3. Step 2: category
    await expect(page.getByText('التصنيف')).toBeVisible();
    await page.getByRole('button', { name: new RegExp(category.name.slice(0, 6)) }).first().click();
    await page.getByRole('button', { name: 'التالي' }).click();

    // 4. Step 3: description
    await page.getByPlaceholder('نحن شركة متخصصة في...').fill('عيادة أسنان متخصصة في التقويم وتبييض الأسنان');
    await page.getByRole('button', { name: 'التالي' }).click();

    // 5. Step 4: audience
    await page.getByRole('button', { name: 'أفراد' }).first().click();
    await page.getByRole('button', { name: 'التالي' }).click();

    // 6. Step 5: personality
    await page.getByRole('button', { name: 'احترافي' }).first().click();
    await page.getByRole('button', { name: 'التالي' }).click();

    // 7. Step 6: visual identity — default ("لا، اقترح علي") is fine, finish
    await expect(page.getByText('هل لديك هوية بصرية جاهزة؟')).toBeVisible();
    await page.getByRole('button', { name: 'إنهاء' }).click();

    // 8. Analysis runs automatically and lands on the proposal page
    await expect(page).toHaveURL(/ai-proposal/, { timeout: 120000 });
    await expect(page.getByText(/ملخص التحليل/)).toBeVisible();

    // 9. Pick the first recommended design and continue to build
    await page.locator('button').filter({ hasText: 'درجة التوافق' }).first().click();
    await page.getByRole('button', { name: /متابعة لإنشاء الموقع/ }).click();

    // 10. Build page generates the site, then redirects to review
    await expect(page).toHaveURL(/ai-review/, { timeout: 180000 });
    await expect(page.getByText('معاينة الصفحة الرئيسية')).toBeVisible({ timeout: 30000 });

    // 11. Open the generated site and verify it renders the business name
    await page.getByRole('link', { name: /فتح المعاينة/ }).click();
    await expect(page.locator('body')).toContainText(businessName, { timeout: 30000 });
  });
});
