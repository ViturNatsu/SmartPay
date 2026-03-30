import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Card,
  Grid,
  Alert,
  Stack,
  Snackbar,
  TextField,
  Typography,
} from "@mui/material";
import axiosInstance from "../../api/axios";
import Navbar from "../../components/Navbar";

const AccountDetails = () => {
  const navigate = useNavigate();
  const { accountId } = useParams();
  const [account, setAccount] = useState({});
  const [openAlert, setopenAlert] = useState({
    open: false,
    message: "",
    severity: "",
  });
  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const response = await axiosInstance.get(
          `http://localhost:8080/api/v1/accounts/${accountId}`,
        );
        setAccount(response.data);
      } catch (error) {
        console.error("fetch account error:", error);
      }
    };
    fetchAccounts();
  }, [accountId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAccount((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.put(
        `http://localhost:8080/api/v1/accounts/${accountId}`,
        account,
      );
      setopenAlert({
        open: true,
        message: "Account updated successfully! Redirecting...",
        severity: "success",
      });
      setTimeout(() => navigate(-1), 2000);
    } catch (error) {
      setopenAlert({
        open: true,
        message: "Error updating account!",
        severity: "error",
      });
    }
  };
  const handleCancel = () => {
    navigate(-1);
  };
  const handleAlertClose = (event, reason) => {
    setopenAlert({ ...openAlert, open: false });
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Navbar isAdmin />
      <Box
        sx={{
          flex: "1",
          bgcolor: "#f5f5f5",
          p: 2,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          boxSizing: "border-box",
        }}
      >
        <Box
          sx={{ display: "flex", justifyContent: "center", maxWidth: "100%" }}
        >
          <Card
            elevation={0}
            sx={{
              width: {
                xs: "100%",
                sm: "60%",
                md: "30%",
              },
              bgcolor: "#fff",
              borderRadius: "16px",
              border: "1px solid #E5E7EB",
              p: 3,
              boxSizing: "border-box",
              overflow: "hidden",
            }}
          >
            <Typography
              variant="h6"
              mb="20px"
              sx={{
                borderBottom: "1px solid #000000",
                justifyContent: "center",
              }}
            >
              Account Details
            </Typography>
            <Grid
              container
              spacing={3}
              justifyContent={"center"}
              alignItems={"center"}
            >
              <Grid item xs={12}>
                <TextField
                  label="Account Name"
                  name="accountName"
                  value={account.accountName || ""}
                  onChange={handleChange}
                  sx={{ mt: 1 }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Transit Number"
                  name="transitNumber"
                  value={account.transitNumber || ""}
                  onChange={handleChange}
                  disabled
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Institution Number"
                  name="institutionNumber"
                  value={account.institutionNumber || ""}
                  onChange={handleChange}
                  disabled
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Account Number"
                  name="accountNumber"
                  value={account.accountNumber || ""}
                  onChange={handleChange}
                  disabled
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  label="Balance"
                  name="balance"
                  value={account.balance ?? ""}
                  onChange={handleChange}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  label="Account Type"
                  name="accountType"
                  value={account.type || ""}
                  onChange={handleChange}
                  disabled
                />
              </Grid>
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={2}
                justifyContent="center"
              >
                <Button
                  sx={{ maxWidth: 80 }}
                  variant="outlined"
                  onClick={handleCancel}
                >
                  Cancel
                </Button>
                <Button
                  sx={{ maxWidth: 80, minWidth: 80 }}
                  variant="contained"
                  onClick={handleSubmit}
                >
                  Save
                </Button>
              </Stack>
            </Grid>
          </Card>
        </Box>
      </Box>

      <Snackbar
        open={openAlert.open}
        autoHideDuration={2000}
        onClose={handleAlertClose}
      >
        <Alert severity="success" variant="filled" onClose={handleAlertClose}>
          {openAlert.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AccountDetails;
