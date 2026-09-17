﻿import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getAllCompanies, getAllContacts } from "../services/companyService";
import { formatDate, normalizeCompany, normalizeContact } from "../utils/mappers";

function MetricCard({ icon, label, value, detail, to }) {
  return (
    <Link
      to={to}
      className="block rounded-xl p-5 transition-all hover:-translate-y-0.5"
      style={{
        background:  "#ffffff",
        border:      "1px solid #e2e9f4",
        boxShadow:   "0 2px 12px rgba(45,85,160,0.07)",
        fontFamily:  "'Inter','Hanken Grotesk',sans-serif",
      }}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11.5px] font-semibold uppercase tracking-[0.14em] text-[#6b7280]">{label}</p>
          <p className="mt-2 text-[32px] leading-none font-bold text-[#111827]">{value}</p>
          <p className="mt-2 text-[12px] text-[#374151]">{detail}</p>
        </div>
        <div
          className="flex h-11 w-11 items-center justify-center rounded-xl shrink-0"
          style={{ background: "#eef2fb", color: "#2d55a0" }}
        >
          <span className="material-symbols-outlined text-[22px]">{icon}</span>
        </div>
      </div>
    </Link>
  );
}

function SectionCard({ title, subtitle, linkLabel, linkTo, loading, emptyMsg, children }) {
  return (
    <section
      className="overflow-hidden rounded-xl"
      style={{ background: "#ffffff", border: "1px solid #e2e9f4", boxShadow: "0 2px 12px rgba(45,85,160,0.07)" }}
    >
      <div
        className="flex items-center justify-between px-5 py-4"
        style={{ borderBottom: "1px solid #f0f4fa" }}
      >
        <div>
          <h2 className="text-[14.5px] font-semibold text-[#111827]">{title}</h2>
          <p className="mt-0.5 text-[11.5px] text-[#6b7280]">{subtitle}</p>
        </div>
        <Link to={linkTo} className="text-[12px] font-semibold transition-colors hover:underline" style={{ color: "#2d55a0" }}>
          {linkLabel}
        </Link>
      </div>
      {loading ? (
        <p className="px-5 py-12 text-center text-[13px] text-[#6b7280]">Loading…</p>
      ) : (
        children
      )}
    </section>
  );
}

export default function DashboardPage() {
  const [companies, setCompanies] = useState([]);
  const [contacts,  setContacts]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState(null);

  async function loadDashboard() {
    setLoading(true); setError(null);
    try {
      const [cd, ct] = await Promise.all([getAllCompanies(), getAllContacts()]);
      setCompanies((Array.isArray(cd) ? cd : []).map(normalizeCompany).filter(Boolean));
      setContacts( (Array.isArray(ct) ? ct : []).map(normalizeContact).filter(Boolean));
    } catch (err) {
      setError(err.message || "Could not load dashboard data.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadDashboard(); }, []);

  const companyNames    = useMemo(() => new Map(companies.map((c) => [String(c.id), c.company_name])), [companies]);
  const recentCompanies = useMemo(() => [...companies].sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0)).slice(0, 5), [companies]);
  const recentContacts  = useMemo(() => [...contacts].sort( (a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0)).slice(0, 5), [contacts]);

  const rowCls = "flex items-center justify-between gap-4 px-5 py-3.5 transition-colors last:border-0";
  const rowStyle = { borderBottom: "1px solid #f0f4fa" };

  return (
    <div className="max-w-7xl mx-auto" style={{ fontFamily: "'Inter','Hanken Grotesk',sans-serif" }}>
      {/* Page title */}
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11.5px] font-semibold uppercase tracking-[0.16em] text-[#2d55a0]">Overview</p>
          <h1 className="mt-1 text-[24px] font-bold tracking-tight text-[#111827]">Dashboard</h1>
          <p className="mt-1 text-[13px] text-[#374151]">Companies and contacts at a glance.</p>
        </div>
        <Link
          to="/bulk-upload"
          className="inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-[13px] font-semibold text-white transition-all hover:-translate-y-0.5"
          style={{ background: "#2d55a0", boxShadow: "0 4px 14px rgba(45,85,160,0.28)" }}
        >
          <span className="material-symbols-outlined text-[17px]">upload_file</span>
          Bulk Upload
        </Link>
      </div>

      {/* Error banner */}
      {error && (
        <div
          className="mb-5 flex items-center justify-between gap-4 rounded-lg px-4 py-3 text-[13px]"
          style={{ background: "#ffdad6", border: "1px solid #f8c8c8", color: "#ba1a1a" }}
        >
          <span>{error}</span>
          <button onClick={loadDashboard} className="font-semibold underline">Retry</button>
        </div>
      )}

      {/* Metric cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        <MetricCard icon="corporate_fare" label="Total Companies" value={loading ? "—" : companies.length} detail="Companies in the directory" to="/companies" />
        <MetricCard icon="groups"         label="Total Contacts"  value={loading ? "—" : contacts.length}  detail="Contact persons across all companies" to="/bulk-upload" />
      </div>

      {/* Recent tables */}
      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <SectionCard title="Recent Companies" subtitle="Latest directory records" linkLabel="View all" linkTo="/companies" loading={loading} emptyMsg="No companies yet.">
          {recentCompanies.length === 0 ? (
            <p className="px-5 py-12 text-center text-[13px] text-[#6b7280]">No companies yet.</p>
          ) : (
            <div>
              {recentCompanies.map((c) => (
                <Link key={c.id} to={`/companies/${c.id}`} className={rowCls} style={rowStyle}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#f8fafd")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <div className="min-w-0">
                    <p className="truncate text-[13px] font-semibold text-[#111827]">{c.company_name}</p>
                    <p className="mt-0.5 truncate text-[11.5px] text-[#6b7280]">
                      {c.industry || "—"} &bull; {c.location || "—"}
                    </p>
                  </div>
                  <span className="shrink-0 text-[11px] text-[#6b7280]">{formatDate(c.created_at)}</span>
                </Link>
              ))}
            </div>
          )}
        </SectionCard>

        <SectionCard title="Recent Contacts" subtitle="Latest uploaded records" linkLabel="Upload more" linkTo="/bulk-upload" loading={loading} emptyMsg="No contacts yet.">
          {recentContacts.length === 0 ? (
            <p className="px-5 py-12 text-center text-[13px] text-[#6b7280]">No contacts yet.</p>
          ) : (
            <div>
              {recentContacts.map((c) => (
                <Link key={c.id} to={`/companies/${c.company_details_id}`} className={rowCls} style={rowStyle}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#f8fafd")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <div className="min-w-0">
                    <p className="truncate text-[13px] font-semibold text-[#111827]">{c.person_name || "Unnamed"}</p>
                    <p className="mt-0.5 truncate text-[11.5px] text-[#6b7280]">
                      {companyNames.get(String(c.company_details_id)) || `Company ${c.company_details_id}`} &bull; {c.designation || "—"}
                    </p>
                  </div>
                  <span className="shrink-0 text-[11px] text-[#6b7280]">{formatDate(c.created_at)}</span>
                </Link>
              ))}
            </div>
          )}
        </SectionCard>
      </div>
    </div>
  );
}