export function PendingBadge({ pending }) {
  const isPending = Boolean(Number(pending));
  return (
    <span
      className={[
        "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11.5px] font-medium whitespace-nowrap",
        isPending ? "bg-[#fef3c7] text-[#92400e]" : "bg-[#dcfce7] text-[#166534]",
      ].join(" ")}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${isPending ? "bg-[#d97706]" : "bg-[#16a34a]"}`} />
      {isPending ? "Pending" : "Done"}
    </span>
  );
}

const ISSUES = [
  { key: "issue_from_our_side", label: "Our Side", cls: "bg-[#ffdad6] text-[#ba1a1a]" },
  { key: "product_issue", label: "Product", cls: "bg-[#dbe5f8] text-[#1e3a8a]" },
  { key: "oem_issue", label: "OEM", cls: "bg-[#ede9fe] text-[#5b21b6]" },
];

export function IssueTags({ sc, emptyText = null }) {
  const active = ISSUES.filter((i) => Number(sc[i.key]) === 1);
  if (active.length === 0) return emptyText;
  return (
    <div className="flex flex-wrap gap-1">
      {active.map((i) => (
        <span key={i.key} className={`inline-flex px-2 py-0.5 rounded-md text-[11px] font-medium whitespace-nowrap ${i.cls}`}>
          {i.label}
        </span>
      ))}
    </div>
  );
}
