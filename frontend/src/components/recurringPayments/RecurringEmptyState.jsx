import { Typography } from "@mui/material";
import { tokens } from "@/style/Theme";

/**
 * Empty state for a recurring payments tab.
 *
 * @param {string} message - Primary empty-state copy
 */
export default function RecurringEmptyState({ message }) {
  return (
    <Typography
      sx={{
        textAlign: "center",
        color: tokens.color.text.muted,
        py: 5,
        fontSize: 15,
      }}
    >
      {message}
    </Typography>
  );
}
