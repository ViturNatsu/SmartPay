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

/**
 * Wallet Activity table — clickable rows with optional active highlight.
 *
 * @param {Array}  transactions
 * @param {string} selectedId   - transactionId to highlight as active
 * @param {function} onSelect   - called with the full transaction object on row click
 */
export function WalletActivityTable({ transactions, selectedId, onSelect }) {
  return (
    <Table sx={{ width: "100%" }}>
      <TableHead>
        <TableRow>
          <TableCell sx={{ fontSize: 13, color: tokens.color.text.muted, fontWeight: 600, borderBottom: `1px solid ${tokens.color.border.light}` }}>
            Merchant
          </TableCell>
          <TableCell sx={{ fontSize: 13, color: tokens.color.text.muted, fontWeight: 600, borderBottom: `1px solid ${tokens.color.border.light}` }}>
            Date
          </TableCell>
          <TableCell sx={{ fontSize: 13, color: tokens.color.text.muted, fontWeight: 600, borderBottom: `1px solid ${tokens.color.border.light}` }}>
            Amount
          </TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {transactions.map((tx) => {
          const active = tx.transactionId === selectedId;
          const inflow = isInflow(tx.type);

          return (
            <TableRow
              key={tx.transactionId}
              onClick={() => onSelect(tx)}
              sx={{
                cursor: "pointer",
                background: active ? tokens.color.brand.primaryLight : "transparent",
                borderLeft: active ? `4px solid ${tokens.color.brand.primary}` : "4px solid transparent",
                transition: "background 0.2s",
                "&:hover": {
                  background: active ? tokens.color.brand.primaryLight : "#f1f5f9",
                },
                "& td": { borderTop: `1px solid ${tokens.color.border.light}`, py: 1.75 },
              }}
            >
              <TableCell>
                <Typography sx={{ fontSize: 14 }}>{getMerchantPayee(tx)}</Typography>
              </TableCell>
              <TableCell>
                <Typography sx={{ fontSize: 14 }}>{formatTransactionDate(tx.createdAt)}</Typography>
              </TableCell>
              <TableCell>
                <Typography
                  sx={{
                    fontSize: 14,
                    fontWeight: 700,
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
