export default function CompanyDirectoryHeader({ 
  total, 
  onAddCompany, 
  onExportCSV, 
  canAdd,
  pageSize,
  pageSizeOptions,
  onPageSizeChange
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-5 gap-4">
      {/* Title block */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-2.5">
          <h1 className="font-semibold text-[20px] text-[#111827]" style={{ fontFamily: "'Hanken Grotesk', sans-serif" }}>
            Company Directory
          </h1>
          <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full bg-[#dbe5f8] text-[11px] font-medium text-[#374151] border border-[#c5d3e4]/30">
            {total.toLocaleString()} Total
          </span>
        </div>
        <p className="text-[12.5px] text-[#374151] max-w-xl">
          Manage corporate entities, track financial performance, and monitor operational status across the global portfolio.
        </p>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
        <label className="flex items-center gap-2 text-[12px] text-[#374151] whitespace-nowrap">
          Show
          <select
            value={pageSize}
            onChange={onPageSizeChange}
            className="rounded-lg border border-[#c5d3e4]/50 bg-[#f8fafd] px-2 py-2 text-[13px] text-[#111827] outline-none focus:border-[#2d55a0]"
          >
            {pageSizeOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
        <button
          onClick={onExportCSV}
          className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-[#f8fafd] border border-[#c5d3e4]/50 rounded-lg text-[12.5px] font-medium text-[#111827] hover:bg-[#eef2fb] transition-colors shadow-sm"
        >
          <span className="material-symbols-outlined text-[#6b7280] text-[15px]">download</span>
          <span className="hidden sm:inline">Export CSV</span>
        </button>
        {canAdd && (
          <button
            onClick={onAddCompany}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-[#2d55a0] rounded-lg text-[12.5px] font-medium text-[#ffffff] shadow-sm hover:bg-[#234690] transition-all"
          >
            <span className="material-symbols-outlined text-[15px]">add</span>
            Add Company
          </button>
        )}
      </div>
    </div>
  );
}