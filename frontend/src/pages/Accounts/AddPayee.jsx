import Navbar from "@/components/Navbar";
import {
  Box,
  Container,
  Stack,
  Typography,
  Card,
  CardContent,
  FormControl,
  FormLabel,
  TextField,
  Button,
  Grid,
} from "@mui/material";

import React, { useState } from "react";
import { addPayee } from "../../api/payee/payeeApi";

const AddPayee = () => {
  const [recipientName, setRecipientName] = useState("");
  const [recipientIdentifier, setRecipientIdentifier] = useState("");

  const [recipientNameErr, setRecipientNameErr] = useState("");
  const [recipientErr, setRecipientErr] = useState("");

  const [loading, setLoading] = useState(false);

  const validateEmail = (value) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  };

  const validatePhone = (value) => {
    return /^\d{10}$/.test(value);
  };

  const handleSavePayee = async () => {
    setRecipientNameErr("");
    setRecipientErr("");

    if (!recipientName.trim()) {
      setRecipientNameErr("Please enter a valid payee name");
      return;
    }

    const isValidEmail = validateEmail(recipientIdentifier);
    const isValidPhone = validatePhone(recipientIdentifier);

    if (!isValidEmail && !isValidPhone) {
      setRecipientErr("Please enter a valid email or phone number");
      return;
    }

    try {
      setLoading(true);
      const payload = {
        payeeName: recipientName,
        recipientIdentifier,
      };

      const savedPayee = await addPayee(payload);

      setRecipientName("");
      setRecipientIdentifier("");
    } catch (error) {
      setRecipientErr(error.message|| "Unable to add payee");
    }
    setLoading(false);
  };

  return (
    <div>
      <Navbar />
      <Box sx={{ minHeight: "100vh", bgcolor: "#F8FAFC", py: 4 }}>
        <Container maxWidth="md">
          <Stack spacing={3}>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                Add a Payee
              </Typography>
              <Typography sx={{ color: "text.secondary" }}>
                Enter the recipient details below to save them as a payee for
                future SmartPay transfers.
              </Typography>
            </Box>

            <Card
              sx={{
                borderRadius: 2,
                boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
              }}
            >
              <CardContent
                sx={{ p: 3, display: "flex", justifyContent: "center" }}
              >
                <Box sx={{ m: 2 }}>
                  <Grid container spacing={3} columns={1}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <FormControl fullWidth>
                        <FormLabel>
                          <Typography
                            variant="subtitle1"
                            sx={{ fontWeight: 600, mb: 0.5 }}
                          >
                            Payee Name
                          </Typography>
                        </FormLabel>

                        <TextField
                          id="recipientName"
                          name="recipientName"
                          type="text"
                          placeholder="John Smith"
                          required
                          fullWidth
                          variant="outlined"
                          value={recipientName}
                          onChange={(e) => setRecipientName(e.target.value)}
                          error={recipientNameErr ? true : false}
                          helperText = {recipientNameErr}
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              borderRadius: "12px",
                            },
                          }}
                        ></TextField>
                      </FormControl>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <FormControl fullWidth>
                        <FormLabel>
                          <Typography
                            variant="subtitle1"
                            sx={{ fontWeight: 600, mb: 0.5 }}
                          >
                            Payee Email or Phone Number
                          </Typography>
                        </FormLabel>

                        <TextField
                          id="recipientIdentifier"
                          name="recipientIdentifier"
                          type="text"
                          placeholder="Test@example.com or 4161234567"
                          required
                          fullWidth
                          variant="outlined"
                          value={recipientIdentifier}
                          onChange={(e)=>setRecipientIdentifier(e.target.value)}
                          error={recipientErr? true:false}
                          helperText = {recipientErr}
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              borderRadius: "12px",
                            },
                          }}
                        ></TextField>
                      </FormControl>
                    </Grid>

                    <Grid
                      size={{ xs: 12 }}
                      sx={{
                        display: "flex",
                        justifyContent: "flex-end",
                        gap: 2,
                      }}
                    >
                      <Button
                        variant="outlined"
                        sx={{
                          height: 44,

                          boxShadow: "0 10px 20px rgba(149, 145, 145, 0.13)",
                          borderRadius: "12px",
                          border: "1px solid #d1d5db",
                        }}
                      >
                        <Typography
                          variant="subtitle"
                          sx={{
                            fontWeight: 750,
                            color: "black",
                            textTransform: "none",
                          }}
                        >
                          Cancel
                        </Typography>
                      </Button>
                      <Button
                        variant="contained"
                        onClick={handleSavePayee}
                        sx={{
                          height: 44,
                          background:
                            "linear-gradient(135deg, #008c99, #00a8b5)",
                          boxShadow: "0 10px 20px rgba(0, 151, 167, .16)",
                          borderRadius: "12px",
                        }}
                      >
                        <Typography
                          variant="subtitle"
                          sx={{ fontWeight: 750, textTransform: "none" }}
                        >
                          Save Payee
                        </Typography>
                      </Button>
                    </Grid>
                  </Grid>
                </Box>
              </CardContent>
            </Card>
          </Stack>
        </Container>
      </Box>
    </div>
  );
};

export default AddPayee;
