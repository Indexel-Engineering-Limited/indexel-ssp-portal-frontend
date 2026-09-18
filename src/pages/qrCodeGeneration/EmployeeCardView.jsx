import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Download,
  Loader2,
  AlertCircle,
  MapPin,
  Briefcase,
  Mail,
  Phone,
  Building2,
  Calendar,
  BadgeCheck,
  User,
} from "lucide-react";
import { getEmployeeById } from "../../services/employeeService";

/* ─────────────────────────────────────────
   Helper: resolve image path → full URL
───────────────────────────────────────── */
const getImageUrl = (imagePath) => {
  if (!imagePath) return null;

  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    return imagePath;
  }

  const baseURL = import.meta.env.VITE_API_URL || "https://ssp-indexel-co-in-564576.hostingersite.com";
  return `${baseURL}${imagePath}`;
};

/* ─────────────────────────────────────────
   Helper: single detail row
───────────────────────────────────────── */
const DetailRow = ({ icon: Icon, label, value }) => {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3 py-3 border-b border-gray-100 last:border-0">
      <span className="mt-0.5 flex-shrink-0 w-7 h-7 rounded-md bg-gray-100 flex items-center justify-center">
        <Icon size={14} className="text-gray-500" />
      </span>
      <div className="min-w-0">
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">
          {label}
        </p>
        <p className="text-sm text-gray-800 font-medium break-words leading-snug">{value}</p>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────
   Helper: status badge
───────────────────────────────────────── */
const StatusBadge = ({ status }) => {
  const isActive = !status || status === "active";
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
        isActive
          ? "bg-green-50 text-green-700 ring-1 ring-green-200"
          : "bg-gray-100 text-gray-500 ring-1 ring-gray-200"
      }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-green-500" : "bg-gray-400"}`} />
      {isActive ? "Active" : "Inactive"}
    </span>
  );
};

/* ─────────────────────────────────────────
   Main component
───────────────────────────────────────── */
const EmployeeCardView = () => {
  const { id } = useParams();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadEmployee();
  }, [id]);

  const loadEmployee = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getEmployeeById(id);
      setEmployee(data);
    } catch (err) {
      console.error("Failed to load employee:", err);
      setError(err.message || "Failed to load employee details");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadQR = () => {
    const url = getImageUrl(employee?.qr_image);
    if (!url) return;
    const link = document.createElement("a");
    link.href = url;
    link.download = `${employee.employee_id || "employee"}-qr.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  /* ── Loading ── */
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 size={32} className="animate-spin mx-auto text-blue-500 mb-2" />
          <p className="text-sm text-gray-500">Loading employee…</p>
        </div>
      </div>
    );
  }

  /* ── Error ── */
  if (error || !employee) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center max-w-xs">
          <AlertCircle size={36} className="mx-auto text-red-400 mb-2" />
          <h2 className="text-base font-semibold text-gray-800 mb-1">Employee not found</h2>
          <p className="text-sm text-gray-500">{error || "Unable to load employee details"}</p>
        </div>
      </div>
    );
  }

  /* ── Resolve image paths ──
     getImageUrl handles both absolute URLs and relative paths
     (e.g. "/uploads/photo.jpg" → "http://localhost:3000/uploads/photo.jpg")
  ── */
  const photoSrc = getImageUrl(employee.employee_image);
  const qrSrc    = getImageUrl(employee.qr_image);

  const joinedDate =
    employee.joining_date || employee.joining_date
      ? new Date(employee.joining_date || employee.created_at).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })
      : null;

  /* ── Render ── */
  return (
    <div className="w-full bg-white">
      <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-100 min-h-[520px]">

        {/* ══════════════════════════════
            LEFT — Employee Details
        ══════════════════════════════ */}
        <div className="p-8">

          {/* Name + status */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-xl font-bold text-gray-900 leading-tight">
                {employee.name}
              </h1>
              <StatusBadge status={employee.status} />
            </div>
            <p className="text-sm text-gray-500">
              {employee.designation || employee.position || "—"}
            </p>
          </div>

          {/* Detail rows */}
          <div>
            <DetailRow icon={User}      label="Full Name"    value={employee.name} />
            <DetailRow icon={BadgeCheck} label="Employee ID" value={employee.employee_id} />
            <DetailRow icon={Briefcase} label="Designation"  value={employee.designation || employee.position} />
            <DetailRow icon={Building2} label="Department"   value={employee.department} />
            <DetailRow icon={MapPin}    label="Location"     value={employee.location || employee.address} />
            <DetailRow icon={Mail}      label="Email"        value={employee.email} />
            <DetailRow icon={Phone}     label="Phone"        value={employee.phone || employee.contact_number} />
            <DetailRow icon={Calendar}  label="Joined"       value={joinedDate} />
          </div>
        </div>

        {/* ══════════════════════════════
            RIGHT — Photo + QR Code
        ══════════════════════════════ */}
        <div className="p-8 flex flex-col items-center justify-start gap-8">

          {/* Employee photo */}
          <div className="flex flex-col items-center gap-3">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider self-start">
              Photo
            </p>
            <div className="w-36 h-36 rounded-2xl overflow-hidden bg-gray-100 border border-gray-200 flex items-center justify-center">
              {photoSrc ? (
                <img
                  src={photoSrc}
                  alt={employee.name}
                  className="w-full h-full object-cover"
                  onError={(e) => { e.target.style.display = "none"; }}
                />
              ) : (
                <div className="flex flex-col items-center gap-2 text-gray-300">
                  <User size={40} />
                  <span className="text-xs">No photo</span>
                </div>
              )}
            </div>
            <p className="text-sm font-semibold text-gray-700">{employee.name}</p>
            <p className="text-xs text-gray-400">
              {employee.designation || employee.position || "—"}
            </p>
          </div>

          {/* Divider */}
          <div className="w-full border-t border-gray-100" />

          {/* QR Code */}
          <div className="flex flex-col items-center gap-3 w-full">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider self-start">
              QR Code
            </p>

            {qrSrc ? (
              <>
                <div className="w-36 h-36 rounded-xl overflow-hidden bg-white border border-gray-200 p-2 flex items-center justify-center">
                  <img
                    src={qrSrc}
                    alt="QR Code"
                    className="w-full h-full object-contain"
                    onError={(e) => { e.target.style.display = "none"; }}
                  />
                </div>
                <p className="text-xs text-gray-400">Scan to verify identity</p>
                <button
                  onClick={handleDownloadQR}
                  className="mt-1 flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-700 transition-colors"
                >
                  <Download size={14} />
                  Download QR
                </button>
              </>
            ) : (
              <div className="w-36 h-36 rounded-xl bg-gray-50 border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-2 text-gray-300">
                <span className="text-3xl leading-none">⬜</span>
                <p className="text-xs text-center px-3">QR not generated</p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default EmployeeCardView;
