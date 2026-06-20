import { test, expect } from '@playwright/test';

test.describe('Booking flow', () => {
  test('booking page loads for an authenticated user', async ({ page, baseURL }) => {
    // Find a business from the test environment via public API
    const res = await fetch(`${baseURL}/api/businesses?limit=10`);
    test.skip(!res.ok, 'Could not fetch businesses');
    const data = (await res.json()) as { businesses: { id: string; name: string }[] };
    const business = data.businesses?.[0];
    test.skip(!business, 'No business available for booking test');

    await page.goto(`/book/${business.id}`, { waitUntil: 'domcontentloaded' });
    await expect(page.locator('body')).toContainText('حجز موعد', { timeout: 10000 });
    await expect(page.locator('body')).toContainText(business.name);
  });
});
