import { test, expect } from '@playwright/test';

test.describe('Admin dashboard', () => {
  test('admin dashboard overview loads', async ({ page }) => {
    await page.goto('/admin-dashboard', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1500);
    await expect(page.locator('body')).toContainText('لوحة التحكم');
  });

  test('admin users page loads', async ({ page }) => {
    await page.goto('/admin-dashboard/users', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1500);
    await expect(page.locator('body')).toContainText('المستخدمين');
  });

  test('admin businesses page loads', async ({ page }) => {
    await page.goto('/admin-dashboard/businesses', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1500);
    await expect(page.locator('body')).toContainText('الأعمال');
  });

  test('admin bookings page loads', async ({ page }) => {
    await page.goto('/admin-dashboard/bookings', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1500);
    await expect(page.locator('body')).toContainText('الحجوزات');
  });

  test('admin audit logs page loads', async ({ page }) => {
    await page.goto('/admin-dashboard/audit-logs', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('body')).toContainText('سجل المراجعة', { timeout: 10000 });
  });
});
