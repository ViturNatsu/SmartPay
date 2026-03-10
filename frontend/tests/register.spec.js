import { test, expect } from "@playwright/test";
import { setupAPIMocks, fillRegisterForm } from "./helpers/auth.helpers.js";

test("user can register successfully", async ({ page }) => {
  await setupAPIMocks(page);

  const email = `name_${Date.now()}@domain.com`;
  await fillRegisterForm(page, { email, password: 'Password8!', confirmPassword: 'Password8!' });

  // After successful registration the app navigates to /verify
  await expect(page).toHaveURL(/\/verify/, { timeout: 10000 });
});

test("user cannot register with duplicate email", async ({ page }) => {
  test.setTimeout(30_000);

  // Mock register to return 409 (duplicate email)
  await page.route('**/api/v1/auth/register', async (route) => {
    if (route.request().method() === 'OPTIONS') {
      await route.fulfill({ status: 204 });
      return;
    }
    await route.fulfill({
      status: 409,
      contentType: 'application/json',
      body: JSON.stringify({ message: 'Email already in use', status: 409 }),
    });
  });

  await fillRegisterForm(page, { email: 'dup@domain.com', password: 'Password8!', confirmPassword: 'Password8!' });

  // Scroll to top to see the error alert
  await page.evaluate(() => window.scrollTo(0, 0));

  // After 409 the app shows the duplicate email error — two alerts are rendered:
  // 1. The "We can't create an account with that email" box (role=alert)
  // 2. The "That email is already in use." typography (role=alert)
  // Check for the specific duplicate-email text to avoid a strict-mode violation.
  await expect(
    page.getByText(/email is already in use|create an account with that email/i).first()
  ).toBeVisible({ timeout: 15000 });
});

test("user cannot register with invalid email", async ({ page }) => {
  await fillRegisterForm(page, { email: 'noaddress@test', password: 'Password8!', confirmPassword: 'Password8!' }, { stopAtStep1: true });

  // The app shows "Email must match required format." in the error alert
  await expect(
    page.getByText('Email must match required format.').first()
  ).toBeVisible({ timeout: 5000 });
});

test("user cannot register with invalid password", async ({ page }) => {
  await fillRegisterForm(page, { email: 'name@domain.com', password: 'Pass', confirmPassword: 'Pass' }, { stopAtStep1: true });

  // The app shows the password requirements error
  await expect(
    page.getByText(/Password must be at least 8 characters/i).first()
  ).toBeVisible({ timeout: 5000 });
});

test("user cannot register when passwords do not match", async ({ page }) => {
  await fillRegisterForm(page, { email: 'name@domain.com', password: 'Password8!', confirmPassword: 'Password9!' }, { stopAtStep1: true });

  // Assertion — use .first() because "Passwords must match" appears in multiple places
  await expect(
    page.getByText('Passwords must match').first()
  ).toBeVisible({ timeout: 5000 });
});

test("user cannot register more than 5 times in one minute", async ({ page }) => {
  test.setTimeout(30_000);

  // Mock the register endpoint to return 429 (rate limited)
  await page.route('**/api/v1/auth/register', async (route) => {
    if (route.request().method() === 'OPTIONS') {
      await route.fulfill({ status: 204 });
      return;
    }
    await route.fulfill({
      status: 429,
      contentType: 'application/json',
      body: JSON.stringify({ message: 'Too many requests.', status: 429 }),
    });
  });

  // Fill the full form and submit — the 429 sets apiErrorMessage
  await fillRegisterForm(page, { email: 'ratelimit@domain.com', password: 'Password8!', confirmPassword: 'Password8!' });

  // The apiErrorMessage renders on Step 2 after API error.
  // It should be visible right there on Step 2
  await expect(page.getByText(/We can't process your request right now/i)).toBeVisible({ timeout: 10000 });
});