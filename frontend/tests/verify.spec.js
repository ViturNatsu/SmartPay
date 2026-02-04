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

test("user can register successfully and receives email", async ({ page, request }) => {
  const testEmail = "name@domain.com";

  await fillRegisterForm(page, testEmail, "Password8!", "Password8!");
  await expect(page).toHaveURL(/\/verify/);

  let messages;
  await expect.poll(async () => {
    const res = await request.get(
      "http://localhost:8025/api/v2/messages"
    );
    const body = await res.json();
    messages = body.items;
    return messages.length;
  }, {
    timeout: 10_000,
    intervals: [500],
  }).toBeGreaterThan(0);

  // Assert email content
  const email = messages.find(m =>
    m.Content.Headers.To?.some((to) =>
      to.includes(testEmail)
    )
  );

  expect(email).toBeTruthy();
  expect(email.Content.Body).toContain("Your verification code is:");
});

test("user can verify email with code from MailHog", async ({ page, request }) => {
  const testEmail = "name1@domain.com";
  await fillRegisterForm(page, testEmail, "Password8!", "Password8!");

  await expect(page).toHaveURL(/\/verify/);

  const verificationCode = await getVerificationCode(request, testEmail);
  console.log("Verification code:", verificationCode);

  await page.getByRole("textbox").fill(verificationCode);
  await page.getByRole("button", { name: "Verify Code" }).click();

  await expect(page).toHaveURL(/\/login/);
});

test("user can't re-enter used code", async ({page, request}) => {
  const testEmail = "name2@domain.com";
  await fillRegisterForm(page, testEmail, "Password8!", "Password8!");

  await expect(page).toHaveURL(/\/verify/);

  const verificationCode = await getVerificationCode(request, testEmail);
  console.log("Verification code:", verificationCode);

  await page.getByRole("textbox").fill(verificationCode);
  await page.getByRole("button", { name: "Verify Code" }).click();
  await expect(page).toHaveURL(/\/login/);

  await page.goto("http://localhost:5173/verify?email=name2%40domain.com&type=register");
  await page.getByRole("textbox").fill(verificationCode);
  await page.getByRole("button", { name: "Verify Code" }).click();
  
  await expect(page.getByText("Code has expired or was already used.")).toBeVisible();
  await expect(page).toHaveURL(/\/verify/);
});
