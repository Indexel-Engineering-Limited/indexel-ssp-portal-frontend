import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getOrder, createOrder, updateOrder, getEmployeeTarget, getMarginRules, getAchievementRules } from "../../../services/incentiveService";
import { getCurrentUser } from "../../../services/authService";

// ─── Outside component — stable reference, no remount on re-render ────────
function inpCls(name, fieldErrors) {
  return `w-full rounded-lg border px-3 py-2 text-[13px] text-[#111827] outline-none focus:border-[#2d55a0] focus:ring-2 focus:ring-[#2d55a0]/10 bg-[#f8fafd] transition-all ${fieldErrors[name] ? "border-[#ba1a1a]" : "border-[#c5d3e4]/50"
    }`;
}

function Field({ label, name, type, placeholder, required, form, fieldErrors, onChange, children }) {
  return (
    <div>
      <label className="block text-[12px] font-medium text-[#374151] mb-1">
        {label}{required && <span className="text-[#ba1a1a] ml-0.5">*</span>}
      </label>
      {children ?? (
        <input
          type={type ?? "text"}
          name={name}
          value={form[name] ?? ""}
          onChange={onChange}
          placeholder={placeholder}
          className={inpCls(name, fieldErrors)}
        />
      )}
      {fieldErrors[name] && <p className="text-[11.5px] text-[#ba1a1a] mt-0.5">{fieldErrors[name]}</p>}
    </div>
  );
}

// ─── Margin rule matcher ──────────────────────────────────────────────────
// Finds the applicable margin rule for a given margin % value
function findMarginRule(rules, marginPercent) {
  if (!rules?.length || marginPercent === "" || marginPercent === null) return null;
  const mp = Number(marginPercent);
  if (isNaN(mp)) return null;

  // Sort by sequence ascending to apply in order
  const sorted = [...rules].sort((a, b) => Number(a.sequence) - Number(b.sequence));

  return sorted.find((r) => {
    const min = Number(r.min_margin);
    const max = r.max_margin !== "" && r.max_margin != null ? Number(r.max_margin) : Infinity;
    return mp >= min && mp < max;
  }) ?? null;
}

// ─── Initial form ─────────────────────────────────────────────────────────
const EMPTY_FORM = {
  invoice_no: "",
  invoice_date: "",
  plant_customer: "",
  item_description: "",
  po_number: "",
  po_date: "",
  po_value: "",
  po_value_after_sharing: "",
  new_product_customer: "No",
  margin_percent: "",
  remarks: "",
};

// ─── Main component ───────────────────────────────────────────────────────
export default function OrderForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const currentUser = getCurrentUser();
  const salesperson = currentUser?.employee_id ?? currentUser?.id ?? "";

  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [success, setSuccess] = useState(false);
  const [target, setTarget] = useState(null);
  const [marginRules, setMarginRules] = useState([]);
  const [achievementRules, setAchievementRules] = useState([]);

  // Fetch target + margin rules on mount
  useEffect(() => {
    const empId = currentUser?.employee_id ?? currentUser?.id;
    if (!empId) return;

    getEmployeeTarget(empId)
      .then((data) => {
        const t = Array.isArray(data) ? data[0] : data;
        setTarget(t);
        // Once we have the scheme_id, fetch margin rules
        const schemeId = t?.scheme_id;
        if (schemeId) {
          Promise.all([
            getMarginRules(schemeId).catch(() => []),
            getAchievementRules(schemeId).catch(() => []),
          ]).then(([mRules, aRules]) => {
            setMarginRules(Array.isArray(mRules) ? mRules : []);
            setAchievementRules(Array.isArray(aRules) ? aRules : []);
          });
        }
      })
      .catch(() => { });
  }, []);

  // Load order for edit mode
  useEffect(() => {
    if (!isEdit) return;
    setLoading(true);
    setError(null);
    getOrder(id)
      .then((data) => {
        if (data) {
          setForm({
            invoice_no: data.invoice_no ?? "",
            invoice_date: data.invoice_date ? data.invoice_date.slice(0, 10) : "",
            plant_customer: data.plant_customer ?? "",
            item_description: data.item_description ?? "",
            po_number: data.po_number ?? "",
            po_date: data.po_date ? data.po_date.slice(0, 10) : "",
            po_value: data.po_value ?? "",
            po_value_after_sharing: data.po_value_after_sharing ?? "",
            new_product_customer: data.new_product_customer ?? "No",
            margin_percent: data.margin_percent ?? "",
            remarks: data.remarks ?? "",
          });
        }
      })
      .catch((err) => setError(err.message ?? "Failed to load order"))
      .finally(() => setLoading(false));
  }, [id]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
  }

  // ─── Live incentive calculation ─────────────────────────────────────────
  const incentiveCalc = useMemo(() => {
    const poSharing =
      form.po_value_after_sharing !== ""
        ? Number(form.po_value_after_sharing)
        : Number(form.po_value);

    const marginPct = Number(form.margin_percent);

    if (
      !poSharing ||
      isNaN(poSharing) ||
      !marginRules.length ||
      form.margin_percent === ""
    ) {
      return null;
    }

    // 1. Find matching margin rule
    const marginRule = findMarginRule(marginRules, marginPct);

    if (!marginRule) return null;

    // 2. Get margin multiplier
    const multiplier = Number(marginRule.multiplier);

    if (isNaN(multiplier)) return null;

    // 3. Calculate base incentive from PO sharing
    // Example: 10000 × 0.6% = 60
    const baseIncentive = poSharing * (multiplier / 100);

    // 4. Calculate incentive for EVERY achievement rule
    const achievementCalculations = [...achievementRules]
      .sort((a, b) => Number(a.sequence) - Number(b.sequence))
      .map((rule) => {
        const rate = Number(rule.incentive_rate);

        let estimatedIncentive = null;

        if (!isNaN(rate)) {
          // Example: 60 × 0.8 = 48
          estimatedIncentive = baseIncentive * rate;
        }

        return {
          ...rule,
          incentiveRate: rate,
          estimatedIncentive,
        };
      });

    return {
      marginRule,
      multiplier,
      poSharing,
      marginPct,
      baseIncentive,
      achievementCalculations,
    };
  }, [
    form.po_value,
    form.po_value_after_sharing,
    form.margin_percent,
    marginRules,
    achievementRules,
  ]);

  function validate() {
    const errs = {};
    if (!form.plant_customer.trim()) errs.plant_customer = "Required";
    if (!form.po_number.trim()) errs.po_number = "Required";
    if (!form.po_date) errs.po_date = "Required";
    if (!form.new_product_customer) errs.new_product_customer = "Required";
    if (form.po_value === "" || form.po_value === null) errs.po_value = "Required";
    if (form.margin_percent === "" || form.margin_percent === null) errs.margin_percent = "Required";
    const mp = Number(form.margin_percent);
    if (!isNaN(mp) && (mp < 0 || mp > 100)) errs.margin_percent = "Must be 0 – 100";
    return errs;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setFieldErrors(errs); return; }

    setSaving(true);
    setError(null);
    try {
      const payload = {
        ...form,
        salesperson_id: salesperson,
        scheme_id: target?.scheme_id ?? null,
        po_value: Number(form.po_value),
        po_value_after_sharing: form.po_value_after_sharing !== ""
          ? Number(form.po_value_after_sharing)
          : null,
        margin_percent: Number(form.margin_percent),
        // Send calculated incentive values if available
        ...(incentiveCalc && {
          margin_multiplier: incentiveCalc.multiplier,
          net_incentive: incentiveCalc.expectedAmount,
        }),
      };
      if (isEdit) { await updateOrder(id, payload); }
      else { await createOrder(payload); }
      setSuccess(true);
      setTimeout(() => navigate("/ob-sheet/incentives/orders"), 800);
    } catch (err) {
      setError(err.message ?? "Failed to save order");
    } finally {
      setSaving(false);
    }
  }

  const fieldProps = { form, fieldErrors, onChange: handleChange };

  return (
    <>
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-5 gap-4">
        <div className="flex flex-col gap-1.5">
          <button
            type="button"
            onClick={() => navigate("/ob-sheet/incentives/orders")}
            className="flex items-center gap-1 text-[12.5px] font-medium text-[#2d55a0] hover:underline w-fit"
          >
            <span className="material-symbols-outlined text-[15px]">arrow_back</span>
            Back to Orders
          </button>
          <h1
            className="font-semibold text-[20px] text-[#111827] mt-0.5"
            style={{ fontFamily: "'Hanken Grotesk', sans-serif" }}
          >
            {isEdit ? "Edit Incentive Order" : "New Incentive Order"}
          </h1>
          <p className="text-[12.5px] text-[#374151]">
            {isEdit ? "Update the order details below." : "Fill in the details to create a new incentive order."}
          </p>
        </div>
      </div>

      {/* Banners */}
      {error && (
        <div className="mb-4 flex items-center justify-between gap-3 rounded-lg border border-[#ffdad6] bg-[#ffdad6]/40 px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#ba1a1a] text-[18px]">error</span>
            <span className="text-[13px] text-[#ba1a1a]">{error}</span>
          </div>
          <button type="button" onClick={() => setError(null)} className="text-[#ba1a1a]">
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>
      )}
      {success && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-[#dcfce7] bg-[#dcfce7]/60 px-4 py-3">
          <span className="material-symbols-outlined text-[#166534] text-[18px]">check_circle</span>
          <span className="text-[13px] text-[#166534]">Order saved. Redirecting…</span>
        </div>
      )}

      {/* Salesperson badge */}
      {salesperson && (
        <div className="mb-4 flex items-center gap-2 rounded-lg bg-[#eef2fb] border border-[#c5d3e4]/40 px-4 py-2.5">
          <span className="material-symbols-outlined text-[#2d55a0] text-[16px]">person</span>
          <span className="text-[12.5px] text-[#374151]">
            Salesperson: <span className="font-semibold text-[#111827]">{currentUser?.name ?? currentUser?.user_name ?? ""}</span>
            <span className="ml-2 text-[11px] font-mono bg-[#dbe5f8] text-[#2d55a0] px-1.5 py-0.5 rounded">{salesperson}</span>
          </span>
        </div>
      )}

      {loading ? (
        <div className="bg-[#f8fafd] rounded-xl border border-[#c5d3e4]/20 py-16 flex flex-col items-center gap-2">
          <span className="material-symbols-outlined text-[#a6bcee] text-[28px] animate-spin">progress_activity</span>
          <span className="text-[13px] text-[#374151]">Loading...</span>
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate>
          <div className="bg-white rounded-xl border border-[#e2e9f4] shadow-sm p-6 mb-5">
            <h2 className="text-[14px] font-semibold text-[#111827] mb-4 pb-3 border-b border-[#e2e9f4]">
              Order Details
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              <Field label="Invoice No" name="invoice_no" placeholder="e.g. INV-2024-001" {...fieldProps} />
              <Field label="Invoice Date" name="invoice_date" type="date" {...fieldProps} />

              <div className="sm:col-span-2">
                <Field label="Plant / Customer" name="plant_customer" placeholder="e.g. Tata Motors, Pune" required {...fieldProps} />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[12px] font-medium text-[#374151] mb-1">Item Description</label>
                <textarea
                  name="item_description"
                  value={form.item_description}
                  onChange={handleChange}
                  rows={2}
                  placeholder="Brief description of items..."
                  className="w-full rounded-lg border border-[#c5d3e4]/50 px-3 py-2 text-[13px] text-[#111827] outline-none focus:border-[#2d55a0] focus:ring-2 focus:ring-[#2d55a0]/10 bg-[#f8fafd] resize-none transition-all"
                />
              </div>

              <Field label="PO Number" name="po_number" placeholder="e.g. PO-12345" required {...fieldProps} />
              <Field label="PO Date" name="po_date" type="date" required {...fieldProps} />
              <Field label="PO Value (₹)" name="po_value" type="number" placeholder="e.g. 500000" required {...fieldProps} />
              <Field label="PO Value After Sharing (₹)" name="po_value_after_sharing" type="number" placeholder="Leave blank to use PO Value" {...fieldProps} />

              <div>
                <label className="block text-[12px] font-medium text-[#374151] mb-1">
                  New Product / Customer<span className="text-[#ba1a1a] ml-0.5">*</span>
                </label>
                <select
                  name="new_product_customer"
                  value={form.new_product_customer}
                  onChange={handleChange}
                  className={inpCls("new_product_customer", fieldErrors)}
                >
                  <option value="No">No</option>
                  <option value="Yes">Yes</option>
                </select>
                {fieldErrors.new_product_customer && (
                  <p className="text-[11.5px] text-[#ba1a1a] mt-0.5">{fieldErrors.new_product_customer}</p>
                )}
              </div>

              <Field label="Margin %" name="margin_percent" type="number" placeholder="e.g. 22" required {...fieldProps} />

              <div className="sm:col-span-2">
                <label className="block text-[12px] font-medium text-[#374151] mb-1">Remarks</label>
                <textarea
                  name="remarks"
                  value={form.remarks}
                  onChange={handleChange}
                  rows={2}
                  placeholder="Optional remarks..."
                  className="w-full rounded-lg border border-[#c5d3e4]/50 px-3 py-2 text-[13px] text-[#111827] outline-none focus:border-[#2d55a0] focus:ring-2 focus:ring-[#2d55a0]/10 bg-[#f8fafd] resize-none transition-all"
                />
              </div>

              {/* ── Expected Incentive ── */}
              {achievementRules.length > 0 && (
                <div className="sm:col-span-2 pt-2">
                  <p className="text-[12px] font-semibold text-[#374151] mb-1.5">
                    Expected Incentive
                  </p>

                  {/* Base incentive */}
                  {incentiveCalc && (
                    <div className="mb-2 rounded-lg bg-[#eef2fb] border border-[#dbe5f8] px-3 py-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[12px] text-[#374151]">
                          Base Incentive
                        </span>

                        <span className="text-[13px] font-semibold text-[#2d55a0]">
                          ₹
                          {incentiveCalc.baseIncentive.toLocaleString("en-IN", {
                            maximumFractionDigits: 2,
                          })}
                        </span>
                      </div>

                      <div className="text-[10.5px] text-[#6b7280] mt-0.5">
                        ₹
                        {incentiveCalc.poSharing.toLocaleString("en-IN")} ×{" "}
                        {incentiveCalc.multiplier}% margin multiplier
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col gap-0.5">
                    {[...achievementRules]
                      .sort((a, b) => Number(a.sequence) - Number(b.sequence))
                      .map((rule) => {
                        const calculation = incentiveCalc?.achievementCalculations?.find(
                          (item) => item.id === rule.id
                        );

                        const rate = Number(rule.incentive_rate);

                        let payoutText = "—";
                        let payoutColor = "#9ca3af";

                        if (rule.incentive_type === "MONTHLY_SALARY") {
                          payoutText = "Monthly Salary";
                          payoutColor = "#2d55a0";
                        } else if (
                          calculation?.estimatedIncentive != null &&
                          !isNaN(rate)
                        ) {
                          payoutText = `₹${calculation.estimatedIncentive.toLocaleString(
                            "en-IN",
                            {
                              maximumFractionDigits: 2,
                            }
                          )}`;

                          payoutColor =
                            calculation.estimatedIncentive > 0
                              ? "#166534"
                              : "#6b7280";
                        }

                        return (
                          <div
                            key={rule.id}
                            className="flex items-center justify-between py-1.5 border-b border-[#f0f4fa] last:border-0"
                          >
                            <div>
                              <span className="text-[12.5px] text-[#374151]">
                                {rule.min_achievement}% –{" "}
                                {rule.max_achievement != null
                                  ? `${rule.max_achievement}%`
                                  : "∞"}
                              </span>

                              {rule.incentive_type !== "MONTHLY_SALARY" &&
                                !isNaN(rate) && (
                                  <span className="ml-2 text-[10.5px] text-[#9ca3af]">
                                    × {rate}
                                  </span>
                                )}
                            </div>

                            <span
                              className="text-[13px] font-semibold"
                              style={{ color: payoutColor }}
                            >
                              {payoutText}
                            </span>
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={saving || success}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#2d55a0] px-5 py-2.5 text-[13px] font-medium text-white hover:bg-[#234690] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving && <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>}
              {saving ? "Saving..." : (isEdit ? "Update Order" : "Create Order")}
            </button>
            <button
              type="button"
              onClick={() => navigate("/ob-sheet/incentives/orders")}
              disabled={saving}
              className="rounded-lg border border-[#c5d3e4]/50 bg-[#f8fafd] px-5 py-2.5 text-[13px] font-medium text-[#374151] hover:bg-[#f0f4fa] transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </>
  );
}