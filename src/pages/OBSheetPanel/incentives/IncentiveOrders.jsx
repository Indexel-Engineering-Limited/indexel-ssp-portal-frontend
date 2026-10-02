import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getOrders, getEmployeeTarget } from "../../../services/incentiveService";
import { getCurrentUser } from "../../../services/authService";

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

function StatusBadge({ status }) {
  const styles = {
    draft:     "bg-[#fef9c3] text-[#854d0e]",
    submitted: "bg-[#dbe5f8] text-[#1e3a8a]",
    approved:  "bg-[#dcfce7] text-[#166534]",
    rejected:  "bg-[#ffdad6] text-[#ba1a1a]",
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

      {/* Target banner */}
      {target && (
        <div className="mb-4 rounded-xl border border-[#c5d3e4]/40 bg-white shadow-sm overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#eef2fb] flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[#2d55a0] text-[20px]">flag</span>
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-[#6b7280]">My Target — FY {target.financial_year}</p>
                <p className="text-[22px] font-bold text-[#111827] leading-tight">
                  ₹{Number(target.target_amount).toLocaleString("en-IN")}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-6 px-1">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-[#6b7280]">Scheme ID</p>
                <p className="text-[15px] font-bold text-[#2d55a0]">{target.scheme_id}</p>
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-[#6b7280]">Status</p>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11.5px] font-medium capitalize ${
                  target.status === "active"   ? "bg-[#dcfce7] text-[#166534]" :
                  target.status === "achieved" ? "bg-[#dbe5f8] text-[#1e3a8a]" :
                  "bg-[#f3f4f6] text-[#6b7280]"
                }`}>{target.status ?? "—"}</span>
              </div>
            </div>
          </div>
        </div>
      )}

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
                  paginated.map((order) => (
                    <tr key={order.id} className="border-b border-[#d4e0f0]/40 last:border-0 hover:bg-[#f0f4fa]/45">
                      <td className="px-4 py-3 font-medium">{order.invoice_no ?? "—"}</td>
                      <td className="px-4 py-3 text-[#374151]">{formatDate(order.invoice_date)}</td>
                      
                      <td className="px-4 py-3 text-[#374151]">{order.plant_customer ?? "—"}</td>
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
                            onClick={() => navigate(`/ob-sheet/incentives/orders/${order.id}/edit`)}
                            title="Edit order"
                            className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-[#374151] hover:bg-[#eef2fb] hover:text-[#2d55a0] transition-colors"
                          >
                            <span className="material-symbols-outlined text-[17px]">edit</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
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
