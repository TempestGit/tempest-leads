import { useId, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useOutletContext } from 'react-router-dom';

import { fetchMeetings } from './meetings.api';
import MeetingForm from './MeetingForm';

const views = [
  ['ALL', 'All meetings'],
  ['TODAY', 'Today'],
  ['UPCOMING', 'Tomorrow onward'],
  ['PAST_DUE', 'Past due'],
  ['COMPLETED', 'Completed'],
  ['RESCHEDULED', 'Rescheduled'],
  ['CANCELLED', 'Cancelled'],
  ['NO_SHOW', 'No-show'],
];

const meetingTypes = {
  IN_PERSON: 'In person',
  VIDEO_CALL: 'Video call',
  PHONE_CALL: 'Phone call',
};

const statusLabels = {
  SCHEDULED: 'Scheduled',
  COMPLETED: 'Completed',
  RESCHEDULED: 'Rescheduled',
  CANCELLED: 'Cancelled',
  NO_SHOW: 'No-show',
};

const statusClasses = {
  SCHEDULED: 'bg-info-soft text-[var(--crm-info-text)]',
  COMPLETED: 'bg-success-soft text-[var(--crm-success-text)]',
  RESCHEDULED: 'bg-warning-soft text-[var(--crm-warning-text)]',
  CANCELLED: 'bg-selected text-muted',
  NO_SHOW: 'bg-danger-soft text-[var(--crm-danger-text)]',
};

const dateFormatter = new Intl.DateTimeFormat('en-IN', {
  timeZone: 'Asia/Kolkata',
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  hour12: true,
});

const focusClass =
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus';

const paginationClass =
  `rounded-lg border border-line bg-surface px-3 py-2 text-ink hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-40 ${focusClass}`;

function formatDateTime(value) {
  if (!value) return '—';

  // Treat MySQL datetime strings without an offset as UTC.
  const text = String(value).trim();
  const normalized =
    /^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}:\d{2}(?:\.\d+)?$/.test(
      text,
    )
      ? `${text.replace(' ', 'T')}Z`
      : text;

  const date = new Date(normalized);

  return Number.isNaN(date.getTime())
    ? 'Unavailable'
    : dateFormatter.format(date);
}

function safeMeetingUrl(value) {
  if (!value) return null;

  try {
    const url = new URL(value);

    if (
      url.protocol !== 'https:' ||
      url.username ||
      url.password
    ) {
      return null;
    }

    return url.href;
  } catch {
    return null;
  }
}

function MeetingCard({ meeting }) {
  const meetingUrl = safeMeetingUrl(meeting.meeting_url);

  return (
    <li className="p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="break-words font-semibold text-ink">
            {meeting.title}
          </h3>

          <p className="mt-1 break-all text-xs text-muted">
            {meeting.meeting_code}
          </p>
        </div>

        <span
          className={[
            'rounded px-2 py-1 text-xs font-semibold',
            statusClasses[meeting.status] ||
              'bg-selected text-muted',
          ].join(' ')}
        >
          {statusLabels[meeting.status] || meeting.status}
        </span>
      </div>

      <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-muted">Starts · IST</dt>
          <dd className="mt-1 text-ink">
            {formatDateTime(meeting.starts_at)}
          </dd>
        </div>

        <div>
          <dt className="text-muted">Ends · IST</dt>
          <dd className="mt-1 text-ink">
            {formatDateTime(meeting.ends_at)}
          </dd>
        </div>

        <div>
          <dt className="text-muted">Meeting type</dt>
          <dd className="mt-1 text-ink">
            {meetingTypes[meeting.meeting_type] ||
              meeting.meeting_type}
          </dd>
        </div>

        <div>
          <dt className="text-muted">Contact</dt>
          <dd className="mt-1 break-words text-ink">
            {meeting.contact_name || '—'}
          </dd>
        </div>

        <div>
          <dt className="text-muted">Owner</dt>
          <dd className="mt-1 break-words text-ink">
            {meeting.owner_name || '—'}
          </dd>
        </div>

        {meeting.location && (
          <div>
            <dt className="text-muted">Location</dt>
            <dd className="mt-1 whitespace-pre-wrap break-words text-ink">
              {meeting.location}
            </dd>
          </div>
        )}
      </dl>

      {meetingUrl && (
        <a
          href={meetingUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={`mt-4 inline-block rounded text-sm font-semibold text-action hover:underline ${focusClass}`}
        >
          Open meeting link
          <span className="sr-only"> (opens in a new tab)</span>
        </a>
      )}
    </li>
  );
}

function LeadMeetingsContent({ lead, user }) {
  const queryClient = useQueryClient();
  const headingId = useId();
  const filterId = useId();

  const [showForm, setShowForm] = useState(false);
  const [success, setSuccess] = useState('');
  const [filters, setFilters] = useState({
    view: 'ALL',
    page: 1,
  });

  const canSchedule =
    ['OPEN', 'NURTURE'].includes(lead.status) &&
    Boolean(lead.primary_contact_id);

  const query = useQuery({
    queryKey: [
      'meetings',
      user.id,
      String(lead.id),
      filters,
    ],
    queryFn: ({ signal }) =>
      fetchMeetings({
        leadId: String(lead.id),
        view: filters.view,
        page: filters.page,
        limit: 10,
        signal,
      }),
  });

  const meetings = query.data?.data || [];
  const pagination = query.data?.pagination;

  function handleCreated(meeting) {
    setShowForm(false);
    setSuccess(`"${meeting.title}" was scheduled successfully.`);
    setFilters({ view: 'ALL', page: 1 });

    void queryClient.invalidateQueries({
      queryKey: ['meetings', user.id],
    });
  }

  return (
    <section
      aria-labelledby={headingId}
      className="rounded-xl border border-line bg-surface"
    >
      <div className="p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2
              id={headingId}
              className="text-lg font-semibold text-ink"
            >
              Meetings
            </h2>

            <p className="mt-1 text-sm text-muted">
              Meetings associated with this lead. All times are
              shown in India Standard Time (IST).
            </p>
          </div>

          {canSchedule && !showForm && (
            <button
              type="button"
              onClick={() => {
                setSuccess('');
                setShowForm(true);
              }}
              className={`rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-surface hover:bg-brand-hover ${focusClass}`}
            >
              Schedule meeting
            </button>
          )}
        </div>

        {!canSchedule && (
          <p className="mt-3 text-sm text-muted">
            {!['OPEN', 'NURTURE'].includes(lead.status)
              ? 'Meetings can be scheduled while this lead is open or in nurture.'
              : 'A primary contact is required to schedule a meeting.'}
          </p>
        )}

        {success && (
          <p
            role="status"
            className="mt-4 rounded-lg bg-success-soft p-3 text-sm text-[var(--crm-success-text)]"
          >
            {success}
          </p>
        )}

        {showForm && (
          <MeetingForm
            lead={lead}
            onCreated={handleCreated}
            onCancel={() => setShowForm(false)}
          />
        )}

        <div className="mt-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <label
              htmlFor={filterId}
              className="block text-sm font-semibold text-subtle"
            >
              Show meetings
            </label>

            <select
              id={filterId}
              value={filters.view}
              onChange={(event) =>
                setFilters({
                  view: event.target.value,
                  page: 1,
                })
              }
              className={`mt-2 w-full rounded-lg border border-line-strong bg-field px-3 py-2.5 text-sm text-ink sm:w-56 ${focusClass}`}
            >
              {views.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={() => void query.refetch()}
            disabled={query.isFetching}
            className={`rounded-lg border border-line bg-surface px-3 py-2.5 text-sm font-semibold text-ink hover:bg-surface-hover disabled:opacity-50 ${focusClass}`}
          >
            {query.isFetching ? 'Refreshing…' : 'Refresh'}
          </button>
        </div>
      </div>

      {query.isError && (
        <div
          role="alert"
          className="mx-5 mb-5 rounded-lg bg-danger-soft p-4 text-sm text-[var(--crm-danger-text)]"
        >
          <p>
            {query.error?.message || 'Unable to load meetings.'}
          </p>

          {query.error?.status === 401 ? (
            <Link
              to="/login"
              className={`mt-2 inline-block rounded font-semibold underline ${focusClass}`}
            >
              Sign in again
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => void query.refetch()}
              disabled={query.isFetching}
              className={`mt-2 rounded font-semibold underline disabled:opacity-50 ${focusClass}`}
            >
              {query.isFetching ? 'Retrying…' : 'Try again'}
            </button>
          )}
        </div>
      )}

      {query.isPending ? (
        <p role="status" className="border-t border-line p-5 text-muted">
          Loading meetings…
        </p>
      ) : !query.data ? null : meetings.length === 0 ? (
        <div className="border-t border-line p-8 text-center">
          <h3 className="font-semibold text-ink">
            No meetings found
          </h3>

          <p className="mt-2 text-sm text-muted">
            {filters.view !== 'ALL'
              ? 'Try another filter to view meetings for this lead.'
              : canSchedule
                ? 'Use Schedule meeting to arrange the first meeting.'
                : 'No meetings have been recorded for this lead.'}
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-line border-t border-line">
          {meetings.map((meeting) => (
            <MeetingCard key={meeting.id} meeting={meeting} />
          ))}
        </ul>
      )}

      {pagination && !query.isError && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line p-4 text-sm">
          <p className="text-muted">
            {pagination.total} meetings · Page {pagination.page} of{' '}
            {Math.max(1, pagination.totalPages)}
          </p>

          <div className="flex gap-2">
            <button
              type="button"
              disabled={
                pagination.page <= 1 || query.isFetching
              }
              onClick={() =>
                setFilters((current) => ({
                  ...current,
                  page: Math.max(1, current.page - 1),
                }))
              }
              className={paginationClass}
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
              className={paginationClass}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

export default function LeadMeetingsPanel({ lead }) {
  const { user } = useOutletContext();

  return (
    <LeadMeetingsContent
      key={`${user.id}:${lead.id}`}
      lead={lead}
      user={user}
    />
  );
}