﻿import FilterDropdown from "../ui/FilterDropdown";

export default function CompanyTableFilters({ filters, onFiltersChange, companies = [] }) {
  function set(key, val) {
    onFiltersChange({ ...filters, [key]: val });
  }

  const cities = [
    "All",
    ...Array.from(new Set(companies.map((c) => c.city).filter(Boolean))).sort(),
  ];
 
  const states = [
    "All",
    ...Array.from(new Set(companies.map((c) => c.state).filter(Boolean))).sort(),
  ];

  return (
    <div className="px-3 py-2 bg-[#f8fafd] border-b border-[#d4e0f0]/50 flex flex-wrap items-center gap-2 relative z-10">
      <div className="relative min-w-[200px] flex-1 sm:flex-none">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[16px] text-[#6b7280]">search</span>
        <input
          type="search"
          value={filters.search}
          onChange={(event) => set("search", event.target.value)}
          placeholder="Search company..."
          aria-label="Search companies"
          className="w-full rounded-lg border border-[#c5d3e4]/30 bg-[#f8fafd] py-1.5 pl-8 pr-3 text-[12px] text-[#111827] outline-none placeholder:text-[#6b7280] focus:border-[#2d55a0]"
        />
      </div>
      <FilterDropdown label="City" options={cities} value={filters.city} onChange={(v) => set("city", v)} />
      <FilterDropdown label="State" options={states} value={filters.state} onChange={(v) => set("state", v)} />
    </div>
  );
}
