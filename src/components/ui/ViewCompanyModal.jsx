﻿import { useState, useEffect } from "react";
import CompanyAvatar from "../company/CompanyAvatar";
import StatusBadge from "../company/StatusBadge";
import { getContactsByCompany } from "../../services/companyService";

export default function ViewCompanyModal({ company, onClose }) {
  const [contacts, setContacts] = useState([]);
  const [contactsLoading, setContactsLoading] = useState(false);
  const [contactsError, setContactsError] = useState(null);

  // Fetch contacts whenever the modal opens with a company
  useEffect(() => {
    if (!company?.rawId) return;
    setContacts([]);
    setContactsError(null);
    setContactsLoading(true);

    getContactsByCompany(company.rawId)
      .then(setContacts)
      .catch((err) => setContactsError(err.message))
      .finally(() => setContactsLoading(false));
  }, [company?.rawId]);

  if (!company) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-[#0f2044]/30 backdrop-blur-sm" onClick={onClose} />

      {/* Side panel */}
      <div className="relative w-full max-w-md h-full bg-[#f8fafd] shadow-2xl flex flex-col overflow-y-auto animate-[slideIn_0.2s_ease-out]">

        {/* ── Header ── */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#d4e0f0]/60 sticky top-0 bg-[#f8fafd] z-10">
          <h2 className="text-[15px] font-semibold text-[#111827]">Company Details</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#6b7280] hover:bg-[#eef2fb] hover:text-[#111827] transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* ── Identity ── */}
        <div className="px-5 py-4 border-b border-[#d4e0f0]/40 flex items-start gap-3">
          <CompanyAvatar name={company.name} logoUrl={company.logoUrl} />
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-[15px] text-[#111827] mb-0.5 truncate">{company.name}</div>
            <div className="text-[11.5px] text-[#374151]">ID: {company.id} &bull; {company.hq}</div>
            <div className="mt-2">
              <StatusBadge status={company.status} />
            </div>
          </div>
        </div>

        {/* ── Description ── */}
        {company.description && (
          <div className="px-5 py-3 border-b border-[#d4e0f0]/40">
            <p className="text-[12.5px] text-[#374151] leading-relaxed">{company.description}</p>
          </div>
        )}

        {/* ── Key details grid ── */}
        <div className="px-5 py-4 grid grid-cols-2 gap-x-4 gap-y-3 border-b border-[#d4e0f0]/40">
          {[
            { label: "Industry",     value: company.industry  || "—" },
            { label: "Location",     value: company.location  || company.hq || "—" },
            { label: "Revenue (TTM)",value: company.revenue   || "—" },
            { label: "Employees",    value: company.employees ? company.employees.toLocaleString() : "—" },
            { label: "Entity Type",  value: company.type      || "—" },
            { label: "Region",       value: company.region    || "—" },
            { label: "Founded",      value: company.founded   || "—" },
          ].map(({ label, value }) => (
            <div key={label}>
              <div className="text-[10.5px] font-semibold uppercase tracking-wider text-[#6b7280] mb-0.5">{label}</div>
              <div className="text-[12.5px] font-medium text-[#111827]">{value}</div>
            </div>
          ))}
        </div>

        {/* ── Website + last activity ── */}
        <div className="px-5 py-3 border-b border-[#d4e0f0]/40 flex flex-col gap-2">
          {company.website && (
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#6b7280] text-[15px]">language</span>
              <a
                href={company.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[12.5px] text-[#2d55a0] hover:underline truncate"
              >
                {company.website}
              </a>
            </div>
          )}
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#6b7280] text-[15px]">schedule</span>
            <span className="text-[12.5px] text-[#374151]">Last activity: {company.lastActivity}</span>
          </div>
          {company.createdAt && (
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#6b7280] text-[15px]">calendar_today</span>
              <span className="text-[12.5px] text-[#374151]">
                Added: {new Date(company.createdAt).toLocaleDateString()}
              </span>
            </div>
          )}
        </div>

        {/* ── Contacts ── */}
        <div className="px-5 py-4 flex-1">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[12.5px] font-semibold text-[#111827] uppercase tracking-wider">Contacts</h3>
            {contacts.length > 0 && (
              <span className="text-[11px] text-[#6b7280]">{contacts.length} contact{contacts.length !== 1 ? "s" : ""}</span>
            )}
          </div>

          {/* Loading */}
          {contactsLoading && (
            <div className="flex items-center gap-2 py-4 justify-center">
              <span className="material-symbols-outlined text-[#a6bcee] text-[20px] animate-spin">progress_activity</span>
              <span className="text-[12px] text-[#374151]">Loading contacts...</span>
            </div>
          )}

          {/* Error */}
          {contactsError && !contactsLoading && (
            <div className="flex items-center gap-2 py-3 px-3 bg-[#ffdad6]/40 rounded-lg">
              <span className="material-symbols-outlined text-[#ba1a1a] text-[16px]">error</span>
              <span className="text-[12px] text-[#ba1a1a]">{contactsError}</span>
            </div>
          )}

          {/* Empty */}
          {!contactsLoading && !contactsError && contacts.length === 0 && (
            <div className="flex flex-col items-center gap-1 py-6 text-center">
              <span className="material-symbols-outlined text-[#a6bcee] text-[28px]">person_off</span>
              <span className="text-[12px] text-[#374151]">No contacts found for this company.</span>
            </div>
          )}

          {/* Contact cards */}
          {!contactsLoading && contacts.length > 0 && (
            <div className="flex flex-col gap-2">
              {contacts.map((c) => (
                <div
                  key={c.id}
                  className="border border-[#d4e0f0]/60 rounded-lg px-4 py-3 bg-[#f0f4fa] hover:bg-[#eef2fb] transition-colors"
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div>
                      <div className="text-[13px] font-semibold text-[#111827]">{c.personName}</div>
                      <div className="text-[11.5px] text-[#374151]">{c.designation || "—"}</div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    {c.email && (
                      <div className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[#6b7280] text-[13px]">mail</span>
                        <a href={`mailto:${c.email}`} className="text-[12px] text-[#2d55a0] hover:underline truncate">
                          {c.email}
                        </a>
                      </div>
                    )}
                    {c.contactNumber && (
                      <div className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[#6b7280] text-[13px]">call</span>
                        <a href={`tel:${c.contactNumber}`} className="text-[12px] text-[#374151] hover:underline">
                          {c.contactNumber}
                        </a>
                      </div>
                    )}
                    {c.address && (
                      <div className="flex items-start gap-1.5">
                        <span className="material-symbols-outlined text-[#6b7280] text-[13px] mt-0.5">location_on</span>
                        <span className="text-[12px] text-[#374151] leading-relaxed">{c.address}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="px-5 py-4 border-t border-[#d4e0f0]/40 sticky bottom-0 bg-[#f8fafd]">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 border border-[#c5d3e4]/50 rounded-lg text-[13px] font-medium text-[#111827] hover:bg-[#eef2fb] transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}