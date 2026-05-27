import Navbar from "@/components/Navbar"
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  FormControl,
  FormLabel,
  LinearProgress,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { blue } from "@mui/material/colors";


export function MakeAPayment() {
  return (
    <>
      <Navbar />
      <Box sx={{ minHeight: "100vh", bgcolor: "#F8FAFC", py: 4 }}>
        <Container maxWidth="lg">
          <Stack spacing={3}>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                Send Money
              </Typography>
              <Typography sx={{ color: "text.secondary" }}>
                Send funds from your SmartPay Wallet to a user.
              </Typography>
            </Box>

            <Card
             
              sx={{
                borderRadius: 2,
                boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={2}
                  justifyContent="space-between"
                  alignItems={{ xs: "stretch", sm: "center" }}
                >
                  <Box
                  >
                    <FormControl>
                   <FormLabel><Typography variant="h7" sx={{ fontWeight: 600, mb: 0.5 }}>
                      Recipient Email or Phone Number
                    </Typography></FormLabel>
                       
                    <TextField
                    id="emailNum"
                    name="emailNum"
                    type="text"
                    placeholder="Test@fdm.com or 5141234567"
                    
                    required
                    fullWidth
                    variant="outlined"
                    
                    >
                    </TextField>
                      <FormLabel><Typography variant="h7" sx={{ fontWeight: 600, mb: 0.5 }}>
                      Amount (CAD)
                    </Typography></FormLabel>
                    <TextField
                    id="amount"
                    name="amount"
                    type="number"
                    placeholder="10.00"
                    
                    required
                    fullWidth
                    variant="outlined">
                      <Typography 
                      component={"span"}
                      variant="h8"
                      align="right"
                      > CAD</Typography>
                    </TextField>
                    

                    </FormControl>
                   
                  </Box>
                
                </Stack>
              </CardContent>
            </Card>

  
              

           

          </Stack>
        </Container>
      </Box>
    </>
  );
}
