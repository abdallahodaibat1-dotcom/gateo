import { test, expect } from '@playwright/test';

test.describe('Wallet & payments', () => {
  test('wallet page loads', async ({ page }) => {
    await page.goto('/finance/wallet', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('body')).toContainText('المحفظة', { timeout: 10000 });
  });

  test('deposit via API creates a completed transaction', async ({ page, baseURL }) => {
    const res = await page.request.post(`${baseURL}/api/finance/wallet/deposit`, {
      data: { amount: 10, currency: 'USD' },
    });
    expect(res.status()).toBe(201);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.transaction.status).toBe('COMPLETED');
    expect(Number(data.account.balance)).toBeGreaterThanOrEqual(10);
  });
});
