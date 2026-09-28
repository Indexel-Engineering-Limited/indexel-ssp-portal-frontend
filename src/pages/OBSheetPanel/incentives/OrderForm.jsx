import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getSchemes,
  getOrder,
  createOrder,
  updateOrder,
  calculateOrder,
} from "../../../services/incentiveService";

const EMPTY_FORM = {
  scheme_id: "",
  salesperson: "",
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
  status: "draft",
};

export default function OrderForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [calculating, setCalculating] = useState(false);
  const [error, setError] = useState(null);
  const [calcResult, setCalcResult] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [success, setSuccess] = useState(false);

  async function loadInitial() {
    setLoading(true);
    setError(null);
    try {
      const [schemesData, orderData] = await Promise.all([
        getSchemes(),
        isEdit ? getOrder(id) : Promise.resolve(null),
      ]);

      const list = Array.isArray(schemesData) ? schemesData : [];
      setSchemes(list);

      if (orderData) {
        setForm({
          scheme_id:              orderData.scheme_id              ?? "",
          salesperson:            orderData.salesperson            ?? "",
          invoice_no:             orderData.invoice_no             ?? "",
          invoice_date:           orderData.invoice_date           ? orderData.invoice_date.slice(0, 10) : "",
          plant_customer:         orderData.plant_customer         ?? "",
          item_description:       orderData.item_description       ?? "",
          po_number:              orderData.po_number              ?? "",
          po_date:                orderData.po_date                ? orderData.po_date.slice(0, 10) : "",
          po_value:               orderData.po_value               ?? "",
          po_value_after_sharing: orderData.po_value_after_sharing ?? "",
          new_product_customer:   orderData.new_product_customer   ?? "No",
          margin_percent:         orderData.margin_percent         ?? "",
          remarks:                orderData.remarks                ?? "",
          status:                 orderData.status                 ?? "draft",
        });
        if (orderData.net_incentive != null) {
          setCalcResult({
            margin_multiplier: orderData.margin_multiplier,
            net_incentive:     orderData.net_incentive,
          });
        }
      }
    } catch (err) {
      setError(err.message ?? "Failed to load data");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadInitial();
  }, [id]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
    // Clear calc when relevant fields change
    if (["scheme_id", "po_value", "po_value_after_sharing", "margin_percent", "new_product_customer"].includes(name)) {
      setCalcResult(null);
    }
  }

  function validate() {
    const errs = {};
    if (!form.scheme_id)                   errs.scheme_id       = "Required";
    if (!form.salesperson.trim())          errs.salesperson     = "Required";
    if (!form.invoice_no.trim())           errs.invoice_no      = "Required";
    if (!form.invoice_date)                errs.invoice_date    = "Required";
    if (!form.plant_customer.trim())       errs.plant_customer  = "Required";
    if (form.po_value === "" || form.po_value === null) errs.po_value = "Required";
    if (form.margin_percent === "" || form.margin_percent === null) errs.margin_percent = "Required";
    const mp = Number(form.margin_percent);
    if (!isNaN(mp) && (mp < 0 || mp > 100))  errs.margin_percent = "Must be between 0 and 100";
    return errs;
  }

  async function handleCalculate() {
    if (!form.scheme_id) { setFieldErrors((p) => ({ ...p, scheme_id: "Select a scheme first" })); return; }
    if (form.po_value === "" && form.po_value_after_sharing === "") {
      setFieldErrors((p) => ({ ...p, po_value: "Enter PO Value to calculate" }));
      return;
    }
    if (form.margin_percent === "") { setFieldErrors((p) => ({ ...p, margin_percent: "Enter Margin % to calculate" })); return; }

    setCalculating(true);
    setError(null);
    try {
      const payload = {
        scheme_id:              Number(form.scheme_id),
        po_value_after_sharing: form.po_value_after_sharing !== "" ? Number(form.po_value_after_sharing) : Number(form.po_value),
        po_value:               Number(form.po_value),
        margin_percent:         Number(form.margin_percent),
        new_product_customer:   form.new_product_customer,
      };
      const result = await calculateOrder(payload);
      setCalcResult(result);
    } catch (err) {
      setError(err.message ?? "Calculation failed");
    } finally {
      setCalculating(false);
    }
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
        scheme_id:              Number(form.scheme_id),
        po_value:               Number(form.po_value),
        po_value_after_sharing: form.po_value_after_sharing !== "" ? Number(form.po_value_after_sharing) : null,
        margin_percent:         Number(form.margin_percent),
        margin_multiplier:      calcResult?.margin_multiplier ?? null,
        net_incentive:          calcResult?.net_incentive ?? null,
      };
      if (isEdit) {
        await updateOrder(id, payload);
      } else {
        await createOrder(payload);
      }
      setSuccess(true);
      setTimeout(() => navigate("/ob-sheet/incentives/orders"), 800);
    } catch (err) {
      setError(err.message ?? "Failed to save order");
    } finally {
      setSaving(false);
    }
  }

  const activeSchemes = schemes.filter((s) => s.status === "active");

  function Field({ label, name, type = "text", placeholder, required, children }) {
    return (
      <div>
        <label className="block text-[12px] font-medium text-[#374151] mb-1">
          {label} {required && <span className="text-[#ba1a1a]">*</span>}
        </label>
        {children ?? (
          <input
            type={type}
            name={name}
            value={form[name]}
            onChange={handleChange}
            placeholder={placeholder}
            className={`w-full rounded-lg border px-3 py-2 text-[13px] text-[#111827] outline-none focus:border-[#2d55a0] bg-[#f8fafd] ${fieldErrors[name] ? "border-[#ba1a1a]" : "border-[#c5d3e4]/50"}`}
          />
        )}
        {fieldErrors[name] && <p className="text-[11.5px] text-[#ba1a1a] mt-0.5">{fieldErrors[name]}</p>}
      </div>
    );
  }

  return (
    <>
      {/* Header */}
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

      {/* Error / Success banners */}
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
          <span className="text-[13px] text-[#166534]">Order saved successfully. Redirecting...</span>
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
              {/* Scheme */}
              <Field label="Scheme" name="scheme_id" required>
                <select
                  name="scheme_id"
                  value={form.scheme_id}
                  onChange={handleChange}
                  className={`w-full rounded-lg border px-3 py-2 text-[13px] text-[#111827] outline-none focus:border-[#2d55a0] bg-[#f8fafd] ${fieldErrors.scheme_id ? "border-[#ba1a1a]" : "border-[#c5d3e4]/50"}`}
                >
                  <option value="">Select scheme</option>
                  {activeSchemes.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.scheme_name} ({s.financial_year})
                    </option>
                  ))}
                </select>
                {fieldErrors.scheme_id && <p className="text-[11.5px] text-[#ba1a1a] mt-0.5">{fieldErrors.scheme_id}</p>}
              </Field>

              {/* Salesperson */}
              <Field label="Salesperson" name="salesperson" placeholder="e.g. Rahul Sharma" required />

              {/* Invoice No */}
              <Field label="Invoice No" name="invoice_no" placeholder="e.g. INV-2024-001" required />

              {/* Invoice Date */}
              <Field label="Invoice Date" name="invoice_date" type="date" required />

              {/* Plant / Customer */}
              <div className="sm:col-span-2">
                <Field label="Plant / Customer" name="plant_customer" placeholder="e.g. Tata Motors, Pune" required />
              </div>

              {/* Item Description */}
              <div className="sm:col-span-2">
                <label className="block text-[12px] font-medium text-[#374151] mb-1">Item Description</label>
                <textarea
                  name="item_description"
                  value={form.item_description}
                  onChange={handleChange}
                  rows={2}
                  placeholder="Brief description of items..."
                  className="w-full rounded-lg border border-[#c5d3e4]/50 px-3 py-2 text-[13px] text-[#111827] outline-none focus:border-[#2d55a0] bg-[#f8fafd] resize-none"
                />
              </div>

              {/* PO Number */}
              <Field label="PO Number" name="po_number" placeholder="e.g. PO-12345" />

              {/* PO Date */}
              <Field label="PO Date" name="po_date" type="date" />

              {/* PO Value */}
              <Field label="PO Value (₹)" name="po_value" type="number" placeholder="e.g. 500000" required />

              {/* PO Value After Sharing */}
              <Field label="PO Value After Sharing (₹)" name="po_value_after_sharing" type="number" placeholder="Leave blank to use PO Value" />

              {/* New Product / Customer */}
              <Field label="New Product / Customer" name="new_product_customer">
                <select
                  name="new_product_customer"
                  value={form.new_product_customer}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-[#c5d3e4]/50 px-3 py-2 text-[13px] text-[#111827] outline-none focus:border-[#2d55a0] bg-[#f8fafd]"
                >
                  <option value="No">No</option>
                  <option value="Yes">Yes</option>
                </select>
              </Field>

              {/* Margin % */}
              <Field label="Margin %" name="margin_percent" type="number" placeholder="e.g. 22" required />

              {/* Remarks */}
              <div className="sm:col-span-2">
                <label className="block text-[12px] font-medium text-[#374151] mb-1">Remarks</label>
                <textarea
                  name="remarks"
                  value={form.remarks}
                  onChange={handleChange}
                  rows={2}
                  placeholder="Optional remarks..."
                  className="w-full rounded-lg border border-[#c5d3e4]/50 px-3 py-2 text-[13px] text-[#111827] outline-none focus:border-[#2d55a0] bg-[#f8fafd] resize-none"
                />
              </div>

              {/* Status */}
              <Field label="Status" name="status">
                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-[#c5d3e4]/50 px-3 py-2 text-[13px] text-[#111827] outline-none focus:border-[#2d55a0] bg-[#f8fafd]"
                >
                  <option value="draft">Draft</option>
                  <option value="submitted">Submitted</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </Field>
            </div>
          </div>

          {/* Calculation section */}
          <div className="bg-white rounded-xl border border-[#e2e9f4] shadow-sm p-6 mb-5">
            <h2 className="text-[14px] font-semibold text-[#111827] mb-4 pb-3 border-b border-[#e2e9f4]">
              Calculate Incentive
            </h2>
            <p className="text-[12.5px] text-[#374151] mb-4">
              Click calculate to preview the margin multiplier and net incentive based on the selected scheme rules.
            </p>

            <button
              type="button"
              onClick={handleCalculate}
              disabled={calculating}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#2d55a0] px-4 py-2 text-[12.5px] font-medium text-[#2d55a0] hover:bg-[#eef2fb] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {calculating
                ? <><span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>Calculating...</>
                : <><span className="material-symbols-outlined text-[16px]">calculate</span>Calculate</>
              }
            </button>

            {calcResult && (
              <div className="mt-4 rounded-lg bg-[#eef2fb] border border-[#c5d3e4] p-4 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[11px] font-semibold text-[#6b7280] uppercase tracking-wider">Margin Multiplier</p>
                  <p className="text-[20px] font-bold text-[#2d55a0] mt-0.5">
                    {calcResult.margin_multiplier != null ? `${calcResult.margin_multiplier}x` : "—"}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-[#6b7280] uppercase tracking-wider">Net Incentive</p>
                  <p className="text-[20px] font-bold text-[#2d55a0] mt-0.5">
                    {calcResult.net_incentive != null
                      ? `₹${Number(calcResult.net_incentive).toLocaleString("en-IN")}`
                      : "—"}
                  </p>
                </div>
                {calcResult.rule_applied && (
                  <div className="col-span-2">
                    <p className="text-[11px] font-semibold text-[#6b7280] uppercase tracking-wider">Rule Applied</p>
                    <p className="text-[13px] text-[#374151] mt-0.5">{calcResult.rule_applied}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Form actions */}
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
