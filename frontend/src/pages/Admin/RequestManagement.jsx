import  {useEffect, useState} from "react";
import Navbar from "@/components/Navbar.jsx";
import {
    getAllCardRequests,
    approveCardRequest,
    denyCardRequest,
} from "@/api/cardrequest/cardrequestApi.js";

import {
    Box,
    Typography,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Divider,
    TextField, useTheme,
} from "@mui/material";
import {DataGrid} from "@mui/x-data-grid";
import {BasicPageLayout} from "@/components/customComponents/pageLayout/BasicPageLayout.jsx";

export const RequestManagement = () => {

    const[requestList, setRequestList] = useState([]);
    const[loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [selectedRequest, setSelectedRequest] = useState(null);
    const [openModal, setOpenModal] = useState(false);

    const [resultModalOpen, setResultModalOpen] = useState(false);
    const [approvalResult, setApprovalResult] = useState(null);

    const [denyModalOpen, setDenyModalOpen] = useState(false);
    const [denyReason, setDenyReason] = useState("");

    const fetchRequests = async () => {
        setLoading(true);
        setError(null);

        try {
            const data = await getAllCardRequests();
            const requests = Array.isArray(data) ? data : data?.requests || [];
            setRequestList(requests);
        } catch (err) {
            setError(err?.message || "Failed to load card requests.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const handleOpenModal = (request) => {
        setSelectedRequest(request);
        setOpenModal(true);
    }

    const handleCloseModal = () => {
        setOpenModal(false);
        setSelectedRequest(null);
    }

    const handleOpenDenyModal = () => {
        setDenyReason("");
        setDenyModalOpen(true);
    };

    const handleCloseDenyModal = () => {
        setDenyModalOpen(false);
        setDenyReason("");
    };

    const getErrorMessage = (err) => {
        return (
            err?.response?.data?.message ||
            err?.message ||
            "Failed to approve request."
        );
    };

    const handleApprove = async () => {
        console.log("start approve");
        if (!selectedRequest) return;

        console.log("start approve");
        const requestId = selectedRequest.requestId ?? selectedRequest.id;

        try {
            setLoading(true);

            await approveCardRequest(requestId);
            handleCloseModal();
            await fetchRequests();

            setApprovalResult({
                type: "approveSuccess",
                title: "Request Approved",
                message: "Card will be regenerated",
            });
            setResultModalOpen(true);
        } catch (err) {
            console.error(err);
            handleCloseModal();
            setApprovalResult({
                type: "error",
                title: "Approval Failed",
                message: getErrorMessage(err),
            });
            setResultModalOpen(true);
        } finally {
            setLoading(false);
        }
    };

    const handleConfirmDeny = async () => {
        if (!selectedRequest) return;

        const requestId = selectedRequest.requestId ?? selectedRequest.id;

        try {
            setLoading(true);

            console.log(denyReason);
            await denyCardRequest(requestId, denyReason);

            handleCloseDenyModal();
            handleCloseModal();

            await fetchRequests();

            setApprovalResult({
                type: "denySuccess",
                title: "Request Denied",
                message: "New card details will not be generated.",
            });
            setResultModalOpen(true);
        } catch (err) {
            console.error(err);

            handleCloseDenyModal();
            handleCloseModal();

            setApprovalResult({
                type: "error",
                title: "Denial Failed",
                message: getErrorMessage(err),
            });
            setResultModalOpen(true);
        } finally {
            setLoading(false);
        }
    };


    const rows = Array.isArray(requestList)
        ? requestList.map((request) => ({
            ...request,
            id: request.requestId,
            username: request.userName,
            cardnumber: `****${request.cardLastFourDigits}`,
            requestdate: request.requestCreatedAt?.substring(0, 10) || "N/A",
            status:
                request.requestStatus?.charAt(0).toUpperCase() +
                request.requestStatus?.slice(1).toLowerCase(),
        }))
        : [];


    const columns = [
        {
            field: "id",
            headerName: "ID",
            flex: 0.5,
            minWidth: 70,
            renderCell: (params) => `#${params.value}`,
        },
        {
            field: "username",
            headerName: "User",
            minWidth: 160,
            flex: 1,
        },
        {
            field: "cardnumber",
            headerName: "Card",
            minWidth: 140,
            flex: 1,
        },
        {
            field: "requestdate",
            headerName: "Date",
            minWidth: 140,
            flex: 1,
        },
        {
            field: "status",
            headerName: "Status",
            minWidth: 120,
            flex: 1,
        },
        {
            field: "action",
            headerName: "Action",
            minWidth: 120,
            flex: 1,
            sortable: false,
            renderCell: (params) => {
                const status = String(params.row.status || "").toLowerCase();
                const isPending = status === "pending";

                return (
                    <Button
                        variant="outlined"
                        size="small"
                        onClick={() => {
                            handleOpenModal(params.row)
                        }}
                        sx={{
                            px: 2.5,
                        }}
                    >
                        {isPending ? "Review" : "View"}
                    </Button>
                );
            },
        },
    ];

    const dataGridSx = (theme) => ({
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: `${theme.shape.borderRadius * 2}px`,
        overflow: "hidden",
        backgroundColor: theme.palette.background.paper,

        "& .MuiDataGrid-columnHeaders": {
            backgroundColor: theme.palette.background.default,
            borderBottom: `1px solid ${theme.palette.divider}`,
        },

        "& .MuiDataGrid-columnHeaderTitle": {
            fontWeight: theme.typography.fontWeightBold,
            fontSize: "0.95rem",
            color: theme.palette.text.primary,
        },

        "& .MuiDataGrid-cell": {
            fontSize: "0.95rem",
            borderBottom: `1px solid ${theme.palette.divider}`,
            color: theme.palette.text.primary,
        },

        "& .MuiDataGrid-row:hover": {
            backgroundColor: theme.palette.background.default,
        },

        "& .MuiDataGrid-footerContainer": {
            borderTop: `1px solid ${theme.palette.divider}`,
        },
    });

    const selectedStatus = String(selectedRequest?.status || "").toLowerCase();
    const isSelectedPending = selectedStatus === "pending";

    const getResultIcon = () => {
        if (approvalResult?.type === "approveSuccess") return "✅";
        if (approvalResult?.type === "denySuccess") return "🚫";
        if (approvalResult?.type === "error") return "❌";

        return "";
    };

    return (
    <BasicPageLayout
        title={"Request Management"}
        subtitle={"Admins can review all incoming card requests"}
    >
        {error && (
          <Typography color="error" sx={{ mb: 2 }}>
              {error}
          </Typography>
        )}


        <Box
          sx={{
              width: "100%",
              padding: "2px",
        }}>
            <DataGrid
              rows={rows}
              columns={columns}
              loading={loading}
              initialState={{
                  pagination: {
                      paginationModel: { pageSize: 10 },
                  },
              }}
              pageSizeOptions={[5, 10]}
              disableRowSelectionOnClick
              disableColumnMenu
              autoHeight
              sx={dataGridSx}
            />
        </Box>

        <Dialog
            open={openModal}
            onClose={handleCloseModal}
            maxWidth="sm"
            fullWidth
        >
            <DialogTitle sx={{ px: 3, pt: 3 }}>
                <Typography variant="h5">
                    Request Details
                </Typography>
            </DialogTitle>

            <Divider />

            <DialogContent sx={{ px: 3, py: 3 }}>
                {selectedRequest && (
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>

                        <Typography>
                            <strong>User:</strong> {selectedRequest.username}
                        </Typography>

                        <Typography>
                            <strong>Card:</strong> {selectedRequest.cardnumber}
                        </Typography>

                        <Typography>
                            <strong>Previous Request Count:</strong>{" "}
                            {selectedRequest.previousRequestCount ?? "N/A"}
                        </Typography>

                        <Typography>
                            <strong>Reason:</strong>{" "}
                            {selectedRequest.reason ||
                                selectedRequest.requestReason ||
                                "N/A"}
                        </Typography>
                    </Box>
                )}
            </DialogContent>

            <DialogActions>
                <Button
                    onClick={handleCloseModal}
                >
                    {isSelectedPending ? "Cancel" : "Close"}
                </Button>

                {isSelectedPending && (
                    <>
                        <Button
                            variant="outlined"
                            color="error"
                            onClick={() => {
                                handleOpenDenyModal();
                            }}
                        >
                            Deny
                        </Button>

                        <Button
                            variant="contained"
                            color="primary"
                            onClick={() => {
                                console.log("Approve request:", selectedRequest);
                                handleApprove();
                            }}
                        >
                            Approve
                        </Button>
                    </>
                )}
            </DialogActions>
        </Dialog>

        <Dialog
            open={denyModalOpen}
            onClose={handleCloseDenyModal}
            maxWidth="sm"
            fullWidth
        >
            <DialogTitle sx={{ fontWeight: 700 }}>
                Deny Request
            </DialogTitle>

            <DialogContent>
                <Typography sx={{ mb: 2 }}>
                    Optional reason:
                </Typography>

                <TextField
                    fullWidth
                    multiline
                    rows={4}
                    value={denyReason}
                    onChange={(e) => setDenyReason(e.target.value)}
                    placeholder="Enter reason for denial"
                />
            </DialogContent>

            <DialogActions>
                <Button
                    onClick={handleCloseDenyModal}
                >
                    Cancel
                </Button>

                <Button
                    variant="outlined"
                    color="error"
                    onClick={handleConfirmDeny}
                    disabled={loading}
                >
                    Confirm Denial
                </Button>
            </DialogActions>
        </Dialog>

        <Dialog
            open={resultModalOpen}
            onClose={() => setResultModalOpen(false)}
            maxWidth="sm"
            fullWidth
        >
            <DialogContent
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    textAlign: "center",
                    py: 5,
                    gap: 3,
                }}
            >
                <Typography variant="h4">
                    {getResultIcon()} {approvalResult?.title}
                </Typography>

                <Typography variant="h6" color="text.secondary">
                    {approvalResult?.message}
                </Typography>

                <Button
                    variant="contained"
                    onClick={() => setResultModalOpen(false)}
                >
                    Return
                </Button>
            </DialogContent>

        </Dialog>



    </BasicPageLayout>
  );
};

export default RequestManagement;