﻿
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import CompanyAvatar from "../components/company/CompanyAvatar";
import AddContactModal from "../components/ui/AddContactModal";

import {
  createContact,
  createContactsBulk,
  getAllCompanies,
  getContactsByCompany,
  updateContact,
  deleteContact,
} from "../services/companyService";

import {
  formatDate,
  normalizeCompany,
  normalizeContact,
} from "../utils/mappers";

import {
  downloadContactSampleExcel,
  parseContactsExcel,
} from "../utils/contactExcel";

import { canWriteModule } from "../services/authService";

export default function CompanyDetailsPage() {
  const canEdit = canWriteModule("contacts");

  const { companyId } = useParams();
  const location = useLocation();
  const fileInputRef = useRef(null);

  // ─── Company / Contacts state ────────────────────────────────────────

  const [company, setCompany] = useState(
    location.state?.company ?? null
  );

  const [contacts, setContacts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ─── Add contact ─────────────────────────────────────────────────────

  const [showAddContact, setShowAddContact] = useState(false);

  // ─── Excel upload ────────────────────────────────────────────────────

  const [uploadState, setUploadState] = useState(null);

  // ─── Contact actions ─────────────────────────────────────────────────

  const [openMenuId, setOpenMenuId] = useState(null);

  const [editingContact, setEditingContact] = useState(null);

  const [deletingContact, setDeletingContact] = useState(null);

  const [actionLoading, setActionLoading] = useState(false);

  const numericId = companyId;

  // ─── Load company + contacts ─────────────────────────────────────────

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [companiesData, contactsData] = await Promise.all([
        getAllCompanies(),
        getContactsByCompany(numericId),
      ]);

      const companies = Array.isArray(companiesData)
        ? companiesData
            .map(normalizeCompany)
            .filter(Boolean)
        : [];

      const found = companies.find(
        (c) => String(c.id) === String(companyId)
      );

      if (found) {
        setCompany(found);
      }

      setContacts(
        (Array.isArray(contactsData) ? contactsData : [])
          .map(normalizeContact)
          .filter(Boolean)
      );
    } catch (err) {
      setError(err.message || "Failed to load company details");
    } finally {
      setLoading(false);
    }
  }, [companyId, numericId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ─── Sorted contacts ─────────────────────────────────────────────────

  const sortedContacts = useMemo(
    () =>
      [...contacts].sort((a, b) =>
        String(a.person_name || "").localeCompare(
          String(b.person_name || "")
        )
      ),
    [contacts]
  );

  // ─── Add contact ─────────────────────────────────────────────────────

  async function handleAddContact(payload) {
    try {
      const created = await createContact(numericId, payload);

      const contact = normalizeContact(
        created?.id
          ? created
          : {
              ...payload,
              ...created,
            }
      );

      if (contact?.id) {
        setContacts((prev) => [contact, ...prev]);
      } else {
        await loadData();
      }

      setShowAddContact(false);
    } catch (err) {
      throw err;
    }
  }

  // ─── Update contact ──────────────────────────────────────────────────

  async function handleUpdateContact(payload) {
    if (!editingContact?.id) return;

    try {
      setActionLoading(true);
      setError(null);

      const updated = await updateContact(
        editingContact.id,
        {
          ...payload,

          // Make sure company_id is always sent
          company_id:
            payload.company_id ||
            editingContact.company_id ||
            numericId,
        }
      );

      const updatedContact = normalizeContact(
        updated?.id
          ? updated
          : {
              ...editingContact,
              ...payload,
              ...updated,
            }
      );

      setContacts((prev) =>
        prev.map((contact) =>
          String(contact.id) === String(editingContact.id)
            ? updatedContact
            : contact
        )
      );

      setEditingContact(null);
      setOpenMenuId(null);
    } catch (err) {
      setError(err.message || "Failed to update contact");
    } finally {
      setActionLoading(false);
    }
  }

  // ─── Delete contact ──────────────────────────────────────────────────

  async function handleDeleteContact() {
    if (!deletingContact?.id) return;

    try {
      setActionLoading(true);
      setError(null);

      await deleteContact(deletingContact.id);

      setContacts((prev) =>
        prev.filter(
          (contact) =>
            String(contact.id) !==
            String(deletingContact.id)
        )
      );

      setDeletingContact(null);
      setOpenMenuId(null);
    } catch (err) {
      setError(err.message || "Failed to delete contact");
    } finally {
      setActionLoading(false);
    }
  }

  // ─── Excel upload ────────────────────────────────────────────────────

  async function handleExcelSelected(event) {
    const file = event.target.files?.[0];

    event.target.value = "";

    if (!file) return;

    setUploadState({
      status: "parsing",
      message: "Reading Excel file...",
    });

    try {
      const { contacts: rows, errors } =
        await parseContactsExcel(file);

      if (!rows.length) {
        setUploadState({
          status: "error",
          message:
            errors[0] ??
            "No valid contact rows found in the file.",
        });

        return;
      }

      setUploadState({
        status: "uploading",
        message: `Importing ${rows.length} contact${
          rows.length === 1 ? "" : "s"
        }...`,
      });

      const {
        created,
        errors: apiErrors,
      } = await createContactsBulk(numericId, rows);

      const normalized = created
        .map(normalizeContact)
        .filter(Boolean);

      if (normalized.length) {
        setContacts((prev) => [
          ...normalized,
          ...prev,
        ]);
      }

      if (apiErrors.length) {
        setUploadState({
          status: "error",
          message: `Imported ${
            created.length
          } contact(s). ${
            apiErrors.length
          } row(s) failed: ${
            apiErrors[0].message
          }`,
        });
      } else {
        setUploadState({
          status: "success",
          message: `Imported ${
            created.length
          } contact${
            created.length === 1 ? "" : "s"
          } from Excel.`,
        });
      }
    } catch (err) {
      setUploadState({
        status: "error",
        message:
          err.message || "Failed to upload Excel file",
      });
    }
  }

  // ─── Render ──────────────────────────────────────────────────────────

  return (
    <>
      {/* ================================================================
          PAGE HEADER
      ================================================================ */}

      <div className="mb-5">
        <Link
          to="/companies"
          className="inline-flex items-center gap-1 text-[12.5px] font-medium text-[#374151] hover:text-[#111827] mb-3"
        >
          <span className="material-symbols-outlined text-[16px]">
            arrow_back
          </span>

          Back to directory
        </Link>

        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
          {/* Company information */}

          <div className="flex items-start gap-3 min-w-0">
            <CompanyAvatar
              name={company?.company_name || "Company"}
            />

            <div className="min-w-0">
              <h1
                className="font-semibold text-[20px] text-[#111827] truncate"
                style={{
                  fontFamily:
                    "'Hanken Grotesk', sans-serif",
                }}
              >
                {company?.company_name ||
                  "Company details"}
              </h1>

              <p className="text-[12.5px] text-[#374151]">
                ID {companyId}

                {company?.location
                  ? ` • ${company.location}`
                  : ""}

                {company?.industry
                  ? ` • ${company.industry}`
                  : ""}
              </p>
            </div>
          </div>

          {/* Header actions */}

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={downloadContactSampleExcel}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#f8fafd] border border-[#c5d3e4]/50 rounded-lg text-[12.5px] font-medium text-[#111827] hover:bg-[#eef2fb] transition-colors shadow-sm"
            >
              <span className="material-symbols-outlined text-[#6b7280] text-[15px]">
                description
              </span>

              Sample Excel
            </button>

            <button
              type="button"
              disabled={!canEdit}
              onClick={() =>
                fileInputRef.current?.click()
              }
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#f8fafd] border border-[#c5d3e4]/50 rounded-lg text-[12.5px] font-medium text-[#111827] hover:bg-[#eef2fb] transition-colors shadow-sm disabled:cursor-not-allowed disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[#6b7280] text-[15px]">
                upload_file
              </span>

              Upload Excel
            </button>

            <button
              type="button"
              disabled={!canEdit}
              onClick={() =>
                setShowAddContact(true)
              }
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#2d55a0] rounded-lg text-[12.5px] font-medium text-[#ffffff] shadow-sm hover:bg-[#234690] transition-all disabled:cursor-not-allowed disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[15px]">
                person_add
              </span>

              Add Contact
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              className="hidden"
              onChange={handleExcelSelected}
            />
          </div>
        </div>
      </div>

      {/* ================================================================
          UPLOAD MESSAGE
      ================================================================ */}

      {uploadState && (
        <div
          className={[
            "mb-4 rounded-lg px-4 py-3 text-[13px] flex items-start justify-between gap-3",

            uploadState.status === "error"
              ? "bg-[#ffdad6]/40 text-[#ba1a1a]"
              : uploadState.status === "success"
              ? "bg-[#dbe5f8] text-[#1e3a8a]"
              : "bg-[#eef2fb] text-[#374151]",
          ].join(" ")}
        >
          <span>{uploadState.message}</span>

          <button
            type="button"
            className="text-[12px] font-medium underline shrink-0"
            onClick={() =>
              setUploadState(null)
            }
          >
            Dismiss
          </button>
        </div>
      )}

      {/* ================================================================
          ERROR MESSAGE
      ================================================================ */}

      {error && (
        <div className="mb-4 flex items-center justify-between gap-3 rounded-lg border border-[#ffdad6] bg-[#ffdad6]/40 px-4 py-3">
          <span className="text-[13px] text-[#ba1a1a]">
            {error}
          </span>

          <button
            onClick={loadData}
            className="text-[12px] font-medium text-[#111827] underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* ================================================================
          COMPANY DETAILS
      ================================================================ */}

      <div className="grid grid-cols-1 gap-4 mb-6">
        <div className="bg-[#f8fafd] rounded-xl border border-[#c5d3e4]/20 p-5 shadow-sm h-fit">
          <h2 className="text-[12px] font-semibold uppercase tracking-wider text-[#6b7280] mb-4">
            Company details
          </h2>

          <dl className="grid grid-cols-2 gap-x-6 gap-y-4">
            {[
              {
                label: "Company name",
                value:
                  company?.company_name || "—",
              },
              {
                label: "Industry",
                value: company?.industry || "—",
              },
              {
                label: "Location",
                value:
                  company?.location || "—",
              },
              {
                label: "Created",
                value: formatDate(
                  company?.created_at
                ),
              },
            ].map((item) => (
              <div
                key={item.label}
                className="min-w-0"
              >
                <dt className="text-[10px] font-semibold uppercase tracking-wider text-[#6b7280] mb-1">
                  {item.label}
                </dt>

                <dd className="text-[13px] font-medium text-[#111827] truncate">
                  {item.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        {/* ================================================================
            CONTACTS
        ================================================================ */}

        <div className="bg-[#f8fafd] rounded-xl border border-[#c5d3e4]/20 overflow-hidden shadow-sm">
          <div className="px-5 py-4 border-b border-[#d4e0f0]/50 flex items-center justify-between">
            <div>
              <h2 className="text-[15px] font-semibold text-[#111827]">
                Contact persons
              </h2>

              <p className="text-[12px] text-[#374151]">
                {sortedContacts.length} contact
                {sortedContacts.length === 1
                  ? ""
                  : "s"}{" "}
                for this company
              </p>
            </div>
          </div>

          {/* Loading */}

          {loading ? (
            <div className="py-14 flex flex-col items-center gap-2">
              <span className="material-symbols-outlined text-[#a6bcee] text-[28px] animate-spin">
                progress_activity
              </span>

              <span className="text-[13px] text-[#374151]">
                Loading contacts...
              </span>
            </div>
          ) : sortedContacts.length === 0 ? (
            /* Empty */

            <div className="py-14 flex flex-col items-center gap-2 text-center px-6">
              <span className="material-symbols-outlined text-[#a6bcee] text-[32px]">
                person_off
              </span>

              <p className="text-[13px] text-[#374151]">
                No contact persons yet. Add one
                manually or upload the sample
                Excel format.
              </p>
            </div>
          ) : (
            /* Contact cards */

            <div className="overflow-x-auto">
              <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {sortedContacts.map(
                    (contact) => (
                      <div
                        key={contact.id}
                        className="group rounded-xl border border-[#d4e0f0]/60 bg-white p-4 shadow-sm hover:shadow-md hover:border-[#a6bcee] transition-all"
                      >
                        {/* ==================================================
                            CONTACT HEADER
                        ================================================== */}

                        <div className="flex items-start justify-between gap-3 mb-4">
                          <div className="flex items-center gap-3 min-w-0">
                            {/* Avatar */}

                            <div className="w-11 h-11 rounded-full bg-[#eef2fb] flex items-center justify-center shrink-0">
                              <span className="material-symbols-outlined text-[#2d55a0] text-[22px]">
                                person
                              </span>
                            </div>

                            <div className="min-w-0">
                              <h3 className="text-[14px] font-semibold text-[#111827] truncate">
                                {contact.person_name ||
                                  "Unnamed Contact"}
                              </h3>

                              <p className="text-[12px] text-[#6b7280] truncate">
                                {contact.designation ||
                                  "No designation"}
                              </p>
                            </div>
                          </div>

                          {/* ==================================================
                              THREE DOT MENU
                          ================================================== */}

                          <div className="relative">
                            <button
                              type="button"
                              disabled={!canEdit}
                              onClick={() =>
                                setOpenMenuId(
                                  openMenuId ===
                                    contact.id
                                    ? null
                                    : contact.id
                                )
                              }
                              className="w-8 h-8 rounded-lg flex items-center justify-center text-[#6b7280] hover:bg-[#f0f6f1] transition-colors disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              <span className="material-symbols-outlined text-[18px]">
                                more_vert
                              </span>
                            </button>

                            {/* Dropdown */}

                            {openMenuId ===
                              contact.id &&
                              canEdit && (
                                <div className="absolute right-0 top-9 z-50 w-36 rounded-lg border border-[#d4e0f0] bg-white shadow-lg overflow-hidden">
                                  {/* Edit */}

                                  <button
                                    type="button"
                                    onClick={() => {
                                      setEditingContact(
                                        contact
                                      );
                                      setOpenMenuId(
                                        null
                                      );
                                    }}
                                    className="w-full flex items-center gap-2 px-3 py-2.5 text-left text-[12.5px] text-[#111827] hover:bg-[#f5f7fb] transition-colors"
                                  >
                                    <span className="material-symbols-outlined text-[17px] text-[#2d55a0]">
                                      edit
                                    </span>

                                    Edit
                                  </button>

                                  {/* Delete */}

                                  <button
                                    type="button"
                                    onClick={() => {
                                      setDeletingContact(
                                        contact
                                      );
                                      setOpenMenuId(
                                        null
                                      );
                                    }}
                                    className="w-full flex items-center gap-2 px-3 py-2.5 text-left text-[12.5px] text-[#ba1a1a] hover:bg-[#fff1f0] transition-colors"
                                  >
                                    <span className="material-symbols-outlined text-[17px]">
                                      delete
                                    </span>

                                    Delete
                                  </button>
                                </div>
                              )}
                          </div>
                        </div>

                        {/* ==================================================
                            CONTACT INFORMATION
                        ================================================== */}

                        <div className="space-y-2.5">
                          {contact.email && (
                            <a
                              href={`mailto:${contact.email}`}
                              className="flex items-center gap-2.5 text-[12.5px] text-[#374151] hover:text-[#111827] group/link"
                            >
                              <span className="material-symbols-outlined text-[17px] text-[#6b7280]">
                                mail
                              </span>

                              <span className="truncate group-hover/link:underline">
                                {contact.email}
                              </span>
                            </a>
                          )}

                          {contact.contact_number && (
                            <a
                              
                              className="flex items-center gap-2.5 text-[12.5px] text-[#374151] hover:text-[#111827] group/link"
                            >
                              <span className="material-symbols-outlined text-[17px] text-[#6b7280]">
                                phone
                              </span>

                              <span className="group-hover/link:underline">
                                {
                                  contact.contact_number
                                }
                              </span>
                            </a>
                          )}

                          {contact.address && (
                            <div className="flex items-start gap-2.5 text-[12.5px] text-[#374151]">
                              <span className="material-symbols-outlined text-[17px] text-[#6b7280]">
                                location_on
                              </span>

                              <span className="line-clamp-2">
                                {contact.address}
                              </span>
                            </div>
                          )}

                          {contact.department && (
                            <div className="flex items-center gap-2.5 text-[12.5px] text-[#374151]">
                              <span className="material-symbols-outlined text-[17px] text-[#6b7280]">
                                business_center
                              </span>

                              <span className="truncate">
                                {
                                  contact.department
                                }
                              </span>
                            </div>
                          )}
                        </div>

                        {/* ==================================================
                            CONTACT FOOTER
                        ================================================== */}

                        <div className="mt-4 pt-3 border-t border-[#d4e0f0]/50 flex items-center justify-between">
                          <span className="text-[10.5px] text-[#6b7280]">
                            Added{" "}
                            {formatDate(
                              contact.created_at
                            )}
                          </span>

                          <div className="flex items-center gap-1">
                            {contact.email && (
                              <a
                                href={`mailto:${contact.email}`}
                                className="w-7 h-7 rounded-md flex items-center justify-center hover:bg-[#eef2fb] text-[#6b7280]"
                                title="Send email"
                              >
                                <span className="material-symbols-outlined text-[16px]">
                                  mail
                                </span>
                              </a>
                            )}

                          </div>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ================================================================
          ADD CONTACT MODAL
      ================================================================ */}

      {canEdit && showAddContact && (
        <AddContactModal
          companyName={company?.company_name}
          onClose={() =>
            setShowAddContact(false)
          }
          onAdd={handleAddContact}
        />
      )}

      {/* ================================================================
          EDIT CONTACT MODAL
      ================================================================ */}

      {canEdit && editingContact && (
        <AddContactModal
          companyName={company?.company_name}
          initialContact={editingContact}
          mode="edit"
          loading={actionLoading}
          onClose={() =>
            !actionLoading &&
            setEditingContact(null)
          }
          onAdd={handleUpdateContact}
        />
      )}

      {/* ================================================================
          DELETE CONFIRMATION MODAL
      ================================================================ */}

      {canEdit && deletingContact && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-xl bg-white shadow-2xl">
            {/* Header */}

            <div className="px-5 py-4 border-b border-[#e5e7eb]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#fff1f0] flex items-center justify-center">
                  <span className="material-symbols-outlined text-[#ba1a1a]">
                    delete
                  </span>
                </div>

                <div>
                  <h2 className="text-[15px] font-semibold text-[#111827]">
                    Delete Contact
                  </h2>

                  <p className="text-[12px] text-[#6b7280]">
                    This action cannot be undone.
                  </p>
                </div>
              </div>
            </div>

            {/* Body */}

            <div className="px-5 py-5">
              <p className="text-[13px] text-[#374151]">
                Are you sure you want to delete{" "}
                <span className="font-semibold text-[#111827]">
                  {deletingContact.person_name ||
                    "this contact"}
                </span>
                ?
              </p>

              {deletingContact.email && (
                <p className="mt-1 text-[12px] text-[#6b7280]">
                  {deletingContact.email}
                </p>
              )}
            </div>

            {/* Footer */}

            <div className="px-5 py-4 border-t border-[#e5e7eb] flex justify-end gap-2">
              <button
                type="button"
                disabled={actionLoading}
                onClick={() =>
                  setDeletingContact(null)
                }
                className="px-4 py-2 rounded-lg border border-[#d4e0f0] text-[12.5px] font-medium text-[#374151] hover:bg-[#f5f7fb] disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={actionLoading}
                onClick={handleDeleteContact}
                className="px-4 py-2 rounded-lg bg-[#ba1a1a] text-white text-[12.5px] font-medium hover:bg-[#991b1b] disabled:opacity-50 flex items-center gap-2"
              >
                {actionLoading && (
                  <span className="material-symbols-outlined text-[15px] animate-spin">
                    progress_activity
                  </span>
                )}

                {actionLoading
                  ? "Deleting..."
                  : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
