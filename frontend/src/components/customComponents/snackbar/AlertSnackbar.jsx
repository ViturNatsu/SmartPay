import {Alert, Snackbar, SnackbarContent, Typography} from "@mui/material";
import {useState} from "react";

export const AlertSnackbar = ({message, open, onClose}) => {

  return (
    <Snackbar
    anchorOrigin={{ vertical:"top", horizontal:"center" }}
    open={open}
    autoHideDuration={6000}
    onClose={onClose}>
    <Alert
      variant="filled"
      severity="success"
      sx={{ width: '100%' }}
    >
      <Typography>
        {message}
      </Typography>
    </Alert>
  </Snackbar>
  );
}