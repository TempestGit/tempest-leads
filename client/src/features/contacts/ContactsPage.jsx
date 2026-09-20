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
          <h1 className="text-2xl font-bold text-slate-900">
            Contact Master
          </h1>

          <p className="mt-2 text-sm text-slate-600">
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
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm"
          />
        </label>

        <button
          type="submit"
          className="rounded-lg bg-action px-4 py-2.5 text-sm font-semibold text-white hover:bg-action-hover"
        >
          Search
        </button>
      </form>

      <div className="mt-5 rounded-xl border border-slate-200 bg-white">
        {query.isPending ? (
          <p role="status" className="p-6 text-slate-600">
            Loading contacts…
          </p>
        ) : query.isError ? (
          <div className="p-6">
            <p role="alert" className="text-red-700">
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
          <p className="p-6 text-sm text-slate-600">
            {filters.search
              ? 'No contacts match your search.'
              : 'No contacts have been added yet.'}
          </p>
        ) : (
          <ul className="divide-y divide-slate-200">
            {contacts.map((contact) => (
              <li key={contact.id} className="p-4 sm:p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900">
                      {contact.name}
                    </p>

                    <p className="mt-1 text-sm text-slate-600">
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

                <p className="mt-2 text-sm text-slate-600">
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
                      <dt className="text-xs text-slate-500">
                        {label}
                      </dt>
                      <dd className="mt-1 break-words text-slate-900">
                        {value || '—'}
                      </dd>
                    </div>
                  ))}
                </dl>

                {contact.notes && (
                  <p className="mt-4 text-sm whitespace-pre-wrap break-words text-slate-600">
                    {contact.notes}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}

        {pagination && !query.isError && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 p-4 text-sm">
            <p className="text-slate-600">
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
                className="rounded-lg border px-3 py-2 disabled:opacity-40"
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
                className="rounded-lg border px-3 py-2 disabled:opacity-40"
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