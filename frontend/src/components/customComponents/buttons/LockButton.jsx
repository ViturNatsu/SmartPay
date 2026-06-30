import {Button, Typography, useTheme} from "@mui/material";
import LockIcon from "@mui/icons-material/Lock";
import {LockOpen} from "@mui/icons-material";

export const LockButton = ({status, onClick}) => {
  const theme = useTheme();

  return (
    <Button
      variant="outlined"
      onClick={onClick}
      sx={{
        borderRadius: "36px",
        display: "flex",
        alignItems: "center",
        gap: 0.5,
        "&:hover": {
          backgroundColor: theme.palette.primary.light,
          borderColor: theme.palette.primary.main,
        },
      }}
    >
      <Typography sx={{ fontSize: 12 }}>
        {status ? "Lock Card" : "Unlock Card"}
      </Typography>
      {status ? (
        <LockIcon sx={{ fontSize: 16,
        }} />
      ) : (
        <LockOpen sx={{ fontSize: 16,
        }} />
      )}
    </Button>
  );
}