import { useState } from "react";
import api from "../services/api";

// ── Password strength scorer ────────────────────────────────────────────────
function scorePassword(pwd) {
  if (!pwd) return { score: 0, label: "", color: "" };
  let score = 0;
  if (pwd.length >= 8)  score++;
  if (pwd.length >= 12) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  if (score <= 1) return { score, label: "Weak",   color: "#ef4444", bg: "#fee2e2" };
  if (score <= 3) return { score, label: "Fair",   color: "#f59e0b", bg: "#fef3c7" };
  if (score <= 4) return { score, label: "Good",   color: "#3b82f6", bg: "#dbeafe" };
  return               { score, label: "Strong", color: "#22c55e", bg: "#dcfce7" };
}

// ── Password input with show/hide toggle ────────────────────────────────────
function PasswordField({ label, value, onChange, placeholder, error, hint }) {
  const [show, setShow] = useState(false);
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[12px] font-semibold uppercase tracking-wider" style={{ color: "#6b7280" }}>
        {label}
      </label>
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete="new-password"
          className="w-full rounded-xl py-2.5 pl-4 pr-11 text-[13.5px] outline-none transition-all"
          style={{
            background:  "#f8fafd",
            border:      error ? "1.5px solid #ef4444" : "1.5px solid #dde4ef",
            color:       "#111827",
            fontFamily:  "'Inter', 'Hanken Grotesk', sans-serif",
          }}
          onFocus={(e)  => { if (!error) e.target.style.borderColor = "#2d55a0"; e.target.style.boxShadow = "0 0 0 3px rgba(45,85,160,0.09)"; }}
          onBlur={(e)   => { e.target.style.borderColor = error ? "#ef4444" : "#dde4ef"; e.target.style.boxShadow = "none"; }}
        />
        <button
          type="button"
          tabIndex={-1}
          onClick={() => setShow((s) => !s)}
          className="absolute right-3 top-1/2 -translate-y-1/2 flex h-6 w-6 items-center justify-center rounded-md transition-colors hover:bg-[#eef2fb]"
          style={{ color: "#6b7280" }}>
          <span className="material-symbols-outlined text-[18px]">{show ? "visibility_off" : "visibility"}</span>
        </button>
      </div>
      {error && <p className="text-[11.5px]" style={{ color: "#ef4444" }}>{error}</p>}
      {hint && !error && <p className="text-[11.5px]" style={{ color: "#6b7280" }}>{hint}</p>}
    </div>
  );
}

// ── Strength bar ─────────────────────────────────────────────────────────────
function StrengthBar({ password }) {
  const { score, label, color, bg } = scorePassword(password);
  if (!password) return null;
  const segments = 5;
  return (
    <div className="flex flex-col gap-1.5 mt-1">
      <div className="flex gap-1">
        {Array.from({ length: segments }).map((_, i) => (
          <div key={i} className="h-1.5 flex-1 rounded-full transition-all"
            style={{ background: i < score ? color : "#e5e7eb" }} />
        ))}
      </div>
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10.5px] font-semibold" style={{ background: bg, color }}>
          {label}
        </span>
        <span className="text-[11px]" style={{ color: "#6b7280" }}>
          {score < 3 && "Add uppercase, numbers or symbols to strengthen."   }
          {score === 3 && "Add special characters to improve strength."}
          {score >= 4 && "Great password!"}
        </span>
      </div>
    </div>
  );
}

// ── Requirements checklist ───────────────────────────────────────────────────
function RequirementItem({ met, text }) {
  return (
    <div className="flex items-center gap-2">
      <span className="material-symbols-outlined text-[14px]" style={{ color: met ? "#22c55e" : "#d1d5db" }}>
        {met ? "check_circle" : "radio_button_unchecked"}
      </span>
      <span className="text-[12px]" style={{ color: met ? "#374151" : "#9ca3af" }}>{text}</span>
    </div>
  );
}

const REQUIREMENTS = [
  { id: "len",   label: "At least 8 characters",           test: (p) => p.length >= 8         },
  { id: "upper", label: "At least one uppercase letter",   test: (p) => /[A-Z]/.test(p)       },
  { id: "num",   label: "At least one number",             test: (p) => /[0-9]/.test(p)       },
  { id: "spec",  label: "At least one special character",  test: (p) => /[^A-Za-z0-9]/.test(p) },
];

// ── Main page ────────────────────────────────────────────────────────────────
const ManagePassword = () => {
  const [newPassword,     setNewPassword]     = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors,          setErrors]          = useState({});
  const [loading,         setLoading]         = useState(false);
  const [success,         setSuccess]         = useState(false);
  const [apiError,        setApiError]        = useState(null);

  // ── Client-side validation ──
  function validate() {
    const errs = {};
    if (!newPassword) {
      errs.newPassword = "New password is required.";
    } else if (newPassword.length < 8) {
      errs.newPassword = "Password must be at least 8 characters.";
    }
    if (!confirmPassword) {
      errs.confirmPassword = "Please confirm your new password.";
    } else if (newPassword !== confirmPassword) {
      errs.confirmPassword = "Passwords do not match.";
    }
    return errs;
  }

  // ── Submit ──
  async function handleSubmit(e) {
    e.preventDefault();
    setSuccess(false);
    setApiError(null);
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);
    try {
      await api.patch("/api/auth/change-password", { newPassword, confirmPassword });
      setSuccess(true);
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setApiError(err.message || "Failed to change password. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleReset() {
    setNewPassword(""); setConfirmPassword("");
    setErrors({}); setSuccess(false); setApiError(null);
  }

  const allReqsMet = REQUIREMENTS.every((r) => r.test(newPassword));
  const passwordsMatch = newPassword && confirmPassword && newPassword === confirmPassword;

  return (
    <div className="max-w-lg mx-auto" style={{ fontFamily: "'Inter', 'Hanken Grotesk', sans-serif" }}>

      {/* ── Page header ── */}
      <div className="mb-6">
        <p className="text-[11.5px] font-semibold uppercase tracking-[0.16em]" style={{ color: "#2d55a0" }}>Account</p>
        <h1 className="mt-1 text-[22px] font-bold tracking-tight" style={{ color: "#111827" }}>Change Password</h1>
        <p className="mt-1 text-[13px]" style={{ color: "#374151" }}>
          Update your account password. Make sure to use a strong, unique password.
        </p>
      </div>

      {/* ── Success banner ── */}
      {success && (
        <div className="mb-5 flex items-start gap-3 rounded-xl px-4 py-3.5"
          style={{ background: "#dcfce7", border: "1px solid #bbf7d0" }}>
          <span className="material-symbols-outlined text-[20px] shrink-0 mt-0.5" style={{ color: "#22c55e" }}>check_circle</span>
          <div>
            <p className="text-[13px] font-semibold" style={{ color: "#166534" }}>Password changed successfully!</p>
            <p className="text-[12px] mt-0.5" style={{ color: "#166534" }}>Your new password is now active.</p>
          </div>
        </div>
      )}

      {/* ── API error banner ── */}
      {apiError && (
        <div className="mb-5 flex items-start gap-3 rounded-xl px-4 py-3.5"
          style={{ background: "#fef2f2", border: "1px solid #fecaca" }}>
          <span className="material-symbols-outlined text-[20px] shrink-0 mt-0.5" style={{ color: "#ef4444" }}>error</span>
          <div>
            <p className="text-[13px] font-semibold" style={{ color: "#991b1b" }}>Failed to change password</p>
            <p className="text-[12px] mt-0.5" style={{ color: "#991b1b" }}>{apiError}</p>
          </div>
        </div>
      )}

      {/* ── Card ── */}
      <div className="rounded-2xl overflow-hidden"
        style={{ background: "#ffffff", border: "1px solid #e2e9f4", boxShadow: "0 2px 16px rgba(45,85,160,0.08)" }}>

        {/* Card header */}
        <div className="flex items-center gap-3 px-6 py-4" style={{ borderBottom: "1px solid #f0f4fa" }}>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl shrink-0" style={{ background: "#eef2fb" }}>
            <span className="material-symbols-outlined text-[20px]" style={{ color: "#2d55a0" }}>lock_reset</span>
          </div>
          <div>
            <p className="text-[14px] font-semibold" style={{ color: "#111827" }}>Set New Password</p>
            <p className="text-[12px]" style={{ color: "#6b7280" }}>Both fields are required</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate>
          <div className="px-6 py-5 flex flex-col gap-5">

            {/* New password */}
            <div className="flex flex-col gap-2">
              <PasswordField
                label="New Password"
                value={newPassword}
                onChange={(v) => { setNewPassword(v); setErrors((e) => ({ ...e, newPassword: undefined })); setSuccess(false); }}
                placeholder="Enter your new password"
                error={errors.newPassword}
              />
              {/* Strength indicator */}
              <StrengthBar password={newPassword} />
            </div>

            {/* Confirm password */}
            <PasswordField
              label="Confirm New Password"
              value={confirmPassword}
              onChange={(v) => { setConfirmPassword(v); setErrors((e) => ({ ...e, confirmPassword: undefined })); setSuccess(false); }}
              placeholder="Re-enter your new password"
              error={errors.confirmPassword}
              hint={passwordsMatch ? "Passwords match." : ""}
            />

            {/* Requirements checklist */}
            {newPassword.length > 0 && (
              <div className="rounded-xl px-4 py-3.5 flex flex-col gap-2"
                style={{ background: "#f8fafd", border: "1px solid #e2e9f4" }}>
                <p className="text-[11px] font-semibold uppercase tracking-wider mb-1" style={{ color: "#6b7280" }}>
                  Password Requirements
                </p>
                {REQUIREMENTS.map((r) => (
                  <RequirementItem key={r.id} met={r.test(newPassword)} text={r.label} />
                ))}
              </div>
            )}

          </div>

          {/* Footer */}
          <div className="flex items-center justify-between gap-3 px-6 py-4" style={{ borderTop: "1px solid #f0f4fa" }}>
            <button type="button" onClick={handleReset}
              className="px-4 py-2 rounded-lg text-[13px] font-medium transition-colors hover:bg-[#f3f6fb]"
              style={{ border: "1px solid #e2e9f4", color: "#374151" }}>
              Clear
            </button>
            <button type="submit" disabled={loading}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-lg text-[13px] font-semibold text-white transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ background: "#2d55a0", boxShadow: "0 3px 10px rgba(45,85,160,0.28)" }}>
              {loading ? (
                <><span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>Saving...</>
              ) : (
                <><span className="material-symbols-outlined text-[16px]">lock</span>Change Password</>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* ── Security tip ── */}
      <div className="mt-4 flex items-start gap-3 rounded-xl px-4 py-3"
        style={{ background: "#eef2fb", border: "1px solid #dbe5f8" }}>
        <span className="material-symbols-outlined text-[18px] shrink-0 mt-0.5" style={{ color: "#2d55a0" }}>info</span>
        <p className="text-[12px] leading-relaxed" style={{ color: "#1e3a8a" }}>
          After changing your password, you will remain logged in on this device. Other active sessions may be signed out automatically.
        </p>
      </div>

    </div>
  );
};

export default ManagePassword;
