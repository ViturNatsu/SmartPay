import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { TextField, Button, Box, Typography } from "@mui/material";
import { sendVerifyCode } from "../api/authApi";
import { useAuth } from "../context/AuthContext";

export const VerifyOtp = () => {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const emailParam = searchParams.get("email");
  const typeParam = searchParams.get("type");
  const codeParam = searchParams.get("code");

  const { getMyUser } = useAuth();
  
  const submit = async (submittedCode) => {
    setError("");
    if (!/^[0-9]{7}$/.test(submittedCode)) {
      setError("Enter a valid 7-digit code.");
      return;
    }

    try {
      setLoading(true);
      const res = await sendVerifyCode({ email: emailParam, code: submittedCode, type: typeParam });

      switch (typeParam) {
        case "login":
            getMyUser();
            navigate(`/`);
          break;
        case "register":
          navigate(`/login`);
          break;
        case "forgot-password":
          navigate(`/reset-password?email=${encodeURIComponent(emailParam)}&code=${submittedCode}`);
          break;
        default:
          setError("Unknown verification type.");
      }
    } catch (err) {
      if (err.status === 400) setError("Code is invalid.");
      else if (err.status === 401) setError("Code has expired or was already used.");
      else if (err.status === 404) setError("Email not found.");
      else if (err.status === 429) setError("Too many attempts. Please try again later.");
      else setError(err.message || "Verification failed.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (emailParam && typeParam && codeParam) {
      setCode(codeParam);
      submit(codeParam);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [emailParam, typeParam, codeParam]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await submit(code);
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
        Verify Code
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
