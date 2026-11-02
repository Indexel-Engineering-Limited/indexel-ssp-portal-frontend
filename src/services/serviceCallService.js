import api from "./api";

// ─── Service Call endpoints ───────────────────────────────────────────────

/**
 * GET /api/service-calls
 * Params: search, company_id, contact_id, service_type, is_pending, from_date, to_date, page, limit
 * Returns { rows, pagination } — pagination is null when page/limit are not sent.
 */
export async function getServiceCalls(params = {}) {
  const query = Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== "" && v !== null && v !== undefined)
  );
  const res = await api.get("/api/service-calls", { params: query });
  const body = res.data ?? {};
  return {
    rows: Array.isArray(body.data) ? body.data : [],
    pagination: body.pagination ?? body.data?.pagination ?? null,
  };
}

export async function getServiceCall(id) {
  const res = await api.get(`/api/service-calls/${id}`);
  return res.data?.data ?? res.data;
}

export async function createServiceCall(payload) {
  const res = await api.post("/api/service-calls", payload);
  return res.data?.data ?? res.data;
}

/** PUT /api/service-calls/:id — send only the changed fields. */
export async function updateServiceCall(id, payload) {
  const res = await api.put(`/api/service-calls/${id}`, payload);
  return res.data?.data ?? res.data;
}

export async function deleteServiceCall(id) {
  const res = await api.delete(`/api/service-calls/${id}`);
  return res.data?.data ?? res.data;
}

/**
 * GET /api/companies/company/contacts/:companyCode
 * companyCode is the TEXT code (e.g. "ACM001"), not the numeric id.
 * A company with no contacts comes back as success:false + data:[] (sometimes
 * with a 404), which is treated as an empty list rather than an error.
 */
export async function getCompanyContacts(companyCode) {
  const res = await api.get(`/api/companies/company/contacts/${encodeURIComponent(companyCode)}`, {
    validateStatus: (s) => (s >= 200 && s < 300) || s === 404,
  });
  const body = res.data ?? {};
  if (Array.isArray(body.data)) return body.data;
  if (Array.isArray(body)) return body;
  if (body.success === false) throw new Error(body.message || "Failed to load contacts");
  return [];
}
