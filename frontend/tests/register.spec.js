import { test, expect } from "@playwright/test";

async function fillRegisterForm(page, email, password, confirm) {

  await page.goto("/register");

  await page.getByTestId('first-name-input').click();
  await page.keyboard.type('John');

  await page.getByTestId('last-name-input').click();
  await page.keyboard.type('Doe');

  await page.getByTestId('institution-input').click();
  await page.getByRole("option", { name: "Chase" }).click();

  await page.getByTestId('email-input').click();
  await page.keyboard.type(email);

  await page.getByTestId('password-input').click();
  await page.keyboard.type(password);

  await page.getByTestId('confirm-password-input').click();
  await page.keyboard.type(confirm);

  await page.locator("#terms").check();
  await page.getByRole("button", { name: "Create Account" }).click();
}


test("user can register successfully", async ({ page }) => {
  await page.goto("/register");

  await fillRegisterForm(page, 'name@domain.com', 'Password8!', 'Password8!');

  //Assertion
  await expect(page).toHaveURL(/\/verify/,{timeout: 10000});
});

test("user cannot register with duplicate email", async ({ page }) => {
  await page.goto("/register");

  await fillRegisterForm(page, 'name1@domain.com', 'Password8!', 'Password8!');

  //Assertion
  await expect(page).toHaveURL(/\/verify/,{timeout: 10000});

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
  await expect(
    page.getByRole('list').getByText('Email must match required')
  ).toBeVisible();
});

test("user cannot register with invalid password", async ({ page }) => {
  await page.goto("/register");

  await fillRegisterForm(page, 'name@domain.com', 'Pass', 'Pass');

  //Assertion
  await expect(
    page.getByRole('list').getByText('Password must be at least 8')
  ).toBeVisible();
});

test("user cannot register when passwords do not match", async ({ page }) => {
  await page.goto("/register");

  await fillRegisterForm(page, 'name@domain.com', 'Password8!', 'Password9!');

  //Assertion
  await expect(
    page.getByRole('list').getByText('Passwords must match.')
  ).toBeVisible();
});

test("user cannot register more than 3 times in one minute", async({page})=>{

  await page.goto("/register");
  await fillRegisterForm(page, 'name4@domain.com', 'Password8!', 'Password8!');

  await page.goto("/register");
  await fillRegisterForm(page, 'name2@domain.com', 'Password8!', 'Password8!');

  await page.goto("/register");
  await fillRegisterForm(page, 'name3@domain.com', 'Password8!', 'Password8!');

  await page.goto("/register");
  await fillRegisterForm(page, 'name5@domain.com', 'Password8!', 'Password8!');
  

  await expect(
    page.getByText(/We can't process your request right now/i)
    
  )
  .toBeVisible()

})