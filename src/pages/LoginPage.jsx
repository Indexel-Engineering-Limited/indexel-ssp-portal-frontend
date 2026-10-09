import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { login, getPermissions } from "../services/authService";
import logo from "../assets/login-logo.png";
import sspLogo from "../assets/ssp-logo.png";

/* ── Orbit data: the modules people actually sign in to use ── */
const ICONS = {
  dashboard: "M3 3h7v9H3z M14 3h7v5h-7z M14 12h7v9h-7z M3 16h7v5H3z",
  companies: "M3 21h18 M5 21V7l7-4 7 4v14 M9 9h.01 M9 13h.01 M9 17h.01 M15 9h.01 M15 13h.01 M15 17h.01",
  contacts: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8 M23 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75",
  emails: "M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z M22 6l-10 7L2 6",
  upload: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4 M17 8l-5-5-5 5 M12 3v12",
  hr: "M2 7h20v14H2z M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16",
  logs: "M8 6h13 M8 12h13 M8 18h13 M3 6h.01 M3 12h.01 M3 18h.01",
};

const RING_INNER = [
  { label: "Companies", icon: "companies", angle: 200 },
  { label: "Contacts", icon: "contacts", angle: 320 },
  { label: "Emails", icon: "emails", angle: 80 },
];

const RING_OUTER = [
  { label: "Dashboard", icon: "dashboard", angle: 250 },
  { label: "Bulk upload", icon: "upload", angle: 345 },
  { label: "HR management", icon: "hr", angle: 60 },
  { label: "User logs", icon: "logs", angle: 150 },
];

function Icon({ name, size = 16 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={ICONS[name]} />
    </svg>
  );
}

function Chip({ item, accent }) {
  // Place each chip on its ring using percentages so the stage scales fluidly
  const rad = (item.angle * Math.PI) / 180;
  const left = 50 + 50 * Math.cos(rad);
  const top = 50 + 50 * Math.sin(rad);
  return (
    <div className="lp-chip" style={{ left: `${left}%`, top: `${top}%` }}>
      <div className="lp-chip-counter">
        <div className={`lp-chip-body ${accent ? "is-accent" : ""}`}>
          <Icon name={item.icon} size={14} />
          <span>{item.label}</span>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ user_name: "", password: "", remember: false });
  const [error, setError] = useState(null);
  const [errorKey, setErrorKey] = useState(0); // re-triggers the shake on every new error
  const [submitting, setSubmitting] = useState(false);
  const [capsOn, setCapsOn] = useState(false);

  function fail(message) {
    setError(message);
    setErrorKey((k) => k + 1);
  }

  async function handleSubmit(e) {
    e.preventDefault();

    setError(null);

    if (!form.user_name || !form.password) {
      fail(!form.user_name ? "Enter your username or email." : "Enter your password.");
      return;
    }

    setSubmitting(true);

    try {
      // Login stores the session + permissions in localStorage
      await login(form);

      // Get permissions from the newly stored session
      const permissions = getPermissions();

      // Map module_key to application routes
      const ROUTE_MAP = {
        dashboard: "/dashboard",
        company_list: "/companies",
        contacts: "/contacts",
        email_list: "/emails",
        bulk_upload: "/bulk-upload",
        user_access: "/user-access",
        user_logs: "/user-logs",
        users: "/users",
        employee_list: "/hr-management",
      };

      // Find the first module for which the user has read access
      const firstAccessibleRoute = permissions
        .filter((permission) => Boolean(permission.can_read))
        .map((permission) => ROUTE_MAP[permission.module_key])
        .find(Boolean);

      // If user was trying to access a specific protected page,
      // send them there instead of the first permitted page.
      const requestedPath = location.state?.from?.pathname;

      let redirectPath = firstAccessibleRoute;

      if (requestedPath) {
        const requestedPermission = Object.entries(ROUTE_MAP).find(
          ([, route]) => route === requestedPath
        );

        if (
          requestedPermission &&
          permissions.some(
            (permission) =>
              permission.module_key === requestedPermission[0] &&
              Boolean(permission.can_read)
          )
        ) {
          redirectPath = requestedPath;
        }
      }

      if (!redirectPath) {
        fail("You do not have access to any module.");
        return;
      }

      navigate(redirectPath, { replace: true });
    } catch (err) {
      fail(err.message || "Invalid credentials. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700&family=Sora:wght@600;700;800&display=swap');

        .lp-root, .lp-root *, .lp-root *::before, .lp-root *::after { box-sizing: border-box; }
        .lp-root button, .lp-root input { font-family: inherit; }

        .lp-root {
          --navy-900: #081a38;
          --navy-800: #0d2650;
          --brand: #285498;
          --brand-bright: #3b82f6;
          --sky: #38bdf8;
          --amber: #fbbf24;
          --ink: #0f1c36;
          --muted: #64748b;
          --line: #dbe3ef;
          --surface: #f6f8fc;
          position: fixed;
          inset: 0;
          height: 100vh;
          height: 100dvh;
          width: 100%;
          overflow: hidden;
          display: flex;
          font-family: 'Manrope', system-ui, sans-serif;
          background: #fff;
          color: var(--ink);
        }

        /* ─────────── LEFT: brand stage ─────────── */
        .lp-left {
          flex: 1;
          position: relative;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: clamp(64px, 10vh, 96px) 40px clamp(56px, 9vh, 88px);
          background:
            radial-gradient(120% 90% at 15% 0%, #1b4a93 0%, transparent 55%),
            linear-gradient(160deg, var(--navy-800) 0%, var(--navy-900) 100%);
        }

        .lp-blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(70px);
          opacity: 0.55;
          will-change: transform;
        }
        .lp-blob.b1 { width: 380px; height: 380px; background: #2f6fe0; top: -120px; left: -90px; animation: drift1 18s ease-in-out infinite alternate; }
        .lp-blob.b2 { width: 320px; height: 320px; background: #0ea5c6; bottom: -110px; right: -60px; opacity: 0.4; animation: drift2 22s ease-in-out infinite alternate; }
        .lp-blob.b3 { width: 200px; height: 200px; background: var(--amber); top: 55%; left: 62%; opacity: 0.14; animation: drift3 16s ease-in-out infinite alternate; }

        @keyframes drift1 { to { transform: translate(90px, 70px) scale(1.15); } }
        @keyframes drift2 { to { transform: translate(-80px, -60px) scale(1.2); } }
        @keyframes drift3 { to { transform: translate(-60px, 50px) scale(0.8); } }

        .lp-grid {
          position: absolute;
          inset: 0;
          background-image: radial-gradient(rgba(255,255,255,0.22) 1px, transparent 1px);
          background-size: 26px 26px;
          -webkit-mask-image: radial-gradient(60% 60% at 50% 50%, #000 20%, transparent 100%);
          mask-image: radial-gradient(60% 60% at 50% 50%, #000 20%, transparent 100%);
        }

        .lp-left-top {
          position: absolute;
          top: 30px;
          left: 36px;
          z-index: 5;
        }
        .lp-left-top img { height: 42px; width: auto; max-width: 220px; object-fit: contain; display: block; }

        .lp-pitch {
          position: relative;
          z-index: 3;
          text-align: center;
          max-width: 420px;
          margin-bottom: clamp(4px, 1.5vh, 14px);
        }
        .lp-pitch h2 {
          font-family: 'Sora', sans-serif;
          font-size: clamp(24px, 2.6vw, 34px);
          font-weight: 700;
          line-height: 1.2;
          letter-spacing: -0.02em;
          color: #fff;
          margin: 0 0 10px;
        }
        .lp-pitch p {
          font-size: 14px;
          line-height: 1.6;
          color: rgba(255,255,255,0.68);
          margin: 0;
        }

        /* Orbit stage — the one memorable element */
        .lp-stage {
          position: relative;
          z-index: 2;
          width: min(440px, 100%, 46vh);
          aspect-ratio: 1;
          margin-top: 6px;
          flex-shrink: 0;
        }

        .lp-ring {
          position: absolute;
          top: 50%;
          left: 50%;
          border-radius: 50%;
          border: 1.5px dashed rgba(255,255,255,0.22);
          transform: translate(-50%, -50%);
        }
        .lp-ring.inner { width: 54%; height: 54%; }
        .lp-ring.outer { width: 94%; height: 94%; border-color: rgba(255,255,255,0.14); }

        .lp-spin { position: absolute; inset: 0; border-radius: 50%; }
        .lp-ring.inner .lp-spin { animation: spin-cw 34s linear infinite; }
        .lp-ring.outer .lp-spin { animation: spin-ccw 52s linear infinite; }

        @keyframes spin-cw  { to { transform: rotate(360deg); } }
        @keyframes spin-ccw { to { transform: rotate(-360deg); } }

        /* A bright comet that travels the inner ring */
        .lp-comet {
          position: absolute;
          top: 0; left: 50%;
          width: 9px; height: 9px;
          margin: -4.5px 0 0 -4.5px;
          border-radius: 50%;
          background: var(--amber);
          box-shadow: 0 0 0 4px rgba(251,191,36,0.18), 0 0 18px 4px rgba(251,191,36,0.7);
        }

        .lp-chip { position: absolute; width: 0; height: 0; }
        .lp-chip-counter { width: 0; height: 0; }
        .lp-ring.inner .lp-chip-counter { animation: spin-ccw 34s linear infinite; }
        .lp-ring.outer .lp-chip-counter { animation: spin-cw 52s linear infinite; }

        .lp-chip-body {
          position: absolute;
          transform: translate(-50%, -50%);
          display: flex;
          align-items: center;
          gap: 7px;
          white-space: nowrap;
          padding: 8px 13px 8px 10px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 600;
          color: #fff;
          background: rgba(255,255,255,0.12);
          border: 1px solid rgba(255,255,255,0.28);
          -webkit-backdrop-filter: blur(10px);
          backdrop-filter: blur(10px);
          box-shadow: 0 8px 24px rgba(3,10,30,0.28);
        }
        .lp-chip-body svg { color: var(--sky); flex-shrink: 0; }
        .lp-chip-body.is-accent svg { color: var(--amber); }

        /* Core */
        .lp-core {
          position: absolute;
          top: 50%; left: 50%;
          width: 104px; height: 104px;
          transform: translate(-50%, -50%);
          display: flex; align-items: center; justify-content: center;
        }
        .lp-core::before, .lp-core::after {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: 50%;
          border: 1.5px solid rgba(56,189,248,0.6);
          animation: ripple 3.6s ease-out infinite;
        }
        .lp-core::after { animation-delay: 1.8s; }
        @keyframes ripple {
          0%   { transform: scale(0.9); opacity: 0.9; }
          100% { transform: scale(2.1); opacity: 0; }
        }
        .lp-core-disc {
          position: relative;
          width: 84px; height: 84px;
          border-radius: 26px;
          display: flex; align-items: center; justify-content: center;
          background: linear-gradient(145deg, #ffffff 0%, #dbeafe 100%);
          color: var(--brand);
          box-shadow: 0 0 0 8px rgba(255,255,255,0.1), 0 18px 44px rgba(2,8,24,0.5), 0 0 60px rgba(56,189,248,0.35);
          transform: rotate(-8deg);
        }
        .lp-core-disc svg { transform: rotate(8deg); }

        .lp-trust {
          position: absolute;
          bottom: 26px;
          left: 0; right: 0;
          z-index: 3;
          display: flex;
          justify-content: center;
          gap: 18px;
          flex-wrap: wrap;
          padding: 0 24px;
          font-size: 11.5px;
          font-weight: 600;
          color: rgba(255,255,255,0.6);
        }
        .lp-trust span { display: inline-flex; align-items: center; gap: 6px; }
        .lp-trust svg { color: #4ade80; }

        /* ─────────── RIGHT: form ─────────── */
        .lp-right {
          width: 44%;
          min-width: 420px;
          flex-shrink: 0;
          position: relative;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: clamp(12px, 3vh, 48px) clamp(32px, 5vw, 72px);
          overflow: hidden;
          background:
            radial-gradient(60% 40% at 100% 0%, rgba(59,130,246,0.09), transparent 70%),
            #fff;
        }
        .lp-right::before {
          content: "";
          position: absolute;
          left: 0; top: 0; bottom: 0;
          width: 3px;
          background: linear-gradient(180deg, var(--brand-bright), var(--sky) 50%, var(--amber));
        }

        .lp-form-wrap { width: 100%; max-width: 400px; margin: 0 auto; }

        .lp-brand { display: flex; align-items: center; gap: 12px; margin-bottom: clamp(14px, 3.4vh, 34px); }
        .lp-brand-mark {
          width: 46px; height: 46px;
          border-radius: 13px;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
          background: linear-gradient(135deg, var(--brand), var(--brand-bright));
          box-shadow: 0 8px 20px rgba(40,84,152,0.3);
        }
        .lp-brand-text { display: flex; flex-direction: column; gap: 3px; min-width: 0; }
        .lp-brand-logo { width: 140px; height: 28px; }
        .lp-brand-logo img { width: 100%; height: 100%; object-fit: contain; object-position: left center; display: block; }
        .lp-brand-sub { font-size: 11px; font-weight: 600; color: var(--brand); letter-spacing: 0.02em; }

        .lp-status {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 5px 12px 5px 10px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 600;
          color: #166534;
          background: #ecfdf3;
          border: 1px solid #bbf7d0;
          margin-bottom: clamp(10px, 2.2vh, 18px);
        }
        .lp-dot { position: relative; width: 8px; height: 8px; border-radius: 50%; background: #22c55e; }
        .lp-dot::after {
          content: ""; position: absolute; inset: 0; border-radius: 50%;
          background: #22c55e; animation: dot-pulse 2s ease-out infinite;
        }
        @keyframes dot-pulse { 0% { transform: scale(1); opacity: 0.7; } 100% { transform: scale(3); opacity: 0; } }

        .lp-heading {
          font-family: 'Sora', sans-serif;
          font-size: 32px;
          font-weight: 700;
          letter-spacing: -0.03em;
          line-height: 1.15;
          margin: 0 0 8px;
          color: var(--ink);
        }
        .lp-desc { font-size: 14px; color: var(--muted); line-height: 1.55; margin: 0 0 clamp(14px, 3vh, 28px); }

        /* Floating-label fields */
        .lp-field { position: relative; margin-bottom: clamp(10px, 1.8vh, 14px); }

        .lp-input {
          width: 100%;
          height: clamp(52px, 7vh, 58px);
          padding: 20px 46px 6px 48px;
          font-size: 14.5px;
          font-weight: 500;
          color: var(--ink);
          background: var(--surface);
          border: 1.5px solid var(--line);
          border-radius: 14px;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
        }
        .lp-input:hover { border-color: #b8c6dc; }
        .lp-input:focus {
          background: #fff;
          border-color: var(--brand-bright);
          box-shadow: 0 0 0 4px rgba(59,130,246,0.14);
        }

        .lp-label {
          position: absolute;
          left: 48px;
          top: 50%;
          transform: translateY(-50%);
          font-size: 14px;
          font-weight: 500;
          color: #8a97ad;
          pointer-events: none;
          transition: top 0.18s ease, font-size 0.18s ease, color 0.18s ease;
        }
        .lp-input:focus + .lp-label,
        .lp-input:not(:placeholder-shown) + .lp-label {
          top: 17px;
          font-size: 11px;
          font-weight: 700;
          color: var(--brand);
        }

        .lp-icon {
          position: absolute;
          left: 16px;
          top: 50%;
          transform: translateY(-50%);
          display: flex;
          color: #9aa7bd;
          pointer-events: none;
          transition: color 0.2s;
        }
        .lp-field:focus-within .lp-icon { color: var(--brand-bright); }

        .lp-eye {
          position: absolute;
          right: 8px;
          top: 50%;
          transform: translateY(-50%);
          width: 38px; height: 38px;
          display: flex; align-items: center; justify-content: center;
          background: none;
          border: none;
          border-radius: 10px;
          color: #9aa7bd;
          cursor: pointer;
          transition: color 0.2s, background 0.2s;
        }
        .lp-eye:hover { color: var(--brand); background: rgba(40,84,152,0.08); }

        .lp-caps {
          display: flex; align-items: center; gap: 6px;
          margin: -6px 0 10px 4px;
          font-size: 12px; font-weight: 600; color: #b45309;
        }

        .lp-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin: 4px 0 clamp(14px, 2.6vh, 22px);
        }

        .lp-check { display: inline-flex; align-items: center; gap: 9px; cursor: pointer; user-select: none; font-size: 13px; font-weight: 500; color: #475569; }
        .lp-check input { position: absolute; opacity: 0; width: 0; height: 0; }
        .lp-box {
          width: 18px; height: 18px;
          border-radius: 6px;
          border: 1.5px solid #b8c6dc;
          background: #fff;
          display: flex; align-items: center; justify-content: center;
          transition: background 0.18s, border-color 0.18s, transform 0.18s;
        }
        .lp-box svg { opacity: 0; transform: scale(0.5); transition: opacity 0.18s, transform 0.18s; color: #fff; }
        .lp-check input:checked + .lp-box { background: var(--brand); border-color: var(--brand); }
        .lp-check input:checked + .lp-box svg { opacity: 1; transform: scale(1); }
        .lp-check input:focus-visible + .lp-box { outline: 3px solid rgba(59,130,246,0.4); outline-offset: 2px; }

        .lp-link {
          background: none; border: none; padding: 2px 0; cursor: pointer;
          font-size: 13px; font-weight: 600; color: var(--brand);
          border-radius: 4px;
        }
        .lp-link:hover { text-decoration: underline; text-underline-offset: 3px; }

        .lp-error {
          display: flex; align-items: flex-start; gap: 9px;
          padding: 11px 14px;
          margin-bottom: 16px;
          border-radius: 12px;
          background: #fef2f2;
          border: 1.5px solid #fecaca;
          font-size: 13px; line-height: 1.45; font-weight: 500; color: #b91c1c;
          animation: shake 0.45s cubic-bezier(.36,.07,.19,.97);
        }
        .lp-error svg { flex-shrink: 0; margin-top: 2px; }
        @keyframes shake {
          10%, 90% { transform: translateX(-1px); }
          20%, 80% { transform: translateX(3px); }
          30%, 50%, 70% { transform: translateX(-5px); }
          40%, 60% { transform: translateX(5px); }
        }

        .lp-btn {
          position: relative;
          overflow: hidden;
          width: 100%;
          height: clamp(46px, 6.4vh, 52px);
          display: flex; align-items: center; justify-content: center; gap: 10px;
          border: none;
          border-radius: 14px;
          font-size: 15px;
          font-weight: 700;
          letter-spacing: -0.005em;
          color: #fff;
          cursor: pointer;
          background: linear-gradient(120deg, var(--brand) 0%, var(--brand-bright) 100%);
          box-shadow: 0 10px 26px rgba(40,84,152,0.34);
          transition: transform 0.15s, box-shadow 0.2s, filter 0.2s;
        }
        .lp-btn::after {
          content: "";
          position: absolute;
          top: 0; bottom: 0; left: -60%;
          width: 40%;
          background: linear-gradient(100deg, transparent, rgba(255,255,255,0.35), transparent);
          transform: skewX(-20deg);
        }
        .lp-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 14px 32px rgba(40,84,152,0.42); }
        .lp-btn:hover:not(:disabled)::after { left: 130%; transition: left 0.7s ease; }
        .lp-btn:active:not(:disabled) { transform: translateY(0); }
        .lp-btn:disabled { opacity: 0.7; cursor: not-allowed; }
        .lp-btn:focus-visible, .lp-link:focus-visible, .lp-eye:focus-visible { outline: 3px solid rgba(59,130,246,0.45); outline-offset: 3px; }
        .lp-btn .lp-arrow { transition: transform 0.2s; }
        .lp-btn:hover:not(:disabled) .lp-arrow { transform: translateX(4px); }

        .lp-spinner {
          width: 17px; height: 17px;
          border: 2.5px solid rgba(255,255,255,0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin-cw 0.7s linear infinite;
        }

        .lp-security {
          display: flex; align-items: center; justify-content: center; gap: 6px;
          margin-top: clamp(12px, 2.4vh, 22px);
          font-size: 12px; font-weight: 500; color: #94a3b8;
        }
        .lp-security svg { color: #22c55e; }

        /* ─────────── Responsive ─────────── */
        @media (max-width: 960px) {
          .lp-left { display: none; }
          .lp-right { width: 100%; min-width: 0; padding: 40px 24px; }
          .lp-right::before { width: 100%; height: 4px; bottom: auto; background: linear-gradient(90deg, var(--brand-bright), var(--sky) 50%, var(--amber)); }
        }

        @media (max-height: 760px) {
          .lp-status { display: none; }
          .lp-heading { font-size: 26px; }
        }
        @media (max-height: 640px) {
          .lp-security { display: none; }
          .lp-desc { display: none; }
        }
        @media (max-height: 700px) {
          .lp-pitch p, .lp-trust { display: none; }
        }

        @media (prefers-reduced-motion: reduce) {
          .lp-root *, .lp-root *::before, .lp-root *::after {
            animation-duration: 0.001ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.001ms !important;
          }
        }
      `}</style>

      <div className="lp-root">
        {/* ── LEFT: BRAND STAGE ── */}
        <div className="lp-left" aria-hidden="true">
          <div className="lp-blob b1" />
          <div className="lp-blob b2" />
          <div className="lp-blob b3" />
          <div className="lp-grid" />

          <div className="lp-left-top">
            <img src={sspLogo} alt="" />
          </div>

          <div className="lp-pitch">
            <h2>Every workspace tool, one sign-in</h2>
            <p>Companies, contacts, emails and HR in one portal, shown to you based on your access.</p>
          </div>

          <div className="lp-stage">
            <div className="lp-ring outer">
              <div className="lp-spin">
                {RING_OUTER.map((item) => (
                  <Chip key={item.label} item={item} />
                ))}
              </div>
            </div>

            <div className="lp-ring inner">
              <div className="lp-spin">
                <div className="lp-comet" />
                {RING_INNER.map((item) => (
                  <Chip key={item.label} item={item} accent />
                ))}
              </div>
            </div>

            <div className="lp-core">
              <div className="lp-core-disc">
                <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2L4 6v6c0 5 3.4 9.4 8 10 4.6-.6 8-5 8-10V6l-8-4z" />
                  <path d="M8.5 12.2l2.5 2.5 4.5-5" />
                </svg>
              </div>
            </div>
          </div>

          <div className="lp-trust">
            {["ISO 27001", "SOC 2 Type II", "GDPR"].map((t) => (
              <span key={t}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12.5l4.5 4.5L19 7.5" />
                </svg>
                {t}
              </span>
            ))}
          </div>
        </div>

        {/* ── RIGHT: FORM ── */}
        <div className="lp-right">
          <div className="lp-form-wrap">
            <div className="lp-brand">
              <div className="lp-brand-mark">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L20 7V17L12 22L4 17V7L12 2Z" fill="white" fillOpacity="0.92" />
                  <path d="M12 6L17 9V15L12 18L7 15V9L12 6Z" fill="#285498" fillOpacity="0.35" />
                </svg>
              </div>
              <div className="lp-brand-text">
                <div className="lp-brand-logo">
                  <img src={logo} alt="Self Service Portal" />
                </div>
                <div className="lp-brand-sub">Self Service Portal</div>
              </div>
            </div>

            <div className="lp-status">
              <span className="lp-dot" />
              All systems operational
            </div>

            <h1 className="lp-heading">Hello, welcome back</h1>
            <p className="lp-desc">Sign in to access your workspace.</p>

            <form onSubmit={handleSubmit} noValidate>
              <div className="lp-field">
                <span className="lp-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.6" />
                    <path d="M4 20C4 17.5 7.58 15 12 15C16.42 15 20 17.5 20 20" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                  </svg>
                </span>
                <input
                  id="username"
                  type="text"
                  required
                  autoComplete="username"
                  placeholder=" "
                  value={form.user_name}
                  onChange={(e) => setForm({ ...form, user_name: e.target.value })}
                  className="lp-input"
                />
                <label className="lp-label" htmlFor="username">Username or email</label>
              </div>

              <div className="lp-field">
                <span className="lp-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <rect x="5" y="11" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.6" />
                    <path d="M8 11V7C8 4.79 9.79 3 12 3C14.21 3 16 4.79 16 7V11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                    <circle cx="12" cy="16" r="1.5" fill="currentColor" />
                  </svg>
                </span>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  placeholder=" "
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  onKeyUp={(e) => setCapsOn(e.getModifierState && e.getModifierState("CapsLock"))}
                  onBlur={() => setCapsOn(false)}
                  className="lp-input"
                />
                <label className="lp-label" htmlFor="password">Password</label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="lp-eye"
                >
                  {showPassword ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <path d="M3 3L21 21" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                      <path d="M10.58 10.58A2 2 0 0013.42 13.42M6.35 6.35C4.09 7.93 2 10.5 2 12C2 14 6 20 12 20M9.88 5.25C10.57 5.09 11.27 5 12 5C18 5 22 10 22 12C22 13.08 21.31 14.6 20 16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <path d="M2 12C2 12 5 5 12 5C19 5 22 12 22 12C22 12 19 19 12 19C5 19 2 12 2 12Z" stroke="currentColor" strokeWidth="1.6" />
                      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.6" />
                    </svg>
                  )}
                </button>
              </div>

              {capsOn && (
                <div className="lp-caps" role="status">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 19V5M5 12l7-7 7 7" />
                  </svg>
                  Caps Lock is on
                </div>
              )}

              <div className="lp-row">
                <label className="lp-check">
                  <input
                    type="checkbox"
                    checked={form.remember}
                    onChange={(e) => setForm({ ...form, remember: e.target.checked })}
                  />
                  <span className="lp-box">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12.5l4.5 4.5L19 7.5" />
                    </svg>
                  </span>
                  Remember me
                </label>

                <button type="button" onClick={() => navigate("/forgot-password")} className="lp-link">
                  Forgot password?
                </button>
              </div>

              {error && (
                <div key={errorKey} role="alert" className="lp-error">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.7" />
                    <path d="M12 8V12M12 16H12.01" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
                  </svg>
                  {error}
                </div>
              )}

              <button type="submit" disabled={submitting} className="lp-btn">
                {submitting ? (
                  <>
                    <div className="lp-spinner" />
                    Signing in…
                  </>
                ) : (
                  <>
                    Login
                    <svg className="lp-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M5 12H19M13 6L19 12L13 18" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </>
                )}
              </button>
            </form>

            <div className="lp-security">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L3 7V12C3 16.97 7.02 21.61 12 23C16.98 21.61 21 16.97 21 12V7L12 2Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
                <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              256-bit encrypted session
            </div>
          </div>
        </div>
      </div>
    </>
  );
}