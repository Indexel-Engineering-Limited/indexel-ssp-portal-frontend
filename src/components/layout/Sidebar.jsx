import { NavLink, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { Activity, BadgeCheck, Building2, ChevronDown, Database, FileSpreadsheet, Folder, LayoutDashboard, LockKeyhole, Mail, Menu, PenLine, Settings, Shield, Users, X } from "lucide-react";
import sspLogo from "../../assets/ssp-logo.png";
import { getPermissions } from "../../services/authService";

const ROUTE_MAP = {
  dashboard: { to: "/dashboard", end: true }, company_list: { to: "/companies", end: true }, contacts: { to: "/contacts", end: true }, email_list: { to: "/emails", end: true },
  bulk_upload: { to: "/bulk-upload", end: false }, user_access: { to: "/user-access", end: false }, user_logs: { to: "/user-logs", end: false }, users: { to: "/users", end: false },
  employee_list: { to: "/hr-management", end: true }, incentive_dashboard: { to: "/ob-sheet/incentives", end: true }, incentive_schemes: { to: "/ob-sheet/incentives/schemes", end: false },
  incentive_orders: { to: "/ob-sheet/incentives/orders", end: false }, incentive_targets: { to: "/ob-sheet/incentives/targets", end: false },
  incentive_manage: { to: "/ob-sheet/incentives/employee-orders", end: false },
};
const iconFor = (name = "") => {
  const key = name.toLowerCase();
  if (key.includes("dashboard")) return LayoutDashboard;
  if (key.includes("compan") || key.includes("corporate")) return Building2;
  if (key.includes("contact") || key.includes("employee") || key.includes("user")) return Users;
  if (key.includes("email")) return Mail;
  if (key.includes("upload") || key.includes("sheet")) return FileSpreadsheet;
  if (key.includes("incentive") || key.includes("target")) return Activity;
  if (key.includes("scheme")) return BadgeCheck;
  if (key.includes("access") || key.includes("permission")) return Shield;
  if (key.includes("log")) return Database;
  if (key.includes("password") || key.includes("lock")) return LockKeyhole;
  if (key.includes("signature")) return PenLine;
  if (key.includes("setting")) return Settings;
  return Folder;
};
function buildNavItems() {
  const sections = getPermissions().filter((p) => Boolean(p.can_read) && ROUTE_MAP[p.module_key]).map((p) => ({ id: p.id, icon: p.icon, label: p.module_name, ...ROUTE_MAP[p.module_key], section_name: p.section_name?.toLowerCase().trim() || "other" })).reduce((acc, item) => { (acc[item.section_name] ||= []).push(item); return acc; }, {});
  const account = sections.account || [];
  account.push({ id: "change-password", icon: "lock", label: "Change Password", to: "/password", end: false }, { id: "signature", icon: "signature", label: "Company Signature", to: "/signature", end: false });
  sections.account = account;
  return sections;
}
function NavItem({ item }) {
  const Icon = iconFor(`${item.icon} ${item.label}`);
  return <NavLink to={item.to} end={item.end} title={item.label} className={({ isActive }) => `nav-item group ${isActive ? "is-active" : ""}`}>
    <Icon size={17} strokeWidth={1.8} aria-hidden="true" /><span className="nav-label truncate">{item.label}</span>
  </NavLink>;
}
export default function Sidebar({ open, onClose }) {
  const navItems = buildNavItems();
  const location = useLocation();
  const [expandedSections, setExpandedSections] = useState(() => Object.fromEntries(Object.keys(navItems).map((name) => [name, true])));
  const toggleSection = (section) => setExpandedSections((state) => ({ ...state, [section]: !state[section] }));
  useEffect(() => { onClose(); }, [location.pathname]);
  useEffect(() => { document.body.style.overflow = open ? "hidden" : ""; return () => { document.body.style.overflow = ""; }; }, [open]);

  const sidebarContent = <aside className="indexel-sidebar flex h-full w-[280px] flex-col md:w-[72px] lg:w-[220px]">
    <div className="sidebar-brand flex h-16 shrink-0 items-center gap-3 px-4">
      <img alt="SSP" className="nav-label h-10 w-full object-cover" src={sspLogo} />
      <button aria-label="Close menu" onClick={onClose} className="ml-auto flex h-8 w-8 shrink-0 items-center justify-center text-white/70 hover:text-white md:hidden"><X size={19} /></button>
    </div>
    <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-5">
      {Object.entries(navItems).filter(([name]) => name !== "account").map(([name, items]) => {
        const expanded = expandedSections[name];
        const active = items.some((item) => item.end ? location.pathname === item.to : location.pathname.startsWith(item.to));
        return <section key={name} className="nav-section">
          <button type="button" onClick={() => toggleSection(name)} className={`nav-section-heading ${active ? "has-active" : ""}`} title={name}>
            <span className="nav-label">{name}</span><ChevronDown className={`nav-label transition-transform ${expanded ? "" : "-rotate-90"}`} size={14} />
          </button>
          {expanded && <div className="space-y-1">{items.map((item) => <NavItem key={item.id || item.to} item={item} />)}</div>}
        </section>;
      })}
    </nav>
    {navItems.account?.length > 0 && <div className="sidebar-account border-t border-white/10 px-3 py-3">
      <div className="nav-section-heading mb-1"><span className="nav-label">Account</span></div>
      {navItems.account.map((item) => <NavItem key={item.id || item.to} item={item} />)}
    </div>}
  </aside>;

  return <>
    <div className="sidebar-desktop fixed left-0 top-0 z-50 hidden h-full flex-col md:flex">{sidebarContent}</div>
    {open && <div className="fixed inset-0 z-50 flex md:hidden"><div className="absolute inset-0 bg-slate-950/45" onClick={onClose} /><div className="relative z-10 flex h-full flex-col shadow-2xl">{sidebarContent}</div></div>}
  </>;
}
