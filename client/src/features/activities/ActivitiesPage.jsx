import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useOutletContext } from 'react-router-dom';

import { fetchActivities } from './activities.api';

const activityLabels = {
  CALL: 'Call',
  EMAIL: 'Email',
  WHATSAPP: 'WhatsApp',
  LINKEDIN: 'LinkedIn',
  MEETING: 'Meeting',
  REFERRAL: 'Referral',
  FOLLOW_UP: 'Follow-up',
  NOTE: 'Internal note',
  PITCH: 'Pitch',
  COMMERCIAL_DISCUSSION: 'Commercial discussion',
  CONTRACT: 'Contract',
  ONBOARDING: 'Onboarding',
  OTHER: 'Other',
};

const directionLabels = {
  INBOUND: 'Inbound',
  OUTBOUND: 'Outbound',
};

const dateFormatter = new Intl.DateTimeFormat('en-IN', {
  timeZone: 'Asia/Kolkata',
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

const focusClass =
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus';

const initialFilters = {
  search: '',
  activityType: '',
  page: 1,
};

function formatDate(value) {
  if (!value) {
    return '—';
  }

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? '—'
    : `${dateFormatter.format(date)} IST`;
}

export default function ActivitiesPage() {
  const { user } = useOutletContext();

  const [searchInput, setSearchInput] = useState('');
  const [filters, setFilters] = useState(initialFilters);

  const query = useQuery({
    queryKey: ['activities', user.id, 'all', filters],
    queryFn: ({ signal }) =>
      fetchActivities({
        ...filters,
        signal,
      }),
    retry: false,
  });

  const activities = query.data?.data || [];
  const pagination = query.data?.pagination;
  const hasFilters = Boolean(
    filters.search || filters.activityType,
  );

  function search(event) {
    event.preventDefault();

    const searchValue = searchInput.trim();

    if (searchValue === filters.search && filters.page === 1) {
      void query.refetch();
      return;
    }

    setFilters((current) => ({
      ...current,
      search: searchValue,
      page: 1,
    }));
  }

  function resetFilters() {
    setSearchInput('');
    setFilters({ ...initialFilters });
  }

  return (
    <div className="mx-auto max-w-7xl text-ink">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">
            Activities
          </h1>

          <p className="mt-2 text-sm text-subtle">
            {user.role === 'SUPER_ADMIN'
              ? 'View recorded interactions across all leads.'
              : 'View recorded interactions for leads assigned to you.'}
          </p>
        </div>

        <Link
          to="/leads"
          className={`rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-surface hover:bg-brand-hover ${focusClass}`}
        >
          Open leads
        </Link>
      </div>

      <p className="mt-3 text-xs text-muted">
        To record an activity, open its lead and select Record activity.
        All times below are shown in IST.
      </p>

      <form
        onSubmit={search}
        className="mt-6 flex flex-wrap gap-3"
      >
        <label htmlFor="activity-search" className="sr-only">
          Search activities
        </label>

        <input
          id="activity-search"
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
          maxLength={100}
          placeholder="Search subject, notes, company, contact, or lead ID"
          className="min-w-0 flex-1 rounded-lg border border-line-strong bg-field px-3 py-2.5 text-sm text-ink placeholder:text-muted"
        />

        <button
          type="submit"
          className={`rounded-lg bg-secondary px-4 py-2.5 text-sm font-semibold text-surface hover:bg-secondary-hover ${focusClass}`}
        >
          Search
        </button>
      </form>

      <div className="mt-4 flex flex-wrap items-end gap-3">
        <label className="w-full text-xs font-semibold text-subtle sm:w-64">
          Activity type

          <select
            value={filters.activityType}
            onChange={(event) =>
              setFilters((current) => ({
                ...current,
                activityType: event.target.value,
                page: 1,
              }))
            }
            className="mt-2 w-full rounded-lg border border-line-strong bg-field px-3 py-2.5 text-sm font-normal text-ink"
          >
            <option value="">All activity types</option>

            {Object.entries(activityLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>

        <button
          type="button"
          onClick={resetFilters}
          disabled={!hasFilters && !searchInput}
          className={`rounded-lg border border-line-strong bg-surface px-4 py-2.5 text-sm font-semibold text-subtle hover:bg-surface-hover disabled:opacity-40 ${focusClass}`}
        >
          Clear filters
        </button>
      </div>

      <section
        aria-label="Activity results"
        aria-busy={query.isFetching}
        className="mt-5 rounded-xl border border-line bg-surface"
      >
        {query.isPending ? (
          <p role="status" className="p-6 text-subtle">
            Loading activities…
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
        ) : activities.length === 0 ? (
          <div className="p-8 text-center">
            <h2 className="font-semibold text-ink">
              No activities found
            </h2>

            <p className="mt-2 text-sm text-subtle">
              {hasFilters
                ? 'Try a different search or clear the filters.'
                : 'Open a lead to record your first interaction.'}
            </p>

            {hasFilters ? (
              <button
                type="button"
                onClick={resetFilters}
                className={`mt-4 text-sm font-semibold text-action ${focusClass}`}
              >
                Clear filters
              </button>
            ) : (
              <Link
                to="/leads"
                className={`mt-4 inline-block text-sm font-semibold text-action ${focusClass}`}
              >
                Open leads
              </Link>
            )}
          </div>
        ) : (
          <ol className="divide-y divide-line">
            {activities.map((activity) => (
              <li key={activity.id} className="p-4 sm:p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <Link
                      to={`/leads/${activity.lead_id}`}
                      className={`break-words font-semibold text-action hover:underline ${focusClass}`}
                    >
                      {activity.company_name}
                    </Link>

                    <p className="mt-1 break-all text-xs text-muted">
                      {activity.lead_code}
                    </p>
                  </div>

                  <p className="text-xs text-muted">
                    {formatDate(activity.occurred_at)}
                  </p>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="rounded bg-action-soft px-2 py-1 text-xs font-semibold text-action">
                    {activityLabels[activity.activity_type] ||
                      activity.activity_type}
                  </span>

                  {activity.direction && (
                    <span className="rounded bg-selected px-2 py-1 text-xs text-subtle">
                      {directionLabels[activity.direction] ||
                        activity.direction}
                    </span>
                  )}
                </div>

                {activity.subject && (
                  <h2 className="mt-3 break-words text-sm font-semibold text-ink">
                    {activity.subject}
                  </h2>
                )}

                {activity.notes && (
                  <details className="mt-3">
                    <summary
                      className={`cursor-pointer text-sm font-medium text-action ${focusClass}`}
                    >
                      View notes
                    </summary>

                    <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-subtle">
                      {activity.notes}
                    </p>
                  </details>
                )}

                {activity.outcome && (
                  <p className="mt-3 break-words text-sm text-ink">
                    <span className="font-semibold">Outcome: </span>
                    {activity.outcome}
                  </p>
                )}

                <dl className="mt-4 grid gap-3 text-xs sm:grid-cols-3">
                  <div className="min-w-0">
                    <dt className="text-muted">Contact</dt>

                    <dd className="mt-1 break-words text-subtle">
                      {activity.contact_name ||
                        (activity.contact_id
                          ? 'Contact unavailable'
                          : 'General lead activity')}
                    </dd>
                  </div>

                  <div className="min-w-0">
                    <dt className="text-muted">Recorded by</dt>

                    <dd className="mt-1 break-words text-subtle">
                      {activity.created_by_name}
                    </dd>
                  </div>

                  <div>
                    <dt className="text-muted">Recorded at</dt>

                    <dd className="mt-1 text-subtle">
                      {formatDate(activity.created_at)}
                    </dd>
                  </div>
                </dl>
              </li>
            ))}
          </ol>
        )}

        {pagination && !query.isError && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line p-4 text-sm">
            <p className="text-subtle">
              {pagination.total} activities · Page {pagination.page} of{' '}
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