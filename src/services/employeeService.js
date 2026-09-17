import api from "./api";

// ─── Employee endpoints ────────────────────────────────────────────────────

/**
 * GET /api/employees/
 * Returns all employees exactly as returned by the API.
 */
export async function getAllEmployees() {
  const res = await api.get("/api/employees/");
  return res.data?.data ?? res.data;
}

/**
 * GET /api/employees/:id
 * Returns one employee by database ID.
 */
export async function getEmployeeById(id) {
  const res = await api.get(`/api/employees/${id}`);
  return res.data?.data ?? res.data;
}

/**
 * GET /api/employees/employee-id/:employeeId
 * Returns one employee by employee ID.
 */
export async function getEmployeeByEmployeeId(employeeId) {
  const res = await api.get(
    `/api/employees/employee-id/${employeeId}`
  );

  return res.data?.data ?? res.data;
}

/**
 * POST /api/employees/
 * Creates a new employee.
 *
 * Uses FormData because employee_image is a file.
 */
export async function createEmployee(employee) {
  const formData = new FormData();

  formData.append("employee_id", employee.employee_id);
  formData.append("name", employee.name);

  formData.append("email", employee.email || "");
  formData.append(
    "contact_number",
    employee.contact_number || ""
  );
  formData.append(
    "department",
    employee.department || ""
  );
  formData.append(
    "designation",
    employee.designation || ""
  );
  formData.append(
    "location",
    employee.location || ""
  );
  formData.append(
    "blood_group",
    employee.blood_group || ""
  );
  formData.append("gender",       employee.gender        || "");
  formData.append("joining_date", employee.joining_date  || "");


  if (employee.employee_image) {
    formData.append(
      "employee_image",
      employee.employee_image
    );
  }

  const res = await api.post(
    "/api/employees/",
    formData
  );

  return res.data?.data ?? res.data;
}

/**
 * PUT /api/employees/:id
 * Updates an existing employee.
 *
 * Uses FormData because employee_image might be a file.
 */
export async function updateEmployee(id, employeeData) {
  const formData = new FormData();
  
  formData.append("employee_id", employeeData.employee_id);
  formData.append("name", employeeData.name);
  formData.append("email", employeeData.email || "");
  formData.append("contact_number", employeeData.contact_number || "");
  formData.append("designation", employeeData.designation || "");
  formData.append("department", employeeData.department || "");
  formData.append("location", employeeData.location || "");
  formData.append("blood_group", employeeData.blood_group || "");
  formData.append("status", employeeData.status || "active");
  formData.append("gender",       employeeData.gender       || "");
  formData.append("joining_date", employeeData.joining_date || "");
  
  // Only append image if a new file is provided
  if (employeeData.employee_image && employeeData.employee_image instanceof File) {
    formData.append("employee_image", employeeData.employee_image);
  }
  
  const res = await api.put(`/api/employees/${id}`, formData);
  return res.data?.data ?? res.data;
}

/**
 * DELETE /api/employees/:id
 * Deletes an employee.
 */
export async function deleteEmployee(id) {
  const res = await api.delete(`/api/employees/${id}`);
  return res.data?.data ?? res.data;
}
/**
 * POST /api/employees/bulk-upload
 * Bulk upload employees from Excel file
 */
export async function bulkUploadEmployees(file) {
  const formData = new FormData();
  formData.append("file", file);
  
  const res = await api.post("/api/employees/bulk-upload", formData);
  return res.data?.data ?? res.data;
}
/**
 * Creates multiple employees one request per row — mirrors createCompaniesBulk.
 */
export async function createEmployeesBulk(employees) {
  const created = [];
  const errors = [];

  for (let i = 0; i < employees.length; i++) {
    try {
      const result = await createEmployee(employees[i]);
      created.push(result);
    } catch (err) {
      errors.push({
        row: i + 1,
        employee: employees[i],
        message: err.message,
      });
    }
  }

  return { created, errors };
}
/**
 * POST /api/employees/employee-image/:employee_id
 * Upload or replace an employee's photo.
 */
export async function uploadEmployeeImage(employeeId, imageFile) {
  const formData = new FormData();
  formData.append("employee_image", imageFile);

  const res = await api.post(
    `/api/employees/employee-image/${employeeId}`,
    formData
  );
  return res.data?.data ?? res.data;
}