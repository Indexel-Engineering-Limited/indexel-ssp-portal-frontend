import React from "react";

/**
 * EmployeeCard - Redesigned professional ID card
 * Props:
 *   employee   — employee data object (see shape below)
 *   variant    — "dark" (default) | "light"
 *   showQR     — boolean (default true)
 *   className  — extra class on the wrapper
 *
 * employee shape:
 * {
 *   name:            string
 *   designation:     string
 *   employee_id:     string
 *   employee_image:  string | null   (URL or relative path)
 *   qr_image:        string | null
 *   email:           string
 *   contact_number:  string
 *   department:      string
 *   location:        string
 *   blood_group:     string
 *   status:          "active" | "inactive"
 *   valid_until:     string   e.g. "Dec 2026"
 * }
 */
const EmployeeCard = ({
  employee = {},
  variant = "dark",
  showQR = true,
  className = "",
}) => {
  const isDark = variant === "dark";

  /* ── helpers ── */
  const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith("http://") || path.startsWith("https://")) return path;
    const base = import.meta?.env?.VITE_API_URL ?? "http://localhost:3000";
    return `${base}${path}`;
  };

  const initials = (name = "") =>
    name
      .split(" ")
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase() ?? "")
      .join("");

  /* ── inline style tokens ── */
  const tokens = isDark
    ? {
        card: {
          background: "#2d55a0",
          border: "0.5px solid #334155",
        },
        topBar: { background: "#223b64", borderBottom: "1px solid #334155" },
        companyName: { color: "#f1f5f9" },
        companySub: { color: "#64748b" },
        body: { background: "#21386e" },
        photoInner: { background: "#1e293b" },
        photoInitials: { color: "#94a3b8" },
        statusDotBorder: "#0f172a",
        empName: { color: "#f8fafc" },
        empTitle: { color: "#94a3b8" },
        idChip: { background: "#1e293b", border: "0.5px solid #334155" },
        idLabel: { color: "#475569" },
        idVal: { color: "#3b82f6" },
        divider: { background: "#1e293b" },
        infoLabel: { color: "#475569" },
        infoVal: { color: "#cbd5e1" },
        bloodChip: { background: "#450a0a", border: "0.5px solid #7f1d1d" },
        bloodVal: { color: "#fca5a5" },
        bottomBar: {
          background: "#1e293b",
          borderTop: "0.5px solid #334155",
        },
        qrBox: { background: "#ffffff" },
        qrFill: "#0f172a",
        validLabel: { color: "#475569" },
        validVal: { color: "#f8fafc" },
        stripe:
          "linear-gradient(90deg, #3b82f6 0%, #8b5cf6 50%, #ec4899 100%)",
      }
    : {
        card: {
          background: "#ffffff",
          border: "0.5px solid #e2e8f0",
        },
        topBar: { background: "#0f172a" },
        companyName: { color: "#f8fafc" },
        companySub: { color: "#64748b" },
        body: { background: "#ffffff" },
        photoInner: { background: "#f1f5f9" },
        photoInitials: { color: "#475569" },
        statusDotBorder: "#ffffff",
        empName: { color: "#0f172a" },
        empTitle: { color: "#64748b" },
        idChip: { background: "#eff6ff", border: "0.5px solid #bfdbfe" },
        idLabel: { color: "#60a5fa" },
        idVal: { color: "#1d4ed8" },
        divider: { background: "#e2e8f0" },
        infoLabel: { color: "#94a3b8" },
        infoVal: { color: "#334155" },
        bloodChip: { background: "#fef2f2", border: "0.5px solid #fecaca" },
        bloodVal: { color: "#dc2626" },
        bottomBar: {
          background: "#f8fafc",
          borderTop: "0.5px solid #e2e8f0",
        },
        qrBox: { background: "#0f172a" },
        qrFill: "#ffffff",
        validLabel: { color: "#94a3b8" },
        validVal: { color: "#0f172a" },
        stripe:
          "linear-gradient(90deg, #0ea5e9 0%, #6366f1 50%, #f59e0b 100%)",
      };

  const photoRingGradient = isDark
    ? "linear-gradient(135deg, #3b82f6, #8b5cf6)"
    : "linear-gradient(135deg, #0ea5e9, #6366f1)";

  const logoGradient = "linear-gradient(135deg, #3b82f6, #6366f1)";

  /* ── QR placeholder SVG ── */
  const QrPlaceholder = ({ fill }) => (
    <svg
      viewBox="0 0 40 40"
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: 40, height: 40 }}
    >
      <rect x="2" y="2" width="14" height="14" rx="2" fill="none" stroke={fill} strokeWidth="2" />
      <rect x="5" y="5" width="8" height="8" fill={fill} />
      <rect x="24" y="2" width="14" height="14" rx="2" fill="none" stroke={fill} strokeWidth="2" />
      <rect x="27" y="5" width="8" height="8" fill={fill} />
      <rect x="2" y="24" width="14" height="14" rx="2" fill="none" stroke={fill} strokeWidth="2" />
      <rect x="5" y="27" width="8" height="8" fill={fill} />
      <rect x="24" y="24" width="4" height="4" fill={fill} />
      <rect x="30" y="24" width="4" height="4" fill={fill} />
      <rect x="24" y="30" width="4" height="4" fill={fill} />
      <rect x="30" y="30" width="4" height="4" fill={fill} />
      <rect x="20" y="18" width="2" height="2" fill={fill} />
      <rect x="18" y="20" width="2" height="2" fill={fill} />
      <rect x="22" y="22" width="2" height="2" fill={fill} />
    </svg>
  );

  const isActive = !employee.status || employee.status === "active";

  return (
    <div
      className={className}
      style={{
        width: 320,
        borderRadius: 20,
        overflow: "hidden",
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        boxShadow: isDark
          ? "0 24px 48px rgba(0,0,0,0.45)"
          : "0 12px 32px rgba(0,0,0,0.12)",
        ...tokens.card,
      }}
    >
      {/* ── Top bar ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "14px 20px",
          ...tokens.topBar,
        }}
      >
        {/* Logo + company name */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: logoGradient,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontWeight: 700,
              fontSize: 13,
              letterSpacing: 0.5,
              flexShrink: 0,
            }}
          >
            IE
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 500, ...tokens.companyName }}>
              IEEPL
            </div>
            <div
              style={{
                fontSize: 10,
                letterSpacing: 1,
                textTransform: "uppercase",
                marginTop: 1,
                ...tokens.companySub,
              }}
            >
              Engineering
            </div>
          </div>
        </div>

        {/* Badge */}
        <div
          style={{
            background: "#1d4ed8",
            color: "#bfdbfe",
            fontSize: 9,
            letterSpacing: 1.5,
            textTransform: "uppercase",
            padding: "4px 10px",
            borderRadius: 20,
            fontWeight: 500,
          }}
        >
          Employee
        </div>
      </div>

      {/* ── Accent stripe ── */}
      <div style={{ height: 3, background: tokens.stripe }} />

      {/* ── Body ── */}
      <div style={{ padding: "24px 20px 20px", ...tokens.body }}>
        {/* Photo + name row */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 16,
            marginBottom: 20,
          }}
        >
          {/* Photo */}
          <div style={{ position: "relative", flexShrink: 0 }}>
            <div
              style={{
                width: 72,
                height: 72,
                borderRadius: 16,
                background: photoRingGradient,
                padding: 2,
              }}
            >
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  borderRadius: 14,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                  ...tokens.photoInner,
                }}
              >
                {employee.employee_image ? (
                  <img
                    src={getImageUrl(employee.employee_image)}
                    alt={employee.name}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                ) : (
                  <span
                    style={{
                      fontSize: 22,
                      fontWeight: 500,
                      ...tokens.photoInitials,
                    }}
                  >
                    {initials(employee.name)}
                  </span>
                )}
              </div>
            </div>

            {/* Status dot */}
            <div
              style={{
                position: "absolute",
                bottom: -3,
                right: -3,
                width: 14,
                height: 14,
                borderRadius: "50%",
                background: isActive ? "#22c55e" : "#94a3b8",
                border: `2px solid ${tokens.statusDotBorder}`,
              }}
            />
          </div>

          {/* Name block */}
          <div style={{ flex: 1, paddingTop: 4 }}>
            <div style={{ fontSize: 17, fontWeight: 500, lineHeight: 1.2, marginBottom: 4, ...tokens.empName }}>
              {employee.name || "Employee Name"}
            </div>
            <div style={{ fontSize: 12, marginBottom: 8, ...tokens.empTitle }}>
              {employee.designation || "Designation"}
            </div>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "4px 10px",
                borderRadius: 6,
                ...tokens.idChip,
              }}
            >
              <span style={{ fontSize: 10, letterSpacing: 0.5, ...tokens.idLabel }}>ID</span>
              <span style={{ fontSize: 11, fontWeight: 500, letterSpacing: 1, ...tokens.idVal }}>
                {employee.employee_id || "IEEPL-0000"}
              </span>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: 0.5, marginBottom: 16, ...tokens.divider }} />

        {/* Info grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 12,
            marginBottom: 20,
          }}
        >
          {employee.department && (
            <div>
              <div style={{ fontSize: 10, letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 3, ...tokens.infoLabel }}>
                Department
              </div>
              <div style={{ fontSize: 12, ...tokens.infoVal }}>{employee.department}</div>
            </div>
          )}

          {employee.location && (
            <div>
              <div style={{ fontSize: 10, letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 3, ...tokens.infoLabel }}>
                Location
              </div>
              <div style={{ fontSize: 12, ...tokens.infoVal }}>{employee.location}</div>
            </div>
          )}

          {employee.email && (
            <div style={{ gridColumn: "1 / -1" }}>
              <div style={{ fontSize: 10, letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 3, ...tokens.infoLabel }}>
                Email
              </div>
              <div
                style={{
                  fontSize: 12,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  ...tokens.infoVal,
                }}
              >
                {employee.email}
              </div>
            </div>
          )}

          {employee.contact_number && (
            <div>
              <div style={{ fontSize: 10, letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 3, ...tokens.infoLabel }}>
                Phone
              </div>
              <div style={{ fontSize: 12, ...tokens.infoVal }}>{employee.contact_number}</div>
            </div>
          )}

          {employee.blood_group && (
            <div style={{ display: "flex", alignItems: "flex-end" }}>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                  padding: "4px 10px",
                  borderRadius: 20,
                  ...tokens.bloodChip,
                }}
              >
                <div
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: isDark ? "#ef4444" : "#dc2626",
                  }}
                />
                <span style={{ fontSize: 11, fontWeight: 500, ...tokens.bloodVal }}>
                  {employee.blood_group}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Footer ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "14px 20px",
          ...tokens.bottomBar,
        }}
      >
        {/* QR code */}
        {showQR && (
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 8,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              ...tokens.qrBox,
            }}
          >
            {employee.qr_image ? (
              <img
                src={getImageUrl(employee.qr_image)}
                alt="QR code"
                style={{ width: 40, height: 40, objectFit: "contain" }}
              />
            ) : (
              <QrPlaceholder fill={tokens.qrFill} />
            )}
          </div>
        )}

        {/* Validity */}
        <div>
          <div style={{ fontSize: 10, letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 2, ...tokens.validLabel }}>
            Valid until
          </div>
          <div style={{ fontSize: 12, fontWeight: 500, ...tokens.validVal }}>
            {employee.valid_until || "Dec 2026"}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeCard;

/* ─────────────────────────────────────────────
   USAGE EXAMPLE
   ─────────────────────────────────────────────

import EmployeeCard from "./EmployeeCard";

const employee = {
  name:           "Ravi Prakash",
  designation:    "Senior Engineer",
  employee_id:    "IEEPL-2247",
  employee_image: null,           // or "/uploads/ravi.jpg" or full URL
  qr_image:       null,           // or "/uploads/qr-2247.png"
  email:          "ravi.prakash@ieepl.com",
  contact_number: "+91 98765 43210",
  department:     "Electrical",
  location:       "Mumbai, IN",
  blood_group:    "B+",
  status:         "active",
  valid_until:    "Dec 2026",
};

// Dark variant (default)
<EmployeeCard employee={employee} />

// Light variant
<EmployeeCard employee={employee} variant="light" />

// Without QR
<EmployeeCard employee={employee} showQR={false} />

───────────────────────────────────────────── */