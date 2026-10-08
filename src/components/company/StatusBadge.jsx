export default function StatusBadge({ status }) {
  const normalized = String(status || "").toLowerCase();
  const tone = ["active", "approved", "completed"].includes(normalized)
    ? "status-positive"
    : ["pending", "draft"].includes(normalized)
      ? "status-pending"
      : ["rejected", "cancelled"].includes(normalized)
        ? "status-negative"
        : "status-neutral";
  return <span className={`status-badge ${tone}`}>{status}</span>;
}
