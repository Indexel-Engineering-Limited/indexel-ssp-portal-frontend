import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getSchemes, getOrders } from "../../../services/incentiveService";

function StatusBadge({ status }) {
  const styles = {
    active:    "bg-[#dcfce7] text-[#166534]",
    draft:     "bg-[#fef9c3] text-[#854d0e]",
    inactive:  "bg-[#f3f4f6] text-[#6b7280]",
    submitted: "bg-[#dbe5f8] text-[#1e3a8a]",
    approved:  "bg-[#dcfce7] text-[#166534]",
    rejected:  "bg-[#ffdad6] text-[#ba1a1a]",
  };
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11.5px] font-medium capitalize ${styles[status] ?? "bg-[#f3f4f6] text-[#6b7280]"}`}
    >
      {status ?? "—"}
    </span>
  );
}

function StatCard({ icon, label, value, sub }) {
  const dotColor = icon === "currency_rupee" ? "#0298CA" : icon === "receipt_long" ? "#4085E4" : "#285598";
  return (
    <article className="overview-stat">
      <div className="overview-stat-label"><span className="overview-stat-dot" style={{ backgroundColor: dotColor }} />{label}</div>
      <div className="overview-stat-value">{value}</div>
      {sub && <div className="overview-stat-detail">{sub}</div>}
    </article>
  );
}

export default function IncentiveDashboard() {
  const navigate = useNavigate();
  const [schemes, setSchemes] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const [schemesData, ordersData] = await Promise.all([getSchemes(), getOrders()]);
      setSchemes(Array.isArray(schemesData) ? schemesData : []);
      setOrders(Array.isArray(ordersData) ? ordersData : []);
    } catch (err) {
      setError(err.message ?? "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const totalNetIncentive = orders.reduce((sum, o) => sum + (Number(o.net_incentive) || 0), 0);
  const activeOrders = orders.filter((o) => o.status !== "draft").length;
  const recentOrders = [...orders].sort((a, b) => new Date(b.created_at ?? 0) - new Date(a.created_at ?? 0)).slice(0, 5);

  return (
    <>
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-5 gap-4">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2.5">
            <h1
              className="font-semibold text-[20px] text-[#111827]"
              style={{ fontFamily: "'Hanken Grotesk', sans-serif" }}
            >
              Incentive Dashboard
            </h1>
            <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full bg-[#dbe5f8] text-[11px] font-medium text-[#374151] border border-[#c5d3e4]/30">
              Overview
            </span>
          </div>
          <p className="text-[12.5px] text-[#374151]">Sales incentive module summary and quick stats.</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigate("/ob-sheet/incentives/orders/new")}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#2d55a0] px-3 py-2 text-[12.5px] font-medium text-white hover:bg-[#234690] transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            New Order
          </button>
          <button
            type="button"
            onClick={() => navigate("/ob-sheet/incentives/schemes")}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#c5d3e4]/50 bg-[#f8fafd] px-3 py-2 text-[12.5px] font-medium text-[#111827] hover:bg-[#f0f4fa] transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">settings</span>
            Manage Schemes
          </button>
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="mb-4 flex items-center justify-between gap-3 rounded-lg border border-[#ffdad6] bg-[#ffdad6]/40 px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#ba1a1a] text-[18px]">error</span>
            <span className="text-[13px] text-[#ba1a1a]">{error}</span>
          </div>
          <button onClick={load} className="text-[12px] font-medium text-[#111827] underline">
            Retry
          </button>
        </div>
      )}

      {loading ? (
        <div className="bg-[#f8fafd] rounded-xl border border-[#c5d3e4]/20 py-16 flex flex-col items-center gap-2">
          <span className="material-symbols-outlined text-[#a6bcee] text-[28px] animate-spin">
            progress_activity
          </span>
          <span className="text-[13px] text-[#374151]">Loading dashboard...</span>
        </div>
      ) : (
        <>
          {/* Stats grid */}
          <div className="incentive-stat-grid mb-6">
            <StatCard
              icon="schema"
              label="Total Schemes"
              value={schemes.length}
              sub={`${schemes.filter((s) => s.status === "active").length} active`}
            />
            <StatCard
              icon="receipt_long"
              label="Active Orders"
              value={activeOrders}
              sub={`${orders.length} total orders`}
            />
            <StatCard
              icon="currency_rupee"
              label="Total Net Incentive"
              value={`₹${totalNetIncentive.toLocaleString("en-IN")}`}
              sub="All orders combined"
            />
          </div>

          {/* Two-column cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Recent Orders */}
            <div className="bg-white rounded-xl border border-[#e2e9f4] shadow-sm flex flex-col">
              <div className="flex items-center justify-between px-5 py-4 border-b border-[#e2e9f4]">
                <h2 className="text-[14px] font-semibold text-[#111827]">Recent Orders</h2>
                <button
                  type="button"
                  onClick={() => navigate("/ob-sheet/incentives/orders")}
                  className="text-[12px] font-medium text-[#2d55a0] hover:underline"
                >
                  View all →
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="text-[11px] font-semibold uppercase tracking-wider text-[#6b7280] border-b border-[#e2e9f4]">
                      <th className="px-5 py-2.5">Invoice No</th>
                      <th className="px-5 py-2.5">Salesperson</th>
                      <th className="px-5 py-2.5">Net Incentive</th>
                      <th className="px-5 py-2.5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="text-[13px] text-[#111827]">
                    {recentOrders.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-5 py-8 text-center text-[#374151]">
                          No orders yet.
                        </td>
                      </tr>
                    ) : (
                      recentOrders.map((order) => (
                        <tr
                          key={order.id}
                          className="border-b border-[#e2e9f4]/60 last:border-0 hover:bg-[#f8fafd] cursor-pointer"
                          onClick={() => navigate(`/ob-sheet/incentives/orders/${order.id}/edit`)}
                        >
                          <td className="px-5 py-3 font-medium">{order.invoice_no ?? "—"}</td>
                          <td className="px-5 py-3 text-[#374151]">{order.salesperson ?? "—"}</td>
                          <td className="px-5 py-3 text-[#374151]">
                            {order.net_incentive != null
                              ? `₹${Number(order.net_incentive).toLocaleString("en-IN")}`
                              : "—"}
                          </td>
                          <td className="px-5 py-3">
                            <StatusBadge status={order.status} />
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Schemes Overview */}
            <div className="bg-white rounded-xl border border-[#e2e9f4] shadow-sm flex flex-col">
              <div className="flex items-center justify-between px-5 py-4 border-b border-[#e2e9f4]">
                <h2 className="text-[14px] font-semibold text-[#111827]">Schemes Overview</h2>
                <button
                  type="button"
                  onClick={() => navigate("/ob-sheet/incentives/schemes")}
                  className="text-[12px] font-medium text-[#2d55a0] hover:underline"
                >
                  Manage →
                </button>
              </div>
              <div className="flex flex-col divide-y divide-[#e2e9f4]/60">
                {schemes.length === 0 ? (
                  <div className="px-5 py-8 text-center text-[13px] text-[#374151]">
                    No schemes configured.
                  </div>
                ) : (
                  schemes.map((scheme) => (
                    <div
                      key={scheme.id}
                      className="flex items-center justify-between px-5 py-3 hover:bg-[#f8fafd] cursor-pointer"
                      onClick={() => navigate(`/ob-sheet/incentives/schemes/${scheme.id}`)}
                    >
                      <div className="min-w-0">
                        <p className="text-[13px] font-medium text-[#111827] truncate">
                          {scheme.scheme_name ?? "—"}
                        </p>
                        <p className="text-[11.5px] text-[#6b7280]">
                          {scheme.scheme_code} · {scheme.financial_year}
                        </p>
                      </div>
                      <StatusBadge status={scheme.status} />
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
