﻿import { useEffect, useState } from "react";
import {
  getCitiesByCountry,
  getCitiesByState,
  getCountries,
  getStates,
} from "../../services/locationService";

const EMPTY_FORM = {
  company_name: "",
  industry: "",
  country: "",
  state: "",
  city: "",
};

const INDUSTRY_OPTIONS = [
  "Manufacturing",
  "Technology",
  "Healthcare",
  "Finance",
  "Retail",
  "Education",
  "Construction",
  "Transportation & Logistics",
  "Energy",
  "Agriculture",
  "Hospitality",
  "Real Estate",
  "Media & Entertainment",
  "Telecommunications",
  "Other",
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

const selectCls =
  "w-full border border-[#c5d3e4]/50 rounded-lg px-3 py-2 text-[13px] text-[#111827] bg-[#f8fafd] focus:outline-none focus:ring-2 focus:ring-[#2d55a0]/10 focus:border-[#2d55a0]/30 transition-all disabled:bg-[#f0f4fa] disabled:text-[#6b7280] disabled:cursor-not-allowed";

export default function AddCompanyModal({ onClose, onAdd }) {
  const [form, setForm] = useState(EMPTY_FORM);

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  // Location states
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);

  const [loadingCountries, setLoadingCountries] = useState(true);
  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);

  const [locationError, setLocationError] = useState(null);

  // --------------------------------------------------
  // Load countries
  // --------------------------------------------------
  useEffect(() => {
    let cancelled = false;

    setLoadingCountries(true);

    getCountries()
      .then((list) => {
        if (!cancelled) {
          setCountries(list);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setLocationError(err.message);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoadingCountries(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // --------------------------------------------------
  // Load states when country changes
  // --------------------------------------------------
  useEffect(() => {
    if (!form.country) {
      setStates([]);
      setCities([]);
      return;
    }

    let cancelled = false;

    setStates([]);
    setCities([]);
    setLoadingStates(true);
    setLocationError(null);

    getStates(form.country)
      .then(async (list) => {
        if (cancelled) return;

        setStates(list);

        // Some countries don't have states
        // In that case, load cities directly by country.
        if (!list.length) {
          setLoadingCities(true);

          try {
            const cityList = await getCitiesByCountry(form.country);

            if (!cancelled) {
              setCities(cityList);
            }
          } catch (err) {
            if (!cancelled) {
              setLocationError(err.message);
            }
          } finally {
            if (!cancelled) {
              setLoadingCities(false);
            }
          }
        } else {
          setCities([]);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setLocationError(err.message);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoadingStates(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [form.country]);

  // --------------------------------------------------
  // Load cities when state changes
  // --------------------------------------------------
  useEffect(() => {
    if (!form.country || !form.state) {
      return;
    }

    let cancelled = false;

    setCities([]);
    setLoadingCities(true);
    setLocationError(null);

    getCitiesByState(form.country, form.state)
      .then((list) => {
        if (!cancelled) {
          setCities(list);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setLocationError(err.message);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoadingCities(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [form.country, form.state]);

  // --------------------------------------------------
  // Form field setter
  // --------------------------------------------------
  function set(field, value) {
    setForm((prev) => {
      // Country changed
      if (field === "country") {
        return {
          ...prev,
          country: value,
          state: "",
          city: "",
        };
      }

      // State changed
      if (field === "state") {
        return {
          ...prev,
          state: value,
          city: "",
        };
      }

      return {
        ...prev,
        [field]: value,
      };
    });

    setErrors((prev) => ({
      ...prev,
      [field]: undefined,
    }));
  }

  // --------------------------------------------------
  // Validation
  // --------------------------------------------------
  function validate() {
    const e = {};

    if (!form.company_name.trim()) {
      e.company_name = "Company name is required";
    }

    if (!form.industry.trim()) {
      e.industry = "Industry is required";
    }

    if (!form.country) {
      e.country = "Country is required";
    }

    if (states.length > 0 && !form.state) {
      e.state = "State is required";
    }

    if (cities.length > 0 && !form.city) {
      e.city = "City is required";
    }

    return e;
  }

  // --------------------------------------------------
  // Submit
  // --------------------------------------------------
  async function handleSubmit(e) {
    e.preventDefault();

    const errs = validate();

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setSubmitting(true);
    setSubmitError(null);
    console.log(form);

    try {
      await onAdd({
        company_name: form.company_name.trim(),
        industry: form.industry.trim(),
        country: form.country,
        state: form.state,
        city: form.city,
      });

      onClose();
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  const stateDisabled =
    !form.country ||
    loadingStates ||
    states.length === 0;

  const cityDisabled =
    !form.country ||
    loadingCities ||
    (!form.state && states.length > 0);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div
        className="absolute inset-0 bg-[#0f2044]/30 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative w-full max-w-lg bg-[#f8fafd] rounded-xl shadow-2xl flex flex-col max-h-[90vh] overflow-y-auto mx-4">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#d4e0f0]/60 sticky top-0 bg-[#f8fafd] z-10">
          <h2 className="text-[16px] font-semibold text-[#111827]">
            Add Company
          </h2>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#6b7280] hover:bg-[#eef2fb] hover:text-[#111827] transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">
              close
            </span>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate>
          <div className="px-6 py-5 grid grid-cols-2 gap-4">

            {/* Company Name */}
            <div className="col-span-2">
              <Field label="Company Name" required>
                <input
                  className={inputCls}
                  placeholder="e.g. Acme Corp Global"
                  value={form.company_name}
                  onChange={(e) =>
                    set("company_name", e.target.value)
                  }
                />

                {errors.company_name && (
                  <span className="text-[#ba1a1a] text-[11px]">
                    {errors.company_name}
                  </span>
                )}
              </Field>
            </div>

            {/* Industry */}
            <div className="col-span-2">
              <Field label="Industry" required>
                <div className="relative">
                  <select
                    className={selectCls}
                    value={form.industry}
                    onChange={(e) =>
                      set("industry", e.target.value)
                    }
                  >
                    <option value="" disabled>
                      Select an industry
                    </option>

                    {INDUSTRY_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>

                  <span className="material-symbols-outlined text-[18px] text-[#6b7280] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    expand_more
                  </span>
                </div>

                {errors.industry && (
                  <span className="text-[#ba1a1a] text-[11px]">
                    {errors.industry}
                  </span>
                )}
              </Field>
            </div>

            {/* Country */}
            <div className="col-span-2">
              <Field label="Country" required>
                <select
                  className={selectCls}
                  value={form.country}
                  onChange={(e) =>
                    set("country", e.target.value)
                  }
                  disabled={loadingCountries}
                >
                  <option value="">
                    {loadingCountries
                      ? "Loading countries..."
                      : "Select country"}
                  </option>

                  {countries.map((country) => (
                    <option key={country} value={country}>
                      {country}
                    </option>
                  ))}
                </select>

                {errors.country && (
                  <span className="text-[#ba1a1a] text-[11px]">
                    {errors.country}
                  </span>
                )}
              </Field>
            </div>

            {/* State */}
            <Field label="State" required={states.length > 0}>
              <select
                className={selectCls}
                value={form.state}
                onChange={(e) =>
                  set("state", e.target.value)
                }
                disabled={stateDisabled}
              >
                <option value="">
                  {loadingStates
                    ? "Loading states..."
                    : !form.country
                      ? "Select country first"
                      : states.length === 0
                        ? "No states for this country"
                        : "Select state"}
                </option>

                {states.map((state) => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </select>

              {errors.state && (
                <span className="text-[#ba1a1a] text-[11px]">
                  {errors.state}
                </span>
              )}
            </Field>

            {/* City */}
            <Field label="City" required={cities.length > 0}>
              <select
                className={selectCls}
                value={form.city}
                onChange={(e) =>
                  set("city", e.target.value)
                }
                disabled={cityDisabled}
              >
                <option value="">
                  {loadingCities
                    ? "Loading cities..."
                    : !form.country
                      ? "Select country first"
                      : states.length > 0 && !form.state
                        ? "Select state first"
                        : cities.length === 0
                          ? "No cities found"
                          : "Select city"}
                </option>

                {cities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>

              {errors.city && (
                <span className="text-[#ba1a1a] text-[11px]">
                  {errors.city}
                </span>
              )}
            </Field>
          </div>

          {/* Location Error */}
          {locationError && (
            <div className="px-6 pb-2 text-[12px] text-[#ba1a1a]">
              {locationError}
            </div>
          )}

          {/* Submit Error */}
          {submitError && (
            <div className="px-6 pb-2 text-[12px] text-[#ba1a1a]">
              {submitError}
            </div>
          )}

          {/* Footer */}
          <div className="px-6 py-4 border-t border-[#d4e0f0]/40 flex items-center justify-end gap-3 sticky bottom-0 bg-[#f8fafd]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-[#c5d3e4]/50 rounded-lg text-[13px] font-medium text-[#111827] hover:bg-[#eef2fb] transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-[#2d55a0] rounded-lg text-[13px] font-medium text-[#ffffff] hover:bg-[#234690] transition-colors disabled:opacity-60"
            >
              {submitting ? "Saving..." : "Add Company"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}