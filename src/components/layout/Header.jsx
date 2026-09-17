import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser, logout } from "../../services/authService";

const notifications = [
  { id: 1, title: "New company added",     message: "Indexel Technologies was added to the company directory.", time: "Just now",       icon: "corporate_fare" },
  { id: 2, title: "Contact uploaded",      message: "Sarah Wilson was added as a contact for Acme Corp Global.", time: "12 minutes ago", icon: "person_add"     },
  { id: 3, title: "Bulk upload completed", message: "Your company import has finished successfully.",             time: "Yesterday",      icon: "upload_file"    },
];

function Avatar({ name }) {
  const initials = String(name || "U").split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
  return (
    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold text-white" style={{ background: "linear-gradient(135deg,#2d55a0,#3a6fd8)" }}>
      {initials}
    </div>
  );
}

export default function Header({ onMenuToggle }) {
  const navigate     = useNavigate();
  const user         = getCurrentUser();
  const displayName  = user?.name || user?.user_name || "User";
  const role         = user?.role || "User";

  const [notifOpen,   setNotifOpen]   = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [unread,      setUnread]      = useState(notifications.length);

  const notifRef   = useRef(null);
  const profileRef = useRef(null);

  useEffect(() => {
    function handler(e) {
      if (notifRef.current   && !notifRef.current.contains(e.target))   setNotifOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  function openNotif()     { setNotifOpen(true); setUnread(0); }
  function handleLogout()  { logout(); navigate("/login", { replace: true }); }

  return (
    <header
      className="fixed top-0 left-0 right-0 lg:left-[220px] h-14 z-40 flex items-center justify-between px-4"
      style={{
        background:     "rgba(255,255,255,0.96)",
        backdropFilter: "blur(12px)",
        borderBottom:   "1px solid #e2e9f4",
        boxShadow:      "0 1px 8px rgba(45,85,160,0.06)",
        fontFamily:     "'Inter','Hanken Grotesk',sans-serif",
      }}>

      {/* ── Hamburger (mobile only) ── */}
      <button
        aria-label="Open menu"
        onClick={onMenuToggle}
        className="flex lg:hidden h-9 w-9 items-center justify-center rounded-lg mr-2 transition-colors hover:bg-[#f3f6fb] text-[#374151] shrink-0">
        <span className="material-symbols-outlined text-[22px]">menu</span>
      </button>

      {/* ── Search ── */}
      <div className="flex-1 min-w-0 max-w-md">
        <div className="relative flex items-center">
          <span className="material-symbols-outlined absolute left-3 text-[#6b7280] text-[17px] pointer-events-none">search</span>
          <input
            className="w-full rounded-full py-1.5 pl-9 pr-4 text-[12.5px] text-[#111827] outline-none transition-all"
            style={{ background: "#f3f6fb", border: "1.5px solid #dde4ef", fontFamily: "inherit" }}
            onFocus={(e)  => { e.target.style.borderColor = "#2d55a0"; e.target.style.boxShadow = "0 0 0 3px rgba(45,85,160,0.09)"; }}
            onBlur={(e)   => { e.target.style.borderColor = "#dde4ef"; e.target.style.boxShadow = "none"; }}
            placeholder="Search…"
            type="text" />
        </div>
      </div>

      {/* ── Right actions ── */}
      <div className="flex items-center gap-2 ml-3 shrink-0">

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button aria-label="Open notifications" onClick={openNotif}
            className="relative flex h-8 w-8 items-center justify-center rounded-full transition-colors text-[#374151]"
            onMouseEnter={(e) => (e.currentTarget.style.background = "#f3f6fb")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
            <span className="material-symbols-outlined text-[20px]">notifications</span>
            {unread > 0 && (
              <span className="absolute top-0.5 right-0.5 flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold text-white" style={{ background: "#2d55a0" }}>
                {unread}
              </span>
            )}
          </button>

          {/* Notification panel */}
          {notifOpen && (
            <div className="absolute right-0 top-[calc(100%+8px)] w-72 sm:w-80 overflow-hidden rounded-xl"
              style={{ background: "#ffffff", border: "1px solid #e2e9f4", boxShadow: "0 8px 32px rgba(45,85,160,0.13)", animation: "fadeIn 0.15s ease-out", zIndex: 60 }}>
              <div className="flex items-center justify-between border-b px-4 py-3" style={{ borderColor: "#e2e9f4" }}>
                <div>
                  <p className="text-[13px] font-semibold text-[#111827]">Notifications</p>
                  <p className="text-[11px] text-[#6b7280]">Latest activity</p>
                </div>
                <button onClick={() => setNotifOpen(false)} className="flex h-7 w-7 items-center justify-center rounded-full text-[#6b7280] hover:bg-[#f3f6fb]">
                  <span className="material-symbols-outlined text-[16px]">close</span>
                </button>
              </div>
              {notifications.map((n) => (
                <div key={n.id} className="flex gap-3 border-b px-4 py-3 last:border-0 hover:bg-[#f8fafd]" style={{ borderColor: "#f0f4fa" }}>
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[#2d55a0]" style={{ background: "#eef2fb" }}>
                    <span className="material-symbols-outlined text-[16px]">{n.icon}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-[12.5px] font-semibold text-[#111827]">{n.title}</p>
                      <span className="shrink-0 text-[10.5px] text-[#6b7280]">{n.time}</span>
                    </div>
                    <p className="mt-0.5 text-[11.5px] leading-relaxed text-[#374151]">{n.message}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="h-5 w-px" style={{ background: "#e2e9f4" }} />

        {/* Profile */}
        <div className="relative" ref={profileRef}>
          <button aria-label="Open user menu" onClick={() => setProfileOpen((o) => !o)}
            className="flex items-center gap-2 rounded-full px-2 py-1 transition-all"
            style={{ border: "1.5px solid transparent" }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "#f3f6fb"; e.currentTarget.style.borderColor = "#dde4ef"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "transparent"; }}>
            <Avatar name={displayName} />
            <div className="hidden sm:block text-left min-w-0">
              <p className="max-w-24 truncate text-[12.5px] font-semibold text-[#111827] leading-tight">{displayName}</p>
              <p className="max-w-24 truncate text-[10.5px] text-[#6b7280] leading-tight capitalize">{role=="ADMIN"? role:""}</p>
            </div>
            <span className="material-symbols-outlined hidden sm:block text-[15px] text-[#6b7280]">expand_more</span>
          </button>

          {profileOpen && (
            <div className="absolute right-0 top-[calc(100%+8px)] w-52 overflow-hidden rounded-xl"
              style={{ background: "#ffffff", border: "1px solid #e2e9f4", boxShadow: "0 8px 32px rgba(45,85,160,0.13)", animation: "fadeIn 0.15s ease-out", zIndex: 60 }}>
              <div className="border-b px-4 py-3" style={{ borderColor: "#e2e9f4" }}>
                <p className="truncate text-[13px] font-semibold text-[#111827]">{displayName}</p>
                <p className="mt-0.5 text-[11.5px] capitalize text-[#2d55a0]">{role=="ADMIN" ? role:""}</p>
              </div>
              <button onClick={handleLogout} className="flex w-full items-center gap-2.5 px-4 py-3 text-left text-[12.5px] font-medium hover:bg-[#fff2f2]" style={{ color: "#ba1a1a" }}>
                <span className="material-symbols-outlined text-[17px]">logout</span>
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
