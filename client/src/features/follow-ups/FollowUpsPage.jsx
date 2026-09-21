import { useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useOutletContext } from 'react-router-dom';

import {
  fetchFollowUp,
  fetchFollowUps,
} from './followUps.api';

import FollowUpActionForm from './FollowUpActionForm';

const views = [
  ['TODAY', 'Today'],
  ['UPCOMING', 'Upcoming'],
  ['OVERDUE', 'Overdue'],
  ['ALL', 'All'],
  ['COMPLETED', 'Completed'],
  ['RESCHEDULED', 'Rescheduled'],
  ['CANCELLED', 'Cancelled'],
];

const statusLabels = {
  PENDING: 'Pending',
  COMPLETED: 'Completed',
  RESCHEDULED: 'Rescheduled',
  CANCELLED: 'Cancelled',
};

const statusClasses = {
  PENDING: 'bg-info-soft text-[var(--crm-info-text)]',
  COMPLETED:
    'bg-success-soft text-[var(--crm-success-text)]',
  RESCHEDULED:
    'bg-warning-soft text-[var(--crm-warning-text)]',
  CANCELLED: 'bg-selected text-subtle',
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

const secondaryButtonClass =
  `rounded-lg border border-line-strong bg-surface px-3 py-2 text-sm font-semibold text-subtle hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-40 ${focusClass}`;

function formatDate(value) {
  if (!value) {
    return '—';
  }

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? '—'
    : `${dateFormatter.format(date)} IST`;
}

/*
 * Without leadId: standalone Follow-ups page.
 * With leadId: follow-ups for one lead.
 *
 * Remount when the account or lead changes.
 */
export default function FollowUpsPage({ leadId = null }) {
  const { user } = useOutletContext();

  const scopedLeadId =
    leadId === null ? null : String(leadId);

  return (
    <FollowUpsWorkspace
      key={`${user.id}:${scopedLeadId || 'all'}`}
      user={user}
      leadId={scopedLeadId}
    />
  );
}

function FollowUpsWorkspace({ user, leadId }) {
  const queryClient = useQueryClient();

  const embedded = leadId !== null;

  const searchId = embedded
    ? `follow-up-search-${leadId}`
    : 'follow-up-search';

  const [searchInput, setSearchInput] = useState('');

  const [filters, setFilters] = useState({
    view: embedded ? 'ALL' : 'TODAY',
    search: '',
    page: 1,
  });

  const [actionSession, setActionSession] = useState(null);
  const [openingId, setOpeningId] = useState(null);
  const [actionError, setActionError] = useState('');
  const [success, setSuccess] = useState('');

  const openingRef = useRef(false);
  const sessionNumber = useRef(0);

  const query = useQuery({
    queryKey: [
      'follow-ups',
      user.id,
      leadId || 'all',
      filters,
    ],
    queryFn: ({ signal }) =>
      fetchFollowUps({
        ...filters,
        leadId,
        signal,
      }),
    retry: false,
    refetchInterval: actionSession ? false : 60000,
  });

  const followUps = query.data?.data || [];
  const pagination = query.data?.pagination;

  function search(event) {
    event.preventDefault();

    const nextSearch = searchInput.trim();

    if (
      nextSearch === filters.search &&
      filters.page === 1
    ) {
      void query.refetch();
      return;
    }

    setFilters((current) => ({
      ...current,
      search: nextSearch,
      page: 1,
    }));
  }

  function changeView(view) {
    setFilters((current) => ({
      ...current,
      view,
      page: 1,
    }));
  }

  function clearSearch() {
    setSearchInput('');

    setFilters((current) => ({
      ...current,
      search: '',
      page: 1,
    }));
  }

  async function openAction(id, mode) {
    if (openingRef.current || actionSession) {
      return;
    }

    openingRef.current = true;
    setOpeningId(String(id));
    setActionError('');
    setSuccess('');

    try {
      // Fetch the latest record version before editing.
      const followUp = await fetchFollowUp(id);

      if (
        embedded &&
        String(followUp.lead_id) !== leadId
      ) {
        setActionError(
          'This follow-up does not belong to the selected lead.',
        );
        return;
      }

      if (
        followUp.status !== 'PENDING' ||
        !['OPEN', 'NURTURE'].includes(followUp.lead_status)
      ) {
        setActionError(
          'This follow-up is no longer available for that action. The list has been refreshed.',
        );

        void queryClient.invalidateQueries({
          queryKey: ['follow-ups', user.id],
        });

        return;
      }

      sessionNumber.current += 1;

      setActionSession({
        key: sessionNumber.current,
        mode,
        followUp,
      });
    } catch (error) {
      setActionError(
        error.message || 'Unable to load the follow-up.',
      );
    } finally {
      openingRef.current = false;
      setOpeningId(null);
    }
  }

  function closeAction() {
    setActionSession(null);
    setActionError('');

    void queryClient.invalidateQueries({
      queryKey: ['follow-ups', user.id],
    });
  }

  function handleSaved(result) {
    const updatedLeadId = String(result.followUp.lead_id);

    setSuccess(
      result.followUp.status === 'COMPLETED'
        ? 'Follow-up completed and the next action scheduled.'
        : 'Follow-up rescheduled. The previous schedule was preserved.',
    );

    setActionSession(null);
    setActionError('');

    setFilters((current) => ({
      ...current,
      page: 1,
    }));

    void queryClient.invalidateQueries({
      queryKey: ['follow-ups', user.id],
    });

    void queryClient.invalidateQueries({
      queryKey: ['lead', user.id, updatedLeadId],
    });

    void queryClient.invalidateQueries({
      queryKey: ['leads', user.id],
    });

    void queryClient.invalidateQueries({
      queryKey: ['activities', user.id],
    });
  }

  return (
    <div
      className={
        embedded
          ? 'text-ink'
          : 'mx-auto max-w-7xl text-ink'
      }
    >
      {embedded ? (
        <h2 className="text-lg font-semibold">
          Follow-ups
        </h2>
      ) : (
        <h1 className="text-2xl font-bold">
          Follow-ups
        </h1>
      )}

      <p className="mt-2 text-sm text-subtle">
        {embedded
          ? 'Manage scheduled actions and follow-up history for this lead.'
          : user.role === 'SUPER_ADMIN'
            ? 'Manage follow-ups across all leads.'
            : 'Manage follow-ups for leads assigned to you.'}
      </p>

      <p className="mt-2 text-xs text-muted">
        Times are shown in IST. Today includes all pending actions
        due today; Overdue includes any pending action whose time
        has passed.
      </p>

      {success && (
        <p
          role="status"
          className="mt-5 rounded-lg bg-success-soft p-3 text-sm text-[var(--crm-success-text)]"
        >
          {success}
        </p>
      )}

      {actionError && (
        <p
          role="alert"
          className="mt-5 rounded-lg bg-danger-soft p-3 text-sm text-[var(--crm-danger-text)]"
        >
          {actionError}
        </p>
      )}

      {actionSession && (
        <FollowUpActionForm
          key={actionSession.key}
          followUp={actionSession.followUp}
          mode={actionSession.mode}
          onSaved={handleSaved}
          onCancel={closeAction}
        />
      )}

      <div
        role="group"
        aria-label="Follow-up view"
        className="mt-6 flex flex-wrap gap-2"
      >
        {views.map(([value, label]) => (
          <button
            key={value}
            type="button"
            aria-pressed={filters.view === value}
            onClick={() => changeView(value)}
            className={[
              'rounded-lg px-3 py-2 text-sm font-semibold',
              focusClass,
              filters.view === value
                ? 'bg-brand text-surface'
                : 'bg-selected text-subtle hover:bg-selected-hover',
            ].join(' ')}
          >
            {label}
          </button>
        ))}
      </div>

      <form
        onSubmit={search}
        className="mt-5 flex flex-wrap gap-3"
      >
        <label htmlFor={searchId} className="sr-only">
          Search follow-ups
        </label>

        <input
          id={searchId}
          value={searchInput}
          onChange={(event) =>
            setSearchInput(event.target.value)
          }
          maxLength={100}
          placeholder="Search action, company, contact, phone, email, or lead ID"
          className="min-w-0 flex-1 rounded-lg border border-line-strong bg-field px-3 py-2.5 text-sm text-ink placeholder:text-muted"
        />

        <button
          type="submit"
          className={`rounded-lg bg-secondary px-4 py-2.5 text-sm font-semibold text-surface hover:bg-secondary-hover ${focusClass}`}
        >
          Search
        </button>

        {(filters.search || searchInput) && (
          <button
            type="button"
            onClick={clearSearch}
            className={secondaryButtonClass}
          >
            Clear
          </button>
        )}
      </form>

      <section
        aria-label="Follow-up results"
        aria-busy={query.isFetching}
        className="mt-5 rounded-xl border border-line bg-surface"
      >
        {query.isPending ? (
          <p role="status" className="p-6 text-subtle">
            Loading follow-ups…
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
        ) : followUps.length === 0 ? (
          <div className="p-8 text-center">
            <h3 className="font-semibold">
              No follow-ups found
            </h3>

            <p className="mt-2 text-sm text-subtle">
              {filters.search
                ? 'Try another search or clear the search.'
                : 'There are no follow-ups matching this view.'}
            </p>

            {filters.view !== 'ALL' && (
              <button
                type="button"
                onClick={() => changeView('ALL')}
                className={`mt-4 text-sm font-semibold text-action ${focusClass}`}
              >
                View all follow-ups
              </button>
            )}
          </div>
        ) : (
          <ul className="divide-y divide-line">
            {followUps.map((followUp) => {
              const canChange =
                followUp.status === 'PENDING' &&
                ['OPEN', 'NURTURE'].includes(
                  followUp.lead_status,
                );

              const overdue =
                followUp.status === 'PENDING' &&
                Date.parse(followUp.due_at) < Date.now();

              const isOpening =
                openingId === String(followUp.id);

              return (
                <li
                  key={followUp.id}
                  className="p-4 sm:p-5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      {embedded ? (
                        <p className="break-words font-semibold text-ink">
                          {followUp.company_name}
                        </p>
                      ) : (
                        <Link
                          to={`/leads/${followUp.lead_id}`}
                          className={`break-words font-semibold text-action hover:underline ${focusClass}`}
                        >
                          {followUp.company_name}
                        </Link>
                      )}

                      <p className="mt-1 break-all text-xs text-muted">
                        {followUp.lead_code}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <span
                        className={[
                          'rounded px-2 py-1 text-xs font-semibold',
                          statusClasses[followUp.status] ||
                            'bg-selected text-subtle',
                        ].join(' ')}
                      >
                        {statusLabels[followUp.status] ||
                          followUp.status}
                      </span>

                      {overdue && (
                        <span className="rounded bg-danger-soft px-2 py-1 text-xs font-semibold text-[var(--crm-danger-text)]">
                          Overdue
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="mt-4 whitespace-pre-wrap break-words text-sm font-medium text-ink">
                    {followUp.action}
                  </p>

                  <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-3">
                    <div>
                      <dt className="text-xs text-muted">
                        Scheduled
                      </dt>

                      <dd className="mt-1">
                        {formatDate(followUp.due_at)}
                      </dd>
                    </div>

                    <div className="min-w-0">
                      <dt className="text-xs text-muted">
                        Contact
                      </dt>

                      <dd className="mt-1 break-words">
                        {followUp.contact_name || '—'}
                      </dd>
                    </div>

                    <div className="min-w-0">
                      <dt className="text-xs text-muted">
                        Assigned owner
                      </dt>

                      <dd className="mt-1 break-words">
                        {followUp.owner_name}
                      </dd>
                    </div>

                    <div className="min-w-0">
                      <dt className="text-xs text-muted">
                        Phone
                      </dt>

                      <dd className="mt-1 break-words">
                        {followUp.contact_phone || '—'}
                      </dd>
                    </div>

                    <div className="min-w-0">
                      <dt className="text-xs text-muted">
                        Email
                      </dt>

                      <dd className="mt-1 break-words">
                        {followUp.contact_email || '—'}
                      </dd>
                    </div>

                    {followUp.completed_at && (
                      <div>
                        <dt className="text-xs text-muted">
                          Completed
                        </dt>

                        <dd className="mt-1">
                          {formatDate(followUp.completed_at)}
                        </dd>
                      </div>
                    )}

                    {followUp.completed_by_name && (
                      <div className="min-w-0">
                        <dt className="text-xs text-muted">
                          Completed by
                        </dt>

                        <dd className="mt-1 break-words">
                          {followUp.completed_by_name}
                        </dd>
                      </div>
                    )}
                  </dl>

                  {followUp.outcome && (
                    <p className="mt-4 break-words text-sm text-subtle">
                      <span className="font-semibold">
                        Outcome:{' '}
                      </span>

                      {followUp.outcome}
                    </p>
                  )}

                  {followUp.notes && (
                    <details className="mt-3">
                      <summary
                        className={`cursor-pointer text-sm font-medium text-action ${focusClass}`}
                      >
                        View notes
                      </summary>

                      <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-subtle">
                        {followUp.notes}
                      </p>
                    </details>
                  )}

                  {canChange && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      <button
                        type="button"
                        disabled={
                          Boolean(actionSession) ||
                          openingId !== null
                        }
                        onClick={() =>
                          openAction(followUp.id, 'complete')
                        }
                        className={`rounded-lg bg-brand px-3 py-2 text-sm font-semibold text-surface hover:bg-brand-hover disabled:opacity-40 ${focusClass}`}
                      >
                        {isOpening ? 'Loading…' : 'Complete'}
                      </button>

                      <button
                        type="button"
                        disabled={
                          Boolean(actionSession) ||
                          openingId !== null
                        }
                        onClick={() =>
                          openAction(followUp.id, 'reschedule')
                        }
                        className={secondaryButtonClass}
                      >
                        Reschedule
                      </button>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}

        {pagination && !query.isError && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line p-4 text-sm">
            <p className="text-subtle">
              {pagination.total} follow-ups · Page{' '}
              {pagination.page} of {pagination.totalPages}
            </p>

            <div className="flex gap-2">
              <button
                type="button"
                disabled={
                  pagination.page <= 1 ||
                  query.isFetching
                }
                onClick={() =>
                  setFilters((current) => ({
                    ...current,
                    page: current.page - 1,
                  }))
                }
                className={secondaryButtonClass}
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
                className={secondaryButtonClass}
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