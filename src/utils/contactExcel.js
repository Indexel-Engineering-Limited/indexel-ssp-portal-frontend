import * as XLSX from "xlsx";
import ExcelJS from "exceljs";

export const CONTACT_EXCEL_HEADERS = [
  "person_name",
  "designation",
  "email",
  "contact_number",
  "address",
];

export const COMPANY_EXCEL_HEADERS = [
  "company_name",
  "industry",
  "city",
  "state",
  "country",
];

export const CONTACT_DEPARTMENTS = [
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

export const BULK_CONTACT_EXCEL_HEADERS = [
  "company_id",
  "company_name",
  "person_name",
  "designation",
  "email",
  "contact_number",
  "department",
];

export const EMAIL_EXCEL_HEADERS = ["email_address", "type"];

const HEADER_ALIASES = {
  company_id: ["company_id", "company id", "company_details_id", "company details id"],
  company_name: ["company_name", "company name", "name"],
  industry: ["industry", "sector"],
  city: ["city"],
  state: ["state", "province"],
  country: ["country"],
  person_name: ["person_name", "personname", "person name", "contact_name", "contact name"],
  designation: ["designation", "title", "role", "job_title", "job title"],
  email: ["email", "email_address", "email address"],
  type: [
    "type",
    "email_type",
  ],
  contact_number: [
    "contact_number",
    "contact number",
    "phone",
    "phone_number",
    "phone number",
    "mobile",
  ],
  address: ["address", "office_address", "office address"],
  department: ["department", "dept"],
};

function normalizeHeader(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ");
}

function mapHeader(header, allowedFields) {
  const normalized = normalizeHeader(header);
  const fields = allowedFields ?? Object.keys(HEADER_ALIASES);
  for (const field of fields) {
    const aliases = HEADER_ALIASES[field] ?? [];
    if (aliases.some((alias) => normalizeHeader(alias) === normalized)) {
      return field;
    }
  }
  return null;
}

function readExcelRows(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const workbook = XLSX.read(event.target.result, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        if (!sheetName) {
          reject(new Error("The Excel file has no sheets."));
          return;
        }

        const rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], {
          defval: "",
          raw: false,
        });

        if (!rows.length) {
          reject(new Error("The Excel file has no data rows."));
          return;
        }

        resolve(rows);
      } catch {
        reject(new Error("Could not read the Excel file. Use the sample format."));
      }
    };

    reader.onerror = () => reject(new Error("Failed to read the selected file."));
    reader.readAsArrayBuffer(file);
  });
}

function mapRow(row, allowedFields) {
  const mapped = {};
  Object.entries(row).forEach(([header, value]) => {
    const field = mapHeader(header, allowedFields);
    if (field) mapped[field] = String(value ?? "").trim();
  });
  return mapped;
}

function downloadSheet(filename, sheetName, headers, sampleRows, colWidths) {
  const worksheet = XLSX.utils.aoa_to_sheet([headers, ...sampleRows]);
  worksheet["!cols"] = colWidths.map((wch) => ({ wch }));
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  XLSX.writeFile(workbook, filename);
}

export function downloadContactSampleExcel() {
  downloadSheet(
    "contact_persons_sample.xlsx",
    "Contacts",
    CONTACT_EXCEL_HEADERS,
    [
      ["John Smith", "Manager", "john@acme.com", "+44 123456789", "123 Industrial Road, London"],
      ["Sarah Wilson", "HR Manager", "sarah@acme.com", "+44 987654321", "123 Industrial Road, London"],
    ],
    [22, 18, 24, 18, 36]
  );
}

export function downloadCompanySampleExcel() {
  downloadSheet(
    "companies_sample.xlsx",
    "Companies",
    COMPANY_EXCEL_HEADERS,
    [
      ["Acme Corp Global", "Manufacturing", "London", "England", "United Kingdom"],
      ["Indexel Technologies", "Information Technology", "Pune", "Maharashtra", "India"],
    ],
    [28, 28, 18, 18, 20]
  );
}

export function downloadBulkContactSampleExcel() {
  downloadSheet(
    "bulk_contacts_sample.xlsx",
    "Contacts",
    BULK_CONTACT_EXCEL_HEADERS,
    [
      ["ACM001", "Acme Corp Global", "John Smith", "Manager", "john@acme.com", "+44 123456789", "Projects"],
      ["ACM001", "Acme Corp Global", "Sarah Wilson", "HR Manager", "sarah@acme.com", "+44 987654321", "Safety"],
      ["IND001", "Indexel Technologies", "Amit Patel", "Director", "amit@indexel.com", "+91 9876543210", "Management"],
    ],
    [14, 28, 22, 18, 24, 18, 22]
  );
}

export async function downloadEmailSampleExcel() {
  const workbook = new ExcelJS.Workbook();

  const worksheet = workbook.addWorksheet("Emails");

  // Add headers
  worksheet.columns = [
    {
      header: "email_address",
      key: "email_address",
      width: 38,
    },
    {
      header: "type",
      key: "type",
      width: 18,
    },
  ];

  // Header styling
  const headerRow = worksheet.getRow(1);

  headerRow.eachCell((cell) => {
    cell.font = {
      bold: true,
    };

    cell.alignment = {
      vertical: "middle",
      horizontal: "center",
    };
  });

  headerRow.height = 25;

  // Sample data
  worksheet.addRow({
    email_address: "purchasing@ultratechcement.com",
    type: "principal",
  });

  worksheet.addRow({
    email_address: "customer@example.com",
    type: "customer",
  });

  worksheet.addRow({
    email_address: "vendor@example.com",
    type: "vendor",
  });

  // Add dropdown to Type column
  for (let row = 2; row <= 1000; row++) {
    worksheet.getCell(`B${row}`).dataValidation = {
      type: "list",
      allowBlank: false,
      formulae: ['"principal,customer,vendor"'],
      showErrorMessage: true,
      errorTitle: "Invalid Type",
      error: "Please select principal, customer, or vendor.",
      showInputMessage: true,
      promptTitle: "Email Type",
      prompt: "Select principal, customer, or vendor.",
    };
  }

  // Email column validation
  for (let row = 2; row <= 1000; row++) {
    worksheet.getCell(`A${row}`).dataValidation = {
      type: "custom",
      allowBlank: false,
      formulae: [
        `=AND(ISNUMBER(SEARCH("@",A${row})),ISNUMBER(SEARCH(".",A${row})))`,
      ],
      showErrorMessage: true,
      errorTitle: "Invalid Email",
      error: "Please enter a valid email address.",
    };
  }

  // Freeze header row
  worksheet.views = [
    {
      state: "frozen",
      ySplit: 1,
    },
  ];

  // Download
  const buffer = await workbook.xlsx.writeBuffer();

  const blob = new Blob(
    [buffer],
    {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    }
  );

  const url = window.URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = "email_list_sample.xlsx";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  window.URL.revokeObjectURL(url);
}

export async function parseContactsExcel(file) {
  const rows = await readExcelRows(file);
  const contacts = [];
  const errors = [];
  const fields = ["person_name", "designation", "email", "contact_number", "address"];

  rows.forEach((row, index) => {
    const mapped = mapRow(row, fields);
    if (!mapped.person_name) {
      errors.push(`Row ${index + 2}: person_name is required`);
      return;
    }
    if (!mapped.email && !mapped.contact_number) {
      errors.push(`Row ${index + 2}: email or contact_number is required`);
      return;
    }

    contacts.push({
      person_name: mapped.person_name,
      designation: mapped.designation ?? "",
      email: mapped.email ?? "",
      contact_number: mapped.contact_number ?? "",
      address: mapped.address ?? "",
    });
  });

  return { contacts, errors };
}

export async function parseCompaniesExcel(file) {
  const rows = await readExcelRows(file);
  const companies = [];
  const errors = [];
  const fields = ["company_name", "industry", "city", "state", "country"];

  rows.forEach((row, index) => {
    const mapped = mapRow(row, fields);
    if (!mapped.company_name) {
      errors.push(`Row ${index + 2}: company_name is required`);
      return;
    }
    if (!mapped.industry) {
      errors.push(`Row ${index + 2}: industry is required`);
      return;
    }
    if (!mapped.city || !mapped.state || !mapped.country) {
      errors.push(`Row ${index + 2}: city, state, and country are required`);
      return;
    }

    companies.push({
      company_name: mapped.company_name,
      industry: mapped.industry,
      city: mapped.city,
      state: mapped.state,
      country: mapped.country,
    });
  });

  return { companies, errors };
}

export async function parseBulkContactsExcel(file, defaultDepartment = "") {
  const rows = await readExcelRows(file);
  const contacts = [];
  const errors = [];
  const fields = [
    "company_id",
    "company_name",
    "person_name",
    "designation",
    "email",
    "contact_number",
    "department",
  ];

  rows.forEach((row, index) => {
    const mapped = mapRow(row, fields);
    const companyId = mapped.company_id?.trim().toUpperCase();

    if (!/^[A-Z]{3}\d{3}$/.test(companyId)) {
      errors.push(`Row ${index + 2}: company_id is required and must use the format ULT001`);
      return;
    }
    if (!mapped.company_name) {
      errors.push(`Row ${index + 2}: company_name is required`);
      return;
    }
    if (!mapped.person_name) {
      errors.push(`Row ${index + 2}: person_name is required`);
      return;
    }
    if (!mapped.email && !mapped.contact_number) {
      errors.push(`Row ${index + 2}: email or contact_number is required`);
      return;
    }
    const department = mapped.department || defaultDepartment;

    contacts.push({
      company_id: companyId,
      company_name: mapped.company_name,
      person_name: mapped.person_name,
      designation: mapped.designation ?? "",
      email: mapped.email ?? "",
      contact_number: mapped.contact_number ?? "",
      department,
    });
  });

  return { contacts, errors };
}

export async function parseEmailsExcel(file) {
  const rows = await readExcelRows(file);
  const emails = [];
  const errors = [];

  const allowedTypes = [
    "principal",
    "customer",
    "vendor",
  ];

  rows.forEach((row, index) => {
    const mapped = mapRow(row, ["email", "type"]);

    const email = mapped.email?.trim().toLowerCase();

    const type = (
      mapped.type?.trim().toLowerCase() || "principal"
    );

    if (
      !email ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ) {
      errors.push(
        `Row ${index + 2}: a valid email is required`
      );
      return;
    }

    if (!allowedTypes.includes(type)) {
      errors.push(
        `Row ${index + 2}: type must be principle, customer, or vendor`
      );
      return;
    }

    emails.push({
      email,
      type,
    });
  });

  return { emails, errors };
}

// ─── Employee Excel Helpers ───────────────────────────────────────────────────

export const EMPLOYEE_EXCEL_HEADERS = [
  "employee_id",
  "name",
  "email",
  "contact_number",
  "designation",
  "department",
  "location",
  "gender",
  "joining_date",
  "blood_group",
  "status",
];

const EMPLOYEE_HEADER_ALIASES = {
  employee_id:    ["employee_id", "employee id", "emp_id", "empid", "id"],
  name:           ["name", "full name", "fullname", "employee_name", "employee name"],
  email:          ["email", "email_address", "email address"],
  contact_number: ["contact_number", "contact number", "phone", "phone_number", "mobile"],
  designation:    ["designation", "title", "role", "job title", "job_title"],
  department:     ["department", "dept"],
  location:       ["location", "city", "office"],
  gender:         ["gender", "sex"],
  joining_date:   ["joining_date", "joining date", "date of joining", "doj", "join_date"],
  blood_group:    ["blood_group", "blood group", "blood type", "bloodgroup"],
  status:         ["status"],
};

function normalizeEmpHeader(value) {
  return String(value ?? "").trim().toLowerCase().replace(/[_\-]+/g, " ").replace(/\s+/g, " ");
}

function mapEmployeeRow(row) {
  const mapped = {};
  Object.entries(row).forEach(([header, value]) => {
    const norm = normalizeEmpHeader(header);
    for (const [field, aliases] of Object.entries(EMPLOYEE_HEADER_ALIASES)) {
      if (aliases.some((a) => normalizeEmpHeader(a) === norm)) {
        mapped[field] = String(value ?? "").trim();
        break;
      }
    }
  });
  return mapped;
}

export function downloadEmployeeSampleExcel() {
  const headers = EMPLOYEE_EXCEL_HEADERS;
  const rows = [
    ["EMP001", "Rahul Sharma", "rahul@example.com", "9876543210", "Software Engineer", "Engineering", "Jaipur", "Male", "2024-01-15", "A+", "active"],
    ["EMP002", "Priya Verma", "priya@example.com", "9876543211", "HR Manager", "Human Resources", "Delhi", "Female", "2024-03-10", "B+", "active"],
  ];
  const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);
  worksheet["!cols"] = [14, 20, 26, 16, 22, 22, 16, 10, 14, 12, 10].map((wch) => ({ wch }));
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Employees");
  XLSX.writeFile(workbook, "employees_sample.xlsx");
}

export async function parseEmployeesExcel(file) {
  const rows = await readExcelRows(file);
  const employees = [];
  const errors = [];

  rows.forEach((row, index) => {
    const mapped = mapEmployeeRow(row);

    if (!mapped.employee_id) {
      errors.push(`Row ${index + 2}: employee_id is required`);
      return;
    }
    if (!mapped.name) {
      errors.push(`Row ${index + 2}: name is required`);
      return;
    }

    employees.push({
      employee_id:    mapped.employee_id,
      name:           mapped.name,
      email:          mapped.email          ?? "",
      contact_number: mapped.contact_number ?? "",
      designation:    mapped.designation    ?? "",
      department:     mapped.department     ?? "",
      location:       mapped.location       ?? "",
      gender:         mapped.gender         ?? "",
      joining_date:   mapped.joining_date   ?? "",
      blood_group:    mapped.blood_group    ?? "",
      status:         mapped.status         || "active",
    });
  });

  return { employees, errors };
}