import { useQuery } from '@tanstack/react-query';
import {
  Link,
  useOutletContext,
  useParams,
} from 'react-router-dom';

import { fetchLead } from './leads.api';

const stageLabels = {
  NEW: 'New',
  CONTACT_RESEARCH: 'Contact research',
  CONNECTED: 'Connected',
  MEETING: 'Meeting',
  BRIEF: 'Brief',
  PITCH: 'Pitch',
  COMMERCIALS: 'Commercials',
  CONTRACT_PO: 'Contract / PO',
  ONBOARDING: 'Onboarding',
  ACTIVE_CLIENT: 'Active client',
  LOST: 'Lost',
  NURTURE: 'Nurture',
};

const statusLabels = {
  OPEN: 'Open',
  LOST: 'Lost',
  NURTURE: 'Nurture',
  ACTIVE_CLIENT: 'Active client',
};

const statusClasses = {
  OPEN: 'bg-info-soft text-[var(--crm-info-text)]',
  LOST: 'bg-danger-soft text-[var(--crm-danger-text)]',
  NURTURE: 'bg-warning-soft text-[var(--crm-warning-text)]',
  ACTIVE_CLIENT:
    'bg-success-soft text-[var(--crm-success-text)]',
};

const priorityLabels = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
};

const routeLabels = {
  UNDECIDED: 'Not decided — assessed after the brief',
  KNOWN: 'Known / existing client or industry',
  NEW: 'New / unknown client or industry',
};

const dateFormatter = new Intl.DateTimeFormat('en-IN', {
  timeZone: 'Asia/Kolkata',
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

function displayValue(value) {
  return value === null || value === undefined || value === ''
    ? '—'
    : String(value);
}

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
 * Format the decimal string without converting it to a floating-point
 * number, preserving the database's monetary precision.
 */
function formatMoney(value, currency) {
  if (value === null || value === undefined || value === '') {
    return 'Not estimated';
  }

  const match = /^(\d+)(?:\.(\d{1,2}))?$/.exec(String(value));

  if (!match) {
    return '—';
  }

  const integer = BigInt(match[1]).toLocaleString('en-IN');
  const fraction = (match[2] || '').padEnd(2, '0');

  return `${currency || 'INR'} ${integer}.${fraction}`;
}

function DetailField({ label, value, children, wide = false }) {
  return (
    <div className={wide ? 'min-w-0 sm:col-span-2' : 'min-w-0'}>
      <dt className="text-xs font-medium text-muted">
        {label}
      </dt>

      <dd className="mt-1 whitespace-pre-wrap break-words text-sm text-ink">
        {children ?? displayValue(value)}
      </dd>
    </div>
  );
}

function DetailSection({ title, children }) {
  return (
    <section className="rounded-xl border border-line bg-surface p-5 sm:p-6">
      <h2 className="text-lg font-semibold text-ink">
        {title}
      </h2>

      <dl className="mt-5 grid gap-x-8 gap-y-5 sm:grid-cols-2">
        {children}
      </dl>
    </section>
  );
}

export default function LeadDetailPage() {
  const { id } = useParams();
  const { user } = useOutletContext();

  const query = useQuery({
    queryKey: ['lead', user.id, id],
    queryFn: ({ signal }) => fetchLead(id, { signal }),
    retry: false,
  });

  const backLink = (
    <Link
      to="/leads"
      className="inline-block text-sm font-semibold text-action hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
    >
      ← Back to leads
    </Link>
  );

  if (query.isPending) {
    return (
      <div className="mx-auto max-w-7xl text-ink">
        {backLink}

        <p role="status" className="mt-6 text-subtle">
          Loading lead…
        </p>
      </div>
    );
  }

  if (query.isError) {
    return (
      <div className="mx-auto max-w-7xl text-ink">
        {backLink}

        <div className="mt-6 rounded-xl border border-line bg-surface p-6">
          <p
            role="alert"
            className="text-[var(--crm-danger-text)]"
          >
            {query.error.message}
          </p>

          {query.error.status === 401 ? (
            <Link
              to="/login"
              className="mt-4 inline-block font-semibold text-action"
            >
              Sign in again
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => query.refetch()}
              disabled={query.isFetching}
              className="mt-4 font-semibold text-action disabled:opacity-50"
            >
              {query.isFetching ? 'Retrying…' : 'Try again'}
            </button>
          )}
        </div>
      </div>
    );
  }

  const lead = query.data;

  if (!lead) {
    return (
      <div className="mx-auto max-w-7xl text-ink">
        {backLink}

        <p role="alert" className="mt-6 text-subtle">
          Lead details are unavailable.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl text-ink">
      {backLink}

      <div className="mt-5 flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="break-words text-2xl font-bold">
            {lead.company_name}
          </h1>

          <p className="mt-2 break-all text-xs text-muted">
            {lead.lead_code}
          </p>

          <p className="mt-2 text-sm text-subtle">
            {[lead.industry, lead.city].filter(Boolean).join(' · ')}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <span
            className={[
              'rounded-lg px-3 py-2 text-xs font-semibold',
              statusClasses[lead.status] ||
                'bg-selected text-subtle',
            ].join(' ')}
          >
            {statusLabels[lead.status] || lead.status}
          </span>

          <span className="rounded-lg bg-selected px-3 py-2 text-xs font-semibold text-subtle">
            {stageLabels[lead.stage] || lead.stage}
          </span>
        </div>
      </div>

      <div className="mt-6 space-y-6">
        <DetailSection title="Next action">
          <DetailField
            label="Action"
            value={lead.next_action}
            wide
          />

          <DetailField
            label="Follow-up"
            value={formatDate(lead.next_follow_up_at)}
          />

          <DetailField
            label="Owner"
            value={lead.owner_name}
          />

          <DetailField
            label="Priority"
            value={priorityLabels[lead.priority] || lead.priority}
          />

          <DetailField
            label="Last touch"
            value={formatDate(lead.last_touch_at)}
          />
        </DetailSection>

        <DetailSection title="Opportunity">
          <DetailField
            label="Potential requirement"
            value={lead.potential_requirement}
            wide
          />

          <DetailField
            label="Opportunity description"
            value={lead.opportunity_description}
            wide
          />

          <DetailField
            label="Service interest"
            value={lead.service_interest}
          />

          <DetailField
            label="Lead source"
            value={lead.lead_source}
          />

          <DetailField
            label="Estimated value"
            value={formatMoney(
              lead.opportunity_value,
              lead.currency,
            )}
          />

          <DetailField
            label="Workflow route"
            value={
              routeLabels[lead.workflow_route] ||
              lead.workflow_route
            }
          />
        </DetailSection>

        <DetailSection title="Primary contact">
          <DetailField
            label="Name"
            value={lead.contact_name}
          />

          <DetailField
            label="Designation"
            value={lead.contact_designation}
          />

          <DetailField
            label="Phone"
            value={lead.contact_phone}
          />

          <DetailField
            label="WhatsApp"
            value={lead.contact_whatsapp}
          />

          <DetailField
            label="Email"
            value={lead.contact_email}
          />

          <DetailField
            label="LinkedIn"
            value={lead.contact_linkedin}
          />

          <DetailField
            label="Communication status"
            value={lead.contact_communication_status?.replaceAll(
              '_',
              ' ',
            )}
          />
        </DetailSection>

        <DetailSection title="Record information">
          <DetailField
            label="Company ID"
            value={lead.company_code}
          />

          <DetailField
            label="Created by"
            value={lead.created_by_name}
          />

          <DetailField
            label="Created"
            value={formatDate(lead.created_at)}
          />

          <DetailField
            label="Last updated"
            value={formatDate(lead.updated_at)}
          />

          <DetailField
            label="Current stage since"
            value={formatDate(lead.stage_entered_at)}
          />
        </DetailSection>
      </div>
    </div>
  );
}