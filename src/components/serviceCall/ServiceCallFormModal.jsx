import { useEffect, useMemo, useState } from "react";
import SearchableSelect from "../ui/SearchableSelect";
import {
  createServiceCall,
  getCompanyContacts,
  getServiceCall,
  updateServiceCall,
} from "../../services/serviceCallService";
import { errorMessage, todayInputDate, toInputDate } from "../../utils/serviceCall";

const EMPTY_FORM = {
  case_no: "",
  call_date: "",
  company_id: "",
  contact_id: "",
  product_model_serial: "",
  service_type: "",
  po_number: "",
  service_done_date: "",
  is_pending: true,
  issue_from_our_side: false,
  product_issue: false,
  oem_issue: false,
  engineer_name: "",
  remarks: "",
};

const ISSUE_FLAGS = [
  { name: "issue_from_our_side", label: "Issue From Our Side", hint: "Caused by our team" },
  { name: "product_issue", label: "Product Issue", hint: "Fault in the product" },
  { name: "oem_issue", label: "OEM Issue", hint: "Manufacturer related" },
];

function inpCls(hasError) {
  return `w-full rounded-lg border px-3 py-2 text-[13px] text-[#111827] outline-none focus:border-[#2d55a0] focus:ring-2 focus:ring-[#2d55a0]/10 bg-[#f8fafd] transition-all ${hasError ? "border-[#ba1a1a]" : "border-[#c5d3e4]/50"}`;
}

function Field({ label, required, error, hint, children }) {
  return (
    <div>
      <label className="block text-[12px] font-medium text-[#374151] mb-1">
        {label}{required && <span className="text-[#ba1a1a] ml-0.5">*</span>}
      </label>
      {children}
      {error ? (
        <p className="text-[11.5px] text-[#ba1a1a] mt-0.5">{error}</p>
      ) : hint ? (
        <p className="text-[11px] text-[#6b7280] mt-0.5">{hint}</p>
      ) : null}
    </div>
  );
}

function fromRecord(data) {
  return {
    case_no: data.case_no ?? "",
    call_date: toInputDate(data.call_date),
    company_id: data.company_id != null ? String(data.company_id) : "",
    contact_id: data.contact_id != null ? String(data.contact_id) : "",
    product_model_serial: data.product_model_serial ?? "",
    service_type: data.service_type ?? "",
    po_number: data.po_number ?? "",
    service_done_date: toInputDate(data.service_done_date),
    is_pending: Boolean(Number(data.is_pending)),
    issue_from_our_side: Boolean(Number(data.issue_from_our_side)),
    product_issue: Boolean(Number(data.product_issue)),
    oem_issue: Boolean(Number(data.oem_issue)),
    engineer_name: data.engineer_name ?? "",
    remarks: data.remarks ?? "",
  };
}

function toPayload(form) {
  return {
    ...form,
    case_no: form.case_no.trim(),
    company_id: Number(form.company_id),
    contact_id: Number(form.contact_id),
    product_model_serial: form.product_model_serial.trim(),
    service_type: form.service_type.trim(),
    po_number: form.po_number.trim(),
    engineer_name: form.engineer_name.trim(),
    remarks: form.remarks.trim(),
  };
}

/**
 * Create / edit modal.
 * serviceCallId: null for create, id for edit.
 * companies: list from GET /api/companies ({ id, company_id, company_name, ... })
 */
export default function ServiceCallFormModal({ serviceCallId, companies, onClose, onSaved }) {
  const isEdit = serviceCallId != null;

  const [form, setForm] = useState(() => ({ ...EMPTY_FORM, call_date: todayInputDate() }));
  const [initial, setInitial] = useState(null);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [contacts, setContacts] = useState([]);
  const [contactsLoading, setContactsLoading] = useState(false);
  const [contactsError, setContactsError] = useState(null);

  // Load existing record on edit
  useEffect(() => {
    if (!isEdit) return;
    let cancelled = false;
    setLoading(true);
    getServiceCall(serviceCallId)
      .then((data) => {
        if (cancelled || !data) return;
        const values = fromRecord(data);
        setForm(values);
        setInitial(values);
      })
      .catch((err) => !cancelled && setError(errorMessage(err, "Failed to load service call")))
      .finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true; };
  }, [isEdit, serviceCallId]);

  // Contacts endpoint expects the company's TEXT code, so look it up from the numeric id
  const companyCode = useMemo(
    () => companies.find((c) => String(c.id) === String(form.company_id))?.company_id ?? null,
    [companies, form.company_id]
  );

  useEffect(() => {
    setContacts([]);
    setContactsError(null);
    if (!companyCode) return;
    let cancelled = false;
    setContactsLoading(true);
    getCompanyContacts(companyCode)
      .then((list) => !cancelled && setContacts(list))
      .catch((err) => !cancelled && setContactsError(errorMessage(err, "Failed to load contacts")))
      .finally(() => !cancelled && setContactsLoading(false));
    return () => { cancelled = true; };
  }, [companyCode]);

  const companyOptions = useMemo(
    () => companies.map((c) => ({ value: String(c.id), label: c.company_name, sub: c.company_id })),
    [companies]
  );
  const contactOptions = useMemo(
    () => contacts.map((c) => ({
      value: String(c.id),
      label: c.person_name || "—",
      sub: [c.designation, c.contact_number].filter(Boolean).join(" · "),
    })),
    [contacts]
  );
  const selectedContact = contacts.find((c) => String(c.id) === String(form.contact_id));

  function setField(name, value) {
    setForm((f) => ({ ...f, [name]: value }));
    setFieldErrors((fe) => (fe[name] ? { ...fe, [name]: undefined } : fe));
  }

  function handleCompanyChange(value) {
    setForm((f) => ({ ...f, company_id: value, contact_id: "" }));
    setFieldErrors((fe) => ({ ...fe, company_id: undefined, contact_id: undefined }));
  }

  function validate() {
    const errs = {};
    if (!form.call_date) errs.call_date = "Call date is required";
    if (!form.company_id) errs.company_id = "Company is required";
    if (!form.contact_id) errs.contact_id = "Contact is required";
    if (form.service_done_date && form.call_date && form.service_done_date < form.call_date) {
      errs.service_done_date = "Service done date can't be before the call date";
    }
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    if (!validate()) return;

    const payload = toPayload(form);
    setSaving(true);
    try {
      let saved;
      if (isEdit) {
        const base = toPayload(initial);
        const changed = Object.fromEntries(
          Object.entries(payload).filter(([k, v]) => v !== base[k])
        );
        if (Object.keys(changed).length === 0) {
          onClose();
          return;
        }
        saved = await updateServiceCall(serviceCallId, changed);
      } else {
        if (!payload.case_no) delete payload.case_no;
        saved = await createServiceCall(payload);
      }
      onSaved(saved, isEdit);
    } catch (err) {
      if (err.status === 409) {
        setFieldErrors((fe) => ({ ...fe, case_no: err.message || "Case number already exists" }));
      } else {
        setError(errorMessage(err, "Failed to save service call"));
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="absolute inset-0 bg-[#0f2044]/30 backdrop-blur-sm" onClick={() => !saving && onClose()} />

      <div className="relative w-full max-w-3xl bg-[#f8fafd] rounded-xl shadow-2xl flex flex-col max-h-[92vh] mx-4">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#d4e0f0]/60">
          <div>
            <h2 className="text-[15px] font-semibold text-[#111827]">{isEdit ? "Edit Service Call" : "Add Service Call"}</h2>
            <p className="text-[12px] text-[#6b7280]">
              {isEdit ? "Update the service call details." : "Log a new customer service call."}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="p-1.5 rounded-lg text-[#6b7280] hover:bg-[#eef2fb] hover:text-[#111827] transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {loading ? (
          <div className="py-16 flex flex-col items-center gap-2">
            <span className="material-symbols-outlined text-[#a6bcee] text-[28px] animate-spin">progress_activity</span>
            <span className="text-[13px] text-[#374151]">Loading service call...</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col min-h-0 flex-1" noValidate>
            <div className="overflow-y-auto px-5 py-4 space-y-4">
              {error && (
                <div className="flex items-center justify-between gap-3 rounded-lg border border-[#ffdad6] bg-[#ffdad6]/40 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#ba1a1a] text-[18px]">error</span>
                    <span className="text-[13px] text-[#ba1a1a]">{error}</span>
                  </div>
                  <button type="button" onClick={() => setError(null)} className="text-[#ba1a1a]">
                    <span className="material-symbols-outlined text-[18px]">close</span>
                  </button>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Case No" error={fieldErrors.case_no} hint={isEdit ? null : "Leave blank to auto-generate"}>
                  <input
                    value={form.case_no}
                    onChange={(e) => setField("case_no", e.target.value)}
                    placeholder={isEdit ? "" : "SC-YYYY-NNNN"}
                    className={inpCls(fieldErrors.case_no)}
                  />
                </Field>
                <Field label="Call Date" required error={fieldErrors.call_date}>
                  <input
                    type="date"
                    value={form.call_date}
                    onChange={(e) => setField("call_date", e.target.value)}
                    className={inpCls(fieldErrors.call_date)}
                  />
                </Field>

                <Field label="Company" required error={fieldErrors.company_id}>
                  <SearchableSelect
                    options={companyOptions}
                    value={form.company_id}
                    onChange={handleCompanyChange}
                    placeholder="Select company"
                    error={Boolean(fieldErrors.company_id)}
                  />
                </Field>
                <Field
                  label="Contact"
                  required
                  error={fieldErrors.contact_id || contactsError}
                  hint={form.company_id && !contactsLoading && contacts.length === 0 ? "This company has no contacts yet." : null}
                >
                  <SearchableSelect
                    options={contactOptions}
                    value={form.contact_id}
                    onChange={(v) => setField("contact_id", v)}
                    placeholder={form.company_id ? "Select contact" : "Select a company first"}
                    disabled={!form.company_id}
                    loading={contactsLoading}
                    error={Boolean(fieldErrors.contact_id)}
                    emptyText="No contacts for this company"
                  />
                  {selectedContact && (
                    <div className="mt-2 rounded-lg border border-[#d4e0f0]/70 bg-white divide-y divide-[#d4e0f0]/50">
                      {[
                        { icon: "call", label: "Mobile", value: selectedContact.contact_number, href: `tel:${selectedContact.contact_number}` },
                        { icon: "mail", label: "Email", value: selectedContact.email, href: `mailto:${selectedContact.email}` },
                      ].map(({ icon, label, value, href }) => (
                        <div key={label} className="flex items-center gap-2.5 px-3 py-2">
                          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[#eef2fb] text-[#2d55a0]">
                            <span className="material-symbols-outlined text-[15px]">{icon}</span>
                          </span>
                          <div className="min-w-0">
                            <p className="text-[10.5px] font-semibold uppercase tracking-wider text-[#6b7280]">{label}</p>
                            {value ? (
                              <a href={href} className="block truncate text-[12.5px] font-medium text-[#111827] hover:text-[#2d55a0]" title={value}>
                                {value}
                              </a>
                            ) : (
                              <p className="text-[12.5px] text-[#6b7280]">Not available</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </Field>

                <Field label="Product / Model / Serial No.">
                  <input
                    value={form.product_model_serial}
                    onChange={(e) => setField("product_model_serial", e.target.value)}
                    placeholder="e.g. ABB DPT-1 nos, 266DSH"
                    className={inpCls(false)}
                  />
                </Field>
                <Field label="Service Type">
                  <input
                    value={form.service_type}
                    onChange={(e) => setField("service_type", e.target.value)}
                    placeholder="e.g. Online Support, Paid, FOC"
                    className={inpCls(false)}
                  />
                </Field>

                <Field label="PO Number">
                  <input
                    value={form.po_number}
                    onChange={(e) => setField("po_number", e.target.value)}
                    className={inpCls(false)}
                  />
                </Field>
                <Field label="Engineer Name">
                  <input
                    value={form.engineer_name}
                    onChange={(e) => setField("engineer_name", e.target.value)}
                    className={inpCls(false)}
                  />
                </Field>

                <Field label="Service Done Date" error={fieldErrors.service_done_date}>
                  <input
                    type="date"
                    value={form.service_done_date}
                    onChange={(e) => setField("service_done_date", e.target.value)}
                    className={inpCls(fieldErrors.service_done_date)}
                  />
                  {form.service_done_date && form.is_pending && (
                    <div className="mt-1.5 flex items-center justify-between gap-2 rounded-md bg-[#fff6df] px-2.5 py-1.5 text-[11.5px] text-[#84600f]">
                      <span>Service is done. Mark this call as not pending?</span>
                      <button
                        type="button"
                        onClick={() => setField("is_pending", false)}
                        className="font-semibold underline shrink-0"
                      >
                        Mark done
                      </button>
                    </div>
                  )}
                </Field>

                <Field label="Status">
                  <div className="grid grid-cols-2 gap-1 rounded-lg border border-[#c5d3e4]/50 bg-[#f8fafd] p-1">
                    {[
                      { value: true, label: "Pending", icon: "schedule", active: "bg-[#fef3c7] text-[#92400e]" },
                      { value: false, label: "Done", icon: "check_circle", active: "bg-[#dcfce7] text-[#166534]" },
                    ].map((opt) => (
                      <button
                        key={opt.label}
                        type="button"
                        onClick={() => setField("is_pending", opt.value)}
                        className={[
                          "inline-flex items-center justify-center gap-1.5 rounded-md py-1.5 text-[12.5px] font-medium transition-colors",
                          form.is_pending === opt.value ? `${opt.active} shadow-sm` : "text-[#6b7280] hover:bg-[#f0f4fa]",
                        ].join(" ")}
                      >
                        <span className="material-symbols-outlined text-[16px]">{opt.icon}</span>
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </Field>
              </div>

              <div>
                <span className="block text-[12px] font-medium text-[#374151] mb-1">Issue Category</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {ISSUE_FLAGS.map(({ name, label, hint }) => (
                    <label
                      key={name}
                      className={[
                        "flex items-start gap-2 rounded-lg border px-3 py-2 cursor-pointer transition-colors",
                        form[name] ? "border-[#2d55a0]/40 bg-[#eef2fb]" : "border-[#c5d3e4]/50 hover:bg-[#f0f4fa]",
                      ].join(" ")}
                    >
                      <input
                        type="checkbox"
                        checked={form[name]}
                        onChange={(e) => setField(name, e.target.checked)}
                        className="mt-0.5 accent-[#2d55a0]"
                      />
                      <span>
                        <span className="block text-[12.5px] font-medium text-[#111827]">{label}</span>
                        <span className="block text-[11px] text-[#6b7280]">{hint}</span>
                      </span>
                    </label>
                  ))}
                </div>
                <p className="text-[11px] text-[#6b7280] mt-1">More than one category can be selected.</p>
              </div>

              <Field label="Remarks">
                <textarea
                  rows={3}
                  value={form.remarks}
                  onChange={(e) => setField("remarks", e.target.value)}
                  className={`${inpCls(false)} resize-y`}
                />
              </Field>
            </div>

            <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-[#d4e0f0]/60">
              <button
                type="button"
                onClick={onClose}
                disabled={saving}
                className="rounded-lg border border-[#c5d3e4]/60 bg-white px-4 py-2 text-[12.5px] font-medium text-[#111827] hover:bg-[#f0f4fa] transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#2d55a0] px-4 py-2 text-[12.5px] font-medium text-white hover:bg-[#234690] transition-colors disabled:opacity-60"
              >
                {saving && <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>}
                {isEdit ? "Save Changes" : "Create Service Call"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
