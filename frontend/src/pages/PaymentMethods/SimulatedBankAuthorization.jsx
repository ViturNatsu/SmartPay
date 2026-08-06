import React, {useState, useEffect} from "react";
import { Navigate, useParams, useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import {Box, Button, Card, Collapse, Divider, Paper, TextField, Typography} from "@mui/material";
import { createPaymentMethod } from "../../api/paymentmethods/paymentmethodApi";
import LockIcon from "@mui/icons-material/Lock";
import { useAuth } from "@/context/AuthContext";


import { tokens } from "@/style/Theme.jsx";
import {BasicPageLayout} from "@/components/customComponents/pageLayout/BasicPageLayout.jsx";
function SimulatedBankAuthorization() {
    const { user, tokenClaims, loading: authLoading } = useAuth();
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
      <BasicPageLayout
        title={"Connect a Bank"}
        subtitle={"Authorize the bank connection."}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
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
              backgroundColor: tokens.color.background.surface,
            }}
          >
            <Box
              sx={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                border: `3px solid ${tokens.color.status.gold}`,
                backgroundColor: tokens.color.background.lightGray,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mb: 1,
              }}
            >
              <LockIcon sx={{ fontSize: 30, color: tokens.color.status.gold }} />
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
                border: `1px solid ${tokens.color.border.mediumGray}`,
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

              <Divider sx={{ borderColor: tokens.color.border.mediumGray }}></Divider>

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
                backgroundColor: tokens.color.brand.cyanLight,
                color: tokens.color.text.primary,
                fontWeight: 700,
                fontSize: "1rem",
                textTransform: "none",
                boxShadow: "none",
                "&:hover": {
                  backgroundColor: tokens.color.brand.cyan,
                  boxShadow: "none",
                },
                "&:active": {
                  backgroundColor: tokens.color.brand.cyanDark,
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
                  backgroundColor: tokens.color.background.lightGray,
                  color: "text.primary",
                },
              }}
            >
              Cancel
            </Button>
          </Paper>
        </Box>
      </BasicPageLayout>

    )
}

export default SimulatedBankAuthorization;