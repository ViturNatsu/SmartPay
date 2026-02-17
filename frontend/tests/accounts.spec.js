import { test, expect } from '@playwright/test';

test.describe('Accounts - OpenAccountForm flows (focused)', () => {
  test.beforeEach(async ({ page }) => {
    // Ensure the app bootstraps as an authenticated user by providing a refresh token
    await page.addInitScript(() => {
      sessionStorage.setItem('refresh_token', 'playwright-fake-refresh');
    });

    // Mock the refresh endpoint the app calls on bootstrap so it receives an access token
    await page.route('**/api/v1/auth/refresh', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ accessToken: 'playwright-access', refreshToken: 'playwright-refresh' }),
      });
    });

    // Force desktop viewport so desktop-only controls are visible
    await page.setViewportSize({ width: 1280, height: 800 });

    // Navigate to accounts page (this will close any open dialogs from previous test)
    await page.goto('/accounts');
    await expect(page.getByRole('button', { name: /Open New Account/i })).toBeVisible();
  });

  const fillRequiredFields = async (page, opts) => {
    const {
      accountName = 'AutoTest Account',
      firstName = 'Test',
      lastName = 'User',
      addressLine1 = '1 Test St',
      city = 'Ottawa',
      province = 'Ontario',
      postalCode = 'K1A0B1',
      phoneNumber = '6135550100',
      sin = '123456789',
      governmentId = 'G1234567',
      accountType = 'Chequing',
      skipOpenClick = false,
    } = opts || {};

    // click the Open button (desktop or mobile variant) and wait for the dialog
    if (!skipOpenClick) {
      await page.locator('button', { hasText: 'Open New Account' }).first().click();
    }
    await expect(page.getByRole('heading', { name: 'Open a New Account' })).toBeVisible();

    // select account type
    await page.getByLabel('Account Type').click();
    await page.getByRole('option', { name: accountType }).click();

    await page.getByLabel('Account Name').fill(accountName);
    await page.getByLabel('First Name').fill(firstName);
    await page.getByLabel('Last Name').fill(lastName);

    await page.getByLabel('Address Line 1').fill(addressLine1);
    await page.getByLabel('City').fill(city);
    await page.getByLabel('Province / Territory').click();
    await page.getByRole('option', { name: province }).click();
    await page.getByLabel('Postal Code').fill(postalCode);
    await page.getByLabel('Phone Number').fill(phoneNumber);

    await page.getByLabel('Social Insurance Number (SIN)').fill(sin);
    await page.getByLabel('Government Issued ID Number').fill(governmentId);
  };

  test('Acceptance: Open New Account option is available and Savings option exists', async ({ page }) => {
    await page.getByRole('button', { name: /Open New Account/i }).click();
    await page.getByLabel('Account Type').click();
    // Ensure both options are available
    await expect(page.getByRole('option', { name: 'Chequing' })).toBeVisible();
    await expect(page.getByRole('option', { name: 'Savings' })).toBeVisible();
    // Close the dropdown and dialog by clicking outside the dialog
    await page.click('[role="presentation"] >> nth=0', { force: true }).catch(() => {});
    await page.waitForTimeout(300);
  });

  test('Acceptance: Required fields are indicated and Next is disabled until valid', async ({ page }) => {
    await page.getByRole('button', { name: /Open New Account/i }).click();
    // Ensure Next is disabled until required fields are completed
    const nextBtn = page.getByRole('button', { name: /Next/i });
    await expect(nextBtn).toBeDisabled();

    // fill required fields then Next should be enabled
    await fillRequiredFields(page, { accountName: 'ReqCheck', skipOpenClick: true });
    await expect(nextBtn).toBeEnabled();
    
    // Close the dialog
    await page.keyboard.press('Escape');
  });

  test('Scenario: Successfully open a chequing account and it appears in Accounts list', async ({ page }) => {
    const acctName = `Cheq-${Date.now()}`;
    await fillRequiredFields(page, { accountName: acctName, accountType: 'Chequing' });

    // proceed through terms and submit
    await page.getByRole('button', { name: /Next/i }).click();
    await page.getByLabel('I have read and accept the Terms and Conditions.').check();
    await page.getByRole('button', { name: /Next/i }).click();

    await expect(page.getByRole('heading', { name: 'Review & Submit' })).toBeVisible();
    await page.getByRole('button', { name: /Submit/i }).click();

    // dialog should close
    await expect(page.getByRole('heading', { name: 'Open a New Account' })).toHaveCount(0);

    // the account card with the name should appear
    await expect(page.getByText(acctName).first()).toBeVisible();

    // the account number is shown truncated with ellipses; verify some digits exist
    const card = page.getByText(acctName).first().locator('..').locator('..');
    const accountNumberText = await card.getByText(/...\d+/).first().textContent().catch(() => null);
    expect(accountNumberText).not.toBeNull();
  });

  test('Scenario: Missing/invalid information prevents submission and shows validation', async ({ page }) => {
    await page.getByRole('button', { name: /Open New Account/i }).click();

    const nextBtn = page.getByRole('button', { name: /Next/i });
    await expect(nextBtn).toBeDisabled();

    // fill some fields but leave required ones empty
    await page.getByLabel('Account Name').fill('Incomplete');
    await page.getByLabel('First Name').fill('A');
    await page.getByLabel('Last Name').fill('B');

    // still disabled
    await expect(nextBtn).toBeDisabled();

    // Remain on the account opening dialog
    await expect(page.getByRole('heading', { name: 'Open a New Account' })).toBeVisible();
    
    // Close the dialog
    await page.keyboard.press('Escape');
  });

  test('Acceptance: Can create two accounts with different names and numbers are unique', async ({ page }) => {
    const name1 = `AcctA-${Date.now()}`;
    const name2 = `AcctB-${Date.now()}`;

    // Create first
    await fillRequiredFields(page, { accountName: name1 });
    await page.getByRole('button', { name: /Next/i }).click();
    await page.getByLabel('I have read and accept the Terms and Conditions.').check();
    await page.getByRole('button', { name: /Next/i }).click();
    await page.getByRole('button', { name: /Submit/i }).click();
    await expect(page.getByText(name1).first()).toBeVisible();

    // capture its account number suffix
    const card1 = page.getByText(name1).first().locator('..').locator('..');
    const brief1 = await card1.getByText(/\.\.\.\d+/).first().textContent();
    const suffix1 = brief1 ? brief1.replace(/[^0-9]/g, '') : '';

    // Create second
    await fillRequiredFields(page, { accountName: name2 });
    await page.getByRole('button', { name: /Next/i }).click();
    await page.getByLabel('I have read and accept the Terms and Conditions.').check();
    await page.getByRole('button', { name: /Next/i }).click();
    await page.getByRole('button', { name: /Submit/i }).click();
    await expect(page.getByText(name2).first()).toBeVisible();

    const card2 = page.getByText(name2).first().locator('..').locator('..');
    const brief2 = await card2.getByText(/\.\.\.\d+/).first().textContent();
    const suffix2 = brief2 ? brief2.replace(/[^0-9]/g, '') : '';

    expect(suffix1).not.toEqual('');
    expect(suffix2).not.toEqual('');
    expect(suffix1).not.toEqual(suffix2);
  });
});
