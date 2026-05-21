import { expect, test } from '@playwright/test';

test('reload restores the weather page to the top navigation', async ({ page }) => {
  await page.goto('/weather/Beijing', { waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('combobox', { name: /search cities/i })).toBeVisible();

  await page.evaluate(() => window.scrollTo(0, 1200));
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(500);

  await page.reload({ waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('combobox', { name: /search cities/i })).toBeVisible();
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeLessThan(20);
});

test('saved city cache can switch between Sydney AU and Beijing', async ({ page, context, baseURL }) => {
  const origin = new URL(baseURL ?? 'https://weather.theunknownfish.com').origin;
  const savedCities = [
    { name: 'Beijing', country: 'CN', latitude: 39.9042, longitude: 116.4074 },
    { name: 'Sydney', country: 'AU', latitude: -33.8688, longitude: 151.2093 },
  ];

  await context.addCookies([
    {
      name: 'city',
      value: encodeURIComponent(JSON.stringify(savedCities)),
      url: origin,
    },
  ]);

  await page.goto('/weather/Sydney', { waitUntil: 'domcontentloaded' });

  await expect(page.getByText('Sydney').first()).toBeVisible();
  await expect(page.getByText('AU').first()).toBeVisible();

  await page.getByRole('button', { name: /switch weather focus to beijing/i }).click();
  await expect(page.getByText('Beijing').first()).toBeVisible();
});
