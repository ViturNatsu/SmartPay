import {
  Box,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";
import { useSearchParams } from "react-router-dom";
import { useOtpVerify } from "@/hooks/OtpHooks/OtpVerify/OtpVerifyBase/useOtpVerify.js";
import { useAuth } from "@/context/AuthContext.jsx";
import { useEffect, useRef } from "react";

const isActive = (cardStatus) => cardStatus === "ACTIVE";

export const LockCardRedirectDialog = ({
                                         cardStatus,
                                         open,
                                         onOpen,
                                         onClose,
                                         onSuccess,
                                       }) => {
  const [searchParams] = useSearchParams();
  const { tokenClaims } = useAuth();

  const { sendOtpVerify, loading, error } = useOtpVerify();

  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const code = searchParams.get("code");
    const type = searchParams.get("type");

    if (!code || !type) return;

    onOpen(true);

    sendOtpVerify({
      email: tokenClaims?.email,
      code,
      type,
    })
      .then(() => {
        onSuccess(
          isActive(cardStatus)
            ? "Card Locked Successfully"
            : "Card Unlocked Successfully"
        );
        onClose();
      })
      .catch(console.error);
  }, []);

  return (
    <Dialog
      open={open}
      onClose={(event, reason) => {
        if (loading) return; // prevent closing while verifying
        onClose(event, reason);
      }}
      maxWidth="xs"
      fullWidth
    >
      <DialogTitle sx={{ textAlign: "center" }}>
        {loading ? "Verifying Code..." : error ? "Verification Failed" : "Verifying Code"}
      </DialogTitle>

      <DialogContent sx={{ py: 3 }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            gap: 2,
          }}
        >
          {!error && (
            <Typography variant="body2" color="text.secondary">
              {loading
                ? "Please wait while we verify your code"
                : "Verification complete"}
            </Typography>
          )}

          <Box
            sx={{
              width: "100%",
              maxWidth: 280,
              borderRadius: 2,
              border: "1px solid",
              borderColor: error ? "error.main" : "divider",
              backgroundColor: "background.paper",
              px: 2,
              py: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 2,
            }}
          >
            {loading && <CircularProgress size={22} />}

            {error ? (
              <Typography variant="body2" color="error">
                {error || "Something went wrong during verification."}
              </Typography>
            ) : (
              <Typography
                variant="body2"
                sx={{
                  fontFamily: "monospace",
                  letterSpacing: 1,
                  color: "text.secondary",
                }}
              >
                {loading ? "processing" : "done"}
              </Typography>
            )}
          </Box>

          <Typography variant="caption" color="text.secondary">
            {loading
              ? "This usually takes a few seconds"
              : error
                ? "Please try again later"
                : "Verification completed"}
          </Typography>
        </Box>
      </DialogContent>
    </Dialog>
  );
};