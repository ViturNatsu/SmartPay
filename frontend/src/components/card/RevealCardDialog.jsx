import {useState, useEffect} from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Typography,
  Alert,
  Link,
  Box,
} from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import {requestResetCode, sendVerifyCode} from "@/api/authApi";

/**
 * OTP verification dialog for revealing card details.
 *
 * Responsibilities (SRP):
 *  - Request an OTP email when the dialog opens.
 *  - Accept the 7-digit code and verify it against the backend.
 *  - Call onSuccess() when verification passes so the parent can reveal the card.
 *
 * @param {boolean}  open      - Controlled open state
 * @param {string}   email     - User's email address (used to send and verify OTP)
 * @param {function} onSuccess - Called on successful OTP verification
 * @param {function} onClose   - Called when the dialog should close
 */
export function RevealCardDialog({open, email, onSuccess, onClose}) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);

  // Send OTP as soon as the dialog opens
  useEffect(() => {
    if (!open || !email) return;
    setCode("");
    setError("");
    setSentSuccess(false);
    sendOtp();
  }, [open]);

  const sendOtp = async () => {
    try {
      await requestResetCode({email, type: "reveal-card"});
      setSentSuccess(true);
    } catch (err) {
      if (err.status === 429)
        setError("Too many attempts. Please try again later.");
      else setError("Failed to send verification code. Please try again.");
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError("");

    if (!/^[0-9]{7}$/.test(code)) {
      setError("Enter a valid 7-digit code.");
      return;
    }

    try {
      setLoading(true);
      await sendVerifyCode({email, code, type: "reveal-card"});
      onSuccess();
      onClose();
    } catch (err) {
      if (err.status === 400) setError("Code is invalid.");
      else if (err.status === 401)
        setError("Code has expired or was already used.");
      else if (err.status === 429)
        setError("Too many attempts. Please try again later.");
      else if (err.status === 410)
        setError("Too many invalid attempts. Please request a new code.");
      else setError(err.message || "Verification failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResendLoading(true);
    setError("");
    setSentSuccess(false);
    try {
      await requestResetCode({email, type: "reveal-card"});
      setSentSuccess(true);
    } catch (err) {
      if (err.status === 429)
        setError("Too many attempts. Please try again later.");
      else setError("Failed to resend code. Please try again.");
    } finally {
      setResendLoading(false);
    }
  };

  const handleClose = () => {
    setCode("");
    setError("");
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{display: "flex", alignItems: "center", gap: 1, pb: 1}}>
        <LockOutlinedIcon fontSize="small" color="primary" />
        Verify Your Identity
      </DialogTitle>

      <DialogContent>
        <Typography variant="body2" sx={{mb: 2}}>
          A 7-digit verification code has been sent to <strong>{email}</strong>.
          Enter it below to reveal your card details.
        </Typography>

        {sentSuccess && !error && (
          <Alert severity="success" sx={{mb: 2}}>
            Code sent - check your email.
          </Alert>
        )}

        {error && (
          <Alert severity="error" sx={{mb: 2}}>
            {error}
          </Alert>
        )}

        <Box component="form" id="reveal-card-form" onSubmit={handleSubmit}>
          <TextField
            label="7-digit code"
            value={code}
            onChange={e => setCode(e.target.value)}
            inputProps={{maxLength: 7}}
            fullWidth
            autoFocus
            required
          />
        </Box>

        <Typography sx={{fontSize: 13, color: "text.secondary", mt: 1.5}}>
          Didn't receive it?{" "}
          <Link
            component="button"
            type="button"
            underline="hover"
            onClick={handleResend}
            disabled={resendLoading}
            sx={{fontWeight: 700, cursor: "pointer"}}
          >
            {resendLoading ? "Resending..." : "Resend Code"}
          </Link>
        </Typography>
      </DialogContent>

      <DialogActions sx={{px: 3, pb: 3, gap: 1}}>
        <Button variant="outlined" onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          type="submit"
          form="reveal-card-form"
          variant="contained"
          disabled={loading || code.length !== 7}
        >
          {loading ? "Verifying..." : "Verify"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
