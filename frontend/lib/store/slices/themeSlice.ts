import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface ThemeState {
  mode: "dark" | "light";
}

const getInitialState = (): ThemeState => {
  if (typeof window !== "undefined") {
    const savedMode = localStorage.getItem("themeMode");
    if (savedMode === "dark" || savedMode === "light") {
      return { mode: savedMode };
    }
  }
  return { mode: "dark" }; // default to dark telemetry mode
};

const themeSlice = createSlice({
  name: "theme",
  initialState: getInitialState(),
  reducers: {
    toggleThemeMode: (state) => {
      const nextMode = state.mode === "dark" ? "light" : "dark";
      state.mode = nextMode;
      if (typeof window !== "undefined") {
        localStorage.setItem("themeMode", nextMode);
      }
    },
    setThemeMode: (state, action: PayloadAction<"dark" | "light">) => {
      state.mode = action.payload;
      if (typeof window !== "undefined") {
        localStorage.setItem("themeMode", action.payload);
      }
    },
  },
});

export const { toggleThemeMode, setThemeMode } = themeSlice.actions;
export default themeSlice.reducer;
