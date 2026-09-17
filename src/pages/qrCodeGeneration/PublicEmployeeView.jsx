import React, { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { getEmployeeByEmployeeId } from "../../services/employeeService";
import logo from "../../assets/login-logo.png";

// ── Brand colours (same as the rest of the app) ───────────────────────────
// primary:  #2d55a0 / #285498
// bg:       #f8fafd
// border:   #e2e9f4 / #c5d3e4
// text:     #111827 / #374151 / #6b7280

// ── Helpers ───────────────────────────────────────────────────────────────
const getImageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  const base = import.meta?.env?.VITE_API_URL ?? "http://localhost:3000";
  return `${base}${path}`;
};

// ── Sub-components ────────────────────────────────────────────────────────

function AppHeader() {
  return (
    <header
      className="sticky top-0 z-30 bg-white"
      style={{ borderBottom: "1px solid #e2e9f4", boxShadow: "0 1px 6px rgba(45,85,160,0.07)" }}
    >
      <div className="max-w-3xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-3">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: "#2d55a0" }}
        >
          <span className="material-symbols-outlined text-white text-[16px]">badge</span>
        </div>
        <div className="flex flex-col justify-center leading-none">
          <img src={logo} alt="IEEPL" className="h-5 w-auto object-contain object-left" />
          <span className="text-[9px] font-semibold uppercase tracking-[0.12em] mt-0.5" style={{ color: "#6b7280" }}>
            Employee Verification
          </span>
        </div>
      </div>
    </header>
  );
}

function AppFooter() {
  return (
    <footer
      className="bg-white mt-8"
      style={{ borderTop: "1px solid #e2e9f4" }}
    >
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div
            className="w-5 h-5 rounded-md flex items-center justify-center"
            style={{ background: "#2d55a0" }}
          >
            <span className="material-symbols-outlined text-white text-[11px]">shield</span>
          </div>
          <span className="text-[11px] font-semibold" style={{ color: "#374151" }}>IEEPL</span>
        </div>
        <p className="text-[11px]" style={{ color: "#6b7280" }}>
          © {new Date().getFullYear()} IEEPL · Employee Management System
        </p>
        <p className="text-[11px]" style={{ color: "#6b7280" }}>
          Secured &amp; Encrypted
        </p>
      </div>
    </footer>
  );
}

function EmployeeAvatar({ employee }) {
  const [imgError, setImgError] = useState(false);
  const photoUrl = employee.employee_image || employee.avatar_url || null;
  const initials = (employee.name || "??")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  if (photoUrl && !imgError) {
    return (
      <div className="relative shrink-0">
        <img
          src={getImageUrl(photoUrl)}
          alt={employee.name}
          onError={() => setImgError(true)}
          className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover object-top border-4 border-white shadow-lg"
        />
        <div
          className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-white flex items-center justify-center"
          style={{ background: "#16a34a" }}
        >
          <span className="material-symbols-outlined text-white text-[12px]">verified</span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative shrink-0">
      <div
        className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl border-4 border-white shadow-lg flex items-center justify-center"
        style={{ background: "linear-gradient(135deg, #2d55a0, #285498)" }}
      >
        <span className="text-3xl font-bold text-white tracking-tight">{initials}</span>
      </div>
      <div
        className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-white flex items-center justify-center"
        style={{ background: "#16a34a" }}
      >
        <span className="material-symbols-outlined text-white text-[12px]">verified</span>
      </div>
    </div>
  );
}

function InfoRow({ icon, label, value, mono, color }) {
  if (!value) return null;
  return (
    <div
      className="flex items-center gap-3 py-3"
      style={{ borderBottom: "1px solid #f0f4fa" }}
    >
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
        style={{ background: "#f0f4fa" }}
      >
        <span className="material-symbols-outlined text-[16px]" style={{ color: "#2d55a0" }}>
          {icon}
        </span>
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10.5px] font-semibold uppercase tracking-[0.08em] mb-0.5" style={{ color: "#6b7280" }}>
          {label}
        </p>
        <p
          className={`text-[13px] font-semibold truncate ${mono ? "font-mono" : ""}`}
          style={{ color: color || "#111827" }}
        >
          {value}
        </p>
      </div>
    </div>
  );
}

function SectionCard({ title, icon, children }) {
  return (
    <div
      className="bg-white rounded-xl overflow-hidden"
      style={{ border: "1px solid #e2e9f4", boxShadow: "0 2px 8px rgba(45,85,160,0.06)" }}
    >
      <div
        className="px-4 py-2.5 flex items-center gap-2"
        style={{ borderBottom: "1px solid #e2e9f4", background: "#f8fafd" }}
      >
        <span className="material-symbols-outlined text-[15px]" style={{ color: "#2d55a0" }}>{icon}</span>
        <span className="text-[10.5px] font-semibold uppercase tracking-[0.1em]" style={{ color: "#374151" }}>
          {title}
        </span>
      </div>
      <div className="px-4 [&>*:last-child]:border-b-0">{children}</div>
    </div>
  );
}

// ── Loading ────────────────────────────────────────────────────────────────
function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "#f8fafd" }}>
      <div className="text-center space-y-3">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto"
          style={{ background: "#2d55a0" }}
        >
          <span
            className="material-symbols-outlined text-white text-[26px]"
            style={{ animation: "spin 1s linear infinite" }}
          >
            progress_activity
          </span>
        </div>
        <p className="text-[13px] font-medium" style={{ color: "#374151" }}>
          Verifying employee…
        </p>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    </div>
  );
}

// ── Error screen ──────────────────────────────────────────────────────────
function ErrorScreen({ error, employeeId }) {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#f8fafd" }}>
      <AppHeader />
      <div className="flex-1 flex items-center justify-center p-4">
        <div
          className="bg-white rounded-2xl p-8 text-center w-full max-w-sm"
          style={{ border: "1px solid #e2e9f4", boxShadow: "0 4px 20px rgba(45,85,160,0.08)" }}
        >
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: "#fef2f2" }}
          >
            <span className="material-symbols-outlined text-[28px]" style={{ color: "#dc2626" }}>
              person_off
            </span>
          </div>
          <h2 className="text-[17px] font-bold mb-2" style={{ color: "#111827" }}>
            Employee Not Found
          </h2>
          <p className="text-[13px] leading-relaxed mb-5" style={{ color: "#6b7280" }}>
            {error || "The ID could not be verified. Check the QR code and try again."}
          </p>
          {employeeId && (
            <div
              className="rounded-lg px-4 py-3 text-left mb-4"
              style={{ background: "#f8fafd", border: "1px solid #e2e9f4" }}
            >
              <p className="text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: "#6b7280" }}>
                Searched for
              </p>
              <p className="text-[13px] font-mono font-bold" style={{ color: "#111827" }}>
                {employeeId}
              </p>
            </div>
          )}
          <p className="text-[11px]" style={{ color: "#9ca3af" }}>
            Contact your administrator if this is unexpected.
          </p>
        </div>
      </div>
      <AppFooter />
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────
export default function PublicEmployeeView() {
  const { employeeId: paramId } = useParams();
  const [searchParams] = useSearchParams();
  const employeeId = paramId || searchParams.get("id");

  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!employeeId) {
      setError("No employee ID provided");
      setLoading(false);
      return;
    }
    getEmployeeByEmployeeId(employeeId)
      .then(setEmployee)
      .catch((err) => setError(err.message || "Employee not found"))
      .finally(() => setLoading(false));
  }, [employeeId]);

  if (loading) return <LoadingScreen />;
  if (error || !employee) return <ErrorScreen error={error} employeeId={employeeId} />;

  const isActive = (employee.status || "active") === "active";

  // Format joining date
  const joiningDate = employee.joining_date
    ? new Date(employee.joining_date).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#f8fafd" }}>
      <AppHeader />

      <main className="flex-1 w-full max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-4">

        {/* ── Hero card ── */}
        <div
          className="bg-white rounded-2xl overflow-hidden"
          style={{ border: "1px solid #e2e9f4", boxShadow: "0 4px 20px rgba(45,85,160,0.08)" }}
        >
          {/* Banner */}
          <div
            className="h-24 sm:h-32 relative"
            style={{ background: "linear-gradient(135deg, #285498 0%, #2d55a0 50%, #3b6fd4 100%)" }}
          >
            {/* Subtle dot pattern */}
            <div
              className="absolute inset-0 opacity-[0.08]"
              style={{
                backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)",
                backgroundSize: "24px 24px",
              }}
            />
            {/* Verified badge top-right */}
            <div className="absolute top-3 right-4 flex items-center gap-1.5 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1">
              <span className="material-symbols-outlined text-white text-[13px]">verified_user</span>
              <span className="text-[11px] font-semibold text-white">Verified</span>
            </div>
          </div>

          {/* Profile row */}
          <div className="px-5 pb-5">
            <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-12 sm:-mt-14 mb-4">
              <EmployeeAvatar employee={employee} />
              <div className="flex-1 min-w-0 pt-2 sm:pt-0 sm:pb-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold"
                    style={{
                      background: isActive ? "#dcfce7" : "#f3f4f6",
                      color: isActive ? "#15803d" : "#6b7280",
                      border: isActive ? "1px solid #bbf7d0" : "1px solid #e5e7eb",
                    }}
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ background: isActive ? "#16a34a" : "#9ca3af" }}
                    />
                    {isActive ? "Active" : employee.status || "Unknown"}
                  </span>
                  {employee.blood_group && (
                    <span
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold"
                      style={{ background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca" }}
                    >
                      <span className="material-symbols-outlined text-[12px]">bloodtype</span>
                      {employee.blood_group}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <h1 className="text-[22px] sm:text-[26px] font-bold leading-tight mb-1" style={{ color: "#111827" }}>
              {employee.name}
            </h1>

            {(employee.designation || employee.department) && (
              <p className="text-[13px] mb-2" style={{ color: "#374151" }}>
                {employee.designation}
                {employee.designation && employee.department && (
                  <span className="mx-2" style={{ color: "#c5d3e4" }}>·</span>
                )}
                {employee.department}
              </p>
            )}

            <span
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-mono font-bold"
              style={{ background: "#eef2fb", color: "#2d55a0", border: "1px solid #c5d3e4" }}
            >
              <span className="material-symbols-outlined text-[13px]">badge</span>
              {employee.employee_id}
            </span>
          </div>
        </div>

        {/* ── Verification strip ── */}
        <div
          className="flex items-center gap-3 rounded-xl px-4 py-3"
          style={{ background: "#f0fdf4", border: "1px solid #bbf7d0" }}
        >
          <span className="material-symbols-outlined text-[20px] shrink-0" style={{ color: "#16a34a" }}>
            verified_user
          </span>
          <p className="text-[13px] font-medium" style={{ color: "#15803d" }}>
            Identity verified — confirmed employee of IEEPL
          </p>
        </div>

        {/* ── Detail cards grid ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

          {/* Work */}
          <SectionCard title="Work" icon="work">
            <InfoRow icon="engineering" label="Designation" value={employee.designation} />
            <InfoRow icon="corporate_fare" label="Department" value={employee.department} />
            <InfoRow icon="location_on" label="Location" value={employee.location} />
            {joiningDate && (
              <InfoRow icon="calendar_today" label="Joining Date" value={joiningDate} />
            )}
          </SectionCard>

          {/* Identity */}
          <SectionCard title="Identity" icon="fingerprint">
            <InfoRow icon="badge" label="Employee ID" value={employee.employee_id} mono color="#2d55a0" />
            {employee.gender && (
              <InfoRow icon="person" label="Gender" value={employee.gender} />
            )}
            {employee.blood_group && (
              <InfoRow icon="bloodtype" label="Blood Group" value={employee.blood_group} color="#dc2626" />
            )}
          </SectionCard>

          {/* Contact — full width */}
          <div className="sm:col-span-2">
            <SectionCard title="Contact" icon="contacts">
              <div className="grid grid-cols-1 sm:grid-cols-2 sm:divide-x" style={{ borderColor: "#f0f4fa" }}>
                <div className="sm:pr-4">
                  <InfoRow icon="mail" label="Email" value={employee.email} />
                </div>
                <div className="sm:pl-4">
                  <InfoRow icon="phone" label="Phone" value={employee.contact_number} />
                </div>
              </div>
            </SectionCard>
          </div>

        </div>

        {/* ── Disclaimer ── */}
        <div
          className="flex items-start gap-2.5 rounded-xl px-4 py-3"
          style={{ background: "#fffbeb", border: "1px solid #fde68a" }}
        >
          <span className="material-symbols-outlined text-[16px] mt-0.5 shrink-0" style={{ color: "#d97706" }}>
            info
          </span>
          <p className="text-[11.5px] leading-relaxed" style={{ color: "#92400e" }}>
            For verification purposes only. Do not share or distribute this information beyond its intended use.
          </p>
        </div>

      </main>

      <AppFooter />
    </div>
  );
}