import { Button, Card, Stack, Typography } from "@mui/material";
import { tokens } from "@/style/Theme";
import {
  formatRecurringAmount,
  formatRecurringDate,
  formatRecurringSchedule,
} from "@/utils/recurringPaymentFormatters";

/**
 * Displays a single bill recurring payment.
 *
 * @param {{ id: number, name: string, amount: string, schedule: string, date: string }} payee
 */
export default function RecurringPayeeCard({ payee }) {
  return (
    <Card sx={{ p: tokens.card.padding, mb: 2 }}>
      <Typography fontWeight={tokens.typography.fontWeight.bold}>
        {payee.name}
      </Typography>

      <Typography variant="body2">
        ${formatRecurringAmount(payee.amount)}
      </Typography>

      <Typography variant="body2">
        Due {formatRecurringDate(payee.date)} • {formatRecurringSchedule(payee.schedule)}
      </Typography>

      <Stack direction="row" spacing={tokens.card.actionGap} sx={{ mt: 1.5 }}>
        <Button variant="contained" size="small">
          View
        </Button>
        <Button variant="outlined" size="small">
          Edit
        </Button>
        <Button variant="outlined" size="small">
          Cancel
        </Button>
      </Stack>
    </Card>
  );
}
