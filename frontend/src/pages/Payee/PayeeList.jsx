import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  LinearProgress,
  Snackbar,
  Stack,
  Typography,
} from "@mui/material";
import PersonAddAlt1OutlinedIcon from "@mui/icons-material/PersonAddAlt1Outlined";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import { useNavigate } from "react-router-dom";

import Navbar from "@/components/Navbar";
import { useAuth } from "@/context/AuthContext";
import { getPayees, deletePayee } from "@/api/payee/payeeApi";

export default function PayeeList() {
  const { tokenClaims, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [payees, setPayees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successSnackbar, setSuccessSnackbar] = useState(false);
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [payeeToDelete, setPayeeToDelete] = useState(null);

  const fetchPayees = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getPayees();
      setPayees(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err?.message || "Unable to load payees");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && tokenClaims?.userId) {
      fetchPayees();
    }
  }, [authLoading, tokenClaims?.userId]);

  const handleConfirmDialog = (payeeId) => {
    setPayeeToDelete(payeeId);
    setOpenConfirmDialog(true);
  };

  const handleCloseConfirmDialog = () => {
    setOpenConfirmDialog(false);
    setPayeeToDelete(null);
  };

  const handleConfirmDelete = async () => {
    setOpenConfirmDialog(false);
    if (!payeeToDelete) return;

    try {
      await deletePayee(payeeToDelete);
      await fetchPayees();
      setSuccessSnackbar(true);
    } catch (err) {
      setError(err?.message || "Failed to delete payee");
    } finally {
      setPayeeToDelete(null);
    }
  };

  return (
    <>
      <Navbar />
      <Box sx={{ minHeight: "100vh", bgcolor: "#F8FAFC", py: 4 }}>
        <Container maxWidth="lg">
          <Stack spacing={3}>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                Manage Payees
              </Typography>
              <Typography sx={{ color: "text.secondary" }}>
                View and manage the people you send money to.
              </Typography>
            </Box>

            <Card
              sx={{
                borderRadius: 2,
                boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={2}
                  justifyContent="space-between"
                  alignItems={{ xs: "stretch", sm: "center" }}
                >
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                      Add Payee
                    </Typography>
                    <Typography sx={{ color: "text.secondary" }}>
                      Add a new recipient to send money quickly and easily.
                    </Typography>
                  </Box>
                  <Button
                    variant="contained"
                    startIcon={<PersonAddAlt1OutlinedIcon />}
                    onClick={() => navigate("/add-payee")}
                    sx={{
                      textTransform: "none",
                      alignSelf: { xs: "stretch", sm: "auto" },
                    }}
                  >
                    Add Payee
                  </Button>
                </Stack>
              </CardContent>
            </Card>

            <Card
              sx={{
                borderRadius: 2,
                boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  Your Payees
                </Typography>

                {loading ? (
                  <LinearProgress />
                ) : error ? (
                  <Alert severity="error">{error}</Alert>
                ) : payees.length === 0 ? (
                  <Box
                    sx={{
                      border: "1px dashed #CBD5E1",
                      borderRadius: 2,
                      p: 3,
                      textAlign: "center",
                    }}
                  >
                    <Typography
                      variant="subtitle1"
                      sx={{ fontWeight: 600, mb: 1 }}
                    >
                      No payees yet
                    </Typography>
                    <Typography sx={{ color: "text.secondary", mb: 2 }}>
                      Add a payee to start sending money.
                    </Typography>
                    <Button
                      variant="outlined"
                      startIcon={<AddRoundedIcon />}
                      onClick={() => navigate("/add-payee")}
                      sx={{ textTransform: "none" }}
                    >
                      Add Payee
                    </Button>
                  </Box>
                ) : (
                  <Stack spacing={2}>
                    {payees.map((payee) => (
                      <Box
                        key={payee.payeeId}
                        sx={{
                          border: "1px solid #E2E8F0",
                          borderRadius: 2,
                          p: 2.5,
                        }}
                      >
                        <Stack
                          direction={{ xs: "column", sm: "row" }}
                          spacing={1}
                          justifyContent="space-between"
                          alignItems={{ xs: "flex-start", sm: "center" }}
                        >
                          <Box>
                            <Typography sx={{ fontWeight: 600 }}>
                              {payee.payeeName}
                            </Typography>
                            <Typography sx={{ color: "text.secondary" }}>
                              {payee.firstName} {payee.lastName}
                            </Typography>
                            <Typography sx={{ color: "text.secondary" }}>
                              {payee.email}
                            </Typography>
                          </Box>
                          <Button
                            variant="outlined"
                            color="error"
                            onClick={() => handleConfirmDialog(payee.payeeId)}
                            sx={{ textTransform: "none" }}
                          >
                            Delete
                          </Button>
                        </Stack>
                      </Box>
                    ))}
                  </Stack>
                )}
              </CardContent>
            </Card>
          </Stack>
        </Container>
      </Box>

      <Dialog
        open={openConfirmDialog}
        onClose={handleCloseConfirmDialog}
        PaperProps={{
          sx: { borderRadius: 3, p: 1 },
        }}
      >
        <DialogTitle sx={{ fontWeight: 600 }}>Delete this Payee?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this payee? This action cannot be
            undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ pb: 2, px: 3 }}>
          <Button
            onClick={handleCloseConfirmDialog}
            variant="outlined"
            sx={{ textTransform: "none" }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirmDelete}
            color="error"
            variant="contained"
            autoFocus
            sx={{ textTransform: "none" }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={successSnackbar}
        autoHideDuration={4000}
        onClose={() => setSuccessSnackbar(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSuccessSnackbar(false)}
          severity="success"
          variant="filled"
        >
          Payee deleted successfully!
        </Alert>
      </Snackbar>
    </>
  );
}
