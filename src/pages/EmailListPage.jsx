﻿import { useEffect, useMemo, useRef, useState } from "react";
import * as XLSX from "xlsx";
import ExcelJS from "exceljs";
import TablePagination from "../components/company/TablePagination";
import { createEmailsBulk, getEmailList, deleteEmail } from "../services/companyService";
import { downloadEmailSampleExcel, parseEmailsExcel } from "../utils/contactExcel";
import { canWriteModule } from "../services/authService";

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

export default function EmailListPage() {
  const canEdit = canWriteModule('email_list');
  const [emails, setEmails] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZE_OPTIONS[0]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [uploading, setUploading] = useState(false);
  const emailInputRef = useRef(null);

  async function loadEmails() {
    setLoading(true);
    setError(null);
    try {
      const data = await getEmailList();
      setEmails(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let cancelled = false;

    getEmailList()
      .then((data) => {
        if (!cancelled) setEmails(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const filteredEmails = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return emails;

    return emails.filter((entry) => String(entry.email ?? "").toLowerCase().includes(query));
  }, [emails, search]);

  const totalPages = Math.max(1, Math.ceil(filteredEmails.length / pageSize));
  const paginatedEmails = useMemo(
    () => filteredEmails.slice((page - 1) * pageSize, page * pageSize),
    [filteredEmails, page, pageSize]
  );

  function formatDate(value) {
    if (!value) return "—";
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? "—" : date.toLocaleDateString();
  }

  function exportEmails() {
    const worksheet = XLSX.utils.json_to_sheet(filteredEmails.map((entry) => ({
      email: entry.email,
      created_at: entry.created_at ? new Date(entry.created_at).toLocaleString() : "",
    })));
    worksheet["!cols"] = [{ wch: 38 }, { wch: 22 }];
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Email List");
    XLSX.writeFile(workbook, "email_list.xlsx");
  }

  async function handleEmailUpload(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setUploading(true);
    setUploadStatus({ tone: "info", message: "Reading email Excel file...", details: [] });
    try {
      const { emails: uploadEmails, errors } = await parseEmailsExcel(file);
      if (!uploadEmails.length) {
        setUploadStatus({ tone: "error", message: errors[0] ?? "No valid email rows found.", details: errors.slice(1) });
        return;
      }

      setUploadStatus({ tone: "info", message: `Importing ${uploadEmails.length} email address${uploadEmails.length === 1 ? "" : "es"}...`, details: [] });
      const result = await createEmailsBulk(uploadEmails);
      const duplicateErrors = result.errors.map((entry) => `Row ${entry.row}: ${entry.message}`);
      const details = [...errors, ...duplicateErrors];
      setUploadStatus({
        tone: details.length ? "error" : "success",
        message: `Imported ${result.created.length} email address${result.created.length === 1 ? "" : "es"}.`,
        details,
      });
      await loadEmails();
    } catch (err) {
      setUploadStatus({ tone: "error", message: err.message, details: [] });
    } finally {
      setUploading(false);
    }
  }

  async function handleDeleteEmail(id) {
    if (!id) return;

    const confirmed = window.confirm(
      "Are you sure you want to delete this email?"
    );

    if (!confirmed) return;

    try {
      setError(null);

      await deleteEmail(id);

      // Remove deleted email from UI immediately
      setEmails((prev) => prev.filter((email) => email.id !== id));

      // If current page becomes empty, move to previous page
      if (paginatedEmails.length === 1 && page > 1) {
        setPage((prev) => prev - 1);
      }
    } catch (err) {
      console.error("Delete Email Error:", err);
      setError(err.message || "Failed to delete email");
    }
  }

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-5 gap-4">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2.5">
            <h1 className="font-semibold text-[20px] text-[#111827]" style={{ fontFamily: "'Hanken Grotesk', sans-serif" }}>
              Email List
            </h1>
            <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full bg-[#dbe5f8] text-[11px] font-medium text-[#374151] border border-[#c5d3e4]/30">
              {emails.length.toLocaleString()} Total
            </span>
          </div>
          <p className="text-[12.5px] text-[#374151]">View and search all saved email addresses.</p>
        </div>

        <div className="flex w-full sm:w-auto items-center gap-2">
          {canEdit && <><button type="button" onClick={downloadEmailSampleExcel} className="inline-flex items-center gap-1.5 rounded-lg border border-[#c5d3e4]/50 bg-[#f8fafd] px-3 py-2 text-[12.5px] font-medium text-[#111827] hover:bg-[#f0f4fa]"><span className="material-symbols-outlined text-[16px]">download</span>Sample Excel</button><button type="button" onClick={() => emailInputRef.current?.click()} disabled={uploading} className="inline-flex items-center gap-1.5 rounded-lg bg-[#2d55a0] px-3 py-2 text-[12.5px] font-medium text-white hover:bg-[#234690] disabled:cursor-not-allowed disabled:opacity-50"><span className="material-symbols-outlined text-[16px]">upload_file</span>{uploading ? "Uploading..." : "Upload Excel"}</button><input ref={emailInputRef} type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={handleEmailUpload} /></>}
          <button type="button" onClick={exportEmails} disabled={!filteredEmails.length} className="inline-flex items-center gap-1.5 rounded-lg border border-[#c5d3e4]/50 bg-[#f8fafd] px-3 py-2 text-[12.5px] font-medium text-[#111827] hover:bg-[#f0f4fa] disabled:cursor-not-allowed disabled:opacity-50"><span className="material-symbols-outlined text-[16px]">download</span>Export</button>
          <label className="flex items-center gap-2 text-[12px] text-[#374151] whitespace-nowrap">
            Show
            <select value={pageSize} onChange={(event) => { setPageSize(Number(event.target.value)); setPage(1); }} className="rounded-lg border border-[#c5d3e4]/50 bg-[#f8fafd] px-2 py-2 text-[13px] text-[#111827] outline-none focus:border-[#2d55a0]">
              {PAGE_SIZE_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}
            </select>
          </label>
          <div className="relative flex-1 sm:w-72">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#6b7280] text-[18px]">search</span>
            <input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder="Search email addresses..." className="w-full rounded-lg border border-[#c5d3e4]/50 bg-[#f8fafd] py-2 pl-9 pr-3 text-[13px] text-[#111827] placeholder:text-[#6b7280]/60 outline-none focus:border-[#2d55a0]" />
          </div>
        </div>
      </div>

      {uploadStatus && <div className={`mb-4 rounded-lg px-4 py-3 text-[13px] ${uploadStatus.tone === "error" ? "bg-[#ffdad6]/40 text-[#ba1a1a]" : uploadStatus.tone === "success" ? "bg-[#dbe5f8] text-[#1e3a8a]" : "bg-[#eef2fb] text-[#374151]"}`}><p>{uploadStatus.message}</p>{uploadStatus.details.length > 0 && <ul className="mt-2 space-y-1 text-[12px] opacity-90">{uploadStatus.details.slice(0, 5).map((detail) => <li key={detail}>• {detail}</li>)}{uploadStatus.details.length > 5 && <li>• {uploadStatus.details.length - 5} more...</li>}</ul>}</div>}

      {error && <div className="mb-4 flex items-center justify-between gap-3 rounded-lg border border-[#ffdad6] bg-[#ffdad6]/40 px-4 py-3"><span className="text-[13px] text-[#ba1a1a]">{error}</span><button onClick={loadEmails} className="text-[12px] font-medium text-[#111827] underline">Retry</button></div>}

      {loading ? (
        <div className="bg-[#f8fafd] rounded-xl border border-[#c5d3e4]/20 py-16 flex flex-col items-center gap-2"><span className="material-symbols-outlined text-[#a6bcee] text-[28px] animate-spin">progress_activity</span><span className="text-[13px] text-[#374151]">Loading email list...</span></div>
      ) : (
        <div className="bg-[#f8fafd] rounded-xl border border-[#c5d3e4]/20 overflow-hidden flex flex-col mb-6 shadow-sm">
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#f8fafd] text-[#374151] text-[11px] font-semibold uppercase tracking-wider border-b border-[#d4e0f0]/50">
                  <th className="py-2.5 px-4 text-left">
                    Email Address
                  </th>

                  <th className="py-2.5 px-4 text-left">
                    Type
                  </th>

                  <th className="py-2.5 px-4 text-left">
                    Added On
                  </th>
                  <th className="py-2.5 px-4 text-center">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="text-[13px] text-[#111827]">
                {paginatedEmails.length === 0 ? (
                  <tr>
                    <td
                      colSpan={3}
                      className="py-14 text-center text-[#374151]"
                    >
                      No email addresses match your search.
                    </td>
                  </tr>
                ) : (
                  paginatedEmails.map((entry) => (
                    <tr
                      key={entry.id ?? entry.email}
                      className="border-b border-[#d4e0f0]/40 last:border-0 hover:bg-[#f0f4fa]/45"
                    >
                      {/* Email Address */}
                      <td className="px-4 py-3 font-medium">
                        {entry.email || "—"}
                      </td>

                      {/* Type */}
                      <td className="px-4 py-3 text-[#374151] capitalize">
                        {entry.type || "—"}
                      </td>

                      {/* Created At */}
                      <td className="px-4 py-3 text-[#374151]">
                        {formatDate(entry.created_at)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {canEdit && (
                          <button
                            type="button"
                            onClick={() => handleDeleteEmail(entry.id)}
                            title="Delete email"
                            className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-[#ba1a1a] hover:bg-[#ffdad6]/50 transition-colors"
                          >
                            <span className="material-symbols-outlined text-[19px]">
                              delete
                            </span>
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <TablePagination total={filteredEmails.length} page={page} pageSize={pageSize} totalPages={totalPages} onChange={setPage} />
        </div>
      )}
    </>
  );
}
