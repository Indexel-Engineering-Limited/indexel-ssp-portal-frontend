import { useEffect, useState } from "react";
import {
  getSchemes,
  calculateOrder,
  getAchievementRules,
  getMarginRules,
} from "../../../services/incentiveService";

export default function IncentiveCalculations() {
  const [schemes, setSchemes] = useState([]);
  const [loadingSchemes, setLoadingSchemes] = useState(true);
  const [schemeError, setSchemeError] = useState(null);

  const [form, setForm] = useState({
    scheme_id: "",
    po_value: "",
    margin_percent: "",
    new_product_customer: "No",
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [calculating, setCalculating] = useState(false);
  const [calcError, setCalcError] = useState(null);
  const [calcResult, setCalcResult] = useState(null);

  const [selectedScheme, setSelectedScheme] = useState(null);
  const [achRules, setAchRules] = useState([]);
  const [marginRules, setMarginRules] = useState([]);
  const [loadingRules, setLoadingRules] = useState(false);

  // Load schemes on mount
  useEffect(() => {
    async function load() {
      setLoadingSchemes(true);
      setSchemeError(null);
      try {
        const data = await getSchemes();
        setSchemes(Array.isArray(data) ? data : []);
      } catch (err) {
        setSchemeError(err.message ?? "Failed to load schemes");
      } finally {
        setLoadingSchemes(false);
      }
    }
    load();
  }, []);

  // Load rules when scheme changes
  useEffect(() => {
    if (!form.scheme_id) {
      setAchRules([]);
      setMarginRules([]);
      setSelectedScheme(null);
      return;
    }
    const found = schemes.find((s) => String(s.id) === String(form.scheme_id));
    setSelectedScheme(found ?? null);

    async function loadRules() {
      setLoadingRules(true);
      try {
        const [ach, mgn] = await Promise.all([
          getAchievementRules(form.scheme_id).catch(() => []),
          getMarginRules(form.scheme_id).catch(() => []),
        ]);
        setAchRules(Array.isArray(ach) ? ach : []);
        setMarginRules(Array.isArray(mgn) ? mgn : []);
      } finally {
        setLoadingRules(false);
      }
    }
    loadRules();
  }, [form.scheme_id, schemes]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
    setCalcResult(null);
  }

  function validate() {
    const errs = {};
    if (!form.scheme_id)     errs.scheme_id     = "Select a scheme";
    if (!form.po_value)      errs.po_value      = "Enter PO Value";
    if (!form.margin_percent) errs.margin_percent = "Enter Margin %";
    const mp = Number(form.margin_percent);
    if (form.margin_percent && (mp < 0 || mp > 100)) errs.margin_percent = "Must be between 0 and 100";
    return errs;
  }

  async function handleCalculate(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setFieldErrors(errs); return; }

    setCalculating(true);
    setCalcError(null);
    setCalcResult(null);
    try {
      const payload = {
        scheme_id:            Number(form.scheme_id),
        po_value:             Number(form.po_value),
        margin_percent:       Number(form.margin_percent),
        new_product_customer: form.new_product_customer,
      };
      const result = await calculateOrder(payload);
      setCalcResult(result);
    } catch (err) {
      setCalcError(err.message ?? "Calculation failed");
    } finally {
      setCalculating(false);
    }
  }

  const activeSchemes = schemes.filter((s) => s.status === "active");

  return (
    <>
      {/* Header */}
      <div className="flex flex-col gap-1.5 mb-5">
        <h1
          className="font-semibold text-[20px] text-[#111827]"
          style={{ fontFamily: "'Hanken Grotesk', sans-serif" }}
        >
          Incentive Calculator
        </h1>
        <p className="text-[12.5px] text-[#374151]">
          Run a quick calculation to preview incentive without saving an order.
        </p>
      </div>

      {/* Scheme loading error */}
      {schemeError && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-[#ffdad6] bg-[#ffdad6]/40 px-4 py-3">
          <span className="material-symbols-outlined text-[#ba1a1a] text-[18px]">error</span>
          <span className="text-[13px] text-[#ba1a1a]">{schemeError}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Calculator form */}
        <div className="bg-white rounded-xl border border-[#e2e9f4] shadow-sm p-6">
          <h2 className="text-[14px] font-semibold text-[#111827] mb-4 pb-3 border-b border-[#e2e9f4]">
            Quick Calculate
          </h2>

          <form onSubmit={handleCalculate} noValidate className="space-y-4">
            {/* Scheme */}
            <div>
              <label className="block text-[12px] font-medium text-[#374151] mb-1">
                Scheme <span className="text-[#ba1a1a]">*</span>
              </label>
              {loadingSchemes ? (
                <div className="flex items-center gap-2 py-2">
                  <span className="material-symbols-outlined text-[#a6bcee] text-[18px] animate-spin">progress_activity</span>
                  <span className="text-[12.5px] text-[#374151]">Loading schemes...</span>
                </div>
              ) : (
                <select
                  name="scheme_id"
                  value={form.scheme_id}
                  onChange={handleChange}
                  className={`w-full rounded-lg border px-3 py-2 text-[13px] text-[#111827] outline-none focus:border-[#2d55a0] bg-[#f8fafd] ${fieldErrors.scheme_id ? "border-[#ba1a1a]" : "border-[#c5d3e4]/50"}`}
                >
                  <option value="">Select a scheme</option>
                  {activeSchemes.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.scheme_name} ({s.financial_year})
                    </option>
                  ))}
                </select>
              )}
              {fieldErrors.scheme_id && <p className="text-[11.5px] text-[#ba1a1a] mt-0.5">{fieldErrors.scheme_id}</p>}
            </div>

            {/* PO Value */}
            <div>
              <label className="block text-[12px] font-medium text-[#374151] mb-1">
                PO Value (₹) <span className="text-[#ba1a1a]">*</span>
              </label>
              <input
                type="number"
                name="po_value"
                value={form.po_value}
                onChange={handleChange}
                placeholder="e.g. 500000"
                className={`w-full rounded-lg border px-3 py-2 text-[13px] text-[#111827] outline-none focus:border-[#2d55a0] bg-[#f8fafd] ${fieldErrors.po_value ? "border-[#ba1a1a]" : "border-[#c5d3e4]/50"}`}
              />
              {fieldErrors.po_value && <p className="text-[11.5px] text-[#ba1a1a] mt-0.5">{fieldErrors.po_value}</p>}
            </div>

            {/* Margin % */}
            <div>
              <label className="block text-[12px] font-medium text-[#374151] mb-1">
                Margin % <span className="text-[#ba1a1a]">*</span>
              </label>
              <input
                type="number"
                name="margin_percent"
                value={form.margin_percent}
                onChange={handleChange}
                placeholder="e.g. 22"
                min={0}
                max={100}
                className={`w-full rounded-lg border px-3 py-2 text-[13px] text-[#111827] outline-none focus:border-[#2d55a0] bg-[#f8fafd] ${fieldErrors.margin_percent ? "border-[#ba1a1a]" : "border-[#c5d3e4]/50"}`}
              />
              {fieldErrors.margin_percent && <p className="text-[11.5px] text-[#ba1a1a] mt-0.5">{fieldErrors.margin_percent}</p>}
            </div>

            {/* New Product / Customer */}
            <div>
              <label className="block text-[12px] font-medium text-[#374151] mb-1">New Product / Customer</label>
              <select
                name="new_product_customer"
                value={form.new_product_customer}
                onChange={handleChange}
                className="w-full rounded-lg border border-[#c5d3e4]/50 px-3 py-2 text-[13px] text-[#111827] outline-none focus:border-[#2d55a0] bg-[#f8fafd]"
              >
                <option value="No">No</option>
                <option value="Yes">Yes</option>
              </select>
            </div>

            {calcError && (
              <div className="flex items-center gap-2 rounded-lg border border-[#ffdad6] bg-[#ffdad6]/40 px-3 py-2.5">
                <span className="material-symbols-outlined text-[#ba1a1a] text-[16px]">error</span>
                <span className="text-[12.5px] text-[#ba1a1a]">{calcError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={calculating || loadingSchemes}
              className="w-full inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#2d55a0] px-4 py-2.5 text-[13px] font-medium text-white hover:bg-[#234690] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {calculating
                ? <><span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>Calculating...</>
                : <><span className="material-symbols-outlined text-[16px]">calculate</span>Calculate Incentive</>
              }
            </button>
          </form>

          {/* Results */}
          {calcResult && (
            <div className="mt-5 rounded-lg bg-[#eef2fb] border border-[#c5d3e4] p-4">
              <h3 className="text-[12px] font-semibold uppercase tracking-wider text-[#6b7280] mb-3">Result</h3>
              <div className="grid grid-cols-2 gap-4">
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
                {selectedScheme && (
                  <div className="col-span-2">
                    <p className="text-[11px] font-semibold text-[#6b7280] uppercase tracking-wider">Scheme</p>
                    <p className="text-[13px] text-[#374151] mt-0.5">
                      {selectedScheme.scheme_name} ({selectedScheme.financial_year})
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Rules reference */}
        <div className="flex flex-col gap-4">
          {!form.scheme_id ? (
            <div className="bg-white rounded-xl border border-[#e2e9f4] shadow-sm p-6 flex flex-col items-center justify-center py-16 text-center">
              <span className="material-symbols-outlined text-[#c5d3e4] text-[36px] mb-2">schema</span>
              <p className="text-[13px] text-[#374151]">Select a scheme to view its rules.</p>
            </div>
          ) : loadingRules ? (
            <div className="bg-white rounded-xl border border-[#e2e9f4] shadow-sm p-6 flex flex-col items-center justify-center py-16">
              <span className="material-symbols-outlined text-[#a6bcee] text-[28px] animate-spin">progress_activity</span>
              <p className="text-[13px] text-[#374151] mt-2">Loading rules...</p>
            </div>
          ) : (
            <>
              {/* Achievement Rules */}
              <div className="bg-white rounded-xl border border-[#e2e9f4] shadow-sm overflow-hidden">
                <div className="px-5 py-3 border-b border-[#e2e9f4]">
                  <h3 className="text-[13px] font-semibold text-[#111827]">Achievement Rules</h3>
                </div>
                {achRules.length === 0 ? (
                  <p className="px-5 py-4 text-[12.5px] text-[#374151]">No achievement rules configured.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="text-[10.5px] font-semibold uppercase tracking-wider text-[#6b7280] border-b border-[#e2e9f4] bg-[#f8fafd]">
                          <th className="px-4 py-2">Min %</th>
                          <th className="px-4 py-2">Max %</th>
                          <th className="px-4 py-2">Rule Type</th>
                          <th className="px-4 py-2">Value</th>
                          <th className="px-4 py-2">Remarks</th>
                        </tr>
                      </thead>
                      <tbody className="text-[12.5px] text-[#111827]">
                        {achRules.map((r, i) => (
                          <tr key={i} className="border-b border-[#e2e9f4]/60 last:border-0 hover:bg-[#f8fafd]">
                            <td className="px-4 py-2">{r.min_percent ?? "—"}%</td>
                            <td className="px-4 py-2">{r.max_percent !== "" && r.max_percent != null ? `${r.max_percent}%` : "∞"}</td>
                            <td className="px-4 py-2 text-[#374151]">
                              {r.rule_type === "salary_multiplier" ? "Salary Multiplier" : "Billing %"}
                            </td>
                            <td className="px-4 py-2">{r.value ?? "—"}</td>
                            <td className="px-4 py-2 text-[#6b7280]">{r.remarks || "—"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Margin Rules */}
              <div className="bg-white rounded-xl border border-[#e2e9f4] shadow-sm overflow-hidden">
                <div className="px-5 py-3 border-b border-[#e2e9f4]">
                  <h3 className="text-[13px] font-semibold text-[#111827]">Margin Rules</h3>
                </div>
                {marginRules.length === 0 ? (
                  <p className="px-5 py-4 text-[12.5px] text-[#374151]">No margin rules configured.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="text-[10.5px] font-semibold uppercase tracking-wider text-[#6b7280] border-b border-[#e2e9f4] bg-[#f8fafd]">
                          <th className="px-4 py-2">Min %</th>
                          <th className="px-4 py-2">Max %</th>
                          <th className="px-4 py-2">Multiplier</th>
                          <th className="px-4 py-2">Remarks</th>
                        </tr>
                      </thead>
                      <tbody className="text-[12.5px] text-[#111827]">
                        {marginRules.map((r, i) => (
                          <tr key={i} className="border-b border-[#e2e9f4]/60 last:border-0 hover:bg-[#f8fafd]">
                            <td className="px-4 py-2">{r.min_percent ?? "—"}%</td>
                            <td className="px-4 py-2">{r.max_percent !== "" && r.max_percent != null ? `${r.max_percent}%` : "∞"}</td>
                            <td className="px-4 py-2 font-medium text-[#2d55a0]">{r.multiplier ?? "—"}x</td>
                            <td className="px-4 py-2 text-[#6b7280]">{r.remarks || "—"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
