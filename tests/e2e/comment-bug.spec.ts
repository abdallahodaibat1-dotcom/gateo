import { test, expect } from '@playwright/test';

test('comment on post does not crash page', async ({ page }) => {
  page.on('pageerror', (err) => {
    throw new Error(`Page error: ${err.message}`);
  });

  // Find a real post instead of relying on a hardcoded id that changes per seed
  const res = await page.request.get('/api/posts?limit=5');
  const data = await res.json();
  const post = (data.posts || [])[0];
  test.skip(!post, 'No posts available to comment on');

  await page.goto(`/post/${post.id}`);
  await page.waitForLoadState('networkidle');
  const textarea = page.locator('textarea').first();
  await textarea.waitFor({ state: 'visible' });
  const testComment = 'تعليق اختبار playwright ' + Date.now();
  await textarea.fill(testComment);
  await page.getByRole('button', { name: 'نشر' }).first().click();
  await expect(page.getByText(testComment)).toBeVisible({ timeout: 5000 });
});
