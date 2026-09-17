﻿import { useEffect, useMemo, useState } from "react";
import TablePagination from "../components/company/TablePagination";
import { getAllContacts } from "../services/companyService";
import { normalizeContact } from "../utils/mappers";

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

export default function ContactsListPage() {
  const [contacts, setContacts] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZE_OPTIONS[0]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  async function loadContacts() {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllContacts();
      setContacts((Array.isArray(data) ? data : []).map(normalizeContact).filter(Boolean));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let cancelled = false;

    getAllContacts()
      .then((data) => {
        if (!cancelled) {
          setContacts((Array.isArray(data) ? data : []).map(normalizeContact).filter(Boolean));
        }
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

  const filteredContacts = useMemo(() => {
    const query = search.trim().toLowerCase();
    
    // Filter contacts based on search query
    let result = query 
      ? contacts.filter((contact) =>
          [
            contact.person_name,
            contact.company_name,
            contact.designation,
            contact.department,
            contact.email,
            contact.contact_number,
          ].some((value) => String(value ?? "").toLowerCase().includes(query))
        )
      : [...contacts];

    // Sort alphabetically by company_name (customer name)
    result.sort((a, b) => {
      const nameA = (a.company_name || "").toLowerCase();
      const nameB = (b.company_name || "").toLowerCase();
      return nameA.localeCompare(nameB);
    });

    return result;
  }, [contacts, search]);

  const paginatedContacts = useMemo(
    () => filteredContacts.slice((page - 1) * pageSize, page * pageSize),
    [filteredContacts, page, pageSize]
  );
  const totalPages = Math.max(1, Math.ceil(filteredContacts.length / pageSize));

  function handleSearchChange(event) {
    setSearch(event.target.value);
    setPage(1);
  }

  function handlePageSizeChange(event) {
    setPageSize(Number(event.target.value));
    setPage(1);
  }

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-5 gap-4">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2.5">
            <h1 className="font-semibold text-[20px] text-[#111827]" style={{ fontFamily: "'Hanken Grotesk', sans-serif" }}>
              Contacts List
            </h1>
            <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full bg-[#dbe5f8] text-[11px] font-medium text-[#374151] border border-[#c5d3e4]/30">
              {contacts.length.toLocaleString()} Total
            </span>
          </div>
          <p className="text-[12.5px] text-[#374151]">View and search all company contacts.</p>
        </div>

        <div className="flex w-full sm:w-auto items-center gap-2">
          <label className="flex items-center gap-2 text-[12px] text-[#374151] whitespace-nowrap">
            Show
            <select
              value={pageSize}
              onChange={handlePageSizeChange}
              className="rounded-lg border border-[#c5d3e4]/50 bg-[#f8fafd] px-2 py-2 text-[13px] text-[#111827] outline-none focus:border-[#2d55a0]"
            >
              {PAGE_SIZE_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}
            </select>
          </label>
          <div className="relative flex-1 sm:w-72">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#6b7280] text-[18px]">search</span>
            <input
              value={search}
              onChange={handleSearchChange}
              placeholder="Search contacts..."
              className="w-full rounded-lg border border-[#c5d3e4]/50 bg-[#f8fafd] py-2 pl-9 pr-3 text-[13px] text-[#111827] placeholder:text-[#6b7280]/60 outline-none focus:border-[#2d55a0]"
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-4 flex items-center justify-between gap-3 rounded-lg border border-[#ffdad6] bg-[#ffdad6]/40 px-4 py-3">
          <span className="text-[13px] text-[#ba1a1a]">{error}</span>
          <button onClick={loadContacts} className="text-[12px] font-medium text-[#111827] underline">Retry</button>
        </div>
      )}

      {loading ? (
        <div className="bg-[#f8fafd] rounded-xl border border-[#c5d3e4]/20 py-16 flex flex-col items-center gap-2">
          <span className="material-symbols-outlined text-[#a6bcee] text-[28px] animate-spin">progress_activity</span>
          <span className="text-[13px] text-[#374151]">Loading contacts...</span>
        </div>
      ) : (
        <div className="bg-[#f8fafd] rounded-xl border border-[#c5d3e4]/20 overflow-hidden flex flex-col mb-6 shadow-sm">
          <div className="overflow-x-auto w-full">
            <table className="w-full min-w-[860px] text-left border-collapse">
              <thead>
                <tr className="bg-[#f8fafd] text-[#374151] text-[11px] font-semibold uppercase tracking-wider border-b border-[#d4e0f0]/50">
                   <th className="py-2.5 px-3">Customer Name</th>
                  <th className="py-2.5 px-4">Contact</th>
                  
                  <th className="py-2.5 px-3">Department</th>
                  <th className="py-2.5 px-3">Designation</th>
                  <th className="py-2.5 px-3">Email</th>
                  <th className="py-2.5 px-4">Phone</th>
                </tr>
              </thead>
              <tbody className="text-[13px] text-[#111827]">
                {paginatedContacts.length === 0 ? (
                  <tr><td colSpan={5} className="py-14 text-center text-[#374151]">No contacts match your search.</td></tr>
                ) : (
                  paginatedContacts.map((contact) => (
                    <tr key={contact.id} className="border-b border-[#d4e0f0]/40 last:border-0 hover:bg-[#f0f4fa]/45">
                     
                      <td className="px-3 py-3 text-[#374151]">{contact.company_name ?? "—"}</td>
                       <td className="px-4 py-3">
                        <p className="font-medium">{contact.person_name || "—"}</p>
                        
                      </td> 
                      <td className="px-3 py-3 text-[#374151]">{contact.department || "—"}</td>
                      <td className="px-3 py-3 text-[#374151]">{contact.designation || "—"}</td>
                      <td className="px-3 py-3 text-[#374151]">{contact.email || "—"}</td>
                      <td className="px-4 py-3 text-[#374151]">{contact.contact_number || "—"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <TablePagination
            total={filteredContacts.length}
            page={page}
            pageSize={pageSize}
            totalPages={totalPages}
            onChange={setPage}
          />
        </div>
      )}
    </>
  );
}
