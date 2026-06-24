import { test, expect } from "@playwright/test";
import { setupAPIMocks, loginAndVerifyOtp } from "./helpers/auth.helpers.js";
 
async function navigateToTransaction(page) {
  await setupAPIMocks(page);
  const email = `nav_${Date.now()}@domain.com`;
  const password = "Password8!";
  await loginAndVerifyOtp(page, { email, password });
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.getByTestId("nav-transactions").click();
  await expect(page).toHaveURL(/\/transactions/);
}
 
// ---- Shared API mock helpers ------------------------------------------
 
/**
 * Intercepts the wallet transactions API and returns a controlled payload.
 * Call BEFORE navigateToTransaction so the mock is in place when the page loads.
 */
async function mockTransactions(page, transactions = []) {
  await page.route("**/wallets/*/transactions**", (route) => {
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(transactions),
    });
  });
}
 
async function mockTransactionsError(page) {
  await page.route("**/wallets/*/transactions**", (route) => {
    route.fulfill({ status: 500, body: "Internal Server Error" });
  });
}
 
// ---- Fixtures -----------------------------------------------------------
 
const PURCHASE_TRANSACTION = {
  PaymentMethodId: 1,
  amount: 18.5,
  bankDisplayName: "TD",
  createdAt: "2026-06-02T10:00:00.000Z",
  description: "Coffee House",
  status: "COMPLETED",
  transactionId: "TXN-purchase-1",
  type: "PURCHASES",
  transactionCategory: "PURCHASE",
};
 
const WITHDRAW_TRANSACTION = {
  PaymentMethodId: 2,
  amount: 30,
  bankDisplayName: "TD",
  createdAt: "2026-06-19T15:50:00.000Z",
  description: "Withdraw to TD",
  status: "COMPLETED",
  transactionId: "TXN-withdraw-1",
  type: "WITHDRAW",
  transactionCategory: "SENT",
};
 
const PENDING_TRANSACTION = {
  PaymentMethodId: 3,
  amount: 50,
  bankDisplayName: "RBC",
  createdAt: "2026-06-20T09:00:00.000Z",
  description: "Load from RBC",
  status: "PENDING",
  transactionId: "TXN-load-1",
  type: "LOAD",
  transactionCategory: "RECEIVED",
};
 
const FAILED_TRANSACTION = {
  PaymentMethodId: 4,
  amount: 100,
  bankDisplayName: "BMO",
  createdAt: "2026-06-21T11:00:00.000Z",
  description: "Withdraw to BMO",
  status: "FAILED",
  transactionId: "TXN-failed-1",
  type: "WITHDRAW",
  transactionCategory: "SENT",
};
 
// =========================================================================
// Empty state
// =========================================================================
 
test.describe("Transaction page – empty state", () => {
  test.setTimeout(60_000);
 
  test("shows 'No transactions found' when API returns empty list", async ({
    page,
  }) => {
    await mockTransactions(page, []);
    await navigateToTransaction(page);
 
    await expect(page.getByText("No transactions found")).toBeVisible({
      timeout: 15_000,
    });
  });
 
  test("shows 'No transactions found' when active filter has no matches", async ({
    page,
  }) => {
    // Only a withdraw — no purchases
    await mockTransactions(page, [WITHDRAW_TRANSACTION]);
    await navigateToTransaction(page);
 
    await page.getByRole("button", { name: "Purchases" }).click();
 
    await expect(page.getByText("No transactions found")).toBeVisible({
      timeout: 15_000,
    });
  });
});
 
// =========================================================================
// Filter bar
// =========================================================================
 
test.describe("Transaction page – filter bar", () => {
  test.setTimeout(60_000);
 
  test("renders All, Purchases, and Sent & Received filter pills", async ({
    page,
  }) => {
    await mockTransactions(page, []);
    await navigateToTransaction(page);
 
    await expect(page.getByRole("button", { name: "All" })).toBeVisible({
      timeout: 15_000,
    });
    await expect(
      page.getByRole("button", { name: "Purchases" })
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Sent & Received" })
    ).toBeVisible();
  });
 
  test("All filter is selected by default", async ({ page }) => {
    await mockTransactions(page, []);
    await navigateToTransaction(page);
 
    const allButton = page.getByRole("button", { name: "All" });
    await expect(allButton).toBeVisible({ timeout: 15_000 });
    await expect(allButton).toHaveAttribute("aria-pressed", "true");
  });
 
  test("Purchases filter shows only PURCHASES type transactions", async ({
    page,
  }) => {
    await mockTransactions(page, [PURCHASE_TRANSACTION, WITHDRAW_TRANSACTION]);
    await navigateToTransaction(page);
 
    await page.getByRole("button", { name: "Purchases" }).click();
 
    await expect(page.getByText("Coffee House")).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByText("Withdraw to TD")).not.toBeVisible();
  });
 
  test("Sent & Received filter shows WITHDRAW, LOAD, DEPOSIT, TRANSFER types", async ({
    page,
  }) => {
    await mockTransactions(page, [PURCHASE_TRANSACTION, WITHDRAW_TRANSACTION, PENDING_TRANSACTION]);
    await navigateToTransaction(page);
 
    await page.getByRole("button", { name: "Sent & Received" }).click();
 
    await expect(page.getByText("Withdraw to TD")).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByText("Load from RBC")).toBeVisible();
    await expect(page.getByText("Coffee House")).not.toBeVisible();
  });
});
 
// =========================================================================
// Table rows
// =========================================================================
 
test.describe("Transaction page – table rows", () => {
  test.setTimeout(60_000);
 
  test("renders transaction description and date", async ({ page }) => {
    await mockTransactions(page, [PURCHASE_TRANSACTION]);
    await navigateToTransaction(page);
 
    await expect(page.getByText("Coffee House")).toBeVisible({
      timeout: 15_000,
    });
    // Date is formatted as "Jun 2, 2026" by the column renderer
    await expect(page.getByText(/Jun 2, 2026/)).toBeVisible();
  });
 
  test("outflow transaction shows negative amount in red", async ({ page }) => {
    await mockTransactions(page, [WITHDRAW_TRANSACTION]);
    await navigateToTransaction(page);
 
    const amountCell = page.getByText("-$30.00");
    await expect(amountCell).toBeVisible({ timeout: 15_000 });
 
    // Verify red color (error.main = #B91C1C from theme tokens)
    const color = await amountCell.evaluate(
      (el) => getComputedStyle(el).color
    );
    expect(color).toBe("rgb(185, 28, 28)");
  });
 
  test("inflow transaction shows positive amount in green", async ({ page }) => {
    await mockTransactions(page, [PENDING_TRANSACTION]);
    await navigateToTransaction(page);
 
    const amountCell = page.getByText("+$50.00");
    await expect(amountCell).toBeVisible({ timeout: 15_000 });
 
    // Verify green color (success.main = #15803D from theme tokens)
    const color = await amountCell.evaluate(
      (el) => getComputedStyle(el).color
    );
    expect(color).toBe("rgb(21, 128, 61)");
  });
});
 
// =========================================================================
// Error state
// =========================================================================
 
test.describe("Transaction page – error state", () => {
  test.setTimeout(60_000);
 
  test("shows error alert when API returns 500", async ({ page }) => {
    await mockTransactionsError(page);
    await navigateToTransaction(page);
 
    await expect(page.getByRole("alert")).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText("Failed to load transactions")).toBeVisible();
  });
 
  test("shows Try again button in the error alert", async ({ page }) => {
    await mockTransactionsError(page);
    await navigateToTransaction(page);
 
    await expect(page.getByTestId("retry-button")).toBeVisible({
      timeout: 15_000,
    });
  });
 
});