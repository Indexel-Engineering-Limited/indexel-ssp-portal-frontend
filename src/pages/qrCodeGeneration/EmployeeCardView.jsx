
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Download,
  FileText,
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

import {
  Document,
  Packer,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  ImageRun,
  AlignmentType,
  WidthType,
} from "docx";

import { saveAs } from "file-saver";

import { getEmployeeById } from "../../services/employeeService";

/* ─────────────────────────────────────────
   Helper: resolve image path → full URL
───────────────────────────────────────── */

const getImageUrl = (imagePath) => {
  if (!imagePath) return null;

  if (
    imagePath.startsWith("http://") ||
    imagePath.startsWith("https://")
  ) {
    return imagePath;
  }

  const baseURL =
    import.meta.env.VITE_API_URL ||
    "https://ssp-indexel-co-in-564576.hostingersite.com";

  /*
    Handles:
    /uploads/photo.jpg
    uploads/photo.jpg
    /employee/photo.jpg
  */

  if (baseURL.endsWith("/") && imagePath.startsWith("/")) {
    return `${baseURL}${imagePath.substring(1)}`;
  }

  if (!baseURL.endsWith("/") && !imagePath.startsWith("/")) {
    return `${baseURL}/${imagePath}`;
  }

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

        <p className="text-sm text-gray-800 font-medium break-words leading-snug">
          {value}
        </p>
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
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          isActive ? "bg-green-500" : "bg-gray-400"
        }`}
      />

      {isActive ? "Active" : "Inactive"}
    </span>
  );
};

/* ─────────────────────────────────────────
   Helper: safely download image
───────────────────────────────────────── */

const downloadImageBlob = async (url) => {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Unable to download image: ${response.status}`);
  }

  return await response.blob();
};

/* ─────────────────────────────────────────
   Helper: blob → Uint8Array
───────────────────────────────────────── */

const blobToUint8Array = async (blob) => {
  const buffer = await blob.arrayBuffer();

  return new Uint8Array(buffer);
};

/* ─────────────────────────────────────────
   Helper: get image dimensions
───────────────────────────────────────── */

const getImageDimensions = (blob) => {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(blob);

    const img = new Image();

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      resolve({
        width: img.naturalWidth,
        height: img.naturalHeight,
      });
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);

      reject(new Error("Invalid image"));
    };

    img.src = objectUrl;
  });
};

/* ─────────────────────────────────────────
   Helper: create DOCX ImageRun
───────────────────────────────────────── */

const makeImageRun = async (
  blob,
  maxWidth = 220,
  maxHeight = 220
) => {
  const data = await blobToUint8Array(blob);

  const { width, height } = await getImageDimensions(blob);

  const scale = Math.min(
    maxWidth / width,
    maxHeight / height,
    1
  );

  return new ImageRun({
    data,

    transformation: {
      width: Math.round(width * scale),
      height: Math.round(height * scale),
    },
  });
};

/* ─────────────────────────────────────────
   Helper: DOCX table cell
───────────────────────────────────────── */

const createDocCell = (text, bold = false) => {
  return new TableCell({
    width: {
      size: 50,
      type: WidthType.PERCENTAGE,
    },

    children: [
      new Paragraph({
        children: [
          new TextRun({
            text: String(text || "—"),
            bold,
            size: 21,
          }),
        ],
      }),
    ],
  });
};

/* ─────────────────────────────────────────
   Main component
───────────────────────────────────────── */

const EmployeeCardView = () => {
  const { id } = useParams();

  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [exporting, setExporting] = useState(false);

  /* ─────────────────────────────────────────
     Load employee
  ───────────────────────────────────────── */

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

      setError(
        err.message || "Failed to load employee details"
      );
    } finally {
      setLoading(false);
    }
  };

  /* ─────────────────────────────────────────
     Download QR
  ───────────────────────────────────────── */

  const handleDownloadQR = () => {
    const url = getImageUrl(employee?.qr_image);

    if (!url) return;

    const link = document.createElement("a");

    link.href = url;

    link.download = `${
      employee.employee_id || "employee"
    }-qr.png`;

    link.target = "_blank";

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);
  };

  /* ─────────────────────────────────────────
     Export Employee → DOCX
  ───────────────────────────────────────── */

  const handleExportEmployeeDoc = async () => {
    if (!employee) return;

    try {
      setExporting(true);

      const employeeName =
        employee.name || "Employee";

      /*
        Remove characters that are not allowed
        in Windows filenames.
      */

      const safeFileName =
        employeeName
          .replace(/[<>:"/\\|?*\x00-\x1F]/g, "")
          .trim() || "Employee";

      /* ─────────────────────────────────────
         Resolve image URLs
      ───────────────────────────────────── */

      const photoUrl = getImageUrl(
        employee.employee_image
      );

      const qrUrl = getImageUrl(
        employee.qr_image
      );

      let photoRun = null;
      let qrRun = null;

      /* ─────────────────────────────────────
         Download employee photo
      ───────────────────────────────────── */

      if (photoUrl) {
        try {
          const photoBlob =
            await downloadImageBlob(photoUrl);

          photoRun = await makeImageRun(
            photoBlob,
            220,
            220
          );
        } catch (photoError) {
          console.warn(
            "Employee photo could not be added:",
            photoError
          );
        }
      }

      /* ─────────────────────────────────────
         Download QR image
      ───────────────────────────────────── */

      if (qrUrl) {
        try {
          const qrBlob =
            await downloadImageBlob(qrUrl);

          qrRun = await makeImageRun(
            qrBlob,
            220,
            220
          );
        } catch (qrError) {
          console.warn(
            "QR image could not be added:",
            qrError
          );
        }
      }

      /* ─────────────────────────────────────
         Joining date
      ───────────────────────────────────── */

      const joiningDate =
        employee.joining_date ||
        employee.created_at;

      const formattedJoiningDate = joiningDate
        ? new Date(
            joiningDate
          ).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })
        : "—";

      /* ─────────────────────────────────────
         Employee details table
      ───────────────────────────────────── */

      const detailsTable = new Table({
        width: {
          size: 100,
          type: WidthType.PERCENTAGE,
        },

        rows: [
          new TableRow({
            children: [
              createDocCell("Field", true),
              createDocCell("Details", true),
            ],
          }),

          new TableRow({
            children: [
              createDocCell("Full Name"),
              createDocCell(employee.name),
            ],
          }),

          new TableRow({
            children: [
              createDocCell("Employee ID"),
              createDocCell(employee.employee_id),
            ],
          }),

          new TableRow({
            children: [
              createDocCell("Designation"),
              createDocCell(
                employee.designation ||
                  employee.position
              ),
            ],
          }),

          new TableRow({
            children: [
              createDocCell("Department"),
              createDocCell(employee.department),
            ],
          }),

          

          new TableRow({
            children: [
              createDocCell("Email"),
              createDocCell(employee.email),
            ],
          }),

          new TableRow({
            children: [
              createDocCell("Phone"),
              createDocCell(
                employee.phone ||
                  employee.contact_number
              ),
            ],
          }),


          
        ],
      });

      /* ─────────────────────────────────────
         Image table
      ───────────────────────────────────── */

      const imageTable = new Table({
        width: {
          size: 100,
          type: WidthType.PERCENTAGE,
        },

        rows: [
          new TableRow({
            children: [
              /* Employee photo */
              new TableCell({
                width: {
                  size: 50,
                  type: WidthType.PERCENTAGE,
                },

                children: [
                  new Paragraph({
                    alignment:
                      AlignmentType.CENTER,

                    children: [
                      new TextRun({
                        text: "Employee Photo",
                        bold: true,
                        size: 22,
                      }),
                    ],
                  }),

                  photoRun
                    ? new Paragraph({
                        alignment:
                          AlignmentType.CENTER,

                        children: [
                          photoRun,
                        ],
                      })
                    : new Paragraph({
                        alignment:
                          AlignmentType.CENTER,

                        children: [
                          new TextRun({
                            text:
                              "No employee photo available",
                            size: 20,
                          }),
                        ],
                      }),
                ],
              }),

              /* QR image */
              new TableCell({
                width: {
                  size: 50,
                  type: WidthType.PERCENTAGE,
                },

                children: [
                  new Paragraph({
                    alignment:
                      AlignmentType.CENTER,

                    children: [
                      new TextRun({
                        text: "QR Code",
                        bold: true,
                        size: 22,
                      }),
                    ],
                  }),

                  qrRun
                    ? new Paragraph({
                        alignment:
                          AlignmentType.CENTER,

                        children: [
                          qrRun,
                        ],
                      })
                    : new Paragraph({
                        alignment:
                          AlignmentType.CENTER,

                        children: [
                          new TextRun({
                            text:
                              "QR code not generated",
                            size: 20,
                          }),
                        ],
                      }),
                ],
              }),
            ],
          }),
        ],
      });

      /* ─────────────────────────────────────
         Create DOCX document
      ───────────────────────────────────── */

      const doc = new Document({
        sections: [
          {
            properties: {
              page: {
                margin: {
                  top: 720,
                  bottom: 720,
                  left: 720,
                  right: 720,
                },
              },
            },

            children: [
              /* Employee name */

              new Paragraph({
                alignment:
                  AlignmentType.CENTER,

                spacing: {
                  after: 100,
                },

                children: [
                  new TextRun({
                    text: employeeName,
                    bold: true,
                    size: 34,
                  }),
                ],
              }),

              /* Designation */

              new Paragraph({
                alignment:
                  AlignmentType.CENTER,

                spacing: {
                  after: 350,
                },

                children: [
                  new TextRun({
                    text:
                      employee.designation ||
                      employee.position ||
                      "Employee",

                    size: 22,
                  }),
                ],
              }),

              /* Heading */

              new Paragraph({
                spacing: {
                  after: 150,
                },

                children: [
                  new TextRun({
                    text: "Employee Details",
                    bold: true,
                    size: 25,
                  }),
                ],
              }),

              /* Details */

              detailsTable,

              /* Image heading */

              new Paragraph({
                spacing: {
                  before: 450,
                  after: 150,
                },

                children: [
                  new TextRun({
                    text: "Employee Images",
                    bold: true,
                    size: 25,
                  }),
                ],
              }),

              /* Images */

              imageTable,

              /* Footer */

              new Paragraph({
                alignment:
                  AlignmentType.CENTER,

                spacing: {
                  before: 400,
                },

                children: [
                  new TextRun({
                    text:
                      "Employee Identity Document",
                    italics: true,
                    size: 18,
                  }),
                ],
              }),
            ],
          },
        ],
      });

      /* ─────────────────────────────────────
         Generate DOCX blob
      ───────────────────────────────────── */

      const blob =
        await Packer.toBlob(doc);

      /* ─────────────────────────────────────
         Download
      ───────────────────────────────────── */

      saveAs(
        blob,
        `${safeFileName}.docx`
      );
    } catch (error) {
      console.error(
        "Failed to export employee document:",
        error
      );

      alert(
        "Failed to create employee document. Please try again."
      );
    } finally {
      setExporting(false);
    }
  };

  /* ─────────────────────────────────────────
     Loading
  ───────────────────────────────────────── */

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2
            size={32}
            className="animate-spin mx-auto text-blue-500 mb-2"
          />

          <p className="text-sm text-gray-500">
            Loading employee…
          </p>
        </div>
      </div>
    );
  }

  /* ─────────────────────────────────────────
     Error
  ───────────────────────────────────────── */

  if (error || !employee) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center max-w-xs">
          <AlertCircle
            size={36}
            className="mx-auto text-red-400 mb-2"
          />

          <h2 className="text-base font-semibold text-gray-800 mb-1">
            Employee not found
          </h2>

          <p className="text-sm text-gray-500">
            {error ||
              "Unable to load employee details"}
          </p>
        </div>
      </div>
    );
  }

  /* ─────────────────────────────────────────
     Resolve images
  ───────────────────────────────────────── */

  const photoSrc = getImageUrl(
    employee.employee_image
  );

  const qrSrc = getImageUrl(
    employee.qr_image
  );

  /* ─────────────────────────────────────────
     Joining date
  ───────────────────────────────────────── */

  const joiningDate =
    employee.joining_date ||
    employee.created_at;

  const joinedDate = joiningDate
    ? new Date(
        joiningDate
      ).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  /* ─────────────────────────────────────────
     Render
  ───────────────────────────────────────── */

  return (
    <div className="w-full bg-white">

      {/* ─────────────────────────────────────
          TOP ACTION BAR
      ───────────────────────────────────── */}

      <div className="flex items-center justify-end gap-3 px-8 py-4 border-b border-gray-100">

        {/* Export DOCX */}

        <button
          onClick={handleExportEmployeeDoc}
          disabled={exporting}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
        >
          {exporting ? (
            <>
              <Loader2
                size={15}
                className="animate-spin"
              />

              Creating DOCX...
            </>
          ) : (
            <>
              <FileText size={15} />

              Export DOCX
            </>
          )}
        </button>
      </div>

      {/* ─────────────────────────────────────
          MAIN CONTENT
      ───────────────────────────────────── */}

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

              <StatusBadge
                status={employee.status}
              />
            </div>

            <p className="text-sm text-gray-500">
              {employee.designation ||
                employee.position ||
                "—"}
            </p>
          </div>

          {/* Detail rows */}

          <div>

            <DetailRow
              icon={User}
              label="Full Name"
              value={employee.name}
            />

            <DetailRow
              icon={BadgeCheck}
              label="Employee ID"
              value={employee.employee_id}
            />

            <DetailRow
              icon={Briefcase}
              label="Designation"
              value={
                employee.designation ||
                employee.position
              }
            />

            <DetailRow
              icon={Building2}
              label="Department"
              value={employee.department}
            />

            <DetailRow
              icon={MapPin}
              label="Location"
              value={
                employee.location ||
                employee.address
              }
            />

            <DetailRow
              icon={Mail}
              label="Email"
              value={employee.email}
            />

            <DetailRow
              icon={Phone}
              label="Phone"
              value={
                employee.phone ||
                employee.contact_number
              }
            />

            <DetailRow
              icon={Calendar}
              label="Joined"
              value={joinedDate}
            />

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
                  onError={(e) => {
                    e.target.style.display =
                      "none";
                  }}
                />
              ) : (
                <div className="flex flex-col items-center gap-2 text-gray-300">

                  <User size={40} />

                  <span className="text-xs">
                    No photo
                  </span>

                </div>
              )}

            </div>

            <p className="text-sm font-semibold text-gray-700">
              {employee.name}
            </p>

            <p className="text-xs text-gray-400">
              {employee.designation ||
                employee.position ||
                "—"}
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
                    onError={(e) => {
                      e.target.style.display =
                        "none";
                    }}
                  />

                </div>

                <p className="text-xs text-gray-400">
                  Scan to verify identity
                </p>

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

                <span className="text-3xl leading-none">
                  ⬜
                </span>

                <p className="text-xs text-center px-3">
                  QR not generated
                </p>

              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
};

export default EmployeeCardView;

