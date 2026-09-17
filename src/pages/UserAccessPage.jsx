import { useCallback, useEffect, useState } from "react";
import {
  getCurrentUser,
  getUsers,
} from "../services/authService";

import {
  getAllModules,
  getUserPermissions,
  saveUserPermissions,
} from "../services/permissionService";

// ─────────────────────────────────────────────────────────────────────────────
// Section configuration
// ─────────────────────────────────────────────────────────────────────────────

const SECTION_CONFIG = {
  database: {
    label: "Database",
    icon: "storage",
    order: 1,
  },
  hr: {
    label: "HR Management",
    icon: "badge",
    order: 2,
  },
  admin: {
    label: "Administration",
    icon: "admin_panel_settings",
    order: 3,
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Toggle Component
// ─────────────────────────────────────────────────────────────────────────────

function Toggle({ checked, onChange, disabled = false }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => {
        if (!disabled) {
          onChange(!checked);
        }
      }}
      className="relative inline-flex items-center shrink-0 h-5 w-9 rounded-full transition-all focus:outline-none"
      style={{
        background: checked ? "#2d55a0" : "#d1d5db",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
      }}
    >
      <span
        className="inline-block w-3.5 h-3.5 rounded-full bg-white shadow transition-transform"
        style={{
          transform: checked
            ? "translateX(18px)"
            : "translateX(2px)",
        }}
      />
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────────────────────────────────────

export default function UserAccessPage() {
  const currentUser = getCurrentUser();

  // ───────────────────────────────────────────────────────────────────────────
  // Users
  // ───────────────────────────────────────────────────────────────────────────

  const [users, setUsers] = useState([]);
  const [usersLoad, setUsersLoad] = useState(true);
  const [usersErr, setUsersErr] = useState(null);

  // ───────────────────────────────────────────────────────────────────────────
  // Selected user
  // ───────────────────────────────────────────────────────────────────────────

  const [selectedUser, setSelectedUser] = useState(null);

  // ───────────────────────────────────────────────────────────────────────────
  // Collapsed sections
  // ───────────────────────────────────────────────────────────────────────────

  const [collapsedSections, setCollapsedSections] = useState(
    new Set()
  );

  // ───────────────────────────────────────────────────────────────────────────
  // Modules + Permissions
  // ───────────────────────────────────────────────────────────────────────────

  const [allModules, setAllModules] = useState([]);
  const [localPerms, setLocalPerms] = useState(new Map());

  const [permsLoad, setPermsLoad] = useState(false);
  const [permsErr, setPermsErr] = useState(null);

  // ───────────────────────────────────────────────────────────────────────────
  // Saving
  // ───────────────────────────────────────────────────────────────────────────

  const [saving, setSaving] = useState(false);
  const [saveErr, setSaveErr] = useState(null);
  const [saveOk, setSaveOk] = useState(false);

  // ───────────────────────────────────────────────────────────────────────────
  // Load Users
  // ───────────────────────────────────────────────────────────────────────────

  async function loadUsers() {
    setUsersLoad(true);
    setUsersErr(null);

    try {
      const data = await getUsers();

      setUsers(
        Array.isArray(data)
          ? data
          : []
      );
    } catch (err) {
      setUsersErr(err.message);
    } finally {
      setUsersLoad(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  // ───────────────────────────────────────────────────────────────────────────
  // Load Modules + User Permissions
  // ───────────────────────────────────────────────────────────────────────────

  const loadUserPerms = useCallback(async (user) => {
    setPermsLoad(true);
    setPermsErr(null);
    setSaveOk(false);
    setSaveErr(null);

    try {
      const [modulesRaw, permData] = await Promise.all([
        getAllModules(),
        getUserPermissions(user.id),
      ]);

      const modules = Array.isArray(modulesRaw)
        ? modulesRaw
        : [];

      const permsArr = Array.isArray(
        permData?.permissions
      )
        ? permData.permissions
        : Array.isArray(permData)
        ? permData
        : [];

      setAllModules(modules);

      const map = new Map();

      // Existing user permissions
      permsArr.forEach((p) => {
        map.set(p.module_key, {
          permissionId: p.id,
          canRead: Boolean(p.can_read),
          canWrite: Boolean(p.can_write),
        });
      });

      // Add modules which don't have permissions yet
      modules.forEach((m) => {
        if (!map.has(m.module_key)) {
          map.set(m.module_key, {
            permissionId: m.id,
            canRead: false,
            canWrite: false,
          });
        }
      });

      setLocalPerms(map);
    } catch (err) {
      setPermsErr(err.message);
    } finally {
      setPermsLoad(false);
    }
  }, []);

  // ───────────────────────────────────────────────────────────────────────────
  // Select User
  // ───────────────────────────────────────────────────────────────────────────

  function selectUser(user) {
    setSelectedUser(user);

    // Expand all sections when switching users
    setCollapsedSections(new Set());

    loadUserPerms(user);
  }

  // ───────────────────────────────────────────────────────────────────────────
  // Toggle Section Collapse
  // ───────────────────────────────────────────────────────────────────────────

  function toggleSection(sectionKey) {
    setCollapsedSections((prev) => {
      const next = new Set(prev);

      if (next.has(sectionKey)) {
        next.delete(sectionKey);
      } else {
        next.add(sectionKey);
      }

      return next;
    });
  }

  // ───────────────────────────────────────────────────────────────────────────
  // Toggle Individual Permission
  // ───────────────────────────────────────────────────────────────────────────

  function togglePerm(moduleKey, field, value) {
    setLocalPerms((prev) => {
      const next = new Map(prev);

      const cur =
        next.get(moduleKey) ?? {
          permissionId: null,
          canRead: false,
          canWrite: false,
        };

      const updated = {
        ...cur,
        [field]: value,
      };

      // Write cannot be enabled without Read
      if (field === "canRead" && !value) {
        updated.canWrite = false;
      }

      next.set(moduleKey, updated);

      return next;
    });

    setSaveOk(false);
  }

  // ───────────────────────────────────────────────────────────────────────────
  // Check if Section is Fully Selected
  //
  // A section is ON only when every module has:
  // Read = true
  // Write = true
  // ───────────────────────────────────────────────────────────────────────────

  function isSectionFullySelected(section) {
    if (!section.modules.length) {
      return false;
    }

    return section.modules.every((mod) => {
      const perm = localPerms.get(mod.module_key);

      return (
        perm?.canRead === true &&
        perm?.canWrite === true
      );
    });
  }

  // ───────────────────────────────────────────────────────────────────────────
  // Toggle All Permissions in Section
  // ───────────────────────────────────────────────────────────────────────────

  function toggleSectionPermissions(section, value) {
    setLocalPerms((prev) => {
      const next = new Map(prev);

      section.modules.forEach((mod) => {
        const cur =
          next.get(mod.module_key) ?? {
            permissionId: mod.id,
            canRead: false,
            canWrite: false,
          };

        next.set(mod.module_key, {
          ...cur,
          canRead: value,
          canWrite: value,
        });
      });

      return next;
    });

    setSaveOk(false);
  }

  // ───────────────────────────────────────────────────────────────────────────
  // Save All Changes
  // ───────────────────────────────────────────────────────────────────────────

  async function handleSave() {
    if (!selectedUser) {
      return;
    }

    setSaving(true);
    setSaveErr(null);
    setSaveOk(false);

    try {
      const permissions = [];

      localPerms.forEach((val) => {
        if (val.permissionId !== null) {
          permissions.push({
            permissionId: val.permissionId,
            canRead: val.canRead,
            canWrite: val.canRead
              ? val.canWrite
              : false,
          });
        }
      });

      await saveUserPermissions(
        selectedUser.id,
        permissions
      );

      setSaveOk(true);
    } catch (err) {
      setSaveErr(err.message);
    } finally {
      setSaving(false);
    }
  }

  // ───────────────────────────────────────────────────────────────────────────
  // Group Modules By Section
  // ───────────────────────────────────────────────────────────────────────────

  const modulesBySections = allModules.reduce(
    (acc, mod) => {
      const section =
        mod.section_name || "other";

      if (!acc[section]) {
        acc[section] = [];
      }

      acc[section].push(mod);

      return acc;
    },
    {}
  );

  // ───────────────────────────────────────────────────────────────────────────
  // Sections
  // ───────────────────────────────────────────────────────────────────────────

  const sections = Object.entries(
    modulesBySections
  )
    .map(([key, modules]) => ({
      key,
      label:
        SECTION_CONFIG[key]?.label ||
        key,
      icon:
        SECTION_CONFIG[key]?.icon ||
        "folder",
      order:
        SECTION_CONFIG[key]?.order ||
        999,
      modules,
    }))
    .sort(
      (a, b) =>
        a.order - b.order
    );

  // ───────────────────────────────────────────────────────────────────────────
  // Current User
  // ───────────────────────────────────────────────────────────────────────────

  const isSelf =
    selectedUser?.id ===
    currentUser?.id;

  // ───────────────────────────────────────────────────────────────────────────
  // Card Style
  // ───────────────────────────────────────────────────────────────────────────

  const cardStyle = {
    background: "#ffffff",
    border: "1px solid #e2e9f4",
    boxShadow:
      "0 2px 12px rgba(45,85,160,.07)",
  };

  // ───────────────────────────────────────────────────────────────────────────
  // Render
  // ───────────────────────────────────────────────────────────────────────────

  return (
    <div
      style={{
        fontFamily:
          "'Inter', 'Hanken Grotesk', sans-serif",
      }}
    >
      {/* Page Heading */}

      <div className="mb-5">
        <h1
          className="font-semibold text-[20px]"
          style={{ color: "#111827" }}
        >
          User Access &amp; Permissions
        </h1>

        <p
          className="mt-1 text-[12.5px]"
          style={{ color: "#374151" }}
        >
          Select a user to view and manage
          their module-level permissions
          grouped by sections.
        </p>
      </div>

      {/* Users Error */}

      {usersErr && (
        <div
          className="mb-4 flex items-center justify-between gap-3 rounded-lg px-4 py-3"
          style={{
            border:
              "1px solid #ffdad6",
            background:
              "rgba(255,218,214,0.4)",
          }}
        >
          <span
            className="text-[13px]"
            style={{ color: "#ba1a1a" }}
          >
            {usersErr}
          </span>

          <button
            onClick={loadUsers}
            className="text-[12px] font-medium underline"
            style={{ color: "#111827" }}
          >
            Retry
          </button>
        </div>
      )}

      <div className="flex gap-4 items-start">

        {/* ───────────────────────────────────────────────────────────────────
            LEFT - USERS LIST
        ─────────────────────────────────────────────────────────────────── */}

        <div
          className="rounded-xl overflow-hidden shrink-0"
          style={{
            ...cardStyle,
            width: 300,
          }}
        >
          <div
            className="px-4 py-3"
            style={{
              borderBottom:
                "1px solid #e2e9f4",
            }}
          >
            <span
              className="text-[12px] font-semibold uppercase tracking-wider"
              style={{ color: "#6b7280" }}
            >
              Users
            </span>
          </div>

          {usersLoad ? (
            <div className="py-14 flex flex-col items-center gap-2">
              <span
                className="material-symbols-outlined text-[28px] animate-spin"
                style={{ color: "#a6bcee" }}
              >
                progress_activity
              </span>

              <span
                className="text-[13px]"
                style={{ color: "#374151" }}
              >
                Loading users...
              </span>
            </div>
          ) : (
            <div
              className="overflow-y-auto"
              style={{ maxHeight: 540 }}
            >
              {users.map((user) => {
                const isSelected =
                  selectedUser?.id ===
                  user.id;

                const isSelfRow =
                  user.id ===
                  currentUser?.id;

                return (
                  <div
                    key={user.id}
                    onClick={() =>
                      selectUser(user)
                    }
                    className="px-4 py-3 cursor-pointer transition-colors flex items-center gap-3"
                    style={{
                      borderBottom:
                        "1px solid rgba(212,224,240,0.4)",
                      background:
                        isSelected
                          ? "#eef2fb"
                          : undefined,
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.background =
                          "#f3f6fb";
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background =
                        isSelected
                          ? "#eef2fb"
                          : "";
                    }}
                  >
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-[12px] font-semibold text-white"
                      style={{
                        background:
                          isSelected
                            ? "#2d55a0"
                            : "#c5d3e4",
                      }}
                    >
                      {String(
                        user.name || "U"
                      )
                        .charAt(0)
                        .toUpperCase()}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div
                        className="text-[13px] font-medium truncate"
                        style={{
                          color:
                            isSelected
                              ? "#2d55a0"
                              : "#111827",
                        }}
                      >
                        {user.name}

                        {isSelfRow && (
                          <span
                            className="ml-1.5 text-[10.5px]"
                            style={{
                              color:
                                "#2d55a0",
                            }}
                          >
                            (you)
                          </span>
                        )}
                      </div>

                      <div
                        className="text-[11.5px] truncate"
                        style={{
                          color:
                            "#6b7280",
                        }}
                      >
                        {user.user_name}
                      </div>
                    </div>

                    {isSelected && (
                      <span
                        className="material-symbols-outlined text-[16px] shrink-0"
                        style={{
                          color:
                            "#2d55a0",
                        }}
                      >
                        chevron_right
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ───────────────────────────────────────────────────────────────────
            RIGHT - PERMISSIONS
        ─────────────────────────────────────────────────────────────────── */}

        <div
          className="flex-1 rounded-xl overflow-hidden"
          style={{
            ...cardStyle,
            minHeight: 200,
          }}
        >
          {!selectedUser ? (
            <div className="py-20 flex flex-col items-center gap-2">
              <span
                className="material-symbols-outlined text-[36px]"
                style={{
                  color: "#c5d3e4",
                }}
              >
                manage_accounts
              </span>

              <span
                className="text-[13px]"
                style={{
                  color: "#6b7280",
                }}
              >
                Select a user to manage
                their permissions
              </span>
            </div>
          ) : (
            <>
              {/* Panel Header */}

              <div
                className="px-5 py-3.5 flex items-center justify-between"
                style={{
                  borderBottom:
                    "1px solid #e2e9f4",
                }}
              >
                <div className="flex items-center gap-3">

                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-bold text-white"
                    style={{
                      background:
                        "#2d55a0",
                    }}
                  >
                    {String(
                      selectedUser.name ||
                        "U"
                    )
                      .charAt(0)
                      .toUpperCase()}
                  </div>

                  <div>
                    <p
                      className="text-[13.5px] font-semibold"
                      style={{
                        color:
                          "#111827",
                      }}
                    >
                      {selectedUser.name}
                    </p>

                    <p
                      className="text-[11.5px]"
                      style={{
                        color:
                          "#6b7280",
                      }}
                    >
                      {selectedUser.email_id ||
                        selectedUser.user_name}
                    </p>
                  </div>

                  {isSelf && (
                    <span
                      className="ml-2 text-[11px] px-2.5 py-0.5 rounded-full font-medium"
                      style={{
                        background:
                          "#eef2fb",
                        color:
                          "#2d55a0",
                      }}
                    >
                      Current user —
                      view only
                    </span>
                  )}
                </div>

                {!isSelf && (
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-medium text-white transition-all disabled:opacity-60"
                    style={{
                      background:
                        "#2d55a0",
                      boxShadow:
                        "0 2px 8px rgba(45,85,160,.25)",
                    }}
                  >
                    {saving ? (
                      <>
                        <span className="material-symbols-outlined text-[16px] animate-spin">
                          progress_activity
                        </span>

                        Saving...
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-[16px]">
                          save
                        </span>

                        Save Permissions
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* Save Success */}

              {saveOk && (
                <div
                  className="mx-5 mt-3 flex items-center gap-2 rounded-lg px-4 py-2.5 text-[12.5px] font-medium"
                  style={{
                    background:
                      "#dcfce7",
                    color:
                      "#166534",
                  }}
                >
                  <span className="material-symbols-outlined text-[16px]">
                    check_circle
                  </span>

                  Permissions saved
                  successfully.
                </div>
              )}

              {/* Save Error */}

              {saveErr && (
                <div
                  className="mx-5 mt-3 flex items-center gap-2 rounded-lg px-4 py-2.5 text-[12.5px]"
                  style={{
                    background:
                      "rgba(255,218,214,0.5)",
                    color:
                      "#ba1a1a",
                  }}
                >
                  <span className="material-symbols-outlined text-[16px]">
                    error
                  </span>

                  {saveErr}
                </div>
              )}

              {/* Permissions Error */}

              {permsErr && (
                <div
                  className="mx-5 mt-3 flex items-center justify-between gap-3 rounded-lg px-4 py-3 text-[13px]"
                  style={{
                    border:
                      "1px solid #ffdad6",
                    background:
                      "rgba(255,218,214,0.4)",
                    color:
                      "#ba1a1a",
                  }}
                >
                  <span>
                    {permsErr}
                  </span>

                  <button
                    onClick={() =>
                      loadUserPerms(
                        selectedUser
                      )
                    }
                    className="text-[12px] font-medium underline"
                    style={{
                      color:
                        "#111827",
                    }}
                  >
                    Retry
                  </button>
                </div>
              )}

              {/* ─────────────────────────────────────────────────────────────
                  Permissions Sections
              ───────────────────────────────────────────────────────────── */}

              {permsLoad ? (
                <div className="py-14 flex flex-col items-center gap-2">

                  <span
                    className="material-symbols-outlined text-[28px] animate-spin"
                    style={{
                      color:
                        "#a6bcee",
                    }}
                  >
                    progress_activity
                  </span>

                  <span
                    className="text-[13px]"
                    style={{
                      color:
                        "#374151",
                    }}
                  >
                    Loading permissions...
                  </span>

                </div>
              ) : (
                <div
                  className="px-5 py-4 space-y-4 overflow-y-auto"
                  style={{
                    maxHeight: 600,
                  }}
                >
                  {sections.map(
                    (section) => {
                      const isCollapsed =
                        collapsedSections.has(
                          section.key
                        );

                      const sectionSelected =
                        isSectionFullySelected(
                          section
                        );

                      return (
                        <div
                          key={
                            section.key
                          }
                          className="rounded-lg border"
                          style={{
                            borderColor:
                              "#e2e9f4",
                            background:
                              "#f8fafd",
                          }}
                        >

                          {/* ─────────────────────────────────────────────
                              Section Header
                          ───────────────────────────────────────────── */}

                          <div
                            className="w-full px-4 py-3 flex items-center gap-2 border-b"
                            style={{
                              borderColor:
                                "#e2e9f4",
                              background:
                                "#ffffff",
                            }}
                          >

                            {/* Collapse / Expand */}

                            <button
                              type="button"
                              onClick={() =>
                                toggleSection(
                                  section.key
                                )
                              }
                              className="flex items-center gap-2 flex-1 text-left cursor-pointer min-w-0"
                            >
                              <div
                                className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                                style={{
                                  background:
                                    "#eef2fb",
                                }}
                              >
                                <span
                                  className="material-symbols-outlined text-[16px]"
                                  style={{
                                    color:
                                      "#2d55a0",
                                  }}
                                >
                                  {
                                    section.icon
                                  }
                                </span>
                              </div>

                              <h3
                                className="text-[13px] font-semibold"
                                style={{
                                  color:
                                    "#111827",
                                }}
                              >
                                {
                                  section.label
                                }
                              </h3>

                              <span
                                className="text-[11px] px-2 py-0.5 rounded-full"
                                style={{
                                  background:
                                    "#e2e9f4",
                                  color:
                                    "#6b7280",
                                }}
                              >
                                {
                                  section
                                    .modules
                                    .length
                                }{" "}
                                {section.modules
                                  .length ===
                                1
                                  ? "module"
                                  : "modules"}
                              </span>

                              <span
                                className="material-symbols-outlined text-[18px] ml-1"
                                style={{
                                  color:
                                    "#6b7280",
                                  transform:
                                    isCollapsed
                                      ? "rotate(0deg)"
                                      : "rotate(180deg)",
                                  transition:
                                    "transform 0.2s",
                                }}
                              >
                                expand_more
                              </span>
                            </button>

                            {/* ─────────────────────────────────────────
                                SELECT ALL TOGGLE
                            ───────────────────────────────────────── */}

                            <div
                              className="flex items-center gap-2 shrink-0"
                              onClick={(e) =>
                                e.stopPropagation()
                              }
                            >
                              <span
                                className="text-[11px] font-medium"
                                style={{
                                  color:
                                    "#6b7280",
                                }}
                              >
                                Select All
                              </span>

                              <Toggle
                                checked={
                                  sectionSelected
                                }
                                onChange={(
                                  value
                                ) =>
                                  toggleSectionPermissions(
                                    section,
                                    value
                                  )
                                }
                                disabled={
                                  isSelf
                                }
                              />
                            </div>
                          </div>

                          {/* ─────────────────────────────────────────────
                              Modules
                          ───────────────────────────────────────────── */}

                          <div
                            style={{
                              maxHeight:
                                isCollapsed
                                  ? "0px"
                                  : "2000px",
                              overflow:
                                "hidden",
                              transition:
                                "max-height 0.3s ease-in-out",
                            }}
                          >
                            <div className="p-4 grid grid-cols-1 gap-2">

                              {section.modules.map(
                                (mod) => {
                                  const perm =
                                    localPerms.get(
                                      mod.module_key
                                    ) ?? {
                                      permissionId:
                                        mod.id,
                                      canRead:
                                        false,
                                      canWrite:
                                        false,
                                    };

                                  return (
                                    <div
                                      key={
                                        mod.id
                                      }
                                      className="flex items-center justify-between gap-4 px-4 py-3 rounded-lg"
                                      style={{
                                        background:
                                          "#ffffff",
                                        border:
                                          "1px solid #e2e9f4",
                                      }}
                                    >

                                      {/* Module Info */}

                                      <div className="flex items-center gap-3 min-w-0 flex-1">

                                        <div
                                          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                                          style={{
                                            background:
                                              perm.canRead
                                                ? "#eef2fb"
                                                : "#f3f4f6",
                                          }}
                                        >
                                          <span
                                            className="material-symbols-outlined text-[16px]"
                                            style={{
                                              color:
                                                perm.canRead
                                                  ? "#2d55a0"
                                                  : "#9ca3af",
                                            }}
                                          >
                                            {
                                              mod.icon
                                            }
                                          </span>
                                        </div>

                                        <div className="min-w-0">

                                          <p
                                            className="text-[13px] font-medium truncate"
                                            style={{
                                              color:
                                                "#111827",
                                            }}
                                          >
                                            {
                                              mod.module_name
                                            }
                                          </p>

                                          <p
                                            className="text-[11px] truncate"
                                            style={{
                                              color:
                                                "#6b7280",
                                            }}
                                          >
                                            {
                                              mod.description
                                            }
                                          </p>

                                        </div>
                                      </div>

                                      {/* Read / Write Toggles */}

                                      <div className="flex items-center gap-6 shrink-0">

                                        {/* Read */}

                                        <div className="flex items-center gap-2">

                                          <span
                                            className="text-[11px] font-medium"
                                            style={{
                                              color:
                                                "#6b7280",
                                            }}
                                          >
                                            Read
                                          </span>

                                          <Toggle
                                            checked={
                                              perm.canRead
                                            }
                                            onChange={(
                                              value
                                            ) =>
                                              togglePerm(
                                                mod.module_key,
                                                "canRead",
                                                value
                                              )
                                            }
                                            disabled={
                                              isSelf
                                            }
                                          />

                                        </div>

                                        {/* Write */}

                                        <div className="flex items-center gap-2">

                                          <span
                                            className="text-[11px] font-medium"
                                            style={{
                                              color:
                                                "#6b7280",
                                            }}
                                          >
                                            Write
                                          </span>

                                          <Toggle
                                            checked={
                                              perm.canWrite
                                            }
                                            onChange={(
                                              value
                                            ) =>
                                              togglePerm(
                                                mod.module_key,
                                                "canWrite",
                                                value
                                              )
                                            }
                                            disabled={
                                              isSelf ||
                                              !perm.canRead
                                            }
                                          />

                                        </div>

                                      </div>
                                    </div>
                                  );
                                }
                              )}

                            </div>
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}