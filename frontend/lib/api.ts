import { store } from "./store/store";
import { setCredentials, clearCredentials } from "./store/slices/authSlice";

export function getApiUrl() {
  const configuredUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  if (typeof window !== "undefined" && configuredUrl.includes("localhost")) {
    return `${window.location.protocol}//${window.location.hostname}:8000`;
  }

  return configuredUrl.replace(/\/$/, "");
}

let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

function subscribeTokenRefresh(cb: (token: string) => void) {
  refreshSubscribers.push(cb);
}

function onRefreshed(token: string) {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
}

const ADMIN_KEY = process.env.NEXT_PUBLIC_ADMIN_KEY || "change-me";

export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const apiUrl = getApiUrl();
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  // Clone headers and inject authorization token
  const headers = new Headers(options.headers || {});
  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  if (!headers.has("X-Admin-Key")) {
    headers.set("X-Admin-Key", ADMIN_KEY);
  }
  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const fetchOptions: RequestInit = {
    ...options,
    headers,
    signal: options.signal || AbortSignal.timeout(12000),
  };

  try {
    const response = await fetch(`${apiUrl}${path}`, fetchOptions);

    // If unauthorized, attempt token refresh
    if (response.status === 401 && typeof window !== "undefined") {
      const refreshToken = localStorage.getItem("refreshToken");

      if (refreshToken) {
        if (!isRefreshing) {
          isRefreshing = true;
          try {
            const refreshRes = await fetch(`${apiUrl}/api/v1/auth/refresh`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ refresh_token: refreshToken }),
            });

            if (refreshRes.ok) {
              const data = await refreshRes.json();
              // Update state and storage
              store.dispatch(
                setCredentials({
                  token: data.access_token,
                  refreshToken: data.refresh_token,
                  user: data.user,
                })
              );
              isRefreshing = false;
              onRefreshed(data.access_token);
            } else {
              // Refresh failed, log out user
              store.dispatch(clearCredentials());
              isRefreshing = false;
              window.location.href = "/login";
              throw new Error("Session expired. Please log in again.");
            }
          } catch (refreshErr) {
            isRefreshing = false;
            store.dispatch(clearCredentials());
            window.location.href = "/login";
            throw refreshErr;
          }
        }

        // Return a promise that resolves with the retried request
        return new Promise<T>((resolve, reject) => {
          subscribeTokenRefresh((newToken) => {
            headers.set("Authorization", `Bearer ${newToken}`);
            fetch(`${apiUrl}${path}`, { ...fetchOptions, headers })
              .then((res) => {
                if (!res.ok) {
                  return res.json().then((b) => reject(new Error(b.detail || "Request failed")));
                }
                return res.status === 204 ? (resolve(undefined as T)) : res.json().then(resolve);
              })
              .catch(reject);
          });
        });
      }
    }

    if (!response.ok) {
      const body = await response.json().catch(() => ({ detail: "Request failed" }));
      throw new Error(body.detail || "Request failed");
    }

    return response.status === 204 ? (undefined as T) : response.json();
  } catch (error) {
    if (error instanceof Error && error.name === "TimeoutError") {
      throw new Error(`Cannot reach the API server at ${apiUrl}. Verify server status and network connectivity.`);
    }
    throw error;
  }
}
