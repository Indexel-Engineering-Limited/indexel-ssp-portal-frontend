import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { login, getPermissions } from "../services/authService";
import logo from '../assets/login-logo.png';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ user_name: "", password: "", remember: false });
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();

    setError(null);

    if (!form.user_name || !form.password) {
      setError(
        !form.user_name
          ? "Enter your username or email."
          : "Enter your password."
      );
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
        setError("You do not have access to any module.");
        return;
      }

      navigate(redirectPath, { replace: true });
    } catch (err) {
      setError(err.message || "Invalid credentials. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .ssp-root {
          min-height: 100vh;
          width: 100%;
          display: flex;
          font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
          background: #fff;
        }

        /* ── Left animated panel ── */
        .ssp-left {
          flex: 1;
          background: #285498;
          position: relative;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .ssp-left-top {
          position: absolute;
          top: 28px;
          left: 32px;
          display: flex;
          align-items: center;
          gap: 10px;
          z-index: 5;
        }

        .ssp-left-logo {
          width: 34px;
          height: 34px;
          background: rgba(255,255,255,0.18);
          border-radius: 9px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .ssp-left-brand { font-size: 16px; font-weight: 700; color: #fff; }
        .ssp-left-sub {
          font-size: 10px;
          color: rgba(255,255,255,0.5);
          letter-spacing: 0.08em;
          text-transform: uppercase;
          margin-top: 1px;
        }

        .ssp-left-bottom {
          position: absolute;
          bottom: 24px;
          left: 0; right: 0;
          text-align: center;
          font-size: 11px;
          color: rgba(255,255,255,0.32);
          font-weight: 500;
        }

        /* SVG scene animations */
        .float1 { animation: f1 3.5s ease-in-out infinite; }
        .float2 { animation: f2 4s ease-in-out infinite 0.6s; }
        .float3 { animation: f3 3s ease-in-out infinite 1.2s; }
        .float4 { animation: f4 4.5s ease-in-out infinite 0.3s; }
        .pulse  { animation: pulse 2s ease-in-out infinite; }
        .pulse2 { animation: pulse 2s ease-in-out infinite 1s; }
        .dash   { animation: dash 1.5s linear infinite; }
        .slide  { animation: slide 2s ease-in-out infinite alternate; }

        @keyframes f1 { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        @keyframes f2 { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-7px)} }
        @keyframes f3 { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
        @keyframes f4 { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.35} }
        @keyframes dash  { to{stroke-dashoffset:-20} }
        @keyframes slide { 0%{transform:scaleX(0.3)} 100%{transform:scaleX(1)} }

        /* ── Right form panel ── */
        .ssp-right {
          width: 500px;
          flex-shrink: 0;
          background: #ffffff;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 52px 48px;
        }

        @media (max-width: 860px) {
          .ssp-left { display: none; }
          .ssp-right { width: 100%; padding: 40px 28px; }
        }

        .ssp-right-logo {
          display: flex;
          align-items: center;
          gap: 9px;
          margin-bottom: 36px;
        }

        .ssp-right-mark {
          width: 48px; height: 48px;
          background: linear-gradient(135deg, #285498, #346ab9);
          border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }

        .ssp-brand-name { font-size: 13px; font-weight: 700; color: #6c2bd9; }
        .ssp-brand-sub  { font-size: 10px; color: #a78bfa; letter-spacing: 0.06em; text-transform: uppercase; }

        .ssp-heading {
          font-size: 30px;
          font-weight: 700;
          color: #1e1b4b;
          letter-spacing: -0.025em;
          line-height: 1.15;
          margin-bottom: 8px;
          font-family: sans-serif;
        }

        .ssp-desc {
          font-size: 13.5px;
          color: #9ca3af;
          margin-bottom: 30px;
          line-height: 1.5;
        }

        /* Form */
        .ssp-fg { margin-bottom: 16px; position: relative; }

        .ssp-label {
          display: block;
          font-size: 11px;
          font-weight: 600;
          color: #6b7280;
          margin-bottom: 6px;
          letter-spacing: 0.04em;
          text-transform: uppercase;
        }

        .ssp-icon {
          position: absolute;
          left: 12px;
          top: calc(50% + 10px);
          transform: translateY(-50%);
          color: #d1d5db;
          pointer-events: none;
          transition: color 0.18s;
          display: flex;
        }

        .ssp-fg:focus-within .ssp-icon { color: #6c2bd9; }

        .ssp-input {
          width: 100%;
          height: 44px;
          border: 1.5px solid #e5e7eb;
          border-radius: 10px;
          padding: 0 40px 0 38px;
          font-size: 13.5px;
          font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
          color: #1e1b4b;
          background: #f9fafb;
          outline: none;
          transition: border-color 0.18s, box-shadow 0.18s, background 0.18s;
        }

        .ssp-input::placeholder { color: #d1d5db; }

        .ssp-input:focus {
          border-color: #6c2bd9;
          background: #fff;
          box-shadow: 0 0 0 3px rgba(108,43,217,0.12);
        }

        .ssp-eye {
          position: absolute;
          right: 10px;
          top: calc(50% + 10px);
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          color: #d1d5db;
          padding: 4px;
          border-radius: 5px;
          display: flex;
          transition: color 0.18s, background 0.18s;
        }

        .ssp-eye:hover { color: #6c2bd9; background: rgba(108,43,217,0.08); }

        /* Remember row */
        .ssp-rem-row {
          display: flex;
          align-items: center;
          margin-bottom: 24px;
          margin-top: 4px;
        }

        .ssp-rem-label {
          display: flex;
          align-items: center;
          gap: 7px;
          cursor: pointer;
          user-select: none;
          font-size: 12.5px;
          color: #6b7280;
          font-weight: 500;
        }

        /* Error */
        .ssp-error {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          background: #fef2f2;
          border: 1.5px solid #fecaca;
          border-radius: 9px;
          padding: 10px 13px;
          margin-bottom: 16px;
          font-size: 12.5px;
          color: #dc2626;
          line-height: 1.4;
        }

        /* Submit */
        .ssp-btn {
          width: 100%;
          height: 46px;
          background: #2d55a0;
          border: none;
          border-radius: 10px;
          font-size: 14.5px;
          font-weight: 700;
          font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
          color: #ffffff;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          letter-spacing: -0.01em;
          transition: background 0.18s, transform 0.12s, box-shadow 0.18s;
          box-shadow: 0 4px 14px rgba(108,43,217,0.35);
          margin-bottom: 22px;
        }
          .ssp-brand-content {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 4px;
}

.ssp-brand-logo {
  width: 145px;
  height: 42px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  overflow: hidden;
}

.ssp-brand-logo img {
  width: 100%;
  height: 90%;
  object-fit: contain;
  object-position: left center;
  display: block;
}

.ssp-brand-sub {
  font-size: 9px;
  font-weight: 500;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #285498;
      margin-left: 8px;
}

        .ssp-btn:hover:not(:disabled) {
          background: #5b21b6;
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(108,43,217,0.45);
        }

        .ssp-btn:active:not(:disabled) { transform: translateY(0); }
        .ssp-btn:disabled { opacity: 0.65; cursor: not-allowed; }

        .ssp-spinner {
          width: 16px; height: 16px;
          border: 2.5px solid rgba(255,255,255,0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }

        @keyframes spin { to { transform: rotate(360deg); } }

        /* Security note */
        .ssp-security {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 5px;
          font-size: 11px;
          color: #d1d5db;
          font-weight: 500;
        }
      `}</style>

      <div className="ssp-root">

        {/* ── LEFT ANIMATED PANEL ── */}
        <div className="ssp-left">
          {/* <div className="ssp-left-top">
            <div className="ssp-left-logo">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L20 7V17L12 22L4 17V7L12 2Z" fill="white" fillOpacity="0.9" />
                <path d="M12 6L17 9V15L12 18L7 15V9L12 6Z" fill="white" fillOpacity="0.2" />
              </svg>
            </div>
            <div>
              <div className="ssp-left-brand">Indexel</div>
              <div className="ssp-left-sub">Self Service Portal</div>
            </div>
          </div> */}

          {/* Animated SVG Scene */}
          <svg
            width="100%"
            viewBox="0 0 400 460"
            style={{ maxWidth: 420, position: "relative", zIndex: 2 }}
          >
            {/* Ground shadows */}
            <ellipse cx="200" cy="430" rx="120" ry="15" fill="rgba(0,0,0,0.13)" />
            <ellipse cx="108" cy="415" rx="42" ry="9" fill="rgba(0,0,0,0.10)" />
            <ellipse cx="295" cy="415" rx="42" ry="9" fill="rgba(0,0,0,0.10)" />

            {/* ── Central phone/dashboard device ── */}
            <g className="float1" style={{ transformOrigin: "200px 290px" }}>
              <rect x="158" y="188" width="96" height="168" rx="14" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.55)" strokeWidth="1.5" />
              <rect x="166" y="202" width="80" height="118" rx="7" fill="rgba(255,255,255,0.08)" />
              <rect x="172" y="210" width="54" height="8" rx="4" fill="rgba(255,255,255,0.65)" />
              <rect x="172" y="223" width="38" height="5" rx="2.5" fill="rgba(255,255,255,0.3)" />
              <circle cx="206" cy="255" r="20" fill="rgba(108,43,217,0.45)" stroke="rgba(255,255,255,0.75)" strokeWidth="1.5" />
              <path d="M197 255L203 262L215 248" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="pulse" />
              <rect x="172" y="284" width="72" height="5" rx="2.5" fill="rgba(255,255,255,0.22)" />
              <rect x="172" y="294" width="50" height="5" rx="2.5" fill="rgba(255,255,255,0.16)" />
              <rect x="172" y="304" width="60" height="5" rx="2.5" fill="rgba(255,255,255,0.16)" />
              <circle cx="206" cy="344" r="7" fill="rgba(255,255,255,0.2)" stroke="rgba(255,255,255,0.38)" strokeWidth="1" />
            </g>

            {/* ── Left figure (woman) ── */}
            <g className="float2" style={{ transformOrigin: "108px 350px" }}>
              <circle cx="108" cy="286" r="16" fill="rgba(255,255,255,0.25)" stroke="rgba(255,255,255,0.55)" strokeWidth="1" />
              <path d="M94 283 Q96 268 108 267 Q120 268 122 283" fill="rgba(108,43,217,0.65)" stroke="none" />
              <rect x="92" y="302" width="32" height="62" rx="7" fill="rgba(255,255,255,0.16)" stroke="rgba(255,255,255,0.38)" strokeWidth="1" />
              <line x1="108" y1="316" x2="146" y2="300" stroke="rgba(255,255,255,0.42)" strokeWidth="7" strokeLinecap="round" />
              <rect x="96" y="362" width="12" height="35" rx="6" fill="rgba(255,255,255,0.2)" />
              <rect x="110" y="362" width="12" height="35" rx="6" fill="rgba(255,255,255,0.2)" />
              <rect x="99" y="310" width="18" height="23" rx="4" fill="rgba(255,255,255,0.32)" />
              <rect x="103" y="315" width="12" height="4" rx="2" fill="rgba(108,43,217,0.7)" />
              <rect x="103" y="321" width="8" height="3" rx="1.5" fill="rgba(108,43,217,0.4)" />
            </g>

            {/* ── Right figure (man) ── */}
            <g className="float3" style={{ transformOrigin: "295px 350px" }}>
              <circle cx="295" cy="284" r="16" fill="rgba(255,255,255,0.25)" stroke="rgba(255,255,255,0.55)" strokeWidth="1" />
              <path d="M281 281 Q283 268 295 267 Q307 268 309 281" fill="rgba(59,130,246,0.55)" stroke="none" />
              <rect x="279" y="300" width="32" height="64" rx="7" fill="rgba(59,130,246,0.28)" stroke="rgba(255,255,255,0.38)" strokeWidth="1" />
              <line x1="279" y1="315" x2="254" y2="300" stroke="rgba(255,255,255,0.42)" strokeWidth="7" strokeLinecap="round" />
              <rect x="283" y="362" width="12" height="35" rx="6" fill="rgba(59,130,246,0.3)" />
              <rect x="297" y="362" width="12" height="35" rx="6" fill="rgba(59,130,246,0.3)" />
            </g>

            {/* ── Floating card — top left (chart) ── */}
            <g className="float4" style={{ transformOrigin: "82px 138px" }}>
              <rect x="30" y="108" width="98" height="65" rx="10" fill="rgba(255,255,255,0.16)" stroke="rgba(255,255,255,0.38)" strokeWidth="1" />
              <text x="42" y="124" fontFamily="'Plus Jakarta Sans',sans-serif" fontSize="9" fill="rgba(255,255,255,0.6)">Analytics</text>
              <rect x="42" y="148" width="10" height="16" rx="2" fill="rgba(255,255,255,0.4)" />
              <rect x="56" y="138" width="10" height="26" rx="2" fill="rgba(255,255,255,0.75)" />
              <rect x="70" y="142" width="10" height="22" rx="2" fill="rgba(255,255,255,0.55)" />
              <rect x="84" y="132" width="10" height="32" rx="2" fill="rgba(255,255,255,0.95)" />
              <rect x="42" y="163" width="74" height="4" rx="2" fill="rgba(255,255,255,0.15)" />
              <rect x="42" y="163" width="52" height="4" rx="2" fill="rgba(255,255,255,0.7)" className="slide" style={{ transformOrigin: "42px 165px" }} />
            </g>

            {/* ── Floating card — top right ($) ── */}
            <g className="float2" style={{ transformOrigin: "324px 120px" }}>
              <rect x="272" y="90" width="100" height="65" rx="10" fill="rgba(255,255,255,0.16)" stroke="rgba(255,255,255,0.38)" strokeWidth="1" />
              <circle cx="294" cy="117" r="16" fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.4)" strokeWidth="1" />
              <text x="289" y="122" fontFamily="'Plus Jakarta Sans',sans-serif" fontSize="15" fontWeight="700" fill="white">$</text>
              <text x="315" y="112" fontFamily="'Plus Jakarta Sans',sans-serif" fontSize="9" fontWeight="600" fill="rgba(255,255,255,0.9)">Revenue</text>
              <text x="315" y="126" fontFamily="'Plus Jakarta Sans',sans-serif" fontSize="13" fontWeight="700" fill="white">+24%</text>
              <circle cx="362" cy="100" r="5" fill="#4ade80" className="pulse2" />
            </g>

            {/* ── Floating card — mid left (tasks) ── */}
            <g className="float3" style={{ transformOrigin: "62px 228px" }}>
              <rect x="18" y="204" width="86" height="58" rx="9" fill="rgba(255,255,255,0.13)" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
              <text x="28" y="218" fontFamily="'Plus Jakarta Sans',sans-serif" fontSize="8" fill="rgba(255,255,255,0.5)">Tasks</text>
              <circle cx="33" cy="232" r="6" fill="rgba(74,222,128,0.7)" />
              <path d="M30 232L32 235L37 229" stroke="white" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
              <rect x="44" y="228" width="48" height="6" rx="3" fill="rgba(255,255,255,0.5)" />
              <circle cx="33" cy="248" r="6" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
              <rect x="44" y="244" width="34" height="6" rx="3" fill="rgba(255,255,255,0.3)" />
            </g>

            {/* ── Floating card — mid right (notif) ── */}
            <g className="float4" style={{ transformOrigin: "336px 222px" }}>
              <rect x="294" y="200" width="84" height="50" rx="9" fill="rgba(255,255,255,0.13)" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
              <circle cx="312" cy="218" r="8" fill="rgba(109,40,217,0.5)" stroke="rgba(255,255,255,0.4)" strokeWidth="1" />
              <text x="309" y="222" fontFamily="'Plus Jakarta Sans',sans-serif" fontSize="9" fontWeight="700" fill="white">!</text>
              <rect x="326" y="213" width="42" height="6" rx="3" fill="rgba(255,255,255,0.6)" />
              <rect x="326" y="222" width="28" height="4" rx="2" fill="rgba(255,255,255,0.3)" />
              <circle cx="370" cy="208" r="5" fill="#f87171" className="pulse" />
            </g>

            {/* ── Dashed connecting arcs ── */}
            <path d="M124 302 Q142 284 160 274" stroke="rgba(255,255,255,0.25)" strokeWidth="1.2" strokeDasharray="4 4" fill="none" className="dash" />
            <path d="M278 300 Q264 284 256 274" stroke="rgba(255,255,255,0.25)" strokeWidth="1.2" strokeDasharray="4 4" fill="none" className="dash" />
          </svg>

          <div className="ssp-left-bottom">ISO 27001 · SOC 2 Type II · GDPR</div>
        </div>

        {/* ── RIGHT FORM PANEL ── */}
        <div className="ssp-right">
          <div className="ssp-right-logo">
            <div className="ssp-right-mark">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L20 7V17L12 22L4 17V7L12 2Z" fill="white" fillOpacity="0.9" />
                <path d="M12 6L17 9V15L12 18L7 15V9L12 6Z" fill="white" fillOpacity="0.2" />
              </svg>
            </div>
            <div>
              <div className="ssp-brand-content">
                <div className="ssp-brand-logo">
                  <img
                    src={logo}
                    alt="Self Service Portal"
                  />
                </div>

                <div className="ssp-brand-sub">
                  Self Service Portal
                </div>
              </div>
            </div>
          </div>

          <div className="ssp-heading">Hello, Welcome back</div>
          <p className="ssp-desc">Sign in to access your workspace.</p>

          <form onSubmit={handleSubmit}>
            <div className="ssp-fg">
              <label className="ssp-label" htmlFor="username">Username or email</label>
              <span className="ssp-icon">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M4 20C4 17.5 7.58 15 12 15C16.42 15 20 17.5 20 20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </span>
              <input
                id="username"
                type="text"
                required
                autoComplete="username"
                placeholder="Username or email"
                value={form.user_name}
                onChange={(e) => setForm({ ...form, user_name: e.target.value })}
                className="ssp-input"
              />
            </div>

            <div className="ssp-fg">
              <label className="ssp-label" htmlFor="password">Password</label>
              <span className="ssp-icon">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                  <rect x="5" y="11" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M8 11V7C8 4.79 9.79 3 12 3C14.21 3 16 4.79 16 7V11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  <circle cx="12" cy="16" r="1.5" fill="currentColor" />
                </svg>
              </span>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                required
                autoComplete="current-password"
                placeholder="Password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="ssp-input"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="ssp-eye"
              >
                {showPassword ? (
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                    <path d="M3 3L21 21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    <path d="M10.58 10.58A2 2 0 0013.42 13.42M6.35 6.35C4.09 7.93 2 10.5 2 12C2 14 6 20 12 20M9.88 5.25C10.57 5.09 11.27 5 12 5C18 5 22 10 22 12C22 13.08 21.31 14.6 20 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                ) : (
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                    <path d="M2 12C2 12 5 5 12 5C19 5 22 12 22 12C22 12 19 19 12 19C5 19 2 12 2 12Z" stroke="currentColor" strokeWidth="1.5" />
                    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" />
                  </svg>
                )}
              </button>
            </div>

            <div className="ssp-rem-row flex items-center justify-between w-full">
              <label className="ssp-rem-label flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.remember}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      remember: e.target.checked,
                    })
                  }
                  style={{
                    width: 14,
                    height: 14,
                    accentColor: "#6c2bd9",
                    cursor: "pointer",
                  }}
                />

                <span>Remember me</span>
              </label>

              <button
                type="button"
                onClick={() => navigate("/forgot-password")}
                className="text-sm font-medium text-[#2d55a0] hover:underline"
              >
                Forgot Password?
              </button>
            </div>


            {error && (
              <div role="alert" className="ssp-error">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M12 8V12M12 16H12.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                {error}
              </div>
            )}

            <button type="submit" disabled={submitting} className="ssp-btn">
              {submitting ? (
                <>
                  <div className="ssp-spinner" />
                  Signing in…
                </>
              ) : (
                <>
                  Login
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                    <path d="M5 12H19M13 6L19 12L13 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </>
              )}
            </button>
          </form>

          <div className="ssp-security">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L3 7V12C3 16.97 7.02 21.61 12 23C16.98 21.61 21 16.97 21 12V7L12 2Z" stroke="#a78bfa" strokeWidth="1.5" strokeLinejoin="round" />
              <path d="M9 12L11 14L15 10" stroke="#a78bfa" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            256-bit encrypted session
          </div>
        </div>
      </div>
    </>
  );
}