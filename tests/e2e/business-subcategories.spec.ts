import { test, expect } from '@playwright/test';

test('select multiple subcategories and a custom one during business apply', async ({ page }) => {
  page.on('pageerror', (err) => {
    throw new Error(`Page error: ${err.message}`);
  });

  await page.goto('/business/apply');
  await page.waitForLoadState('networkidle');

  // Phase 1: choose a plan
  const planButton = page.locator('button:has-text("اختيار الخطة")').first();
  await planButton.waitFor({ state: 'visible' });
  await planButton.click();

  // Wait for design phase
  await expect(page.getByRole('heading', { name: 'التصنيف الرئيسي' }).first()).toBeVisible({ timeout: 5000 });

  // Select main category
  const categorySelect = page.locator('select#setup-category');
  await categorySelect.waitFor({ state: 'visible' });
  // Pick the second option (first is placeholder)
  const options = await categorySelect.locator('option').allTextContents();
  if (options.length > 1) {
    await categorySelect.selectOption({ index: 1 });
  }

  // Wait for subcategory chips
  const chips = page.locator('[data-testid="subcategory-chip"]');
  await chips.first().waitFor({ state: 'visible', timeout: 5000 });

  // Click first two subcategory chips
  const selectedNames: string[] = [];
  for (let i = 0; i < 2; i++) {
    const chip = chips.nth(i);
    if (!(await chip.isVisible().catch(() => false))) break;
    const text = await chip.textContent();
    if (text) selectedNames.push(text.trim());
    await chip.click();
  }

  // Add a custom subcategory
  const customName = 'تخصص مخصص اختبار';
  const input = page.locator('input[placeholder*="تصنيف فرعي"]').first();
  await input.waitFor({ state: 'visible' });
  await input.fill(customName);
  await input.press('Enter');

  // Verify selected chips are visible
  for (const name of selectedNames) {
    await expect(page.locator(`text=${name}`).first()).toBeVisible();
  }
  await expect(page.locator(`text=${customName}`).first()).toBeVisible();
});
