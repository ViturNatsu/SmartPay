import React from "react";
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
import CheckIcon from "@mui/icons-material/CheckOutlined";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CircleIcon from "@mui/icons-material/Circle";

const AddPayeeSuccess = ({ payeeName, onSendMoney }) => {
    
  return (
    <div>
      <Container maxWidth="md">
        <Card
          sx={{
            borderRadius: 2,
            boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
          }}
          variant="outlined"
        >
          <CardContent sx={{ p: 3, display: "flex", justifyContent: "center" }}>
            <Stack
              spacing={3}
              alignItems="center"
              justifyContent="center"
              sx={{
                textAlign: "center",
                py: 4,
                px: 2,
              }}
            >
              {/* <Box
                sx={{
                  width: 100,
                  height: 100,
                  borderRadius: "50%",
                  bgcolor: "#E8F5EC",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "2px solid #B7E4C7",
                }}
              >
               
              </Box> */}
              <Box
                sx={{
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                 
                }}
              >
                <CircleIcon
                  sx={{
                    height: "95px",
                    width: "95px",
                    color: "rgba(37, 161, 142, 0.49)",
                    opacity: "1",
                  }}
                ></CircleIcon>
                <CheckIcon
                  
                  sx={{ color: "#25A18E", position: "absolute", fontSize: 40}}
                />
              </Box>

              {/* Title */}
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 700,
                }}
              >
                Payee Added
              </Typography>

              {/* Description */}
              <Typography
                variant="subtitle2"
                sx={{
                  maxWidth: "md",
                }}
              >
                <strong>{payeeName}</strong> has been saved as a payee. You can
                now send money to this recipient from your SmartPay wallet.
              </Typography>

              {/* Buttons */}
              <Stack direction="row" spacing={2}>
                <Button
                  variant="contained"
                  onClick={onSendMoney}
                  sx={{
                    px: 2,
                    py: 1.5,
                    background: "linear-gradient(135deg, #008c99, #00a8b5)",
                    boxShadow: "0 10px 20px rgba(0, 151, 167, .16)",
                    borderRadius: "12px",
                  }}
                >
                  <Typography
                    variant="subtitle"
                    sx={{ fontWeight: 700, textTransform: "none" }}
                  >
                    Send Money
                  </Typography>
                </Button>
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      </Container>
    </div>
  );
};

export default AddPayeeSuccess;
