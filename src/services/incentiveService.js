import api from "./api";

// ─── Schemes ──────────────────────────────────────────────────────────────

export const getSchemes = () =>
  api.get("/api/incentives/schemes").then((r) => r.data?.data ?? r.data);

export const createScheme = (data) =>
  api.post("/api/incentives/schemes", data).then((r) => r.data?.data ?? r.data);

export const updateScheme = (id, data) =>
  api.put(`/api/incentives/schemes/${id}`, data).then((r) => r.data?.data ?? r.data);

// ─── Achievement Rules ────────────────────────────────────────────────────

export const getAchievementRules = (schemeId) =>
  api.get(`/api/incentives/schemes/${schemeId}/achievement-rules`).then((r) => r.data?.data ?? r.data);

// Create a single achievement rule
export const createAchievementRule = (schemeId, rule) =>
  api.post(`/api/incentives/schemes/${schemeId}/achievement-rules`, rule).then((r) => r.data?.data ?? r.data);

// Update a single achievement rule by its own id
export const updateAchievementRule = (schemeId, ruleId, rule) =>
  api.put(`/api/incentives/schemes/${schemeId}/achievement-rules/${ruleId}`, rule).then((r) => r.data?.data ?? r.data);

// Delete a single achievement rule
export const deleteAchievementRule = (schemeId, ruleId) =>
  api.delete(`/api/incentives/schemes/${schemeId}/achievement-rules/${ruleId}`).then((r) => r.data?.data ?? r.data);

// ─── Margin Rules ─────────────────────────────────────────────────────────

export const getMarginRules = (schemeId) =>
  api.get(`/api/incentives/schemes/${schemeId}/margin-rules`).then((r) => r.data?.data ?? r.data);

// Create a single margin rule
export const createMarginRule = (schemeId, rule) =>
  api.post(`/api/incentives/schemes/${schemeId}/margin-rules`, rule).then((r) => r.data?.data ?? r.data);

// Update a single margin rule by its own id
export const updateMarginRule = (schemeId, ruleId, rule) =>
  api.put(`/api/incentives/schemes/${schemeId}/margin-rules/${ruleId}`, rule).then((r) => r.data?.data ?? r.data);

// Delete a single margin rule
export const deleteMarginRule = (schemeId, ruleId) =>
  api.delete(`/api/incentives/schemes/${schemeId}/margin-rules/${ruleId}`).then((r) => r.data?.data ?? r.data);

// ─── Orders ───────────────────────────────────────────────────────────────

export const getOrders = () =>
  api.get("/api/incentives/orders").then((r) => r.data?.data ?? r.data);

export const getOrder = (id) =>
  api.get(`/api/incentives/orders/${id}`).then((r) => r.data?.data ?? r.data);

export const createOrder = (data) =>
  api.post("/api/incentives/orders", data).then((r) => r.data?.data ?? r.data);

export const updateOrder = (id, d) =>
  api.put(`/api/incentives/orders/${id}`, d).then((r) => r.data?.data ?? r.data);

export const calculateOrder = (data) =>
  api.post("/api/incentives/orders/calculate", data).then((r) => r.data?.data ?? r.data);