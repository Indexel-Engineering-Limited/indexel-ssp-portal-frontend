import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import TablePagination from "../components/company/TablePagination";
import OverviewStats from "../components/ui/ix/OverviewStats";
import SearchableSelect from "../components/ui/SearchableSelect";
import ServiceCallFormModal from "../components/serviceCall/ServiceCallFormModal";
import ServiceCallViewDrawer from "../components/serviceCall/ServiceCallViewDrawer";
import { IssueTags, PendingBadge } from "../components/serviceCall/ServiceCallBadges";
import { getAllCompanies } from "../services/companyService";
import { deleteServiceCall, getServiceCalls } from "../services/serviceCallService";
import { canWriteModule } from "../services/authService";
import { errorMessage, formatCallDate } from "../utils/serviceCall";

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];
const SEARCH_DEBOUNCE_MS = 400;

const DEFAULT_FILTERS = {
  search: "",
  company_id: "",
  is_pending: "",
  service_type: "",
  from_date: "",
  to_date: "",
};

const filterInputCls =
  "rounded-lg border border-[#c5d3e4]/50 bg-[#f8fafd] px-3 py-2 text-[13px] text-[#111827] outline-none focus:border-[#2d55a0]";

function useDebounced(value, delay) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

function Toast({ toast, onDismiss }) {
  if (!toast) return null;
  const ok = toast.type === "success";
  return (
    <div className="fixed bottom-5 right-5 z-[150] max-w-sm">
      <div
        className={[
          "flex items-center gap-2 rounded-lg border px-4 py-3 shadow-lg",
          ok ? "border-[#bbf7d0] bg-[#f0fdf4] text-[#166534]" : "border-[#fecaca] bg-[#fef2f2] text-[#ba1a1a]",
        ].join(" ")}
      >
        <span className="material-symbols-outlined text-[18px]">{ok ? "check_circle" : "error"}</span>
        <span className="text-[13px] flex-1">{toast.text}</span>
        <button type="button" onClick={onDismiss} className="opacity-60 hover:opacity-100">
          <span className="material-symbols-outlined text-[16px]">close</span>
        </button>
      </div>
    </div>
  );
}

export default function ServiceCallsPage() {
  const canEdit = canWriteModule("service_calls");

  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZE_OPTIONS[0]);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);

  const [companies, setCompanies] = useState([]);
  const [formTarget, setFormTarget] = useState(undefined); // undefined = closed, null = create, id = edit
  const [viewing, setViewing] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);

  const debouncedSearch = useDebounced(filters.search, SEARCH_DEBOUNCE_MS);
  const debouncedServiceType = useDebounced(filters.service_type, SEARCH_DEBOUNCE_MS);

  const query = useMemo(
    () => ({
      search: debouncedSearch.trim(),
      company_id: filters.company_id,
      is_pending: filters.is_pending,
      service_type: debouncedServiceType.trim(),
      from_date: filters.from_date,
      to_date: filters.to_date,
    }),
    [debouncedSearch, debouncedServiceType, filters.company_id, filters.is_pending, filters.from_date, filters.to_date]
  );

  const showToast = useCallback((type, text) => {
    clearTimeout(toastTimer.current);
    setToast({ type, text });
    toastTimer.current = setTimeout(() => setToast(null), 3500);
  }, []);
  useEffect(() => () => clearTimeout(toastTimer.current), []);

  const requestId = useRef(0);
  const loadRows = useCallback(async () => {
    const id = ++requestId.current;
    setLoading(true);
    setError(null);
    try {
      const { rows: data, pagination } = await getServiceCalls({ ...query, page, limit: pageSize });
      if (id !== requestId.current) return;
      setRows(data);
      setTotal(pagination?.total ?? data.length);
      setTotalPages(Math.max(1, pagination?.total_pages ?? 1));
    } catch (err) {
      if (id !== requestId.current) return;
      setError(errorMessage(err, "Failed to load service calls"));
      setRows([]);
    } finally {
      if (id === requestId.current) setLoading(false);
    }
  }, [query, page, pageSize]);

  useEffect(() => { loadRows(); }, [loadRows]);

  // Overall summary counts (independent of filters)
  const loadStats = useCallback(async () => {
    try {
      const [all, pending, done] = await Promise.all([
        getServiceCalls({ page: 1, limit: 1 }),
        getServiceCalls({ page: 1, limit: 1, is_pending: 1 }),
        getServiceCalls({ page: 1, limit: 1, is_pending: 0 }),
      ]);
      setStats({
        total: all.pagination?.total ?? 0,
        pending: pending.pagination?.total ?? 0,
        done: done.pagination?.total ?? 0,
      });
    } catch {
      setStats(null);
    }
  }, []);

  useEffect(() => { loadStats(); }, [loadStats]);

  useEffect(() => {
    getAllCompanies()
      .then((data) => {
        const list = Array.isArray(data) ? data : [];
        list.sort((a, b) => (a.company_name || "").localeCompare(b.company_name || ""));
        setCompanies(list);
      })
      .catch(() => setCompanies([]));
  }, []);

  const companyFilterOptions = useMemo(
    () => [
      { value: "", label: "All companies" },
      ...companies.map((c) => ({ value: String(c.id), label: c.company_name, sub: c.company_id })),
    ],
    [companies]
  );

  const hasActiveFilters = Object.entries(filters).some(([k, v]) => v !== DEFAULT_FILTERS[k]);

  function setFilter(name, value) {
    setFilters((f) => ({ ...f, [name]: value }));
    setPage(1);
  }

  function clearFilters() {
    setFilters(DEFAULT_FILTERS);
    setPage(1);
  }

  function handlePageSizeChange(e) {
    setPageSize(Number(e.target.value));
    setPage(1);
  }

  async function handleDelete(sc) {
    const confirmed = window.confirm(`Delete service call ${sc.case_no}? This cannot be undone.`);
    if (!confirmed) return;
    setDeletingId(sc.id);
    try {
      await deleteServiceCall(sc.id);
      showToast("success", `Service call ${sc.case_no} deleted.`);
      if (viewing?.id === sc.id) setViewing(null);
      // Step back a page if this was the last row on it
      if (rows.length === 1 && page > 1) setPage((p) => p - 1);
      else loadRows();
      loadStats();
    } catch (err) {
      showToast("error", errorMessage(err, "Failed to delete service call"));
    } finally {
      setDeletingId(null);
    }
  }

  function handleSaved(saved, isEdit) {
    setFormTarget(undefined);
    showToast("success", isEdit ? "Service call updated." : saved?.case_no ? `Service call ${saved.case_no} created.` : "Service call created.");
    if (!isEdit && page !== 1) setPage(1);
    else loadRows();
    loadStats();
  }

  const overviewStats = stats
    ? [
        { label: "Total Calls", value: stats.total.toLocaleString(), detail: "All service calls" },
        { label: "Pending", value: stats.pending.toLocaleString(), detail: "Awaiting service" },
        { label: "Closed", value: stats.done.toLocaleString(), detail: "Service completed" },
        { label: "Showing", value: total.toLocaleString(), detail: hasActiveFilters ? "Matching filters" : "In current view" },
      ]
    : [];

  return (
    <>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-5 gap-4">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2.5">
            <h1 className="font-semibold text-[20px] text-[#111827]" style={{ fontFamily: "'Hanken Grotesk', sans-serif" }}>
              Service Call Report
            </h1>
            <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full bg-[#dbe5f8] text-[11px] font-medium text-[#374151] border border-[#c5d3e4]/30">
              {(stats?.total ?? total).toLocaleString()} Total
            </span>
          </div>
          <p className="text-[12.5px] text-[#374151]">Track customer service calls, their status and issue categories.</p>
        </div>

        <div className="flex w-full sm:w-auto items-center gap-2">
          <label className="flex items-center gap-2 text-[12px] text-[#374151] whitespace-nowrap">
            Show
            <select value={pageSize} onChange={handlePageSizeChange} className={`${filterInputCls} px-2`}>
              {PAGE_SIZE_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </label>
          {canEdit && (
            <button
              type="button"
              onClick={() => setFormTarget(null)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#2d55a0] px-3 py-2 text-[12.5px] font-medium text-white hover:bg-[#234690] transition-colors shrink-0"
            >
              <span className="material-symbols-outlined text-[16px]">add</span>
              Add Service Call
            </button>
          )}
        </div>
      </div>

      <OverviewStats items={overviewStats} />

      {/* Filters */}
      <div className="mb-4 rounded-xl border border-[#c5d3e4]/20 bg-[#f8fafd] p-3 shadow-sm">
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-6">
          <div className="relative lg:col-span-2">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#6b7280] text-[18px]">search</span>
            <input
              value={filters.search}
              onChange={(e) => setFilter("search", e.target.value)}
              placeholder="Search case no, product, PO, engineer, company, contact…"
              className={`${filterInputCls} w-full pl-9 placeholder:text-[#6b7280]/60`}
            />
          </div>
          <SearchableSelect
            options={companyFilterOptions}
            value={filters.company_id}
            onChange={(v) => setFilter("company_id", v)}
            placeholder="All companies"
          />
          <select value={filters.is_pending} onChange={(e) => setFilter("is_pending", e.target.value)} className={filterInputCls}>
            <option value="">All statuses</option>
            <option value="1">Pending</option>
            <option value="0">Done</option>
          </select>
          <input
            value={filters.service_type}
            onChange={(e) => setFilter("service_type", e.target.value)}
            placeholder="Service type"
            className={`${filterInputCls} placeholder:text-[#6b7280]/60`}
          />
          <div className="flex items-center gap-1.5">
            <input
              type="date"
              title="From call date"
              value={filters.from_date}
              max={filters.to_date || undefined}
              onChange={(e) => setFilter("from_date", e.target.value)}
              className={`${filterInputCls} min-w-0 flex-1 px-2`}
            />
            <span className="text-[12px] text-[#6b7280]">–</span>
            <input
              type="date"
              title="To call date"
              value={filters.to_date}
              min={filters.from_date || undefined}
              onChange={(e) => setFilter("to_date", e.target.value)}
              className={`${filterInputCls} min-w-0 flex-1 px-2`}
            />
          </div>
        </div>
        {hasActiveFilters && (
          <div className="mt-2 flex justify-end">
            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex items-center gap-1 text-[12px] font-medium text-[#2d55a0] hover:underline"
            >
              <span className="material-symbols-outlined text-[15px]">filter_alt_off</span>
              Clear filters
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="mb-4 flex items-center justify-between gap-3 rounded-lg border border-[#ffdad6] bg-[#ffdad6]/40 px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#ba1a1a] text-[18px]">error</span>
            <span className="text-[13px] text-[#ba1a1a]">{error}</span>
          </div>
          <button onClick={loadRows} className="text-[12px] font-medium text-[#111827] underline">Retry</button>
        </div>
      )}

      {loading && rows.length === 0 ? (
        <div className="bg-[#f8fafd] rounded-xl border border-[#c5d3e4]/20 py-16 flex flex-col items-center gap-2">
          <span className="material-symbols-outlined text-[#a6bcee] text-[28px] animate-spin">progress_activity</span>
          <span className="text-[13px] text-[#374151]">Loading service calls...</span>
        </div>
      ) : (
        <div className="relative bg-[#f8fafd] rounded-xl border border-[#c5d3e4]/20 overflow-hidden flex flex-col mb-6 shadow-sm">
          {loading && (
            <div className="absolute inset-x-0 top-0 h-0.5 overflow-hidden bg-[#dbe5f8]">
              <div className="h-full w-1/3 animate-pulse bg-[#2d55a0]" />
            </div>
          )}
          <div className={`overflow-x-auto w-full transition-opacity ${loading ? "opacity-60" : ""}`}>
            <table className="w-full min-w-[1280px] text-left border-collapse">
              <thead>
                <tr className="bg-[#f8fafd] text-[#374151] text-[11px] font-semibold uppercase tracking-wider border-b border-[#d4e0f0]/50">
                  <th className="py-2.5 px-4">Case No</th>
                  <th className="py-2.5 px-3">Call Date</th>
                  <th className="py-2.5 px-3">Company</th>
                  <th className="py-2.5 px-3">Contact</th>
                  <th className="py-2.5 px-3">Product / Model / Serial</th>
                  <th className="py-2.5 px-3">Service Type</th>
                  <th className="py-2.5 px-3">PO No</th>
                  <th className="py-2.5 px-3">Engineer</th>
                  <th className="py-2.5 px-3">Service Done</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Issues</th>
                  <th className="py-2.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-[13px] text-[#111827]">
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={12} className="py-14 text-center">
                      <span className="material-symbols-outlined text-[32px] text-[#a6bcee]">support_agent</span>
                      <p className="text-[13px] font-medium text-[#374151] mt-1">
                        {hasActiveFilters ? "No service calls match your filters." : "No service calls yet."}
                      </p>
                      {hasActiveFilters ? (
                        <button onClick={clearFilters} className="mt-1 text-[12px] text-[#2d55a0] underline">
                          Clear filters
                        </button>
                      ) : canEdit && (
                        <button onClick={() => setFormTarget(null)} className="mt-1 text-[12px] text-[#2d55a0] underline">
                          Add the first service call
                        </button>
                      )}
                    </td>
                  </tr>
                ) : (
                  rows.map((sc) => {
                    const pending = Boolean(Number(sc.is_pending));
                    return (
                      <tr
                        key={sc.id}
                        onClick={() => setViewing(sc)}
                        className={[
                          "border-b border-[#d4e0f0]/40 last:border-0 cursor-pointer transition-colors",
                          pending ? "hover:bg-[#fffbeb]" : "hover:bg-[#f0f4fa]/45",
                        ].join(" ")}
                      >
                        <td className="px-4 py-3 font-mono text-[12.5px] font-medium whitespace-nowrap">{sc.case_no}</td>
                        <td className="px-3 py-3 text-[#374151] whitespace-nowrap">{formatCallDate(sc.call_date)}</td>
                        <td className="px-3 py-3 max-w-[200px]">
                          <p className="truncate font-medium" title={sc.company_name}>{sc.company_name || "—"}</p>
                          {sc.location && <p className="truncate text-[11px] text-[#6b7280]" title={sc.location}>{sc.location}</p>}
                        </td>
                        <td className="px-3 py-3 max-w-[180px]">
                          <p className="truncate">{sc.contact_name || "—"}</p>
                          {sc.contact_number && <p className="truncate text-[11px] text-[#6b7280]">{sc.contact_number}</p>}
                        </td>
                        <td className="px-3 py-3 text-[#374151] max-w-[200px]">
                          <span className="line-clamp-2" title={sc.product_model_serial ?? ""}>{sc.product_model_serial || "—"}</span>
                        </td>
                        <td className="px-3 py-3 text-[#374151]">{sc.service_type || "—"}</td>
                        <td className="px-3 py-3 text-[#374151]">{sc.po_number || "—"}</td>
                        <td className="px-3 py-3 text-[#374151]">{sc.engineer_name || "—"}</td>
                        <td className="px-3 py-3 text-[#374151] whitespace-nowrap">{sc.service_done_date ? formatCallDate(sc.service_done_date) : "—"}</td>
                        <td className="px-3 py-3"><PendingBadge pending={sc.is_pending} /></td>
                        <td className="px-3 py-3"><IssueTags sc={sc} emptyText={<span className="text-[#6b7280]">—</span>} /></td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                            <button
                              className="flex h-7 w-7 items-center justify-center rounded-md text-[#6b7280] hover:bg-[#eef2fb] hover:text-[#2d55a0] transition-colors"
                              title="View Details"
                              onClick={() => setViewing(sc)}
                            >
                              <span className="material-symbols-outlined text-[15px]">visibility</span>
                            </button>
                            {canEdit && (
                              <>
                                <button
                                  className="flex h-7 w-7 items-center justify-center rounded-md text-[#6b7280] hover:bg-[#eef2fb] hover:text-[#2d55a0] transition-colors"
                                  title="Edit"
                                  onClick={() => setFormTarget(sc.id)}
                                >
                                  <span className="material-symbols-outlined text-[15px]">edit</span>
                                </button>
                                <button
                                  className="flex h-7 w-7 items-center justify-center rounded-md text-[#6b7280] hover:bg-[#ffdad6]/60 hover:text-[#ba1a1a] transition-colors disabled:opacity-50"
                                  title="Delete"
                                  disabled={deletingId === sc.id}
                                  onClick={() => handleDelete(sc)}
                                >
                                  <span className={`material-symbols-outlined text-[15px] ${deletingId === sc.id ? "animate-spin" : ""}`}>
                                    {deletingId === sc.id ? "progress_activity" : "delete"}
                                  </span>
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          <TablePagination
            total={total}
            page={page}
            pageSize={pageSize}
            totalPages={totalPages}
            onChange={setPage}
            itemLabel="service calls"
          />
        </div>
      )}

      {viewing && (
        <ServiceCallViewDrawer
          serviceCall={viewing}
          canEdit={canEdit}
          onEdit={(sc) => { setViewing(null); setFormTarget(sc.id); }}
          onClose={() => setViewing(null)}
        />
      )}

      {canEdit && formTarget !== undefined && (
        <ServiceCallFormModal
          serviceCallId={formTarget}
          companies={companies}
          onClose={() => setFormTarget(undefined)}
          onSaved={handleSaved}
        />
      )}

      <Toast toast={toast} onDismiss={() => setToast(null)} />
    </>
  );
}
