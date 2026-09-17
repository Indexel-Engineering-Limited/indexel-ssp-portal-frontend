﻿import { useRef, useState } from "react";
import { createCompaniesBulk, createContactsBulkRows } from "../services/companyService";
import {
  BULK_CONTACT_EXCEL_HEADERS,
  COMPANY_EXCEL_HEADERS,
  CONTACT_DEPARTMENTS,
  downloadBulkContactSampleExcel,
  downloadCompanySampleExcel,
  parseBulkContactsExcel,
  parseCompaniesExcel,
} from "../utils/contactExcel";

import { canWriteModule } from "../services/authService";

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
            {state.details.slice(0, 5).map((item) => (
              <li key={item}>• {item}</li>
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

function UploadCard({
  icon,
  title,
  description,
  headers,
  onDownloadSample,
  onFileSelected,
  inputRef,
  status,
  onDismiss,
  disabled,
  department,
  onDepartmentChange,
}) {
  return (
    <div className="bg-[#f8fafd] rounded-xl border border-[#c5d3e4]/20 p-5 shadow-sm flex flex-col">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg bg-[#dbe5f8] text-[#1e3a8a] flex items-center justify-center shrink-0">
          <span className="material-symbols-outlined text-[22px]">{icon}</span>
        </div>
        <div>
          <h2 className="text-[16px] font-semibold text-[#111827]">{title}</h2>
          <p className="text-[12.5px] text-[#374151] mt-0.5">{description}</p>
        </div>
      </div>

      <div className="mb-4 rounded-lg bg-[#f0f4fa] border border-[#c5d3e4]/30 px-3 py-2">
        <div className="text-[10.5px] font-semibold uppercase tracking-wider text-[#6b7280] mb-1">
          Excel columns
        </div>
        <div className="flex flex-wrap gap-1.5">
          {headers.map((header) => (
            <span
              key={header}
              className="inline-flex items-center px-2 py-0.5 rounded-md bg-[#f8fafd] border border-[#c5d3e4]/40 text-[11px] font-medium text-[#111827]"
            >
              {header}
              {(header === "company_id" || header === "company_name" || header === "industry" || header === "city" || header === "state" || header === "country" || header === "person_name") && (
                <span className="text-[#ba1a1a] ml-0.5">*</span>
              )}
            </span>
          ))}
        </div>
      </div>

      {onDepartmentChange && (
        <label className="mb-4 flex flex-col gap-1 text-[12px] font-medium text-[#374151]">
          Default department
          <select
            value={department}
            onChange={(event) => onDepartmentChange(event.target.value)}
            className="rounded-lg border border-[#c5d3e4]/40 bg-[#f8fafd] px-3 py-2 text-[12.5px] text-[#111827] outline-none focus:border-[#2d55a0]"
          >
            <option value="">Use department from Excel</option>
            {CONTACT_DEPARTMENTS.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </label>
      )}

      <div className="mt-auto flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={onDownloadSample}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#f8fafd] border border-[#c5d3e4]/50 rounded-lg text-[12.5px] font-medium text-[#111827] hover:bg-[#eef2fb] transition-colors shadow-sm"
        >
          <span className="material-symbols-outlined text-[#6b7280] text-[15px]">download</span>
          Sample Excel
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={() => inputRef.current?.click()}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#2d55a0] rounded-lg text-[12.5px] font-medium text-[#ffffff] shadow-sm hover:bg-[#234690] transition-all disabled:opacity-60"
        >
          <span className="material-symbols-outlined text-[15px]">upload_file</span>
          {disabled ? "Uploading..." : "Upload Excel"}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept=".xlsx,.xls,.csv"
          className="hidden"
          onChange={onFileSelected}
        />
      </div>

      <StatusBanner state={status} onDismiss={onDismiss} />
    </div>
  );
}

function summarizeResult({ created, errors }, noun) {
  const createdCount = created.length;
  const failedCount = errors.length;
  const details = errors.map((err) => `Row ${err.row}: ${err.message}`);

  if (!createdCount && failedCount) {
    return {
      status: "error",
      message: `No ${noun} were imported. ${failedCount} row${failedCount === 1 ? "" : "s"} failed.`,
      details,
    };
  }

  if (failedCount) {
    return {
      status: "error",
      message: `Imported ${createdCount} ${noun}. ${failedCount} row${failedCount === 1 ? "" : "s"} failed.`,
      details,
    };
  }

  return {
    status: "success",
    message: `Imported ${createdCount} ${noun} from Excel.`,
    details: [],
  };
}

export default function BulkUploadPage() {
  const companyInputRef = useRef(null);
  const contactInputRef = useRef(null);
  const [companyStatus, setCompanyStatus] = useState(null);
  const [contactStatus, setContactStatus] = useState(null);
  const [uploadingCompanies, setUploadingCompanies] = useState(false);
  const [uploadingContacts, setUploadingContacts] = useState(false);
  const [contactDepartment, setContactDepartment] = useState("");
  const canAddContact=canWriteModule('contacts');
  const canAddCompany=canWriteModule('company_list');

  async function handleCompaniesSelected(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setUploadingCompanies(true);
    setCompanyStatus({ status: "parsing", message: "Reading companies Excel file..." });
    try {
      const { companies, errors } = await parseCompaniesExcel(file);
      if (!companies.length) {
        setCompanyStatus({
          status: "error",
          message: errors[0] ?? "No valid company rows found in the file.",
          details: errors.slice(1),
        });
        return;
      }

      setCompanyStatus({
        status: "uploading",
        message: `Importing ${companies.length} compan${companies.length === 1 ? "y" : "ies"}...`,
      });
      const result = await createCompaniesBulk(companies);
      const summary = summarizeResult(result, result.created.length === 1 ? "company" : "companies");
      if (errors.length) {
        summary.details = [...errors, ...(summary.details ?? [])];
      }
      setCompanyStatus(summary);
    } catch (err) {
      setCompanyStatus({ status: "error", message: err.message });
    } finally {
      setUploadingCompanies(false);
    }
  }

  async function handleContactsSelected(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setUploadingContacts(true);
    setContactStatus({ status: "parsing", message: "Reading contacts Excel file..." });
    try {
      const { contacts, errors } = await parseBulkContactsExcel(file, contactDepartment);
      if (!contacts.length) {
        setContactStatus({
          status: "error",
          message: errors[0] ?? "No valid contact rows found. company_id is required.",
          details: errors.slice(1),
        });
        return;
      }

      setContactStatus({
        status: "uploading",
        message: `Importing ${contacts.length} contact${contacts.length === 1 ? "" : "s"}...`,
      });
      const result = await createContactsBulkRows(contacts);
      const summary = summarizeResult(result, result.created.length === 1 ? "contact" : "contacts");
      if (errors.length) {
        summary.details = [...errors, ...(summary.details ?? [])];
      }
      setContactStatus(summary);
    } catch (err) {
      setContactStatus({ status: "error", message: err.message });
    } finally {
      setUploadingContacts(false);
    }
  }

  return (
    <>
      <div className="mb-5">
        <h1
          className="font-semibold text-[20px] text-[#111827]"
          style={{ fontFamily: "'Hanken Grotesk', sans-serif" }}
        >
          Bulk Upload
        </h1>
        <p className="text-[12.5px] text-[#374151] max-w-2xl mt-1">
          Import companies and contact persons from Excel. Download a sample file first so the column names match the required format.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {canAddCompany &&
        <UploadCard
          icon="apartment"
          title="Bulk companies"
          description="Upload company_name, industry, city, state, and country. Each row creates a new company."
          headers={COMPANY_EXCEL_HEADERS}
          onDownloadSample={downloadCompanySampleExcel}
          onFileSelected={handleCompaniesSelected}
          inputRef={companyInputRef}
          status={companyStatus}
          onDismiss={() => setCompanyStatus(null)}
          disabled={uploadingCompanies}
        />
        }
        
        {
          canAddContact &&
        <UploadCard
          icon="groups"
          title="Bulk contacts"
          description="Upload contacts for existing companies. Choose a default department or include it in the Excel file."
          headers={BULK_CONTACT_EXCEL_HEADERS}
          onDownloadSample={downloadBulkContactSampleExcel}
          onFileSelected={handleContactsSelected}
          inputRef={contactInputRef}
          status={contactStatus}
          onDismiss={() => setContactStatus(null)}
          disabled={uploadingContacts}
          department={contactDepartment}
          onDepartmentChange={setContactDepartment}
        />

         }

      </div>
    </>
  );
}
