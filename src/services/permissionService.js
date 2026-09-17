import api from "./api";

export async function getAllModules() {
  const res = await api.get("/api/permissions");
  return res.data?.data ?? res.data;
}

export async function getMenuModules() {
  const res = await api.get("/api/permissions/menu");
  return res.data?.data ?? res.data;
}

/**
 * GET /api/permissions/user/:userId
 * Response shape: { user: { id, name, role }, permissions: [...] }
 * Returns the full data object so the caller can read both .user and .permissions
 */
export async function getUserPermissions(userId) {
  const res = await api.get(`/api/permissions/user/${userId}`);
  // envelope: { success, data: { user, permissions }, message }
  return res.data?.data ?? res.data;
}

/**
 * Save all permission changes for a user in one request.
 * POST /api/permissions/assign
 * Body: { userId, permissions: [{ permissionId, canRead, canWrite }] }
 */
export async function saveUserPermissions(userId, permissions) {
  const res = await api.post("/api/permissions/assign", {
    userId,
    permissions,
  });
  return res.data?.data ?? res.data;
}

// Kept for backward compat — not used by the new page
export async function assignPermission(payload) {
  const res = await api.post("/api/permissions/assign", payload);
  return res.data?.data ?? res.data;
}

export async function updatePermission(payload) {
  const res = await api.put("/api/permissions/update", payload);
  return res.data?.data ?? res.data;
}

export async function revokePermission(permissionId) {
  const res = await api.delete("/api/permissions/revoke", {
    data: { permission_id: permissionId },
  });
  return res.data?.data ?? res.data;
}
