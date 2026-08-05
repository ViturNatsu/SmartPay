/**
 * Validates a withdrawal amount string against business rules.
 * Extracted as a pure function so it can be tested independently
 * and reused without importing any React or MUI code (ISP / SRP).
 *
 * Returns an error message string, or null when the value is valid.
 *
 * @param {string} rawValue      - The raw string from the amount input field
 * @param {number} walletBalance - The user's current available wallet balance
 * @returns {string|null}
 */
export function validateWithdrawAmount(rawValue, walletBalance) {
  if (!rawValue || rawValue.trim() === "") return "Please enter an amount.";

  // Allow the user to type with or without a leading "$"
  const stripped = rawValue.replace(/^\$/, "").trim();
  const parsed = Number(stripped);

  if (isNaN(parsed) || stripped === "") return "Enter a valid currency format (e.g. 50.00)";
  if (parsed < 1) return "Amount must be at least $1.00";
  if (parsed > walletBalance)
    return `You cannot withdraw more than the Wallet balance ($${walletBalance.toFixed(2)})`;

  return null;
}
