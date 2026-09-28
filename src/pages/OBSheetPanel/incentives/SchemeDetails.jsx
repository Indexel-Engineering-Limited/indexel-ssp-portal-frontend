import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getSchemes,
  getAchievementRules,
  createAchievementRule,
  updateAchievementRule,
  deleteAchievementRule,
  getMarginRules,
  createMarginRule,
  updateMarginRule,
  deleteMarginRule,
} from "../../../services/incentiveService";

const INCENTIVE_TYPES = ["MONTHLY_SALARY", "BILLING_PERCENT", "FIXED_AMOUNT"];
const ORDER_TYPES     = ["ALL", "SERVICE", "PRODUCT", "AMC"];

const INCENTIVE_TYPE_LABELS = {
  MONTHLY_SALARY:  "Monthly Salary",
  BILLING_PERCENT: "Billing %",
  FIXED_AMOUNT:    "Fixed Amount",
};

const DEFAULT_ACHIEVEMENT_ROWS = [
  { sequence: 1, min_achievement: "70.00",  max_achievement: "80.00",  incentive_type: "MONTHLY_SALARY",  incentive_rate: "1.0000", status: 1, description: "70–<80% → 1× Monthly Salary" },
  { sequence: 2, min_achievement: "80.00",  max_achievement: "90.00",  incentive_type: "BILLING_PERCENT", incentive_rate: "0.8000", status: 1, description: "" },
  { sequence: 3, min_achievement: "90.00",  max_achievement: "100.00", incentive_type: "BILLING_PERCENT", incentive_rate: "1.0000", status: 1, description: "" },
  { sequence: 4, min_achievement: "100.00", max_achievement: "120.00", incentive_type: "BILLING_PERCENT", incentive_rate: "1.1500", status: 1, description: "" },
  { sequence: 5, min_achievement: "120.00", max_achievement: "",       incentive_type: "BILLING_PERCENT", incentive_rate: "1.2500", status: 1, description: "" },
];

const DEFAULT_MARGIN_ROWS = [
  { sequence: 1, min_margin: "0.00",  max_margin: "15.00", multiplier: "0.0000", order_type: "ALL",     status: 1, description: "No incentive. May count toward target at management discretion." },
  { sequence: 2, min_margin: "15.00", max_margin: "20.00", multiplier: "0.6000", order_type: "ALL",     status: 1, description: "" },
  { sequence: 3, min_margin: "20.00", max_margin: "30.00", multiplier: "1.0000", order_type: "ALL",     status: 1, description: "" },
  { sequence: 4, min_margin: "30.00", max_margin: "",      multiplier: "1.2000", order_type: "ALL",     status: 1, description: "" },
  { sequence: 5, min_margin: "0.00",  max_margin: "",      multiplier: "1.2000", order_type: "SERVICE", status: 1, description: "Service/AMC" },
];

function makeRow(data) {
  return { ...data, _draft: { ...data }, _saving: false, _error: null, _dirty: false };
}

// ─── Shared atoms ─────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const label = status === 1 || status === "active" ? "active" : status === 0 || status === "inactive" ? "inactive" : String(status ?? "");
  const cls   = label === "active" ? "bg-[#dcfce7] text-[#166534]" : label === "draft" ? "bg-[#fef9c3] text-[#854d0e]" : "bg-[#f3f4f6] text-[#6b7280]";
  return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11.5px] font-medium capitalize ${cls}`}>{label || "—"}</span>;
}

function formatDate(val) {
  if (!val) return "—";
  const d = new Date(val);
  return isNaN(d.getTime()) ? "—" : d.toLocaleDateString("en-IN");
}

const inpCls = "w-full rounded-lg border border-[#c5d3e4]/50 bg-[#f8fafd] px-3 py-2 text-[13px] text-[#111827] outline-none focus:border-[#2d55a0] focus:ring-2 focus:ring-[#2d55a0]/10 transition-all placeholder:text-[#9ca3af]";
const selCls = inpCls;

function FormField({ label, children }) {
  return (
    <div>
      <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#6b7280] mb-1">{label}</label>
      {children}
    </div>
  );
}

// ─── Achievement Rule Card ────────────────────────────────────────────────
function AchievementRuleCard({ row, index, schemeId, onUpdate, onDelete }) {
  const d = row._draft;
  const isNew = !d.id;

  const typeColor = {
    MONTHLY_SALARY:  { bg: "#eff6ff", text: "#1d4ed8", icon: "payments" },
    BILLING_PERCENT: { bg: "#f0fdf4", text: "#15803d", icon: "percent"  },
    FIXED_AMOUNT:    { bg: "#fef9c3", text: "#854d0e", icon: "currency_rupee" },
  }[d.incentive_type] ?? { bg: "#f3f4f6", text: "#374151", icon: "rule" };

  return (
    <div
      className="rounded-xl border transition-all"
      style={{
        borderColor: row._dirty ? "#fbbf24" : "#e2e9f4",
        background: row._dirty ? "#fffdf5" : "#ffffff",
        boxShadow: row._dirty
          ? "0 0 0 1px #fbbf24, 0 2px 8px rgba(251,191,36,0.08)"
          : "0 1px 4px rgba(45,85,160,0.06)",
      }}
    >
      {/* Card header */}
      <div
        className="flex items-center justify-between px-4 py-3 rounded-t-xl"
        style={{ borderBottom: "1px solid #f0f4fa", background: row._dirty ? "#fffbeb" : "#f8fafd" }}
      >
        <div className="flex items-center gap-2.5">
          {/* Sequence badge */}
          <div className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold text-white shrink-0"
            style={{ background: "#2d55a0" }}>
            {d.sequence || index + 1}
          </div>

          {/* Range label */}
          <div>
            <span className="text-[13px] font-semibold text-[#111827]">
              {d.min_achievement || "?"}%
              {" "}<span className="text-[#6b7280] font-normal">to</span>{" "}
              {d.max_achievement ? `${d.max_achievement}%` : "∞"}
            </span>
            {d.description && (
              <p className="text-[11px] text-[#6b7280] mt-0.5">{d.description}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Incentive type chip */}
          <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium"
            style={{ background: typeColor.bg, color: typeColor.text }}>
            <span className="material-symbols-outlined text-[12px]">{typeColor.icon}</span>
            {INCENTIVE_TYPE_LABELS[d.incentive_type] ?? d.incentive_type}
          </span>

          {/* Unsaved pill */}
          {row._dirty && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#fef9c3] text-[#854d0e] text-[11px] font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-[#f59e0b] inline-block" />
              Unsaved
            </span>
          )}

          {/* Status badge */}
          <StatusBadge status={d.status} />
        </div>
      </div>

      {/* Card body — fields */}
      <div className="p-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <FormField label="Sequence">
          <input type="number" value={d.sequence ?? ""} onChange={(e) => onUpdate(index, "sequence", e.target.value)} className={inpCls} />
        </FormField>
        <FormField label="Min Ach %">
          <input type="number" step="0.01" value={d.min_achievement ?? ""} onChange={(e) => onUpdate(index, "min_achievement", e.target.value)} placeholder="e.g. 70" className={inpCls} />
        </FormField>
        <FormField label="Max Ach % (∞)">
          <input type="number" step="0.01" value={d.max_achievement ?? ""} onChange={(e) => onUpdate(index, "max_achievement", e.target.value)} placeholder="blank = ∞" className={inpCls} />
        </FormField>
        <FormField label="Incentive Type">
          <select value={d.incentive_type ?? "BILLING_PERCENT"} onChange={(e) => onUpdate(index, "incentive_type", e.target.value)} className={selCls}>
            {INCENTIVE_TYPES.map((t) => <option key={t} value={t}>{INCENTIVE_TYPE_LABELS[t] ?? t}</option>)}
          </select>
        </FormField>
        <FormField label="Rate / Value">
          <input type="number" step="0.0001" value={d.incentive_rate ?? ""} onChange={(e) => onUpdate(index, "incentive_rate", e.target.value)} placeholder="1.0000" className={inpCls} />
        </FormField>
        <FormField label="Status">
          <select value={d.status ?? 1} onChange={(e) => onUpdate(index, "status", Number(e.target.value))} className={selCls}>
            <option value={1}>Active</option>
            <option value={0}>Inactive</option>
          </select>
        </FormField>
        <div className="col-span-2 sm:col-span-3 lg:col-span-6">
          <FormField label="Description / Notes">
            <input type="text" value={d.description ?? ""} onChange={(e) => onUpdate(index, "description", e.target.value)} placeholder="Optional description..." className={inpCls} />
          </FormField>
        </div>
      </div>

      {/* Card footer — actions */}
      <div
        className="flex items-center justify-between px-4 py-3 rounded-b-xl"
        style={{ borderTop: "1px solid #f0f4fa" }}
      >
        {/* Per-row error */}
        {row._error ? (
          <p className="text-[11.5px] text-[#ba1a1a] flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">error</span>
            {row._error}
          </p>
        ) : (
          <p className="text-[11.5px] text-[#9ca3af]">
            {d.id ? `Rule #${d.id}` : "New rule — not saved yet"}
          </p>
        )}

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onDelete(index)}
            disabled={row._saving}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#ffdad6] text-[12px] font-medium text-[#ba1a1a] hover:bg-[#ffdad6]/40 transition-colors disabled:opacity-40"
          >
            <span className="material-symbols-outlined text-[14px]">delete</span>
            Delete
          </button>
          <button
            type="button"
            onClick={() => schemeId && row._dirty && onUpdate.__save(index)}
            disabled={row._saving || !row._dirty}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-[12px] font-medium text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ background: row._dirty ? "#2d55a0" : "#9ca3af" }}
          >
            {row._saving ? (
              <><span className="material-symbols-outlined text-[14px] animate-spin">progress_activity</span>Saving…</>
            ) : isNew ? (
              <><span className="material-symbols-outlined text-[14px]">add</span>Add Rule</>
            ) : (
              <><span className="material-symbols-outlined text-[14px]">save</span>Save</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Margin Rule Card ─────────────────────────────────────────────────────
function MarginRuleCard({ row, index, onUpdate, onDelete }) {
  const d = row._draft;
  const isNew = !d.id;

  const mult = parseFloat(d.multiplier);
  const multColor = isNaN(mult) ? "#6b7280"
    : mult === 0   ? "#ba1a1a"
    : mult < 1     ? "#d97706"
    : mult === 1   ? "#2d55a0"
    : "#15803d";

  return (
    <div
      className="rounded-xl border transition-all"
      style={{
        borderColor: row._dirty ? "#fbbf24" : "#e2e9f4",
        background: row._dirty ? "#fffdf5" : "#ffffff",
        boxShadow: row._dirty
          ? "0 0 0 1px #fbbf24, 0 2px 8px rgba(251,191,36,0.08)"
          : "0 1px 4px rgba(45,85,160,0.06)",
      }}
    >
      {/* Card header */}
      <div
        className="flex items-center justify-between px-4 py-3 rounded-t-xl"
        style={{ borderBottom: "1px solid #f0f4fa", background: row._dirty ? "#fffbeb" : "#f8fafd" }}
      >
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold text-white shrink-0"
            style={{ background: "#2d55a0" }}>
            {d.sequence || index + 1}
          </div>
          <div>
            <span className="text-[13px] font-semibold text-[#111827]">
              {d.min_margin || "?"}%
              {" "}<span className="text-[#6b7280] font-normal">to</span>{" "}
              {d.max_margin ? `${d.max_margin}%` : "∞"}
            </span>
            {d.description && (
              <p className="text-[11px] text-[#6b7280] mt-0.5">{d.description}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Multiplier chip */}
          {d.multiplier !== "" && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[12px] font-bold"
              style={{ background: "#f0f4fa", color: multColor }}>
              {d.multiplier}×
            </span>
          )}

          {/* Order type chip */}
          <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#eef2fb] text-[#2d55a0]">
            {d.order_type ?? "ALL"}
          </span>

          {row._dirty && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#fef9c3] text-[#854d0e] text-[11px] font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-[#f59e0b] inline-block" />
              Unsaved
            </span>
          )}

          <StatusBadge status={d.status} />
        </div>
      </div>

      {/* Card body */}
      <div className="p-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <FormField label="Sequence">
          <input type="number" value={d.sequence ?? ""} onChange={(e) => onUpdate(index, "sequence", e.target.value)} className={inpCls} />
        </FormField>
        <FormField label="Min Margin %">
          <input type="number" step="0.01" value={d.min_margin ?? ""} onChange={(e) => onUpdate(index, "min_margin", e.target.value)} placeholder="e.g. 15" className={inpCls} />
        </FormField>
        <FormField label="Max Margin % (∞)">
          <input type="number" step="0.01" value={d.max_margin ?? ""} onChange={(e) => onUpdate(index, "max_margin", e.target.value)} placeholder="blank = ∞" className={inpCls} />
        </FormField>
        <FormField label="Multiplier">
          <input type="number" step="0.0001" value={d.multiplier ?? ""} onChange={(e) => onUpdate(index, "multiplier", e.target.value)} placeholder="1.0000" className={inpCls} />
        </FormField>
        <FormField label="Order Type">
          <select value={d.order_type ?? "ALL"} onChange={(e) => onUpdate(index, "order_type", e.target.value)} className={selCls}>
            {ORDER_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </FormField>
        <FormField label="Status">
          <select value={d.status ?? 1} onChange={(e) => onUpdate(index, "status", Number(e.target.value))} className={selCls}>
            <option value={1}>Active</option>
            <option value={0}>Inactive</option>
          </select>
        </FormField>
        <div className="col-span-2 sm:col-span-3 lg:col-span-6">
          <FormField label="Description / Notes">
            <input type="text" value={d.description ?? ""} onChange={(e) => onUpdate(index, "description", e.target.value)} placeholder="Optional description..." className={inpCls} />
          </FormField>
        </div>
      </div>

      {/* Card footer */}
      <div className="flex items-center justify-between px-4 py-3 rounded-b-xl" style={{ borderTop: "1px solid #f0f4fa" }}>
        {row._error ? (
          <p className="text-[11.5px] text-[#ba1a1a] flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">error</span>
            {row._error}
          </p>
        ) : (
          <p className="text-[11.5px] text-[#9ca3af]">{d.id ? `Rule #${d.id}` : "New rule — not saved yet"}</p>
        )}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onDelete(index)}
            disabled={row._saving}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#ffdad6] text-[12px] font-medium text-[#ba1a1a] hover:bg-[#ffdad6]/40 transition-colors disabled:opacity-40"
          >
            <span className="material-symbols-outlined text-[14px]">delete</span>
            Delete
          </button>
          <button
            type="button"
            onClick={() => row._dirty && onUpdate.__save(index)}
            disabled={row._saving || !row._dirty}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-[12px] font-medium text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ background: row._dirty ? "#2d55a0" : "#9ca3af" }}
          >
            {row._saving ? (
              <><span className="material-symbols-outlined text-[14px] animate-spin">progress_activity</span>Saving…</>
            ) : isNew ? (
              <><span className="material-symbols-outlined text-[14px]">add</span>Add Rule</>
            ) : (
              <><span className="material-symbols-outlined text-[14px]">save</span>Save</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Achievement Rules Tab ────────────────────────────────────────────────
function AchievementRulesTab({ schemeId }) {
  const [rows, setRows]       = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const data = await getAchievementRules(schemeId);
      const list = Array.isArray(data) && data.length ? data : DEFAULT_ACHIEVEMENT_ROWS;
      setRows(list.map(makeRow));
    } catch {
      setRows(DEFAULT_ACHIEVEMENT_ROWS.map(makeRow));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [schemeId]);

  function handleDraftChange(index, field, value) {
    setRows((prev) => prev.map((r, i) =>
      i === index ? { ...r, _draft: { ...r._draft, [field]: value }, _dirty: true, _error: null } : r
    ));
  }

  async function handleSaveRow(index) {
    const draft = rows[index]._draft;
    setRows((prev) => prev.map((r, i) => i === index ? { ...r, _saving: true, _error: null } : r));
    try {
      const payload = {
        sequence: draft.sequence, min_achievement: draft.min_achievement,
        max_achievement: draft.max_achievement, incentive_type: draft.incentive_type,
        incentive_rate: draft.incentive_rate, status: draft.status, description: draft.description,
      };
      const saved = draft.id
        ? await updateAchievementRule(schemeId, draft.id, payload)
        : await createAchievementRule(schemeId, payload);
      const r = saved ?? draft;
      setRows((prev) => prev.map((row, i) =>
        i === index ? { ...r, _draft: { ...r }, _saving: false, _error: null, _dirty: false } : row
      ));
    } catch (err) {
      setRows((prev) => prev.map((r, i) => i === index ? { ...r, _saving: false, _error: err.message ?? "Save failed" } : r));
    }
  }

  async function handleDeleteRow(index) {
    const row = rows[index];
    if (row._draft.id) {
      setRows((prev) => prev.map((r, i) => i === index ? { ...r, _saving: true } : r));
      try { await deleteAchievementRule(schemeId, row._draft.id); }
      catch (err) {
        setRows((prev) => prev.map((r, i) => i === index ? { ...r, _saving: false, _error: err.message ?? "Delete failed" } : r));
        return;
      }
    }
    setRows((prev) => prev.filter((_, i) => i !== index));
  }

  function addRow() {
    const nextSeq = rows.length ? Math.max(...rows.map((r) => Number(r._draft.sequence) || 0)) + 1 : 1;
    setRows((prev) => [...prev, makeRow({ sequence: nextSeq, min_achievement: "", max_achievement: "", incentive_type: "BILLING_PERCENT", incentive_rate: "", status: 1, description: "" })]);
  }

  // Attach save handler to change handler so cards can call it
  handleDraftChange.__save = handleSaveRow;

  if (loading) return (
    <div className="py-12 flex flex-col items-center gap-2">
      <span className="material-symbols-outlined text-[#a6bcee] text-[28px] animate-spin">progress_activity</span>
      <span className="text-[13px] text-[#374151]">Loading rules...</span>
    </div>
  );

  return (
    <div className="p-5">
      {/* Section intro */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-[13px] font-semibold text-[#111827]">Achievement Rules</p>
          <p className="text-[12px] text-[#6b7280] mt-0.5">
            Define how incentive is calculated based on achievement % against target.
          </p>
        </div>
        <span className="text-[11.5px] px-2.5 py-1 rounded-full bg-[#eef2fb] text-[#2d55a0] font-medium">
          {rows.length} rule{rows.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Rule cards */}
      <div className="space-y-3 mb-4">
        {rows.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-[#e2e9f4] py-10 flex flex-col items-center gap-2 text-center">
            <span className="material-symbols-outlined text-[#c5d3e4] text-[32px]">rule</span>
            <p className="text-[13px] text-[#374151]">No achievement rules yet.</p>
            <p className="text-[12px] text-[#6b7280]">Click "Add Rule" to create the first one.</p>
          </div>
        ) : (
          rows.map((row, i) => (
            <AchievementRuleCard
              key={i}
              row={row}
              index={i}
              schemeId={schemeId}
              onUpdate={handleDraftChange}
              onDelete={handleDeleteRow}
            />
          ))
        )}
      </div>

      <button
        type="button"
        onClick={addRow}
        className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-[#2d55a0]/40 bg-[#eef2fb]/50 px-4 py-2 text-[12.5px] font-medium text-[#2d55a0] hover:bg-[#eef2fb] transition-colors w-full justify-center"
      >
        <span className="material-symbols-outlined text-[17px]">add_circle</span>
        Add Achievement Rule
      </button>
    </div>
  );
}

// ─── Margin Rules Tab ─────────────────────────────────────────────────────
function MarginRulesTab({ schemeId }) {
  const [rows, setRows]       = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const data = await getMarginRules(schemeId);
      const list = Array.isArray(data) && data.length ? data : DEFAULT_MARGIN_ROWS;
      setRows(list.map(makeRow));
    } catch {
      setRows(DEFAULT_MARGIN_ROWS.map(makeRow));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [schemeId]);

  function handleDraftChange(index, field, value) {
    setRows((prev) => prev.map((r, i) =>
      i === index ? { ...r, _draft: { ...r._draft, [field]: value }, _dirty: true, _error: null } : r
    ));
  }

  async function handleSaveRow(index) {
    const draft = rows[index]._draft;
    setRows((prev) => prev.map((r, i) => i === index ? { ...r, _saving: true, _error: null } : r));
    try {
      const payload = {
        sequence: draft.sequence, min_margin: draft.min_margin, max_margin: draft.max_margin,
        multiplier: draft.multiplier, order_type: draft.order_type, status: draft.status, description: draft.description,
      };
      const saved = draft.id
        ? await updateMarginRule(schemeId, draft.id, payload)
        : await createMarginRule(schemeId, payload);
      const r = saved ?? draft;
      setRows((prev) => prev.map((row, i) =>
        i === index ? { ...r, _draft: { ...r }, _saving: false, _error: null, _dirty: false } : row
      ));
    } catch (err) {
      setRows((prev) => prev.map((r, i) => i === index ? { ...r, _saving: false, _error: err.message ?? "Save failed" } : r));
    }
  }

  async function handleDeleteRow(index) {
    const row = rows[index];
    if (row._draft.id) {
      setRows((prev) => prev.map((r, i) => i === index ? { ...r, _saving: true } : r));
      try { await deleteMarginRule(schemeId, row._draft.id); }
      catch (err) {
        setRows((prev) => prev.map((r, i) => i === index ? { ...r, _saving: false, _error: err.message ?? "Delete failed" } : r));
        return;
      }
    }
    setRows((prev) => prev.filter((_, i) => i !== index));
  }

  function addRow() {
    const nextSeq = rows.length ? Math.max(...rows.map((r) => Number(r._draft.sequence) || 0)) + 1 : 1;
    setRows((prev) => [...prev, makeRow({ sequence: nextSeq, min_margin: "", max_margin: "", multiplier: "", order_type: "ALL", status: 1, description: "" })]);
  }

  handleDraftChange.__save = handleSaveRow;

  if (loading) return (
    <div className="py-12 flex flex-col items-center gap-2">
      <span className="material-symbols-outlined text-[#a6bcee] text-[28px] animate-spin">progress_activity</span>
      <span className="text-[13px] text-[#374151]">Loading rules...</span>
    </div>
  );

  return (
    <div className="p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-[13px] font-semibold text-[#111827]">Margin Rules</p>
          <p className="text-[12px] text-[#6b7280] mt-0.5">
            Set multipliers applied to the incentive based on order margin percentage.
          </p>
        </div>
        <span className="text-[11.5px] px-2.5 py-1 rounded-full bg-[#eef2fb] text-[#2d55a0] font-medium">
          {rows.length} rule{rows.length !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="space-y-3 mb-4">
        {rows.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-[#e2e9f4] py-10 flex flex-col items-center gap-2 text-center">
            <span className="material-symbols-outlined text-[#c5d3e4] text-[32px]">percent</span>
            <p className="text-[13px] text-[#374151]">No margin rules yet.</p>
            <p className="text-[12px] text-[#6b7280]">Click "Add Rule" to create the first one.</p>
          </div>
        ) : (
          rows.map((row, i) => (
            <MarginRuleCard
              key={i}
              row={row}
              index={i}
              onUpdate={handleDraftChange}
              onDelete={handleDeleteRow}
            />
          ))
        )}
      </div>

      <button
        type="button"
        onClick={addRow}
        className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-[#2d55a0]/40 bg-[#eef2fb]/50 px-4 py-2 text-[12.5px] font-medium text-[#2d55a0] hover:bg-[#eef2fb] transition-colors w-full justify-center"
      >
        <span className="material-symbols-outlined text-[17px]">add_circle</span>
        Add Margin Rule
      </button>
    </div>
  );
}

// ─── Overview Tab ─────────────────────────────────────────────────────────
function OverviewTab({ scheme }) {
  function FieldGrid({ label, value }) {
    return (
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wider text-[#6b7280] mb-0.5">{label}</p>
        <p className="text-[13.5px] text-[#111827]">{value || "—"}</p>
      </div>
    );
  }
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-5">
      <FieldGrid label="Scheme Name"    value={scheme.scheme_name} />
      <FieldGrid label="Scheme Code"    value={scheme.scheme_code} />
      <FieldGrid label="Scheme Type"    value={scheme.scheme_type} />
      <FieldGrid label="Financial Year" value={scheme.financial_year} />
      <FieldGrid label="Effective From" value={formatDate(scheme.effective_from)} />
      <FieldGrid label="Effective To"   value={formatDate(scheme.effective_to)} />
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wider text-[#6b7280] mb-0.5">Status</p>
        <StatusBadge status={scheme.status} />
      </div>
      <FieldGrid label="Created At" value={formatDate(scheme.created_at)} />
      {scheme.description && (
        <div className="sm:col-span-2">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[#6b7280] mb-0.5">Description</p>
          <p className="text-[13.5px] text-[#111827] whitespace-pre-wrap">{scheme.description}</p>
        </div>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────
const TABS = [
  { id: "Overview",          icon: "info"          },
  { id: "Achievement Rules", icon: "emoji_events"  },
  { id: "Margin Rules",      icon: "percent"       },
];

export default function SchemeDetails() {
  const { schemeId } = useParams();
  const navigate     = useNavigate();
  const [scheme, setScheme]       = useState(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [activeTab, setActiveTab] = useState("Overview");

  async function load() {
    setLoading(true); setError(null);
    try {
      const data  = await getSchemes();
      const found = (Array.isArray(data) ? data : []).find((s) => String(s.id) === String(schemeId));
      if (!found) throw new Error("Scheme not found");
      setScheme(found);
    } catch (err) {
      setError(err.message ?? "Failed to load scheme");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [schemeId]);

  return (
    <>
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-5 gap-4">
        <div className="flex flex-col gap-1.5">
          <button type="button" onClick={() => navigate("/ob-sheet/incentives/schemes")}
            className="flex items-center gap-1 text-[12.5px] font-medium text-[#2d55a0] hover:underline w-fit">
            <span className="material-symbols-outlined text-[15px]">arrow_back</span>
            Back to Schemes
          </button>
          <div className="flex items-center gap-2.5 mt-0.5">
            <h1 className="font-semibold text-[20px] text-[#111827]" style={{ fontFamily: "'Hanken Grotesk', sans-serif" }}>
              {loading ? "Loading..." : (scheme?.scheme_name ?? "Scheme Details")}
            </h1>
            {scheme && <StatusBadge status={scheme.status} />}
          </div>
          {scheme && (
            <p className="text-[12.5px] text-[#374151]">
              {scheme.scheme_code} · {scheme.scheme_type} · FY {scheme.financial_year}
            </p>
          )}
        </div>
      </div>

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
          <span className="text-[13px] text-[#374151]">Loading scheme details...</span>
        </div>
      ) : scheme ? (
        <div className="bg-white rounded-xl border border-[#e2e9f4] shadow-sm overflow-hidden">
          {/* Tab bar */}
          <div className="flex border-b border-[#e2e9f4] bg-[#f8fafd]">
            {TABS.map(({ id, icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setActiveTab(id)}
                className={`flex items-center gap-1.5 px-5 py-3 text-[13px] font-medium transition-colors relative ${
                  activeTab === id ? "text-[#2d55a0] bg-white" : "text-[#6b7280] hover:text-[#374151] hover:bg-[#f0f4fa]"
                }`}
              >
                <span className="material-symbols-outlined text-[15px]">{icon}</span>
                {id}
                {activeTab === id && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#2d55a0]" />}
              </button>
            ))}
          </div>

          {/* Tab content */}
          {activeTab === "Overview"          && <OverviewTab scheme={scheme} />}
          {activeTab === "Achievement Rules" && <AchievementRulesTab schemeId={schemeId} />}
          {activeTab === "Margin Rules"      && <MarginRulesTab schemeId={schemeId} />}
        </div>
      ) : null}
    </>
  );
}