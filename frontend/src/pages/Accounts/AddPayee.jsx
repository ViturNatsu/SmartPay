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

import React from "react";

const AddPayee = () => {
  return (
    <div>
      <Navbar />
      <Box sx={{ minHeight: "100vh", bgcolor: "#F8FAFC", py: 4, }}>
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
                <Box sx={{ m: 2, }}>
                  <Grid container spacing={3} columns={1}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <FormControl fullWidth>
                        <FormLabel>
                          <Typography
                            variant="subtitle"
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
                           sx={{
                            "& .MuiOutlinedInput-root":{
                              borderRadius:"12px"
                            }
                          }}
                        ></TextField>
                      </FormControl>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <FormControl fullWidth>
                        <FormLabel>
                          <Typography
                            variant="subtitle"
                            sx={{ fontWeight: 600, mb: 0.5 }}
                          >
                            Payee Email or Phone Number
                          </Typography>
                        </FormLabel>

                        <TextField
                          id="emailNum"
                          name="emailNum"
                          type="text"
                          placeholder="Test@example.com or 4161234567"
                          required
                          fullWidth
                          variant="outlined"
                          sx={{
                            "& .MuiOutlinedInput-root":{
                              borderRadius:"12px"
                            }
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
                      <Button variant="outlined" sx={{
                          height: 44,
                          
                          boxShadow: "0 10px 20px rgba(149, 145, 145, 0.13)",
                          borderRadius:"12px",
                          border:"1px solid #d1d5db"


                        }}><Typography
                            variant="subtitle"
                            sx={{ fontWeight: 750, color:"black"}}
                          >
                            Cancel
                          </Typography></Button>
                      <Button
                        variant="contained"
                        sx={{
                          height: 44,
                          background:
                            "linear-gradient(135deg, #008c99, #00a8b5)",
                          boxShadow: "0 10px 20px rgba(0, 151, 167, .16)",
                          borderRadius:"12px"
                         

                        }}
                      >
                        <Typography
                            variant="subtitle"
                            sx={{ fontWeight: 750}}
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
