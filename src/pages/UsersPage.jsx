import { useEffect, useState } from "react";
import { getCurrentUser, getUsers, registerUser } from "../services/authService";

function RoleBadge({ role }) {
  const map = {
    ADMIN: { bg: "#eef2fb", color: "#2d55a0" },
    USER: { bg: "#dcfce7", color: "#166534" },
    VIEWER: { bg: "#fef9c3", color: "#854d0e" },
  };
  const s = map[String(role).toUpperCase()] ?? { bg: "#f3f4f6", color: "#374151" };
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold"
      style={{ background: s.bg, color: s.color }}>{role ?? "—"}</span>
  );
}

function UserAvatar({ name }) {
  const initials = String(name || "U").split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
  return (
    <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-[12px] font-semibold text-white"
      style={{ background: "linear-gradient(135deg,#2d55a0,#3a6fd8)" }}>
      {initials}
    </div>
  );
}

// Defined outside AddUserModal so React never unmounts inputs on re-render
function Field({ label, required, error, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11.5px] font-semibold uppercase tracking-wider" style={{ color: "#6b7280" }}>
        {label}
        {required && <span style={{ color: "#ef4444" }}> *</span>}
      </label>
      {children}
      {error && <p className="text-[11.5px]" style={{ color: "#ef4444" }}>{error}</p>}
    </div>
  );
}

const EMPTY_FORM = { user_name: "", name: "", email_id: "", password: "" };

function AddUserModal({ onClose, onAdded }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiErr, setApiErr] = useState(null);
  const [showPwd, setShowPwd] = useState(false);

  // Single change handler — keeps input controlled and stable
  function handleChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
    setApiErr(null);
  }

  function validate() {
    const e = {};

    if (!form.name.trim()) {
      e.name = "Full name is required.";
    }

    if (!form.user_name.trim()) {
      e.user_name = "Username is required.";
    }

    if (!form.email_id.trim()) {
      e.email_id = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email_id)) {
      e.email_id = "Enter a valid email.";
    }

    if (!form.password) {
      e.password = "Password is required.";
    } else if (form.password.length < 8) {
      e.password = "Minimum 8 characters.";
    }

    return e;
  }

  async function handleSubmit(ev) {
    ev.preventDefault();
    setApiErr(null);
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    try {
      const created = await registerUser({
        user_name: form.user_name.trim(),
        name: form.name.trim(),
        email_id: form.email_id.trim(),
        password: form.password,
      });
      onAdded(created);
      onClose();
    } catch (err) {
      setApiErr(err.message || "Failed to create user.");
    } finally {
      setLoading(false);
    }
  }

  const base = "w-full rounded-xl py-2.5 px-4 text-[13.5px] outline-none transition-all";
  function iStyle(hasErr) {
    return {
      background: "#f8fafd",
      border: `1.5px solid ${hasErr ? "#ef4444" : "#dde4ef"}`,
      color: "#111827",
      fontFamily: "inherit",
    };
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4"
      style={{ fontFamily: "'Inter', 'Hanken Grotesk', sans-serif" }}>
      <div className="absolute inset-0 bg-[#111827]/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-2xl shadow-2xl overflow-hidden"
        style={{ background: "#ffffff", maxHeight: "90vh", overflowY: "auto" }}>

        {/* Modal header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4"
          style={{ background: "#ffffff", borderBottom: "1px solid #e2e9f4" }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: "#eef2fb" }}>
              <span className="material-symbols-outlined text-[20px]" style={{ color: "#2d55a0" }}>person_add</span>
            </div>
            <div>
              <p className="text-[14.5px] font-semibold" style={{ color: "#111827" }}>Add New User</p>
              <p className="text-[11.5px]" style={{ color: "#6b7280" }}>Fill in the details below</p>
            </div>
          </div>
          <button type="button" onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-[#f3f6fb]"
            style={{ color: "#6b7280" }}>
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* API error */}
        {apiErr && (
          <div className="mx-6 mt-4 flex items-start gap-2.5 rounded-xl px-4 py-3"
            style={{ background: "#fef2f2", border: "1px solid #fecaca" }}>
            <span className="material-symbols-outlined text-[18px] mt-0.5 shrink-0" style={{ color: "#ef4444" }}>error</span>
            <p className="text-[12.5px]" style={{ color: "#991b1b" }}>{apiErr}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate>
          <div className="px-6 py-5 flex flex-col gap-4">

            <Field label="Full Name" required error={errors.name}>
              <input
                className={base}
                style={iStyle(errors.name)}
                placeholder="e.g. Rakesh Prajapat"
                value={form.name}
                onChange={(e) => handleChange("name", e.target.value)}
              />
            </Field>

            <Field label="Username" required error={errors.user_name}>
              <input
                className={base}
                style={iStyle(errors.user_name)}
                placeholder="e.g. rakesh123"
                value={form.user_name}
                onChange={(e) => handleChange("user_name", e.target.value)}
              />
            </Field>

            <Field label="Email" required error={errors.email_id}>
              <input
                className={base}
                style={iStyle(errors.email_id)}
                placeholder="email@example.com"
                type="email"
                value={form.email_id}
                onChange={(e) => handleChange("email_id", e.target.value)}
              />
            </Field>

            <Field label="Password" required error={errors.password}>
              <div className="relative">
                <input
                  className={base}
                  style={{ ...iStyle(errors.password), paddingRight: "2.75rem" }}
                  type={showPwd ? "text" : "password"}
                  placeholder="Min. 6 characters"
                  value={form.password}
                  onChange={(e) => handleChange("password", e.target.value)}
                  autoComplete="new-password"
                />
                <button type="button" tabIndex={-1} onClick={() => setShowPwd((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 flex h-6 w-6 items-center justify-center rounded-md hover:bg-[#eef2fb] transition-colors"
                  style={{ color: "#6b7280" }}>
                  <span className="material-symbols-outlined text-[18px]">{showPwd ? "visibility_off" : "visibility"}</span>
                </button>
              </div>
            </Field>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 flex items-center justify-end gap-3 px-6 py-4"
            style={{ background: "#ffffff", borderTop: "1px solid #f0f4fa" }}>
            <button type="button" onClick={onClose}
              className="px-4 py-2 rounded-lg text-[13px] font-medium transition-colors hover:bg-[#f3f6fb]"
              style={{ border: "1px solid #e2e9f4", color: "#374151" }}>Cancel</button>
            <button type="submit" disabled={loading}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-lg text-[13px] font-semibold text-white disabled:opacity-60 transition-all"
              style={{ background: "#2d55a0", boxShadow: "0 3px 10px rgba(45,85,160,0.28)" }}>
              {loading
                ? <><span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>Creating...</>
                : <><span className="material-symbols-outlined text-[16px]">person_add</span>Create User</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Main page ────────────────────────────────────────────────────────────────
export default function UsersPage() {
  const currentUser = getCurrentUser();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);

  async function loadUsers() {
    setLoading(true); setError(null);
    try {
      const data = await getUsers();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }
  useEffect(() => { loadUsers(); }, []);

  function handleAdded(newUser) {
    if (newUser) setUsers((prev) => [newUser, ...prev]);
    else loadUsers(); // fallback: refetch if API doesnt return the created user
  }

  const filtered = users.filter((u) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return [u.name, u.user_name, u.email_id, u.role].some((v) => String(v ?? "").toLowerCase().includes(q));
  });

  const cardStyle = { background: "#ffffff", border: "1px solid #e2e9f4", boxShadow: "0 2px 12px rgba(45,85,160,.07)" };

  return (
    <div style={{ fontFamily: "'Inter', 'Hanken Grotesk', sans-serif" }}>

      {/* heading */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-5 gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em]" style={{ color: "#2d55a0" }}>Management</p>
          <h1 className="mt-0.5 text-[22px] font-bold tracking-tight" style={{ color: "#111827" }}>Users</h1>
          <p className="mt-1 text-[12.5px]" style={{ color: "#374151" }}>View all registered users and add new ones.</p>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[17px]" style={{ color: "#6b7280" }}>search</span>
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search users\u2026"
              className="rounded-lg border py-2 pl-9 pr-3 text-[12.5px] w-48 outline-none"
              style={{ borderColor: "#e2e9f4", background: "#f8fafd", color: "#111827" }} />
          </div>
          <button onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-semibold text-white transition-all hover:-translate-y-px"
            style={{ background: "#2d55a0", boxShadow: "0 3px 10px rgba(45,85,160,0.25)" }}>
            <span className="material-symbols-outlined text-[17px]">person_add</span>Add User
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 flex items-center justify-between gap-3 rounded-xl px-4 py-3" style={{ background: "#fef2f2", border: "1px solid #fecaca" }}>
          <span className="text-[13px]" style={{ color: "#991b1b" }}>{error}</span>
          <button onClick={loadUsers} className="text-[12px] font-semibold underline" style={{ color: "#991b1b" }}>Retry</button>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center gap-2 rounded-xl py-20" style={cardStyle}>
          <span className="material-symbols-outlined text-[30px] animate-spin" style={{ color: "#a6bcee" }}>progress_activity</span>
          <span className="text-[13px]" style={{ color: "#374151" }}>Loading users\u2026</span>
        </div>
      ) : (
        <div className="rounded-xl overflow-hidden" style={cardStyle}>

          {/* summary bar */}
          <div className="flex items-center justify-between px-5 py-3" style={{ borderBottom: "1px solid #f0f4fa" }}>
            <p className="text-[12.5px] font-medium" style={{ color: "#374151" }}>
              {filtered.length} user{filtered.length !== 1 ? "s" : ""}
              {search && <span style={{ color: "#6b7280" }}> matching &ldquo;{search}&rdquo;</span>}
            </p>
            <button onClick={loadUsers} className="inline-flex items-center gap-1.5 text-[12px] font-medium hover:underline" style={{ color: "#2d55a0" }}>
              <span className="material-symbols-outlined text-[15px]">refresh</span>Refresh
            </button>
          </div>

          {filtered.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-16">
              <span className="material-symbols-outlined text-[32px]" style={{ color: "#c5d3e4" }}>person_off</span>
              <span className="text-[13px]" style={{ color: "#6b7280" }}>{search ? "No users match your search." : "No users found."}</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="text-[11px] font-semibold uppercase tracking-wider" style={{ background: "#f8fafd", borderBottom: "1px solid #e2e9f4", color: "#6b7280" }}>
                    <th className="px-5 py-3 text-left w-[50px]">#</th>
                    <th className="px-5 py-3 text-left">User</th>
                    <th className="px-5 py-3 text-left">Email</th>
                    <th className="px-5 py-3 text-left">Role</th>
                    <th className="px-5 py-3 text-left">Joined</th>
                    <th className="px-5 py-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((user, idx) => {
                    const isSelf = user.id === currentUser?.id;
                    return (
                      <tr key={user.id} className="transition-colors"
                        style={{ background: isSelf ? "#f8fafd" : "#ffffff", borderBottom: "1px solid #f0f4fa" }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "#f8fafd")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = isSelf ? "#f8fafd" : "#ffffff")}>
                        <td className="px-5 py-3.5 text-[12px]" style={{ color: "#6b7280" }}>{idx + 1}</td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <UserAvatar name={user.name} />
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <p className="font-semibold truncate" style={{ color: "#111827" }}>{user.name || "\u2014"}</p>
                                {isSelf && <span className="text-[9.5px] font-semibold px-1.5 py-0.5 rounded-full shrink-0" style={{ background: "#eef2fb", color: "#2d55a0" }}>You</span>}
                              </div>
                              <p className="text-[11.5px] truncate" style={{ color: "#6b7280" }}>@{user.user_name || "\u2014"}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-[12.5px]" style={{ color: "#374151" }}>{user.email_id || "\u2014"}</td>
                        <td className="px-5 py-3.5"><RoleBadge role={user.role} /></td>
                        <td className="px-5 py-3.5 text-[12px] whitespace-nowrap" style={{ color: "#374151" }}>
                          {user.created_at ? new Date(user.created_at).toLocaleDateString() : "\u2014"}
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[10.5px] font-semibold" style={{ background: "#dcfce7", color: "#166534" }}>
                            <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#16a34a" }} />Active
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {showModal && <AddUserModal onClose={() => setShowModal(false)} onAdded={handleAdded} />}
    </div>
  );
}
