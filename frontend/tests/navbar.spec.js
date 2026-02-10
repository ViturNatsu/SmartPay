import { test, expect } from "@playwright/test";

/**
 * Playwright test for feature US03-04-03: Navbar
 * 1) registers a new user
 * 2) verifies email via MailHog (type=register)
 * 3) logs in
 * 4) verifies login via MailHog (type=login)
 * 5) tests navbar behavior + logout
 *
 * Assumes MailHog is running at http://localhost:8025
 */

/* ---------- Helpers: MailHog ---------- */

async function getLatestEmailBodyFor(request, targetEmail) {
  let emailBody = "";

  await expect
    .poll(
      async () => {
        const res = await request.get("http://localhost:8025/api/v2/messages");
        const json = await res.json();

        if (!json?.items?.length) return null;

        // Get all emails sent to targetEmail
        const matching = json.items.filter((m) =>
          m.Content?.Headers?.To?.some((to) => to.includes(targetEmail)),
        );

        if (!matching.length) return null;

        // Sort newest -> oldest (MailHog provides Created timestamp)
        matching.sort(
          (a, b) =>
            new Date(b.Created).getTime() - new Date(a.Created).getTime(),
        );

        // Take newest email
        const msg = matching[0];

        emailBody = msg.Content.Body;
        return emailBody;
      },
      { timeout: 10000, intervals: [500] },
    )
    .not.toBeNull();

  return emailBody;
}

async function getVerificationCode(request, targetEmail) {
  const body = await getLatestEmailBodyFor(request, targetEmail);

  // More specific regex so it doesn't grab your timestamp email address digits
  const match =
    body.match(/your verification code is:\s*(\d{7})/i) ||
    body.match(/verification code:\s*(\d{7})/i);

  expect(match).not.toBeNull();

  // match[1] is the captured 7-digit code
  return match[1];
}

/* ---------- Helpers: Register ---------- */

async function fillRegisterForm(page, email, password) {
  await page.goto("/register");

  await page.locator('[id="_r_1_"]').fill("John");
  await page.locator('[id="_r_2_"]').fill("Doe");

  await page.getByRole("combobox").click();
  await page.getByRole("option", { name: "Chase" }).click();

  await page.locator('[id="_r_5_"]').fill(email);
  await page.locator('[id="_r_6_"]').fill(password);
  await page.locator('[id="_r_8_"]').fill(password);

  await page.locator("#terms").check();
  await page.getByRole("button", { name: /create account/i }).click();

  await expect(page).toHaveURL(/\/verify/, { timeout: 15000 });
}

async function verifyRegister(page, request, email) {
  const code = await getVerificationCode(request, email);
  await page.getByRole("textbox").fill(code);
  await page.getByRole("button", { name: /Verify Code/i }).click();

  await expect(page).toHaveURL(/\/login/, { timeout: 15000 });
}

/* ---------- Helpers: Login ---------- */

async function fillLoginForm(page, email, password) {
  await page.goto("/login");

  await page.getByRole("combobox").click();
  await page.getByRole("option", { name: "Chase" }).click();

  await page.locator('input[type="email"]').fill(email);
  await page.locator('input[type="password"]').fill(password);

  await page.getByRole("button", { name: /^Sign In$/i }).click();

  await expect(page).toHaveURL(/\/verify\?email=.*&type=login/, {
    timeout: 10000,
  });
}

async function verifyLogin(page, request, email) {
  const code = await getVerificationCode(request, email);

  await page.getByRole("textbox").fill(code);
  await page.getByRole("button", { name: /Verify Code/i }).click();

  // Should leave verify page after successful login verification
  await expect(page).not.toHaveURL(/\/verify/);
}

/* ---------- Navbar Test ---------- */

test("Navbar works (logo, highlight, logout)", async ({ page, request }) => {
  const email = `nav_${Date.now()}@domain.com`;
  const password = "Password8!";

  // Register + Verify
  await fillRegisterForm(page, email, password);
  await verifyRegister(page, request, email);

  // Login + Verify(Login)
  await fillLoginForm(page, email, password);
  await verifyLogin(page, request, email);

  await page.setViewportSize({ width: 1280, height: 720 });

  // Navbar should be visible
  await expect(page.getByLabel("home")).toBeVisible();
  await expect(page.getByLabel("logout")).toBeVisible({ timeout: 15000 });

  // // Click Accounts -> /accounts
  await page.getByTestId("nav-accounts").click();
  await expect(page).toHaveURL(/\/accounts/);

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
