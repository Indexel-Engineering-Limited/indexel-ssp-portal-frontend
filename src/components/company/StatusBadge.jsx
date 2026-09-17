export default function StatusBadge({ status }) {
  const isActive = status === "Active";
  return (
    <div className="flex items-center gap-1.5">
      <div className={["w-1.5 h-1.5 rounded-full", isActive ? "bg-[#2d55a0]" : "bg-[#a6bcee]"].join(" ")} />
      <span className={["text-[12px] font-medium", isActive ? "text-[#2d55a0]" : "text-[#f59e0b]"].join(" ")}>
        {status}
      </span>
    </div>
  );
}