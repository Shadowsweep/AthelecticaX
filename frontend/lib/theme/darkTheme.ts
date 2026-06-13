import { createTheme } from "@mui/material/styles";

export const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#00E5FF", // Cyber Cyan
      contrastText: "#0A0E17",
    },
    secondary: {
      main: "#FF007F", // Neon Magenta/Pink
      contrastText: "#FFFFFF",
    },
    success: {
      main: "#39FF14", // Esports Green
      contrastText: "#0A0E17",
    },
    error: {
      main: "#FF007F",
    },
    background: {
      default: "#0A0E17", // Space Cadet cadet blue-black
      paper: "#111625",   // Panel background
    },
    text: {
      primary: "#F1F5F9",
      secondary: "#94A3B8",
    },
    divider: "#1E293B",
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
    borderRadius: 0, // Sharp corners
  },
  components: {
    MuiButton: {
      variants: [
        {
          props: { variant: "contained", color: "primary" },
          style: {
            border: "1px solid #00E5FF",
          },
        },
        {
          props: { variant: "outlined", color: "primary" },
          style: {
            border: "1px solid rgba(0, 229, 255, 0.4)",
            color: "#00E5FF",
            "&:hover": {
              border: "1px solid #00E5FF",
              backgroundColor: "rgba(0, 229, 255, 0.05)",
            },
          },
        },
      ],
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
            boxShadow: "0 0 8px rgba(0, 229, 255, 0.4)",
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 0,
          border: "1px solid #1E293B",
          backgroundColor: "#111625",
          boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.3)",
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 0,
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: "#1E293B",
          },
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: "#00E5FF",
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: "#00E5FF",
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
