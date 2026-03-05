import { test, expect } from "@playwright/test";

async function fillRegisterForm(page, email, password, confirm) {

  await page.goto("/register");

  await page.getByTestId('first-name-input').click();
  await page.keyboard.type('John');

  await page.getByTestId('last-name-input').click();
  await page.keyboard.type('Doe');

  await page.getByTestId('email-input').click();
  await page.keyboard.type(email);

  await page.getByTestId('password-input').click();
  await page.keyboard.type(password);

  await page.getByTestId('confirm-password-input').click();
  await page.keyboard.type(confirm);

  await page.locator("#terms").check();
  await page.getByRole("button", { name: "Create Account" }).click();
}

async function getVerificationCode(request, targetEmail) {
  let emailBody = "";

  await expect.poll(async () => {
    const res = await request.get(
      "http://localhost:8025/api/v2/messages"
    );
    const json = await res.json();

    if (json.items.length === 0) return null;

    const email = json.items.find(m =>
      m.Content.Headers.To?.some((to) =>
        to.includes(targetEmail)
      )
    );
    if (!email) return null;

    emailBody = email.Content.Body;
    return emailBody;
  }, {
    timeout: 10_000,
    intervals: [500],
  }).not.toBeNull();

  const match = emailBody.match(/(\d{7})/);
  expect(match).not.toBeNull();

  const verificationCode = match[0];
  return verificationCode;
}



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

  // After 409 the app shows the duplicate email error on Step 2
  // The text can be any of: "We can't create an account with that email" or "That email is already in use."
  // The duplicateEmailError Box renders at the top of Step 2 content
  const duplicateAlert = page.getByRole('alert');
  await expect(duplicateAlert).toBeVisible({ timeout: 15000 });
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

  // The apiErrorMessage renders on Step 1 markup only.
  // After the API error, click "← Back" to go back to Step 1 where the message shows.
  await page.getByRole('button', { name: /Back/i }).click();

  // Now the rate limit error should be visible on Step 1
  await expect(page.getByText(/We can't process your request right now/i)).toBeVisible({ timeout: 10000 });
});