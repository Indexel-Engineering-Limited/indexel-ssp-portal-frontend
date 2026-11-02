// Helpers shared by the Service Call Report module.

const pad = (n) => String(n).padStart(2, "0");

/** Converts a date / ISO timestamp to YYYY-MM-DD (local time) for <input type="date">. */
export function toInputDate(value) {
  if (!value) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function todayInputDate() {
  return toInputDate(new Date());
}

/** Display format for a calendar date, e.g. 30-Oct-2026. */
export function formatCallDate(value) {
  const ymd = toInputDate(value);
  if (!ymd) return "—";
  const [y, m, d] = ymd.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }).replace(/ /g, "-");
}

export function formatDateTime(value) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

/** Maps an error from the api client to a user-facing message. */
export function errorMessage(err, fallback = "Something went wrong") {
  if (err?.status === 403) return "You don't have access";
  return err?.message || fallback;
}
