import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axiosInstance from "../api/axios";
import { DataGrid, renderBooleanCell } from "@mui/x-data-grid";
import { Box } from "@mui/material";

const AccountsTable = () => {
  const navigate = useNavigate();
  const [accountList, setaccountList] = useState([]);
  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const response = await axiosInstance.get(
          "http://localhost:8080/api/v1/accounts/all",
        );
        setaccountList(response.data);
      } catch (error) {}
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
  const rows = accountList.map((acc) => ({
    ...acc,
    active: acc.active ? "Active" : "Inactive",
  }));

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
    </Box>
  );
};
export default AccountsTable;
