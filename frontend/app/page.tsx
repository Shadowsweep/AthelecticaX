"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { QRCodeSVG } from "qrcode.react";
import { 
  Box, 
  Container, 
  Grid, 
  Typography, 
  Button, 
  IconButton, 
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
  Divider,
  Alert
} from "@mui/material";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import PowerSettingsNewIcon from "@mui/icons-material/PowerSettingsNew";
import RefreshIcon from "@mui/icons-material/Refresh";
import SportsKabaddiIcon from "@mui/icons-material/SportsKabaddi";

import { api } from "../lib/api";
import { RootState } from "../lib/store/store";
import { clearCredentials } from "../lib/store/slices/authSlice";
import { toggleThemeMode } from "../lib/store/slices/themeSlice";

type QrData = { scan_url: string; expires_at: number };
type Attendance = {
  id: number;
  employee_code: string;
  name: string;
  department: string;
  checked_in_at: string;
};

export default function Dashboard() {
  const router = useRouter();
  const dispatch = useDispatch();
  const themeMode = useSelector((state: RootState) => state.theme.mode);
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);

  const [qr, setQr] = useState<QrData | null>(null);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [seconds, setSeconds] = useState(0);
  const [error, setError] = useState("");
  const [currentTime, setCurrentTime] = useState("");

  // Route protection - redirect to login if unauthenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  // Clock in user's local timezone
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const refresh = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const [nextQr, rows] = await Promise.all([
        api<QrData>("/qr/current"),
        api<Attendance[]>("/attendance"),
      ]);
      setQr(nextQr);
      setAttendance(rows);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load telemetry dashboard data");
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      refresh();
      const timer = setInterval(refresh, 25000);
      return () => clearInterval(timer);
    }
  }, [refresh, isAuthenticated]);

  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds(qr ? Math.max(0, qr.expires_at - Math.floor(Date.now() / 1000)) : 0);
    }, 1000);
    return () => clearInterval(timer);
  }, [qr]);

  const handleLogout = () => {
    dispatch(clearCredentials());
    router.push("/login");
  };

  if (!isAuthenticated) {
    return null; // Don't flash dashboard UI while redirecting
  }

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "background.default", pb: 6 }}>
      {/* Telemetry Header */}
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
                  letterSpacing: "0.1em", 
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
                CENTRAL // CONTROL // TERMINAL
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
            {/* Live Clock HUD */}
            <Paper 
              variant="outlined" 
              sx={{ 
                px: 2, 
                py: 0.5, 
                backgroundColor: "transparent",
                borderColor: "divider",
                display: { xs: "none", sm: "block" }
              }}
            >
              <Typography 
                variant="caption" 
                sx={{ 
                  fontFamily: "var(--font-roboto-mono)", 
                  color: "text.secondary", 
                  display: "block",
                  fontSize: "0.6rem"
                }}
              >
                LOCAL NETWORK TIME
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  fontFamily: "var(--font-roboto-mono)", 
                  fontWeight: "bold",
                  color: "primary.main" 
                }}
              >
                {currentTime || "00:00:00"}
              </Typography>
            </Paper>

            <Chip 
              label="SYS // ONLINE" 
              color="success" 
              size="small" 
              variant="outlined"
              sx={{ 
                fontFamily: "var(--font-roboto-mono)", 
                fontSize: "0.65rem",
                borderRadius: 0,
                fontWeight: 700,
                borderWidth: "1px"
              }} 
            />

            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <IconButton onClick={() => dispatch(toggleThemeMode())} color="primary">
                {themeMode === "dark" ? <LightModeIcon /> : <DarkModeIcon />}
              </IconButton>
              <IconButton onClick={handleLogout} color="secondary">
                <PowerSettingsNewIcon />
              </IconButton>
            </Box>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Main Workspace */}
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

        <Box 
          sx={{ 
            display: "grid", 
            gridTemplateColumns: { xs: "1fr", md: "420px 1fr" }, 
            gap: 4 
          }}
        >
          {/* Left Panel: Dynamic QR Scan */}
          <Box>
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
              
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 3 }}>
                <Box>
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      fontFamily: "var(--font-roboto-mono)", 
                      color: "primary.main",
                      letterSpacing: "0.1em" 
                    }}
                  >
                    // TELEMETRY GATE
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 800, fontFamily: "var(--font-orbitron)" }}>
                    DYNAMIC QR
                  </Typography>
                </Box>
                <Chip 
                  label="LIVE" 
                  color="primary" 
                  size="small" 
                  sx={{ 
                    borderRadius: 0, 
                    fontWeight: 900,
                    fontSize: "0.65rem",
                    fontFamily: "var(--font-roboto-mono)"
                  }} 
                />
              </Box>

              <Box 
                sx={{ 
                  backgroundColor: themeMode === "dark" ? "rgba(0,0,0,0.2)" : "#F3F6F2", 
                  border: "1px solid",
                  borderColor: "divider",
                  display: "flex", 
                  justifyContent: "center", 
                  py: 4, 
                  mb: 3 
                }}
              >
                {qr ? (
                  <Box sx={{ p: 2, backgroundColor: "#FFFFFF" }}>
                    <QRCodeSVG value={qr.scan_url} size={230} level="M" />
                  </Box>
                ) : (
                  <Box sx={{ width: 230, height: 230, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Typography variant="body2" color="text.secondary" sx={{ fontFamily: "var(--font-roboto-mono)" }}>
                      INITIALIZING GATE...
                    </Typography>
                  </Box>
                )}
              </Box>

              <Typography 
                variant="body2" 
                align="center" 
                sx={{ 
                  fontFamily: "var(--font-roboto-mono)",
                  color: "text.secondary" 
                }}
              >
                REFRESH CYCLE IN: <strong style={{ color: "#FF007F" }}>{seconds}s</strong>
              </Typography>
            </Paper>
          </Box>

          {/* Right Panel: Attendance Feed */}
          <Box>
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
                  backgroundColor: "secondary.main" 
                }} 
              />

              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
                <Box>
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      fontFamily: "var(--font-roboto-mono)", 
                      color: "secondary.main",
                      letterSpacing: "0.1em" 
                    }}
                  >
                    // AUDIT LOG
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 800, fontFamily: "var(--font-orbitron)" }}>
                    RECENT SCAN LOGS
                  </Typography>
                </Box>
                
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Total Present: <strong style={{ color: "#39FF14" }}>{attendance.length}</strong>
                  </Typography>
                  <IconButton onClick={refresh} color="primary">
                    <RefreshIcon />
                  </IconButton>
                </Box>
              </Box>

              <TableContainer sx={{ border: "1px solid", borderColor: "divider" }}>
                <Table>
                  <TableHead sx={{ backgroundColor: themeMode === "dark" ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)" }}>
                    <TableRow>
                      <TableCell sx={{ fontFamily: "var(--font-roboto-mono)", fontSize: "0.75rem" }}>EMPLOYEE</TableCell>
                      <TableCell sx={{ fontFamily: "var(--font-roboto-mono)", fontSize: "0.75rem" }}>CODE</TableCell>
                      <TableCell sx={{ fontFamily: "var(--font-roboto-mono)", fontSize: "0.75rem" }}>DEPARTMENT</TableCell>
                      <TableCell align="right" sx={{ fontFamily: "var(--font-roboto-mono)", fontSize: "0.75rem" }}>SCAN TIME</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {attendance.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} align="center" sx={{ py: 6 }}>
                          <Typography variant="body2" color="text.secondary" sx={{ fontFamily: "var(--font-roboto-mono)" }}>
                            NO RECORDED SCAN TELEMETRY FOR TODAY
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      attendance.map((row) => (
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
                          <TableCell align="right" sx={{ fontFamily: "var(--font-roboto-mono)", fontSize: "0.8rem", color: "primary.main" }}>
                            {new Date(row.checked_in_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
