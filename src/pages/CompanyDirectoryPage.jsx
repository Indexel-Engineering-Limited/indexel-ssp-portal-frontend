import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import CompanyDirectoryHeader from "../components/company/CompanyDirectoryHeader";
import CompanyTable from "../components/company/CompanyTable";
import AddCompanyModal from "../components/ui/AddCompanyModal";
import EditCompanyModal from "../components/ui/EditCompanyModal";
import { createCompany, getAllCompanies, updateCompany } from "../services/companyService";
import { normalizeCompany } from "../utils/mappers";
import { canWriteModule } from "../services/authService";

const DEFAULT_FILTERS = {
  city: "All",
  state: "All",
  search: "",
};

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

function exportToCSV(companies) {
  const headers = ["ID", "Company Name", "Industry", "Location", "Created At"];
  const rows = companies.map((c) => [
    c.company_id,
    c.company_name,
    c.industry,
    c.location,
    c.created_at ?? "",
  ]);
  const csv = [headers, ...rows]
    .map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "companies.csv";
  a.click();
  URL.revokeObjectURL(url);
}

export default function CompanyDirectoryPage() {
  const canAdd = canWriteModule("company_list");
  const navigate = useNavigate();
  const [companies, setCompanies] = useState([]);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZE_OPTIONS[0]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editCompany, setEditCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  async function loadCompanies() {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllCompanies();
      const list = Array.isArray(data) ? data : [];
      setCompanies(list.map(normalizeCompany).filter(Boolean));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCompanies();
  }, []);

  function handleFiltersChange(newFilters) {
    setFilters(newFilters);
    setPage(1);
  }

  function handlePageSizeChange(event) {
    setPageSize(Number(event.target.value));
    setPage(1);
  }

  const filtered = useMemo(() => {
    const result = companies.filter((c) => {
      if (filters.city !== "All" && c.city !== filters.city) return false;
      if (filters.state !== "All" && c.state !== filters.state) return false;
      if (
        filters.search &&
        !c.company_name.toLowerCase().includes(filters.search.trim().toLowerCase())
      ) return false;
      return true;
    });

    // Sort alphabetically by company_name or name
    result.sort((a, b) => {
      const nameA = (a.company_name || a.name || "").toLowerCase();
      const nameB = (b.company_name || b.name || "").toLowerCase();
      return nameA.localeCompare(nameB);
    });

    return result;
  }, [companies, filters]);

  const paginated = useMemo(
    () => filtered.slice((page - 1) * pageSize, page * pageSize),
    [filtered, page, pageSize]
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));

  async function handleEdit(companyId, payload) {
    const updated = await updateCompany(companyId, payload);
    const normalized = normalizeCompany(updated?.id ? updated : { ...payload, ...updated });
    if (normalized?.id) {
      setCompanies((prev) => prev.map((c) => c.company_id === companyId ? { ...c, ...normalized } : c));
    } else {
      await loadCompanies();
    }
    setEditCompany(null);
  }

  async function handleAdd(payload) {
    const created = await createCompany(payload);
    const company = normalizeCompany(created?.id ? created : { ...payload, ...created });
    if (company?.id) {
      setCompanies((prev) => [company, ...prev.filter((c) => c.id !== company.id)]);
    } else {
      await loadCompanies();
    }
    setPage(1);
  }

  return (
    <>
      <CompanyDirectoryHeader
        total={companies.length}
        onAddCompany={() => setShowAddModal(true)}
        onExportCSV={() => exportToCSV(filtered)}
        canAdd={canAdd}
        pageSize={pageSize}
        pageSizeOptions={PAGE_SIZE_OPTIONS}
        onPageSizeChange={handlePageSizeChange}
      />

      {error && (
        <div className="mb-4 flex items-center justify-between gap-3 rounded-lg border border-[#ffdad6] bg-[#ffdad6]/40 px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#ba1a1a] text-[18px]">error</span>
            <span className="text-[13px] text-[#ba1a1a]">{error}</span>
          </div>
          <button
            onClick={loadCompanies}
            className="text-[12px] font-medium text-[#111827] underline"
          >
            Retry
          </button>
        </div>
      )}

      {loading ? (
        <div className="bg-[#f8fafd] rounded-xl border border-[#c5d3e4]/20 py-16 flex flex-col items-center gap-2">
          <span className="material-symbols-outlined text-[#a6bcee] text-[28px] animate-spin">
            progress_activity
          </span>
          <span className="text-[13px] text-[#374151]">Loading companies...</span>
        </div>
      ) : (
        <CompanyTable
          companies={paginated}
          filters={filters}
          allCompanies={companies}
          onFiltersChange={handleFiltersChange}
          page={page}
          pageSize={pageSize}
          totalFiltered={filtered.length}
          totalPages={totalPages}
          onPageChange={setPage}
          onView={(company) => navigate(`/companies/${company.company_id}`, { state: { company } })}
          onEdit={(company) => setEditCompany(company)}
        />
      )}

      {editCompany && (
        <EditCompanyModal
          company={editCompany}
          onClose={() => setEditCompany(null)}
          onSave={handleEdit}
        />
      )}

      {canAdd && showAddModal && (
        <AddCompanyModal
          onClose={() => setShowAddModal(false)}
          onAdd={handleAdd}
        />
      )}
    </>
  );
}