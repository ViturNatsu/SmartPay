export const MIN_SPENDING_LIMIT = 1;
export const MAX_SPENDING_LIMIT = 10000;

/**
 * Validates a wallet spending-limit value.
 *
 * Applies to both daily and per-transaction spending limits.
 *
 * @param {string|number} rawValue - Value entered in the limit field
 * @param {string} fieldName - Name used in the validation message
 * @returns {string|null} Error message or null when valid
 */
export function validateSpendingLimit(
  rawValue,
  fieldName = "Spending limit"
) {
  if (
    rawValue === null ||
    rawValue === undefined ||
    String(rawValue).trim() === ""
  ) {
    return `${fieldName} is required.`;
  }

  const value = String(rawValue).trim();
  
  if (!/^\d+(\.\d{1,2})?$/.test(value)) {
    return `${fieldName} cannot have more than 2 decimal places.`;
  }

  const parsedValue = Number(value);

  if (!Number.isFinite(parsedValue)) {
    return `${fieldName} must be a valid numeric value.`;
  }

  if (parsedValue < MIN_SPENDING_LIMIT) {
    return `${fieldName} must be at least $1.00.`;
  }

  if (parsedValue > MAX_SPENDING_LIMIT) {
    return `${fieldName} cannot exceed $10,000.00.`;
  }

  return null;
}