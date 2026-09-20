import { test, expect } from '@playwright/test';
test('starter page connects to the API', async ({ page, request }) => {
  await expect
    .poll(async () => {
      try {
        return (await request.get('http://localhost:5000/api/health')).status();
      } catch {
        return 0;
      }
    })
    .toBe(200);
  await page.goto('/');
  await expect(
    page.getByRole('heading', { name: 'Tempest Leads' }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Check API connection' }).click();
  await expect(page.getByRole('status')).toHaveText('API connected');
});
