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

import { tokens } from "@/style/Theme.jsx";
import {BasicPageLayout} from "@/components/customComponents/pageLayout/BasicPageLayout.jsx";
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
  const successMessage =
    "has been saved as a payee. You can now send money to this recipient from your SmartPay wallet.";

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
      setRecipientErr(error.message || "Unable to add payee");
    }
    setLoading(false);
  };

  return (


    <BasicPageLayout
      title="Add a Payee"
      subtitle="Enter the recipient details below to save them as a payee for future SmartPay transfers."
    >
      {!payeeSaved ? (
        <Stack spacing={3}>
          <Card
            sx={{
              borderRadius: 2,
              boxShadow: tokens.shadow.smallDark,
            }}
          >
            <CardContent
              sx={{ p: 3, display: "flex", justifyContent: "center" }}
            >
              <Box sx={{ m: 2, width: "100%" }}>
                <Grid container spacing={3}>
                  <Grid size={12}>
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
                        helperText={
                          recipientNameErr ? recipientNameErr : " "
                        }
                        slotProps={{
                          formHelperText: {
                            sx: {
                              height: 20,
                              margin: 0,

                              px: "12px",
                            },
                          },
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
                  <Grid size={12}>
                    <FormControl fullWidth sx={{ height: 100 }}>
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
                        onChange={(e) =>
                          setRecipientIdentifier(e.target.value)
                        }
                        error={recipientErr ? true : false}
                        helperText={recipientErr ? recipientErr : " "}
                        slotProps={{
                          formHelperText: {
                            sx: {
                              height: 20,
                              margin: 0,

                              px: "12px",
                            },
                          },
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
                      onClick={()=> navigate(-1)}
                      sx={{
                        height: 44,
                        minWidth: "111px",


                        boxShadow: tokens.shadow.grey,
                        "&:hover": {
                          boxShadow: tokens.shadow.greyHover,
                        },
                        borderRadius: "12px",
                        border: `1px solid ${tokens.color.border.grayLight}`,
                      }}
                    >
                      <Typography
                        variant="subtitle"
                        sx={{
                          fontWeight: 750,
                          color: tokens.color.text.black,
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
                        minWidth: "111px",
                        background:
                        tokens.color.button.gradientBg,

                        boxShadow: tokens.shadow.cyan,
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
      ) : (
        <SuccessCard
          data={savedPayee?.payeeName}
          primaryButtonText={"Send Money"}
          onPrimaryClick={() => navigate("/make-a-payment")}
          title={successTitle}
          message={successMessage}
          secondaryButtonText={""}
          onSecondaryClick={""}
        />
      )}
    </BasicPageLayout>
  );
};

export default AddPayee;
