import { test, expect } from '@playwright/test';

test.describe('Public pages', () => {
  test('home page loads with key sections', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveTitle(/Gateo/);
    await expect(page.locator('body')).toContainText(/استكشفي|Gateo/);
  });

  test('businesses listing page loads', async ({ page }) => {
    await page.goto('/businesses', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('body')).toContainText('دليل الأعمال');
    // Wait for JS hydration and API results
    await page.waitForTimeout(3000);
    const cards = page.locator('[href^="/businesses/"]').first();
    await expect(cards).toBeVisible();
  });

  test('marketplace listing page loads', async ({ page }) => {
    await page.goto('/marketplace', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('body')).toContainText('متجر Gateo');
    await page.waitForTimeout(1500);
    const firstItem = page.locator('[href^="/marketplace/"]').first();
    await expect(firstItem).toBeVisible();
  });

  test('login page renders form', async ({ page }) => {
    await page.goto('/login', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('text=تسجيل الدخول').first()).toBeVisible();
    await expect(page.locator('#login-email')).toBeVisible();
    await expect(page.locator('#login-password')).toBeVisible();
  });

  test('register page renders form', async ({ page }) => {
    await page.goto('/register', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('text=إنشاء حساب').first()).toBeVisible();
    await expect(page.locator('#register-firstName')).toBeVisible();
    await expect(page.locator('#register-email')).toBeVisible();
  });
});
