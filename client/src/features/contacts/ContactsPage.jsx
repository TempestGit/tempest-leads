import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useOutletContext } from 'react-router-dom';

import { fetchContacts } from './contacts.api';

export default function ContactsPage({ companyId = null }) {
  const { user } = useOutletContext();

  const [searchInput, setSearchInput] = useState('');
  const [filters, setFilters] = useState({
    search: '',
    page: 1,
  });

  const query = useQuery({
    queryKey: ['contacts', user.id, companyId, filters],
    queryFn: ({ signal }) =>
      fetchContacts({
        companyId,
        ...filters,
        signal,
      }),
  });

  function search(event) {
    event.preventDefault();

    setFilters({
      search: searchInput.trim(),
      page: 1,
    });
  }

  const contacts = query.data?.data || [];
  const pagination = query.data?.pagination;

  return (
    <div className={companyId ? '' : 'mx-auto max-w-7xl'}>
      {!companyId && (
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-ink">
            Contact Master
          </h1>

          <p className="mt-2 text-sm text-subtle">
            View contacts across your accessible company records.
          </p>

          <Link
            to="/companies"
            className="mt-3 inline-block text-sm font-semibold text-action"
          >
            Open a company to add contacts →
          </Link>
        </div>
      )}

      <form
        onSubmit={search}
        className="flex flex-wrap gap-3"
      >
        <label className="min-w-0 flex-1">
          <span className="sr-only">Search contacts</span>

          <input
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            maxLength={100}
            placeholder="Search name, email, phone, or company"
            className="w-full rounded-lg border border-line-strong px-3 py-2.5 text-sm"
          />
        </label>

        <button
          type="submit"
          className="rounded-lg bg-action px-4 py-2.5 text-sm font-semibold text-surface hover:bg-action-hover"
        >
          Search
        </button>
      </form>

      <div className="mt-5 rounded-xl border border-line bg-surface">
        {query.isPending ? (
          <p role="status" className="p-6 text-subtle">
            Loading contacts…
          </p>
        ) : query.isError ? (
          <div className="p-6">
            <p role="alert" className="text-[var(--crm-danger-text)]">
              {query.error.message}
            </p>

            {query.error.status === 401 ? (
              <Link
                to="/login"
                className="mt-3 inline-block font-semibold text-action"
              >
                Sign in again
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => query.refetch()}
                disabled={query.isFetching}
                className="mt-3 font-semibold text-action"
              >
                {query.isFetching ? 'Retrying…' : 'Try again'}
              </button>
            )}
          </div>
        ) : contacts.length === 0 ? (
          <p className="p-6 text-sm text-subtle">
            {filters.search
              ? 'No contacts match your search.'
              : 'No contacts have been added yet.'}
          </p>
        ) : (
          <ul className="divide-y divide-line">
            {contacts.map((contact) => (
              <li key={contact.id} className="p-4 sm:p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <Link
                      to={`/contacts/${contact.id}`}
                      className="font-semibold text-action hover:underline"
                    >
                      {contact.name}
                    </Link>

                    <p className="mt-1 text-sm text-subtle">
                      {contact.designation || 'Designation not provided'}
                      {contact.department
                        ? ` · ${contact.department}`
                        : ''}
                    </p>
                  </div>

                  {contact.decision_maker && (
                    <span className="rounded bg-action-soft px-2 py-1 text-xs font-semibold text-action">
                      Decision-maker
                    </span>
                  )}
                </div>

                <p className="mt-2 text-sm text-subtle">
                  {contact.company_name}
                </p>

                <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                  {[
                    ['Phone', contact.phone],
                    ['WhatsApp', contact.whatsapp],
                    ['Email', contact.email],
                    ['LinkedIn', contact.linkedin],
                    ['Owner', contact.owner_name],
                    [
                      'Communication status',
                      contact.communication_status === 'UNKNOWN'
                        ? 'Not recorded'
                        : contact.communication_status.replaceAll('_', ' '),
                    ],
                  ].map(([label, value]) => (
                    <div key={label} className="min-w-0">
                      <dt className="text-xs text-muted">
                        {label}
                      </dt>
                      <dd className="mt-1 break-words text-ink">
                        {value || '—'}
                      </dd>
                    </div>
                  ))}
                </dl>

                {contact.notes && (
                  <p className="mt-4 text-sm whitespace-pre-wrap break-words text-subtle">
                    {contact.notes}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}

        {pagination && !query.isError && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line p-4 text-sm">
            <p className="text-subtle">
              {pagination.total} contacts · Page {pagination.page} of{' '}
              {pagination.totalPages}
            </p>

            <div className="flex gap-2">
              <button
                type="button"
                disabled={pagination.page <= 1 || query.isFetching}
                onClick={() =>
                  setFilters((current) => ({
                    ...current,
                    page: current.page - 1,
                  }))
                }
                className="rounded-lg border border-line-strong px-3 py-2 disabled:opacity-40"
              >
                Previous
              </button>

              <button
                type="button"
                disabled={
                  pagination.page >= pagination.totalPages ||
                  query.isFetching
                }
                onClick={() =>
                  setFilters((current) => ({
                    ...current,
                    page: current.page + 1,
                  }))
                }
                className="rounded-lg border border-line-strong px-3 py-2 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}