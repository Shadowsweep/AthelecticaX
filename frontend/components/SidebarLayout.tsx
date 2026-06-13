"use client";

import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { 
  Box, 
  Drawer, 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText, 
  Typography, 
  Divider, 
  Avatar, 
  IconButton,
  CircularProgress
} from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import RuleIcon from "@mui/icons-material/Rule";
import PowerSettingsNewIcon from "@mui/icons-material/PowerSettingsNew";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import SportsKabaddiIcon from "@mui/icons-material/SportsKabaddi";

import { api } from "../lib/api";
import { RootState } from "../lib/store/store";
import { clearCredentials } from "../lib/store/slices/authSlice";
import { toggleThemeMode } from "../lib/store/slices/themeSlice";

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

interface SidebarLayoutProps {
  children: React.ReactNode;
}

const drawerWidth = 280;

export default function SidebarLayout({ children }: SidebarLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const themeMode = useSelector((state: RootState) => state.theme.mode);

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    const fetchProfile = async () => {
      try {
        const data = await api<UserProfile>("/api/v1/auth/me");
        setProfile(data);

        // Check if employee is approved
        if (data.role !== "SUPER_ADMIN") {
          try {
            const statusRes = await api<{ status: string; reason: string | null }>("/api/v1/approval/status");
            if (statusRes.status !== "APPROVED") {
              router.push("/approval");
              return;
            }
          } catch (statusErr) {
            router.push("/approval");
            return;
          }
        }
      } catch (err) {
        console.error("Failed to load user profile context:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [isAuthenticated, mounted, router]);

  const handleLogout = () => {
    dispatch(clearCredentials());
    router.push("/login");
  };

  if (!mounted || !isAuthenticated) return null;

  const isAdmin = user?.role === "SUPER_ADMIN";

  const menuItems = [
    { text: "DASHBOARD", icon: <DashboardIcon />, path: "/" },
    ...(isAdmin ? [
      { text: "TAPIN/TAPOUT LOGS", icon: <FormatListBulletedIcon />, path: "/admin/logs" },
      { text: "PENDING APPROVALS", icon: <RuleIcon />, path: "/admin/approvals" }
    ] : [])
  ];

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      {/* Sidebar Drawer */}
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { 
            width: drawerWidth, 
            boxSizing: "border-box",
            backgroundColor: "background.paper",
            borderRight: "1px solid",
            borderColor: "divider",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between"
          },
        }}
      >
        <Box>
          {/* Logo Brand Header */}
          <Box sx={{ p: 3, display: "flex", alignItems: "center", gap: 1.5 }}>
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
                SECURITY HUB // PORTAL
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ borderColor: "divider" }} />

          {/* User Identification Context card */}
          <Box sx={{ p: 2.5 }}>
            {loading ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
                <CircularProgress size={24} />
              </Box>
            ) : profile ? (
              <Box 
                sx={{ 
                  p: 2, 
                  border: "1px solid", 
                  borderColor: "divider", 
                  backgroundColor: "rgba(255, 255, 255, 0.01)",
                  position: "relative"
                }}
              >
                <Box 
                  sx={{ 
                    position: "absolute", 
                    top: 0, 
                    left: 0, 
                    bottom: 0, 
                    width: "3px", 
                    backgroundColor: "primary.main" 
                  }} 
                />
                
                <Typography 
                  variant="caption" 
                  sx={{ 
                    fontFamily: "var(--font-roboto-mono)", 
                    color: "primary.main",
                    display: "block",
                    fontSize: "0.6rem",
                    mb: 1
                  }}
                >
                  // IDENTIFICATION CONTEXT
                </Typography>
                
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mt: 1 }}>
                  <Avatar 
                    sx={{ 
                      width: 34, 
                      height: 34, 
                      borderRadius: 0, 
                      backgroundColor: "primary.main",
                      color: "primary.contrastText",
                      fontWeight: "bold",
                      fontSize: "0.85rem"
                    }}
                  >
                    {profile.first_name.charAt(0)}
                  </Avatar>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography variant="body2" noWrap sx={{ fontWeight: "bold" }}>
                      {profile.first_name} {profile.last_name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontFamily: "var(--font-roboto-mono)", fontSize: "0.7rem", display: "block" }}>
                      {profile.employee_code} // {profile.department}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            ) : null}
          </Box>

          <Divider sx={{ borderColor: "divider", mb: 2 }} />

          {/* Menu Items */}
          <List sx={{ px: 1.5 }}>
            {menuItems.map((item) => {
              const active = pathname === item.path;
              return (
                <ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
                  <ListItemButton
                    onClick={() => router.push(item.path)}
                    sx={{
                      borderRadius: 0,
                      border: active ? "1px solid" : "1px solid transparent",
                      borderColor: active ? "primary.main" : "transparent",
                      backgroundColor: active ? "rgba(0, 229, 255, 0.03)" : "transparent",
                      py: 1.2,
                      px: 2,
                      "&:hover": {
                        backgroundColor: "rgba(0, 229, 255, 0.01)",
                        border: "1px solid",
                        borderColor: "divider",
                      }
                    }}
                  >
                    <ListItemIcon 
                      sx={{ 
                        minWidth: 40, 
                        color: active ? "primary.main" : "text.secondary" 
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText 
                      primary={
                        <Typography
                          sx={{
                            fontFamily: "var(--font-orbitron)",
                            fontSize: "0.75rem",
                            fontWeight: active ? "bold" : "medium",
                            letterSpacing: "0.05em",
                            color: active ? "text.primary" : "text.secondary"
                          }}
                        >
                          {item.text}
                        </Typography>
                      }
                    />
                  </ListItemButton>
                </ListItem>
              );
            })}
          </List>
        </Box>

        {/* Footer Actions */}
        <Box sx={{ p: 2 }}>
          <Divider sx={{ borderColor: "divider", mb: 2 }} />
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <IconButton onClick={() => dispatch(toggleThemeMode())} color="primary">
                {themeMode === "dark" ? <LightModeIcon /> : <DarkModeIcon />}
              </IconButton>
              <Typography variant="caption" sx={{ fontFamily: "var(--font-roboto-mono)", fontSize: "0.65rem", color: "text.secondary" }}>
                {themeMode.toUpperCase()} MODE
              </Typography>
            </Box>
            <IconButton onClick={handleLogout} color="secondary">
              <PowerSettingsNewIcon />
            </IconButton>
          </Box>
        </Box>
      </Drawer>

      {/* Main Content Pane */}
      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1, 
          minWidth: 0, 
          backgroundColor: "background.default",
          minHeight: "100vh"
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
