"use client";

import React, { useCallback, useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { QRCodeSVG } from "qrcode.react";
import { 
  Box, 
  Container, 
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
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import SportsKabaddiIcon from "@mui/icons-material/SportsKabaddi";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

import { api } from "../lib/api";
import { RootState } from "../lib/store/store";
import SidebarLayout from "../components/SidebarLayout";

type QrData = { scan_url: string; expires_at: number };

type Attendance = {
  id: number;
  employee_code: string;
  name: string;
  department: string;
  checked_in_at: string;
};

type MyLog = {
  id: number;
  date: string;
  checked_in_at: string;
  checked_out_at: string | null;
  work_hours: number | null;
  status: string;
};

interface UserProfile {
  id: number;
  email: string;
  role: string;
  first_name: string;
  last_name: string;
  employee_code: string;
  department: string;
  designation: string;
}

const MONTH_NAMES = [
  "JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE",
  "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"
];

const WEEK_DAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);

  // States
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [qr, setQr] = useState<QrData | null>(null);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [myLogs, setMyLogs] = useState<MyLog[]>([]);
  const [seconds, setSeconds] = useState(0);
  const [error, setError] = useState("");
  const [currentTime, setCurrentTime] = useState("");
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Scan Banner States
  const [scanUser, setScanUser] = useState<string | null>(null);
  const [scanAction, setScanAction] = useState<string | null>(null);

  // Calendar States
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  // Redirect unauthenticated users to login
  useEffect(() => {
    if (!mounted) return;

    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, mounted, router]);

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

  // Check for scanner redirect query parameters on mount
  useEffect(() => {
    const welcome = searchParams.get("welcome");
    const action = searchParams.get("action");
    if (welcome && action) {
      setScanUser(welcome);
      setScanAction(action);
      // Remove query parameters from URL without refreshing
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [searchParams]);

  const refreshDashboard = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const me = await api<UserProfile>("/api/v1/auth/me");
      setProfile(me);

      if (me.role === "SUPER_ADMIN") {
        const [nextQr, rows] = await Promise.all([
          api<QrData>("/qr/current"),
          api<Attendance[]>("/attendance"),
        ]);
        setQr(nextQr);
        setAttendance(rows);
      } else {
        const logs = await api<MyLog[]>("/api/v1/attendance/my-logs");
        setMyLogs(logs);
      }
      setError("");
    } catch (err: any) {
      setError(err.message || "Unable to sync dashboard telemetry.");
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      refreshDashboard();
      const interval = setInterval(refreshDashboard, 25000);
      return () => clearInterval(interval);
    }
  }, [refreshDashboard, isAuthenticated]);

  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds(qr ? Math.max(0, qr.expires_at - Math.floor(Date.now() / 1000)) : 0);
    }, 1000);
    return () => clearInterval(timer);
  }, [qr]);

  if (!mounted || !isAuthenticated) return null;

  const isAdmin = user?.role === "SUPER_ADMIN";

  // Helpers to get local date as YYYY-MM-DD
  const getLocalDateStr = (d: Date) => {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  };

  const todayStr = getLocalDateStr(new Date());
  const todayLog = myLogs.find(log => log.date === todayStr);

  // Calendar Helpers
  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const renderCalendarDays = () => {
    const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const cells = [];

    // Empty cells for preceding month overlap
    for (let i = 0; i < firstDayIndex; i++) {
      cells.push(<Box key={`empty-${i}`} sx={{ borderRight: "1px solid", borderBottom: "1px solid", borderColor: "divider", minHeight: 90 }} />);
    }

    // Day cells
    for (let day = 1; day <= daysInMonth; day++) {
      const cellDateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      const log = myLogs.find(l => l.date === cellDateStr);

      cells.push(
        <Box 
          key={`day-${day}`} 
          sx={{ 
            borderRight: "1px solid", 
            borderBottom: "1px solid", 
            borderColor: log ? "primary.main" : "divider", 
            minHeight: 90, 
            p: 1, 
            display: "flex", 
            flexDirection: "column",
            justifyContent: "space-between",
            backgroundColor: log ? "rgba(0, 229, 255, 0.02)" : "transparent"
          }}
        >
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Typography variant="body2" sx={{ fontWeight: "bold", fontFamily: "var(--font-roboto-mono)" }}>
              {day}
            </Typography>
            {log && (
              <Chip 
                label={log.status} 
                color="success" 
                size="small" 
                variant="outlined" 
                sx={{ borderRadius: 0, height: 16, fontSize: "0.55rem", fontFamily: "var(--font-roboto-mono)", borderWidth: "1px" }}
              />
            )}
          </Box>
          {log && (
            <Box>
              <Typography variant="caption" sx={{ display: "block", fontSize: "0.6rem", color: "primary.main", fontFamily: "var(--font-roboto-mono)", lineHeight: 1.2 }}>
                IN: {new Date(log.checked_in_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false })}
              </Typography>
              {log.checked_out_at && (
                <Typography variant="caption" sx={{ display: "block", fontSize: "0.6rem", color: "secondary.main", fontFamily: "var(--font-roboto-mono)", lineHeight: 1.2 }}>
                  OUT: {new Date(log.checked_out_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false })}
                </Typography>
              )}
              {log.work_hours !== null && (
                <Typography variant="caption" sx={{ display: "block", fontSize: "0.55rem", color: "text.secondary", fontFamily: "var(--font-roboto-mono)", mt: 0.5 }}>
                  {log.work_hours.toFixed(2)}h total
                </Typography>
              )}
            </Box>
          )}
        </Box>
      );
    }

    // Fill remaining grid spaces to make complete rows if needed
    const totalCells = cells.length;
    const remaining = (7 - (totalCells % 7)) % 7;
    for (let i = 0; i < remaining; i++) {
      cells.push(<Box key={`empty-end-${i}`} sx={{ borderRight: "1px solid", borderBottom: "1px solid", borderColor: "divider", minHeight: 90 }} />);
    }

    return cells;
  };

  return (
    <SidebarLayout>
      <Box sx={{ minHeight: "100vh", pb: 6 }}>
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
              {/* Local Network Clock */}
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
            </Box>
          </Toolbar>
        </AppBar>

        <Container maxWidth="lg" sx={{ mt: 5 }}>
          {/* Scan Redirect Greetings Banner */}
          {scanUser && (
            <Alert 
              severity="success" 
              onClose={() => setScanUser(null)}
              sx={{ 
                mb: 4, 
                borderRadius: 0, 
                borderLeft: "4px solid", 
                borderColor: "success.main",
                fontFamily: "var(--font-roboto-mono)",
                fontSize: "0.85rem"
              }}
            >
              SYSTEM SCAN DETECTED // USER: {scanUser.toUpperCase()} // ACTION: {scanAction === "TAP_IN" ? "CHECK-IN SUCCESS" : "CHECK-OUT SUCCESS"} // WELCOME ACCESS CONTEXT INSTANTIATED
            </Alert>
          )}

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

          {/* Role Based Views */}
          {isAdmin ? (
            /* ADMIN VIEW */
            <Box 
              sx={{ 
                display: "grid", 
                gridTemplateColumns: { xs: "1fr", md: "420px 1fr" }, 
                gap: 4 
              }}
            >
              {/* Left Panel: Admin Profile & Dynamic QR Gate */}
              <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {/* Admin Profile Card */}
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
                  
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      fontFamily: "var(--font-roboto-mono)", 
                      color: "primary.main",
                      letterSpacing: "0.1em",
                      display: "block",
                      mb: 1
                    }}
                  >
                    // ADMIN PROFILE CONTEXT
                  </Typography>

                  <Typography variant="h5" sx={{ fontWeight: 800, fontFamily: "var(--font-orbitron)", mb: 2 }}>
                    {profile ? `${profile.first_name.toUpperCase()} ${profile.last_name.toUpperCase()}` : "LOADING..."}
                  </Typography>

                  <Box 
                    sx={{ 
                      display: "grid", 
                      gridTemplateColumns: "repeat(2, 1fr)", 
                      gap: 2,
                      mt: 3 
                    }}
                  >
                    <Box>
                      <Typography variant="caption" color="text.secondary" sx={{ fontFamily: "var(--font-roboto-mono)", display: "block" }}>
                        ROLE
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: "bold", fontFamily: "var(--font-roboto-mono)", color: "primary.main" }}>
                        {profile?.role || "SUPER_ADMIN"}
                      </Typography>
                    </Box>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography variant="caption" color="text.secondary" sx={{ fontFamily: "var(--font-roboto-mono)", display: "block" }}>
                        EMAIL
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: "bold" }} noWrap>
                        {profile?.email || "admin@athleticax.com"}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary" sx={{ fontFamily: "var(--font-roboto-mono)", display: "block" }}>
                        OFFICIAL CODE
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: "bold", fontFamily: "var(--font-roboto-mono)" }}>
                        {profile?.employee_code || "ADMIN"}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary" sx={{ fontFamily: "var(--font-roboto-mono)", display: "block" }}>
                        DEPARTMENT
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                        {profile?.department || "IT"}
                      </Typography>
                    </Box>
                  </Box>
                </Paper>

                {/* Dynamic QR Gate */}
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
                      backgroundColor: "rgba(0,0,0,0.2)", 
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
                        TODAY'S SCANS
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Total Present: <strong style={{ color: "#39FF14" }}>{attendance.length}</strong>
                      </Typography>
                      <IconButton onClick={refreshDashboard} color="primary">
                        <RefreshIcon />
                      </IconButton>
                    </Box>
                  </Box>

                  <TableContainer sx={{ border: "1px solid", borderColor: "divider" }}>
                    <Table>
                      <TableHead sx={{ backgroundColor: "rgba(255,255,255,0.02)" }}>
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
                                {new Date(row.checked_in_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false })}
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
          ) : (
            /* EMPLOYEE VIEW */
            <Box 
              sx={{ 
                display: "grid", 
                gridTemplateColumns: { xs: "1fr", md: "2fr 1fr" }, 
                gap: 4 
              }}
            >
              {/* Employee Left Card: Profile Context */}
              <Box>
                <Paper 
                  elevation={0}
                  sx={{ 
                    p: 4, 
                    border: "1px solid", 
                    borderColor: "divider",
                    position: "relative",
                    minHeight: 280
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

                  <Typography 
                    variant="caption" 
                    sx={{ 
                      fontFamily: "var(--font-roboto-mono)", 
                      color: "primary.main",
                      letterSpacing: "0.1em",
                      display: "block",
                      mb: 1
                    }}
                  >
                    // TELEMETRY ACTIVE CONTEXT
                  </Typography>

                  <Typography variant="h4" sx={{ fontWeight: 900, fontFamily: "var(--font-orbitron)", mb: 2 }}>
                    WELCOME, {profile?.first_name.toUpperCase()} {profile?.last_name.toUpperCase()}
                  </Typography>

                  <Box 
                    sx={{ 
                      display: "grid", 
                      gridTemplateColumns: { xs: "repeat(2, 1fr)", sm: "repeat(3, 1fr)" }, 
                      gap: 3,
                      mt: 4 
                    }}
                  >
                    <Box>
                      <Typography variant="caption" color="text.secondary" sx={{ fontFamily: "var(--font-roboto-mono)", display: "block" }}>
                        OFFICIAL CODE
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: "bold", fontFamily: "var(--font-roboto-mono)", color: "primary.main" }}>
                        {profile?.employee_code}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary" sx={{ fontFamily: "var(--font-roboto-mono)", display: "block" }}>
                        DEPARTMENT
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                        {profile?.department}
                      </Typography>
                    </Box>
                    <Box sx={{ gridColumn: { xs: "span 2", sm: "span 1" } }}>
                      <Typography variant="caption" color="text.secondary" sx={{ fontFamily: "var(--font-roboto-mono)", display: "block" }}>
                        DESIGNATION
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                        {profile?.designation}
                      </Typography>
                    </Box>
                  </Box>

                  <Divider sx={{ borderColor: "divider", my: 3 }} />

                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<CalendarTodayIcon />}
                    onClick={() => setCalendarOpen(true)}
                    sx={{ fontFamily: "var(--font-orbitron)", borderRadius: 0 }}
                  >
                    CHECK ATTENDANCE HISTORY
                  </Button>
                </Paper>
              </Box>

              {/* Employee Right Card: Today's status */}
              <Box>
                <Paper 
                  elevation={0}
                  sx={{ 
                    p: 4, 
                    border: "1px solid", 
                    borderColor: "divider",
                    position: "relative",
                    minHeight: 280,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between"
                  }}
                >
                  <Box 
                    sx={{ 
                      position: "absolute", 
                      top: 0, 
                      left: 0, 
                      right: 0, 
                      height: "3px", 
                      backgroundColor: todayLog ? "success.main" : "warning.main" 
                    }} 
                  />

                  <Box>
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        fontFamily: "var(--font-roboto-mono)", 
                        color: todayLog ? "success.main" : "warning.main",
                        letterSpacing: "0.1em",
                        display: "block",
                        mb: 1
                      }}
                    >
                      // TODAY'S REAL-TIME LOGS
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 800, fontFamily: "var(--font-orbitron)" }}>
                      SCAN STATUS
                    </Typography>
                  </Box>

                  <Box sx={{ my: 3 }}>
                    {todayLog ? (
                      <Box>
                        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                          <Typography variant="caption" color="text.secondary" sx={{ fontFamily: "var(--font-roboto-mono)" }}>
                            TAP-IN TIME
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: "bold", fontFamily: "var(--font-roboto-mono)", color: "success.main" }}>
                            {new Date(todayLog.checked_in_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false })}
                          </Typography>
                        </Box>
                        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                          <Typography variant="caption" color="text.secondary" sx={{ fontFamily: "var(--font-roboto-mono)" }}>
                            TAP-OUT TIME
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: "bold", fontFamily: "var(--font-roboto-mono)", color: todayLog.checked_out_at ? "secondary.main" : "text.secondary" }}>
                            {todayLog.checked_out_at 
                              ? new Date(todayLog.checked_out_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false })
                              : "IN PROGRESS"
                            }
                          </Typography>
                        </Box>
                      </Box>
                    ) : (
                      <Typography variant="body2" color="text.secondary" sx={{ fontFamily: "var(--font-roboto-mono)" }}>
                        NO SCAN ACTIVITY REGISTERED FOR TODAY
                      </Typography>
                    )}
                  </Box>

                  <Chip 
                    label={todayLog ? (todayLog.checked_out_at ? "SESSION CLOSED" : "TAP-IN ACTIVE") : "AWAITING GATE ENTRY"} 
                    color={todayLog ? (todayLog.checked_out_at ? "default" : "success") : "warning"}
                    variant="outlined"
                    sx={{ borderRadius: 0, fontFamily: "var(--font-roboto-mono)", fontSize: "0.7rem", fontWeight: "bold" }}
                  />
                </Paper>
              </Box>
            </Box>
          )}
        </Container>

        {/* Attendance Calendar Dialog Modal */}
        <Dialog
          open={calendarOpen}
          onClose={() => setCalendarOpen(false)}
          maxWidth="md"
          fullWidth
          slotProps={{
            paper: {
              sx: {
                borderRadius: 0,
                border: "1px solid",
                borderColor: "divider",
                backgroundColor: "background.paper",
                p: 2
              }
            }
          }}
        >
          <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", p: 2 }}>
            <Box>
              <Typography variant="caption" sx={{ fontFamily: "var(--font-roboto-mono)", color: "primary.main", letterSpacing: "0.1em", display: "block" }}>
                // HISTORICAL AUDIT
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 800, fontFamily: "var(--font-orbitron)" }}>
                ATTENDANCE LOGS CALENDAR
              </Typography>
            </Box>
            
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <IconButton onClick={prevMonth} color="primary">
                <ChevronLeftIcon />
              </IconButton>
              <Typography variant="body1" sx={{ fontFamily: "var(--font-orbitron)", fontWeight: "bold", minWidth: 150, textAlign: "center" }}>
                {MONTH_NAMES[currentMonth]} {currentYear}
              </Typography>
              <IconButton onClick={nextMonth} color="primary">
                <ChevronRightIcon />
              </IconButton>
            </Box>
          </DialogTitle>

          <DialogContent sx={{ p: 2 }}>
            {/* Week days labels */}
            <Box sx={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", mb: 1, pb: 1, borderBottom: "1px solid", borderColor: "divider" }}>
              {WEEK_DAYS.map(day => (
                <Box key={day} sx={{ textAlign: "center" }}>
                  <Typography variant="caption" sx={{ fontFamily: "var(--font-roboto-mono)", fontWeight: "bold", color: "text.secondary" }}>
                    {day}
                  </Typography>
                </Box>
              ))}
            </Box>

            {/* Calendar dates grid */}
            <Box sx={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", borderLeft: "1px solid", borderTop: "1px solid", borderColor: "divider" }}>
              {renderCalendarDays()}
            </Box>
          </DialogContent>

          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setCalendarOpen(false)} variant="outlined" color="primary" sx={{ borderRadius: 0, fontFamily: "var(--font-orbitron)" }}>
              CLOSE TERMINAL
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </SidebarLayout>
  );
}

export default function Dashboard() {
  return (
    <Suspense fallback={
      <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "background.default" }}>
        <CircularProgress />
      </Box>
    }>
      <DashboardContent />
    </Suspense>
  );
}
