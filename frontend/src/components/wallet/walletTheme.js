export const WALLET_COLORS = {
  primary: "#0f7490",
  primaryDark: "#0a5a70",
  muted: "#64748b",
  border: "#e2e8f0",
  successBg: "#dcfce7",
  successBorder: "#86efac",
  successText: "#15803d",
  errorBg: "#fee2e2",
  errorBorder: "#fca5a5",
  errorText: "#b91c1c",
  warningBg: "#fff7ed",
  warningBorder: "#fdba74",
  warningText: "#c2410c",
};

export const MIN_LOAD_AMOUNT = 5;
export const MAX_LOAD_AMOUNT = 10000;

export function formatMoney(value) {
  return Number(value || 0).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function paymentMethodLabel(pm) {
  if (!pm) return "";
  const masked = pm.accountIdentifierMasked || "";
  const last4 = masked.length > 4 ? masked.slice(-4) : masked;
  return `${pm.bankDisplayName} •••• ${last4}`;
}

export const primaryButtonSx = {
  height: 46,
  px: 2.75,
  borderRadius: "12px",
  fontWeight: 800,
  fontSize: 14,
  textTransform: "none",
  bgcolor: WALLET_COLORS.primary,
  color: "#fff",
  boxShadow: "0 10px 20px rgba(15,116,144,0.18)",
  "&:hover": { bgcolor: WALLET_COLORS.primaryDark },
  "&:disabled": { bgcolor: "#94a3b8", color: "#fff" },
};

export const secondaryButtonSx = {
  height: 46,
  px: 2.75,
  borderRadius: "12px",
  fontWeight: 800,
  fontSize: 14,
  textTransform: "none",
  border: "1px solid #cbd5e1",
  bgcolor: "#fff",
  color: "#0d1b2a",
};
