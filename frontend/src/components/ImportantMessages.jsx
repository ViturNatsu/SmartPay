import { useState } from "react";
import { Card, Typography, Link, Stack, Box } from "@mui/material";
import {tokens, dashboardSidebarCardSx} from "../style/Theme.jsx"

const MESSAGES = [
  {
    title: "New Account Opened",
    body: "Your new SmartPay account is active. Review your account details in Settings.",
  },
  {
    title: "Change to credit limit",
    body: "Your credit limit was updated on March 1, 2026. Sign in to view the new limit.",
  },
  {
    title: "January 2026 Statement",
    body: "Your January 2026 statement is ready. Download it from Reports when available.",
  },
];

function ImportantMessages() {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card
      elevation={0}
      sx={{
        ...dashboardSidebarCardSx,
        bgcolor: tokens.color.background.surface,
        minHeight: expanded ? "auto" : 92,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      <div>
        <Typography
          variant="h6"
          sx={{
            fontSize: 18,
            fontWeight: 700,
            letterSpacing: "-0.02em",
            mb: 1.25,
          }}
        >
          Important Messages
        </Typography>
        {!expanded && (
          <Typography
            sx={{
              color: tokens.color.text.secondary,
              fontSize: tokens.typography.fontSize.extraSmall,
              lineHeight: 1.45,
            }}
          >
            Messages are minimized to reduce dashboard clutter.
          </Typography>
        )}
        {expanded && (
          <Stack spacing={2} sx={{ mt: 0.5 }}>
            {MESSAGES.map((message) => (
              <Box
                key={message.title}
                sx={{
                  pb: 2,
                  borderBottom: "1px solid",
                  borderBottomColor: tokens.color.underline.dark,
                  "&:last-child": { borderBottom: "none", pb: 0 },
                }}
              >
                <Typography sx={{ fontWeight: 700, fontSize: 15, mb: 0.5 }}>
                  {message.title}
                </Typography>
                <Typography sx={{
                    color: tokens.color.text.secondary,
                    fontSize: tokens.typography.fontSize.extraSmall,
                    lineHeight: 1.45 }}>
                  {message.body}
                </Typography>
              </Box>
            ))}
          </Stack>
        )}
      </div>
      <Link
        component="button"
        type="button"
        onClick={() => setExpanded((prev) => !prev)}
        sx={{
          color: tokens.color.button.secondaryText,
          fontSize: 13,
          fontWeight: 650,
          textDecoration: "none",
          mt: 2,
          alignSelf: "flex-start",
          cursor: "pointer",
          border: "none",
          background: "none",
          p: 0,
          "&:hover": { textDecoration: "underline" },
        }}
      >
        {expanded ? "See less" : "See more →"}
      </Link>
    </Card>
  );
}

export default ImportantMessages;
