
import { useEffect, useMemo, useState } from "react";
import TablePagination from "../components/company/TablePagination";
import { getAuditLogById, getAuditLogs } from "../services/auditService";
import { restoreContact } from "../services/companyService";

// ─── Constants ───────────────────────────────────────────────────────────

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

const ALL_ACTIONS = [
  "All",
  "INSERT",
  "UPDATE",
  "DELETE",
  "RESTORE",
];

// ─── Date Formatter ──────────────────────────────────────────────────────

function fmtDate(val) {
  if (!val) return "—";

  const d = new Date(val);

  return isNaN(d.getTime())
    ? val
    : d.toLocaleString();
}

// ─── Action Badge ────────────────────────────────────────────────────────

function ActionBadge({ action }) {
  const map = {
    INSERT: {
      bg: "#dcfce7",
      text: "#166534",
    },

    UPDATE: {
      bg: "#fef9c3",
      text: "#854d0e",
    },

    DELETE: {
      bg: "#fee2e2",
      text: "#991b1b",
    },

    RESTORE: {
      bg: "#dbeafe",
      text: "#1d4ed8",
    },
  };

  const s = map[action] ?? {
    bg: "#f3f4f6",
    text: "#374151",
  };

  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold"
      style={{
        background: s.bg,
        color: s.text,
      }}
    >
      {action ?? "—"}
    </span>
  );
}

// ─── JSON Block ──────────────────────────────────────────────────────────

function JsonBlock({ label, data }) {
  if (!data) return null;

  let display;

  try {
    display =
      typeof data === "string"
        ? JSON.stringify(JSON.parse(data), null, 2)
        : JSON.stringify(data, null, 2);
  } catch {
    display = String(data);
  }

  return (
    <div className="mb-4">
      <p className="text-[10.5px] font-semibold uppercase tracking-wider text-[#6b7280] mb-1">
        {label}
      </p>

      <pre
        className="rounded-lg px-3 py-2.5 text-[11.5px] leading-relaxed overflow-x-auto"
        style={{
          background: "#f8fafd",
          border: "1px solid #e2e9f4",
          color: "#1e3a8a",
          fontFamily: "monospace",
          maxHeight: "200px",
        }}
      >
        {display}
      </pre>
    </div>
  );
}

// ─── Audit Log Detail Drawer ─────────────────────────────────────────────

function LogDetailDrawer({ logId, onClose }) {
  const [log, setLog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!logId) return;

    setLog(null);
    setError(null);
    setLoading(true);

    getAuditLogById(logId)
      .then(setLog)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [logId]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-end">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-[#111827]/25 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className="relative flex h-full w-full max-w-lg flex-col overflow-y-auto bg-white shadow-2xl"
        style={{
          animation: "slideIn .2s ease-out",
        }}
      >
        {/* Header */}
        <div
          className="sticky top-0 z-10 flex items-center justify-between px-5 py-4 bg-white"
          style={{
            borderBottom: "1px solid #e2e9f4",
          }}
        >
          <div>
            <h2 className="text-[15px] font-semibold text-[#111827]">
              Audit Log Detail
            </h2>

            {log && (
              <p className="text-[11.5px] text-[#6b7280] mt-0.5">
                ID #{log.id}
              </p>
            )}
          </div>

          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[#6b7280] hover:bg-[#f0f4fa] hover:text-[#111827]"
          >
            <span className="material-symbols-outlined text-[20px]">
              close
            </span>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 px-5 py-5">
          {/* Loading */}
          {loading && (
            <div className="flex items-center gap-2 py-8 justify-center">
              <span className="material-symbols-outlined animate-spin text-[#a6bcee] text-[24px]">
                progress_activity
              </span>

              <span className="text-[13px] text-[#374151]">
                Loading…
              </span>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="rounded-lg bg-[#fef2f2] border border-[#fecaca] px-4 py-3 text-[13px] text-[#991b1b]">
              {error}
            </div>
          )}

          {/* Log */}
          {log && !loading && (
            <>
              {/* Basic information */}
              <div
                className="grid grid-cols-2 gap-x-4 gap-y-3 mb-5 pb-5"
                style={{
                  borderBottom: "1px solid #e2e9f4",
                }}
              >
                {[
                  {
                    label: "Table",
                    value: log.table_name,
                  },
                  {
                    label: "Action",
                    value: <ActionBadge action={log.action} />,
                  },
                  {
                    label: "Record ID",
                    value: log.record_id,
                  },
                  {
                    label: "User Name",
                    value: log.name,
                  },
                  {
                    label: "User ID",
                    value: log.user_id,
                  },
                  {
                    label: "IP Address",
                    value: log.ip_address,
                  },
                  {
                    label: "Timestamp",
                    value: fmtDate(log.created_at),
                    span: true,
                  },
                ].map(({ label, value, span }) => (
                  <div
                    key={label}
                    className={span ? "col-span-2" : ""}
                  >
                    <p className="text-[10.5px] font-semibold uppercase tracking-wider text-[#6b7280] mb-0.5">
                      {label}
                    </p>

                    <div className="text-[12.5px] font-medium text-[#111827] break-all">
                      {value ?? "—"}
                    </div>
                  </div>
                ))}
              </div>

              {/* Data changes */}
              <JsonBlock
                label="Changes"
                data={log.changes}
              />

              <JsonBlock
                label="New Data"
                data={log.new_data}
              />

              <JsonBlock
                label="Old Data"
                data={log.old_data}
              />

              {/* User Agent */}
              {log.user_agent && (
                <div>
                  <p className="text-[10.5px] font-semibold uppercase tracking-wider text-[#6b7280] mb-1">
                    User Agent
                  </p>

                  <p className="text-[11.5px] text-[#374151] break-all leading-relaxed">
                    {log.user_agent}
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div
          className="sticky bottom-0 bg-white px-5 py-4"
          style={{
            borderTop: "1px solid #e2e9f4",
          }}
        >
          <button
            onClick={onClose}
            className="w-full rounded-lg py-2 text-[13px] font-medium text-[#111827] hover:bg-[#f0f4fa]"
            style={{
              border: "1px solid #e2e9f4",
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────

export default function UserLogsPage() {
  const [logs, setLogs] = useState([]);

  const [search, setSearch] = useState("");

  const [page, setPage] = useState(1);

  const [pageSize, setPageSize] = useState(25);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState(null);

  const [selectedId, setSelectedId] = useState(null);

  const [filterAction, setFilterAction] = useState("All");

  const [filterTable, setFilterTable] = useState("All");

  // ─── Load Logs ────────────────────────────────────────────────────────

  async function loadLogs(action, table) {
    setLoading(true);
    setError(null);

    try {
      const data = await getAuditLogs({
        action,
        table_name: table,
      });

      setLogs(Array.isArray(data) ? data : []);

      setPage(1);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // ─── Initial Load / Filter Change ─────────────────────────────────────

  useEffect(() => {
    loadLogs(filterAction, filterTable);
  }, [filterAction, filterTable]);

  // ─── Table Names ──────────────────────────────────────────────────────

  const tableNames = useMemo(
    () => [
      "All",
      ...Array.from(
        new Set(
          logs
            .map((l) => l.table_name)
            .filter(Boolean)
        )
      ).sort(),
    ],
    [logs]
  );

  // ─── Search ───────────────────────────────────────────────────────────

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();

    if (!q) return logs;

    return logs.filter((l) =>
      [
        l.user_email,
        l.table_name,
        l.action,
        String(l.record_id ?? ""),
        l.ip_address,
      ].some((v) =>
        String(v ?? "")
          .toLowerCase()
          .includes(q)
      )
    );
  }, [logs, search]);

  // ─── Pagination ──────────────────────────────────────────────────────

  const totalPages = Math.max(
    1,
    Math.ceil(filtered.length / pageSize)
  );

  const paginated = useMemo(
    () =>
      filtered.slice(
        (page - 1) * pageSize,
        page * pageSize
      ),
    [filtered, page, pageSize]
  );

  // ─── Card Style ───────────────────────────────────────────────────────

  const cardStyle = {
    background: "#ffffff",
    border: "1px solid #e2e9f4",
    boxShadow: "0 2px 12px rgba(45,85,160,.07)",
  };

  // ─── Restore Contact ─────────────────────────────────────────────────

  const handleRestoreContact = async (log) => {
    try {
      // Only contacts table can be restored from this button
      if (
        log.table_name !==
        "company_contact_details"
      ) {
        return;
      }

      // Only DELETE logs should show restore
      if (log.action !== "DELETE") {
        return;
      }

      // record_id contains the contact ID
      const contactId = log.record_id;

      if (!contactId) {
        alert("Contact ID not found in audit log.");
        return;
      }

      // Confirmation
      const confirmed = window.confirm(
        `Are you sure you want to restore contact #${contactId}?`
      );

      if (!confirmed) {
        return;
      }

      // Call restore API
      await restoreContact(contactId);

      alert("Contact restored successfully.");

      // Refresh logs
      await loadLogs(
        filterAction,
        filterTable
      );
    } catch (error) {
      console.error(
        "Restore Contact Error:",
        error
      );

      alert(
        error.response?.data?.message ||
          error.message ||
          "Failed to restore contact."
      );
    }
  };

  // ─── Render ───────────────────────────────────────────────────────────

  return (
    <>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-5 gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="font-semibold text-[20px] text-[#111827]">
              Audit Logs
            </h1>

            <span
              className="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-[11px] font-medium"
              style={{
                background: "#dbe5f8",
                color: "#1e3a8a",
                border: "1px solid #c5d3e4",
              }}
            >
              {logs.length.toLocaleString()} Total
            </span>
          </div>

          <p className="mt-1 text-[12.5px] text-[#374151]">
            Full audit trail — every INSERT, UPDATE,
            DELETE and RESTORE across all tables.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Action */}
          <select
            value={filterAction}
            onChange={(e) =>
              setFilterAction(e.target.value)
            }
            className="rounded-lg border px-2.5 py-2 text-[12.5px] text-[#111827] outline-none"
            style={{
              borderColor: "#e2e9f4",
              background: "#f8fafd",
            }}
          >
            {ALL_ACTIONS.map((a) => (
              <option key={a}>{a}</option>
            ))}
          </select>

          {/* Table */}
          <select
            value={filterTable}
            onChange={(e) =>
              setFilterTable(e.target.value)
            }
            className="rounded-lg border px-2.5 py-2 text-[12.5px] text-[#111827] outline-none"
            style={{
              borderColor: "#e2e9f4",
              background: "#f8fafd",
            }}
          >
            {tableNames.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>

          {/* Page Size */}
          <label className="flex items-center gap-1.5 text-[12px] text-[#374151] whitespace-nowrap">
            Show

            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(
                  Number(e.target.value)
                );

                setPage(1);
              }}
              className="rounded-lg border px-2 py-2 text-[12.5px] text-[#111827] outline-none"
              style={{
                borderColor: "#e2e9f4",
                background: "#f8fafd",
              }}
            >
              {PAGE_SIZE_OPTIONS.map((o) => (
                <option key={o}>{o}</option>
              ))}
            </select>
          </label>

          {/* Search */}
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#6b7280] text-[17px]">
              search
            </span>

            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search email, table, IP…"
              className="rounded-lg border py-2 pl-9 pr-3 text-[12.5px] text-[#111827] w-52 outline-none"
              style={{
                borderColor: "#e2e9f4",
                background: "#f8fafd",
              }}
            />
          </div>

          {/* Refresh */}
          <button
            onClick={() =>
              loadLogs(
                filterAction,
                filterTable
              )
            }
            className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-[12.5px] font-medium text-[#111827] hover:bg-[#f0f4fa]"
            style={{
              borderColor: "#e2e9f4",
              background: "#f8fafd",
            }}
          >
            <span className="material-symbols-outlined text-[16px]">
              refresh
            </span>

            Refresh
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 flex items-center justify-between gap-3 rounded-lg border border-[#fecaca] bg-[#fef2f2] px-4 py-3">
          <span className="text-[13px] text-[#991b1b]">
            {error}
          </span>

          <button
            onClick={() =>
              loadLogs(
                filterAction,
                filterTable
              )
            }
            className="text-[12px] font-semibold text-[#991b1b] underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div
          className="flex flex-col items-center gap-2 rounded-xl py-16"
          style={cardStyle}
        >
          <span className="material-symbols-outlined animate-spin text-[#a6bcee] text-[28px]">
            progress_activity
          </span>

          <span className="text-[13px] text-[#374151]">
            Loading audit logs…
          </span>
        </div>
      ) : (
        <div
          className="overflow-hidden rounded-xl flex flex-col mb-6"
          style={cardStyle}
        >
          <div className="overflow-x-auto w-full">
            <table
              className="w-full text-left border-collapse"
              style={{
                minWidth: "860px",
              }}
            >
              <thead>
                <tr
                  className="text-[11px] font-semibold uppercase tracking-wider"
                  style={{
                    background: "#f8fafd",
                    borderBottom:
                      "1px solid #e2e9f4",
                    color: "#6b7280",
                  }}
                >
                  <th className="px-4 py-2.5 w-[50px]">
                    #
                  </th>

                  <th className="px-4 py-2.5">
                    Timestamp
                  </th>

                  <th className="px-4 py-2.5">
                    User
                  </th>

                  <th className="px-4 py-2.5">
                    Action
                  </th>

                  <th className="px-4 py-2.5">
                    Table
                  </th>

                  <th className="px-4 py-2.5">
                    Record ID
                  </th>

                  <th className="px-4 py-2.5">
                    IP Address
                  </th>

                  <th className="px-4 py-2.5 text-right">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody className="text-[13px] text-[#111827]">
                {paginated.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="py-14 text-center text-[13px] text-[#374151]"
                    >
                      <div className="flex flex-col items-center gap-2">
                        <span
                          className="material-symbols-outlined text-[30px]"
                          style={{
                            color: "#c5d3e4",
                          }}
                        >
                          manage_search
                        </span>

                        No audit log entries found.
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginated.map((log) => (
                    <tr
                      key={log.id}
                      className="transition-colors cursor-pointer"
                      style={{
                        borderBottom:
                          "1px solid #f0f4fa",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background =
                          "#f8fafd")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background =
                          "transparent")
                      }
                      onClick={() =>
                        setSelectedId(log.id)
                      }
                    >
                      {/* ID */}
                      <td className="px-4 py-3 text-[#6b7280] text-[12px]">
                        {log.id}
                      </td>

                      {/* Timestamp */}
                      <td className="px-4 py-3 text-[#374151] text-[12px] whitespace-nowrap">
                        {fmtDate(
                          log.created_at
                        )}
                      </td>

                      {/* User */}
                      <td className="px-4 py-3">
                        <div className="font-medium text-[#111827] truncate max-w-[180px]">
                          {log.name || "—"}
                        </div>

                        {/* {log.user_id && (
                          <div className="text-[11px] text-[#6b7280]">
                            User #{log.user_id}
                          </div>
                        )} */}
                      </td>

                      {/* Action Badge */}
                      <td className="px-4 py-3">
                        <ActionBadge
                          action={log.action}
                        />
                      </td>

                      {/* Table */}
                      <td className="px-4 py-3">
                        <span
                          className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium"
                          style={{
                            background: "#eef2fb",
                            color: "#2d55a0",
                          }}
                        >
                          {log.table_name ||
                            "—"}
                        </span>
                      </td>

                      {/* Record ID */}
                      <td className="px-4 py-3 text-[#374151]">
                        {log.record_id ?? "—"}
                      </td>

                      {/* IP */}
                      <td className="px-4 py-3 text-[#374151] text-[12px]">
                        {log.ip_address ||
                          "—"}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {/* View */}
                                                    {log.action ===
                            "DELETE" &&
                            log.table_name ===
                              "company_contact_details" && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();

                                  handleRestoreContact(
                                    log
                                  );
                                }}
                                className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11.5px] font-medium hover:bg-green-50"
                                style={{
                                  color:
                                    "#15803d",
                                }}
                                title="Restore Contact"
                              >
                                <span className="material-symbols-outlined text-[15px]">
                                  restore
                                </span>

                                Restore
                              </button>
                            )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedId(
                                log.id
                              );
                            }}
                            className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11.5px] font-medium hover:bg-[#eef2fb]"
                            style={{
                              color: "#2d55a0",
                            }}
                          >
                            <span className="material-symbols-outlined text-[15px]">
                              open_in_new
                            </span>

                            View
                          </button>


                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <TablePagination
            total={filtered.length}
            page={page}
            pageSize={pageSize}
            totalPages={totalPages}
            onChange={setPage}
          />
        </div>
      )}

      {/* Detail Drawer */}
      {selectedId !== null && (
        <LogDetailDrawer
          logId={selectedId}
          onClose={() =>
            setSelectedId(null)
          }
        />
      )}
    </>
  );
}
