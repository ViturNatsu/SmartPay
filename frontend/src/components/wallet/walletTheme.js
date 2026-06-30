import { tokens } from "@/style/Theme.jsx";
export const WALLET_COLORS = {
  primary: tokens.color.brand.primary,
  primaryDark: tokens.color.brand.primaryHover,
  muted: tokens.color.text.subdued,
  border: tokens.color.border.light,
  successBg: tokens.color.status.successBg,
  successBorder: tokens.color.status.successBorder,
  successText: tokens.color.status.success,
  errorBg: tokens.color.status.errorBg,
  errorBorder: tokens.color.status.errorBorder,
  errorText: tokens.color.status.error,
  warningBg: tokens.color.status.warningBg,
  warningBorder: tokens.color.status.warningBorder,
  warningText: tokens.color.status.warningText,
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
  color: tokens.color.text.white,
  boxShadow: "0 10px 20px rgba(15,116,144,0.18)",
  "&:hover": { bgcolor: WALLET_COLORS.primaryDark },
  "&:disabled": { bgcolor: tokens.color.text.muted, color: tokens.color.text.white },
};

export const secondaryButtonSx = {
  height: 46,
  px: 2.75,
  borderRadius: "12px",
  fontWeight: 800,
  fontSize: 14,
  textTransform: "none",
  border: `1px solid ${tokens.color.border.medium}`,
  bgcolor: tokens.color.background.surface,
  color: tokens.color.text.primary,
};
