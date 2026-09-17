import api from "./api";

/**
 * GET /api/audit-logs
 * Supports optional query filters: table_name, action, user_email, from, to
 */
export async function getAuditLogs(filters = {}) {
  const params = {};
  if (filters.table_name && filters.table_name !== "All") params.table_name = filters.table_name;
  if (filters.action     && filters.action     !== "All") params.action     = filters.action;
  if (filters.user_email && filters.user_email !== "All") params.user_email = filters.user_email;
  if (filters.from) params.from = filters.from;
  if (filters.to)   params.to   = filters.to;

  const res = await api.get("/api/audit-logs", { params });
  return res.data?.data ?? res.data ?? [];
}

/**
 * GET /api/audit-logs/:id
 */
export async function getAuditLogById(id) {
  const res = await api.get(`/api/audit-logs/${id}`);
  return res.data?.data ?? res.data;
}