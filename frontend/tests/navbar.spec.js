import { test, expect } from "@playwright/test";
import {
  setupAPIMocks,
  loginAndVerifyOtp,
} from './helpers/auth.helpers.js';

test("Navbar works (logo, highlight, logout)", async ({ page }) => {
  test.setTimeout(60_000);

  await setupAPIMocks(page);

  const email = `nav_${Date.now()}@domain.com`;
  const password = "Password8!";

  // Login and complete OTP to get to dashboard
  await loginAndVerifyOtp(page, { email, password });

  await page.setViewportSize({ width: 1280, height: 720 });

  // Navbar should be visible on the dashboard
  await expect(page.getByLabel("home")).toBeVisible({ timeout: 15000 });
  await expect(page.getByLabel("logout")).toBeVisible({ timeout: 15000 });

  // Click Payment Methods -> /payment-methods
  await page.getByTestId("nav-payment-methods").click();
  await expect(page).toHaveURL(/\/payment-methods/);

  // Click Transactions -> /transactions
  await page.getByTestId("nav-transactions").click();
  await expect(page).toHaveURL(/\/transactions/);

  // Click My Cards -> /cards
  await page.getByTestId("nav-my-cards").click();
  await expect(page).toHaveURL(/\/cards/);

  // Click Reports -> /reports
  await page.getByTestId("nav-reports").click();
  await expect(page).toHaveURL(/\/reports/);

  // Click Settings -> /settings
  await page.getByTestId("nav-settings").click();
  await expect(page).toHaveURL(/\/settings/);

  // Click logo/home -> /
  await page.getByLabel("home").click();
  await expect(page).toHaveURL(/\/$/);

  // Logout -> /login
  await page.getByLabel("logout").click();
  await expect(page).toHaveURL(/\/login/);
});
