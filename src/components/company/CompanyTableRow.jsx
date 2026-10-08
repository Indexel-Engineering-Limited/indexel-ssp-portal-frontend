﻿import CompanyAvatar from "./CompanyAvatar";

export default function CompanyTableRow({ company, onView, onEdit }) {
  return (
    <tr
      className="border-b border-[#d4e0f0]/30 hover:bg-[#f7f9fc] transition-colors group cursor-pointer"
      onClick={() => onView(company)}
    >
      <td className="py-2 px-4">
        <div className="flex min-w-0 items-center gap-2.5">
          <CompanyAvatar name={company.company_name} />
          <div className="min-w-0 flex-1">
            <div className="truncate font-medium text-[13px] leading-5 text-[#111827] group-hover:text-[#2d55a0] transition-colors" title={company.company_name}>
              {company.company_name}
            </div>
            <div className="truncate text-[11px] leading-4 text-[#6b7280]">{company.company_id}</div>
          </div>
        </div>
      </td>

      <td className="py-2 px-3 hidden sm:table-cell">
        <span className="inline-flex max-w-full items-center truncate rounded-md border border-[#e5e7eb] bg-[#f7f8fa] px-2 py-1 text-[11px] font-medium leading-4 text-[#4b5058]">
          {company.industry || "—"}
        </span>
      </td>

      <td className="py-2 px-3 text-[12px] text-[#4b5058] hidden md:table-cell">
        <span className="block truncate whitespace-nowrap" title={company.location || "—"}>{company.location || "—"}</span>
      </td>

      <td className="py-2 px-4 text-right">
        <div
          className="flex items-center justify-end gap-1"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            className="flex h-7 w-7 items-center justify-center rounded-md text-[#6b7280] hover:bg-[#eef2fb] hover:text-[#2d55a0] transition-colors"
            title="Edit Company"
            onClick={() => onEdit(company)}
          >
            <span className="material-symbols-outlined text-[15px]">edit</span>
          </button>
          <button
            className="flex h-7 w-7 items-center justify-center rounded-md text-[#6b7280] hover:bg-[#eef2fb] hover:text-[#2d55a0] transition-colors"
            title="View Details"
            onClick={() => onView(company)}
          >
            <span className="material-symbols-outlined text-[15px]">visibility</span>
          </button>
        </div>
      </td>
    </tr>
  );
}
