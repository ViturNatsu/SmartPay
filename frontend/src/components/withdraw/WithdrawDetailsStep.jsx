import { tokens } from "@/style/Theme.jsx";
import {
  Alert,
  Box,
  Button,
  DialogActions,
  DialogContent,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

/**
 * Step 1 of the withdrawal flow — Details.
 *
 * Renders the balance strip, destination account dropdown,
 * amount input, and real-time validation feedback (Scenarios 2 & 3).
 * All state changes are propagated upward via callbacks — this
 * component holds no local state
 */
function WithdrawDetailsStep({
  walletBalance,
  selectedMethod,
  paymentMethods,
  selectedMethodId,
  onSelectMethod,
  amountInput,
  onAmountChange,
  validationError,
  apiError,
  parsedAmount,
  onCancel,
  onContinue,
}) {
  return (
    <>
      <DialogContent dividers>
        <Typography variant="body2" sx={{color: tokens.color.text.subdued, mb: 2.5}}>
          Move money from your SmartPay wallet balance to one of your linked
          bank accounts.
        </Typography>

        {/* Balance strip — mini-cards (wireframe Step 2) */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 1.5,
            mb: 3,
          }}
        >
          <Box
            sx={{
              borderRadius: "14px",
              p: 2,
              bgcolor: tokens.color.background.panel,
              border: `1px solid ${tokens.color.border.light}`,
            }}
          >
            <Typography
              sx={{color: tokens.color.text.subdued, fontSize: 12, fontWeight: 700, mb: 0.75}}
            >
              Available Wallet Balance
            </Typography>
            <Typography sx={{fontSize: 20, fontWeight: 800}}>
              ${walletBalance.toFixed(2)}
            </Typography>
          </Box>
          <Box
            sx={{
              borderRadius: "14px",
              p: 2,
              bgcolor: tokens.color.background.panel,
              border: `1px solid ${tokens.color.border.light}`,
            }}
          >
            <Typography
              sx={{color: tokens.color.text.subdued, fontSize: 12, fontWeight: 700, mb: 0.75}}
            >
              Selected Destination
            </Typography>
            <Typography sx={{fontSize: 14, fontWeight: 700}}>
              {selectedMethod
                ? `${selectedMethod.bankDisplayName} ${selectedMethod.accountIdentifierMasked?.slice(2) ?? ""}`
                : "—"}
            </Typography>
          </Box>
        </Box>

        <Stack spacing={2.5}>
          {/* Destination dropdown — only verified linked accounts shown (Scenario 2) */}
          <FormControl fullWidth size="small">
            <InputLabel id="deposit-to-label">Deposit To</InputLabel>
            <Select
              labelId="deposit-to-label"
              value={selectedMethodId}
              label="Deposit To"
              onChange={e => onSelectMethod(e.target.value)}
            >
              {paymentMethods.map(m => (
                <MenuItem key={m.paymentMethodId} value={m.paymentMethodId}>
                  {m.bankDisplayName} {m.accountName}{" "}
                  {m.accountIdentifierMasked?.slice(2) ?? ""}
                </MenuItem>
              ))}
            </Select>
            <Typography sx={{mt: 0.75, fontSize: 12, color: tokens.color.text.subdued}}>
              Only verified linked bank accounts appear here.
            </Typography>
          </FormControl>

          {/* Amount input — real-time validation on every keystroke (Scenario 3) */}
          <Box>
            <TextField
              fullWidth
              size="small"
              label="Withdrawal Amount"
              placeholder="e.g. 150.00"
              value={amountInput}
              onChange={onAmountChange}
              error={Boolean(validationError)}
            />
            <Typography sx={{mt: 0.75, fontSize: 12, color: tokens.color.text.subdued}}>
              Amount must be greater than $0.00 and cannot exceed the wallet
              balance.
            </Typography>
          </Box>
        </Stack>

        {/* Real-time feedback: green when valid, red when invalid */}
        {!validationError &&
          parsedAmount > 0 &&
          parsedAmount <= walletBalance && (
            <Alert
              severity="success"
              sx={{mt: 2, borderRadius: "12px", fontSize: 13}}
            >
              <strong>Amount available.</strong> The requested withdrawal can be
              completed from your current wallet balance.
            </Alert>
          )}
        {validationError && (
          <Alert
            severity="error"
            sx={{mt: 2, borderRadius: "12px", fontSize: 13}}
          >
            {validationError}
          </Alert>
        )}
        {apiError && (
          <Alert
            severity="error"
            sx={{mt: 2, borderRadius: "12px", fontSize: 13}}
          >
            {apiError}
          </Alert>
        )}
      </DialogContent>

      <DialogActions sx={{px: 3, pb: 2.5}}>
        <Button
          onClick={onCancel}
          variant="outlined"
          sx={{textTransform: "none"}}
        >
          Cancel
        </Button>
        <Button
          onClick={onContinue}
          variant="contained"
          disabled={
            Boolean(validationError) || !amountInput || !selectedMethodId
          }
          sx={{
            textTransform: "none",
            bgcolor: tokens.color.brand.primary,
            "&:hover": {bgcolor: tokens.color.brand.primaryHover},
          }}
        >
          Continue
        </Button>
      </DialogActions>
    </>
  );
}

export default WithdrawDetailsStep;
