﻿import CompanyAvatar from "./CompanyAvatar";

export default function CompanyTableRow({ company, onView, onEdit }) {
  return (
    <tr
      className="border-b border-[#d4e0f0]/30 hover:bg-[#eef2fb]/30 transition-colors group cursor-pointer"
      onClick={() => onView(company)}
    >
      <td className="py-3 px-4">
        <div className="flex items-center gap-2.5">
          <CompanyAvatar name={company.company_name} />
          <div className="min-w-0 flex-1">
            <div className="font-medium text-[13px] text-[#111827] mb-0.5 truncate group-hover:text-[#2d55a0] transition-colors">
              {company.company_name}
            </div>
            <div className="text-[#374151] text-[11px] truncate">{company.company_id}</div>
          </div>
        </div>
      </td>

      <td className="py-3 px-3 hidden sm:table-cell">
        <span className="inline-flex max-w-full items-center truncate rounded-md border border-[#c5d3e4]/20 bg-[#f0f4fa] px-2 py-0.5 text-[11px] font-medium text-[#374151]">
          {company.industry || "—"}
        </span>
      </td>

      <td className="py-3 px-3 text-[12px] text-[#111827] hidden md:table-cell">
        {company.location || "—"}
      </td>

      <td className="py-3 px-4 text-right">
        <div
          className="flex items-center justify-end gap-1 opacity-100 group-hover:opacity-100 transition-opacity"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            className="p-1 text-[#6b7280] hover:bg-[#f0f4fa] hover:text-[#2d55a0] rounded-md transition-colors"
            title="Edit Company"
            onClick={() => onEdit(company)}
          >
            <span className="material-symbols-outlined text-[17px]">edit</span>
          </button>
          <button
            className="p-1 text-[#6b7280] hover:bg-[#f0f4fa] hover:text-[#2d55a0] rounded-md transition-colors"
            title="View Details"
            onClick={() => onView(company)}
          >
            <span className="material-symbols-outlined text-[17px]">visibility</span>
          </button>
        </div>
      </td>
    </tr>
  );
}
