import { test, expect } from '@playwright/test';
import {
    setupAPIMocks,
    fillLoginForm,
    loginAndVerifyOtp,
} from './helpers/auth.helpers.js';

test.describe('Login Flow', () => {
    /**
     * Happy-path: Login → OTP verification → Dashboard.
     * Full end-to-end login journey.
     */
    test('user can login with valid credentials and complete OTP', async ({ page }) => {
        await setupAPIMocks(page);

        const email = `login_${Date.now()}@domain.com`;
        const password = 'Password8!';

        await loginAndVerifyOtp(page, { email, password });

        // Should be on the dashboard, not on login, verify, or register
        await expect(page).not.toHaveURL(/\/login/);
        await expect(page).not.toHaveURL(/\/verify/);
        await expect(page).not.toHaveURL(/\/register/);
    });

    /**
     * Negative test: Invalid credentials → error message shown.
     */
    test('shows error message for invalid credentials', async ({ page }) => {
        // Mock login to return 401
        await page.route('**/api/v1/auth/login', async (route) => {
            if (route.request().method() === 'OPTIONS') {
                await route.fulfill({ status: 204 });
                return;
            }
            await route.fulfill({
                status: 401,
                contentType: 'application/json',
                body: JSON.stringify({ message: 'Invalid credentials' }),
            });
        });

        await fillLoginForm(page, {
            email: 'nonexistent_user@domain.com',
            password: 'WrongPass123!',
        });

        await expect(
            page.getByText('Incorrect email or password. Please try again.'),
        ).toBeVisible({ timeout: 10_000 });

        await expect(page).toHaveURL(/\/login/);
    });

    /**
     * Negative test: Empty form submission → validation errors.
     */
    test('shows validation error when form is submitted empty', async ({ page }) => {
        await page.goto('/login');

        await page.getByRole('button', { name: /^Sign In$/i }).click();

        await expect(
            page.getByText("Email is required. Can't be left blank."),
        ).toBeVisible();
    });
});
