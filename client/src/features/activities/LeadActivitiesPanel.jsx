import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useOutletContext } from 'react-router-dom';

import { fetchActivities } from './activities.api';
import ActivityForm from './ActivityForm';

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
 * Reset panel state when navigating to another lead or account.
 */
export default function LeadActivitiesPanel({ lead }) {
  const { user } = useOutletContext();

  return (
    <ActivitiesPanel
      key={`${user.id}:${lead.id}`}
      lead={lead}
      user={user}
    />
  );
}

function ActivitiesPanel({ lead, user }) {
  const queryClient = useQueryClient();

  const [showForm, setShowForm] = useState(false);
  const [success, setSuccess] = useState('');
  const [filters, setFilters] = useState({
    activityType: '',
    page: 1,
  });

  const query = useQuery({
    queryKey: ['activities', user.id, String(lead.id), filters],
    queryFn: ({ signal }) =>
      fetchActivities({
        leadId: lead.id,
        ...filters,
        signal,
      }),
    retry: false,
  });

  const activities = query.data?.data || [];
  const pagination = query.data?.pagination;

  function handleCreated() {
    setShowForm(false);
    setSuccess('Activity recorded successfully.');

    // Return to the unfiltered timeline.
    setFilters({
      activityType: '',
      page: 1,
    });

    void queryClient.invalidateQueries({
      queryKey: ['activities', user.id],
    });

    // Recording a contact attempt can update the lead's last touch.
    void queryClient.invalidateQueries({
      queryKey: ['lead', user.id, String(lead.id)],
    });

    void queryClient.invalidateQueries({
      queryKey: ['leads', user.id],
    });
  }

  return (
    <section
      aria-labelledby={`lead-activities-${lead.id}`}
      className="rounded-xl border border-line bg-surface p-5 sm:p-6"
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2
            id={`lead-activities-${lead.id}`}
            className="text-lg font-semibold text-ink"
          >
            Activity timeline
          </h2>

          <p className="mt-2 text-sm text-subtle">
            Recorded interactions, newest first. Times are shown in IST.
          </p>
        </div>

        {!showForm && (
          <button
            type="button"
            onClick={() => {
              setSuccess('');
              setShowForm(true);
            }}
            className={`rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-surface hover:bg-brand-hover ${focusClass}`}
          >
            Record activity
          </button>
        )}
      </div>

      {success && (
        <p
          role="status"
          className="mt-4 rounded-lg bg-success-soft p-3 text-sm text-[var(--crm-success-text)]"
        >
          {success}
        </p>
      )}

      {showForm && (
        <ActivityForm
          lead={lead}
          onCreated={handleCreated}
          onCancel={() => setShowForm(false)}
        />
      )}

      <div className="mt-5">
        <label
          htmlFor={`activity-type-filter-${lead.id}`}
          className="block text-xs font-semibold text-subtle"
        >
          Activity type
        </label>

        <select
          id={`activity-type-filter-${lead.id}`}
          value={filters.activityType}
          onChange={(event) =>
            setFilters({
              activityType: event.target.value,
              page: 1,
            })
          }
          className="mt-2 w-full rounded-lg border border-line-strong bg-field px-3 py-2.5 text-sm text-ink sm:max-w-xs"
        >
          <option value="">All activity types</option>

          {Object.entries(activityLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-5" aria-busy={query.isFetching}>
        {query.isPending ? (
          <p role="status" className="py-4 text-sm text-subtle">
            Loading activities…
          </p>
        ) : query.isError ? (
          <div className="rounded-lg bg-danger-soft p-4">
            <p
              role="alert"
              className="text-sm text-[var(--crm-danger-text)]"
            >
              {query.error.message}
            </p>

            {query.error.status === 401 ? (
              <Link
                to="/login"
                className={`mt-3 inline-block text-sm font-semibold text-action ${focusClass}`}
              >
                Sign in again
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => query.refetch()}
                disabled={query.isFetching}
                className={`mt-3 text-sm font-semibold text-action disabled:opacity-50 ${focusClass}`}
              >
                {query.isFetching ? 'Retrying…' : 'Try again'}
              </button>
            )}
          </div>
        ) : activities.length === 0 ? (
          <div className="rounded-lg border border-line p-6 text-center">
            <h3 className="text-sm font-semibold text-ink">
              No activities found
            </h3>

            <p className="mt-2 text-sm text-subtle">
              {filters.activityType
                ? 'Choose another activity type or show all activities.'
                : 'Record a call, meeting, note, or other completed interaction.'}
            </p>

            {filters.activityType && (
              <button
                type="button"
                onClick={() =>
                  setFilters({
                    activityType: '',
                    page: 1,
                  })
                }
                className={`mt-3 text-sm font-semibold text-action ${focusClass}`}
              >
                Show all activities
              </button>
            )}
          </div>
        ) : (
          <ol className="space-y-4">
            {activities.map((activity) => (
              <li
                key={activity.id}
                className="rounded-lg border border-line p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
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

                  <p className="text-xs text-muted">
                    {formatDate(activity.occurred_at)}
                  </p>
                </div>

                {activity.subject && (
                  <h3 className="mt-3 break-words text-sm font-semibold text-ink">
                    {activity.subject}
                  </h3>
                )}

                {activity.notes && (
                  <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-6 text-subtle">
                    {activity.notes}
                  </p>
                )}

                {activity.outcome && (
                  <p className="mt-3 break-words text-sm text-ink">
                    <span className="font-semibold">Outcome: </span>
                    {activity.outcome}
                  </p>
                )}

                <dl className="mt-4 grid gap-3 border-t border-line pt-3 text-xs sm:grid-cols-2">
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

                  <div className="sm:col-span-2">
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
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4 text-sm">
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
      </div>
    </section>
  );
}