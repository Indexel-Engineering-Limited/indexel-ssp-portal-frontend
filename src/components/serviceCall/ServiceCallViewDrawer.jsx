import { formatCallDate, formatDateTime } from "../../utils/serviceCall";
import { IssueTags, PendingBadge } from "./ServiceCallBadges";

function Section({ title, children }) {
  return (
    <div className="px-5 py-4 border-b border-[#d4e0f0]/40">
      <div className="text-[11px] font-semibold uppercase tracking-wider text-[#2d55a0] mb-3">{title}</div>
      {children}
    </div>
  );
}

function Grid({ items }) {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-3">
      {items.map(({ label, value, full }) => (
        <div key={label} className={full ? "col-span-2" : ""}>
          <div className="text-[10.5px] font-semibold uppercase tracking-wider text-[#6b7280] mb-0.5">{label}</div>
          <div className="text-[12.5px] font-medium text-[#111827] break-words whitespace-pre-wrap">{value || "—"}</div>
        </div>
      ))}
    </div>
  );
}

export default function ServiceCallViewDrawer({ serviceCall: sc, canEdit, onEdit, onClose }) {
  if (!sc) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-end">
      <div className="absolute inset-0 bg-[#0f2044]/30 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-md h-full bg-[#f8fafd] shadow-2xl flex flex-col overflow-y-auto animate-[slideIn_0.2s_ease-out]">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#d4e0f0]/60 sticky top-0 bg-[#f8fafd] z-10">
          <h2 className="text-[15px] font-semibold text-[#111827]">Service Call Details</h2>
          <div className="flex items-center gap-1">
            {canEdit && (
              <button
                onClick={() => onEdit(sc)}
                className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[12px] font-medium text-[#2d55a0] hover:bg-[#eef2fb] transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">edit</span>
                Edit
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#6b7280] hover:bg-[#eef2fb] hover:text-[#111827] transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
        </div>

        <div className="px-5 py-4 border-b border-[#d4e0f0]/40">
          <div className="font-mono text-[15px] font-semibold text-[#111827]">{sc.case_no}</div>
          <div className="text-[12px] text-[#374151] mt-0.5">Called on {formatCallDate(sc.call_date)}</div>
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <PendingBadge pending={sc.is_pending} />
            <IssueTags sc={sc} />
          </div>
        </div>

        <Section title="Customer">
          <Grid
            items={[
              { label: "Company", value: sc.company_name, full: true },
              { label: "Company Code", value: sc.company_code },
              { label: "Location", value: sc.location },
            ]}
          />
        </Section>

        <Section title="Contact">
          <Grid
            items={[
              { label: "Name", value: sc.contact_name },
              { label: "Number", value: sc.contact_number },
              { label: "Email", value: sc.contact_email, full: true },
            ]}
          />
        </Section>

        <Section title="Service">
          <Grid
            items={[
              { label: "Product / Model / Serial", value: sc.product_model_serial, full: true },
              { label: "Service Type", value: sc.service_type },
              { label: "PO No.", value: sc.po_number },
              { label: "Engineer", value: sc.engineer_name },
              { label: "Service Done Date", value: sc.service_done_date ? formatCallDate(sc.service_done_date) : null },
              { label: "Remarks", value: sc.remarks, full: true },
            ]}
          />
        </Section>

        <Section title="Record">
          <Grid
            items={[
              { label: "Created", value: formatDateTime(sc.created_at) },
              { label: "Updated", value: formatDateTime(sc.updated_at) },
            ]}
          />
        </Section>
      </div>
    </div>
  );
}
