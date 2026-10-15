
import { useMemo, useState } from "react";
import {
  Building2,
  Download,
  Mail,
  Pencil,
  Phone,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  Trash2,
  Users,
  X,
  LoaderCircle,
  ArrowUpRight,
  ContactRound,
  SlidersHorizontal,
} from "lucide-react";

import {
  useContactsQuery,
  useDeleteContactMutation,
} from "./contacts.queries.js";

import ContactFormModal from "./ContactFormModal.jsx";

const csvValue = (value) => {
  const text = String(value ?? "");
  const safe = /^[\s]*[=+\-@\t\r]/.test(text)
    ? `'${text}`
    : text;

  return `"${safe.replaceAll('"', '""')}"`;
};

const initials = (name) =>
  String(name || "C")
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

function SummaryCard({
  title,
  value,
  subtitle,
  icon: Icon,
  tone = "blue",
  featured = false,
}) {
  return (
    <article
      className={[
        "gcm-summary relative flex min-h-[165px] flex-col",
        "overflow-hidden rounded-[22px] p-5",
        featured ? "is-featured" : "",
      ].join(" ")}
    >
      <div className="relative z-10 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="gcm-summary-label text-xs font-semibold">
            {title}
          </p>

          <h3 className="gcm-summary-value mt-4 text-3xl font-extrabold tracking-tight">
            {value}
          </h3>
        </div>

        <span
          className="gcm-summary-icon flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl"
          data-tone={tone}
        >
          <Icon size={21} strokeWidth={1.8} />
        </span>
      </div>

      <p className="gcm-summary-subtitle relative z-10 mt-auto pt-4 text-xs">
        {subtitle}
      </p>
    </article>
  );
}

export default function ContactsPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  const [deletingContact, setDeletingContact] = useState(null);
  const [deleteError, setDeleteError] = useState("");
  const [search, setSearch] = useState("");
  const [decisionFilter, setDecisionFilter] = useState("all");

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
  } = useContactsQuery(params);

  const deleteMutation = useDeleteContactMutation();

  const contacts = data?.data?.contacts || [];

  const filteredContacts = useMemo(() => {
    const query = search.trim().toLowerCase();

    return contacts.filter((contact) => {
      const matchesSearch =
        !query ||
        [
          contact.contactCode,
          contact.name,
          contact.fullName,
          contact.companyName,
          contact.designation,
          contact.phone,
          contact.email,
        ].some((value) =>
          String(value ?? "").toLowerCase().includes(query)
        );

      const matchesDecision =
        decisionFilter === "all" ||
        (decisionFilter === "yes" && contact.isDecisionMaker) ||
        (decisionFilter === "no" && !contact.isDecisionMaker);

      return matchesSearch && matchesDecision;
    });
  }, [contacts, search, decisionFilter]);

  const decisionMakers = contacts.filter(
    (contact) => contact.isDecisionMaker
  ).length;

  const companyCount = new Set(
    contacts.map((contact) => contact.companyId).filter(Boolean)
  ).size;

  const hasFilters = Boolean(search.trim()) || decisionFilter !== "all";

  const clearFilters = () => {
    setSearch("");
    setDecisionFilter("all");
  };

  const openAdd = () => {
    setEditingContact(null);
    setModalOpen(true);
  };

  const openEdit = (contact) => {
    setEditingContact(contact);
    setModalOpen(true);
  };

  const closeForm = () => {
    setModalOpen(false);
    setEditingContact(null);
    refetch();
  };

  const closeDelete = () => {
    if (deleteMutation.isPending) return;

    setDeletingContact(null);
    setDeleteError("");
  };

  const confirmDelete = async () => {
    if (!deletingContact || deleteMutation.isPending) return;

    try {
      setDeleteError("");

      await deleteMutation.mutateAsync(deletingContact.id);

      setDeletingContact(null);
      await refetch();
    } catch (requestError) {
      setDeleteError(
        requestError?.response?.data?.message ||
          "Unable to delete contact. Please try again."
      );
    }
  };

  const exportCsv = () => {
    if (!filteredContacts.length) return;

    const rows = [
      [
        "Contact ID",
        "Name",
        "Company",
        "Designation",
        "Phone",
        "Email",
        "Decision maker",
      ],
      ...filteredContacts.map((contact) => [
        contact.contactCode,
        contact.name ?? contact.fullName,
        contact.companyName,
        contact.designation,
        contact.phone,
        contact.email,
        contact.isDecisionMaker ? "Yes" : "No",
      ]),
    ];

    const csv =
      "\uFEFF" +
      rows
        .map((row) => row.map(csvValue).join(","))
        .join("\r\n");

    const url = URL.createObjectURL(
      new Blob([csv], {
        type: "text/csv;charset=utf-8;",
      })
    );

    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "tempest-contacts.csv";

    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();

    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  return (
    <div className="glass-contacts min-w-0 space-y-6 p-4 sm:p-6 xl:p-8">
      {/* Page header */}

      <header className="flex flex-wrap items-start justify-between gap-5">
        <div className="min-w-0">
          <div className="mb-3 flex items-center gap-2">
            <span className="gcm-eyebrow-icon flex h-8 w-8 items-center justify-center rounded-xl">
              <ContactRound size={16} />
            </span>

            <span className="gcm-eyebrow text-[11px] font-bold uppercase tracking-[0.15em]">
              Relationship Management
            </span>
          </div>

          <h1 className="gcm-heading text-2xl font-extrabold tracking-tight sm:text-3xl">
            Contact Master
          </h1>

          <p className="gcm-muted mt-2 max-w-2xl text-sm leading-6">
            Manage stakeholders, decision-makers and company
            relationships from one unified workspace.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={exportCsv}
            disabled={!filteredContacts.length}
            className="gcm-secondary inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold disabled:opacity-40"
          >
            <Download size={16} />
            Export CSV
          </button>

          <button
            type="button"
            onClick={openAdd}
            className="gcm-primary inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-5 text-sm font-bold"
          >
            <Plus size={17} />
            Add Contact
          </button>
        </div>
      </header>

      {/* Bento KPI cards */}

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <SummaryCard
          title="Loaded Contacts"
          value={contacts.length}
          subtitle="Contacts in the current API result"
          icon={Users}
          featured
        />

        <SummaryCard
          title="Decision-makers"
          value={decisionMakers}
          subtitle="Key stakeholders in loaded contacts"
          icon={ShieldCheck}
          tone="violet"
        />

        <SummaryCard
          title="Companies Represented"
          value={companyCount}
          subtitle="Unique companies in loaded contacts"
          icon={Building2}
          tone="green"
        />
      </section>

      {/* Main workspace */}

      <section className="gcm-workspace overflow-hidden rounded-[24px]">
        <div className="flex flex-wrap items-center justify-between gap-4 px-5 py-5 sm:px-6">
          <div className="flex items-center gap-3">
            <span className="gcm-section-icon flex h-11 w-11 items-center justify-center rounded-2xl">
              <Users size={20} />
            </span>

            <div>
              <h2 className="gcm-heading text-base font-bold">
                Contacts Directory
              </h2>

              <p className="gcm-muted mt-1 text-xs">
                {filteredContacts.length} of {contacts.length} loaded contacts
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isFetching && !isLoading && (
              <span className="gcm-muted text-xs">
                Refreshing...
              </span>
            )}

            <span className="gcm-count rounded-full px-3 py-1.5 text-xs font-bold">
              {filteredContacts.length} Contacts
            </span>
          </div>
        </div>

        {/* Search / filters */}

        <div className="gcm-toolbar flex flex-wrap items-center justify-between gap-3 px-5 py-4 sm:px-6">
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-3">
            <div className="gcm-search flex h-11 min-w-[200px] flex-1 items-center gap-2 rounded-xl px-3 lg:max-w-md">
              <Search size={17} className="gcm-muted shrink-0" />

              <input
                type="search"
                aria-label="Search contacts"
                placeholder="Search contacts, companies, emails..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="min-w-0 flex-1 bg-transparent text-sm outline-none"
              />

              {search && (
                <button
                  type="button"
                  aria-label="Clear search"
                  className="gcm-muted"
                  onClick={() => setSearch("")}
                >
                  <X size={15} />
                </button>
              )}
            </div>

            <div className="gcm-filter-wrap flex h-11 items-center gap-2 rounded-xl px-3">
              <SlidersHorizontal size={16} className="gcm-muted" />

              <select
                aria-label="Filter decision-makers"
                value={decisionFilter}
                onChange={(event) =>
                  setDecisionFilter(event.target.value)
                }
                className="min-w-0 bg-transparent text-sm font-semibold outline-none"
              >
                <option value="all">All Contacts</option>
                <option value="yes">Decision-makers</option>
                <option value="no">Other Contacts</option>
              </select>
            </div>

            {hasFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="gcm-clear inline-flex h-11 items-center gap-1.5 px-2 text-xs font-bold"
              >
                <X size={14} />
                Clear Filters
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            aria-label="Refresh contacts"
            title="Refresh contacts"
            className="gcm-secondary flex h-11 w-11 shrink-0 items-center justify-center rounded-xl disabled:opacity-50"
          >
            <RefreshCw
              size={17}
              className={isFetching ? "animate-spin" : ""}
            />
          </button>
        </div>

        {/* Data */}

        {isLoading ? (
          <div className="gcm-muted flex min-h-[300px] flex-col items-center justify-center px-5 text-center">
            <LoaderCircle
              size={30}
              className="mb-4 animate-spin"
            />

            <p className="text-sm font-semibold">
              Loading contacts...
            </p>
          </div>
        ) : isError ? (
          <div
            className="flex min-h-[300px] flex-col items-center justify-center px-5 text-center"
            role="alert"
          >
            <div className="gcm-empty-icon mb-4 flex h-14 w-14 items-center justify-center rounded-2xl">
              <X size={25} />
            </div>

            <h3 className="gcm-heading text-base font-bold">
              Unable to load contacts
            </h3>

            <p className="gcm-muted mt-2 max-w-md text-sm">
              {error?.response?.data?.message ||
                error?.message ||
                "Something went wrong."}
            </p>

            <button
              type="button"
              onClick={() => refetch()}
              className="gcm-primary mt-5 inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold"
            >
              <RefreshCw size={16} />
              Try Again
            </button>
          </div>
        ) : filteredContacts.length === 0 ? (
          <div className="flex min-h-[300px] flex-col items-center justify-center px-5 py-12 text-center">
            <div className="gcm-empty-icon mb-4 flex h-16 w-16 items-center justify-center rounded-2xl">
              <Users size={28} />
            </div>

            <h3 className="gcm-heading text-base font-bold">
              {contacts.length
                ? "No matching contacts"
                : "No contacts yet"}
            </h3>

            <p className="gcm-muted mt-2 max-w-md text-sm">
              {contacts.length
                ? "Try changing your search or decision-maker filter."
                : "Add your first contact to start managing company relationships."}
            </p>

            <button
              type="button"
              onClick={contacts.length ? clearFilters : openAdd}
              className="gcm-primary mt-5 inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold"
            >
              {contacts.length ? (
                <>
                  <X size={16} />
                  Clear Filters
                </>
              ) : (
                <>
                  <Plus size={16} />
                  Add Contact
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="w-full overflow-x-auto">
            <table className="gcm-table w-full min-w-[1120px] border-collapse text-left">
              <thead>
                <tr>
                  {[
                    "Contact",
                    "Contact ID",
                    "Company",
                    "Designation",
                    "Phone",
                    "Email",
                    "Decision-maker",
                    "Actions",
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
                {filteredContacts.map((contact) => {
                  const contactName =
                    contact.name || contact.fullName || "Unnamed contact";

                  return (
                    <tr key={contact.id}>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <span className="gcm-avatar flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-xs font-extrabold">
                            {initials(contactName)}
                          </span>

                          <div className="min-w-0">
                            <p className="gcm-heading max-w-[190px] truncate text-sm font-bold">
                              {contactName}
                            </p>

                            <p className="gcm-muted mt-1 text-[11px]">
                              Company Contact
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <span className="gcm-code whitespace-nowrap text-xs font-bold">
                          {contact.contactCode || `CON-${contact.id}`}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <span className="gcm-company-icon flex h-8 w-8 shrink-0 items-center justify-center rounded-xl">
                            <Building2 size={15} />
                          </span>

                          <span className="gcm-heading max-w-[170px] truncate text-xs font-semibold">
                            {contact.companyName || "—"}
                          </span>
                        </div>
                      </td>

                      <td className="gcm-muted px-5 py-4 text-xs">
                        {contact.designation || "—"}
                      </td>

                      <td className="px-5 py-4">
                        {contact.phone ? (
                          <a
                            href={`tel:${contact.phone}`}
                            className="gcm-link inline-flex items-center gap-2 whitespace-nowrap text-xs"
                          >
                            <Phone size={14} />
                            {contact.phone}
                          </a>
                        ) : (
                          <span className="gcm-muted">—</span>
                        )}
                      </td>

                      <td className="px-5 py-4">
                        {contact.email ? (
                          <a
                            href={`mailto:${contact.email}`}
                            className="gcm-link inline-flex max-w-[210px] items-center gap-2 text-xs"
                          >
                            <Mail size={14} className="shrink-0" />

                            <span className="truncate">
                              {contact.email}
                            </span>
                          </a>
                        ) : (
                          <span className="gcm-muted">—</span>
                        )}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className="gcm-badge inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-[11px] font-bold"
                          data-decision={
                            contact.isDecisionMaker ? "yes" : "no"
                          }
                        >
                          {contact.isDecisionMaker && (
                            <ShieldCheck size={13} />
                          )}

                          {contact.isDecisionMaker ? "Yes" : "No"}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            title="Edit contact"
                            aria-label={`Edit ${contactName}`}
                            onClick={() => openEdit(contact)}
                            className="gcm-icon-button flex h-9 w-9 items-center justify-center rounded-xl"
                          >
                            <Pencil size={15} />
                          </button>

                          <button
                            type="button"
                            title="Delete contact"
                            aria-label={`Delete ${contactName}`}
                            onClick={() => {
                              setDeleteError("");
                              setDeletingContact(contact);
                            }}
                            className="gcm-icon-button is-danger flex h-9 w-9 items-center justify-center rounded-xl"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <footer className="gcm-footer flex flex-wrap items-center justify-between gap-2 px-5 py-4 sm:px-6">
          <p className="gcm-muted text-xs">
            Showing up to 100 loaded records. Search and filters
            apply to these records.
          </p>

          <span className="gcm-muted inline-flex items-center gap-1 text-xs">
            Contact Management
            <ArrowUpRight size={13} />
          </span>
        </footer>
      </section>

      {/* Add / Edit modal */}

      <ContactFormModal
        open={modalOpen}
        contact={editingContact}
        onClose={closeForm}
      />

      {/* Delete confirmation */}

      {deletingContact && (
        <div
          className="modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeDelete();
            }
          }}
        >
          <section
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-contact-title"
            aria-describedby="delete-contact-description"
            className="gcm-delete-dialog w-full max-w-[440px] rounded-[24px] p-6 shadow-xl"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="gcm-delete-icon mb-4 flex h-12 w-12 items-center justify-center rounded-2xl">
                  <Trash2 size={22} />
                </span>

                <h2
                  id="delete-contact-title"
                  className="gcm-heading text-lg font-extrabold"
                >
                  Delete Contact
                </h2>

                <p className="gcm-muted mt-2 text-sm">
                  Please confirm this action.
                </p>
              </div>

              <button
                type="button"
                aria-label="Close"
                onClick={closeDelete}
                disabled={deleteMutation.isPending}
                className="gcm-icon-button flex h-9 w-9 items-center justify-center rounded-xl"
              >
                <X size={16} />
              </button>
            </div>

            <p
              id="delete-contact-description"
              className="gcm-heading mt-6 text-sm leading-6"
            >
              Are you sure you want to delete{" "}
              <strong>
                {deletingContact.name ||
                  deletingContact.fullName ||
                  deletingContact.contactCode ||
                  "this contact"}
              </strong>
              ?
            </p>

            <p className="gcm-muted mt-2 text-xs">
              This contact will be removed from active contact lists.
            </p>

            {deleteError && (
              <p
                role="alert"
                className="gcm-error mt-4 rounded-xl p-3 text-sm"
              >
                {deleteError}
              </p>
            )}

            <div className="mt-7 flex flex-wrap justify-end gap-2">
              <button
                type="button"
                onClick={closeDelete}
                disabled={deleteMutation.isPending}
                className="gcm-secondary rounded-xl px-4 py-2.5 text-sm font-semibold"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={confirmDelete}
                disabled={deleteMutation.isPending}
                className="gcm-danger inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold disabled:opacity-50"
              >
                {deleteMutation.isPending ? (
                  <LoaderCircle
                    size={16}
                    className="animate-spin"
                  />
                ) : (
                  <Trash2 size={16} />
                )}

                {deleteMutation.isPending
                  ? "Deleting..."
                  : "Delete Contact"}
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
