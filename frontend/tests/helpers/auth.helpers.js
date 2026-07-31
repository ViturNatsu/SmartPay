import { expect } from '@playwright/test';

/* ─────────────── Mock JWT Token ─────────────── */

/**
 * Creates a mock JWT that `decodeJwtPayload()` in AuthContext can parse.
 * A JWT = header.payload.signature (all base64url-encoded JSON).
 */
function makeMockJwt(email = 'test@domain.com') {
    const header = { alg: 'HS256', typ: 'JWT' };
    const payload = {
        sub: '1',
        email,
        role: 'USER',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour from now
    };
    const b64url = (obj) =>
        Buffer.from(JSON.stringify(obj))
            .toString('base64')
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=+$/, '');
    return `${b64url(header)}.${b64url(payload)}.mock-signature`;
}

const MOCK_ACCESS_TOKEN = makeMockJwt();
const MOCK_REFRESH_TOKEN = 'mock-refresh-token-value';

/* ─────────────── CORS Headers ─────────────── */

function corsHeaders() {
    return {
        'Access-Control-Allow-Origin': 'http://localhost:5173',
        'Access-Control-Allow-Credentials': 'true',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, Accept, Origin, X-Requested-With',
    };
}

/* ─────────────── API Mocking ─────────────── */

/**
 * Sets up route mocks for ALL backend API calls so tests are fully
 * self-contained and don't require a running backend.
 */
export async function setupAPIMocks(page) {
    const mocks = { lastRegisterPayload: null };

    // ── Register ──
    await page.route('**/api/v1/auth/register', async (route) => {
        if (route.request().method() === 'OPTIONS') {
            await route.fulfill({ status: 204, headers: corsHeaders() });
            return;
        }
        mocks.lastRegisterPayload = route.request().postDataJSON();
        await route.fulfill({
            status: 200,
            contentType: 'application/json',
            headers: corsHeaders(),
            body: JSON.stringify({
                accessToken: MOCK_ACCESS_TOKEN,
                refreshToken: MOCK_REFRESH_TOKEN,
                message: 'Registration successful',
            }),
        });
    });

    // ── OTP Verify ──
    await page.route('**/api/v1/otp/verify', async (route) => {
        if (route.request().method() === 'OPTIONS') {
            await route.fulfill({ status: 204, headers: corsHeaders() });
            return;
        }
        await route.fulfill({
            status: 200,
            contentType: 'application/json',
            headers: corsHeaders(),
            body: JSON.stringify({
                accessToken: MOCK_ACCESS_TOKEN,
                refreshToken: MOCK_REFRESH_TOKEN,
                message: 'Verification successful',
            }),
        });
    });

    // ── OTP Request (requestResetCode) ──
    await page.route('**/api/v1/otp', async (route) => {
        if (route.request().method() === 'OPTIONS') {
            await route.fulfill({ status: 204, headers: corsHeaders() });
            return;
        }
        await route.fulfill({
            status: 200,
            contentType: 'application/json',
            headers: corsHeaders(),
            body: JSON.stringify({ message: 'OTP sent successfully' }),
        });
    });

    // ── Login ──
    await page.route('**/api/v1/auth/login', async (route) => {
        if (route.request().method() === 'OPTIONS') {
            await route.fulfill({ status: 204, headers: corsHeaders() });
            return;
        }
        await route.fulfill({
            status: 200,
            contentType: 'application/json',
            headers: corsHeaders(),
            body: JSON.stringify({
                accessToken: MOCK_ACCESS_TOKEN,
                refreshToken: MOCK_REFRESH_TOKEN,
            }),
        });
    });

    // ── Logout ──
    await page.route('**/api/v1/auth/logout', async (route) => {
        if (route.request().method() === 'OPTIONS') {
            await route.fulfill({ status: 204, headers: corsHeaders() });
            return;
        }
        await route.fulfill({
            status: 200,
            contentType: 'application/json',
            headers: corsHeaders(),
            body: JSON.stringify({ message: 'Logged out' }),
        });
    });

    // ── Refresh Token ──
    await page.route('**/api/v1/auth/refresh', async (route) => {
        if (route.request().method() === 'OPTIONS') {
            await route.fulfill({ status: 204, headers: corsHeaders() });
            return;
        }
        await route.fulfill({
            status: 200,
            contentType: 'application/json',
            headers: corsHeaders(),
            body: JSON.stringify({
                accessToken: MOCK_ACCESS_TOKEN,
                refreshToken: MOCK_REFRESH_TOKEN,
            }),
        });
    });

    // ── Keep-alive ──
    await page.route('**/api/v1/auth/keep-alive', async (route) => {
        await route.fulfill({
            status: 200,
            contentType: 'application/json',
            headers: corsHeaders(),
            body: JSON.stringify({ message: 'ok' }),
        });
    });

    // ── Customer details (getMyUser) ──
    await page.route('**/api/v1/customer*', async (route) => {
        if (route.request().method() === 'OPTIONS') {
            await route.fulfill({ status: 204, headers: corsHeaders() });
            return;
        }
        await route.fulfill({
            status: 200,
            contentType: 'application/json',
            headers: corsHeaders(),
            body: JSON.stringify({
                id: 1,
                email: 'test@domain.com',
                firstName: 'John',
                lastName: 'Doe',
                role: 'USER',
                socialInsuranceNumber: '123456789',
                occupation: 'Engineer',
                governmentIdType: 'PASSPORT',
                governmentIdNumber: 'AB1234567',
                dob: '1990-01-15',
                phoneNumber: '6135550100',
                addressLine1: '123 Main Street',
                addressLine2: '',
                city: 'Ottawa',
                province: 'ON',
                postalCode: 'K1A0B1',
                country: 'Canada',
                institution: 'FDM Bank',
            }),
        });
    });

    // http://localhost:8080/api/v1/wallets
    // ── Wallet details (getMyWallet) ── 
    await page.route('**/api/v1/wallets/*', async (route) => {
        if (route.request().method() === 'OPTIONS') {
            await route.fulfill({ status: 204, headers: corsHeaders() });
            return;
        }
        await route.fulfill({
            contentType: 'application/json',
            headers: corsHeaders(),
            body: JSON.stringify({"wallet_id":1,"balance":0.0}),
        });
    }); 

    // http://localhost:8080/api/v1/cards
    // ── Card details (getMyCard) ──
    await page.route('**/api/v1/cards/*', async (route) => {
        if (route.request().method() === 'OPTIONS') {
            await route.fulfill({ status: 204, headers: corsHeaders() });
            return;
        }
        await route.fulfill({
            status: 200,
            contentType: 'application/json',
            headers: corsHeaders(),
            body: JSON.stringify({
                "virtualCardNumber": "6400345678901234",
                "expiryDate": "2028-06-04T00:00:00",
                "CVV": "123"
            }),
        });
    });

    // ── Accounts ──
    let createdAccounts = [];
    await page.route('**/api/v1/accounts**', async (route) => {
        if (route.request().method() === 'OPTIONS') {
            await route.fulfill({ status: 204, headers: corsHeaders() });
            return;
        }
        if (route.request().method() === 'POST') {
            const data = route.request().postDataJSON();
            const newAccount = {
                id: Date.now(),
                accountNumber: `...${Math.floor(Math.random() * 900000 + 100000)}`,
                accountName: data?.accountName || 'New Account',
                accountType: data?.accountType || 'CHEQUING',
                balance: 0,
            };
            createdAccounts.push(newAccount);
            await route.fulfill({
                status: 201,
                contentType: 'application/json',
                headers: corsHeaders(),
                body: JSON.stringify(newAccount),
            });
            return;
        }
        // GET — return all created accounts
        await route.fulfill({
            status: 200,
            contentType: 'application/json',
            headers: corsHeaders(),
            body: JSON.stringify(createdAccounts),
        });
    });

    return mocks;
}

/* ─────────────── Registration Helpers ─────────────── */

/**
 * Navigates to `/register` and fills out the full 2-step registration form.
 */
export async function fillRegisterForm(page, { email, password, confirmPassword }, { stopAtStep1 = false } = {}) {
    const confirm = confirmPassword ?? password;

    await page.goto('/register');

    /* ── Step 1: Basic Info ── */
    await page.getByTestId('first-name-input').locator('input').fill('John');
    await page.getByTestId('last-name-input').locator('input').fill('Doe');

    await page.getByTestId('email-input').locator('input').fill(email);
    await page.getByTestId('password-input').locator('input').fill(password);
    await page.getByTestId('confirm-password-input').locator('input').fill(confirm);

    // Click "Continue →" to go to Step 2
    await page.getByRole('button', { name: /Continue/i }).click();

    if (stopAtStep1) {
        return;
    }

    /* ── Step 2: Personal Details ── */
    await expect(page.getByText('Social Insurance Number')).toBeVisible({ timeout: 5_000 });

    // SIN & Occupation
    const sinBox = page.getByText('Social Insurance Number', { exact: true }).locator('xpath=..');
    await sinBox.locator('input').fill('123456789');

    const occupationBox = page.getByText('Occupation', { exact: true }).locator('xpath=..');
    await occupationBox.locator('input').fill('Engineer');

    // Government ID Number
    await page.locator('input[type="governmentID Number"]').fill('AB1234567');

    // DOB
    await page.locator('input[type="date"]').fill('1990-01-15');

    // Phone Number
    const phoneBox = page.getByText('Phone Number', { exact: true }).locator('xpath=..');
    await phoneBox.locator('input').fill('6135550100');

    // Address Line 1
    await page.locator('input[type="address 1"]').fill('123 Main Street');

    // City
    const cityBox = page.getByText('City', { exact: true }).locator('xpath=..');
    await cityBox.locator('input').fill('Ottawa');

    // Province
    const provinceBox = page.getByText('Province', { exact: true }).locator('xpath=..');
    await provinceBox.locator('.MuiSelect-select').click();
    await page.getByRole('option', { name: 'Ontario' }).click();

    // Postal Code
    const postalBox = page.getByText('Postal Code', { exact: true }).locator('xpath=..');
    await postalBox.locator('input').fill('K1A0B1');

    // Terms
    await page.locator('#terms').check();

    // Submit — "Create Account"
    await page.getByRole('button', { name: /Create Account/i }).click();
}

/* ─────────────── Login Helpers ─────────────── */

/**
 * Navigates to `/login`, selects institution, enters credentials, clicks Sign In.
 */
export async function fillLoginForm(page, { email, password }) {
    await page.goto('/login');

    await page.locator('input[type="email"]').fill(email);
    await page.locator('input[type="password"]').fill(password);

    await page.getByRole('button', { name: /^Sign In$/i }).click();
}

/* ─────────────── Common Login+OTP Flow ─────────────── */

/**
 * Performs a complete login+OTP flow: login → verify page → enter OTP → dashboard.
 * This is a convenience function combining fillLoginForm + OTP verification.
 */
export async function loginAndVerifyOtp(page, { email, password }) {
    await fillLoginForm(page, { email, password });

    // Should redirect to /verify with type=login
    await expect(page).toHaveURL(/\/verify/, { timeout: 10_000 });

    // Wait for the verify page to fully render (the 7-digit code input)
    const textbox = page.getByRole("textbox");

    await expect(textbox).toBeVisible({ timeout: 10000 });

    await textbox.fill("1234567");
    // const codeInput = page.getByLabel('Enter the 7-digit code below');
    // await expect(codeInput).toBeVisible({ timeout: 10_000 });

    // Enter any 7-digit code (mocks accept all)
   // await codeInput.fill('1234567');
    await page.getByRole('button', { name: /Verify Code/i }).click();

    // Should navigate away from /verify to /home or dashboard
    await expect(page).not.toHaveURL(/\/verify/, { timeout: 15_000 });
    await expect(page).not.toHaveURL(/\/login/, { timeout: 5_000 });
}

