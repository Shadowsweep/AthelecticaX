"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { 
  Box, 
  Container, 
  Typography, 
  TextField, 
  Button, 
  Alert, 
  IconButton, 
  Link,
  Paper 
} from "@mui/material";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import SportsKabaddiIcon from "@mui/icons-material/SportsKabaddi";

import { api } from "../../../lib/api";
import { RootState } from "../../../lib/store/store";
import { setCredentials } from "../../../lib/store/slices/authSlice";
import { toggleThemeMode } from "../../../lib/store/slices/themeSlice";

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const themeMode = useSelector((state: RootState) => state.theme.mode);
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // If already authenticated, redirect to dashboard
  useEffect(() => {
    if (isAuthenticated) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await api<{
        access_token: string;
        refresh_token: string;
        user: any;
      }>("/api/v1/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      dispatch(
        setCredentials({
          token: data.access_token,
          refreshToken: data.refresh_token,
          user: data.user,
        })
      );

      // Check if user is approved. If not approved, they go to /approval (Phase 2 screen)
      if (data.user.role !== "SUPER_ADMIN") {
        // We will fetch their approval request status to verify
        try {
          const reqStatus = await api<any>(`/api/v1/approval/status`, { method: "GET" }).catch(() => null);
          if (!reqStatus || reqStatus.status !== "APPROVED") {
            router.push("/approval");
            return;
          }
        } catch {
          // If the endpoint is not built yet (Phase 2), let them pass or fallback
        }
      }

      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Authentication sequence failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "background.default",
        position: "relative",
        overflow: "hidden",
        "::before": {
          content: '""',
          position: "absolute",
          width: "200%",
          height: "200%",
          top: "-50%",
          left: "-50%",
          backgroundImage: 
            themeMode === "dark"
              ? "radial-gradient(circle, rgba(0,229,255,0.03) 0%, transparent 60%)"
              : "radial-gradient(circle, rgba(37,99,235,0.03) 0%, transparent 60%)",
          zIndex: 1,
        }
      }}
    >
      {/* Top right theme controls */}
      <Box sx={{ position: "absolute", top: 16, right: 16, zIndex: 10 }}>
        <IconButton onClick={() => dispatch(toggleThemeMode())} color="primary">
          {themeMode === "dark" ? <LightModeIcon /> : <DarkModeIcon />}
        </IconButton>
      </Box>

      <Container maxWidth="xs" sx={{ zIndex: 2 }}>
        <Paper
          elevation={0}
          sx={{
            p: 4,
            border: "1px solid",
            borderColor: "divider",
            backgroundColor: themeMode === "dark" ? "rgba(17, 22, 37, 0.85)" : "background.paper",
            backdropFilter: "blur(12px)",
            position: "relative",
          }}
        >
          {/* Top accent cyan/blue bar */}
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

          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", mb: 3 }}>
            <SportsKabaddiIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
            <Typography 
              variant="h5" 
              component="h1" 
              sx={{ 
                fontWeight: 800, 
                letterSpacing: "0.15em", 
                color: "text.primary" 
              }}
            >
              ATHLETICAX
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ 
                fontFamily: "var(--font-roboto-mono)", 
                color: "primary.main", 
                mt: 0.5 
              }}
            >
              SYSTEM // AUTHENTICATION
            </Typography>
          </Box>

          {error && (
            <Alert 
              severity="error" 
              sx={{ 
                mb: 3, 
                borderRadius: 0, 
                borderLeft: "4px solid", 
                borderColor: "error.main" 
              }}
            >
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} noValidate>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="CORPORATE EMAIL ADDRESS"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="PASSWORD ACCESS KEY"
              type="password"
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              disabled={loading}
              sx={{ 
                mt: 3, 
                mb: 2, 
                py: 1.5,
                fontFamily: "var(--font-orbitron)" 
              }}
            >
              {loading ? "ESTABLISHING CONTEXT..." : "INITIATE LOGIN SESSION"}
            </Button>

            <Box sx={{ display: "flex", justifyContent: "space-between", mt: 1 }}>
              <Link 
                href="/signup" 
                variant="body2" 
                sx={{ 
                  color: "primary.main", 
                  fontFamily: "var(--font-roboto-mono)", 
                  fontSize: "0.7rem",
                  textDecoration: "none",
                  "&:hover": { textDecoration: "underline" }
                }}
              >
                // REGISTER NEW EMPLOYEE
              </Link>
              <Link 
                href="/forgot-password" 
                variant="body2" 
                sx={{ 
                  color: "text.secondary", 
                  fontFamily: "var(--font-roboto-mono)", 
                  fontSize: "0.7rem",
                  textDecoration: "none",
                  "&:hover": { textDecoration: "underline" }
                }}
              >
                // RECOVER CREDENTIALS
              </Link>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}
