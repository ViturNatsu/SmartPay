import {test, expect} from "@playwright/test";
import {setupAPIMocks, loginAndVerifyOtp} from "./helpers/auth.helpers.js";

test("Navbar works (rail, hamburger, logout)", async ({page}) => {
  test.setTimeout(60_000);

  await setupAPIMocks(page);

  const email = `nav_${Date.now()}@domain.com`;
  const password = "Password8!";

  await loginAndVerifyOtp(page, {email, password});

  await page.setViewportSize({width: 1280, height: 720});

  await expect(page.getByTestId("nav-rail")).toBeVisible({timeout: 15000});
  await expect(page.getByTestId("nav-toggle")).toBeVisible();
  await expect(page.getByTestId("nav-hamburger")).toBeVisible();

  await page.getByTestId("nav-payment-method").click();
  await expect(page).toHaveURL(/\/payment-methods/);
  await expect(page.getByTestId("nav-payment-method")).toHaveAttribute("aria-current", "page");

  await page.getByTestId("nav-wallet").click();
  await expect(page).toHaveURL(/\/wallet/);

  await page.getByTestId("nav-toggle").click();
  await expect(page.getByTestId("nav-rail")).toHaveAttribute("data-collapsed", "true");
  await page.getByTestId("nav-transfer").click();
  await expect(page).toHaveURL(/\/transfers/);
  await expect(page.getByTestId("nav-rail")).toHaveAttribute("data-collapsed", "true");

  await page.getByTestId("nav-toggle").click();
  await expect(page.getByTestId("nav-rail")).toHaveAttribute("data-collapsed", "false");

  await page.getByTestId("nav-hamburger").click();
  await page.getByTestId("nav-transaction-history").click();
  await expect(page).toHaveURL(/\/transactions/);

  await page.getByTestId("nav-hamburger").click();
  await page.getByTestId("nav-support").click();
  await expect(page).toHaveURL(/\/support/);

  await page.getByTestId("nav-dashboard").click();
  await expect(page).toHaveURL(/\/$/);

  await page.getByTestId("nav-hamburger").click();
  await page.getByTestId("nav-logout").click();
  await expect(page).toHaveURL(/\/login/);
});
