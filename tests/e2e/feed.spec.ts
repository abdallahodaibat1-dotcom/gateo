import { test, expect } from '@playwright/test';

test.describe('Authenticated user pages', () => {
  test('feed page loads for authenticated user', async ({ page }) => {
    await page.goto('/feed', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1500);
    await expect(page.locator('body')).toContainText('المنشورات');
  });

  test('profile page shows user info', async ({ page }) => {
    await page.goto('/profile/me', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1500);
    await expect(page.locator('body')).toContainText(/الملف الشخصي|المتابعون/);
  });

  test('conversations page loads', async ({ page }) => {
    await page.goto('/conversations', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);
    await expect(page.locator('body')).toContainText('المحادثات');
  });

  test('bookings page loads', async ({ page }) => {
    await page.goto('/bookings', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);
    await expect(page.locator('body')).toContainText('حجوزاتي');
  });

  test('saved posts page loads', async ({ page }) => {
    await page.goto('/saved', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);
    await expect(page.locator('body')).toContainText(/المنشورات المحفوظة|المحفوظات/);
  });
});
