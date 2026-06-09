import {test, expect} from "@playwright/test";
import {setupAPIMocks, loginAndVerifyOtp} from "./helpers/auth.helpers.js";

// Navigate to the wallet page by logging in and clicking the wallet nav item
async function navigateToWallet(page) {
  await setupAPIMocks(page);
  const email = `nav_${Date.now()}@domain.com`;
  const password = "Password8!";
  await loginAndVerifyOtp(page, { email, password });
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.getByTestId("nav-wallet").click();
  await expect(page).toHaveURL(/\/wallet/);
}

test.describe("Wallet – virtual card display", () => {
  test.setTimeout(60_000);

  test("card renders with cardholder name", async ({ page }) => {
    await navigateToWallet(page);

    // The card shows firstName + lastName from the auth user object
    const cardName = page.locator("text=/^[A-Za-z]+ [A-Za-z]+$/").first();
    const cardNumber = page.locator(
      "text=/^[\\dX*]{4}\\s[\\dX*]{4}\\s[\\dX*]{4}\\s[\\dX*]{4}$/"
    );
    const expiry = page.locator("text=/^(0[1-9]|1[0-2])\\/(\\d{2}|\\d{4})$/");

    // The CVV label should be visible
    await expect(page.locator("text=CVV")).toBeVisible({ timeout: 15_000 });

    // The value next to CVV should be 3–4 digits
    const cvv = page.locator("text=/^\\d{3,4}$/");

    await expect(cardName).toBeVisible({ timeout: 15_000 });
    await expect(cardNumber).toBeVisible({ timeout: 15_000 });
    await expect(expiry).toBeVisible({ timeout: 15_000 });
    await expect(cvv).toBeVisible({ timeout: 15_000 });
  });
});
