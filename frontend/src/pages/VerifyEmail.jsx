import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { TextField, Button, Box, Typography } from "@mui/material";
import { sendVerifyCode } from "../api/authApi";

export const VerifyEmail = () => {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const emailParam = searchParams.get("email");


  const handleSubmit = async (e) => {
    
    e.preventDefault();
    setError("");
    if (!/^\d{7}$/.test(code)) {
      setError("Enter a valid 7-digit code.");
      return;
    }
    try {
      setLoading(true);
      
      await sendVerifyCode({ email: emailParam, code, type: "forgot-password" }, { replace: true });
      
      navigate(`/reset-password?email=${encodeURIComponent(emailParam)}&code=${code}`);
    } catch (err) {
      if (err.status === 400) setError("Code is Invalid");
      if (err.status === 401) setError("Reset code has expired")
    }finally{
      setLoading(false);
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 2,
        width: 300,
        margin: "100px auto",
      }}
    >
      <Typography variant="h5" align="center">
        Verify Email
      </Typography>

      <TextField
        label="7-digit code"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        onBlur={() => {
          if (code && !/^\d{7}$/.test(code)) {
            setError("Enter a valid 7-digit code.");
          }
        }}
        error={Boolean(error)}
        helperText={error || ""}
        inputProps={{ maxLength: 7 }}
        required
      />

      <Button type="submit" variant="contained" disabled={loading}>
        {loading ? "Verifying Code..." : "Verify Code"}
      </Button>
    </Box>
  );
};
