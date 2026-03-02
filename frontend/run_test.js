import { chromium } from 'playwright';

(async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage();
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', exception => console.log('PAGE ERROR:', exception));

    await page.goto('http://localhost:5173/register');

    console.log("Filling step 1...");
    // Names
    await page.getByTestId('first-name-input').locator('input').fill('John');
    await page.getByTestId('last-name-input').locator('input').fill('Doe');

    // Institution picker 
    await page.getByTestId('institution-input').click();
    await page.getByRole('option', { name: 'FDM Bank' }).click();

    await page.getByTestId('email-input').locator('input').fill('testlog123@domain.com');
    await page.getByTestId('password-input').locator('input').fill('Password8!');
    await page.getByTestId('confirm-password-input').locator('input').fill('Password8!');

    // Click "Continue →" to go to Step 2
    await page.getByRole('button', { name: /Continue/i }).click();

    console.log("Filling step 2...");
    await page.getByText('Social Insurance Number').first().waitFor({ state: 'visible', timeout: 5_000 });

    // Social Insurance Number
    const sinBox = page.getByText('Social Insurance Number', { exact: true }).locator('xpath=..');
    await sinBox.locator('input').fill('123456789');

    // Occupation
    const occBox = page.getByText('Occupation', { exact: true }).locator('xpath=..');
    await occBox.locator('input').fill('Engineer');

    // Government ID
    await page.getByTestId('governmentIDType-input').click({ force: true });
    await page.getByRole('option', { name: 'Passport' }).click();

    // Government ID Number
    await page.locator('input[type="governmentID Number"]').fill('AB1234567');

    // Date of Birth
    await page.locator('input[type="date"]').fill('1990-01-15');

    // Phone Number
    const phoneBox = page.getByText('Phone Number', { exact: true }).locator('xpath=..');
    await phoneBox.locator('input').fill('6135550100');

    // Address Line 1
    await page.locator('input[type="address 1"]').fill('123 Main Street');

    // City
    const cityBox = page.getByText('City', { exact: true }).locator('xpath=..');
    await cityBox.locator('input').fill('Ottawa');

    // Province
    const provinceBox = page.getByText('Province', { exact: true }).locator('xpath=..');
    await provinceBox.locator('.MuiSelect-select').click();
    await page.getByRole('option', { name: 'Ontario' }).click();

    // Postal Code
    const postalBox = page.getByText('Postal Code', { exact: true }).locator('xpath=..');
    await postalBox.locator('input').fill('K1A0B1');

    // Terms
    await page.locator('#terms').check();

    page.on('response', async response => {
        if (response.url().includes('/api/v1/auth/register')) {
            console.log('Register API Status:', response.status());
            console.log('Register API Body:', await response.text());
        }
    });

    console.log("Submitting...");

    await page.getByRole('button', { name: /^Create Account$/i }).click();
    await page.waitForTimeout(4000);
    console.log("Current URL after 4s:", page.url());

    // Check if the form is actually submitting by evaluating the HTML5 validity
    const isValid = await page.evaluate(() => document.querySelector('form').checkValidity());
    console.log("Is HTML5 Form Valid?", isValid);

    if (!isValid) {
        const invalidElements = await page.evaluate(() => {
            const form = document.querySelector('form');
            const invalidFields = Array.from(form.elements).filter(e => !e.validity.valid);
            return invalidFields.map(e => ({ name: e.name, id: e.id, type: e.type, validationMessage: e.validationMessage }));
        });
        console.log("Invalid UI Elements:", invalidElements);
    }

    await page.getByRole('button', { name: /Create Account/i }).click();
    await page.waitForTimeout(2000);
    console.log("Current URL after 2s:", page.url());

    // Check for any visible text that looks like a validation error
    const pageText = await page.evaluate(() => document.body.innerText);
    console.log("Page Text:", pageText);

    await browser.close();
})();
