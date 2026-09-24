﻿
import { useEffect, useState } from "react";

const EMPTY_FORM = {
  person_name: "",
  designation: "",
  department: "",
  email: "",
  contact_number: "",
};

const DEPARTMENTS = [
  "Electrical",
  "Instrumentation",
  "P&I",
  "Purchase",
  "Projects",
  "Equipments and Sustainability",
  "Mechanical",
  "Safety",
  "Process Planning",
  "Management",
];
const COUNTRY_CODES = [
  { code: "+91", country: "India" },
  { code: "+1", country: "USA / Canada" },
  { code: "+44", country: "UK" },
  { code: "+61", country: "Australia" },
  { code: "+971", country: "UAE" },
  { code: "+65", country: "Singapore" },
  { code: "+49", country: "Germany" },
  { code: "+33", country: "France" },
];

function Field({ label, required, children }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[12px] font-semibold text-[#374151] uppercase tracking-wider">
        {label}
        {required && (
          <span className="text-[#ba1a1a] ml-0.5">*</span>
        )}
      </label>

      {children}
    </div>
  );
}

const inputCls =
  "w-full border border-[#c5d3e4]/50 rounded-lg px-3 py-2 text-[13px] text-[#111827] bg-[#f8fafd] placeholder:text-[#6b7280]/60 focus:outline-none focus:ring-2 focus:ring-[#2d55a0]/10 focus:border-[#2d55a0]/30 transition-all disabled:bg-[#f0f4fa] disabled:text-[#6b7280] disabled:cursor-not-allowed";

export default function AddContactModal({
  companyName,
  onClose,
  onAdd,

  // Used for edit mode
  initialContact = null,
  mode = "add",

  // Optional loading state from parent
  loading = false,
}) {
  const isEditMode = mode === "edit";

  // ─────────────────────────────────────────────────────────────
  // FORM STATE
  // ─────────────────────────────────────────────────────────────
  const [countryCode, setCountryCode] = useState("+91");
  const [form, setForm] = useState(() => ({
    person_name: initialContact?.person_name || "",
    designation: initialContact?.designation || "",
    department: initialContact?.department || "",
    email: initialContact?.email || "",
    contact_number: initialContact?.contact_number || "",
  }));

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);

  // ─────────────────────────────────────────────────────────────
  // UPDATE FORM WHEN INITIAL CONTACT CHANGES
  // ─────────────────────────────────────────────────────────────

  useEffect(() => {
    if (initialContact) {
      setForm({
        person_name: initialContact.person_name || "",
        designation: initialContact.designation || "",
        department: initialContact.department || "",
        email: initialContact.email || "",
        contact_number: initialContact.contact_number || "",
      });
    } else {
      setForm(EMPTY_FORM);
    }

    setErrors({});
    setSubmitError(null);
  }, [initialContact]);

  // ─────────────────────────────────────────────────────────────
  // FIELD SETTER
  // ─────────────────────────────────────────────────────────────

  function set(field, value) {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [field]: undefined,

      ...((field === "email" ||
        field === "contact_number")
        ? { contact: undefined }
        : {}),
    }));

    setSubmitError(null);
  }

  // ─────────────────────────────────────────────────────────────
  // VALIDATION
  // ─────────────────────────────────────────────────────────────

  function validate() {
    const e = {};

    if (!form.person_name.trim()) {
      e.person_name = "Person name is required";
    }

    if (!form.department.trim()) {
      e.department = "Department is required";
    }

    if (!form.email.trim()) {
      e.email = "Email address is required";
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())
    ) {
      e.email = "Enter a valid email";
    }

    return e;
  }

  // ─────────────────────────────────────────────────────────────
  // SUBMIT
  // ─────────────────────────────────────────────────────────────

  async function handleSubmit(e) {
    e.preventDefault();

    const errs = validate();

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    try {
      await onAdd({
        person_name: form.person_name.trim(),
        designation: form.designation.trim(),
        department: form.department,
        email: form.email.trim(),
        contact_number: form.contact_number.trim()
          ? `${countryCode} ${form.contact_number.trim()}`
          : "",
      });

      // Parent handles closing in edit mode.
      // This is kept for add mode as well.
      onClose();
    } catch (err) {
      setSubmitError(
        err?.message ||
        `Failed to ${isEditMode ? "update" : "add"
        } contact`
      );
    } finally {
      setSubmitting(false);
    }
  }

  // Parent loading OR modal submitting
  const isSubmitting = submitting || loading;

  // ─────────────────────────────────────────────────────────────
  // UI
  // ─────────────────────────────────────────────────────────────

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}

      <div
        className="absolute inset-0 bg-[#0f2044]/30 backdrop-blur-sm"
        onClick={() => {
          if (!isSubmitting) {
            onClose();
          }
        }}
      />

      {/* Modal */}

      <div className="relative w-full max-w-lg bg-[#f8fafd] rounded-xl shadow-2xl flex flex-col max-h-[90vh] overflow-y-auto mx-4">
        {/* =========================================================
            HEADER
        ========================================================== */}

        <div className="flex items-center justify-between px-6 py-4 border-b border-[#d4e0f0]/60 sticky top-0 bg-[#f8fafd] z-10">
          <div>
            <h2 className="text-[16px] font-semibold text-[#111827]">
              {isEditMode
                ? "Edit Contact"
                : "Add Contact"}
            </h2>

            {companyName && (
              <p className="text-[12px] text-[#374151]">
                For {companyName}
              </p>
            )}
          </div>

          <button
            type="button"
            disabled={isSubmitting}
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#6b7280] hover:bg-[#eef2fb] hover:text-[#111827] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <span className="material-symbols-outlined text-[20px]">
              close
            </span>
          </button>
        </div>

        {/* =========================================================
            FORM
        ========================================================== */}

        <form
          onSubmit={handleSubmit}
          noValidate
        >
          <div className="px-6 py-5 grid grid-cols-2 gap-4">
            {/* Person Name */}

            <div className="col-span-2">
              <Field
                label="Person Name"
                required
              >
                <input
                  className={inputCls}
                  placeholder="e.g. John Smith"
                  value={form.person_name}
                  disabled={isSubmitting}
                  onChange={(e) =>
                    set(
                      "person_name",
                      e.target.value
                    )
                  }
                />

                {errors.person_name && (
                  <span className="text-[#ba1a1a] text-[11px]">
                    {errors.person_name}
                  </span>
                )}
              </Field>
            </div>

            {/* Designation */}

            <Field label="Designation">
              <input
                className={inputCls}
                placeholder="e.g. Manager"
                value={form.designation}
                disabled={isSubmitting}
                onChange={(e) =>
                  set(
                    "designation",
                    e.target.value
                  )
                }
              />
            </Field>

            {/* Department */}

            <Field label="Department" required>
              <select
                className={inputCls}
                value={form.department}
                disabled={isSubmitting}
                onChange={(e) =>
                  set(
                    "department",
                    e.target.value
                  )
                }
              >
                <option value="">
                  Select department
                </option>

                {DEPARTMENTS.map(
                  (department) => (
                    <option
                      key={department}
                      value={department}
                    >
                      {department}
                    </option>
                  )
                )}
              </select>
              {errors.department && (
                <span className="text-[#ba1a1a] text-[11px]">
                  {errors.department}
                </span>
              )}
            </Field>

            {/* Contact Number */}

            <div className="col-span-2">
              <Field label="Contact Number">
                <div className="flex w-full gap-2">

                  {/* Country Code */}
                  <div className="relative">
                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                      className={`${inputCls} !w-[90px] !px-2 flex items-center justify-between`}
                    >
                      <span>{countryCode}</span>

                      <span className="material-symbols-outlined text-[16px]">
                        expand_more
                      </span>
                    </button>

                    {showCountryDropdown && (
                      <div className="absolute left-0 top-full mt-1 z-50 w-[180px] max-h-60 overflow-y-auto rounded-lg border border-[#c5d3e4] bg-white shadow-lg">
                        {COUNTRY_CODES.map((item) => (
                          <button
                            key={item.code}
                            type="button"
                            onClick={() => {
                              setCountryCode(item.code);
                              setShowCountryDropdown(false);
                            }}
                            className="w-full px-3 py-2 text-left text-[13px] hover:bg-[#eef2fb] flex gap-2"
                          >
                            <span className="font-medium w-[20px]">
                              {item.code}
                            </span>

                            <span className="text-[#374151]">
                              {" - "+item.country}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Mobile Number */}
                  <input
                    className={`${inputCls} !w-auto flex-1 min-w-0`}
                    type="tel"
                    placeholder="Enter mobile number"
                    value={form.contact_number}
                    disabled={isSubmitting}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, "");
                      set("contact_number", value);
                    }}
                  />
                </div>

                {errors.contact && (
                  <span className="text-[#ba1a1a] text-[11px]">
                    {errors.contact}
                  </span>
                )}
              </Field>
            </div>


            <div className="col-span-2">
              <Field label="Email" required>
                <input
                  className={inputCls}
                  type="email"
                  placeholder="e.g. john@acme.com"
                  value={form.email}
                  disabled={isSubmitting}
                  onChange={(e) =>
                    set(
                      "email",
                      e.target.value
                    )
                  }
                />

                {errors.email && (
                  <span className="text-[#ba1a1a] text-[11px]">
                    {errors.email}
                  </span>
                )}
              </Field>
            </div>
          </div>

          {/* Submit error */}

          {submitError && (
            <div className="px-6 pb-2">
              <div className="rounded-lg bg-[#ffdad6]/40 border border-[#ffdad6] px-3 py-2 text-[12px] text-[#ba1a1a]">
                {submitError}
              </div>
            </div>
          )}

          {/* =======================================================
              FOOTER
          ======================================================== */}

          <div className="px-6 py-4 border-t border-[#d4e0f0]/40 flex items-center justify-end gap-3 sticky bottom-0 bg-[#f8fafd]">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={onClose}
              className="px-4 py-2 border border-[#c5d3e4]/50 rounded-lg text-[13px] font-medium text-[#111827] hover:bg-[#eef2fb] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-[#2d55a0] rounded-lg text-[13px] font-medium text-[#ffffff] hover:bg-[#234690] transition-colors disabled:opacity-60 flex items-center gap-2"
            >
              {isSubmitting && (
                <span className="material-symbols-outlined text-[16px] animate-spin">
                  progress_activity
                </span>
              )}

              {isSubmitting
                ? isEditMode
                  ? "Updating..."
                  : "Saving..."
                : isEditMode
                  ? "Update Contact"
                  : "Add Contact"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

