import { useRef, useState } from "react";
import { X } from "lucide-react";
import {
  EMPLOYEE_EXCEL_HEADERS,
  downloadEmployeeSampleExcel,
  parseEmployeesExcel,
} from "../../utils/contactExcel";
import { createEmployeesBulk } from "../../services/employeeService";

// ── Status banner (same as BulkUploadPage) ───────────────────────────────────
function StatusBanner({ state, onDismiss }) {
  if (!state) return null;

  const tone =
    state.status === "error"
      ? "bg-[#ffdad6]/40 text-[#ba1a1a]"
      : state.status === "success"
        ? "bg-[#dbe5f8] text-[#1e3a8a]"
        : "bg-[#eef2fb] text-[#374151]";

  return (
    <div className={`mt-4 rounded-lg px-4 py-3 text-[13px] flex items-start justify-between gap-3 ${tone}`}>
      <div>
        <p>{state.message}</p>
        {state.details?.length > 0 && (
          <ul className="mt-2 space-y-1 text-[12px] opacity-90">
            {state.details.slice(0, 5).map((item, i) => (
              <li key={i}>• {item}</li>
            ))}
            {state.details.length > 5 && <li>• {state.details.length - 5} more...</li>}
          </ul>
        )}
      </div>
      <button type="button" className="text-[12px] font-medium underline shrink-0" onClick={onDismiss}>
        Dismiss
      </button>
    </div>
  );
}

function summarizeResult({ created, errors }) {
  const noun = created.length === 1 ? "employee" : "employees";
  const details = errors.map((e) => `Row ${e.row}: ${e.message}`);

  if (!created.length && errors.length) {
    return {
      status: "error",
      message: `No employees were imported. ${errors.length} row${errors.length === 1 ? "" : "s"} failed.`,
      details,
    };
  }

  if (errors.length) {
    return {
      status: "error",
      message: `Imported ${created.length} ${noun}. ${errors.length} row${errors.length === 1 ? "" : "s"} failed.`,
      details,
    };
  }

  return {
    status: "success",
    message: `Imported ${created.length} ${noun} from Excel.`,
    details: [],
  };
}

// ── Main Modal ────────────────────────────────────────────────────────────────
export default function BulkUploadEmployeeModal({ onClose, onDone }) {
  const fileInputRef = useRef(null);
  const [status, setStatus] = useState(null);
  const [uploading, setUploading] = useState(false);

  async function handleFileSelected(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setUploading(true);
    setStatus({ status: "parsing", message: "Reading employees Excel file..." });

    try {
      const { employees, errors } = await parseEmployeesExcel(file);

      if (!employees.length) {
        setStatus({
          status: "error",
          message: errors[0] ?? "No valid employee rows found in the file.",
          details: errors.slice(1),
        });
        return;
      }

      setStatus({
        status: "uploading",
        message: `Importing ${employees.length} employee${employees.length === 1 ? "" : "s"}...`,
      });

      const result = await createEmployeesBulk(employees);
      const summary = summarizeResult(result);

      // Prepend any parse-level errors to details
      if (errors.length) {
        summary.details = [...errors, ...(summary.details ?? [])];
      }

      setStatus(summary);

      // Notify parent to refresh list on success
      if (result.created.length > 0) {
        onDone?.();
      }
    } catch (err) {
      setStatus({ status: "error", message: err.message });
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#e2e9f4]">
          <div>
            <h2 className="text-[17px] font-semibold text-[#111827]">Bulk Upload Employees</h2>
            <p className="text-[12.5px] text-[#374151] mt-0.5">
              Import employees from an Excel file — one row per employee.
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={uploading}
            className="p-2 hover:bg-gray-100 rounded-lg transition disabled:opacity-50"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">

          {/* Column headers preview */}
          <div className="mb-5 rounded-lg bg-[#f0f4fa] border border-[#c5d3e4]/30 px-3 py-2">
            <div className="text-[10.5px] font-semibold uppercase tracking-wider text-[#6b7280] mb-1">
              Excel columns
            </div>
            <div className="flex flex-wrap gap-1.5">
              {EMPLOYEE_EXCEL_HEADERS.map((header) => (
                <span
                  key={header}
                  className="inline-flex items-center px-2 py-0.5 rounded-md bg-[#f8fafd] border border-[#c5d3e4]/40 text-[11px] font-medium text-[#111827]"
                >
                  {header}
                  {(header === "employee_id" || header === "name") && (
                    <span className="text-[#ba1a1a] ml-0.5">*</span>
                  )}
                </span>
              ))}
            </div>
            <p className="text-[11px] text-[#6b7280] mt-1.5">
              <span className="text-[#ba1a1a]">*</span> Required fields.
              Date format for joining_date: YYYY-MM-DD. Gender: Male / Female / Other.
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={downloadEmployeeSampleExcel}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#f8fafd] border border-[#c5d3e4]/50 rounded-lg text-[12.5px] font-medium text-[#111827] hover:bg-[#eef2fb] transition-colors shadow-sm"
            >
              <span className="material-symbols-outlined text-[#6b7280] text-[15px]">download</span>
              Sample Excel
            </button>

            <button
              type="button"
              disabled={uploading}
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#2d55a0] rounded-lg text-[12.5px] font-medium text-white shadow-sm hover:bg-[#234690] transition-all disabled:opacity-60"
            >
              <span className="material-symbols-outlined text-[15px]">upload_file</span>
              {uploading ? "Uploading..." : "Upload Excel"}
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              className="hidden"
              onChange={handleFileSelected}
            />
          </div>

          {/* Status banner */}
          <StatusBanner state={status} onDismiss={() => setStatus(null)} />

        </div>
      </div>
    </div>
  );
}