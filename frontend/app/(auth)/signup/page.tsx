"use client";

import React, { useState } from "react";
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
import { toggleThemeMode } from "../../../lib/store/slices/themeSlice";

export default function SignupPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const themeMode = useSelector((state: RootState) => state.theme.mode);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (password.length < 8) {
      setError("Password key must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Password keys do not match.");
      return;
    }

    setLoading(true);

    try {
      await api("/api/v1/auth/signup", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      setSuccess(true);
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      
      // Auto redirect to login after 3 seconds
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    } catch (err: any) {
      setError(err.message || "Registration sequence failed.");
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
              SYSTEM // REGISTRATION
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

          {success && (
            <Alert 
              severity="success" 
              sx={{ 
                mb: 3, 
                borderRadius: 0, 
                borderLeft: "4px solid", 
                borderColor: "success.main" 
              }}
            >
              REGISTRATION INITIALIZED. Redirection to auth terminal in progress...
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
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="confirmPassword"
              label="CONFIRM PASSWORD ACCESS KEY"
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              disabled={loading || success}
              sx={{ 
                mt: 3, 
                mb: 2, 
                py: 1.5,
                fontFamily: "var(--font-orbitron)" 
              }}
            >
              {loading ? "PROCESSING TELEMETRY..." : "REGISTER ACCOUNT REQUEST"}
            </Button>

            <Box sx={{ display: "flex", justifyContent: "center", mt: 1 }}>
              <Link 
                href="/login" 
                variant="body2" 
                sx={{ 
                  color: "primary.main", 
                  fontFamily: "var(--font-roboto-mono)", 
                  fontSize: "0.75rem",
                  textDecoration: "none",
                  "&:hover": { textDecoration: "underline" }
                }}
              >
                // RETURN TO LOGIN TERMINAL
              </Link>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}
