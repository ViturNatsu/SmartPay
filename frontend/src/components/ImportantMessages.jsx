import { Link as RouterLink } from "react-router-dom";
import { Card, Stack, Typography, ButtonBase } from "@mui/material";

import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';

function ImportantMessages() {
  const messages = [
    {
      text: "New Account Opened",
    },
    {
      text: "Change to credit limit",
    },
    {
      text: "January 2026 Statement",
    },
  ];
  return (
    <Card elevation={0} sx={{ width: "100%", bgcolor: "#fff", borderRadius: "16px", border: "1px solid #E5E7EB", p: 3 }}>
      <Typography variant="h6" mb="20px" sx={{ borderBottom: "1px solid #000000" }}>
        Important Messages
      </Typography>
      <Stack spacing={1.0}>
        {/* gap:12px */}
        {messages.map((message) => (
          <ButtonBase
            LinkComponent={RouterLink}
            to={message.href}
            key={message.text}
            sx={{
              width: "100%",
              display: "flex",
              justifyContent: "flex-start",
              p: 1,
              bgcolor: "#F3F4F6",
              borderRadius: "16px",
              border: "2px solid #E5E7EB",
            }}
          >
            <EmailOutlinedIcon sx={{ mr: 1.5 }}/>
            <Typography>{message.text}</Typography>
          </ButtonBase>
        ))}
      </Stack>
    </Card>
  );
}

export default ImportantMessages;