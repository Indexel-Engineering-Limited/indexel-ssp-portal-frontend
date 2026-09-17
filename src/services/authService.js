import api from "./api";

const AUTH_KEY = "auth_session";
const TOKEN_KEY = "token";

export async function login({ user_name, password, remember }) {
  const res = await api.post("/api/auth/login", {
    user_name,
    password,
  });

  const payload = res.data ?? {};

  if (payload.success === false || payload.status === false) {
    throw new Error(payload.message || "Invalid username or password.");
  }

  const data = payload.data ?? payload.user ?? {};

  const token =
    payload.token ??
    data.token ??
    data.access_token ??
    payload.access_token;

  // Store ALL user information returned by backend
  const session = {
    ...data,

    // Make sure these are available consistently
    user_name:
      data.user_name ??
      data.username ??
      payload.user_name ??
      payload.username ??
      user_name,

    role:
      data.role ??
      data.user_role ??
      payload.role ??
      payload.user_role ??
      "User",

    token: token ?? null,
  };

  // ALWAYS use localStorage for persistent sessions across tabs
  // Clear old sessions from both storages first
  localStorage.removeItem(AUTH_KEY);
  sessionStorage.removeItem(AUTH_KEY);
  localStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(TOKEN_KEY);

  // Store in localStorage for cross-tab persistence
  localStorage.setItem(AUTH_KEY, JSON.stringify(session));
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  }

  return payload;
}

export function isAuthenticated() {
  const token = localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);
  const session = localStorage.getItem(AUTH_KEY) || sessionStorage.getItem(AUTH_KEY);
  return Boolean(token && session);
}

export function getCurrentUser() {
  const raw =
    localStorage.getItem(AUTH_KEY) ??
    sessionStorage.getItem(AUTH_KEY);

  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function getCurrentRole() {
  return String(getCurrentUser()?.role ?? "USER").toUpperCase();
}

export function canWrite() {
  return ["ADMIN", "USER"].includes(getCurrentRole());
}

export function isAdmin() {
  return getCurrentRole() === "ADMIN";
}

// Returns the permissions array from the current session
export function getPermissions() {
  return getCurrentUser()?.permissions ?? [];
}

// Returns true if the user has can_read for a given module_key
export function hasPermission(moduleKey) {
  const perms = getPermissions();
  if (!perms.length) return true; // fallback: allow if no permissions stored
  const perm = perms.find((p) => p.module_key === moduleKey);
  return perm ? Boolean(perm.can_read) : false;
}

// Returns true if the user has can_write for a given module_key
export function canWriteModule(moduleKey) {
  const perms = getPermissions();
  if (!perms.length) return canWrite(); // fallback to role check
  const perm = perms.find((p) => p.module_key === moduleKey);
  return perm ? Boolean(perm.can_write) : false;
}

// Updates the permissions array in the stored session (after admin changes)
export function updateSessionPermissions(newPermissions) {
  const raw = localStorage.getItem(AUTH_KEY) ?? sessionStorage.getItem(AUTH_KEY);
  if (!raw) return;
  try {
    const session = JSON.parse(raw);
    session.permissions = newPermissions;
    if (localStorage.getItem(AUTH_KEY)) localStorage.setItem(AUTH_KEY, JSON.stringify(session));
    else sessionStorage.setItem(AUTH_KEY, JSON.stringify(session));
  } catch {}
}

export async function getUsers() {
  const res = await api.get("/api/auth/users");
  return res.data?.data ?? res.data;
}

export async function updateUserRole(id, role) {
  const res = await api.patch(`/api/auth/users/${id}/role`, { role });
  return res.data?.data ?? res.data;
}

export async function getUserLogs() {
  const res = await api.get("/api/auth/logs");
  return res.data?.data ?? res.data;
}

export async function registerUser(payload) {
  // payload: { user_name, name, email_id, password }
  const res = await api.post("/api/auth/register", payload);
  return res.data?.data ?? res.data;
}

export function logout() {
  localStorage.removeItem(AUTH_KEY);
  sessionStorage.removeItem(AUTH_KEY);
  localStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(TOKEN_KEY);
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY) ?? sessionStorage.getItem(TOKEN_KEY);
}