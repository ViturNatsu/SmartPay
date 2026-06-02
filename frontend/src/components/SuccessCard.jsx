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

const SuccessCard = ({
  data,
  title,
  message,
  primaryButtonText,
  onPrimaryClick,
  secondaryButtonText,
  onSecondaryClick,
}) => {
  return (
    <div>
      <Container maxWidth="md">
        <Card
          sx={{
            borderRadius: 2,
            boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
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
                  sx={{ color: "#25A18E", position: "absolute", fontSize: 40 }}
                />
              </Box>

              {/* Title */}
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 700,
                }}
              >
                {title}
              </Typography>

              {/* Description */}
              <Typography
                variant="subtitle1"
                sx={{
                  maxWidth: "md",
                }}
              >
                {data && <strong>{data} </strong>}
                {message}
              </Typography>

              {/* Buttons */}
              <Stack direction="row" spacing={2}>
                {secondaryButtonText && (
                  <Button
                    variant="outlined"
                    sx={{
                      px: 2,
                      py: 1.5,
                      height: 44,
                      minWidth: "111px",

                      boxShadow: "0 10px 20px rgba(149, 145, 145, 0.13)",
                      "&:hover": {
                        boxShadow: "0 10px 20px rgba(149, 145, 145, 0.3)",
                      },
                      borderRadius: "12px",
                      border: "1px solid #d1d5db",
                    }}
                  >
                    <Typography
                      variant="subtitle"
                      sx={{
                        fontWeight: 700,
                        color: "black",
                        textTransform: "none",
                      }}
                    >
                      {secondaryButtonText}
                    </Typography>
                  </Button>
                )}
                <Button
                  variant="contained"
                  onClick={onPrimaryClick}
                  sx={{
                    px: 2,
                    py: 1.5,
                    height: 44,
                    minWidth: "111px",
                    background: "linear-gradient(135deg, #008c99, #00a8b5)",
                    boxShadow: "0 10px 20px rgba(0, 151, 167, .16)",
                    borderRadius: "12px",
                  }}
                >
                  <Typography
                    variant="subtitle"
                    sx={{ fontWeight: 700, textTransform: "none" }}
                  >
                    {primaryButtonText}
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

export default SuccessCard;
