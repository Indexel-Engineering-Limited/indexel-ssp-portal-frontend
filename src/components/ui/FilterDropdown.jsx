﻿import { useState, useRef, useEffect } from "react";

export default function FilterDropdown({ label, options, value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handler(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const displayLabel = value === options[0] ? label : `${label.split(":")[0]}: ${value}`;
  const isFiltered = value !== options[0];

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className={[
          "inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-[12px] font-medium transition-colors border",
          isFiltered
            ? "bg-[#2d55a0] text-[#ffffff] border-[#2d55a0]"
            : "bg-[#f8fafd] border-[#c5d3e4]/30 text-[#111827] hover:bg-[#f0f4fa]",
        ].join(" ")}
      >
        {displayLabel}
        <span className={["material-symbols-outlined text-[14px]", isFiltered ? "text-[#ffffff]" : "text-[#6b7280]"].join(" ")}>
          arrow_drop_down
        </span>
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 bg-[#f8fafd] rounded-lg border border-[#c5d3e4]/30 shadow-lg z-50 min-w-[140px] py-1 overflow-auto max-h-[450px]" >
          {options.map((opt) => (
            <button
              key={opt}
              onClick={() => { onChange(opt); setOpen(false); }}
              className={[
                "w-full text-left px-3 py-2 text-[12px] transition-colors flex items-center justify-between",
                opt === value
                  ? "text-[#2d55a0] font-semibold bg-[#eef2fb]"
                  : "text-[#374151] hover:bg-[#f0f4fa]",
              ].join(" ")}
            >
              {opt}
              {opt === value && (
                <span className="material-symbols-outlined text-[14px] text-[#2d55a0]">check</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}