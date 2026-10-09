import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getOrders, getEmployeeTarget } from "../../../services/incentiveService";
import { getCurrentUser } from "../../../services/authService";

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

function StatusBadge({ status }) {
  const styles = {
    draft: "bg-[#fef9c3] text-[#854d0e]",
    submitted: "bg-[#dbe5f8] text-[#1e3a8a]",
    approved: "bg-[#dcfce7] text-[#166534]",
    rejected: "bg-[#ffdad6] text-[#ba1a1a]",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11.5px] font-medium capitalize ${styles[status] ?? "bg-[#f3f4f6] text-[#6b7280]"}`}>
      {status ?? "—"}
    </span>
  );
}

function formatDate(val) {
  if (!val) return "—";
  const d = new Date(val);
  return isNaN(d.getTime()) ? "—" : d.toLocaleDateString("en-IN");
}

export default function IncentiveOrders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZE_OPTIONS[0]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [target, setTarget] = useState(null);

  async function load() {
    setLoading(true);
    setError(null);
    const currentUser = getCurrentUser();
    const empId = currentUser?.employee_id ?? currentUser?.id;
    try {
      const [data, targetData] = await Promise.all([
        getOrders(),
        empId ? getEmployeeTarget(empId).catch(() => null) : Promise.resolve(null),
      ]);
      console.log(targetData[0]);
      setOrders(Array.isArray(data) ? data : []);
      setTarget(targetData[0]);
    } catch (err) {
      setError(err.message ?? "Failed to load orders");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return orders;
    return orders.filter((o) =>
      [o.invoice_no, o.salesperson, o.plant_customer].some(
        (v) => String(v ?? "").toLowerCase().includes(q)
      )
    );
  }, [orders, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));

  const paginated = useMemo(
    () => filtered.slice((page - 1) * pageSize, page * pageSize),
    [filtered, page, pageSize]
  );

  function handleSearchChange(e) {
    setSearch(e.target.value);
    setPage(1);
  }

  function handlePageSizeChange(e) {
    setPageSize(Number(e.target.value));
    setPage(1);
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
              Incentive Orders
            </h1>
            <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full bg-[#dbe5f8] text-[11px] font-medium text-[#374151] border border-[#c5d3e4]/30">
              {orders.length.toLocaleString()} Total
            </span>
          </div>
          <p className="text-[12.5px] text-[#374151]">View and manage all incentive orders.</p>
        </div>

        <div className="flex w-full sm:w-auto items-center gap-2">
          <button
            type="button"
            onClick={() => navigate("/ob-sheet/incentives/orders/new")}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#2d55a0] px-3 py-2 text-[12.5px] font-medium text-white hover:bg-[#234690] transition-colors shrink-0"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            New Order
          </button>
          <label className="flex items-center gap-2 text-[12px] text-[#374151] whitespace-nowrap">
            Show
            <select
              value={pageSize}
              onChange={handlePageSizeChange}
              className="rounded-lg border border-[#c5d3e4]/50 bg-[#f8fafd] px-2 py-2 text-[13px] text-[#111827] outline-none focus:border-[#2d55a0]"
            >
              {PAGE_SIZE_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </label>
          <div className="relative flex-1 sm:w-72">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#6b7280] text-[18px]">search</span>
            <input
              value={search}
              onChange={handleSearchChange}
              placeholder="Search by invoice, salesperson..."
              className="w-full rounded-lg border border-[#c5d3e4]/50 bg-[#f8fafd] py-2 pl-9 pr-3 text-[13px] text-[#111827] placeholder:text-[#6b7280]/60 outline-none focus:border-[#2d55a0]"
            />
          </div>
        </div>
      </div>

      {/* Target progress banner */}
      {target && (() => {
        const targetAmt = Number(target.target_amount) || 0;
        const achieved = orders.reduce((sum, o) => {
          const v = o.po_value_after_sharing != null && o.po_value_after_sharing !== ""
            ? Number(o.po_value_after_sharing)
            : Number(o.po_value) || 0;
          return sum + v;
        }, 0);
        const achPct = targetAmt > 0 ? (achieved / targetAmt) * 100 : 0;
        const capped = Math.min(achPct, 100);
        const netEarned =
          achPct >= 70
            ? orders.reduce(
              (sum, o) => sum + (Number(o.net_incentive) || 0),
              0
            )
            : null;
        const remaining = Math.max(0, targetAmt * 0.7 - achieved);
        const isEligible = achPct >= 70;
        const barColor = achPct >= 100 ? "#16a34a" : achPct >= 70 ? "#2d55a0" : achPct >= 50 ? "#d97706" : "#ba1a1a";

        return (
          <div className="mb-5 rounded-xl border border-[#e2e9f4] bg-white shadow-sm overflow-hidden">

            {/* Coloured top strip */}
            <div className="h-1.5 w-full" style={{ background: barColor }} />

            <div className="px-5 pt-4 pb-5 space-y-4">

              {/* Title row */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#2d55a0] text-[18px]">flag</span>
                  <span className="text-[13px] font-semibold text-[#111827]">
                    My Target — FY {target.financial_year}
                  </span>
                </div>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium capitalize ${target.status === "active" ? "bg-[#dcfce7] text-[#166534]" :
                  target.status === "achieved" ? "bg-[#dbe5f8] text-[#1e3a8a]" :
                    "bg-[#f3f4f6] text-[#6b7280]"
                  }`}>{target.status ?? "—"}</span>
              </div>

              {/* Stats grid — always show all 4 */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {/* Target */}
                <div className="rounded-lg bg-[#f8fafd] border border-[#e2e9f4] px-3 py-2.5">
                  <p className="text-[10.5px] font-semibold uppercase tracking-wider text-[#6b7280] mb-0.5">Target</p>
                  <p className="text-[15px] font-bold text-[#111827]">₹{targetAmt.toLocaleString("en-IN")}</p>
                </div>
                {/* Achieved */}
                <div className="rounded-lg bg-[#f8fafd] border border-[#e2e9f4] px-3 py-2.5">
                  <p className="text-[10.5px] font-semibold uppercase tracking-wider text-[#6b7280] mb-0.5">Achieved</p>
                  <p className="text-[15px] font-bold text-[#111827]">₹{achieved.toLocaleString("en-IN")}</p>
                </div>
                {/* Achievement % */}
                <div className="rounded-lg px-3 py-2.5 border" style={{
                  background: isEligible ? "#f0fdf4" : "#fffbeb",
                  borderColor: isEligible ? "#bbf7d0" : "#fde68a",
                }}>
                  <p className="text-[10.5px] font-semibold uppercase tracking-wider text-[#6b7280] mb-0.5">Achievement</p>
                  <p className="text-[15px] font-bold" style={{ color: barColor }}>{achPct.toFixed(1)}%</p>
                </div>
                {/* Net Incentive — always visible */}
                <div className="rounded-lg px-3 py-2.5 border" style={{
                  background: netEarned > 0 ? "#f0fdf4" : "#f8fafd",
                  borderColor: netEarned > 0 ? "#bbf7d0" : "#e2e9f4",
                }}>
                  <p className="text-[10.5px] font-semibold uppercase tracking-wider text-[#6b7280] mb-0.5">Net Incentive</p>
                  <p className="text-[15px] font-bold" style={{ color: netEarned > 0 ? "#166534" : "#9ca3af" }}>
                    {isEligible
                      ? `₹${netEarned.toLocaleString("en-IN")}`
                      : "—"}
                  </p>
                </div>
              </div>

              {/* Progress bar */}
              <div>
                <div className="w-full h-3 rounded-full bg-[#f0f4fa] overflow-visible relative">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${capped}%`, background: barColor }}
                  />
                  {/* 70% threshold marker */}
                  <div
                    className="absolute top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full"
                    style={{ left: "70%", background: "#374151", opacity: 0.35 }}
                  />
                </div>
                {/* Labels */}
                <div className="relative mt-1.5 h-4">
                  <span className="absolute text-[10px] text-[#6b7280] -translate-x-1/2" style={{ left: "0%" }}>0%</span>
                  <span className="absolute text-[10px] font-semibold text-[#374151] -translate-x-1/2" style={{ left: "70%" }}>70%</span>
                  <span className="absolute text-[10px] text-[#9ca3af] -translate-x-full" style={{ left: "100%" }}>100%</span>
                </div>
              </div>

              {/* Message */}
              {isEligible ? (
                <div className="flex items-center gap-2 rounded-lg bg-[#f0fdf4] border border-[#bbf7d0] px-3 py-2">
                  <span className="material-symbols-outlined text-[#166534] text-[16px]">check_circle</span>
                  <span className="text-[12.5px] text-[#166534] font-medium">
                    {achPct.toFixed(1)}% achieved — eligible for incentive. Net earned: ₹{netEarned.toLocaleString("en-IN")}
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2 rounded-lg bg-[#fffbeb] border border-[#fde68a] px-3 py-2">
                  <span className="material-symbols-outlined text-[#d97706] text-[16px]">info</span>
                  <span className="text-[12.5px] text-[#92400e]">
                    Need ₹{remaining.toLocaleString("en-IN")} more to reach 70% — minimum threshold for incentive payout.
                  </span>
                </div>
              )}

            </div>
          </div>
        );
      })()}

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
          <span className="text-[13px] text-[#374151]">Loading orders...</span>
        </div>
      ) : (
        <div className="bg-[#f8fafd] rounded-xl border border-[#c5d3e4]/20 overflow-hidden flex flex-col mb-6 shadow-sm">
          <div className="overflow-x-auto w-full">
            <table className="w-full min-w-[960px] text-left border-collapse">
              <thead>
                <tr className="bg-[#f8fafd] text-[#374151] text-[11px] font-semibold uppercase tracking-wider border-b border-[#d4e0f0]/50">
                  <th className="py-2.5 px-4">Invoice No</th>
                  <th className="py-2.5 px-4">Invoice Date</th>

                  <th className="py-2.5 px-4">Plant / Customer</th>
                  <th className="py-2.5 px-4">PO Number</th>
                  <th className="py-2.5 px-4">PO Date</th>
                  <th className="py-2.5 px-4 text-right">PO Value</th>

                  <th className="py-2.5 px-4">PO Value Sharing</th>
                  <th className="py-2.5 px-4 text-right">Margin %</th>
                  <th className="py-2.5 px-4 text-right">Net Incentive</th>

                  <th className="py-2.5 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="text-[13px] text-[#111827]">
                {paginated.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-14 text-center text-[#374151]">
                      {search ? "No orders match your search." : "No orders yet. Click \"New Order\" to create one."}
                    </td>
                  </tr>
                ) : (
                  paginated.map((order) => {
                    const isFrozen = order.isEditable === 0;
                    return (
                      <tr
                        key={order.id}
                        className="border-b border-[#d4e0f0]/40 last:border-0 hover:bg-[#f0f4fa]/45"
                        style={isFrozen ? { background: "#f5f3ff" } : undefined}
                      >
                        <td className="px-4 py-3 font-medium">{order.invoice_no ?? "—"}</td>
                        <td className="px-4 py-3 text-[#374151]">{formatDate(order.invoice_date)}</td>

                        <td className="px-4 py-3 text-[#374151]">{order.plant_customer ?? "—"}</td>
                        <td className="px-4 py-3 text-[#374151]">{order.po_number ?? "-"}</td>
                        <td className="px-4 py-3 text-[#374151]">
                          {order.po_date
                            ? new Date(order.po_date).toLocaleDateString("en-GB", {
                              timeZone: "UTC",
                            })
                            : "-"}
                        </td>
                        <td className="px-4 py-3 text-right text-[#374151]">
                          {order.po_value != null ? `₹${Number(order.po_value).toLocaleString("en-IN")}` : "—"}
                        </td>
                        <td className="px-4 py-3 text-[#374151]">{order.po_value_after_sharing ?? "-"}</td>

                        <td className="px-4 py-3 text-right text-[#374151]">
                          {order.margin_percent != null ? `${order.margin_percent}%` : "—"}
                        </td>
                        <td className="px-4 py-3 text-right font-medium text-[#2d55a0]">
                          {order.net_incentive != null ? `₹${Number(order.net_incentive).toLocaleString("en-IN")}` : "—"}
                        </td>

                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              type="button"
                              onClick={() =>{
                                console.log("isEditable:", order.isEditable);
                                navigate(`/ob-sheet/incentives/orders/${order.id}/edit`, {
                                  state: { isEditable: order.isEditable },
                                })
                              }}
                              title="Edit order"
                              className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-[#374151] hover:bg-[#eef2fb] hover:text-[#2d55a0] transition-colors"
                            >
                              <span className="material-symbols-outlined text-[17px]">
                                edit
                              </span>
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
          <div className="flex items-center justify-between px-4 py-3 border-t border-[#d4e0f0]/40 text-[12.5px] text-[#374151]">
            <span>
              {filtered.length === 0
                ? "No results"
                : `Showing ${Math.min((page - 1) * pageSize + 1, filtered.length)}–${Math.min(page * pageSize, filtered.length)} of ${filtered.length}`}
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setPage(1)}
                disabled={page === 1}
                className="inline-flex items-center justify-center w-7 h-7 rounded-lg border border-[#c5d3e4]/50 text-[#374151] hover:bg-[#f0f4fa] disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <span className="material-symbols-outlined text-[15px]">first_page</span>
              </button>
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="inline-flex items-center justify-center w-7 h-7 rounded-lg border border-[#c5d3e4]/50 text-[#374151] hover:bg-[#f0f4fa] disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <span className="material-symbols-outlined text-[15px]">chevron_left</span>
              </button>
              <span className="px-2">Page {page} of {totalPages}</span>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="inline-flex items-center justify-center w-7 h-7 rounded-lg border border-[#c5d3e4]/50 text-[#374151] hover:bg-[#f0f4fa] disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <span className="material-symbols-outlined text-[15px]">chevron_right</span>
              </button>
              <button
                type="button"
                onClick={() => setPage(totalPages)}
                disabled={page === totalPages}
                className="inline-flex items-center justify-center w-7 h-7 rounded-lg border border-[#c5d3e4]/50 text-[#374151] hover:bg-[#f0f4fa] disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <span className="material-symbols-outlined text-[15px]">last_page</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
