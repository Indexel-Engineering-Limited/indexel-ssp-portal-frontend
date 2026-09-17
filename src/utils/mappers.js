export function normalizeCompany(raw) {
  if (!raw) return null;
  return {
    id: raw.id,
    company_id: raw.company_id,
    company_name: raw.company_name ?? raw.companyName ?? "",
    industry: raw.industry ?? "",
    location: raw.location ?? "",
    city: raw.city ?? "",
    state: raw.state ?? "",
    country: raw.country ?? "",
    created_at: raw.created_at ?? raw.createdAt ?? null,
  };
}

export function normalizeContact(raw) {
  if (!raw) return null;
  return {
    id: raw.id,
    company_name:raw.company_name,
    company_details_id: raw.company_details_id ?? raw.companyDetailsId ?? null,
    address: raw.location ?? "",
    person_name: raw.person_name ?? raw.personName ?? "",
    contact_number: raw.contact_number ?? raw.contactNumber ?? "",
    email: raw.email ?? "",
    designation: raw.designation ?? "",
    department: raw.department ?? "",
    created_at: raw.created_at ?? raw.createdAt ?? null,
  };
}

export function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
