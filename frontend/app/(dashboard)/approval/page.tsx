"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { 
  Box, 
  Container, 
  Typography, 
  Button, 
  Paper, 
  Chip,
  IconButton
} from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutlined";
import RefreshIcon from "@mui/icons-material/Refresh";
import HomeIcon from "@mui/icons-material/Home";

import { api } from "../../../lib/api";
import { RootState } from "../../../lib/store/store";
import { clearCredentials } from "../../../lib/store/slices/authSlice";

export default function ApprovalPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);

  const [status, setStatus] = useState<"PENDING" | "APPROVED" | "REJECTED" | "UNKNOWN">("UNKNOWN");
  const [reason, setReason] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    if (!isAuthenticated) {
      router.push("/login");
    } else {
      checkStatus();
    }
  }, [isAuthenticated, mounted, router]);

  const checkStatus = async () => {
    setLoading(true);
    try {
      const data = await api<{ status: string; reason: string | null }>("/api/v1/approval/status");
      const normalizedStatus = data.status as "PENDING" | "APPROVED" | "REJECTED";
      setStatus(normalizedStatus);
      setReason(data.reason);

      if (normalizedStatus === "APPROVED") {
        router.push("/");
      }
    } catch {
      setStatus("PENDING");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    dispatch(clearCredentials());
    router.push("/login");
  };

  if (!mounted || !isAuthenticated) return null;

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "background.default",
        p: 2,
        position: "relative"
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={0}
          sx={{
            p: 5,
            border: "1px solid",
            borderColor: "divider",
            backgroundColor: "background.paper",
            textAlign: "center",
            position: "relative"
          }}
        >
          {/* Accent top line */}
          <Box 
            sx={{ 
              position: "absolute", 
              top: 0, 
              left: 0, 
              right: 0, 
              height: "3px", 
              backgroundColor: status === "REJECTED" ? "error.main" : "primary.main" 
            }} 
          />

          <Box sx={{ display: "flex", justifyContent: "center", mb: 3 }}>
            {status === "REJECTED" ? (
              <ErrorOutlineIcon color="error" sx={{ fontSize: 60 }} />
            ) : (
              <LockOutlinedIcon color="primary" sx={{ fontSize: 60 }} />
            )}
          </Box>

          <Typography 
            variant="h5" 
            sx={{ 
              fontWeight: 800, 
              letterSpacing: "0.1em", 
              fontFamily: "var(--font-orbitron)", 
              mb: 1 
            }}
          >
            {status === "REJECTED" ? "ACCESS DENIED" : "GATEWAY SUSPENDED"}
          </Typography>

          <Typography 
            variant="caption" 
            sx={{ 
              fontFamily: "var(--font-roboto-mono)", 
              color: status === "REJECTED" ? "error.main" : "primary.main",
              display: "block",
              mb: 4,
              fontSize: "0.75rem"
            }}
          >
            ACCOUNT STATUS // {status}
          </Typography>

          {status === "REJECTED" ? (
            <Paper 
              variant="outlined" 
              sx={{ 
                p: 3, 
                backgroundColor: "rgba(255, 0, 127, 0.03)", 
                borderColor: "error.main", 
                mb: 4,
                textAlign: "left"
              }}
            >
              <Typography 
                variant="caption" 
                sx={{ 
                  fontFamily: "var(--font-roboto-mono)", 
                  color: "error.main", 
                  display: "block", 
                  mb: 1,
                  fontWeight: "bold"
                }}
              >
                REJECTION REASON DISPATCHED:
              </Typography>
              <Typography variant="body2" color="text.primary" sx={{ fontStyle: "italic" }}>
                &ldquo;{reason || "No detail provided by reviewer."}&rdquo;
              </Typography>
            </Paper>
          ) : (
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4, lineHeight: 1.6 }}>
              Your account registration request has been submitted and is currently in the **PENDING APPROVAL** queue. 
              The platform administrator must authorize your session details before you can access dashboard panels.
            </Typography>
          )}

          <Box sx={{ display: "flex", justifyContent: "center", gap: 2 }}>
            <Button
              variant="outlined"
              color="primary"
              onClick={handleLogout}
              startIcon={<HomeIcon />}
              sx={{ fontFamily: "var(--font-orbitron)" }}
            >
              HOME / LOGIN
            </Button>
            <Button
              variant="outlined"
              color="primary"
              onClick={checkStatus}
              disabled={loading}
              startIcon={<RefreshIcon />}
              sx={{ fontFamily: "var(--font-orbitron)" }}
            >
              {loading ? "CHECKING..." : "RE-VERIFY STATUS"}
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}
