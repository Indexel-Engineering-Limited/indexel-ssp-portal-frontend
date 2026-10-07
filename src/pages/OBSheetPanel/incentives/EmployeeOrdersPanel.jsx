import { useEffect, useMemo, useRef, useState } from "react";
import { getAllEmployees } from "../../../services/employeeService";
import { getOrdersByEmployee } from "../../../services/incentiveService";
import api from "../../../services/api";

// ─── helpers ──────────────────────────────────────────────────────────────
function fmt(n) {
  if (n == null || n === "") return "—";
  return `₹${Number(n).toLocaleString("en-IN")}`;
}
function fmtDate(v) {
  if (!v) return "—";
  const d = new Date(v);
  return isNaN(d.getTime()) ? "—" : d.toLocaleDateString("en-IN");
}
function StatusBadge({ status }) {
  const map = {
    draft:    "bg-[#fef9c3] text-[#854d0e]",
    submitted:"bg-[#dbe5f8] text-[#1e3a8a]",
    approved: "bg-[#dcfce7] text-[#166534]",
    rejected: "bg-[#ffdad6] text-[#ba1a1a]",
    frozen:   "bg-[#e0e7ff] text-[#3730a3]",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11.5px] font-medium capitalize ${map[status] ?? "bg-[#f3f4f6] text-[#6b7280]"}`}>
      {status ?? "—"}
    </span>
  );
}

const inpCls = "rounded-lg border border-[#c5d3e4]/50 bg-[#f8fafd] px-3 py-2 text-[13px] text-[#111827] outline-none focus:border-[#2d55a0] focus:ring-2 focus:ring-[#2d55a0]/10 transition-all";

// ─── Main Component ───────────────────────────────────────────────────────
export default function EmployeeOrdersPanel() {
  const [employees, setEmployees]       = useState([]);
  const [empLoading, setEmpLoading]     = useState(true);
  const [selectedEmpId, setSelectedEmpId] = useState("");

  const [orders, setOrders]             = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError]   = useState(null);

  const [selected, setSelected]         = useState(new Set());   // checked order ids
  const [rowCount, setRowCount]         = useState("10");        // input: how many rows to show
  const [freezing, setFreezing]         = useState(false);
  const [freezeMsg, setFreezeMsg]       = useState(null);

  const rowCountRef = useRef(null);

  // ── Load employees ───────────────────────────────────────────────────────
  useEffect(() => {
    getAllEmployees()
      .then((data) => setEmployees(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setEmpLoading(false));
  }, []);

  // ── Load orders when employee selected ───────────────────────────────────
  useEffect(() => {
    if (!selectedEmpId) { setOrders([]); return; }
    setOrdersLoading(true);
    setOrdersError(null);
    setSelected(new Set());
    setFreezeMsg(null);
    getOrdersByEmployee(selectedEmpId)
      .then((data) => setOrders(Array.isArray(data) ? data : []))
      .catch((err) => setOrdersError(err.message ?? "Failed to load orders"))
      .finally(() => setOrdersLoading(false));
  }, [selectedEmpId]);

  // ── Visible rows based on rowCount input ─────────────────────────────────
  const visibleOrders = useMemo(() => {
    const n = parseInt(rowCount, 10);
    if (!n || n <= 0) return orders;
    return orders.slice(0, n);
  }, [orders, rowCount]);

  // ── Computed totals ───────────────────────────────────────────────────────
  const totals = useMemo(() => {
    const rows = visibleOrders;
    return {
      poValue:    rows.reduce((s, o) => s + (Number(o.po_value) || 0), 0),
      poSharing:  rows.reduce((s, o) => s + (o.po_value_after_sharing != null && o.po_value_after_sharing !== "" ? Number(o.po_value_after_sharing) : Number(o.po_value) || 0), 0),
      netIncentive: rows.reduce((s, o) => s + (Number(o.net_incentive) || 0), 0),
    };
  }, [visibleOrders]);

  // ── Selection helpers ─────────────────────────────────────────────────────
  const allVisible     = visibleOrders.map((o) => o.id);
  const allChecked     = allVisible.length > 0 && allVisible.every((id) => selected.has(id));
  const someChecked    = allVisible.some((id) => selected.has(id));

  function toggleAll() {
    if (allChecked) {
      setSelected((prev) => { const n = new Set(prev); allVisible.forEach((id) => n.delete(id)); return n; });
    } else {
      setSelected((prev) => { const n = new Set(prev); allVisible.forEach((id) => n.add(id)); return n; });
    }
  }

  function toggleOne(id) {
    setSelected((prev) => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  }

  // ── Freeze ────────────────────────────────────────────────────────────────
  async function handleFreeze() {
    if (selected.size === 0) return;
    setFreezing(true);
    setFreezeMsg(null);
    try {
      const ids = [...selected];
      await api.patch("/api/incentives/orders/freeze", { order_ids: ids });
      // Update local state to frozen
      setOrders((prev) => prev.map((o) => ids.includes(o.id) ? { ...o, status: "frozen" } : o));
      setSelected(new Set());
      setFreezeMsg({ type: "success", text: `${ids.length} order${ids.length !== 1 ? "s" : ""} frozen successfully.` });
    } catch (err) {
      setFreezeMsg({ type: "error", text: err.message ?? "Failed to freeze orders." });
    } finally {
      setFreezing(false);
    }
  }

  const selectedEmployee = employees.find((e) => String(e.employee_id) === String(selectedEmpId) || String(e.id) === String(selectedEmpId));

  return (
    <>
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-5 gap-4">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2.5">
            <h1 className="font-semibold text-[20px] text-[#111827]" style={{ fontFamily: "'Hanken Grotesk', sans-serif" }}>
              Employee Orders
            </h1>
            {orders.length > 0 && (
              <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full bg-[#dbe5f8] text-[11px] font-medium text-[#374151] border border-[#c5d3e4]/30">
                {orders.length} Total
              </span>
            )}
          </div>
          <p className="text-[12.5px] text-[#374151]">Select an employee to view, manage, and freeze their incentive orders.</p>
        </div>
      </div>

      {/* Controls bar */}
      <div className="bg-white rounded-xl border border-[#e2e9f4] shadow-sm px-4 py-3 mb-4 flex flex-wrap items-center gap-3">

        {/* Employee dropdown */}
        <div className="flex items-center gap-2 flex-1 min-w-[220px]">
          <span className="material-symbols-outlined text-[#6b7280] text-[18px] shrink-0">person_search</span>
          <select
            value={selectedEmpId}
            onChange={(e) => setSelectedEmpId(e.target.value)}
            disabled={empLoading}
            className={`flex-1 ${inpCls}`}
          >
            <option value="">{empLoading ? "Loading employees…" : "Select employee"}</option>
            {employees.map((emp) => (
              <option key={emp.id} value={emp.employee_id ?? emp.id}>
                {emp.name} — {emp.employee_id}
                {emp.designation ? ` (${emp.designation})` : ""}
              </option>
            ))}
          </select>
        </div>

        {/* Row count input */}
        <div className="flex items-center gap-2 shrink-0">
          <label className="text-[12px] text-[#374151] whitespace-nowrap">Show rows:</label>
          <input
            ref={rowCountRef}
            type="number"
            min="1"
            value={rowCount}
            onChange={(e) => setRowCount(e.target.value)}
            className={`w-20 ${inpCls}`}
          />
        </div>

        {/* Freeze button */}
        <button
          type="button"
          onClick={handleFreeze}
          disabled={selected.size === 0 || freezing}
          className="inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-[12.5px] font-semibold text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
          style={{ background: selected.size > 0 ? "#3730a3" : "#9ca3af" }}
        >
          {freezing
            ? <><span className="material-symbols-outlined text-[15px] animate-spin">progress_activity</span>Freezing…</>
            : <><span className="material-symbols-outlined text-[15px]">lock</span>Freeze{selected.size > 0 ? ` (${selected.size})` : ""}</>
          }
        </button>

        {/* Deselect all */}
        {selected.size > 0 && (
          <button
            type="button"
            onClick={() => setSelected(new Set())}
            className="inline-flex items-center gap-1 text-[12px] font-medium text-[#6b7280] hover:text-[#374151]"
          >
            <span className="material-symbols-outlined text-[14px]">close</span>
            Clear
          </button>
        )}
      </div>

      {/* Employee info strip */}
      {selectedEmployee && (
        <div className="mb-3 flex items-center gap-3 px-4 py-2.5 rounded-lg bg-[#eef2fb] border border-[#c5d3e4]/40">
          <div className="w-8 h-8 rounded-full bg-[#2d55a0] flex items-center justify-center text-[12px] font-bold text-white shrink-0">
            {(selectedEmployee.name ?? "?").charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-[13px] font-semibold text-[#111827]">{selectedEmployee.name}</span>
            <span className="ml-2 text-[11px] font-mono text-[#2d55a0] bg-[#dbe5f8] px-1.5 py-0.5 rounded">{selectedEmployee.employee_id}</span>
            {selectedEmployee.designation && <span className="ml-2 text-[12px] text-[#6b7280]">{selectedEmployee.designation}</span>}
          </div>
          <div className="text-[12px] text-[#374151] shrink-0">{orders.length} order{orders.length !== 1 ? "s" : ""}</div>
        </div>
      )}

      {/* Freeze feedback */}
      {freezeMsg && (
        <div className={`mb-3 flex items-center justify-between gap-2 rounded-lg px-4 py-2.5 text-[12.5px] ${
          freezeMsg.type === "success" ? "bg-[#f0fdf4] border border-[#bbf7d0] text-[#166534]" : "bg-[#fef2f2] border border-[#fecaca] text-[#ba1a1a]"
        }`}>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px]">{freezeMsg.type === "success" ? "check_circle" : "error"}</span>
            {freezeMsg.text}
          </div>
          <button onClick={() => setFreezeMsg(null)} className="shrink-0">
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        </div>
      )}

      {/* Error */}
      {ordersError && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-[#ffdad6] bg-[#ffdad6]/40 px-4 py-3">
          <span className="material-symbols-outlined text-[#ba1a1a] text-[18px]">error</span>
          <span className="text-[13px] text-[#ba1a1a]">{ordersError}</span>
        </div>
      )}

      {/* Table */}
      {!selectedEmpId ? (
        <div className="rounded-xl border-2 border-dashed border-[#e2e9f4] py-16 flex flex-col items-center gap-2 text-center bg-white">
          <span className="material-symbols-outlined text-[#c5d3e4] text-[36px]">person_search</span>
          <p className="text-[13px] text-[#374151]">Select an employee from the dropdown to view their orders.</p>
        </div>
      ) : ordersLoading ? (
        <div className="bg-[#f8fafd] rounded-xl border border-[#c5d3e4]/20 py-16 flex flex-col items-center gap-2">
          <span className="material-symbols-outlined text-[#a6bcee] text-[28px] animate-spin">progress_activity</span>
          <span className="text-[13px] text-[#374151]">Loading orders…</span>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-[#e2e9f4] shadow-sm overflow-hidden">
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse" style={{ minWidth: 980 }}>
              <thead>
                <tr className="bg-[#f8fafd] text-[#6b7280] text-[11px] font-semibold uppercase tracking-wider border-b border-[#e2e9f4]">
                  {/* Select all */}
                  <th className="px-4 py-3 w-10">
                    <input
                      type="checkbox"
                      checked={allChecked}
                      ref={(el) => { if (el) el.indeterminate = someChecked && !allChecked; }}
                      onChange={toggleAll}
                      className="w-4 h-4 rounded border-gray-300 text-[#2d55a0] cursor-pointer accent-[#2d55a0]"
                    />
                  </th>
                  <th className="px-4 py-3">#</th>
                  <th className="px-4 py-3">Invoice No</th>
                  <th className="px-4 py-3">Invoice Date</th>
                  <th className="px-4 py-3">Plant / Customer</th>
                  <th className="px-4 py-3">PO Number</th>
                  <th className="px-4 py-3">PO Date</th>
                  <th className="px-4 py-3 text-right">PO Value</th>
                  <th className="px-4 py-3 text-right">PO After Sharing</th>
                  <th className="px-4 py-3 text-right">Margin %</th>
                  <th className="px-4 py-3 text-right">Net Incentive</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="text-[13px] text-[#111827] divide-y divide-[#f0f4fa]">
                {visibleOrders.length === 0 ? (
                  <tr>
                    <td colSpan={12} className="py-14 text-center text-[#374151]">
                      No orders found for this employee.
                    </td>
                  </tr>
                ) : (
                  visibleOrders.map((order, idx) => {
                    const isChecked = selected.has(order.id);
                    const isFrozen  = order.status === "frozen";
                    return (
                      <tr
                        key={order.id}
                        className="hover:bg-[#f8fafd] transition-colors cursor-pointer"
                        style={{ background: isChecked ? "#eef2fb" : isFrozen ? "#f5f3ff" : undefined }}
                        onClick={() => toggleOne(order.id)}
                      >
                        <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleOne(order.id)}
                            className="w-4 h-4 rounded border-gray-300 cursor-pointer accent-[#2d55a0]"
                          />
                        </td>
                        <td className="px-4 py-3 text-[#6b7280]">{idx + 1}</td>
                        <td className="px-4 py-3 font-medium">{order.invoice_no || "—"}</td>
                        <td className="px-4 py-3 text-[#374151]">{fmtDate(order.invoice_date)}</td>
                        <td className="px-4 py-3 text-[#374151] max-w-[160px] truncate">{order.plant_customer || "—"}</td>
                        <td className="px-4 py-3 text-[#374151]">{order.po_number || "—"}</td>
                        <td className="px-4 py-3 text-[#374151]">{fmtDate(order.po_date)}</td>
                        <td className="px-4 py-3 text-right text-[#374151]">{fmt(order.po_value)}</td>
                        <td className="px-4 py-3 text-right text-[#374151]">{fmt(order.po_value_after_sharing)}</td>
                        <td className="px-4 py-3 text-right text-[#374151]">
                          {order.margin_percent != null ? `${order.margin_percent}%` : "—"}
                        </td>
                        <td className="px-4 py-3 text-right font-semibold text-[#2d55a0]">
                          {fmt(order.net_incentive)}
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge status={order.status} />
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
              {/* Totals footer */}
              {visibleOrders.length > 0 && (
                <tfoot>
                  <tr className="bg-[#f8fafd] border-t-2 border-[#e2e9f4] text-[12.5px] font-semibold text-[#374151]">
                    <td colSpan={7} className="px-4 py-3 text-right text-[#6b7280]">
                      Totals ({visibleOrders.length} rows)
                    </td>
                    <td className="px-4 py-3 text-right text-[#111827]">{fmt(totals.poValue)}</td>
                    <td className="px-4 py-3 text-right text-[#111827]">{fmt(totals.poSharing)}</td>
                    <td className="px-4 py-3"></td>
                    <td className="px-4 py-3 text-right text-[#2d55a0]">{fmt(totals.netIncentive)}</td>
                    <td className="px-4 py-3"></td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>

          {/* Selection summary bar */}
          {selected.size > 0 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-[#e2e9f4] bg-[#eef2fb]">
              <span className="text-[12.5px] font-medium text-[#2d55a0]">
                {selected.size} row{selected.size !== 1 ? "s" : ""} selected
              </span>
              <button
                type="button"
                onClick={handleFreeze}
                disabled={freezing}
                className="inline-flex items-center gap-1.5 rounded-lg px-4 py-1.5 text-[12.5px] font-semibold text-white disabled:opacity-50"
                style={{ background: "#3730a3" }}
              >
                {freezing
                  ? <><span className="material-symbols-outlined text-[14px] animate-spin">progress_activity</span>Freezing…</>
                  : <><span className="material-symbols-outlined text-[14px]">lock</span>Freeze Selected</>
                }
              </button>
            </div>
          )}
        </div>
      )}
    </>
  );
}