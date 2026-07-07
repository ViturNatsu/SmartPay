/**
 * Column defs together with grid component for transaction table
 */

import { Chip, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { DataGrid } from '@mui/x-data-grid';
import CustomNoRowsOverlay from './CustomNoRowOverlay';
import {getRailLabel} from "@/utils/transactionRailUtils";

const STATUS_COLOR = {
  COMPLETED: 'success',
  PENDING: 'warning',
  FAILED: 'error',
};

const dateColumn = {
  field: 'date',
  headerName: 'Date',
  flex: 1,
  valueFormatter: (value) =>
    new Date(value).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }),
};

function AmountCell({ value }) {
  const theme = useTheme();
  const isInflow = value > 0;
  return (
    <Typography
      variant="body2"
      fontWeight={theme.typography.fontWeightBold}
      color={isInflow ? 'success.main' : 'error.main'}
    >
      {isInflow ? '+' : '-'}${Math.abs(value).toFixed(2)}
    </Typography>
  );
}

const amountColumn = {
  field: 'amount',
  headerName: 'Amount',
  flex: 1,
  renderCell: (params) => <AmountCell value={params.value} />,
};

const paymentTypeColumn = {
  field: 'railType',
  headerName: 'Payment Type',
  flex: 1,
  valueFormatter: (value) => getRailLabel(value),
};

const statusColumn = {
  field: 'status',
  headerName: 'Status',
  flex: 1,
  renderCell: (params) => (
    <Chip
      label={params.value}
      size="small"
      color={STATUS_COLOR[params.value] ?? 'default'}
      variant="outlined"
    />
  ),
};

const transactionColumns = [
  { field: 'label', headerName: 'Name', flex: 1.5 },
  dateColumn,
  paymentTypeColumn,
  statusColumn,
  amountColumn,
];

export function TransactionTable({ rows, onRowClick }) {
  return (
    <DataGrid
          rows={rows}
          columns={transactionColumns}
          onRowClick={onRowClick}
          sx={{ cursor: 'pointer', border: 'none' }}
          autoHeight
          disableRowSelectionOnClick
          initialState={{
            pagination: { paginationModel: { pageSize: 10 } },
          }}
          pageSizeOptions={[10, 25, 50]}
          slots={{
            noRowsOverlay: CustomNoRowsOverlay,
          }}
        />
  )
};
