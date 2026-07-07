import Navbar from "../../components/Navbar";
import {
  Box,
  Button,
  Card,
  Chip,
  CircularProgress,
  Alert,
  Stack,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getAllUsers } from "../../api/users/userApi";
import { getAccountById, updateAccountUsers } from "../../api/accounts/accountApi";

import { tokens } from "@/style/Theme.jsx";
const AddUser = () => {
  const navigate = useNavigate();
  const { accountId } = useParams();
  const [users, setUsers] = useState([]);
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [usersData, accountData] = await Promise.all([
          getAllUsers(),
          getAccountById(accountId),
        ]);

        const userList = Array.isArray(usersData) ? usersData : usersData?.users || [];
        setUsers(userList);

        const existingUserIds = Array.isArray(accountData?.users)
          ? accountData.users.map((u) => u.id)
          : [];
        setSelectedUserIds(existingUserIds);
      } catch (err) {
        setError(err?.message || "Failed to load data");
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [accountId]);

  const toggleUser = (userId) => {
    setSelectedUserIds((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);
    setSuccess(null);
    try {
      await updateAccountUsers(accountId, selectedUserIds);
      navigate("/admin/dashboard", {
        state: { message: "Account users updated successfully!" },
        replace: false,
      });
    } catch (err) {
      setError(err?.message || "Failed to update account users");
      console.error("Error updating users:", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Navbar isAdmin />
      <Box
        sx={{
          flex: 1,
          bgcolor: tokens.color.background.lightGray,
          p: 2,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          boxSizing: "border-box",
        }}
      >
        <Box sx={{ display: "flex", justifyContent: "center", minWidth: "100%" }}>
          <Card
            elevation={0}
            sx={{
              width: {
                xs: "100%",
                sm: "60%",
                md: "40%",
              },
              bgcolor: tokens.color.background.surface,
              borderRadius: "16px",
              border: `1px solid ${tokens.color.border.gray}`,
              p: 3,
              boxSizing: "border-box",
              overflow: "hidden",
            }}
          >
            <Typography
              variant="h6"
              mb="20px"
              sx={{
                borderBottom: `1px solid ${tokens.color.underline.dark}`,
                justifyContent: "center",
              }}
            >
              Update Users for Account {accountId}
            </Typography>

            {loading && (
              <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                <CircularProgress size={28} />
              </Box>
            )}

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            {success && (
              <Alert severity="success" sx={{ mb: 2 }}>
                {success}
              </Alert>
            )}

            {!loading && (
              <>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Selected: {selectedUserIds.length}
                </Typography>

                <Stack
                  direction="row"
                  flexWrap="wrap"
                  gap={1}
                  sx={{ mb: 3, maxHeight: 300, overflowY: "auto", p: 0.5 }}
                >
                  {users.map((user) => (
                    <Chip
                      key={user.id}
                      label={user.id}
                      clickable
                      onClick={() => toggleUser(user.id)}
                      color={selectedUserIds.includes(user.id) ? "primary" : "default"}
                      variant={selectedUserIds.includes(user.id) ? "filled" : "outlined"}
                      sx={{
                        fontWeight: 600,
                        minWidth: 60,
                        justifyContent: "center",
                        "&.MuiChip-colorPrimary": {
                          bgcolor: tokens.color.link.primary,
                          color: tokens.color.text.white,
                        },
                      }}
                    />
                  ))}
                  {users.length === 0 && (
                    <Typography variant="body2" color="text.secondary">
                      No users found.
                    </Typography>
                  )}
                </Stack>

                <Button
                  variant="contained"
                  fullWidth
                  disabled={submitting}
                  onClick={handleSubmit}
                  sx={{
                    textTransform: "none",
                    borderRadius: "8px",
                    py: 1.2,
                    bgcolor: tokens.color.link.primary,
                    "&:hover": { bgcolor: tokens.color.link.primaryHover },
                  }}
                >
                  {submitting ? (
                    <CircularProgress size={20} sx={{ color: tokens.color.text.white }} />
                  ) : (
                    "Update Account Users"
                  )}
                </Button>

                <Button
                  variant="text"
                  fullWidth
                  onClick={() => navigate(-1)}
                  sx={{ mt: 1, textTransform: "none", color: tokens.color.text.secondary }}
                >
                  Cancel
                </Button>
              </>
            )}
          </Card>
        </Box>
      </Box>
    </Box>
  );
};

export default AddUser;
