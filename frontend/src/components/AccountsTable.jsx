import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getAllAccounts } from "@/api/accounts/accountApi";
import { DataGrid } from "@mui/x-data-grid";
import { Box, CircularProgress, Typography } from "@mui/material";
import axiosInstance from "@/api/axios";

const AccountsTable = () => {
  const navigate = useNavigate();
  const [accountList, setaccountList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAccounts = async () => {
      setLoading(true);
      setError(null);
      try {
		const data = await getAllAccounts();
        const accounts = Array.isArray(data) ? data : data?.accounts || [];
        setaccountList(accounts);
	  } catch (err) {
        setError(err?.message || "Failed to load accounts");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAccounts();
  }, []);

  const columns = [
    { field: "id", headerName: "ID", flex: 0.5, minWidth: 70 },
    {
      field: "accountName",
      headerName: "Account Name",
      minWidth: 120,
      flex: 1,
      editable: true,
    },
    {
      field: "transitNumber",
      headerName: "Transit Number",
      flex: 1,
      minWidth: 150,
      editable: true,
    },
    {
      field: "institutionNumber",
      headerName: "Institution Number",
      flex: 1,
      minWidth: 150,
      editable: true,
    },
    {
      field: "accountNumber",
      headerName: "Account Number",
      flex: 1,
      minWidth: 150,
      editable: true,
    },

    {
      field: "balance",
      headerName: "Balance",
      flex: 1,
      minWidth: 110,
      editable: true,
      valueFormatter: (value) =>
        Number(value || 0).toLocaleString("en-CA", {
          style: "currency",
          currency: "CAD",
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
    }) + " CAD",
    },
    {
      field: "accountType",
      headerName: "Account Type",
      flex: 1,
      minWidth: 110,
      editable: true,
    },
    {
      field: "userId",
      headerName: "User ID",
      flex: 0.5,
      minWidth: 70,
      editable: true,
    },
    {
      field: "active",
      headerName: "Status",
      flex: 1,
      minWidth: 110,
      editable: true,
    },
  ];
  const rows = Array.isArray(accountList)
    ? accountList.map((acc) => ({
        ...acc,
        id: acc.id,
        active: acc.active ? "Active" : "Inactive",
        userId: acc.users?.map((u) => u.id).join(", ") || "",
      }))
    : [];

  return (
    <Box
      sx={{
        minHeight: "100vh",
        maxWidth: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start",
        alignItems: "flex-start",
        p: 2,
      }}
    >
      <h3>Mock Accounts</h3>
      {loading && (
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, py: 4 }}>
          <CircularProgress size={24} />
          <Typography>Loading accounts...</Typography>
        </Box>
      )}
      {error && (
        <Typography color="error" sx={{ py: 2 }}>
          {error}
        </Typography>
      )}
      {!loading && !error && (
        <Box sx={{ width: "100%" }}>
          <DataGrid
            rows={rows}
            columns={columns}
            initialState={{
              pagination: {
                paginationModel: { pageSize: 10 },
              },
            }}
            pageSizeOptions={[5]}
            showToolbar={true}
            onRowClick={(params) => navigate(`/accounts/${params.row.id}`)}
          />
        </Box>
      )}
    </Box>
  );
};
export default AccountsTable;
