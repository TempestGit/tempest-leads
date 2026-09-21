import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useOutletContext } from 'react-router-dom';

import { fetchLeads } from './leads.api';

const stageOptions = [
  ['NEW', 'New'],
  ['CONTACT_RESEARCH', 'Contact research'],
  ['CONNECTED', 'Connected'],
  ['MEETING', 'Meeting'],
  ['BRIEF', 'Brief'],
  ['PITCH', 'Pitch'],
  ['COMMERCIALS', 'Commercials'],
  ['CONTRACT_PO', 'Contract / PO'],
  ['ONBOARDING', 'Onboarding'],
  ['ACTIVE_CLIENT', 'Active client'],
  ['LOST', 'Lost'],
  ['NURTURE', 'Nurture'],
];

const statusOptions = [
  ['OPEN', 'Open'],
  ['LOST', 'Lost'],
  ['NURTURE', 'Nurture'],
  ['ACTIVE_CLIENT', 'Active client'],
];

const priorityOptions = [
  ['LOW', 'Low'],
  ['MEDIUM', 'Medium'],
  ['HIGH', 'High'],
];

const statusClasses = {
  OPEN: 'bg-info-soft text-[var(--crm-info-text)]',
  LOST: 'bg-danger-soft text-[var(--crm-danger-text)]',
  NURTURE: 'bg-warning-soft text-[var(--crm-warning-text)]',
  ACTIVE_CLIENT:
    'bg-success-soft text-[var(--crm-success-text)]',
};

const priorityClasses = {
  LOW: 'bg-selected text-subtle',
  MEDIUM: 'bg-warning-soft text-[var(--crm-warning-text)]',
  HIGH: 'bg-danger-soft text-[var(--crm-danger-text)]',
};

const initialFilters = {
  search: '',
  stage: '',
  status: '',
  priority: '',
  page: 1,
};

const fieldClass =
  'min-w-0 rounded-lg border border-line-strong bg-field px-3 py-2.5 text-sm text-ink';

const focusClass =
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus';

const dateFormatter = new Intl.DateTimeFormat('en-IN', {
  timeZone: 'Asia/Kolkata',
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

function formatDate(value) {
  if (!value) {
    return '—';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '—';
  }

  return dateFormatter.format(date);
}

function getLabel(options, value) {
  return options.find(([key]) => key === value)?.[1] || value || '—';
}

function StatusBadge({ value }) {
  return (
    <span
      className={[
        'inline-block rounded px-2 py-1 text-xs font-semibold',
        statusClasses[value] || 'bg-selected text-subtle',
      ].join(' ')}
    >
      {getLabel(statusOptions, value)}
    </span>
  );
}

function PriorityBadge({ value }) {
  return (
    <span
      className={[
        'inline-block rounded px-2 py-1 text-xs font-semibold',
        priorityClasses[value] || 'bg-selected text-subtle',
      ].join(' ')}
    >
      {getLabel(priorityOptions, value)}
    </span>
  );
}

export default function LeadsPage() {
  const { user } = useOutletContext();

  const [searchInput, setSearchInput] = useState('');
  const [filters, setFilters] = useState(initialFilters);

  const query = useQuery({
    queryKey: ['leads', user.id, filters],
    queryFn: ({ signal }) =>
      fetchLeads({
        ...filters,
        signal,
      }),
  });

  const leads = query.data?.data || [];
  const pagination = query.data?.pagination;

  function submitSearch(event) {
    event.preventDefault();

    setFilters((current) => ({
      ...current,
      search: searchInput.trim(),
      page: 1,
    }));
  }

  function changeFilter(name, value) {
    setFilters((current) => ({
      ...current,
      [name]: value,
      page: 1,
    }));
  }

  function resetFilters() {
    setSearchInput('');
    setFilters({ ...initialFilters });
  }

  const hasFilters = Boolean(
    filters.search ||
      filters.stage ||
      filters.status ||
      filters.priority,
  );

  return (
    <div className="mx-auto max-w-7xl text-ink">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
            <h1 className="text-2xl font-bold text-ink">
            Leads &amp; Pipeline
            </h1>

            <p className="mt-2 text-sm text-subtle">
            {user.role === 'SUPER_ADMIN'
                ? 'View opportunities across all account owners.'
                : 'View opportunities assigned to you.'}
            </p>
        </div>

        <Link
            to="/leads/new"
            className="inline-flex items-center justify-center rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-surface hover:bg-brand-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
        >
            Add lead
        </Link>
      </div>

      <form
        onSubmit={submitSearch}
        className="mt-6 flex flex-wrap gap-3"
      >
        <label htmlFor="lead-search" className="sr-only">
          Search leads
        </label>

        <input
          id="lead-search"
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
          maxLength={100}
          placeholder="Search company, contact, phone, email, or lead ID"
          className={`${fieldClass} flex-1 placeholder:text-muted`}
        />

        <button
          type="submit"
          className={`rounded-lg bg-secondary px-4 py-2.5 text-sm font-semibold text-surface hover:bg-secondary-hover ${focusClass}`}
        >
          Search
        </button>
      </form>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <label className="min-w-0">
          <span className="text-xs font-semibold text-subtle">
            Stage
          </span>

          <select
            value={filters.stage}
            onChange={(event) =>
              changeFilter('stage', event.target.value)
            }
            className={`${fieldClass} mt-1 w-full`}
          >
            <option value="">All stages</option>

            {stageOptions.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>

        <label className="min-w-0">
          <span className="text-xs font-semibold text-subtle">
            Status
          </span>

          <select
            value={filters.status}
            onChange={(event) =>
              changeFilter('status', event.target.value)
            }
            className={`${fieldClass} mt-1 w-full`}
          >
            <option value="">All statuses</option>

            {statusOptions.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>

        <label className="min-w-0">
          <span className="text-xs font-semibold text-subtle">
            Priority
          </span>

          <select
            value={filters.priority}
            onChange={(event) =>
              changeFilter('priority', event.target.value)
            }
            className={`${fieldClass} mt-1 w-full`}
          >
            <option value="">All priorities</option>

            {priorityOptions.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>

        <div className="flex items-end">
          <button
            type="button"
            onClick={resetFilters}
            disabled={!hasFilters && !searchInput}
            className={`rounded-lg border border-line-strong bg-surface px-4 py-2.5 text-sm font-semibold text-subtle hover:bg-surface-hover disabled:opacity-40 ${focusClass}`}
          >
            Clear filters
          </button>
        </div>
      </div>

      <p className="mt-4 text-xs text-muted">
        Follow-up times are shown in India Standard Time (IST).
      </p>

      <section
        aria-label="Lead results"
        aria-busy={query.isFetching}
        className="mt-3 rounded-xl border border-line bg-surface"
      >
        {query.isPending ? (
          <p role="status" className="p-6 text-subtle">
            Loading leads…
          </p>
        ) : query.isError ? (
          <div className="p-6">
            <p
              role="alert"
              className="text-[var(--crm-danger-text)]"
            >
              {query.error.message}
            </p>

            {query.error.status === 401 ? (
              <Link
                to="/login"
                className={`mt-3 inline-block font-semibold text-action ${focusClass}`}
              >
                Sign in again
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => query.refetch()}
                disabled={query.isFetching}
                className={`mt-3 font-semibold text-action disabled:opacity-50 ${focusClass}`}
              >
                {query.isFetching ? 'Retrying…' : 'Try again'}
              </button>
            )}
          </div>
        ) : leads.length === 0 ? (
          <div className="p-8 text-center">
            <h2 className="font-semibold text-ink">
              No leads found
            </h2>

            <p className="mt-2 text-sm text-subtle">
              {hasFilters
                ? 'Try a different search or clear the filters.'
                : 'No leads are available for your account yet.'}
            </p>

            {hasFilters && (
              <button
                type="button"
                onClick={resetFilters}
                className={`mt-4 text-sm font-semibold text-action ${focusClass}`}
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="hidden overflow-x-auto lg:block">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-line bg-[var(--crm-table-header)] text-[var(--crm-table-header-text)]">
                  <tr>
                    {[
                      'Company / Lead',
                      'Primary contact',
                      'Owner',
                      'Stage',
                      'Status',
                      'Priority',
                      'Next action',
                      'Follow-up',
                    ].map((heading) => (
                      <th
                        key={heading}
                        scope="col"
                        className="whitespace-nowrap px-4 py-3 font-semibold"
                      >
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="divide-y divide-line">
                  {leads.map((lead) => (
                    <tr
                      key={lead.id}
                      className="hover:bg-[var(--crm-table-hover)]"
                    >
                      <td className="px-4 py-4 align-top">
                        <Link
                            to={`/leads/${lead.id}`}
                            className="font-semibold text-action hover:underline"
                        >
                            {lead.company_name}
                        </Link>

                        <p className="mt-1 break-all text-xs text-muted">
                          {lead.lead_code}
                        </p>

                        <p className="mt-1 text-xs text-subtle">
                          {lead.industry}
                        </p>
                      </td>

                      <td className="px-4 py-4 align-top">
                        <p>{lead.contact_name}</p>
                      </td>

                      <td className="px-4 py-4 align-top">
                        {lead.owner_name}
                      </td>

                      <td className="px-4 py-4 align-top">
                        {getLabel(stageOptions, lead.stage)}
                      </td>

                      <td className="px-4 py-4 align-top">
                        <StatusBadge value={lead.status} />
                      </td>

                      <td className="px-4 py-4 align-top">
                        <PriorityBadge value={lead.priority} />
                      </td>

                      <td className="px-4 py-4 align-top">
                        <p className="max-w-xs whitespace-pre-wrap break-words">
                          {lead.next_action || '—'}
                        </p>
                      </td>

                      <td className="whitespace-nowrap px-4 py-4 align-top">
                        {formatDate(lead.next_follow_up_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <ul className="divide-y divide-line lg:hidden">
              {leads.map((lead) => (
                <li key={lead.id} className="p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h2 className="break-words font-semibold">
                        <Link
                            to={`/leads/${lead.id}`}
                            className="text-action hover:underline"
                        >
                            {lead.company_name}
                        </Link>
                      </h2>

                      <p className="mt-1 break-all text-xs text-muted">
                        {lead.lead_code}
                      </p>
                    </div>

                    <StatusBadge value={lead.status} />
                  </div>

                  <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                    <div>
                      <dt className="text-xs text-muted">
                        Primary contact
                      </dt>
                      <dd className="mt-1 break-words">
                        {lead.contact_name}
                      </dd>
                    </div>

                    <div>
                      <dt className="text-xs text-muted">
                        Owner
                      </dt>
                      <dd className="mt-1 break-words">
                        {lead.owner_name}
                      </dd>
                    </div>

                    <div>
                      <dt className="text-xs text-muted">
                        Stage
                      </dt>
                      <dd className="mt-1">
                        {getLabel(stageOptions, lead.stage)}
                      </dd>
                    </div>

                    <div>
                      <dt className="text-xs text-muted">
                        Priority
                      </dt>
                      <dd className="mt-1">
                        <PriorityBadge value={lead.priority} />
                      </dd>
                    </div>

                    <div className="sm:col-span-2">
                      <dt className="text-xs text-muted">
                        Next action
                      </dt>
                      <dd className="mt-1 whitespace-pre-wrap break-words">
                        {lead.next_action || '—'}
                      </dd>
                    </div>

                    <div className="sm:col-span-2">
                      <dt className="text-xs text-muted">
                        Follow-up
                      </dt>
                      <dd className="mt-1">
                        {formatDate(lead.next_follow_up_at)}
                      </dd>
                    </div>
                  </dl>
                </li>
              ))}
            </ul>
          </>
        )}

        {pagination && !query.isError && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line p-4 text-sm">
            <p className="text-subtle">
              {pagination.total} leads · Page {pagination.page} of{' '}
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
                className={`rounded-lg border border-line-strong px-3 py-2 text-ink hover:bg-surface-hover disabled:opacity-40 ${focusClass}`}
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
                className={`rounded-lg border border-line-strong px-3 py-2 text-ink hover:bg-surface-hover disabled:opacity-40 ${focusClass}`}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}