import api from "./api";

// ─── Company endpoints ────────────────────────────────────────────────────

/**
 * GET /api/companies/
 * Returns all companies exactly as returned by the API.
 */
export async function getAllCompanies() {
  const res = await api.get("/api/companies/");
  return res.data?.data ?? res.data;
}

/**
 * POST /api/companies/
 * Creates a new company.
 */
/**
 * PUT /api/companies/:id
 * Updates an existing company.
 */
export async function updateCompany(id, company) {
  const payload = {
    company_name: company.company_name,
    industry: company.industry,
    city: company.city,
    state: company.state,
    country: company.country,
  };
  const res = await api.put(`/api/companies/${id}`, payload);
  return res.data?.data ?? res.data;
}

export async function createCompany(company) {
  const payload = {
    company_name: company.company_name,
    industry: company.industry,
    city:company.city,
    state:company.state,
    country:company.country,
  };

  const res = await api.post("/api/companies/", payload);

  return res.data?.data ?? res.data;
}

// ─── Contact endpoints ────────────────────────────────────────────────────

/**
 * GET /api/companies/all_contacts
 * Returns all contacts exactly as returned by the API.
 */
export async function getAllContacts() {
  const res = await api.get("/api/companies/all_contacts");

  return res.data?.data ?? res.data;
}

/**
 * GET /api/companies/emails
 * Returns all saved email-list records.
 */
export async function getEmailList() {
  const res = await api.get("/api/companies/emails");

  return res.data?.data ?? res.data;
}

/**
 * POST /api/companies/emails/bulk
 * Adds unique email addresses from an Excel upload.
 */
export async function createEmailsBulk(emails) {
  const res = await api.post("/api/companies/emails/bulk", { emails });

  return res.data?.data ?? res.data;
}

/**
 * GET /api/companies/:companyId/contacts
 * Returns contacts for a specific company.
 */
export async function getContactsByCompany(companyId) {
  const res = await api.get(`/api/companies/company/contacts/${companyId}`);

  return res.data?.data ?? res.data;
}

/**
 * POST /api/companies/:companyId/contacts
 * Creates a new contact.
 */
export async function createContact(companyId, contact) {
  const payload = {
    company_id: companyId,
    person_name: contact.person_name,
    contact_number: contact.contact_number,
    email: contact.email,
    designation: contact.designation,
    department: contact.department,
  };

  const res = await api.post(
    `/api/companies/create_company_contact`,
    payload
  );

  return res.data?.data ?? res.data;
}


export async function updateContact(contactId, contact) {
  const payload = {
    company_id: contact.company_id,
    person_name: contact.person_name,
    contact_number: contact.contact_number,
    email: contact.email,
    designation: contact.designation,
    department: contact.department,
  };

  const res = await api.put(
    `/api/companies/contact/${contactId}`,
    payload
  );

  return res.data?.data ?? res.data;
}

export async function deleteContact(contactId) {
  const res = await api.delete(
    `/api/companies/contact/${contactId}`
  );

  return res.data?.data ?? res.data;
}

export async function restoreContact(contactId) {
  const res = await api.put(
    `/api/companies/contact/restore/${contactId}`
  );

  return res.data?.data ?? res.data;
}

export async function deleteEmail(emailID) {
  const res = await api.delete(
    `/api/companies/email/${emailID}`
  );

  return res.data?.data ?? res.data;
}
/**
 * Creates multiple companies, one request per row.
 */
export async function createCompaniesBulk(companies) {
  const created = [];
  const errors = [];

  for (let i = 0; i < companies.length; i++) {
    try {
      const result = await createCompany(companies[i]);
      created.push(result);
    } catch (err) {
      errors.push({
        row: i + 1,
        company: companies[i],
        message: err.message,
      });
    }
  }

  return { created, errors };
}

/**
 * Creates multiple contacts for a company, one request per row.
 */
export async function createContactsBulk(companyId, contacts) {
  const results = [];
  const errors = [];

  for (let i = 0; i < contacts.length; i++) {
    try {
      const created = await createContact(companyId, contacts[i]);
      results.push(created);
    } catch (err) {
      errors.push({
        row: i + 1,
        contact: contacts[i],
        message: err.message,
      });
    }
  }

  return { created: results, errors };
}

/**
 * Creates contacts where each row includes its own company_id.
 */
export async function createContactsBulkRows(contacts) {
  const created = [];
  const errors = [];

  for (let i = 0; i < contacts.length; i++) {
    const contact = contacts[i];
    try {
      const result = await createContact(contact.company_id, contact);
      created.push(result);
    } catch (err) {
      errors.push({
        row: i + 1,
        contact,
        message: err.message,
      });
    }
  }

  return { created, errors };
}
