import { test, expect } from "@playwright/test";

async function fillRegisterForm(page, email, password, confirm) {
  await page.goto("/register");

  await page.locator('[id="_r_1_"]').fill("John");
  await page.locator('[id="_r_2_"]').fill("Doe");

  await page.getByRole("combobox").click();
  await page.getByRole("option", { name: "Chase" }).click();

  await page.locator('[id="_r_5_"]').fill(email);
  await page.locator('[id="_r_6_"]').fill(password);
  await page.locator('[id="_r_8_"]').fill(confirm);

  await page.locator("#terms").check();
  await page.getByRole("button", { name: "Create Account" }).click();
}


test("user can register successfully", async ({ page }) => {
  await page.goto("/register");

  await fillRegisterForm(page, 'name@domain.com', 'Password8!', 'Password8!');

  //Assertion
  await expect(page).toHaveURL(/\/verify/);
});

test("user cannot register with duplicate email", async ({ page }) => {
  await page.goto("/register");

  await fillRegisterForm(page, 'name1@domain.com', 'Password8!', 'Password8!');

  //Assertion
  await expect(page).toHaveURL(/\/verify/);

  await page.goto("/register");

  await fillRegisterForm(page, 'name1@domain.com', 'Password8!', 'Password8!');

  //Assertion
  await expect(
    page.getByText(/We can’t create an account with that email/i)
  ).toBeVisible();
});

test("user cannot register with invalid email", async ({ page }) => {
  await page.goto("/register");

  await fillRegisterForm(page, 'invalid email', 'Password8!', 'Password8!');

  //Assertion
  const emailInput = page.locator('input[type="email"]');
  await expect(emailInput).toHaveJSProperty("validity.valid", false);
});

test("user cannot register with invalid password", async ({ page }) => {
  await page.goto("/register");

  await fillRegisterForm(page, 'name@domain.com', 'Pass', 'Pass');

  //Assertion
  await expect(
    page.getByText(/Must be at least 8 characters/i)
  ).toBeVisible();
});

test("user cannot register when passwords do not match", async ({ page }) => {
  await page.goto("/register");

  await fillRegisterForm(page, 'name@domain.com', 'Password8!', 'Password9!');

  //Assertion
  await expect(
    page.getByText(/Passwords must match/i)
  ).toBeVisible();
});