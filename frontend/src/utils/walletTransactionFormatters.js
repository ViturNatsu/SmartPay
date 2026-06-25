const INFLOW_TYPES = ["LOAD", "DEPOSIT"];

export function isInflow(type) {
  return INFLOW_TYPES.includes(type);
}

/** Returns the value or "N/A" for missing/empty fields (Scenario 3). */
export function displayValue(value) {
  if (value == null || value === "") return "N/A";
  return String(value);
}

export function formatTransactionDate(isoDate) {
  if (!isoDate) return "N/A";
  return new Date(isoDate).toLocaleString("en-CA", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function formatTransactionAmount(type, amount) {
  if (amount == null) return "N/A";
  const value = Number(amount).toLocaleString("en-CA", {
    style: "currency",
    currency: "CAD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return isInflow(type) ? `+${value}` : `-${value}`;
}

export function getMerchantPayee(tx) {
  return displayValue(tx?.description);
}

export function getPaymentMethodLabel(tx) {
  if (!tx) return "N/A";
  return "SmartPay Virtual Card";
}
