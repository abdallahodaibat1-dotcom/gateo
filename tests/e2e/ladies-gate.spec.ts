import { test, expect } from '@playwright/test';

test.describe('Ladies Gate / Public gate', () => {
  test('ladies gate page loads categories and businesses', async ({ page }) => {
    await page.goto('/ladies-gate', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2500);
    await expect(page.locator('body')).toContainText('البوابة العامة');
    await expect(page.locator('body')).toContainText('التصنيفات');
    // At least one category card should be visible
    const categoryLinks = page.locator('a[href^="/ladies-gate/"]');
    await expect(categoryLinks.first()).toBeVisible();
    // After filtering, results section should show at least one business card
    await expect(page.locator('body')).toContainText('نتيجة');
    const businessCards = page.locator('#results a[href^="/business/"]').first();
    await expect(businessCards).toBeVisible();
  });

  test('ladies gate search returns suggestions', async ({ page }) => {
    await page.goto('/ladies-gate', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);
    const searchInput = page.locator('#ladies-search');
    await expect(searchInput).toBeVisible();
    await searchInput.fill('صالون');
    await page.waitForTimeout(1000);
    // Suggestions list or results text appears
    await expect(page.locator('body')).toContainText(/اقتراحات|نتائج|صالون/);
  });

  test('category detail page loads', async ({ page }) => {
    await page.goto('/ladies-gate', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1500);
    const firstCategory = page.locator('a[href^="/ladies-gate/"]').first();
    const href = await firstCategory.getAttribute('href');
    test.skip(!href, 'No ladies gate category found');
    await page.goto(href!, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1500);
    await expect(page.locator('body')).toContainText('الأعمال');
  });
});
