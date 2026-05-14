import React, {useState, useEffect} from "react";
import { Navigate, useParams, useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import { Box, Button, Collapse, Divider, Paper, TextField, Typography } from "@mui/material";
import { createPaymentMethod } from "../../api/paymentmethods/paymentmethodApi";
import LockIcon from "@mui/icons-material/Lock";
import { useAuth } from "@/context/AuthContext";

const SANDBOX_TIMEOUT_MS = 15 * 60 * 1000; 


function SimulatedBankAuthorization() {
    const { user, tokenClaims, loading: authLoading, logout } = useAuth();
    const navigate = useNavigate();
    const {selectedBank} = useParams();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [errorMsg, setErrorMsg] = useState("");
    const [clickedSubmit, setClickedSubmit] = useState(false);
    const ERROR_TEXT = "Invalid sandbox credentials. Try again.";
    const [invalid, setInvalid] = useState(false);
    const INVALID_CREDENTIALS_MSG = "Invalid sandbox credentials. Try again.";
    const REQUIRED = "This field is required"

    useEffect(() => {
        const timeoutId = setTimeout(async () => {
            setUsername("");
            setPassword("");
            setInvalid(false);
            setErrorMsg("");

            await logout();
            navigate("/login", { replace: true });
        }, SANDBOX_TIMEOUT_MS);

        return () => clearTimeout(timeoutId);
    }, [logout, navigate]);


    const banks = new Map();
    banks.set("BMO", "001")
    banks.set("RBC", "003");
    banks.set("CIBC", "010");
    banks.set("TD", "004");
    banks.set("Scotiabank", "002");
    banks.set("National Bank", "006");
    banks.set("Desjardins", "815");
    banks.set("Tangerine", "614");

    if (!banks.has(selectedBank)) {
        return <Navigate to="/forbidden" /> 
    }

    const sandboxCredentials = {
        username: "user_good",
        password: "pass_good"
    }


    const handleSubmit = async (e) => {
        setClickedSubmit(true);
        e.preventDefault();
        if (username === sandboxCredentials.username && password === sandboxCredentials.password) {
            console.log("success verify!")
            setInvalid(false);
            setErrorMsg("");
            navigate(`/simulatedbankauthsuccess/${selectedBank}/${banks.get(selectedBank)}`)
        } else {
            setInvalid(true);
            setErrorMsg(ERROR_TEXT);
        }
    }

    const emptyUsername = (username === "")
    const emptyPassword = (password === "")
    const emptyFields = (emptyUsername || emptyPassword)

    return (
        <>
        <Navbar />
        
        <Box
          sx={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#f0f4f8",
            p: 2,
          }}
        >
            <Paper
                elevation={2}
                sx={{
                    width: "100%",
                    maxWidth: 420,
                    borderRadius: 4,
                    p: 4,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 2,
                    backgroundColor: "#ffffff",
                }}            
            >
                <Box
                    sx={{
                        width: 64,
                        height: 64,
                        borderRadius: "50%",
                        border: "3px solid #c8a84b",
                        backgroundColor: "#f5f5f5",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        mb: 1,
                    }}
                >
                    <LockIcon sx={{ fontSize: 30, color: "#c8a84b" }} />
                </Box>

                <Typography
                    variant="h6"
                    fontWeight={700}
                    textAlign="center"
                    color="text.primary"
                >
                    Simulated Bank Authorization (Sandbox)
                </Typography>

                <Typography
                    variant="body2"
                    textAlign="center"
                    color="text.secondary"
                    sx={{ maxWidth: 320, lineHeight: 1.6 }}
                >
                    You selected: {selectedBank}
                </Typography>

                <Paper
                    variant="outlined"
                    sx={{
                        width: "100%",
                        borderRadius: 3,
                        overflow: "hidden",
                        border: "1px solid #e0e0e0",
                        mt: 1,
                    }}
                >
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            px: 2,
                            py: 1.25,
                        }}
                    >
                        
                        <Typography 
                            variant="body2"
                            color="text.secondary"
                            sx={{ minWidth: 90 }}
                        >
                            Sandbox Username:
                        </Typography>
                        <TextField
                            label="username"
                            variant="standard"
                            fullWidth
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            sx={{ ml: 1 }}
                            error={emptyUsername}
                            helperText={emptyUsername ? REQUIRED : ""}
                        >
                        </TextField>
                    </Box>

                    <Divider sx={{ borderColor: "#e0e0e0" }}></Divider>

                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            px: 2,
                            py: 1.25,
                        }}
                    >
                        <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ minWidth: 90 }}
                        >
                            Sandbox Password:
                        </Typography>
                        <TextField
                            label="password"
                            variant="standard"
                            fullWidth
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            sx={{ ml: 1 }}
                            error={emptyPassword}
                            helperText={emptyPassword ? REQUIRED : ""}
                        >
                        </TextField>
                    </Box>
                </Paper>

                <Collapse in={invalid} sx={{ width: '100%' }}>
                    <Typography
                        variant="caption"
                        sx={{
                        color: "error.main",
                        textAlign: "center",
                        display: "block",
                        mt: 1,
                        fontWeight: 500,
                        }}
                    >
                        {INVALID_CREDENTIALS_MSG}
                    </Typography>
                </Collapse>

                <Button
                    fullWidth
                    variant="contained"
                    onClick={handleSubmit}
                    sx={{
                        mt: 1,
                        py: 1.6,
                        borderRadius: 3,
                        backgroundColor: "#7dd6e8",
                        color: "#1a1a2e",
                        fontWeight: 700,
                        fontSize: "1rem",
                        textTransform: "none",
                        boxShadow: "none",
                        "&:hover": {
                        backgroundColor: "#5ec8de",
                        boxShadow: "none",
                        },
                        "&:active": {
                        backgroundColor: "#43bbd5",
                        },
                    }}
                    disabled={emptyFields}
                >
                    Submit
                </Button>

                <Button
                    fullWidth
                    variant="text"
                    onClick={() => navigate("/payment-methods")}
                    sx={{
                        py: 1.2,
                        borderRadius: 3,
                        color: "text.secondary",
                        fontWeight: 500,
                        fontSize: "0.95rem",
                        textTransform: "none",
                        "&:hover": {
                        backgroundColor: "#f5f5f5",
                        color: "text.primary",
                        },
                    }}
                >
                    Cancel
                </Button>
            </Paper>
        </Box>
        </>
    )
}

export default SimulatedBankAuthorization;