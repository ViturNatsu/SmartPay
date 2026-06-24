/**
 * Filter bar UI
 */
import { ToggleButton, ToggleButtonGroup } from '@mui/material';
import { TRANSACTION_FILTERS } from '../../utils/transactionUtils';
import { useTheme } from '@mui/material/styles';

export default function TransactionFilterBar({ activeFilter, onChange }) {
  const theme = useTheme();
  return (
    <ToggleButtonGroup
      value={activeFilter}
      exclusive
      onChange={(_, next) => next && onChange(next)}
      size="small"
      sx={{ mb: 2 }}
    >
      {Object.entries(TRANSACTION_FILTERS).map(([key, { label }]) => (
        <ToggleButton key={key} value={key}>
          {label}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  );
}
