import { test, expect } from '@playwright/test';

test('comment on post does not crash page', async ({ page }) => {
  page.on('pageerror', (err) => {
    throw new Error(`Page error: ${err.message}`);
  });
  await page.goto('/post/cmqfnq8gz001k7v67zysig5ok');
  await page.waitForLoadState('networkidle');
  const textarea = page.locator('textarea').first();
  await textarea.waitFor({ state: 'visible' });
  const testComment = 'تعليق اختبار playwright ' + Date.now();
  await textarea.fill(testComment);
  await page.getByRole('button', { name: 'نشر' }).first().click();
  await expect(page.getByText(testComment)).toBeVisible({ timeout: 5000 });
});
