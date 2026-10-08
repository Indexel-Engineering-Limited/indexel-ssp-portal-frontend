import { useEffect, useMemo, useState } from "react";
import { getTargets, createTarget, updateTarget, patchTargetStatus, getSchemes } from "../../../services/incentiveService";
import { getAllEmployees } from "../../../services/employeeService";
import { getUsers } from "../../../services/authService";

// ─── helpers ──────────────────────────────────────────────────────────────
function fmt(n) {
  if (n == null || n === "") return "—";
  return `₹${Number(n).toLocaleString("en-IN")}`;
}

function StatusBadge({ status }) {
  const map = {
    active:   "bg-[#dcfce7] text-[#166534]",
    inactive: "bg-[#f3f4f6] text-[#6b7280]",
    draft:    "bg-[#fef9c3] text-[#854d0e]",
    achieved: "bg-[#dbe5f8] text-[#1e3a8a]",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11.5px] font-medium capitalize ${map[status] ?? "bg-[#f3f4f6] text-[#6b7280]"}`}>
      {status ?? "—"}
    </span>
  );
}

const inputCls = "w-full rounded-lg border border-[#c5d3e4]/50 bg-[#f8fafd] px-3 py-2 text-[13px] text-[#111827] outline-none focus:border-[#2d55a0] focus:ring-2 focus:ring-[#2d55a0]/10 transition-all placeholder:text-[#9ca3af]";

// ─── Target Form Modal ────────────────────────────────────────────────────
function TargetModal({ target, schemes, employees, onClose, onSaved }) {
  const isEdit = Boolean(target?.id);
  const [form, setForm] = useState({
    scheme_id:      target?.scheme_id      ?? "",
    employee_id:    target?.employee_id    ?? "",
    financial_year: target?.financial_year ?? "",
    target_amount:  target?.target_amount  ?? "",
  });
  const [errors, setErrors]     = useState({});
  const [saving, setSaving]     = useState(false);
  const [saveErr, setSaveErr]   = useState(null);

  function set(k, v) {
    setForm((p) => ({ ...p, [k]: v }));
    setErrors((p) => ({ ...p, [k]: undefined }));
  }

  function validate() {
    const e = {};
    if (!form.scheme_id)                                    e.scheme_id      = "Required";
    if (!form.employee_id)                                  e.employee_id    = "Required";
    if (!String(form.financial_year).trim())               e.financial_year = "Required";
    if (form.target_amount === "" || form.target_amount == null) e.target_amount  = "Required";
    if (form.target_amount !== "" && Number(form.target_amount) <= 0) e.target_amount = "Must be > 0";
    return e;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSaving(true); setSaveErr(null);
    try {
      const payload = {
        scheme_id:      Number(form.scheme_id),
        employee_id:    Number(form.employee_id),
        financial_year: String(form.financial_year).trim(),
        target_amount:  Number(form.target_amount),
      };
      if (isEdit) { await updateTarget(target.id, payload); }
      else        { await createTarget(payload); }
      onSaved();
    } catch (err) {
      setSaveErr(err.message ?? "Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(15,32,68,0.35)", backdropFilter: "blur(4px)" }}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden"
        style={{ fontFamily: "'Inter','Hanken Grotesk',sans-serif" }}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#e2e9f4]">
          <div>
            <h2 className="text-[16px] font-semibold text-[#111827]">
              {isEdit ? "Edit Target" : "Set Employee Target"}
            </h2>
            <p className="text-[12px] text-[#6b7280] mt-0.5">
              {isEdit ? "Update the target details below." : "Assign a sales target to an employee."}
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-[#6b7280] hover:bg-[#f3f6fb] transition-colors">
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate className="px-6 py-5 space-y-4">
          {saveErr && (
            <div className="flex items-center gap-2 rounded-lg border border-[#ffdad6] bg-[#ffdad6]/40 px-3 py-2.5">
              <span className="material-symbols-outlined text-[#ba1a1a] text-[16px]">error</span>
              <span className="text-[12.5px] text-[#ba1a1a]">{saveErr}</span>
            </div>
          )}

          {/* Employee */}
          <div>
            <label className="block text-[12px] font-medium text-[#374151] mb-1">
              Employee <span className="text-[#ba1a1a]">*</span>
            </label>
            <select
              value={form.employee_id}
              onChange={(e) => set("employee_id", e.target.value)}
              className={`${inputCls} ${errors.employee_id ? "border-[#ba1a1a]" : ""}`}
            >
              <option value="">Select employee</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.employee_id}>
                  {emp.name} — {emp.employee_id}
                  {emp.designation ? ` (${emp.designation})` : ""}
                </option>
              ))}
            </select>
            {errors.employee_id && <p className="text-[11.5px] text-[#ba1a1a] mt-0.5">{errors.employee_id}</p>}
          </div>

          {/* Scheme */}
          <div>
            <label className="block text-[12px] font-medium text-[#374151] mb-1">
              Scheme <span className="text-[#ba1a1a]">*</span>
            </label>
            <select
              value={form.scheme_id}
              onChange={(e) => {
                set("scheme_id", e.target.value);
                // Auto-fill financial year from scheme
                const s = schemes.find((s) => String(s.id) === String(e.target.value));
                if (s?.financial_year) set("financial_year", s.financial_year);
              }}
              className={`${inputCls} ${errors.scheme_id ? "border-[#ba1a1a]" : ""}`}
            >
              <option value="">Select scheme</option>
              {schemes.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.scheme_name} ({s.financial_year})
                </option>
              ))}
            </select>
            {errors.scheme_id && <p className="text-[11.5px] text-[#ba1a1a] mt-0.5">{errors.scheme_id}</p>}
          </div>

          {/* Financial Year + Target Amount */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[12px] font-medium text-[#374151] mb-1">
                Financial Year <span className="text-[#ba1a1a]">*</span>
              </label>
              <input
                type="text"
                value={form.financial_year}
                onChange={(e) => set("financial_year", e.target.value)}
                placeholder="e.g. 2026-27"
                className={`${inputCls} ${errors.financial_year ? "border-[#ba1a1a]" : ""}`}
              />
              {errors.financial_year && <p className="text-[11.5px] text-[#ba1a1a] mt-0.5">{errors.financial_year}</p>}
            </div>
            <div>
              <label className="block text-[12px] font-medium text-[#374151] mb-1">
                Target Amount (₹) <span className="text-[#ba1a1a]">*</span>
              </label>
              <input
                type="number"
                min="1"
                value={form.target_amount}
                onChange={(e) => set("target_amount", e.target.value)}
                placeholder="e.g. 65000000"
                className={`${inputCls} ${errors.target_amount ? "border-[#ba1a1a]" : ""}`}
              />
              {errors.target_amount && <p className="text-[11.5px] text-[#ba1a1a] mt-0.5">{errors.target_amount}</p>}
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-[#e2e9f4]">
          <button type="button" onClick={onClose} disabled={saving}
            className="px-4 py-2 rounded-lg border border-[#c5d3e4]/50 text-[13px] font-medium text-[#374151] hover:bg-[#f0f4fa] transition-colors disabled:opacity-50">
            Cancel
          </button>
          <button type="button" onClick={handleSubmit} disabled={saving}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#2d55a0] text-[13px] font-medium text-white hover:bg-[#234690] transition-colors disabled:opacity-50">
            {saving && <span className="material-symbols-outlined text-[15px] animate-spin">progress_activity</span>}
            {saving ? "Saving..." : (isEdit ? "Update Target" : "Set Target")}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Status patch dropdown ────────────────────────────────────────────────
const STATUS_OPTIONS = ["active", "inactive", "draft", "achieved"];

function StatusCell({ target, onPatched }) {
  const [open, setOpen]       = useState(false);
  const [patching, setPatching] = useState(false);

  async function patch(status) {
    setOpen(false);
    setPatching(true);
    try { await patchTargetStatus(target.id, status); onPatched(); }
    catch {}
    finally { setPatching(false); }
  }

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        disabled={patching}
        className="flex items-center gap-1 group"
      >
        <StatusBadge status={target.status} />
        {patching
          ? <span className="material-symbols-outlined text-[13px] animate-spin text-[#6b7280]">progress_activity</span>
          : <span className="material-symbols-outlined text-[13px] text-[#9ca3af] group-hover:text-[#2d55a0]">expand_more</span>
        }
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-full mt-1 z-20 bg-white rounded-lg border border-[#e2e9f4] shadow-lg py-1 min-w-[120px]">
            {STATUS_OPTIONS.map((s) => (
              <button key={s} type="button" onClick={() => patch(s)}
                className={`w-full text-left px-3 py-1.5 text-[12.5px] hover:bg-[#f3f6fb] capitalize flex items-center gap-2 ${s === target.status ? "text-[#2d55a0] font-medium" : "text-[#374151]"}`}>
                {s === target.status && <span className="material-symbols-outlined text-[14px] text-[#2d55a0]">check</span>}
                <span className={s !== target.status ? "ml-5" : ""}>{s}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────
const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

export default function EmployeeTargets() {
  const [targets, setTargets]       = useState([]);
  const [schemes, setSchemes]       = useState([]);
  const [employees, setEmployees]   = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);
  const [modal, setModal]           = useState(null); // null | "new" | target object
  const [search, setSearch]         = useState("");
  const [filterFY, setFilterFY]     = useState("");
  const [filterScheme, setFilterScheme] = useState("");
  const [page, setPage]             = useState(1);
  const [pageSize, setPageSize]     = useState(PAGE_SIZE_OPTIONS[0]);

  async function load() {
    setLoading(true); setError(null);
    try {
      const [t, s, e] = await Promise.all([
        getTargets(),
        getSchemes(),
        getAllEmployees(),
      ]);
      setTargets(Array.isArray(t) ? t : []);
      setSchemes(Array.isArray(s) ? s : []);
      setEmployees(Array.isArray(e) ? e : []);
    } catch (err) {
      setError(err.message ?? "Failed to load data");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  // Build lookup maps
  const schemeMap   = useMemo(() => Object.fromEntries(schemes.map((s) => [s.id, s])), [schemes]);
  const employeeMap = useMemo(() => Object.fromEntries(employees.map((e) => [e.employee_id, e])), [employees]);

  // Financial year options for filter
  const fyOptions = useMemo(() => [...new Set(targets.map((t) => t.financial_year).filter(Boolean))].sort(), [targets]);

  // Filtered + paginated
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return targets.filter((t) => {
      const emp = employeeMap[t.employee_id];
      const sch = schemeMap[t.scheme_id];
      if (filterFY     && t.financial_year !== filterFY)                    return false;
      if (filterScheme && String(t.scheme_id) !== String(filterScheme))     return false;
      if (q) {
        const haystack = [
          emp?.name, emp?.employee_id, sch?.scheme_name, t.financial_year
        ].map((v) => String(v ?? "").toLowerCase()).join(" ");
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [targets, search, filterFY, filterScheme, employeeMap, schemeMap]);

  const totalPages  = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated   = useMemo(() => filtered.slice((page - 1) * pageSize, page * pageSize), [filtered, page, pageSize]);

  function resetPage() { setPage(1); }

  const totalTarget = targets.reduce((s, t) => s + (Number(t.target_amount) || 0), 0);
  const activeCount = targets.filter((t) => t.status === "active").length;

  return (
    <>
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-5 gap-4">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2.5">
            <h1 className="font-semibold text-[20px] text-[#111827]" style={{ fontFamily: "'Hanken Grotesk', sans-serif" }}>
              Employee Targets
            </h1>
            <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full bg-[#dbe5f8] text-[11px] font-medium text-[#374151] border border-[#c5d3e4]/30">
              {targets.length.toLocaleString()} Total
            </span>
          </div>
          <p className="text-[12.5px] text-[#374151]">Assign and track annual sales targets per employee.</p>
        </div>
        <button
          type="button"
          onClick={() => setModal("new")}
          className="inline-flex items-center gap-1.5 rounded-lg bg-[#2d55a0] px-3 py-2 text-[12.5px] font-medium text-white hover:bg-[#234690] transition-colors shrink-0"
        >
          <span className="material-symbols-outlined text-[16px]">add</span>
          Set Target
        </button>
      </div>

      {/* Stats strip */}
      <div className="incentive-stat-grid mb-5">
        {[
          { icon: "group",           label: "Total Employees Targeted", value: targets.length,                                              sub: `${activeCount} active` },
          { icon: "currency_rupee",  label: "Total Target Amount",      value: fmt(totalTarget),                                            sub: "All targets combined" },
          { icon: "schema",          label: "Schemes Used",             value: new Set(targets.map((t) => t.scheme_id)).size,               sub: `of ${schemes.length} schemes` },
        ].map((c) => (
          <article key={c.label} className="overview-stat">
            <div className="overview-stat-label"><span className="overview-stat-dot" />{c.label}</div>
            <div className="overview-stat-value">{c.value}</div>
            <div className="overview-stat-detail">{c.sub}</div>
          </article>
        ))}
      </div>

      {/* Error banner */}
      {error && (
        <div className="mb-4 flex items-center justify-between gap-3 rounded-lg border border-[#ffdad6] bg-[#ffdad6]/40 px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#ba1a1a] text-[18px]">error</span>
            <span className="text-[13px] text-[#ba1a1a]">{error}</span>
          </div>
          <button onClick={load} className="text-[12px] font-medium text-[#111827] underline">Retry</button>
        </div>
      )}

      {/* Filters bar */}
      <div className="bg-white rounded-xl border border-[#e2e9f4] px-4 py-3 mb-4 flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[180px]">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#9ca3af] text-[17px]">search</span>
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); resetPage(); }}
            placeholder="Search employee or scheme…"
            className="w-full rounded-lg border border-[#c5d3e4]/50 bg-[#f8fafd] py-2 pl-9 pr-3 text-[13px] text-[#111827] placeholder:text-[#9ca3af]/70 outline-none focus:border-[#2d55a0]"
          />
        </div>

        {/* FY filter */}
        <select
          value={filterFY}
          onChange={(e) => { setFilterFY(e.target.value); resetPage(); }}
          className="rounded-lg border border-[#c5d3e4]/50 bg-[#f8fafd] px-3 py-2 text-[13px] text-[#111827] outline-none focus:border-[#2d55a0]"
        >
          <option value="">All Years</option>
          {fyOptions.map((y) => <option key={y} value={y}>{y}</option>)}
        </select>

        {/* Scheme filter */}
        <select
          value={filterScheme}
          onChange={(e) => { setFilterScheme(e.target.value); resetPage(); }}
          className="rounded-lg border border-[#c5d3e4]/50 bg-[#f8fafd] px-3 py-2 text-[13px] text-[#111827] outline-none focus:border-[#2d55a0]"
        >
          <option value="">All Schemes</option>
          {schemes.map((s) => <option key={s.id} value={s.id}>{s.scheme_name}</option>)}
        </select>

        {/* Page size */}
        <label className="flex items-center gap-1.5 text-[12px] text-[#374151] whitespace-nowrap ml-auto">
          Show
          <select
            value={pageSize}
            onChange={(e) => { setPageSize(Number(e.target.value)); resetPage(); }}
            className="rounded-lg border border-[#c5d3e4]/50 bg-[#f8fafd] px-2 py-2 text-[13px] text-[#111827] outline-none focus:border-[#2d55a0]"
          >
            {PAGE_SIZE_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
        </label>
      </div>

      {/* Table */}
      {loading ? (
        <div className="bg-[#f8fafd] rounded-xl border border-[#c5d3e4]/20 py-16 flex flex-col items-center gap-2">
          <span className="material-symbols-outlined text-[#a6bcee] text-[28px] animate-spin">progress_activity</span>
          <span className="text-[13px] text-[#374151]">Loading targets...</span>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-[#e2e9f4] shadow-sm overflow-hidden mb-6">
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse" style={{ minWidth: 860 }}>
              <thead>
                <tr className="bg-[#f8fafd] text-[#6b7280] text-[11px] font-semibold uppercase tracking-wider border-b border-[#e2e9f4]">
                  <th className="px-4 py-3">#</th>
                  <th className="px-4 py-3">Employee</th>
                  <th className="px-4 py-3">Scheme</th>
                  <th className="px-4 py-3">Financial Year</th>
                  <th className="px-4 py-3 text-right">Target Amount</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="text-[13px] text-[#111827] divide-y divide-[#f0f4fa]">
                {paginated.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-14 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <span className="material-symbols-outlined text-[#c5d3e4] text-[36px]">person_search</span>
                        <p className="text-[13px] text-[#374151]">
                          {search || filterFY || filterScheme ? "No targets match the current filters." : "No targets set yet. Click \"Set Target\" to add one."}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginated.map((target, i) => {
                    const emp = employeeMap[target.employee_id];
                    const sch = schemeMap[target.scheme_id];
                    return (
                      <tr key={target.id} className="hover:bg-[#f8fafd] transition-colors">
                        <td className="px-4 py-3 text-[#6b7280]">{(page - 1) * pageSize + i + 1}</td>

                        {/* Employee */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-[#eef2fb] flex items-center justify-center shrink-0 text-[12px] font-bold text-[#2d55a0]">
                              {(emp?.name ?? "?").charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium truncate">{emp?.name ?? `Employee #${target.employee_id}`}</p>
                              <p className="text-[11.5px] text-[#6b7280] font-mono">{emp?.employee_id ?? "—"}</p>
                            </div>
                          </div>
                        </td>

                        {/* Scheme */}
                        <td className="px-4 py-3">
                          <p className="font-medium text-[#111827]">{sch?.scheme_name ?? `Scheme #${target.scheme_id}`}</p>
                          <p className="text-[11.5px] text-[#6b7280]">{sch?.scheme_type ?? "—"}</p>
                        </td>

                        {/* Financial Year */}
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-[#f0f4fa] text-[12px] font-medium text-[#374151]">
                            FY {target.financial_year}
                          </span>
                        </td>

                        {/* Target Amount */}
                        <td className="px-4 py-3 text-right font-semibold text-[#2d55a0]">
                          {fmt(target.target_amount)}
                        </td>

                        {/* Status — inline change */}
                        <td className="px-4 py-3">
                          <StatusCell target={target} onPatched={load} />
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center">
                            <button
                              type="button"
                              onClick={() => setModal(target)}
                              title="Edit target"
                              className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-[#374151] hover:bg-[#eef2fb] hover:text-[#2d55a0] transition-colors"
                            >
                              <span className="material-symbols-outlined text-[17px]">edit</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between px-4 py-3 border-t border-[#e2e9f4] text-[12.5px] text-[#374151]">
            <span>
              {filtered.length === 0
                ? "No results"
                : `Showing ${Math.min((page - 1) * pageSize + 1, filtered.length)}–${Math.min(page * pageSize, filtered.length)} of ${filtered.length}`}
            </span>
            <div className="flex items-center gap-1">
              {[
                { icon: "first_page",    act: () => setPage(1),                         disabled: page === 1 },
                { icon: "chevron_left",  act: () => setPage((p) => Math.max(1, p - 1)), disabled: page === 1 },
                { icon: "chevron_right", act: () => setPage((p) => Math.min(totalPages, p + 1)), disabled: page === totalPages },
                { icon: "last_page",     act: () => setPage(totalPages),                disabled: page === totalPages },
              ].map(({ icon, act, disabled }) => (
                <button key={icon} type="button" onClick={act} disabled={disabled}
                  className="inline-flex items-center justify-center w-7 h-7 rounded-lg border border-[#c5d3e4]/50 text-[#374151] hover:bg-[#f0f4fa] disabled:opacity-40 disabled:cursor-not-allowed">
                  <span className="material-symbols-outlined text-[15px]">{icon}</span>
                </button>
              ))}
              <span className="px-2">Page {page} of {totalPages}</span>
            </div>
          </div>
        </div>
      )}

      {/* Modal */}
      {modal !== null && (
        <TargetModal
          target={modal === "new" ? null : modal}
          schemes={schemes}
          employees={employees}
          onClose={() => setModal(null)}
          onSaved={() => { setModal(null); load(); }}
        />
      )}
    </>
  );
}
