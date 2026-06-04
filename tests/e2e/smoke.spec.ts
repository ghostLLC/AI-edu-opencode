import { expect, test } from '@playwright/test';

// Basic smoke tests for the skeleton.
// These verify the build works and the i18n + auth routes render.
// Real auth / data flow tests will be added in Week 2.

test.describe('Smoke', () => {
  test('landing page loads with hero heading', async ({ page }) => {
    await page.goto('/en');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  test('sign-in page renders form (en)', async ({ page }) => {
    await page.goto('/en/sign-in');
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
  });

  test('sign-in page renders form (zh)', async ({ page }) => {
    await page.goto('/zh/sign-in');
    await expect(page.getByLabel(/邮箱/)).toBeVisible();
    await expect(page.getByLabel(/密码/)).toBeVisible();
    await expect(page.getByRole('button', { name: /登录/ })).toBeVisible();
  });

  test('protected route redirects to sign-in when not authenticated', async ({ page }) => {
    await page.goto('/en/dashboard');
    await expect(page).toHaveURL(/\/sign-in/);
  });
});
