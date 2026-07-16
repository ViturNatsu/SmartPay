import { IconButton, InputAdornment, TextField } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import { tokens } from "@/style/Theme";

export default function RecurringPaymentsSearchBar({
  value,
  onChange,
  onClear,
  placeholder = "Search...",
  "aria-label": ariaLabel = "Search",
}) {
  return (
    <TextField
      fullWidth
      size="small"
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      aria-label={ariaLabel}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon
              fontSize="small"
              sx={{ color: tokens.color.text.muted }}
            />
          </InputAdornment>
        ),
        endAdornment: value ? (
          <InputAdornment position="end">
            <IconButton
              size="small"
              onClick={onClear}
              aria-label="Clear search"
              edge="end"
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </InputAdornment>
        ) : null,
      }}
      sx={{ mb: 2, maxWidth: 400 }}
    />
  );
}
