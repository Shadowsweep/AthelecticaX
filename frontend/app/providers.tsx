"use client";

import React, { ReactNode } from "react";
import { Provider, useSelector } from "react-redux";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

import { store, RootState } from "../lib/store/store";
import { darkTheme } from "../lib/theme/darkTheme";
import { lightTheme } from "../lib/theme/lightTheme";

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function ThemeWrapper({ children }: { children: ReactNode }) {
  const mode = useSelector((state: RootState) => state.theme.mode);
  const activeTheme = mode === "dark" ? darkTheme : lightTheme;

  return (
    <ThemeProvider theme={activeTheme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <ThemeWrapper>{children}</ThemeWrapper>
      </QueryClientProvider>
    </Provider>
  );
}
