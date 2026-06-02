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
import SuccessCard from "../../components/SuccessCard";
import { useNavigate } from "react-router-dom";

const AddPayee = () => {
  const navigate = useNavigate();
  const [recipientName, setRecipientName] = useState("");
  const [recipientIdentifier, setRecipientIdentifier] = useState("");

  const [recipientNameErr, setRecipientNameErr] = useState("");
  const [recipientErr, setRecipientErr] = useState("");

  const [payeeSaved, setPayeeSaved] = useState(false);
  const [savedPayee, setSavedPayee] = useState(null);

  const [loading, setLoading] = useState(false);

  const successTitle = "Payee Added";
  const successMessage = "has been saved as a payee. You can now send money to this recipient from your SmartPay wallet.";
  
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

      const res = await addPayee(payload);

      setSavedPayee(res);
      setPayeeSaved(true);

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
      
      <Box sx={{ minHeight: "100vh", bgcolor: "#F8FAFC", py: 4,}}>
        {!payeeSaved? (
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
                <Box sx={{ m: 2, width:"100%"}}>
                  <Grid container spacing={3}>
                    <Grid size={12} >
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
                          helperText = {recipientNameErr? recipientNameErr:" "}
                          slotProps={{
                            formHelperText:{
                              sx:{
                                height: 20,
                                margin: 0,
                                
                                px:"12px"
                            
                              } 
                            }
                          }}
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              borderRadius: "12px",
                              height: 56,
                            
                            },
                          }}
                        ></TextField>
                      </FormControl>
                    </Grid>
                    <Grid size={12} >
                      <FormControl fullWidth sx={{height: 100}}>
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
                          helperText = {recipientErr? recipientErr : " "}
                          slotProps={{
                            formHelperText:{
                              sx:{
                                height:20,
                                margin: 0,
                               
                                
                                px:"12px"
                                
                              } 
                            }
                          }}
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              borderRadius: "12px",
                              height: 56
                            },
                          }}
                        ></TextField>
                      </FormControl>
                    </Grid>

                    <Grid
                      size={12}
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
        ) : <SuccessCard data={savedPayee?.payeeName} primaryButtonText={"Send Money"} onPrimaryClick={()=> navigate("/make-a-payment")} title={successTitle} message={successMessage}/>}
      </Box>
    </div>
  );
};

export default AddPayee;
