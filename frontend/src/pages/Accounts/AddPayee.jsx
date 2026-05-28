import Navbar from "@/components/Navbar"
import { Box, Container, Stack, Typography,Card, CardContent,FormControl,FormLabel,TextField, Button } from "@mui/material"

import React from 'react'

const AddPayee = () => {
  return (
    <div>
    <Navbar />
      <Box sx={{ minHeight: "100vh", bgcolor: "#F8FAFC", py: 4 }}>
        <Container maxWidth="lg">
          <Stack spacing={3}>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                Add a Payee
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
               
                  <Box sx={{border:"1px solid black", display:"flex", flexDirection:"row"}} 
                  >
                    <FormControl>
                   <FormLabel><Typography variant="h7" sx={{ fontWeight: 600, mb: 0.5 }}>
                      Recipient Name
                    </Typography></FormLabel>
                       
                    <TextField
                    id="recipientName"
                    name="recipientName"
                    type="text"
                    placeholder="John Smith"
                    
                    required
                    fullWidth
                    variant="outlined"
                    
                    >
                    </TextField>
                     <FormLabel><Typography variant="h7" sx={{ fontWeight: 600, mb: 0.5 }}>
                      Recipient Email or Phone Number
                    </Typography></FormLabel>
                       
                    <TextField
                    id="emailNum"
                    name="emailNum"
                    type="text"
                    placeholder="Test@example.com or 4161234567"
                    
                    required
                    fullWidth
                    variant="outlined"
                    
                    >
                    </TextField>
                    <Button variant="outlined">Cancel</Button>
                    <Button variant="contained">Save Payee</Button>
                    

                    </FormControl>
                   
                  </Box>
                
               
              </CardContent>
            </Card>

  
              

           

          </Stack>
        </Container>
      </Box>
      </div>
  )
}

export default AddPayee