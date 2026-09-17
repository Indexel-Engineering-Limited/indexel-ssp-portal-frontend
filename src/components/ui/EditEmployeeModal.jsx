
import { useEffect, useState } from "react";
import {
  X,
  Upload,
  UserRound,
  Loader2,
} from "lucide-react";

export default function EditEmployeeModal({
  employee,
  onClose,
  onUpdate,
}) {
  const [form, setForm] = useState({
    employee_id: "",
    name: "",
    email: "",
    contact_number: "",
    department: "",
    designation: "",
    location: "",
    blood_group: "",
    gender: "",
    joining_date: "",
    status: "active",
    employee_image: null,
  });

  const [imagePreview, setImagePreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // ─────────────────────────────────────────────────────────────
  // LOAD EMPLOYEE DATA
  // ─────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!employee) return;

    setForm({
      employee_id: employee.employee_id || "",
      name: employee.name || "",
      email: employee.email || "",
      contact_number: employee.contact_number || "",
      department: employee.department || "",
      designation: employee.designation || "",
      location: employee.location || "",
      blood_group: employee.blood_group || "",
        gender: employee.gender || "",
        joining_date: employee.joining_date || "",
        status: employee.status || "active",
      employee_image: null,
    });

    if (employee.employee_image) {
      const baseURL =
        import.meta.env.VITE_API_URL || "http://localhost:3000";

      const imageUrl =
        employee.employee_image.startsWith("http://") ||
        employee.employee_image.startsWith("https://")
          ? employee.employee_image
          : `${baseURL}${employee.employee_image}`;

      setImagePreview(imageUrl);
    } else {
      setImagePreview(null);
    }

    setError("");
  }, [employee]);

  // ─────────────────────────────────────────────────────────────
  // INPUT CHANGE
  // ─────────────────────────────────────────────────────────────

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ─────────────────────────────────────────────────────────────
  // IMAGE CHANGE
  // ─────────────────────────────────────────────────────────────

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      setError("Only JPG, PNG and WEBP images are allowed.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image size must be less than 5MB.");
      return;
    }

    setError("");

    setForm((prev) => ({
      ...prev,
      employee_image: file,
    }));

    setImagePreview(URL.createObjectURL(file));
  };

  // ─────────────────────────────────────────────────────────────
  // SUBMIT
  // ─────────────────────────────────────────────────────────────

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (!form.employee_id.trim()) {
      setError("Employee ID is required.");
      return;
    }

    if (!form.name.trim()) {
      setError("Employee name is required.");
      return;
    }

    try {
      setSubmitting(true);

      // Your parent receives (id, form)
      await onUpdate(employee.id, form);

      onClose();
    } catch (err) {
      console.error("Update employee error:", err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to update employee."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (!employee) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">

      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[92vh] overflow-y-auto">

        {/* ───────────────────────────────────────────────────── */}
        {/* HEADER */}
        {/* ───────────────────────────────────────────────────── */}

        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">

          <div>
            <h2 className="text-lg font-bold text-gray-800">
              Edit Employee
            </h2>

            <p className="text-xs text-gray-500 mt-1">
              Update employee information
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500 disabled:opacity-50"
          >
            <X size={20} />
          </button>

        </div>

        {/* ───────────────────────────────────────────────────── */}
        {/* FORM */}
        {/* ───────────────────────────────────────────────────── */}

        <form
          onSubmit={handleSubmit}
          className="p-6"
        >

          {/* ERROR */}
          {error && (
            <div className="mb-5 px-4 py-3 rounded-lg text-sm border bg-red-50 text-red-700 border-red-200">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            {/* ─────────────────────────────────────────────── */}
            {/* IMAGE */}
            {/* ─────────────────────────────────────────────── */}

            <div>

              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Employee Image
              </label>

              <label className="h-56 flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-blue-400 hover:bg-blue-50/20 transition overflow-hidden">

                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Employee Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <>
                    <Upload
                      size={28}
                      className="text-gray-400"
                    />

                    <p className="text-sm text-gray-500 mt-2">
                      Upload employee image
                    </p>

                    <p className="text-xs text-gray-400 mt-1">
                      JPG, PNG or WEBP
                    </p>

                    <p className="text-xs text-gray-400">
                      Maximum 5MB
                    </p>
                  </>
                )}

                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImageChange}
                  disabled={submitting}
                  className="hidden"
                />

              </label>

            </div>

            {/* ─────────────────────────────────────────────── */}
            {/* FIELDS */}
            {/* ─────────────────────────────────────────────── */}

            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">

              {/* Employee ID */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                  Employee ID *
                </label>

                <input
                  type="text"
                  name="employee_id"
                  value={form.employee_id}
                  onChange={handleChange}
                  placeholder="EMP001"
                  required
                  disabled={submitting}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-50"
                />
              </div>

              {/* Name */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                  Full Name *
                </label>

                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Rahul Sharma"
                  required
                  disabled={submitting}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-50"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                  Email
                </label>

                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="rahul@example.com"
                  disabled={submitting}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-50"
                />
              </div>

              {/* Contact */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                  Contact Number
                </label>

                <input
                  type="text"
                  name="contact_number"
                  value={form.contact_number}
                  onChange={handleChange}
                  placeholder="9876543210"
                  disabled={submitting}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-50"
                />
              </div>

              {/* Department */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                  Department
                </label>

                <input
                  type="text"
                  name="department"
                  value={form.department}
                  onChange={handleChange}
                  placeholder="Information Technology"
                  disabled={submitting}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-50"
                />
              </div>

              {/* Designation */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                  Designation
                </label>

                <input
                  type="text"
                  name="designation"
                  value={form.designation}
                  onChange={handleChange}
                  placeholder="Software Engineer"
                  disabled={submitting}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-50"
                />
              </div>

              {/* Location */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                  Location
                </label>

                <input
                  type="text"
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  placeholder="Jaipur"
                  disabled={submitting}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-50"
                />
              </div>

              {/* Blood Group */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                  Blood Group
                </label>

                <select
                  name="blood_group"
                  value={form.blood_group}
                  onChange={handleChange}
                  disabled={submitting}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-50"
                >
                  <option value="">
                    Select blood group
                  </option>

                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>

            </div>
          </div>

          {/* ─────────────────────────────────────────────── */}
          {/* FOOTER */}
          {/* ─────────────────────────────────────────────── */}

          <div className="flex justify-end gap-3 mt-7 pt-5 border-t border-gray-100">

            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2.5 rounded-lg border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#2d55a0] text-white text-sm font-semibold hover:opacity-[0.9] disabled:opacity-60"
            >

              {submitting && (
                <Loader2
                  size={17}
                  className="animate-spin"
                />
              )}

              {submitting
                ? "Updating..."
                : "Update Employee"}

            </button>

          </div>

        </form>

      </div>
    </div>
  );
}
