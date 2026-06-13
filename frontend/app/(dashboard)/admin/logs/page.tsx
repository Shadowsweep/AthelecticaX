"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { 
  Box, 
  Container, 
  Typography, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Avatar, 
  Chip,
  AppBar,
  Toolbar,
  Alert,
  IconButton
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import SportsKabaddiIcon from "@mui/icons-material/SportsKabaddi";

import { api } from "../../../../lib/api";
import { RootState } from "../../../../lib/store/store";
import SidebarLayout from "../../../../components/SidebarLayout";

type AttendanceLog = {
  id: number;
  employee_code: string;
  name: string;
  department: string;
  date: string;
  checked_in_at: string;
  checked_out_at: string | null;
  work_hours: number | null;
  status: string;
};

export default function AdminLogsPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);

  const [logs, setLogs] = useState<AttendanceLog[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Role check
  useEffect(() => {
    if (!mounted) return;

    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    if (user?.role !== "SUPER_ADMIN") {
      router.push("/");
    } else {
      fetchLogs();
    }
  }, [isAuthenticated, user, mounted, router]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const data = await api<AttendanceLog[]>("/api/v1/attendance/logs");
      setLogs(data);
      setError("");
    } catch (err: any) {
      setError(err.message || "Failed to retrieve corporate scan logs.");
    } finally {
      setLoading(false);
    }
  };

  if (!mounted || !isAuthenticated || user?.role !== "SUPER_ADMIN") return null;

  return (
    <SidebarLayout>
      <Box sx={{ minHeight: "100vh", pb: 6 }}>
        {/* Header Title Bar */}
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
                  ADMIN // TELEMETRY LOGS HISTORY
                </Typography>
              </Box>
            </Box>

            <IconButton onClick={fetchLogs} color="primary" disabled={loading}>
              <RefreshIcon />
            </IconButton>
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

          <Paper 
            elevation={0}
            sx={{ 
              p: 4, 
              border: "1px solid", 
              borderColor: "divider",
              position: "relative" 
            }}
          >
            {/* Top Accent line */}
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
                  // CORPORATE TELEMETRY
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 800, fontFamily: "var(--font-orbitron)" }}>
                  TAP-IN / TAP-OUT AUDIT LOGS
                </Typography>
              </Box>
              <Chip 
                label={`TOTAL LOGS: ${logs.length}`} 
                color="primary" 
                variant="outlined"
                sx={{ borderRadius: 0, fontFamily: "var(--font-roboto-mono)", fontSize: "0.75rem" }}
              />
            </Box>

            <TableContainer sx={{ border: "1px solid", borderColor: "divider" }}>
              <Table>
                <TableHead sx={{ backgroundColor: "rgba(255,255,255,0.02)" }}>
                  <TableRow>
                    <TableCell sx={{ fontFamily: "var(--font-roboto-mono)", fontSize: "0.75rem" }}>EMPLOYEE</TableCell>
                    <TableCell sx={{ fontFamily: "var(--font-roboto-mono)", fontSize: "0.75rem" }}>CODE</TableCell>
                    <TableCell sx={{ fontFamily: "var(--font-roboto-mono)", fontSize: "0.75rem" }}>DEPARTMENT</TableCell>
                    <TableCell sx={{ fontFamily: "var(--font-roboto-mono)", fontSize: "0.75rem" }}>DATE</TableCell>
                    <TableCell sx={{ fontFamily: "var(--font-roboto-mono)", fontSize: "0.75rem" }}>TAP-IN</TableCell>
                    <TableCell sx={{ fontFamily: "var(--font-roboto-mono)", fontSize: "0.75rem" }}>TAP-OUT</TableCell>
                    <TableCell sx={{ fontFamily: "var(--font-roboto-mono)", fontSize: "0.75rem" }}>HOURS WORKED</TableCell>
                    <TableCell sx={{ fontFamily: "var(--font-roboto-mono)", fontSize: "0.75rem" }}>STATUS</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ fontFamily: "var(--font-roboto-mono)" }}>
                          RETRIEVING LOGS DATA CONTEXT...
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : logs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ fontFamily: "var(--font-roboto-mono)" }}>
                          NO ATTENDANCE SCANS CAPTURED YET
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    logs.map((row) => (
                      <TableRow key={row.id}>
                        <TableCell sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                          <Avatar 
                            sx={{ 
                              width: 30, 
                              height: 30, 
                              fontSize: "0.8rem", 
                              fontWeight: "bold",
                              borderRadius: 0,
                              backgroundColor: "primary.main",
                              color: "primary.contrastText"
                            }}
                          >
                            {row.name.charAt(0)}
                          </Avatar>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>{row.name}</Typography>
                        </TableCell>
                        <TableCell sx={{ fontFamily: "var(--font-roboto-mono)", fontSize: "0.8rem" }}>{row.employee_code}</TableCell>
                        <TableCell>{row.department}</TableCell>
                        <TableCell sx={{ fontFamily: "var(--font-roboto-mono)", fontSize: "0.8rem" }}>{row.date}</TableCell>
                        <TableCell sx={{ fontFamily: "var(--font-roboto-mono)", fontSize: "0.8rem", color: "primary.main" }}>
                          {new Date(row.checked_in_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </TableCell>
                        <TableCell sx={{ fontFamily: "var(--font-roboto-mono)", fontSize: "0.8rem", color: "secondary.main" }}>
                          {row.checked_out_at 
                            ? new Date(row.checked_out_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                            : "---"
                          }
                        </TableCell>
                        <TableCell sx={{ fontFamily: "var(--font-roboto-mono)", fontSize: "0.8rem", fontWeight: "bold" }}>
                          {row.work_hours !== null ? `${row.work_hours.toFixed(2)} hrs` : "IN PROGRESS"}
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={row.status} 
                            color={row.status === "PRESENT" ? "success" : "warning"}
                            size="small" 
                            sx={{ borderRadius: 0, fontFamily: "var(--font-roboto-mono)", fontSize: "0.65rem", fontWeight: "bold" }}
                          />
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Container>
      </Box>
    </SidebarLayout>
  );
}
