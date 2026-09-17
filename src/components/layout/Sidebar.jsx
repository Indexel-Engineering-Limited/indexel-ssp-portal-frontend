import { NavLink, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import logo from "../../assets/logo.png";
import { getPermissions } from "../../services/authService";

const ROUTE_MAP = {
  dashboard: {
    to: "/dashboard",
    end: true,
  },

  company_list: {
    to: "/companies",
    end: true,
  },

  contacts: {
    to: "/contacts",
    end: true,
  },

  email_list: {
    to: "/emails",
    end: true,
  },

  bulk_upload: {
    to: "/bulk-upload",
    end: false,
  },

  user_access: {
    to: "/user-access",
    end: false,
  },

  user_logs: {
    to: "/user-logs",
    end: false,
  },

  users: {
    to: "/users",
    end: false,
  },

  // HR
  employee_list: {
    to: "/hr-management",
    end: true,
  },
};

// Always-visible account items


function buildNavItems() {
  const perms = getPermissions();

  const items = perms
    .filter(
      (p) =>
        Boolean(p.can_read) &&
        ROUTE_MAP[p.module_key]
    )
    .map((p) => ({
      id: p.id,
      icon: p.icon,
      label: p.module_name,
      to: ROUTE_MAP[p.module_key].to,
      end: ROUTE_MAP[p.module_key].end,
      section_name:
        p.section_name?.toLowerCase().trim() || "other",
    }));

  // Group modules by section_name
  const sections = items.reduce((sections, item) => {
    const section = item.section_name;

    if (!sections[section]) {
      sections[section] = [];
    }

    sections[section].push(item);

    return sections;
  }, {});

  /*
   * Add Change Password to Account section.
   *
   * If Account already exists from API:
   *   add Change Password to existing Account section.
   *
   * If Account doesn't exist:
   *   create Account section.
   */
  const changePasswordItem = {
    id: "change-password",
    icon: "lock_reset",
    label: "Change Password",
    to: "/password",
    end: false,
    section_name: "account",
  };
   const SignatureItem = {
    id: "change-password",
    icon: "draw",
    label: "Company Signature",
    to: "/signature",
    end: false,
    section_name: "account",
  };

  if (sections.account) {
    sections.account.push(changePasswordItem);
    sections.account.push(SignatureItem);
  } else {
    sections.account = [changePasswordItem,SignatureItem];
  }

  return sections;
}

// Reusable NavLink item
function NavItem({ item }) {
  return (
    <NavLink
      key={item.to}
      to={item.to}
      end={item.end}
      className={({ isActive }) =>
        [
          "flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all text-[12.5px] font-medium relative",
          isActive
            ? "bg-[#eef2fb] text-[#2d55a0]"
            : "text-[#374151] hover:bg-[#f3f6fb] hover:text-[#111827]",
        ].join(" ")
      }
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <span
              className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full"
              style={{ background: "#2d55a0" }}
            />
          )}

          <span
            className="material-symbols-outlined text-[17px] shrink-0"
            style={{
              color: isActive ? "#2d55a0" : undefined,
            }}
          >
            {item.icon}
          </span>

          <span className="truncate">
            {item.label}
          </span>
        </>
      )}
    </NavLink>
  );
}

export default function Sidebar({ open, onClose }) {
  const navItems = buildNavItems();
  const location = useLocation();

  /*
   * Store expanded/collapsed state for each section.
   *
   * Example:
   * {
   *   database: true,
   *   hr: false
   * }
   */
  const [expandedSections, setExpandedSections] = useState(() => {
    const sections = Object.keys(navItems);

    return sections.reduce((acc, section) => {
      acc[section] = true;
      return acc;
    }, {});
  });

  // Toggle section
  const toggleSection = (sectionName) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionName]: !prev[sectionName],
    }));
  };

  // Close drawer on route change
  useEffect(() => {
    onClose();
  }, [location.pathname]);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const sidebarContent = (
    <aside
      className="flex h-full w-[220px] flex-col"
      style={{
        background: "#ffffff",
        fontFamily: "'Inter', 'Hanken Grotesk', sans-serif",
      }}
    >
      {/* Logo */}
      <div
        className="h-14 flex items-center px-4 gap-3 shrink-0 bg-white"
        style={{
          borderBottom: "1px solid #e2e9f4",
        }}
      >
        <div className="h-8 w-10 shrink-0 flex items-center justify-center rounded-lg bg-[#f4f7fc] border border-[#e2e9f4]">
          <img
            alt="Self Service Portal"
            className="h-8 w-8 object-contain"
            src={logo}
          />
        </div>

        {/* Portal Name */}
        <div className="min-w-0 flex-1">
          <div className="font-bold text-[13px] text-[#172033] leading-tight tracking-[-0.2px] truncate">
            Self Service Portal
          </div>

          <div className="text-[9px] font-medium text-[#7a8699] uppercase tracking-[0.08em] mt-0.5">
            Employee Services
          </div>
        </div>

        {/* Mobile Close */}
        <button
          type="button"
          onClick={onClose}
          className="ml-auto flex lg:hidden h-8 w-8 items-center justify-center rounded-lg text-[#6b7280] hover:bg-[#f3f6fb] hover:text-[#111827] transition-colors"
        >
          <span className="material-symbols-outlined text-[20px]">
            close
          </span>
        </button>
      </div>

      {/* Main Menu */}

      <nav className="flex-1 px-2 pt-4 overflow-y-auto">
        {Object.entries(navItems)
          .filter(([sectionName]) => sectionName !== "account")
          .map(([sectionName, items]) => {
            const isExpanded = expandedSections[sectionName];

            const hasActiveItem = items.some((item) => {
              if (item.end) {
                return location.pathname === item.to;
              }

              return location.pathname.startsWith(item.to);
            });

            return (
              <div
                key={sectionName}
                className="mb-3"
              >
                {/* Section Heading */}
                <button
                  type="button"
                  onClick={() => toggleSection(sectionName)}
                  className={`
              w-full flex items-center justify-between
              px-2 py-2 rounded-lg
              transition-all duration-200
              group
              ${hasActiveItem
                      ? "bg-[#f5f7fc]"
                      : "hover:bg-[#f7f9fc]"
                    }
            `}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className={`
                  material-symbols-outlined
                  text-[15px]
                  transition-all duration-200
                  ${hasActiveItem
                          ? "text-[#2d55a0]"
                          : "text-[#7a8699] group-hover:text-[#2d55a0]"
                        }
                `}
                    >
                      {sectionName === "database"
                        ? "database"
                        : sectionName === "hr"
                          ? "badge"
                          : "folder"}
                    </span>

                    <span
                      className={`
                  text-[9.5px]
                  font-semibold
                  uppercase
                  tracking-[0.16em]
                  truncate
                  transition-colors
                  duration-200
                  ${hasActiveItem
                          ? "text-[#2d55a0]"
                          : "text-[#6b7280] group-hover:text-[#374151]"
                        }
                `}
                    >
                      {sectionName}
                    </span>
                  </div>

                  {/* Expand / Collapse */}
                  <span
                    className={`
                flex items-center justify-center
                w-6 h-6
                rounded-full
                border
                transition-all
                duration-200
                ${isExpanded
                        ? "bg-[#eef2fb] border-[#d7e0f2]"
                        : "bg-white border-[#e2e9f4] group-hover:bg-[#eef2fb] group-hover:border-[#d7e0f2]"
                      }
              `}
                  >
                    <span
                      className={`
                  material-symbols-outlined
                  text-[17px]
                  transition-transform
                  duration-300
                  ${isExpanded
                          ? "rotate-90 text-[#2d55a0]"
                          : "text-[#7a8699] group-hover:text-[#2d55a0]"
                        }
                `}
                    >
                      keyboard_arrow_right
                    </span>
                  </span>
                </button>

                {/* Modules */}
                <div
                  className={`
              overflow-hidden
              transition-all
              duration-300
              ease-in-out
              ${isExpanded
                      ? "max-h-[500px] opacity-100 translate-y-0"
                      : "max-h-0 opacity-0 -translate-y-1"
                    }
            `}
                >
                  <div className="space-y-0.5 pt-0.5">
                    {items.map((item) => (
                      <NavItem
                        key={item.id || item.to}
                        item={item}
                      />
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
      </nav>

      {/* Account - Bottom Section */}
      <div
        className="shrink-0"
        style={{
          borderTop: "1px solid #e2e9f4",
        }}
      >
        {navItems.account && (
          <div className="px-2 pt-2 pb-2">
            {(() => {
              const sectionName = "account";
              const items = navItems.account;
              const isExpanded = expandedSections[sectionName];

              const hasActiveItem = items.some((item) => {
                if (item.end) {
                  return location.pathname === item.to;
                }

                return location.pathname.startsWith(item.to);
              });

              return (
                <>
                  {/* Account Heading */}
                  <button
                    type="button"
                    onClick={() => toggleSection(sectionName)}
                    className={`
                w-full flex items-center justify-between
                px-2 py-2 rounded-lg
                transition-all duration-200
                group
                ${hasActiveItem
                        ? "bg-[#f5f7fc]"
                        : "hover:bg-[#f7f9fc]"
                      }
              `}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className={`
                    material-symbols-outlined
                    text-[15px]
                    transition-colors duration-200
                    ${hasActiveItem
                            ? "text-[#2d55a0]"
                            : "text-[#7a8699] group-hover:text-[#2d55a0]"
                          }
                  `}
                      >
                        person
                      </span>

                      <span
                        className={`
                    text-[9.5px]
                    font-semibold
                    uppercase
                    tracking-[0.16em]
                    transition-colors duration-200
                    ${hasActiveItem
                            ? "text-[#2d55a0]"
                            : "text-[#6b7280] group-hover:text-[#374151]"
                          }
                  `}
                      >
                        Account
                      </span>
                    </div>

                    {/* Arrow */}
                    <span
                      className={`
                  flex items-center justify-center
                  w-6 h-6
                  rounded-full
                  border
                  transition-all duration-200
                  ${isExpanded
                          ? "bg-[#eef2fb] border-[#d7e0f2]"
                          : "bg-white border-[#e2e9f4] group-hover:bg-[#eef2fb] group-hover:border-[#d7e0f2]"
                        }
                `}
                    >
                      <span
                        className={`
                    material-symbols-outlined
                    text-[17px]
                    transition-transform duration-300
                    ${isExpanded
                            ? "rotate-90 text-[#2d55a0]"
                            : "text-[#7a8699] group-hover:text-[#2d55a0]"
                          }
                  `}
                      >
                        keyboard_arrow_right
                      </span>
                    </span>
                  </button>

                  {/* Account Items */}
                  <div
                    className={`
                overflow-hidden
                transition-all
                duration-300
                ease-in-out
                ${isExpanded
                        ? "max-h-[300px] opacity-100"
                        : "max-h-0 opacity-0"
                      }
              `}
                  >
                    <div className="space-y-0.5 pt-0.5">
                      {items.map((item) => (
                        <NavItem
                          key={item.id || item.to}
                          item={item}
                        />
                      ))}
                    </div>
                  </div>
                </>
              );
            })()}
          </div>
        )}
      </div>
     
    </aside>
  );

  return (
    <>
      {/* Desktop */}
      <div
        className="hidden lg:flex fixed left-0 top-0 h-full w-[220px] z-50 flex-col"
        style={{
          borderRight: "1px solid #e2e9f4",
          boxShadow:
            "2px 0 12px rgba(45,85,160,0.06)",
        }}
      >
        {sidebarContent}
      </div>

      {/* Mobile */}
      {open && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="absolute inset-0"
            style={{
              background: "rgba(17,24,39,0.45)",
              backdropFilter: "blur(2px)",
            }}
            onClick={onClose}
          />

          <div
            className="relative z-10 flex flex-col"
            style={{
              boxShadow:
                "4px 0 24px rgba(45,85,160,0.15)",
              animation:
                "slideInLeft .22s ease-out",
            }}
          >
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}