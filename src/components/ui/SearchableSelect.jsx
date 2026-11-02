import { useEffect, useMemo, useRef, useState } from "react";

/**
 * Searchable single-select dropdown.
 * options: [{ value, label, sub? }]
 */
export default function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = "Select…",
  disabled = false,
  loading = false,
  error = false,
  emptyText = "No options found",
  className = "",
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    function handler(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  function toggle() {
    if (!open) setQuery("");
    setOpen(!open);
  }

  const selected = options.find((o) => String(o.value) === String(value));

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) =>
      [o.label, o.sub].some((v) => String(v ?? "").toLowerCase().includes(q))
    );
  }, [options, query]);

  function pick(opt) {
    onChange(opt ? opt.value : "");
    setOpen(false);
  }

  return (
    <div className={`relative ${className}`} ref={ref}>
      <button
        type="button"
        disabled={disabled}
        onClick={toggle}
        className={[
          "w-full flex items-center justify-between gap-2 rounded-lg border px-3 py-2 text-left text-[13px] bg-[#f8fafd] outline-none transition-all",
          error ? "border-[#ba1a1a]" : "border-[#c5d3e4]/50",
          disabled ? "opacity-60 cursor-not-allowed bg-[#f3f4f6]" : "hover:border-[#2d55a0] focus:border-[#2d55a0]",
        ].join(" ")}
      >
        <span className={`truncate ${selected ? "text-[#111827]" : "text-[#6b7280]/70"}`}>
          {loading ? "Loading…" : selected ? selected.label : placeholder}
        </span>
        <span className="material-symbols-outlined text-[18px] text-[#6b7280] shrink-0">arrow_drop_down</span>
      </button>

      {open && !disabled && (
        <div className="absolute left-0 right-0 top-full mt-1 z-[120] rounded-lg border border-[#c5d3e4]/40 bg-[#f8fafd] shadow-lg">
          <div className="p-2 border-b border-[#d4e0f0]/50">
            <div className="relative">
              <span className="material-symbols-outlined absolute left-2 top-1/2 -translate-y-1/2 text-[16px] text-[#6b7280]">search</span>
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Escape") setOpen(false);
                  if (e.key === "Enter") {
                    e.preventDefault();
                    if (filtered[0]) pick(filtered[0]);
                  }
                }}
                placeholder="Search…"
                className="w-full rounded-md border border-[#c5d3e4]/50 bg-white py-1.5 pl-7 pr-2 text-[12.5px] outline-none focus:border-[#2d55a0]"
              />
            </div>
          </div>
          <div className="max-h-60 overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <div className="px-3 py-3 text-[12px] text-[#6b7280]">{emptyText}</div>
            ) : (
              filtered.map((opt) => {
                const active = String(opt.value) === String(value);
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => pick(opt)}
                    className={[
                      "w-full text-left px-3 py-2 text-[12.5px] transition-colors flex items-center justify-between gap-2",
                      active ? "bg-[#eef2fb] text-[#2d55a0] font-semibold" : "text-[#374151] hover:bg-[#f0f4fa]",
                    ].join(" ")}
                  >
                    <span className="min-w-0">
                      <span className="block truncate">{opt.label}</span>
                      {opt.sub && <span className="block truncate text-[11px] font-normal text-[#6b7280]">{opt.sub}</span>}
                    </span>
                    {active && <span className="material-symbols-outlined text-[14px]">check</span>}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
