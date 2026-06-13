import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface User {
  id: number;
  email: string;
  role: string;
  is_active: boolean;
  created_at: string;
}

interface AuthState {
  token: string | null;
  refreshToken: string | null;
  user: User | null;
  isAuthenticated: boolean;
}

const getInitialState = (): AuthState => {
  if (typeof window !== "undefined") {
    try {
      const token = localStorage.getItem("token");
      const refreshToken = localStorage.getItem("refreshToken");
      const userStr = localStorage.getItem("user");
      const user = userStr ? JSON.parse(userStr) : null;
      return {
        token,
        refreshToken,
        user,
        isAuthenticated: !!token,
      };
    } catch {
      // Fallback in case of parse error
    }
  }
  return {
    token: null,
    refreshToken: null,
    user: null,
    isAuthenticated: false,
  };
};

const authSlice = createSlice({
  name: "auth",
  initialState: getInitialState(),
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ token: string; refreshToken: string; user: User }>
    ) => {
      const { token, refreshToken, user } = action.payload;
      state.token = token;
      state.refreshToken = refreshToken;
      state.user = user;
      state.isAuthenticated = true;

      if (typeof window !== "undefined") {
        localStorage.setItem("token", token);
        localStorage.setItem("refreshToken", refreshToken);
        localStorage.setItem("user", JSON.stringify(user));
      }
    },
    clearCredentials: (state) => {
      state.token = null;
      state.refreshToken = null;
      state.user = null;
      state.isAuthenticated = false;

      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
      }
    },
    updateUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      if (typeof window !== "undefined") {
        localStorage.setItem("user", JSON.stringify(action.payload));
      }
    },
  },
});

export const { setCredentials, clearCredentials, updateUser } = authSlice.actions;
export default authSlice.reducer;
