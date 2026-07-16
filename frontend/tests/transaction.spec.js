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

/**
 * Registers a transaction route override AFTER setupAPIMocks so it takes
 * precedence — Playwright uses last-registered handler wins.
 * All tests that control the API response must go through this helper.
 */
async function navigateToTransactionWithRouteMock(page, routeHandler) {
  await setupAPIMocks(page);
  await page.route("**/wallets/*/transactions**", routeHandler);
  const email = `nav_${Date.now()}@domain.com`;
  const password = "Password8!";
  await loginAndVerifyOtp(page, { email, password });
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.getByTestId("nav-transactions").click();
  await expect(page).toHaveURL(/\/transactions/);
}

// ---- Shared route handlers ----------------------------------------------

function successHandler(transactions) {
  return (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(transactions),
    });
}

const errorHandler = (route) =>
  route.fulfill({ status: 500, body: "Internal Server Error" });

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
  railType: "DEBIT_CARD",
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
  railType: "BANK_TRANSFER",
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
  railType: "BANK_TRANSFER",
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
  railType: "BANK_TRANSFER",
};

const WALLET_TRANSFER_TRANSACTION = {
  PaymentMethodId: 5,
  amount: 25,
  bankDisplayName: null,
  createdAt: "2026-06-22T08:00:00.000Z",
  description: "Transfer to John",
  status: "COMPLETED",
  transactionId: "TXN-transfer-1",
  type: "TRANSFER",
  transactionCategory: "SENT",
  railType: "WALLET_TRANSFER",
};

// =========================================================================
// Empty state
// =========================================================================

test.describe("Transaction page – empty state", () => {
  test.setTimeout(60_000);

  test("shows 'No transactions found' when API returns empty list", async ({
    page,
  }) => {
    await navigateToTransactionWithRouteMock(page, successHandler([]));

    await expect(page.getByText("No transactions found")).toBeVisible({
      timeout: 15_000,
    });
  });

  test("shows 'No transactions found' when active filter has no matches", async ({
    page,
  }) => {
    // Only a withdraw — no purchases
    await navigateToTransactionWithRouteMock(
      page,
      successHandler([WITHDRAW_TRANSACTION])
    );

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
    await navigateToTransactionWithRouteMock(page, successHandler([]));

    await expect(page.getByRole("button", { name: "All" })).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByRole("button", { name: "Purchases" })).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Sent & Received" })
    ).toBeVisible();
  });

  test("All filter is active by default (reflected in URL)", async ({ page }) => {
    await navigateToTransactionWithRouteMock(page, successHandler([]));

    // Filter state lives in the URL (?filter=all or absent = all)
    await expect(page).toHaveURL(/\/transactions/);
    // ToggleButton uses aria-pressed for the selected state
    await expect(page.getByRole("button", { name: "All" })).toHaveAttribute(
      "aria-pressed",
      "true",
      { timeout: 15_000 }
    );
  });

  test("Purchases filter shows only PURCHASES type transactions", async ({
    page,
  }) => {
    await navigateToTransactionWithRouteMock(
      page,
      successHandler([PURCHASE_TRANSACTION, WITHDRAW_TRANSACTION])
    );

    await page.getByRole("button", { name: "Purchases" }).click();
    await expect(page).toHaveURL(/filter=purchases/);

    await expect(page.getByText("Coffee House")).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByText("Withdraw to TD")).not.toBeVisible();
  });

  test("Sent & Received filter shows WITHDRAW, LOAD, DEPOSIT, TRANSFER types", async ({
    page,
  }) => {
    await navigateToTransactionWithRouteMock(
      page,
      successHandler([
        PURCHASE_TRANSACTION,
        WITHDRAW_TRANSACTION,
        PENDING_TRANSACTION,
      ])
    );

    await page.getByRole("button", { name: "Sent & Received" }).click();
    await expect(page).toHaveURL(/filter=transfers/);

    await expect(page.getByText("Withdraw to TD")).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByText("Load from RBC")).toBeVisible();
    await expect(page.getByText("Coffee House")).not.toBeVisible();
  });

  test("switching filter clears selected row from URL", async ({ page }) => {
    await navigateToTransactionWithRouteMock(
      page,
      successHandler([PURCHASE_TRANSACTION, WITHDRAW_TRANSACTION])
    );

    // Simulate a selected row in the URL
    await page.evaluate(() =>
      window.history.replaceState(
        {},
        "",
        "/transactions?filter=all&selected=TXN-purchase-1"
      )
    );

    await page.getByRole("button", { name: "Purchases" }).click();

    // `selected` param should be gone after filter change
    await expect(page).not.toHaveURL(/selected=/);
  });
});

// =========================================================================
// Table rows
// =========================================================================

test.describe("Transaction page – table rows", () => {
  test.setTimeout(60_000);

  test("renders transaction description and formatted date", async ({ page }) => {
    await navigateToTransactionWithRouteMock(
      page,
      successHandler([PURCHASE_TRANSACTION])
    );
 
    await expect(page.getByText("Coffee House")).toBeVisible({
      timeout: 15_000,
    });
 
    // formatTransactionDate uses toLocaleString('en-CA') which can render
    // slightly differently across OS/browser/ICU versions (e.g. "a.m." vs "AM",
    // "Jun." vs "Jun"). Match only the stable parts: month, day, and year.
    await expect(page.getByText(/Jun\.?\s*2,\s*2026/)).toBeVisible({
      timeout: 15_000,
    });
  });

  test("outflow transaction shows negative amount in red", async ({ page }) => {
    await navigateToTransactionWithRouteMock(
      page,
      successHandler([WITHDRAW_TRANSACTION])
    );

    const amountCell = page.getByText("-$30.00");
    await expect(amountCell).toBeVisible({ timeout: 15_000 });

    // Verify red color (tokens.color.status.error = #B91C1C)
    const color = await amountCell.evaluate(
      (el) => getComputedStyle(el).color
    );
    expect(color).toBe("rgb(185, 28, 28)");
  });

  test("inflow transaction shows positive amount in green", async ({ page }) => {
    await navigateToTransactionWithRouteMock(
      page,
      successHandler([PENDING_TRANSACTION])
    );

    const amountCell = page.getByText("+$50.00");
    await expect(amountCell).toBeVisible({ timeout: 15_000 });

    // Verify green color (tokens.color.status.success = #15803D)
    const color = await amountCell.evaluate(
      (el) => getComputedStyle(el).color
    );
    expect(color).toBe("rgb(21, 128, 61)");
  });

  test("renders COMPLETED status chip", async ({ page }) => {
    await navigateToTransactionWithRouteMock(
      page,
      successHandler([WITHDRAW_TRANSACTION])
    );
    const transactionRow = page.getByRole("button", {
      name: "View details for Withdraw to TD",
    });
    await expect(transactionRow.getByText("COMPLETED")).toBeVisible({ timeout: 15_000 });
  });

  test("renders PENDING status chip", async ({ page }) => {
    await navigateToTransactionWithRouteMock(
      page,
      successHandler([PENDING_TRANSACTION])
    );
    const transactionRow = page.getByRole("button", {
      name: "View details for Load from RBC",
    });
    await expect(transactionRow.getByText("PENDING")).toBeVisible({ timeout: 15_000 });
  });

  test("renders FAILED status chip", async ({ page }) => {
    await navigateToTransactionWithRouteMock(
      page,
      successHandler([FAILED_TRANSACTION])
    );
    const transactionRow = page.getByRole("button", {
      name: "View details for Withdraw to BMO",
    });
    await expect(transactionRow.getByText("FAILED")).toBeVisible({ timeout: 15_000 });
  });

  test("renders Payment Type via getRailLabel mapping", async ({ page }) => {
    await navigateToTransactionWithRouteMock(
      page,
      successHandler([WITHDRAW_TRANSACTION, WALLET_TRANSFER_TRANSACTION])
    );

    // BANK_TRANSFER → "Bank Transfer", WALLET_TRANSFER → "SmartPay Wallet Transfer"
    await expect(page.getByText("Bank Transfer").first()).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByText("SmartPay Wallet Transfer")).toBeVisible();
  });

  test("navigates to transaction detail page on row click", async ({ page }) => {
    await navigateToTransactionWithRouteMock(
      page,
      successHandler([WITHDRAW_TRANSACTION])
    );

    await page.getByText("Withdraw to TD").click();

    // handleSelect navigates to /transactions/:transactionId?filter=...
    await expect(page).toHaveURL(/\/transactions\/TXN-withdraw-1/, {
      timeout: 15_000,
    });
  });

  test("carries active filter into detail page URL", async ({ page }) => {
    await navigateToTransactionWithRouteMock(
      page,
      successHandler([WITHDRAW_TRANSACTION])
    );

    await page.getByRole("button", { name: "Sent & Received" }).click();
    await page.getByText("Withdraw to TD").click();

    await expect(page).toHaveURL(/filter=transfers/, { timeout: 15_000 });
  });
});

// =========================================================================
// Error state
// =========================================================================

test.describe("Transaction page – error state", () => {
  test.setTimeout(60_000);

  test("shows error alert when API returns 500", async ({ page }) => {
    await navigateToTransactionWithRouteMock(page, errorHandler);

    await expect(page.getByRole("alert")).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText("Failed to load transactions")).toBeVisible();
  });

  test("shows Try again button in the error alert", async ({ page }) => {
    await navigateToTransactionWithRouteMock(page, errorHandler);

    await expect(page.getByTestId("retry-button")).toBeVisible({
      timeout: 15_000,
    });
  });
});
