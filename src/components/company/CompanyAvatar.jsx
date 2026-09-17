﻿export default function CompanyAvatar({ name, logoUrl }) {
  if (logoUrl) {
    return (
      <div className="w-8 h-8 rounded-full bg-[#f8fafd] border border-[#c5d3e4]/20 flex items-center justify-center shrink-0 overflow-hidden p-1">
        <img className="w-full h-full object-contain" src={logoUrl} alt={name} />
      </div>
    );
  }
  const initials = String(name || "?")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase() || "?";
  return (
    <div className="w-8 h-8 rounded-full bg-[#dbe5f8] border border-[#c5d3e4]/20 flex items-center justify-center shrink-0">
      <span className="text-[#374151] text-[12px] font-medium">{initials}</span>
    </div>
  );
}