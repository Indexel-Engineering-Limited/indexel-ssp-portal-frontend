/**
 * Indexel Design System — Shared UI Components
 * All components use CSS variables from index.css
 * DO NOT modify business logic — UI only
 */

// ─── Button ──────────────────────────────────────────────────────────────────
export function Btn({ variant = "primary", size = "md", className = "", children, ...props }) {
  const base = "ix-btn";
  const v    = { primary: "ix-btn-primary", secondary: "ix-btn-secondary", danger: "ix-btn-danger", ghost: "ix-btn-ghost" };
  const s    = { sm: "ix-btn-sm", md: "", lg: "ix-btn-lg", icon: "ix-btn-icon" };
  return (
    <button className={`${base} ${v[variant] ?? ""} ${s[size] ?? ""} ${className}`} {...props}>
      {children}
    </button>
  );
}

// ─── Page header ─────────────────────────────────────────────────────────────
export function PageHeader({ title, subtitle, badge, actions }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 24, gap: 16, flexWrap: "wrap" }}>
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <h1 className="ix-page-title">{title}</h1>
          {badge != null && (
            <span style={{
              fontSize: 11.5, fontWeight: 600, padding: "2px 8px", borderRadius: 4,
              background: "var(--ix-primary-light)", color: "var(--ix-primary)",
            }}>
              {typeof badge === "number" ? badge.toLocaleString() : badge}
            </span>
          )}
        </div>
        {subtitle && <p className="ix-page-subtitle">{subtitle}</p>}
      </div>
      {actions && <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>{actions}</div>}
    </div>
  );
}

// ─── Card ─────────────────────────────────────────────────────────────────────
export function Card({ children, className = "", style = {}, ...props }) {
  return (
    <div className={`ix-card ${className}`} style={{ padding: 20, ...style }} {...props}>
      {children}
    </div>
  );
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────
export function KPICard({ label, value, sub, icon, variant = "default" }) {
  const isBlue = variant === "blue";
  return (
    <div className={isBlue ? "ix-kpi-card-blue" : "ix-kpi-card"}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p className="ix-kpi-label">{label}</p>
          <p className="ix-kpi-value" style={{ marginTop: 6 }}>{value}</p>
          {sub && <p style={{ fontSize: 12, marginTop: 4, color: isBlue ? "rgba(255,255,255,0.65)" : "var(--ix-gray-500)" }}>{sub}</p>}
        </div>
        {icon && (
          <div style={{
            width: 36, height: 36, borderRadius: 8, flexShrink: 0,
            background: isBlue ? "rgba(255,255,255,0.15)" : "var(--ix-primary-light)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: 18, color: isBlue ? "#fff" : "var(--ix-primary)" }}>{icon}</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Badge ────────────────────────────────────────────────────────────────────
const BADGE_MAP = {
  active:    "ix-badge-green",
  approved:  "ix-badge-green",
  success:   "ix-badge-green",
  completed: "ix-badge-green",
  achieved:  "ix-badge-teal",
  pending:   "ix-badge-yellow",
  draft:     "ix-badge-yellow",
  warning:   "ix-badge-yellow",
  rejected:  "ix-badge-red",
  danger:    "ix-badge-red",
  cancelled: "ix-badge-red",
  frozen:    "ix-badge-indigo",
  inactive:  "ix-badge-gray",
  default:   "ix-badge-gray",
  submitted: "ix-badge-blue",
  blue:      "ix-badge-blue",
};

export function Badge({ status, children }) {
  const label = (children ?? status ?? "").toString().toLowerCase();
  const cls   = BADGE_MAP[label] ?? "ix-badge-gray";
  return (
    <span className={`ix-badge ${cls}`}>
      {children ?? status}
    </span>
  );
}

// ─── Input ────────────────────────────────────────────────────────────────────
export function Input({ label, error, required, className = "", ...props }) {
  return (
    <div>
      {label && <label className={`ix-label ${required ? "ix-label-required" : ""}`}>{label}</label>}
      <input className={`ix-input ${error ? "ix-input-error" : ""} ${className}`} {...props} />
      {error && <p className="ix-field-error">{error}</p>}
    </div>
  );
}

export function Select({ label, error, required, className = "", children, ...props }) {
  return (
    <div>
      {label && <label className={`ix-label ${required ? "ix-label-required" : ""}`}>{label}</label>}
      <select className={`ix-input ix-select ${error ? "ix-input-error" : ""} ${className}`} {...props}>
        {children}
      </select>
      {error && <p className="ix-field-error">{error}</p>}
    </div>
  );
}

export function Textarea({ label, error, required, className = "", ...props }) {
  return (
    <div>
      {label && <label className={`ix-label ${required ? "ix-label-required" : ""}`}>{label}</label>}
      <textarea className={`ix-textarea ${error ? "ix-input-error" : ""} ${className}`} {...props} />
      {error && <p className="ix-field-error">{error}</p>}
    </div>
  );
}

// ─── Modal ────────────────────────────────────────────────────────────────────
export function Modal({ title, onClose, children, footer, maxWidth = 520 }) {
  return (
    <div className="ix-modal-overlay" onClick={onClose}>
      <div className="ix-modal" style={{ maxWidth }} onClick={(e) => e.stopPropagation()}>
        <div className="ix-modal-header">
          <span className="ix-modal-title">{title}</span>
          <button
            type="button"
            onClick={onClose}
            style={{ width: 28, height: 28, borderRadius: 6, background: "var(--ix-gray-100)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--ix-gray-500)" }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 17 }}>close</span>
          </button>
        </div>
        <div className="ix-modal-body">{children}</div>
        {footer && <div className="ix-modal-footer">{footer}</div>}
      </div>
    </div>
  );
}

// ─── Tabs ─────────────────────────────────────────────────────────────────────
export function Tabs({ tabs, active, onChange }) {
  return (
    <div className="ix-tabs">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          className={`ix-tab ${active === tab.id ? "active" : ""}`}
          onClick={() => onChange(tab.id)}
        >
          {tab.icon && <span className="material-symbols-outlined" style={{ fontSize: 15 }}>{tab.icon}</span>}
          {tab.label}
        </button>
      ))}
    </div>
  );
}

// ─── Alert banner ─────────────────────────────────────────────────────────────
export function Alert({ type = "error", children, onDismiss }) {
  const icons = { error: "error", success: "check_circle", warning: "info", info: "info" };
  return (
    <div className={`ix-alert ix-alert-${type}`}>
      <span className="material-symbols-outlined" style={{ fontSize: 17, flexShrink: 0 }}>{icons[type]}</span>
      <span style={{ flex: 1, fontSize: 13 }}>{children}</span>
      {onDismiss && (
        <button type="button" onClick={onDismiss} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex", color: "inherit", opacity: 0.6 }}>
          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>close</span>
        </button>
      )}
    </div>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────
export function EmptyState({ icon = "search_off", title, description, action }) {
  return (
    <div className="ix-empty">
      <span className="material-symbols-outlined ix-empty-icon">{icon}</span>
      {title && <p style={{ fontSize: 14, fontWeight: 600, color: "var(--ix-gray-700)", margin: 0 }}>{title}</p>}
      {description && <p style={{ fontSize: 13, color: "var(--ix-gray-500)", margin: 0, maxWidth: 360 }}>{description}</p>}
      {action}
    </div>
  );
}

// ─── Loading state ────────────────────────────────────────────────────────────
export function LoadingState({ text = "Loading…" }) {
  return (
    <div className="ix-loading">
      <span className="material-symbols-outlined" style={{ fontSize: 28, color: "var(--ix-primary-light)", animation: "spin 0.9s linear infinite" }}>progress_activity</span>
      <span>{text}</span>
    </div>
  );
}

// ─── Pagination ───────────────────────────────────────────────────────────────
export function Pagination({ page, totalPages, total, pageSize, onChange }) {
  const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const end   = Math.min(page * pageSize, total);
  const icons = [
    { icon: "first_page",    act: () => onChange(1),                          disabled: page === 1          },
    { icon: "chevron_left",  act: () => onChange(Math.max(1, page - 1)),      disabled: page === 1          },
    { icon: "chevron_right", act: () => onChange(Math.min(totalPages, page + 1)), disabled: page === totalPages },
    { icon: "last_page",     act: () => onChange(totalPages),                 disabled: page === totalPages },
  ];
  return (
    <div className="ix-pagination">
      <span style={{ fontSize: 12.5, color: "var(--ix-gray-500)" }}>
        {total === 0 ? "No results" : `Showing ${start}–${end} of ${total.toLocaleString()}`}
      </span>
      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
        {icons.map(({ icon, act, disabled }) => (
          <button key={icon} type="button" onClick={act} disabled={disabled} className="ix-page-btn">
            <span className="material-symbols-outlined" style={{ fontSize: 15 }}>{icon}</span>
          </button>
        ))}
        <span style={{ fontSize: 12.5, padding: "0 6px", color: "var(--ix-gray-500)" }}>
          {page} / {totalPages}
        </span>
      </div>
    </div>
  );
}

// ─── Search + page-size bar ───────────────────────────────────────────────────
export function TableControls({ search, onSearch, pageSize, onPageSize, pageSizeOptions = [10, 25, 50, 100], placeholder = "Search…", children }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", padding: "12px 16px", borderBottom: "1px solid var(--ix-border)" }}>
      {/* Search */}
      <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
        <span className="material-symbols-outlined" style={{ position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)", fontSize: 16, color: "var(--ix-gray-500)", pointerEvents: "none" }}>search</span>
        <input
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          placeholder={placeholder}
          className="ix-input"
          style={{ paddingLeft: 32, height: 34 }}
        />
      </div>
      {/* Additional controls passed as children */}
      {children}
      {/* Page size */}
      <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, color: "var(--ix-gray-500)", whiteSpace: "nowrap", flexShrink: 0 }}>
        Show
        <select
          value={pageSize}
          onChange={(e) => onPageSize(Number(e.target.value))}
          className="ix-input ix-select"
          style={{ width: 72, height: 34, paddingLeft: 8 }}
        >
          {pageSizeOptions.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
      </label>
    </div>
  );
}

// ─── Section card header ──────────────────────────────────────────────────────
export function SectionHeader({ title, actions }) {
  return (
    <div className="ix-section-header" style={{ justifyContent: "space-between" }}>
      <span className="ix-section-title">{title}</span>
      {actions && <div style={{ display: "flex", gap: 8 }}>{actions}</div>}
    </div>
  );
}