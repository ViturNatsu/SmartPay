import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { tokens } from "@/style/Theme";
import {
  formatTransactionAmount,
  formatTransactionDate,
  getMerchantPayee,
  isInflow,
} from "@/utils/walletTransactionFormatters";

const headerCellSx = {
  fontSize: 13,
  color: tokens.color.text.muted,
  fontWeight: 600,
  borderBottom: `1px solid ${tokens.color.border.light}`,
};

/**
 * Wallet Activity table — clickable, keyboard-accessible rows with optional
 * active highlight.
 *
 * @param {Array}  transactions
 * @param {string} selectedId   - transactionId to highlight as active
 * @param {function} onSelect   - called with the full transaction object on row activation
 */
export function WalletActivityTable({ transactions, selectedId, onSelect }) {
  return (
    <Table sx={{ width: "100%" }} aria-label="Wallet activity transactions">
      <TableHead>
        <TableRow>
          <TableCell scope="col" sx={headerCellSx}>Merchant</TableCell>
          <TableCell scope="col" sx={headerCellSx}>Date</TableCell>
          <TableCell scope="col" sx={headerCellSx}>Amount</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {transactions.map((tx) => {
          const active = tx.transactionId === selectedId;
          const inflow = isInflow(tx.type);
          const merchant = getMerchantPayee(tx);

          return (
            <TableRow
              key={tx.transactionId}
              hover
              onClick={() => onSelect(tx)}
              role="button"
              tabIndex={0}
              aria-label={`View details for ${merchant}`}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onSelect(tx);
                }
              }}
              sx={{
                cursor: "pointer",
                background: active ? tokens.color.brand.primaryLight : "transparent",
                borderLeft: active
                  ? `4px solid ${tokens.color.brand.primary}`
                  : "4px solid transparent",
                transition: "background 0.2s",
                "&:hover": {
                  background: active
                    ? tokens.color.brand.primaryLight
                    : tokens.color.background.app,
                },
                "&:focus-visible": {
                  outline: `2px solid ${tokens.color.brand.primary}`,
                  outlineOffset: "-2px",
                },
                "& td": { borderTop: `1px solid ${tokens.color.border.light}`, py: 1.75 },
              }}
            >
              <TableCell>
                <Typography sx={{ fontSize: 15, fontWeight: 600, color: tokens.color.text.primary }}>
                  {merchant}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography sx={{ fontSize: 15, fontWeight: 500, color: tokens.color.text.primary }}>
                  {formatTransactionDate(tx.createdAt)}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography
                  sx={{
                    fontSize: 15,
                    fontWeight: 800,
                    color: inflow ? tokens.color.status.success : tokens.color.status.error,
                  }}
                >
                  {formatTransactionAmount(tx.type, tx.amount)}
                </Typography>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
