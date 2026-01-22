import { useState } from "react";
import { Box, TextField, Button, Typography } from "@mui/material";
import { resetPassword } from "../api/authApi";
import { useNavigate, useSearchParams } from "react-router-dom";

export const ResetPassword = () => {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [searchParams] = useSearchParams();
    const emailParam = searchParams.get("email");
    const codeParam = searchParams.get("code");

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (password.length < 8) {
            setError("Password must be at least 8 characters.");
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        try {
            setLoading(true);

            await resetPassword({ "email": emailParam, "password1": password, "password2": confirmPassword, "access-code": codeParam })
            navigate('/login');
        } catch (err){
            if (err.status === 400) setError("Passwords don't match");
            if (err.status === 401) setError("Reset code has expired");
            if (err.status === 422) setError("Password is too weak");
        } finally {
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
                width: 320,
                margin: "100px auto",
            }}
        >
            <Typography variant="h5" align="center">
                Reset Password
            </Typography>

            <TextField
                label="New Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
            />

            <TextField
                label="Confirm Password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                error={Boolean(error)}
                helperText={error || ""}
                required
            />

            <Button type="submit" variant="contained" disabled={loading}>
                {loading ? "Saving..." : "Reset Password"}
            </Button>
        </Box>
    );
};
