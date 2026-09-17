﻿export default function TablePagination({ total, page, pageSize, totalPages, onChange }) {
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  function pages() {
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (page <= 3) return [1, 2, 3, "...", totalPages];
    if (page >= totalPages - 2) return [1, "...", totalPages - 2, totalPages - 1, totalPages];
    return [1, "...", page - 1, page, page + 1, "...", totalPages];
  }

  return (
    <div className="p-4 bg-[#f8fafd] flex items-center justify-between border-t border-[#d4e0f0]/50">
      <div className="text-[12px] text-[#374151]">
        {total === 0 ? (
          "No results"
        ) : (
          <>
            Showing <span className="text-[#111827] font-medium">{from}-{to}</span> of{" "}
            <span className="text-[#111827] font-medium">{total.toLocaleString()}</span> companies
          </>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center gap-1">
          <button
            disabled={page === 1}
            onClick={() => onChange(page - 1)}
            className={[
              "w-7 h-7 flex items-center justify-center rounded-md border border-[#c5d3e4]/20 bg-[#f8fafd] transition-colors",
              page === 1 ? "text-[#6b7280] cursor-not-allowed" : "text-[#111827] hover:bg-[#f0f4fa]",
            ].join(" ")}
          >
            <span className="material-symbols-outlined text-[16px]">chevron_left</span>
          </button>

          {pages().map((p, i) =>
            p === "..." ? (
              <span key={`ellipsis-${i}`} className="text-[#6b7280] mx-1 text-[12px]">...</span>
            ) : (
              <button
                key={p}
                onClick={() => onChange(p)}
                className={[
                  "w-7 h-7 flex items-center justify-center rounded-md text-[12px] font-medium transition-colors",
                  p === page
                    ? "bg-[#2d55a0] text-[#ffffff] shadow-sm"
                    : "border border-[#c5d3e4]/20 bg-[#f8fafd] text-[#111827] hover:bg-[#f0f4fa]",
                ].join(" ")}
              >
                {p}
              </button>
            )
          )}

          <button
            disabled={page === totalPages}
            onClick={() => onChange(page + 1)}
            className={[
              "w-7 h-7 flex items-center justify-center rounded-md border border-[#c5d3e4]/20 bg-[#f8fafd] transition-colors shadow-sm",
              page === totalPages ? "text-[#6b7280] cursor-not-allowed" : "text-[#111827] hover:bg-[#f0f4fa]",
            ].join(" ")}
          >
            <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          </button>
        </div>
      )}
    </div>
  );
}