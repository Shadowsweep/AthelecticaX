"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { 
  Box, 
  Container, 
  Typography, 
  Button, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  IconButton, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  TextField,
  AppBar,
  Toolbar,
  Chip,
  Alert
} from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import ClearIcon from "@mui/icons-material/Clear";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SportsKabaddiIcon from "@mui/icons-material/SportsKabaddi";

import { api } from "../../../../lib/api";
import { RootState } from "../../../../lib/store/store";
import SidebarLayout from "../../../../components/SidebarLayout";

type PendingRequest = {
  id: number;
  user_id: number;
  email: string;
  status: string;
  created_at: string;
};

export default function AdminApprovalsPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);

  const [requests, setRequests] = useState<PendingRequest[]>([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Rejection Dialog states
  const [openReject, setOpenReject] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  // Role Gate check
  useEffect(() => {
    if (!mounted) return;

    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    if (user?.role !== "SUPER_ADMIN") {
      router.push("/");
    } else {
      fetchPending();
    }
  }, [isAuthenticated, user, mounted, router]);

  const fetchPending = async () => {
    setLoading(true);
    try {
      const data = await api<PendingRequest[]>("/api/v1/approval/pending");
      setRequests(data);
      setError("");
    } catch (err: any) {
      setError(err.message || "Failed to load approval requests queue.");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId: number) => {
    setError("");
    setSuccess("");
    try {
      await api(`/api/v1/approval/review/${requestId}`, {
        method: "POST",
        body: JSON.stringify({ status: "APPROVED" }),
      });
      setSuccess("Account request successfully approved and activated.");
      fetchPending();
    } catch (err: any) {
      setError(err.message || "Approval transaction failed.");
    }
  };

  const handleOpenReject = (requestId: number) => {
    setSelectedRequestId(requestId);
    setRejectReason("");
    setOpenReject(true);
  };

  const handleCloseReject = () => {
    setOpenReject(false);
    setSelectedRequestId(null);
  };

  const handleRejectSubmit = async () => {
    if (!selectedRequestId) return;
    if (!rejectReason.trim()) {
      setError("Please specify a reason for rejection.");
      setOpenReject(false);
      return;
    }

    setError("");
    setSuccess("");
    try {
      await api(`/api/v1/approval/review/${selectedRequestId}`, {
        method: "POST",
        body: JSON.stringify({ status: "REJECTED", reason: rejectReason.trim() }),
      });
      setSuccess("Account request successfully rejected.");
      setOpenReject(false);
      fetchPending();
    } catch (err: any) {
      setError(err.message || "Rejection transaction failed.");
      setOpenReject(false);
    }
  };

  if (!mounted || !isAuthenticated || user?.role !== "SUPER_ADMIN") return null;

  return (
    <SidebarLayout>
      <Box sx={{ minHeight: "100vh", pb: 6 }}>
      {/* Admin Header */}
      <AppBar 
        position="static" 
        elevation={0}
        sx={{ 
          borderBottom: "1px solid", 
          borderColor: "divider", 
          backgroundColor: "background.paper" 
        }}
      >
        <Toolbar sx={{ justifyContent: "space-between", minHeight: 72 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <SportsKabaddiIcon color="primary" sx={{ fontSize: 32 }} />
            <Box>
              <Typography 
                variant="h6" 
                sx={{ 
                  fontWeight: 900, 
                  letterSpacing: "0.15em", 
                  fontFamily: "var(--font-orbitron)",
                  lineHeight: 1.1 
                }}
              >
                ATHLETICAX
              </Typography>
              <Typography 
                variant="caption" 
                sx={{ 
                  color: "primary.main", 
                  fontFamily: "var(--font-roboto-mono)",
                  letterSpacing: "0.1em",
                  fontSize: "0.65rem" 
                }}
              >
                ADMIN // REGISTRATIONS CONTROL
              </Typography>
            </Box>
          </Box>

          <Button
            variant="outlined"
            color="primary"
            startIcon={<ArrowBackIcon />}
            onClick={() => router.push("/")}
            sx={{ fontFamily: "var(--font-orbitron)", borderRadius: 0 }}
          >
            RETURN TO PANEL
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 5 }}>
        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              mb: 4, 
              borderRadius: 0, 
              borderLeft: "4px solid", 
              borderColor: "error.main" 
            }}
          >
            {error}
          </Alert>
        )}

        {success && (
          <Alert 
            severity="success" 
            sx={{ 
              mb: 4, 
              borderRadius: 0, 
              borderLeft: "4px solid", 
              borderColor: "success.main" 
            }}
          >
            {success}
          </Alert>
        )}

        <Paper 
          elevation={0}
          sx={{ 
            p: 4, 
            border: "1px solid", 
            borderColor: "divider",
            position: "relative" 
          }}
        >
          <Box 
            sx={{ 
              position: "absolute", 
              top: 0, 
              left: 0, 
              right: 0, 
              height: "3px", 
              backgroundColor: "primary.main" 
            }} 
          />

          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
            <Box>
              <Typography 
                variant="caption" 
                sx={{ 
                  fontFamily: "var(--font-roboto-mono)", 
                  color: "primary.main",
                  letterSpacing: "0.1em" 
                }}
              >
                // QUEUE METRICS
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 800, fontFamily: "var(--font-orbitron)" }}>
                PENDING APPROVAL QUEUE
              </Typography>
            </Box>
            <Chip 
              label={`WAITING ITEMS: ${requests.length}`} 
              color="primary" 
              variant="outlined"
              sx={{ borderRadius: 0, fontFamily: "var(--font-roboto-mono)", fontSize: "0.75rem", borderWidth: "1px" }}
            />
          </Box>

          <TableContainer sx={{ border: "1px solid", borderColor: "divider" }}>
            <Table>
              <TableHead sx={{ backgroundColor: "rgba(255,255,255,0.02)" }}>
                <TableRow>
                  <TableCell sx={{ fontFamily: "var(--font-roboto-mono)", fontSize: "0.75rem" }}>ACCOUNT EMAIL</TableCell>
                  <TableCell sx={{ fontFamily: "var(--font-roboto-mono)", fontSize: "0.75rem" }}>SIGNUP TIMESTAMP</TableCell>
                  <TableCell sx={{ fontFamily: "var(--font-roboto-mono)", fontSize: "0.75rem" }}>QUEUE STATUS</TableCell>
                  <TableCell align="right" sx={{ fontFamily: "var(--font-roboto-mono)", fontSize: "0.75rem" }}>QUEUE ACTIONS</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center" sx={{ py: 6 }}>
                      <Typography variant="body2" color="text.secondary" sx={{ fontFamily: "var(--font-roboto-mono)" }}>
                        RETRIEVING QUEUE TELEMETRY...
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : requests.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center" sx={{ py: 6 }}>
                      <Typography variant="body2" color="text.secondary" sx={{ fontFamily: "var(--font-roboto-mono)" }}>
                        NO PENDING REGISTRATIONS REQUIRING REVIEW
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  requests.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell sx={{ fontWeight: "bold" }}>{row.email}</TableCell>
                      <TableCell sx={{ fontFamily: "var(--font-roboto-mono)", fontSize: "0.8rem" }}>
                        {new Date(row.created_at).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={row.status} 
                          color="warning" 
                          size="small" 
                          sx={{ borderRadius: 0, fontFamily: "var(--font-roboto-mono)", fontSize: "0.65rem", fontWeight: "bold" }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
                          <Button
                            variant="contained"
                            color="success"
                            size="small"
                            startIcon={<CheckIcon />}
                            onClick={() => handleApprove(row.id)}
                            sx={{ fontFamily: "var(--font-orbitron)", fontSize: "0.7rem", py: 0.5 }}
                          >
                            APPROVE
                          </Button>
                          <Button
                            variant="contained"
                            color="error"
                            size="small"
                            startIcon={<ClearIcon />}
                            onClick={() => handleOpenReject(row.id)}
                            sx={{ fontFamily: "var(--font-orbitron)", fontSize: "0.7rem", py: 0.5 }}
                          >
                            REJECT
                          </Button>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Container>

      {/* Rejection Reason Modal */}
      <Dialog 
        open={openReject} 
        onClose={handleCloseReject}
        slotProps={{
          paper: {
            sx: {
              borderRadius: 0,
              border: "1px solid",
              borderColor: "divider",
              backgroundColor: "background.paper",
              p: 1
            }
          }
        }}
      >
        <DialogTitle sx={{ fontFamily: "var(--font-orbitron)", fontWeight: "bold", fontSize: "1.1rem" }}>
          SPECIFY REJECTION REASON
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Provide details explaining why this user registration request was rejected. The details will be emailed to the user and shown on their access terminal.
          </Typography>
          <TextField
            autoFocus
            margin="dense"
            label="REJECTION DETAILS"
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseReject} variant="outlined" color="primary">
            CANCEL
          </Button>
          <Button onClick={handleRejectSubmit} variant="contained" color="error">
            CONFIRM DENIAL
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
    </SidebarLayout>
  );
}
