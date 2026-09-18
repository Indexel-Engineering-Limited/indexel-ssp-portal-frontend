import { useEffect, useRef, useState } from "react";
import {
    Search,
    RefreshCw,
    Upload,
    UserRound,
    CheckCircle,
    X,
} from "lucide-react";
import axios from "axios";

// Public axios instance — no Authorization header, no 401 redirect
const publicApi = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL ?? "https://ssp-indexel-co-in-564576.hostingersite.com",
    timeout: 15000,
});

async function fetchAllEmployees() {
    const res = await publicApi.get("/api/employees/");
    return res.data?.data ?? res.data;
}

async function uploadImage(employeeId, imageFile) {
    const formData = new FormData();
    formData.append("employee_image", imageFile);
    const res = await publicApi.put(
        `/api/employees/employee-image/${employeeId}`,
        formData
    );
    return res.data?.data ?? res.data;
}


// ── helpers ───────────────────────────────────────────────────────────────────
const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith("http://") || path.startsWith("https://")) return path;
    return `${import.meta.env.VITE_API_URL ?? "https://ssp-indexel-co-in-564576.hostingersite.com"}${path}`;
};

const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const MAX_SIZE_MB = 5;

// ── Upload Modal ──────────────────────────────────────────────────────────────
function ImageUploadModal({ employee, onClose, onSuccess }) {
    const inputRef = useRef(null);
    const [preview, setPreview] = useState(null);
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState(null);
    const [done, setDone] = useState(false);

    // Pre-fill with existing image
    useEffect(() => {
        if (employee.employee_image) {
            setPreview(getImageUrl(employee.employee_image));
        }
    }, [employee]);

    // ─────────────────────────────────────────────────────────────
// COMPRESS IMAGE
// ─────────────────────────────────────────────────────────────

async function compressImage(file) {
    const MAX_WIDTH = 1200;
    const MAX_HEIGHT = 1200;

    const MAX_OUTPUT_SIZE = 1024 * 1024; // 1 MB

    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (event) => {
            const img = new Image();

            img.onload = () => {
                let width = img.width;
                let height = img.height;

                // Resize while keeping aspect ratio
                if (width > MAX_WIDTH || height > MAX_HEIGHT) {
                    const widthRatio = MAX_WIDTH / width;
                    const heightRatio = MAX_HEIGHT / height;

                    const ratio = Math.min(
                        widthRatio,
                        heightRatio
                    );

                    width = Math.round(width * ratio);
                    height = Math.round(height * ratio);
                }

                const canvas = document.createElement("canvas");

                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext("2d");

                ctx.drawImage(
                    img,
                    0,
                    0,
                    width,
                    height
                );

                // Start with high quality
                let quality = 0.85;

                const convert = () => {
                    canvas.toBlob(
                        (blob) => {
                            if (!blob) {
                                reject(
                                    new Error(
                                        "Failed to compress image"
                                    )
                                );
                                return;
                            }

                            // If still larger than 1 MB,
                            // reduce quality
                            if (
                                blob.size > MAX_OUTPUT_SIZE &&
                                quality > 0.4
                            ) {
                                quality -= 0.1;
                                convert();
                                return;
                            }

                            const compressedFile =
                                new File(
                                    [blob],
                                    file.name.replace(
                                        /\.[^/.]+$/,
                                        ".jpg"
                                    ),
                                    {
                                        type: "image/jpeg",
                                        lastModified:
                                            Date.now(),
                                    }
                                );

                            resolve(compressedFile);
                        },
                        "image/jpeg",
                        quality
                    );
                };

                convert();
            };

            img.onerror = () => {
                reject(
                    new Error(
                        "Unable to read image"
                    )
                );
            };

            img.src = event.target.result;
        };

        reader.onerror = () => {
            reject(
                new Error(
                    "Unable to read selected file"
                )
            );
        };

        reader.readAsDataURL(file);
    });
}
 async function handleFile(selected) {
    setError(null);

    if (!selected) return;

    // Check file type
    if (!ALLOWED_TYPES.includes(selected.type)) {
        setError(
            "Only JPG, PNG and WEBP images are allowed."
        );
        return;
    }

    try {
        setError(null);

        // Compress image
        const compressedFile =
            await compressImage(selected);

        console.log(
            "Original size:",
            (selected.size / 1024 / 1024).toFixed(2),
            "MB"
        );

        console.log(
            "Compressed size:",
            (compressedFile.size / 1024 / 1024).toFixed(2),
            "MB"
        );

        // Final safety check
        if (
            compressedFile.size >
            MAX_OUTPUT_SIZE
        ) {
            setError(
                "Unable to compress image below 1 MB. Please choose another image."
            );
            return;
        }

        setFile(compressedFile);

        // Preview compressed image
        setPreview(
            URL.createObjectURL(compressedFile)
        );

        setDone(false);

    } catch (error) {
        console.error(
            "Image compression error:",
            error
        );

        setError(
            "Failed to process image. Please try another image."
        );
    }
}

    function handleFile(selected) {
        setError(null);
        if (!selected) return;

        if (!ALLOWED_TYPES.includes(selected.type)) {
            setError("Only JPG, PNG and WEBP images are allowed.");
            return;
        }
        if (selected.size > MAX_SIZE_MB * 1024 * 1024) {
            setError(`Image must be smaller than ${MAX_SIZE_MB} MB.`);
            return;
        }

        setFile(selected);
        setPreview(URL.createObjectURL(selected));
        setDone(false);
    }

    function handleDrop(e) {
        e.preventDefault();
        const dropped = e.dataTransfer.files?.[0];
        if (dropped) handleFile(dropped);
    }

    async function handleUpload() {
        if (!file) { setError("Please select an image first."); return; }
        try {
            setUploading(true);
            setError(null);
            const result = await uploadImage(employee.employee_id, file);
            setDone(true);
            onSuccess(result);
        } catch (err) {
            setError(err.message || "Upload failed. Please try again.");
        } finally {
            setUploading(false);
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div
                className="bg-white rounded-2xl w-full max-w-md overflow-hidden"
                style={{ border: "1px solid #e2e9f4", boxShadow: "0 8px 40px rgba(45,85,160,0.15)" }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div
                    className="flex items-center justify-between px-5 py-4"
                    style={{ borderBottom: "1px solid #e2e9f4" }}
                >
                    <div className="flex items-center gap-3 min-w-0">
                        {employee.employee_image && !file ? (
                            <img
                                src={getImageUrl(employee.employee_image)}
                                alt={employee.name}
                                className="w-9 h-9 rounded-lg object-cover border"
                                style={{ borderColor: "#e2e9f4" }}
                            />
                        ) : (
                            <div
                                className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                                style={{ background: "#eef2fb" }}
                            >
                                <UserRound size={18} style={{ color: "#2d55a0" }} />
                            </div>
                        )}
                        <div className="min-w-0">
                            <p className="text-[13.5px] font-semibold truncate" style={{ color: "#111827" }}>
                                {employee.name}
                            </p>
                            <p className="text-[11px] font-mono" style={{ color: "#6b7280" }}>
                                {employee.employee_id}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        disabled={uploading}
                        className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100 transition disabled:opacity-50"
                    >
                        <X size={18} style={{ color: "#6b7280" }} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-5 space-y-4">

                    {/* Drop zone */}
                    <div
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={handleDrop}
                        onClick={() => !uploading && inputRef.current?.click()}
                        className="relative rounded-xl overflow-hidden cursor-pointer transition-all"
                        style={{
                            border: "2px dashed #c5d3e4",
                            background: "#f8fafd",
                            height: 220,
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#2d55a0")}
                        onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#c5d3e4")}
                    >
                        {preview ? (
                            <>
                                <img
                                    src={preview}
                                    alt="Preview"
                                    className="w-full h-full object-cover"
                                />
                                {/* Overlay on hover */}
                                <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                                    <Upload size={24} className="text-white" />
                                    <p className="text-[12px] text-white font-medium">
                                        Click to change photo
                                    </p>
                                </div>
                            </>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full gap-3">
                                <div
                                    className="w-14 h-14 rounded-2xl flex items-center justify-center"
                                    style={{ background: "#eef2fb" }}
                                >
                                    <Upload size={26} style={{ color: "#2d55a0" }} />
                                </div>
                                <div className="text-center">
                                    <p className="text-[13px] font-semibold" style={{ color: "#111827" }}>
                                        Click or drag &amp; drop
                                    </p>
                                    <p className="text-[11.5px] mt-0.5" style={{ color: "#6b7280" }}>
                                        JPG, PNG or WEBP · Max {MAX_SIZE_MB} MB
                                    </p>
                                </div>
                            </div>
                        )}
                        <input
                            ref={inputRef}
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            className="hidden"
                            onChange={(e) => handleFile(e.target.files?.[0])}
                            disabled={uploading}
                        />
                    </div>

                    {/* Error */}
                    {error && (
                        <div
                            className="flex items-center gap-2 px-4 py-3 rounded-lg text-[12.5px]"
                            style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626" }}
                        >
                            <span className="material-symbols-outlined text-[16px]">error</span>
                            {error}
                        </div>
                    )}

                    {/* Success */}
                    {done && (
                        <div
                            className="flex items-center gap-2 px-4 py-3 rounded-lg text-[12.5px]"
                            style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", color: "#15803d" }}
                        >
                            <CheckCircle size={16} />
                            Image uploaded successfully!
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-1">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={uploading}
                            className="flex-1 py-2.5 rounded-lg text-[13px] font-medium transition disabled:opacity-50"
                            style={{ border: "1px solid #e2e9f4", color: "#374151" }}
                        >
                            {done ? "Close" : "Cancel"}
                        </button>
                        <button
                            type="button"
                            onClick={handleUpload}
                            disabled={uploading || !file || done}
                            className="flex-1 py-2.5 rounded-lg text-[13px] font-semibold text-white transition disabled:opacity-60 flex items-center justify-center gap-2"
                            style={{ background: "#2d55a0" }}
                        >
                            {uploading ? (
                                <>
                                    <span
                                        className="material-symbols-outlined text-[17px]"
                                        style={{ animation: "spin .7s linear infinite" }}
                                    >
                                        progress_activity
                                    </span>
                                    Uploading…
                                </>
                            ) : (
                                <>
                                    <Upload size={16} />
                                    Upload Image
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
    );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function EmployeeImageUpload() {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [selected, setSelected] = useState(null);    // employee to upload image for
    const [message, setMessage] = useState(null);       // { type, text }

    async function loadEmployees() {
        setLoading(true);
        try {
            const data = await fetchAllEmployees();
            setEmployees(Array.isArray(data) ? data : []);
        } catch (err) {
            setMessage({ type: "error", text: err.message || "Failed to load employees." });
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => { loadEmployees(); }, []);

    // After successful upload — update local state so avatar refreshes immediately
    function handleUploadSuccess(updatedEmployee) {
        if (updatedEmployee?.employee_image) {
            setEmployees((prev) =>
                prev.map((emp) =>
                    emp.employee_id === selected.employee_id
                        ? { ...emp, employee_image: updatedEmployee.employee_image }
                        : emp
                )
            );
        }
        setMessage({
            type: "success",
            text: `Image uploaded for ${selected.name}`,
        });
        setSelected(null);
    }

    const filtered = employees.filter((emp) => {
        const q = search.trim().toLowerCase();
        if (!q) return true;
        return (
            emp.name?.toLowerCase().includes(q) ||
            emp.employee_id?.toLowerCase().includes(q) ||
            emp.department?.toLowerCase().includes(q) ||
            emp.designation?.toLowerCase().includes(q)
        );
    });

    return (
        <div style={{ fontFamily: "'Inter','Hanken Grotesk',sans-serif" }}>

            {/* Page heading */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-5 gap-4">
                <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-2.5">
                        <h1
                            className="font-semibold text-[20px]"
                            style={{ color: "#111827", fontFamily: "'Hanken Grotesk', sans-serif" }}
                        >
                            Employee Images
                        </h1>
                        <span
                            className="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-[11px] font-medium"
                            style={{ background: "#dbe5f8", color: "#374151", border: "1px solid rgba(197,211,228,0.3)" }}
                        >
                            {employees.length.toLocaleString()} Total
                        </span>
                    </div>
                    <p className="text-[12.5px]" style={{ color: "#374151" }}>
                        Select an employee to upload or replace their profile photo.
                    </p>
                </div>

                {/* Search + Refresh */}
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <Search
                            size={15}
                            className="absolute left-3 top-1/2 -translate-y-1/2"
                            style={{ color: "#9ca3af" }}
                        />
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search employees…"
                            className="pl-8 pr-3 py-2 rounded-lg text-[13px] outline-none transition w-56"
                            style={{
                                border: "1px solid #c5d3e4",
                                background: "#f8fafd",
                                color: "#111827",
                            }}
                        />
                    </div>
                    <button
                        onClick={loadEmployees}
                        disabled={loading}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-[12.5px] font-medium transition disabled:opacity-50"
                        style={{ border: "1px solid #e2e9f4", color: "#374151", background: "#f8fafd" }}
                    >
                        <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
                        Refresh
                    </button>
                </div>
            </div>

            {/* Message banner */}
            {message && (
                <div
                    className="mb-4 flex items-center justify-between gap-3 px-4 py-3 rounded-lg text-[13px]"
                    style={{
                        border: `1px solid ${message.type === "success" ? "#bbf7d0" : "#fecaca"}`,
                        background: message.type === "success" ? "#f0fdf4" : "#fef2f2",
                        color: message.type === "success" ? "#15803d" : "#dc2626",
                    }}
                >
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[16px]">
                            {message.type === "success" ? "check_circle" : "error"}
                        </span>
                        {message.text}
                    </div>
                    <button onClick={() => setMessage(null)}>
                        <X size={15} />
                    </button>
                </div>
            )}

            {/* Employee grid */}
            {loading ? (
                <div
                    className="rounded-xl py-16 flex flex-col items-center gap-2"
                    style={{ background: "#f8fafd", border: "1px solid rgba(197,211,228,0.2)" }}
                >
                    <span
                        className="material-symbols-outlined text-[28px]"
                        style={{ color: "#a6bcee", animation: "spin .9s linear infinite" }}
                    >
                        progress_activity
                    </span>
                    <span className="text-[13px]" style={{ color: "#374151" }}>
                        Loading employees…
                    </span>
                    <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
                </div>
            ) : filtered.length === 0 ? (
                <div
                    className="rounded-xl py-16 flex flex-col items-center gap-2"
                    style={{ background: "#f8fafd", border: "1px solid rgba(197,211,228,0.2)" }}
                >
                    <UserRound size={36} style={{ color: "#c5d3e4" }} />
                    <p className="text-[13px]" style={{ color: "#374151" }}>
                        {search ? "No employees match your search." : "No employees found."}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                    {filtered.map((emp) => (
                        <EmployeeCard
                            key={emp.id}
                            employee={emp}
                            onSelect={() => setSelected(emp)}
                        />
                    ))}
                </div>
            )}

            {/* Upload modal */}
            {selected && (
                <ImageUploadModal
                    employee={selected}
                    onClose={() => setSelected(null)}
                    onSuccess={handleUploadSuccess}
                />
            )}
        </div>
    );
}

// ── Employee card ─────────────────────────────────────────────────────────────
function EmployeeCard({ employee, onSelect }) {
    const [imgError, setImgError] = useState(false);
    const hasImage = Boolean(employee.employee_image) && !imgError;

    return (
        <button
            type="button"
            onClick={onSelect}
            className="text-left w-full rounded-xl p-4 transition-all group"
            style={{
                background: "#ffffff",
                border: "1px solid #e2e9f4",
                boxShadow: "0 2px 8px rgba(45,85,160,0.05)",
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "#2d55a0";
                e.currentTarget.style.boxShadow = "0 4px 16px rgba(45,85,160,0.12)";
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "#e2e9f4";
                e.currentTarget.style.boxShadow = "0 2px 8px rgba(45,85,160,0.05)";
            }}
        >
            <div className="flex items-center gap-3">
                {/* Avatar */}
                <div className="relative shrink-0">
                    {hasImage ? (
                        <img
                            src={getImageUrl(employee.employee_image)}
                            alt={employee.name}
                            onError={() => setImgError(true)}
                            className="w-12 h-12 rounded-xl object-cover"
                            style={{ border: "2px solid #e2e9f4" }}
                        />
                    ) : (
                        <div
                            className="w-12 h-12 rounded-xl flex items-center justify-center"
                            style={{ background: "#eef2fb", border: "2px solid #e2e9f4" }}
                        >
                            <UserRound size={22} style={{ color: "#2d55a0" }} />
                        </div>
                    )}
                    {/* Upload hint icon — visible on hover */}
                    <div
                        className="absolute inset-0 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        style={{ background: "rgba(45,85,160,0.7)" }}
                    >
                        <Upload size={16} className="text-white" />
                    </div>
                </div>

                {/* Info */}
                <div className="min-w-0 flex-1">
                    <p
                        className="text-[13px] font-semibold truncate"
                        style={{ color: "#111827" }}
                    >
                        {employee.name}
                    </p>
                    <p
                        className="text-[11px] font-mono mt-0.5"
                        style={{ color: "#2d55a0" }}
                    >
                        {employee.employee_id}
                    </p>
                    {(employee.designation || employee.department) && (
                        <p
                            className="text-[11px] truncate mt-0.5"
                            style={{ color: "#6b7280" }}
                        >
                            {employee.designation || employee.department}
                        </p>
                    )}
                </div>

                {/* Status dot */}
                <div
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{
                        background: hasImage ? "#16a34a" : "#d1d5db",
                        title: hasImage ? "Has image" : "No image",
                    }}
                    title={hasImage ? "Has image" : "No image"}
                />
            </div>

            {/* Bottom label */}
            <div
                className="mt-3 pt-3 flex items-center justify-between"
                style={{ borderTop: "1px solid #f0f4fa" }}
            >
                <span
                    className="text-[11px] font-medium"
                    style={{ color: hasImage ? "#15803d" : "#6b7280" }}
                >
                    {hasImage ? "✓ Image uploaded" : "No image yet"}
                </span>
                <span
                    className="text-[11px] font-semibold px-2 py-0.5 rounded-md"
                    style={{ background: "#eef2fb", color: "#2d55a0" }}
                >
                    Upload
                </span>
            </div>
        </button>
    );
}