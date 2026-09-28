import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getSchemes, createScheme, updateScheme } from "../../../services/incentiveService";

const SCHEME_TYPES = ["Product & Solution", "EPC", "Other"];
const STATUS_OPTIONS = ["active", "inactive", "draft"];

const EMPTY_FORM = {
  scheme_name: "",
  scheme_code: "",
  scheme_type: "",
  financial_year: "",
  effective_from: "",
  effective_to: "",
  description: "",
  status: "draft",
};

function StatusBadge({ status }) {
  const styles = {
    active:   "bg-[#dcfce7] text-[#166534]",
    draft:    "bg-[#fef9c3] text-[#854d0e]",
    inactive: "bg-[#f3f4f6] text-[#6b7280]",
  };
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11.5px] font-medium capitalize ${styles[status] ?? "bg-[#f3f4f6] text-[#6b7280]"}`}
    >
      {status ?? "—"}
    </span>
  );
}

function SchemeModal({ scheme, onClose, onSaved }) {
  const [form, setForm] = useState(
    scheme
      ? {
          scheme_name:    scheme.scheme_name    ?? "",
          scheme_code:    scheme.scheme_code    ?? "",
          scheme_type:    scheme.scheme_type    ?? "",
          financial_year: scheme.financial_year ?? "",
          effective_from: scheme.effective_from ? scheme.effective_from.slice(0, 10) : "",
          effective_to:   scheme.effective_to   ? scheme.effective_to.slice(0, 10)   : "",
          description:    scheme.description    ?? "",
          status:         scheme.status         ?? "draft",
        }
      : { ...EMPTY_FORM }
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
  }

  function validate() {
    const errs = {};
    if (!form.scheme_name.trim())    errs.scheme_name    = "Required";
    if (!form.scheme_code.trim())    errs.scheme_code    = "Required";
    if (!form.scheme_type)           errs.scheme_type    = "Required";
    if (!form.financial_year.trim()) errs.financial_year = "Required";
    if (!form.effective_from)        errs.effective_from = "Required";
    if (!form.effective_to)          errs.effective_to   = "Required";
    if (!form.status)                errs.status         = "Required";
    return errs;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setFieldErrors(errs); return; }

    setSaving(true);
    setError(null);
    try {
      if (scheme?.id) {
        await updateScheme(scheme.id, form);
      } else {
        await createScheme(form);
      }
      onSaved();
    } catch (err) {
      setError(err.message ?? "Failed to save scheme");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(15,32,68,0.30)", backdropFilter: "blur(4px)" }}>
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col" style={{ fontFamily: "'Inter','Hanken Grotesk',sans-serif" }}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#e2e9f4]">
          <h2 className="text-[15px] font-semibold text-[#111827]">
            {scheme ? "Edit Scheme" : "New Scheme"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex items-center justify-center w-8 h-8 rounded-lg text-[#6b7280] hover:bg-[#f3f6fb] hover:text-[#111827] transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 px-6 py-5 space-y-4">
          {error && (
            <div className="flex items-center gap-2 rounded-lg border border-[#ffdad6] bg-[#ffdad6]/40 px-3 py-2.5">
              <span className="material-symbols-outlined text-[#ba1a1a] text-[16px]">error</span>
              <span className="text-[12.5px] text-[#ba1a1a]">{error}</span>
            </div>
          )}

          {/* Scheme Name */}
          <div>
            <label className="block text-[12px] font-medium text-[#374151] mb-1">
              Scheme Name <span className="text-[#ba1a1a]">*</span>
            </label>
            <input
              name="scheme_name"
              value={form.scheme_name}
              onChange={handleChange}
              placeholder="e.g. Product & Solution FY 2026-27"
              className={`w-full rounded-lg border px-3 py-2 text-[13px] text-[#111827] outline-none focus:border-[#2d55a0] bg-[#f8fafd] ${fieldErrors.scheme_name ? "border-[#ba1a1a]" : "border-[#c5d3e4]/50"}`}
            />
            {fieldErrors.scheme_name && <p className="text-[11.5px] text-[#ba1a1a] mt-0.5">{fieldErrors.scheme_name}</p>}
          </div>

          {/* Code + Type */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[12px] font-medium text-[#374151] mb-1">
                Scheme Code <span className="text-[#ba1a1a]">*</span>
              </label>
              <input
                name="scheme_code"
                value={form.scheme_code}
                onChange={handleChange}
                placeholder="e.g. PS-FY27"
                className={`w-full rounded-lg border px-3 py-2 text-[13px] text-[#111827] outline-none focus:border-[#2d55a0] bg-[#f8fafd] ${fieldErrors.scheme_code ? "border-[#ba1a1a]" : "border-[#c5d3e4]/50"}`}
              />
              {fieldErrors.scheme_code && <p className="text-[11.5px] text-[#ba1a1a] mt-0.5">{fieldErrors.scheme_code}</p>}
            </div>
            <div>
              <label className="block text-[12px] font-medium text-[#374151] mb-1">
                Scheme Type <span className="text-[#ba1a1a]">*</span>
              </label>
              <select
                name="scheme_type"
                value={form.scheme_type}
                onChange={handleChange}
                className={`w-full rounded-lg border px-3 py-2 text-[13px] text-[#111827] outline-none focus:border-[#2d55a0] bg-[#f8fafd] ${fieldErrors.scheme_type ? "border-[#ba1a1a]" : "border-[#c5d3e4]/50"}`}
              >
                <option value="">Select type</option>
                {SCHEME_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
              {fieldErrors.scheme_type && <p className="text-[11.5px] text-[#ba1a1a] mt-0.5">{fieldErrors.scheme_type}</p>}
            </div>
          </div>

          {/* Financial Year + Status */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[12px] font-medium text-[#374151] mb-1">
                Financial Year <span className="text-[#ba1a1a]">*</span>
              </label>
              <input
                name="financial_year"
                value={form.financial_year}
                onChange={handleChange}
                placeholder="e.g. 2026-27"
                className={`w-full rounded-lg border px-3 py-2 text-[13px] text-[#111827] outline-none focus:border-[#2d55a0] bg-[#f8fafd] ${fieldErrors.financial_year ? "border-[#ba1a1a]" : "border-[#c5d3e4]/50"}`}
              />
              {fieldErrors.financial_year && <p className="text-[11.5px] text-[#ba1a1a] mt-0.5">{fieldErrors.financial_year}</p>}
            </div>
            <div>
              <label className="block text-[12px] font-medium text-[#374151] mb-1">
                Status <span className="text-[#ba1a1a]">*</span>
              </label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className={`w-full rounded-lg border px-3 py-2 text-[13px] text-[#111827] outline-none focus:border-[#2d55a0] bg-[#f8fafd] ${fieldErrors.status ? "border-[#ba1a1a]" : "border-[#c5d3e4]/50"}`}
              >
                {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
              </select>
              {fieldErrors.status && <p className="text-[11.5px] text-[#ba1a1a] mt-0.5">{fieldErrors.status}</p>}
            </div>
          </div>

          {/* Effective From / To */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[12px] font-medium text-[#374151] mb-1">
                Effective From <span className="text-[#ba1a1a]">*</span>
              </label>
              <input
                type="date"
                name="effective_from"
                value={form.effective_from}
                onChange={handleChange}
                className={`w-full rounded-lg border px-3 py-2 text-[13px] text-[#111827] outline-none focus:border-[#2d55a0] bg-[#f8fafd] ${fieldErrors.effective_from ? "border-[#ba1a1a]" : "border-[#c5d3e4]/50"}`}
              />
              {fieldErrors.effective_from && <p className="text-[11.5px] text-[#ba1a1a] mt-0.5">{fieldErrors.effective_from}</p>}
            </div>
            <div>
              <label className="block text-[12px] font-medium text-[#374151] mb-1">
                Effective To <span className="text-[#ba1a1a]">*</span>
              </label>
              <input
                type="date"
                name="effective_to"
                value={form.effective_to}
                onChange={handleChange}
                className={`w-full rounded-lg border px-3 py-2 text-[13px] text-[#111827] outline-none focus:border-[#2d55a0] bg-[#f8fafd] ${fieldErrors.effective_to ? "border-[#ba1a1a]" : "border-[#c5d3e4]/50"}`}
              />
              {fieldErrors.effective_to && <p className="text-[11.5px] text-[#ba1a1a] mt-0.5">{fieldErrors.effective_to}</p>}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-[12px] font-medium text-[#374151] mb-1">Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={3}
              placeholder="Optional description..."
              className="w-full rounded-lg border border-[#c5d3e4]/50 px-3 py-2 text-[13px] text-[#111827] outline-none focus:border-[#2d55a0] bg-[#f8fafd] resize-none"
            />
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-[#e2e9f4]">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-lg border border-[#c5d3e4]/50 bg-[#f8fafd] px-4 py-2 text-[12.5px] font-medium text-[#374151] hover:bg-[#f0f4fa] transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#2d55a0] px-4 py-2 text-[12.5px] font-medium text-white hover:bg-[#234690] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving && <span className="material-symbols-outlined text-[15px] animate-spin">progress_activity</span>}
            {saving ? "Saving..." : (scheme ? "Update Scheme" : "Create Scheme")}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function IncentiveSchemes() {
  const navigate = useNavigate();
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalScheme, setModalScheme] = useState(undefined); // undefined = closed, null = new, object = edit

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const data = await getSchemes();
      setSchemes(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message ?? "Failed to load schemes");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function handleSaved() {
    setModalScheme(undefined);
    load();
  }

  function formatDate(val) {
    if (!val) return "—";
    const d = new Date(val);
    return isNaN(d.getTime()) ? "—" : d.toLocaleDateString("en-IN");
  }

  return (
    <>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-5 gap-4">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2.5">
            <h1
              className="font-semibold text-[20px] text-[#111827]"
              style={{ fontFamily: "'Hanken Grotesk', sans-serif" }}
            >
              Incentive Schemes
            </h1>
            <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full bg-[#dbe5f8] text-[11px] font-medium text-[#374151] border border-[#c5d3e4]/30">
              {schemes.length} Total
            </span>
          </div>
          <p className="text-[12.5px] text-[#374151]">Manage all sales incentive schemes.</p>
        </div>
        <button
          type="button"
          onClick={() => setModalScheme(null)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-[#2d55a0] px-3 py-2 text-[12.5px] font-medium text-white hover:bg-[#234690] transition-colors"
        >
          <span className="material-symbols-outlined text-[16px]">add</span>
          New Scheme
        </button>
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

      {loading ? (
        <div className="bg-[#f8fafd] rounded-xl border border-[#c5d3e4]/20 py-16 flex flex-col items-center gap-2">
          <span className="material-symbols-outlined text-[#a6bcee] text-[28px] animate-spin">progress_activity</span>
          <span className="text-[13px] text-[#374151]">Loading schemes...</span>
        </div>
      ) : (
        <div className="bg-[#f8fafd] rounded-xl border border-[#c5d3e4]/20 overflow-hidden flex flex-col mb-6 shadow-sm">
          <div className="overflow-x-auto w-full">
            <table className="w-full min-w-[800px] text-left border-collapse">
              <thead>
                <tr className="bg-[#f8fafd] text-[#374151] text-[11px] font-semibold uppercase tracking-wider border-b border-[#d4e0f0]/50">
                  <th className="py-2.5 px-4">Scheme Name</th>
                  <th className="py-2.5 px-4">Code</th>
                  <th className="py-2.5 px-4">Type</th>
                  <th className="py-2.5 px-4">Financial Year</th>
                  <th className="py-2.5 px-4">Effective From</th>
                  <th className="py-2.5 px-4">Effective To</th>
                  <th className="py-2.5 px-4">Status</th>
                  <th className="py-2.5 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="text-[13px] text-[#111827]">
                {schemes.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-14 text-center text-[#374151]">
                      No schemes found. Click "New Scheme" to create one.
                    </td>
                  </tr>
                ) : (
                  schemes.map((scheme) => (
                    <tr
                      key={scheme.id}
                      className="border-b border-[#d4e0f0]/40 last:border-0 hover:bg-[#f0f4fa]/45"
                    >
                      <td className="px-4 py-3 font-medium">{scheme.scheme_name ?? "—"}</td>
                      <td className="px-4 py-3 text-[#374151]">{scheme.scheme_code ?? "—"}</td>
                      <td className="px-4 py-3 text-[#374151]">{scheme.scheme_type ?? "—"}</td>
                      <td className="px-4 py-3 text-[#374151]">{scheme.financial_year ?? "—"}</td>
                      <td className="px-4 py-3 text-[#374151]">{formatDate(scheme.effective_from)}</td>
                      <td className="px-4 py-3 text-[#374151]">{formatDate(scheme.effective_to)}</td>
                      <td className="px-4 py-3">
                        <StatusBadge status={scheme.status} />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => setModalScheme(scheme)}
                            title="Edit scheme"
                            className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-[#374151] hover:bg-[#eef2fb] hover:text-[#2d55a0] transition-colors"
                          >
                            <span className="material-symbols-outlined text-[17px]">edit</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => navigate(`/ob-sheet/incentives/schemes/${scheme.id}`)}
                            title="View scheme details"
                            className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-[#374151] hover:bg-[#eef2fb] hover:text-[#2d55a0] transition-colors"
                          >
                            <span className="material-symbols-outlined text-[17px]">open_in_new</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal */}
      {modalScheme !== undefined && (
        <SchemeModal
          scheme={modalScheme}
          onClose={() => setModalScheme(undefined)}
          onSaved={handleSaved}
        />
      )}
    </>
  );
}
