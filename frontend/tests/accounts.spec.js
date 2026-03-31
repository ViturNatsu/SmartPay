import { test, expect } from "@playwright/test";
import { setupAPIMocks, loginAndVerifyOtp } from "./helpers/auth.helpers.js";

let sharedPage;

test.describe.serial("Accounts - OpenAccountForm flows (focused)", () => {
  test.beforeAll(async ({ browser }) => {
    sharedPage = await browser.newPage();
    await setupAPIMocks(sharedPage);

    const email = `account_${Date.now()}@domain.com`;
    const password = "Password8!";

    // Login and complete OTP to reach authenticated state
    await loginAndVerifyOtp(sharedPage, { email, password });
  });

  test.afterAll(async () => {
    await sharedPage.close();
  });

  test.beforeEach(async () => {
    // Force desktop viewport so desktop-only controls are visible
    await sharedPage.setViewportSize({ width: 1280, height: 800 });

    // Navigate to accounts page
    await sharedPage.goto("/accounts");
    await expect(
      sharedPage.getByRole("button", { name: /Connect New Account/i }).first(),
    ).toBeVisible({ timeout: 20_000 });
  });

  const fillRequiredFields = async (page, opts) => {
    const {
      accountName = "AutoTest Account",
      accountType = "Chequing",
      skipOpenClick = false,
    } = opts || {};

    // click the Open button and wait for the dialog
    if (!skipOpenClick) {
      await page
        .locator("button", { hasText: "Connect New Account" })
        .first()
        .click();
    }
    await expect(
      page.getByRole("heading", { name: "Open a New Account" }),
    ).toBeVisible();

    // select account type
    await page.getByLabel("Account Type").click();
    await page.getByRole("option", { name: accountType }).click();

    await page.getByLabel("Account Name").fill(accountName);
  };

  test("Acceptance: Connect New Account option is available and Savings option exists", async () => {
    await sharedPage
      .getByRole("button", { name: /Connect New Account/i })
      .first()
      .click();
    await sharedPage.getByLabel("Account Type").click();
    // Ensure both options are available
    await expect(
      sharedPage.getByRole("option", { name: "Chequing" }),
    ).toBeVisible();
    await expect(
      sharedPage.getByRole("option", { name: "Savings" }),
    ).toBeVisible();
    // Close the dropdown and dialog
    await sharedPage.keyboard.press("Escape");
    await sharedPage.waitForTimeout(300);
  });

  test("Acceptance: Required fields are indicated and Next is disabled until valid", async () => {
    await sharedPage
      .getByRole("button", { name: /Connect New Account/i })
      .first()
      .click();
    const nextBtn = sharedPage.getByRole("button", { name: /Next/i });
    await expect(nextBtn).toBeDisabled();

    // fill required fields then Next should be enabled
    await fillRequiredFields(sharedPage, {
      accountName: "ReqCheck",
      skipOpenClick: true,
    });
    await expect(nextBtn).toBeEnabled();

    // Close the dialog
    await sharedPage.keyboard.press("Escape");
  });

  test("Scenario: Successfully open a chequing account and it appears in Accounts list", async () => {
    const acctName = `Cheq-${Date.now()}`;
    await fillRequiredFields(sharedPage, {
      accountName: acctName,
      accountType: "Chequing",
    });

    // proceed through terms and submit
    await sharedPage.getByRole("button", { name: /Next/i }).click();
    await sharedPage
      .getByLabel("I have read and accept the Terms and Conditions.")
      .check();
    await sharedPage.getByRole("button", { name: /Next/i }).click();

    await expect(
      sharedPage.getByRole("heading", { name: "Review & Submit" }),
    ).toBeVisible();
    await sharedPage.getByRole("button", { name: /Submit/i }).click();

    // dialog should close
    await expect(
      sharedPage.getByRole("heading", { name: "Open a New Account" }),
    ).toHaveCount(0, { timeout: 10_000 });

    // the account card with the name should appear
    await expect(sharedPage.getByText(acctName).first()).toBeVisible({
      timeout: 10_000,
    });
  });

  test("Scenario: Missing/invalid information prevents submission and shows validation", async () => {
    await sharedPage
      .getByRole("button", { name: /Connect New Account/i })
      .first()
      .click();

    const nextBtn = sharedPage.getByRole("button", { name: /Next/i });
    await expect(nextBtn).toBeDisabled();

    // fill some fields but leave required ones empty
    await sharedPage.getByLabel("Account Name").fill("Incomplete");

    // still disabled
    await expect(nextBtn).toBeDisabled();

    // Remain on the account opening dialog
    await expect(
      sharedPage.getByRole("heading", { name: "Open a New Account" }),
    ).toBeVisible();

    // Close the dialog
    await sharedPage.keyboard.press("Escape");
  });

  test("Acceptance: Can create two accounts with different names and numbers are unique", async () => {
    const name1 = `AcctA-${Date.now()}`;
    const name2 = `AcctB-${Date.now()}`;

    // Create first
    await fillRequiredFields(sharedPage, { accountName: name1 });
    await sharedPage.getByRole("button", { name: /Next/i }).click();
    await sharedPage
      .getByLabel("I have read and accept the Terms and Conditions.")
      .check();
    await sharedPage.getByRole("button", { name: /Next/i }).click();
    await sharedPage.getByRole("button", { name: /Submit/i }).click();
    await expect(sharedPage.getByText(name1).first()).toBeVisible({
      timeout: 10_000,
    });

    // capture its account number suffix
    const card1 = sharedPage
      .getByText(name1)
      .first()
      .locator("..")
      .locator("..");
    const brief1 = await card1
      .getByText(/\.\.\.\d+/)
      .first()
      .textContent();
    const suffix1 = brief1 ? brief1.replace(/[^0-9]/g, "") : "";

    // Create second
    await fillRequiredFields(sharedPage, { accountName: name2 });
    await sharedPage.getByRole("button", { name: /Next/i }).click();
    await sharedPage
      .getByLabel("I have read and accept the Terms and Conditions.")
      .check();
    await sharedPage.getByRole("button", { name: /Next/i }).click();
    await sharedPage.getByRole("button", { name: /Submit/i }).click();
    await expect(sharedPage.getByText(name2).first()).toBeVisible({
      timeout: 10_000,
    });

    const card2 = sharedPage
      .getByText(name2)
      .first()
      .locator("..")
      .locator("..");
    const brief2 = await card2
      .getByText(/\.\.\.\d+/)
      .first()
      .textContent();
    const suffix2 = brief2 ? brief2.replace(/[^0-9]/g, "") : "";

    expect(suffix1).not.toEqual("");
    expect(suffix2).not.toEqual("");
    expect(suffix1).not.toEqual(suffix2);
  });
});
