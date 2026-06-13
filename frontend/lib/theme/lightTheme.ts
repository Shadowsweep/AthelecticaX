import { createTheme } from "@mui/material/styles";

export const lightTheme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#0F172A", // Deep Charcoal
      contrastText: "#FFFFFF",
    },
    secondary: {
      main: "#2563EB", // Athletic Blue
      contrastText: "#FFFFFF",
    },
    success: {
      main: "#10B981", // Emerald Green
      contrastText: "#FFFFFF",
    },
    error: {
      main: "#EF4444",
    },
    background: {
      default: "#F8FAFC", // Cool grey-white
      paper: "#FFFFFF",
    },
    text: {
      primary: "#0F172A",
      secondary: "#64748B",
    },
    divider: "#E2E8F0",
  },
  typography: {
    fontFamily: 'var(--font-inter), "Roboto", "sans-serif"',
    h1: {
      fontFamily: 'var(--font-orbitron), "sans-serif"',
      fontWeight: 700,
      textTransform: "uppercase",
      letterSpacing: "0.1em",
    },
    h2: {
      fontFamily: 'var(--font-orbitron), "sans-serif"',
      fontWeight: 600,
      textTransform: "uppercase",
      letterSpacing: "0.08em",
    },
    h3: {
      fontFamily: 'var(--font-orbitron), "sans-serif"',
      fontWeight: 600,
    },
    h4: {
      fontFamily: 'var(--font-orbitron), "sans-serif"',
      fontWeight: 500,
    },
    h5: {
      fontFamily: 'var(--font-orbitron), "sans-serif"',
      fontWeight: 500,
    },
    h6: {
      fontFamily: 'var(--font-orbitron), "sans-serif"',
      fontWeight: 500,
    },
    subtitle1: {
      fontFamily: 'var(--font-roboto-mono), monospace',
    },
    subtitle2: {
      fontFamily: 'var(--font-roboto-mono), monospace',
    },
    body1: {
      fontSize: "0.875rem",
    },
    body2: {
      fontSize: "0.75rem",
    },
  },
  shape: {
    borderRadius: 0,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 0,
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          fontWeight: 600,
          boxShadow: "none",
          borderWidth: "1px",
          padding: "8px 16px",
          "&:hover": {
            boxShadow: "0 0 8px rgba(37, 99, 235, 0.2)",
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 0,
          border: "1px solid #E2E8F0",
          backgroundColor: "#FFFFFF",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 0,
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: "#E2E8F0",
          },
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        InputLabelProps: {
          shrink: true,
        },
      } as any,
    },
    MuiInputLabel: {
      defaultProps: {
        shrink: true,
      },
      styleOverrides: {
        root: {
          fontFamily: "var(--font-roboto-mono)",
          fontSize: "0.75rem",
          textTransform: "uppercase",
        },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        input: {
          fontFamily: "var(--font-inter)",
        },
      },
    },
  },
});
