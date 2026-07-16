import { Button, Card, Stack, Typography } from "@mui/material";
import { tokens } from "@/style/Theme";
import {
  formatRecurringAmount,
  formatRecurringDate,
  formatRecurringSchedule,
} from "@/utils/recurringPaymentFormatters";

/**
 * Displays a single subscription recurring payment.
 *
 * @param {{ id: number, name: string, amount: string, schedule: string, nextPaymentDate: string }} subscription
 */
export default function RecurringSubscriptionCard({ subscription }) {
  return (
    <Card sx={{ p: tokens.card.padding, mb: 2 }}>
      <Typography fontWeight={tokens.typography.fontWeight.bold}>
        {subscription.name}
      </Typography>

      <Typography variant="body2">
        ${formatRecurringAmount(subscription.amount)}
      </Typography>

      <Typography variant="body2">
        Due {formatRecurringDate(subscription.nextPaymentDate)} •{" "}
        {formatRecurringSchedule(subscription.schedule)}
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
