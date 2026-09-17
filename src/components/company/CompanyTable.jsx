﻿import CompanyTableFilters from "./CompanyTableFilters";
import CompanyTableRow from "./CompanyTableRow";
import TablePagination from "./TablePagination";

export default function CompanyTable({
  companies,
  allCompanies = [],
  filters,
  onFiltersChange,
  page,
  pageSize,
  totalFiltered,
  onPageChange,
  onView,
  onEdit,
}) {
  const totalPages = Math.max(1, Math.ceil(totalFiltered / pageSize));

  return (
    <div
      className="overflow-hidden flex flex-col mb-6 rounded-xl"
      style={{
        background:  "#ffffff",
        border:      "1px solid #e2e9f4",
        boxShadow:   "0 2px 12px rgba(45,85,160,0.07)",
        fontFamily:  "'Inter','Hanken Grotesk',sans-serif",
      }}
    >
      <CompanyTableFilters
        filters={filters}
        onFiltersChange={onFiltersChange}
        companies={allCompanies}
      />

      <div className="overflow-x-auto w-full">
        <table className="w-full text-left border-collapse" style={{ minWidth: "640px" }}>
          <thead>
            <tr
              className="text-[11px] font-semibold uppercase tracking-wider"
              style={{ background: "#f8fafd", borderBottom: "1px solid #e2e9f4", color: "#6b7280" }}
            >
              <th className="py-2.5 px-4 w-[42%]">Company</th>
              <th className="py-2.5 px-3 w-[24%] hidden sm:table-cell">Industry</th>
              <th className="py-2.5 px-3 w-[24%] hidden md:table-cell">Location</th>
              <th className="py-2.5 px-4 text-right w-[10%]">Actions</th>
            </tr>
          </thead>
          <tbody className="text-[13px] text-[#111827]">
            {companies.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-16 text-center" style={{ color: "#6b7280" }}>
                  <div className="flex flex-col items-center gap-2">
                    <span className="material-symbols-outlined text-[32px]" style={{ color: "#c8d6ea" }}>search_off</span>
                    <span className="text-[13px]">No companies match the current filters.</span>
                  </div>
                </td>
              </tr>
            ) : (
              companies.map((company) => (
                <CompanyTableRow key={company.id} company={company} onView={onView} onEdit={onEdit} />
              ))
            )}
          </tbody>
        </table>
      </div>

      <TablePagination
        total={totalFiltered}
        page={page}
        pageSize={pageSize}
        totalPages={totalPages}
        onChange={onPageChange}
      />
    </div>
  );
}