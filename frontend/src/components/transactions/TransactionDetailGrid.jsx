import { Box, Typography } from "@mui/material";
import { tokens } from "@/style/Theme";
import {
  displayValue,
  formatTransactionAmount,
  formatTransactionDate,
  getMerchantPayee,
  getPaymentMethodLabel,
  isInflow,
} from "@/utils/walletTransactionFormatters";

function DetailItem({ label, value, valueColor }) {
  return (
    <Box
      sx={{
        background: tokens.color.background.app,
        p: 2.5,
        borderRadius: `${tokens.borderRadius.large}px`,
        border: `1px solid ${tokens.color.border.light}`,
      }}
    >
      <Typography sx={{ fontSize: 13, fontWeight: 700, color: tokens.color.text.muted, mb: 0.75 }}>
        {label}
      </Typography>
      <Typography
        sx={{
          fontSize: 17,
          fontWeight: tokens.typography.fontWeight.bold,
          color: valueColor ?? tokens.color.text.primary,
          wordBreak: "break-word",
        }}
      >
        {value}
      </Typography>
    </Box>
  );
}

/**
 * Labeled grid of core transaction fields for the details page.
 *
 * @param {object} transaction - WalletTransactionDTO from the API
 */
export function TransactionDetailGrid({ transaction }) {
  const inflow = isInflow(transaction?.type);
  const amountColor = inflow ? tokens.color.status.success : tokens.color.status.error;

  const fields = [
    {
      label: "Amount",
      value: transaction?.amount != null
        ? formatTransactionAmount(transaction.type, transaction.amount)
        : "N/A",
      valueColor: transaction?.amount != null ? amountColor : undefined,
    },
    { label: "Date", value: formatTransactionDate(transaction?.createdAt) },
    { label: "Merchant / Payee", value: getMerchantPayee(transaction) },
    { label: "Transaction ID", value: displayValue(transaction?.transactionId) },
    { label: "Payment Method", value: getPaymentMethodLabel(transaction) },
  ];

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
        gap: 3,
        mt: 2.5,
      }}
    >
      {fields.map(({ label, value, valueColor }) => (
        <DetailItem key={label} label={label} value={value} valueColor={valueColor} />
      ))}
    </Box>
  );
}
