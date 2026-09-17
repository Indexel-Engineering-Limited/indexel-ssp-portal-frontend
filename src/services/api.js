import axios from "axios";

/**
 * Shared axios instance.
 * Base URL is pulled from the VITE_API_BASE_URL env variable so it can be
 * changed per environment without touching source code.
 *
 * Usage:
 *   import api from "./api";
 *   const res = await api.get("/companies");
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000",
  timeout: 15000,
  // Do NOT set Content-Type here - let axios set it automatically based on payload type
  // (application/json for objects, multipart/form-data for FormData)
});

// ─── Request interceptor ───────────────────────────────────────────────────
// Attach auth token when available (JWT / session token stored in localStorage)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token") ?? sessionStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Set Content-Type to application/json ONLY if:
    // 1. It's not already set (don't override FormData)
    // 2. The data is not FormData
    if (!config.headers["Content-Type"] && !(config.data instanceof FormData)) {
      config.headers["Content-Type"] = "application/json";
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response interceptor ─────────────────────────────────────────────────
// Handle 401 Unauthorized (expired/invalid token) and redirect to login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Check if this is a 401 Unauthorized error
    if (error.response?.status === 401) {
      // Clear auth data
      localStorage.removeItem("auth_session");
      sessionStorage.removeItem("auth_session");
      localStorage.removeItem("token");
      sessionStorage.removeItem("token");

      // Redirect to login page
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }

    const message =
      error.response?.data?.message ??
      error.response?.data?.error ??
      error.message ??
      "An unexpected error occurred";
    return Promise.reject(new Error(message));
  }
);

export default api;