
import { useMemo, useState } from "react";
import {
  Building2,
  Download,
  ExternalLink,
  Globe2,
  LoaderCircle,
  MapPin,
  Plus,
  RefreshCw,
  Search,
  SlidersHorizontal,
  Users,
  X,
} from "lucide-react";

import CompanyFormModal from "./CompanyFormModal.jsx";
import { useCompaniesQuery } from "./companies.queries.js";

const csvValue = (value) => {
  const text = String(value ?? "");
  const safe = /^[\s]*[=+\-@\t\r]/.test(text)
    ? `'${text}`
    : text;

  return `"${safe.replaceAll('"', '""')}"`;
};

const getInitials = (name) =>
  String(name || "C")
    .trim()
    .split(/\s+/)
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

const websiteUrl = (website) => {
  if (!website) return null;

  try {
    const url = new URL(
      /^https?:\/\//i.test(website)
        ? website
        : `https://${website}`
    );

    return ["http:", "https:"].includes(url.protocol)
      ? url.href
      : null;
  } catch {
    return null;
  }
};

function MetricCard({ label, value, subtitle, icon: Icon, tone = "blue" }) {
  return (
    <article
      className={`gco-metric gco-metric-${tone} relative flex min-h-[165px] flex-col overflow-hidden rounded-[22px] p-5`}
    >
      <div className="relative z-10 flex items-start justify-between gap-3">
        <div>
          <p className="gco-metric-label text-xs font-semibold">
            {label}
          </p>
          <h3 className="gco-metric-value mt-4 text-3xl font-extrabold tracking-tight">
            {value}
          </h3>
        </div>

        <span className="gco-metric-icon flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl">
          <Icon size={21} strokeWidth={1.8} />
        </span>
      </div>

      <p className="gco-metric-subtitle relative z-10 mt-auto pt-4 text-xs">
        {subtitle}
      </p>
    </article>
  );
}

export default function CompaniesPage() {
  const [companyModalOpen, setCompanyModalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [industry, setIndustry] = useState("");

  const params = useMemo(
    () => ({
      page: 1,
      limit: 100,
      sort: "createdAt",
      direction: "desc",
    }),
    []
  );

  const {
    data,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useCompaniesQuery(params);

  const companies = data?.data?.companies || [];

  const industries = useMemo(
    () =>
      [...new Set(companies.map((c) => c.industry).filter(Boolean))]
        .sort((a, b) => a.localeCompare(b)),
    [companies]
  );

  const filteredCompanies = useMemo(() => {
    const query = search.trim().toLowerCase();

    return companies.filter((company) => {
      const matchesSearch =
        !query ||
        [
          company.companyCode,
          company.name,
          company.industry,
          company.city,
          company.website,
          company.agencyRelationship,
          company.source,
          company.currentStage,
        ].some((value) =>
          String(value ?? "").toLowerCase().includes(query)
        );

      return matchesSearch && (!industry || company.industry === industry);
    });
  }, [companies, search, industry]);

  const totalContacts = companies.reduce(
    (sum, company) => sum + Number(company.contactsCount || 0),
    0
  );

  const activePipelineCompanies = companies.filter(
    (company) => Boolean(company.currentStage)
  ).length;

  const hasFilters = Boolean(search.trim()) || Boolean(industry);

  const exportCsv = () => {
    if (!filteredCompanies.length) return;

    const rows = [
      [
        "Company ID",
        "Company / brand",
        "Industry",
        "City",
        "Website",
        "Existing agency",
        "Source",
        "Stage",
        "Contacts",
      ],
      ...filteredCompanies.map((company) => [
        company.companyCode,
        company.name,
        company.industry,
        company.city,
        company.website,
        company.agencyRelationship,
        company.source,
        company.currentStage || "—",
        company.contactsCount,
      ]),
    ];

    const csv =
      "\uFEFF" +
      rows.map((row) => row.map(csvValue).join(",")).join("\r\n");

    const url = URL.createObjectURL(
      new Blob([csv], { type: "text/csv;charset=utf-8;" })
    );

    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "tempest-companies.csv";

    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();

    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const closeForm = () => {
    setCompanyModalOpen(false);
    refetch();
  };

  return (
    <div className="glass-companies min-w-0 space-y-6 p-4 sm:p-6 xl:p-8">
      <header className="flex flex-wrap items-start justify-between gap-5">
        <div>
          <div className="mb-3 flex items-center gap-2">
            <span className="gco-eyebrow-icon flex h-8 w-8 items-center justify-center rounded-xl">
              <Building2 size={16} />
            </span>
            <span className="gco-eyebrow text-[11px] font-bold uppercase tracking-[0.15em]">
              Relationship Management
            </span>
          </div>

          <h1 className="gco-heading text-2xl font-extrabold tracking-tight sm:text-3xl">
            Company Master
          </h1>
          <p className="gco-muted mt-2 max-w-2xl text-sm leading-6">
            Organize companies, industries, locations and their
            relationships with your sales pipeline.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={exportCsv}
            disabled={!filteredCompanies.length}
            className="gco-secondary inline-flex min-h-11 items-center gap-2 rounded-xl px-4 text-sm font-semibold disabled:opacity-40"
          >
            <Download size={16} />
            Export CSV
          </button>

          <button
            type="button"
            onClick={() => setCompanyModalOpen(true)}
            className="gco-primary inline-flex min-h-11 items-center gap-2 rounded-xl px-5 text-sm font-bold"
          >
            <Plus size={17} />
            Add Company
          </button>
        </div>
      </header>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Loaded Companies"
          value={companies.length}
          subtitle="Companies in the current API result"
          icon={Building2}
          tone="blue"
        />
        <MetricCard
          label="Industries"
          value={industries.length}
          subtitle="Unique industries represented"
          icon={Globe2}
          tone="violet"
        />
        <MetricCard
          label="Related Contacts"
          value={totalContacts}
          subtitle="Contacts linked to loaded companies"
          icon={Users}
          tone="green"
        />
        <MetricCard
          label="Companies with Leads"
          value={activePipelineCompanies}
          subtitle="Companies with a pipeline stage"
          icon={MapPin}
          tone="orange"
        />
      </section>

      <section className="gco-workspace overflow-hidden rounded-[24px]">
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-5 sm:px-6">
          <div className="flex items-center gap-3">
            <span className="gco-section-icon flex h-11 w-11 items-center justify-center rounded-2xl">
              <Building2 size={20} />
            </span>
            <div>
              <h2 className="gco-heading text-base font-bold">
                Companies Directory
              </h2>
              <p className="gco-muted mt-1 text-xs">
                {filteredCompanies.length} of {companies.length} loaded companies
              </p>
            </div>
          </div>

          <span className="gco-count rounded-full px-3 py-1.5 text-xs font-bold">
            {filteredCompanies.length} Companies
          </span>
        </div>

        <div className="gco-toolbar flex flex-wrap items-center gap-3 px-5 py-4 sm:px-6">
          <div className="gco-search flex h-11 min-w-[220px] flex-1 items-center gap-2 rounded-xl px-3 lg:max-w-md">
            <Search size={17} className="gco-muted shrink-0" />
            <input
              type="search"
              aria-label="Search companies"
              placeholder="Search company, industry, city..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="min-w-0 flex-1 bg-transparent text-sm outline-none"
            />
            {search && (
              <button
                type="button"
                aria-label="Clear company search"
                onClick={() => setSearch("")}
              >
                <X size={15} />
              </button>
            )}
          </div>

          <div className="gco-filter flex h-11 items-center gap-2 rounded-xl px-3">
            <SlidersHorizontal size={16} className="gco-muted" />
            <select
              aria-label="Filter by industry"
              value={industry}
              onChange={(event) => setIndustry(event.target.value)}
              className="min-w-0 bg-transparent text-sm outline-none"
            >
              <option value="">All Industries</option>
              {industries.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          {hasFilters && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setIndustry("");
              }}
              className="gco-clear inline-flex h-11 items-center gap-1 px-2 text-xs font-bold"
            >
              <X size={14} />
              Clear Filters
            </button>
          )}

          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            aria-label="Refresh companies"
            className="gco-secondary ml-auto flex h-11 w-11 items-center justify-center rounded-xl disabled:opacity-50"
          >
            <RefreshCw
              size={17}
              className={isFetching ? "animate-spin" : ""}
            />
          </button>
        </div>

        {isLoading ? (
          <div className="gco-muted flex min-h-[300px] flex-col items-center justify-center gap-3">
            <LoaderCircle size={28} className="animate-spin" />
            <p className="text-sm">Loading companies...</p>
          </div>
        ) : isError ? (
          <div role="alert" className="flex min-h-[300px] flex-col items-center justify-center px-5 text-center">
            <h3 className="gco-heading font-bold">
              Unable to load companies
            </h3>
            <p className="gco-muted mt-2 text-sm">
              {error?.response?.data?.message ||
                error?.message ||
                "Something went wrong while loading companies."}
            </p>
            <button
              type="button"
              onClick={() => refetch()}
              className="gco-primary mt-5 rounded-xl px-5 py-3 text-sm font-bold"
            >
              Try Again
            </button>
          </div>
        ) : filteredCompanies.length === 0 ? (
          <div className="flex min-h-[300px] flex-col items-center justify-center px-5 text-center">
            <span className="gco-empty-icon mb-4 flex h-16 w-16 items-center justify-center rounded-2xl">
              <Building2 size={29} />
            </span>
            <h3 className="gco-heading font-bold">
              {companies.length ? "No matching companies" : "No companies yet"}
            </h3>
            <p className="gco-muted mt-2 text-sm">
              {companies.length
                ? "Try changing your search or industry filter."
                : "Add your first company to get started."}
            </p>
            <button
              type="button"
              onClick={
                companies.length
                  ? () => {
                      setSearch("");
                      setIndustry("");
                    }
                  : () => setCompanyModalOpen(true)
              }
              className="gco-primary mt-5 rounded-xl px-5 py-3 text-sm font-bold"
            >
              {companies.length ? "Clear Filters" : "Add Company"}
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="gco-table w-full min-w-[1120px] border-collapse text-left">
              <thead>
                <tr>
                  {[
                    "Company",
                    "Company ID",
                    "Industry",
                    "City",
                    "Website",
                    "Existing Agency",
                    "Source",
                    "Stage",
                    "Contacts",
                  ].map((column) => (
                    <th
                      key={column}
                      className="whitespace-nowrap px-5 py-4 text-xs font-bold"
                    >
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {filteredCompanies.map((company) => {
                  const url = websiteUrl(company.website);

                  return (
                    <tr key={company.id}>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          {/* <span className="gco-avatar flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-xs font-extrabold">
                            {getInitials(company.name)}
                          </span> */}
                          <div className="min-w-0">
                            <p className="gco-heading max-w-[190px] truncate text-sm font-bold">
                              {company.name || "Unnamed company"}
                            </p>
                            <p className="gco-muted mt-1 text-[11px]">
                              Company Record
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <span className="gco-code whitespace-nowrap text-xs font-bold">
                          {company.companyCode || `COMP-${company.id}`}
                        </span>
                      </td>

                      <td className="gco-muted px-5 py-4 text-xs">
                        {company.industry || "—"}
                      </td>

                      <td className="px-5 py-4">
                        <span className="gco-muted inline-flex items-center gap-1.5 text-xs">
                          <MapPin size={13} />
                          {company.city || "—"}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        {url ? (
                          <a
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="gco-link inline-flex max-w-[190px] items-center gap-1.5 text-xs"
                          >
                            <span className="truncate">
                              {company.website.replace(/^https?:\/\//i, "")}
                            </span>
                            <ExternalLink size={13} className="shrink-0" />
                          </a>
                        ) : (
                          <span className="gco-muted">—</span>
                        )}
                      </td>

                      <td className="gco-muted px-5 py-4 text-xs">
                        {company.agencyRelationship || "—"}
                      </td>

                      <td className="gco-muted px-5 py-4 text-xs">
                        {company.source || "—"}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className="gco-stage inline-flex max-w-[170px] rounded-full px-3 py-1.5 text-xs font-bold"
                          data-active={company.currentStage ? "yes" : "no"}
                        >
                          <span className="truncate">
                            {company.currentStage || "No lead"}
                          </span>
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <span className="gco-contact-count inline-flex min-w-8 items-center justify-center rounded-lg px-2 py-1 text-xs font-bold">
                          {Number(company.contactsCount || 0)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <footer className="gco-footer px-5 py-4 text-xs sm:px-6">
          Showing up to 100 loaded records. Search and filters apply to
          these records.
        </footer>
      </section>

      <CompanyFormModal
        open={companyModalOpen}
        onClose={closeForm}
      />
    </div>
  );
}