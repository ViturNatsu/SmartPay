import { test, expect } from '@playwright/test';
import {
  setupAPIMocks,
  fillRegisterForm,
} from './helpers/auth.helpers.js';

test.describe.configure({ mode: 'serial' });

let sharedPage;
let sharedEmail;

test.beforeAll(async ({ browser }) => {
  sharedPage = await browser.newPage();
  await setupAPIMocks(sharedPage);
  sharedEmail = `verify_${Date.now()}@domain.com`;
});

test.afterAll(async () => {
  await sharedPage.close();
});

test('user can register successfully and receives verification page', async () => {
  await fillRegisterForm(sharedPage, { email: sharedEmail, password: 'Password8!' });

  // After successful registration the app navigates to /verify
  await expect(sharedPage).toHaveURL(/\/verify/, { timeout: 10000 });
});

test('user can verify email with code', async () => {
  // Enter a 7-digit verification code (mock always accepts)
  await sharedPage.getByRole('textbox').fill('1234567');
  await sharedPage.getByRole('button', { name: 'Verify Code' }).click();

  // For register type, VerifyOtp shows success then navigates to /login after 2s
  await expect(sharedPage).toHaveURL(/\/login/, { timeout: 15_000 });
});

test("user can't re-enter used code", async () => {
  // Navigate back to the verify page manually
  await sharedPage.goto(`/verify?email=${encodeURIComponent(sharedEmail)}&type=register`);

  // Override the OTP verify route to return 401 (expired/used code)
  // unroute first, then re-route
  await sharedPage.unroute('**/api/v1/otp/verify');
  await sharedPage.route('**/api/v1/otp/verify', async (route) => {
    if (route.request().method() === 'OPTIONS') {
      await route.fulfill({ status: 204 });
      return;
    }
    await route.fulfill({
      status: 401,
      contentType: 'application/json',
      body: JSON.stringify({ message: 'Code has expired or was already used.' }),
    });
  });

  await sharedPage.getByRole('textbox').fill('1234567');
  await sharedPage.getByRole('button', { name: 'Verify Code' }).click();

  // VerifyOtp.jsx shows "Code has expired or was already used." for status 401
  await expect(sharedPage.getByText('Code has expired or was already used.')).toBeVisible({ timeout: 10000 });
  await expect(sharedPage).toHaveURL(/\/verify/);
});
