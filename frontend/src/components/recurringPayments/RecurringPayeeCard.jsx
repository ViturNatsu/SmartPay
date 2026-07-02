import {
  Button,
  Card,
  Stack,
  Typography,
} from "@mui/material";
import { tokens } from "@/style/Theme";

export default function RecurringPayeeCard({
  payee,
  formatAmount,
  formatDueDate,
  formatSchedule,
}) {
  return (
    <Card sx={{ p: tokens.card.padding, mb: 2 }}>
      <Typography fontWeight={tokens.typography.fontWeight.bold}>
        {payee.name}
      </Typography>

      <Typography variant="body2">
        ${formatAmount(payee.amount)}
      </Typography>

      <Typography variant="body2">
        Due {formatDueDate(payee.date)} • {formatSchedule(payee.schedule)}
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