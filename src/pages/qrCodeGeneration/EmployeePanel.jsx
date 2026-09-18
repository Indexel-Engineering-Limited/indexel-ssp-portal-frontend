import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    Plus,
    Search,
    X,
    Upload,
    UserRound,
    Eye, QrCode, Pencil, Trash2, FileUp,
    Loader2,
    RefreshCw,
} from "lucide-react";

import {
    getAllEmployees,
    createEmployee,
    updateEmployee,
    deleteEmployee,
} from "../../services/employeeService";
import EditEmployeeModal from "../../components/ui/EditEmployeeModal";
import BulkUploadEmployeeModal from "../../components/ui/BulkUploadEmployeeModal";


// ─────────────────────────────────────────────────────────────
// INITIAL FORM
// ─────────────────────────────────────────────────────────────

const initialForm = {
    employee_id: "",
    name: "",
    email: "",
    contact_number: "",
    department: "",
    designation: "",
    location: "",
    blood_group: "",
    employee_image: null,
    gender: "",
    joining_date: "",
};


const EmployeePanel = () => {

    const [employees, setEmployees] = useState([]);

    const [loading, setLoading] = useState(true);

    const [submitting, setSubmitting] = useState(false);

    const [showModal, setShowModal] = useState(false);

    const [editEmployee, setEditEmployee] = useState(null);

    const [showEditModal, setShowEditModal] = useState(false);

    const [deleteConfirm, setDeleteConfirm] = useState(null);

    const [showBulkModal, setShowBulkModal] = useState(false);

    const [search, setSearch] = useState("");

    const [form, setForm] = useState(initialForm);

    const [imagePreview, setImagePreview] = useState(null);

    const [createdEmployee, setCreatedEmployee] = useState(null);

    const navigate = useNavigate();

    const [message, setMessage] = useState({
        type: "",
        text: "",
    });


    // ─────────────────────────────────────────────────────────────
    // LOAD EMPLOYEES
    // ─────────────────────────────────────────────────────────────

    const loadEmployees = async () => {
        try {
            setLoading(true);

            const data = await getAllEmployees();

            setEmployees(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Failed to load employees:", error);

            setMessage({
                type: "error",
                text:
                    error?.response?.data?.message ||
                    "Failed to load employees.",
            });
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        loadEmployees();
    }, []);


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
            setMessage({
                type: "error",
                text: "Only JPG, PNG and WEBP images are allowed.",
            });

            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setMessage({
                type: "error",
                text: "Image size must be less than 5MB.",
            });

            return;
        }

        setForm((prev) => ({
            ...prev,
            employee_image: file,
        }));

        setImagePreview(URL.createObjectURL(file));
    };


    // ─────────────────────────────────────────────────────────────
    // OPEN MODAL
    // ─────────────────────────────────────────────────────────────

    const openModal = () => {
        setForm(initialForm);

        setImagePreview(null);

        setCreatedEmployee(null);

        setMessage({
            type: "",
            text: "",
        });

        setShowModal(true);
    };


    // ─────────────────────────────────────────────────────────────
    // CLOSE MODAL
    // ─────────────────────────────────────────────────────────────

    const closeModal = () => {
        if (submitting) return;

        setShowModal(false);

        setForm(initialForm);

        setImagePreview(null);

        setCreatedEmployee(null);

        setMessage({
            type: "",
            text: "",
        });
    };

    // ─────────────────────────────────────────────────────────────
    // OPEN EDIT MODAL
    // ─────────────────────────────────────────────────────────────

    const openEditModal = (employee) => {
        setEditEmployee(employee);
        setShowEditModal(true);

        setMessage({
            type: "",
            text: "",
        });
    };

    // ─────────────────────────────────────────────────────────────
    // CLOSE EDIT MODAL
    // ─────────────────────────────────────────────────────────────

    const closeEditModal = () => {
        if (submitting) return;

        setShowEditModal(false);
        setEditEmployee(null);
    };

    // ─────────────────────────────────────────────────────────────
    // UPDATE EMPLOYEE
    // ─────────────────────────────────────────────────────────────

    const handleUpdateEmployee = async (id, formData) => {
        try {
            setSubmitting(true);

            await updateEmployee(id, formData);

            await loadEmployees();

            setMessage({
                type: "success",
                text: "Employee updated successfully.",
            });

            setShowEditModal(false);
            setEditEmployee(null);
        } catch (error) {
            console.error("Update employee error:", error);

            throw new Error(
                error?.response?.data?.message ||
                "Failed to update employee."
            );
        } finally {
            setSubmitting(false);
        }
    };

    // ─────────────────────────────────────────────────────────────
    // BULK UPLOAD EMPLOYEES
    // ─────────────────────────────────────────────────────────────

    async function handleBulkUpload(file) {
        try {
            const response = await bulkUploadEmployees(file);

            // Refresh employee list
            await loadEmployees();

            setMessage({
                type: "success",
                text: response?.message || "Employees uploaded successfully!"
            });

            setShowBulkModal(false);

            return response;
        } catch (error) {
            console.error("Bulk upload error:", error);
            const errorMsg = error.message || "Failed to upload employees";
            setMessage({ type: "error", text: errorMsg });
            throw new Error(errorMsg);
        }
    }

    // ─────────────────────────────────────────────────────────────
    // CREATE EMPLOYEE
    // ─────────────────────────────────────────────────────────────

    const handleSubmit = async (e) => {
        e.preventDefault();

        setMessage({
            type: "",
            text: "",
        });

        if (!form.employee_id.trim()) {
            setMessage({
                type: "error",
                text: "Employee ID is required.",
            });

            return;
        }

        if (!form.name.trim()) {
            setMessage({
                type: "error",
                text: "Employee name is required.",
            });

            return;
        }

        try {
            setSubmitting(true);

            const employee = await createEmployee(form);

            setCreatedEmployee(employee);

            setMessage({
                type: "success",
                text: "Employee created successfully.",
            });

            await loadEmployees();
        } catch (error) {
            console.error("Create employee error:", error);

            setMessage({
                type: "error",
                text:
                    error?.response?.data?.message ||
                    "Failed to create employee.",
            });
        } finally {
            setSubmitting(false);
        }
    };


    // ─────────────────────────────────────────────────────────────
    // IMAGE URL
    // ─────────────────────────────────────────────────────────────

    const getImageUrl = (imagePath) => {
        if (!imagePath) return null;

        if (
            imagePath.startsWith("http://") ||
            imagePath.startsWith("https://")
        ) {
            return imagePath;
        }

        // If api.js has baseURL like http://localhost:5000
        const baseURL = import.meta.env.VITE_API_URL || "https://ssp-indexel-co-in-564576.hostingersite.com/api/images";

        return `${baseURL}${imagePath}`;
    };


    // ─────────────────────────────────────────────────────────────
    // FILTER
    // ─────────────────────────────────────────────────────────────

    const filteredEmployees = employees.filter((employee) => {
        const value = search.toLowerCase().trim();

        if (!value) return true;

        return (
            employee.employee_id
                ?.toLowerCase()
                .includes(value) ||
            employee.name
                ?.toLowerCase()
                .includes(value) ||
            employee.email
                ?.toLowerCase()
                .includes(value) ||
            employee.department
                ?.toLowerCase()
                .includes(value) ||
            employee.designation
                ?.toLowerCase()
                .includes(value) ||
            employee.location
                ?.toLowerCase()
                .includes(value)
        );
    });


    return (
        <div className="w-full min-h-screen bg-[#f8fafc] p-4">

            {/* ───────────────────────────────────────────────────── */}
            {/* HEADER */}
            {/* ───────────────────────────────────────────────────── */}

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">

                <div>
                    <h1 className="text-2xl font-bold text-[#111827]">
                        Employees
                    </h1>

                    <p className="text-sm text-gray-500 mt-1">
                        Manage employees and their QR codes
                    </p>
                </div>

                <div className="flex items-center gap-3">

                    {/* Total Employees Badge */}
                    <div className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-lg bg-[#eef3fb] border border-[#d4e0f0]">
                        <span className="text-[13px] font-medium text-[#374151]">
                            Total Employees
                        </span>

                        <span className="inline-flex items-center justify-center min-w-[28px] h-6 px-2 rounded-full bg-[#2d55a0] text-white text-[12px] font-semibold">
                            {employees.length}
                        </span>
                    </div>

                    {/* Add Employee */}
                    <button
                        type="button"
                        onClick={openModal}
                        className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#2d55a0] text-white text-sm font-semibold hover:opacity-[0.9] transition"
                    >
                        <Plus size={18} />
                        Add Employee
                    </button>

                </div>

            </div>


            {/* ───────────────────────────────────────────────────── */}
            {/* MESSAGE */}
            {/* ───────────────────────────────────────────────────── */}

            {message.text && !showModal && (
                <div
                    className={`mb-5 px-4 py-3 rounded-lg text-sm border ${message.type === "success"
                        ? "bg-green-50 text-green-700 border-green-200"
                        : "bg-red-50 text-red-700 border-red-200"
                        }`}
                >
                    {message.text}
                </div>
            )}


            {/* ───────────────────────────────────────────────────── */}
            {/* SEARCH */}
            {/* ───────────────────────────────────────────────────── */}

            <div className="bg-white border border-[#e5e7eb] rounded-xl p-4 mb-5">

                <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">

                    <div className="relative w-full sm:w-96">

                        <Search
                            size={17}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                        />

                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search employees..."
                            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        />

                    </div>


                    <button
                        type="button"
                        onClick={loadEmployees}
                        disabled={loading}
                        className="inline-flex items-center justify-center gap-2 px-3 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                    >
                        <RefreshCw
                            size={16}
                            className={loading ? "animate-spin" : ""}
                        />

                        Refresh
                    </button>

                </div>

            </div>


            {/* ───────────────────────────────────────────────────── */}
            {/* EMPLOYEE TABLE */}
            {/* ───────────────────────────────────────────────────── */}

            <div className="bg-white border border-[#e5e7eb] rounded-xl overflow-hidden">

                <div className="overflow-x-auto">

                    <table className="w-full">

                        <thead>
                            <tr className="bg-[#f8fafd] border-b border-[#e5e7eb]">

                                <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                                    Employee
                                </th>

                                <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                                    Employee ID
                                </th>

                                <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                                    Department
                                </th>

                                <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                                    Designation
                                </th>

                                <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                                    Location
                                </th>

                                <th className="px-5 py-3 text-center text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                                    QR Code
                                </th>

                                <th className="px-5 py-3 text-center text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                                    Actions
                                </th>

                                <th className="px-5 py-3 text-center text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                                    Status
                                </th>

                            </tr>
                        </thead>


                        <tbody>

                            {loading ? (

                                <tr>
                                    <td
                                        colSpan="8"
                                        className="py-14 text-center"
                                    >
                                        <Loader2
                                            size={26}
                                            className="animate-spin mx-auto text-blue-600"
                                        />

                                        <p className="text-sm text-gray-500 mt-2">
                                            Loading employees...
                                        </p>
                                    </td>
                                </tr>

                            ) : filteredEmployees.length === 0 ? (

                                <tr>
                                    <td
                                        colSpan="8"
                                        className="py-14 text-center"
                                    >

                                        <UserRound
                                            size={38}
                                            className="mx-auto text-gray-300"
                                        />

                                        <p className="text-sm font-medium text-gray-600 mt-3">
                                            No employees found
                                        </p>

                                        <button
                                            type="button"
                                            onClick={openModal}
                                            className="text-sm text-blue-600 font-medium mt-2 hover:underline"
                                        >
                                            Add your first employee
                                        </button>

                                    </td>
                                </tr>

                            ) : (

                                filteredEmployees.map((employee) => (

                                    <tr
                                        key={employee.id}
                                        className="border-b border-gray-100 hover:bg-gray-50 transition"
                                    >

                                        {/* Employee */}

                                        <td className="px-5 py-4">

                                            <div className="flex items-center gap-3">

                                                {employee.employee_image ? (

                                                    <img
                                                        src={getImageUrl(
                                                            employee.employee_image
                                                        )}
                                                        alt={employee.name}
                                                        className="w-10 h-10 rounded-full object-cover border border-gray-200"
                                                    />

                                                ) : (

                                                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                                                        <UserRound
                                                            size={18}
                                                            className="text-gray-400"
                                                        />
                                                    </div>

                                                )}

                                                <div>

                                                    <p className="text-sm font-semibold text-gray-800">
                                                        {employee.name}
                                                    </p>

                                                    <p className="text-xs text-gray-500">
                                                        {employee.email || "No email"}
                                                    </p>

                                                </div>

                                            </div>

                                        </td>


                                        {/* Employee ID */}

                                        <td className="px-5 py-4 text-sm font-medium text-gray-700">
                                            {employee.employee_id}
                                        </td>


                                        {/* Department */}

                                        <td className="px-5 py-4 text-sm text-gray-600">
                                            {employee.department || "-"}
                                        </td>


                                        {/* Designation */}

                                        <td className="px-5 py-4 text-sm text-gray-600">
                                            {employee.designation || "-"}
                                        </td>


                                        {/* Location */}

                                        <td className="px-5 py-4 text-sm text-gray-600">
                                            {employee.location || "-"}
                                        </td>


                                        {/* QR */}

                                        <td className="px-5 py-4 text-center">

                                            {employee.qr_image ? (

                                                <img
                                                    src={getImageUrl(
                                                        employee.qr_image
                                                    )}
                                                    alt="Employee QR"
                                                    className="w-12 h-12 mx-auto object-contain"
                                                />

                                            ) : (

                                                <QrCode
                                                    size={22}
                                                    className="mx-auto text-gray-300"
                                                />

                                            )}

                                        </td>


                                        {/* Actions */}

                                        <td className="px-5 py-4 text-center">

                                            <div className="flex items-center justify-center gap-1">

                                                <button
                                                    onClick={() => navigate(`/hr-management/card/${employee.id}`)}
                                                    className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition"
                                                    title="View ID Card"
                                                >
                                                    <Eye size={16} />
                                                </button>

                                                <button
                                                    onClick={() => openEditModal(employee)}
                                                    className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition"
                                                    title="Edit Employee"
                                                >
                                                    <Pencil size={16} />
                                                </button>

                                                {/* <button
                                                    onClick={() => setDeleteConfirm(employee)}
                                                    className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition"
                                                    title="Delete Employee"
                                                >
                                                    <Trash2 size={16} />
                                                </button> */}

                                            </div>

                                        </td>


                                        {/* Status */}

                                        <td className="px-5 py-4 text-center">

                                            <span
                                                className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${employee.status === "active"
                                                    ? "bg-green-50 text-green-700"
                                                    : "bg-gray-100 text-gray-500"
                                                    }`}
                                            >
                                                {employee.status || "active"}
                                            </span>

                                        </td>

                                    </tr>

                                ))
                            )}

                        </tbody>

                    </table>

                </div>

            </div>


            {/* ───────────────────────────────────────────────────── */}
            {/* ADD EMPLOYEE MODAL */}
            {/* ───────────────────────────────────────────────────── */}

            {showModal && (

                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">

                    <div className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[92vh] overflow-y-auto">

                        {/* Modal Header */}

                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">

                            <div>
                                <h2 className="text-lg font-bold text-gray-800">
                                    Add Employee
                                </h2>

                                <p className="text-xs text-gray-500 mt-1">
                                    Add employee information and generate QR code
                                </p>
                            </div>


                            <button
                                type="button"
                                onClick={closeModal}
                                disabled={submitting}
                                className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500 disabled:opacity-50"
                            >
                                <X size={20} />
                            </button>

                        </div>


                        {/* ─────────────────────────────────────────────── */}
                        {/* CREATED EMPLOYEE */}
                        {/* ─────────────────────────────────────────────── */}

                        {createdEmployee ? (

                            <div className="p-4">

                                <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">

                                    <p className="text-sm font-semibold text-green-700">
                                        Employee created successfully
                                    </p>

                                    <p className="text-xs text-green-600 mt-1">
                                        Employee ID:{" "}
                                        {createdEmployee.employee_id}
                                    </p>

                                </div>


                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                                    {/* Employee */}

                                    <div className="border border-gray-200 rounded-xl p-5">

                                        <h3 className="text-sm font-semibold text-gray-800 mb-4">
                                            Employee Details
                                        </h3>

                                        <div className="flex items-center gap-4">

                                            {createdEmployee.employee_image ? (

                                                <img
                                                    src={getImageUrl(
                                                        createdEmployee.employee_image
                                                    )}
                                                    alt={createdEmployee.name}
                                                    className="w-20 h-20 rounded-xl object-cover"
                                                />

                                            ) : (

                                                <div className="w-20 h-20 rounded-xl bg-gray-100 flex items-center justify-center">
                                                    <UserRound
                                                        size={28}
                                                        className="text-gray-400"
                                                    />
                                                </div>

                                            )}

                                            <div>

                                                <p className="font-bold text-gray-800">
                                                    {createdEmployee.name}
                                                </p>

                                                <p className="text-sm text-gray-500">
                                                    {createdEmployee.designation || "-"}
                                                </p>

                                                <p className="text-xs text-gray-400 mt-1">
                                                    {createdEmployee.department || "-"}
                                                </p>

                                            </div>

                                        </div>

                                    </div>


                                    {/* QR */}

                                    <div className="border border-gray-200 rounded-xl p-5 text-center">

                                        <h3 className="text-sm font-semibold text-gray-800 mb-3">
                                            Employee QR Code
                                        </h3>

                                        {createdEmployee.qr_image ? (

                                            <img
                                                src={getImageUrl(
                                                    createdEmployee.qr_image
                                                )}
                                                alt="Employee QR"
                                                className="w-44 h-44 object-contain mx-auto"
                                            />

                                        ) : (

                                            <div className="w-44 h-44 mx-auto flex items-center justify-center bg-gray-50 rounded-lg">
                                                <QrCode
                                                    size={45}
                                                    className="text-gray-300"
                                                />
                                            </div>

                                        )}

                                    </div>

                                </div>


                                <div className="flex justify-end mt-6">

                                    <button
                                        type="button"
                                        onClick={closeModal}
                                        className="px-5 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700"
                                    >
                                        Done
                                    </button>

                                </div>

                            </div>

                        ) : (

                            /* ───────────────────────────────────────────── */
                            /* FORM */
                            /* ───────────────────────────────────────────── */

                            <form
                                onSubmit={handleSubmit}
                                className="p-6"
                            >

                                {message.text && (

                                    <div
                                        className={`mb-5 px-4 py-3 rounded-lg text-sm border ${message.type === "success"
                                            ? "bg-green-50 text-green-700 border-green-200"
                                            : "bg-red-50 text-red-700 border-red-200"
                                            }`}
                                    >
                                        {message.text}
                                    </div>

                                )}


                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                                    {/* ───────────────────────────────────────── */}
                                    {/* IMAGE */}
                                    {/* ───────────────────────────────────────── */}

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
                                                className="hidden"
                                            />

                                        </label>

                                    </div>


                                    {/* ───────────────────────────────────────── */}
                                    {/* FIELDS */}
                                    {/* ───────────────────────────────────────── */}

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
                                                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
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
                                                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
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
                                                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
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
                                                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
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
                                                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
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
                                                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
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
                                                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
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
                                                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
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

                                        {/* Gender */}

                                        <div>
                                            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                                                Gender
                                            </label>

                                            <select
                                                name="gender"
                                                value={form.gender}
                                                onChange={handleChange}
                                                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                            >
                                                <option value="">Select gender</option>
                                                <option value="Male">Male</option>
                                                <option value="Female">Female</option>
                                                <option value="Other">Other</option>
                                            </select>
                                        </div>

                                        {/* Joining Date */}

                                        <div>
                                            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                                                Joining Date
                                            </label>

                                            <input
                                                type="date"
                                                name="joining_date"
                                                value={form.joining_date}
                                                onChange={handleChange}
                                                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                            />
                                        </div>


                                    </div>

                                </div>


                                {/* ───────────────────────────────────────────── */}
                                {/* FOOTER */}
                                {/* ───────────────────────────────────────────── */}

                                <div className="flex justify-end gap-3 mt-7 pt-5 border-t border-gray-100">

                                    <button
                                        type="button"
                                        onClick={closeModal}
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
                                            ? "Creating..."
                                            : "Create Employee"}

                                    </button>

                                </div>

                            </form>

                        )}

                    </div>

                </div>

            )}
            {showEditModal && editEmployee && (
                <EditEmployeeModal
                    employee={editEmployee}
                    onClose={closeEditModal}
                    onUpdate={handleUpdateEmployee}
                />
            )}
            {showBulkModal && (
                <BulkUploadEmployeeModal
                    onClose={() => {
                        setShowBulkModal(false);
                        loadEmployees();
                    }}
                    onUpload={handleBulkUpload}
                />
            )}

        </div>
    );
};

export default EmployeePanel;