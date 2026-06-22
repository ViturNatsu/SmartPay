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
import {tokens} from "../style/Theme.jsx"
const SuccessCard = ({
  data,
  title,
  message,
  transactionId,
  primaryButtonText,
  onPrimaryClick,
  secondaryButtonText,
  onSecondaryClick,
  showCard = true,
}) => {
  const content = (
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
            color: tokens.color.icon.successCheck,
            opacity: "1",
          }}
        ></CircleIcon>
        <CheckIcon
          sx={{ color:tokens.color.icon.successBg, position: "absolute", fontSize: 40 }}
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
          minHeight: "50px",
        }}
      >
        {data && <strong>{data} </strong>}
        {message}
      </Typography>

      {transactionId && (
        <Typography sx={{ color: tokens.color.text.muted, fontSize: 12, fontFamily: "monospace" }}>
          Transaction ID: {transactionId}
        </Typography>
      )}

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
              border: "1px solid",
                borderColor: tokens.color.button.neutralBorder,
            }}
          >
            <Typography
              variant="subtitle"
              sx={{
                fontWeight: 700,
                color: tokens.color.text.primary,
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
            background: tokens.color.button.gradientBg,
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
  );
  if (!showCard) {
    return content;
  }
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
            {content}
          </CardContent>
        </Card>
      </Container>
    </div>
  );
};

export default SuccessCard;
