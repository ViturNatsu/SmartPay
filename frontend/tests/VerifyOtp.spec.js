// @ts-check
import { test, expect } from '@playwright/test';

test('verifies that sendVerifyCode API is called on form submission', async ({ page }) => {
  // Intercept the API call to /api/v1/otp/verify
  let apiCalled = false;
  await page.route('http://localhost:8080/api/v1/otp/verify', async route => {
    apiCalled = true;
    // Mock a successful response
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token'
      })
    });
  });

  // Navigate to the verify page with required params
  await page.goto('/verify?email=test@example.com&type=login');

  // Fill in the 7-digit code
  await page.getByLabel('7-digit code').fill('1234567');

  // Click the submit button
  await page.getByRole('button', { name: 'Verify Code' }).click();

  // Wait for the API call to be made
  await page.waitForTimeout(100); // Small delay to ensure async operations

  // Assert that the API was called
  expect(apiCalled).toBe(true);
});