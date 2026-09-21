import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Link,
  useOutletContext,
  useParams,
} from 'react-router-dom';

import { fetchContact } from './contacts.api';
import ContactForm from './ContactForm';

function displayValue(value) {
  return value === null || value === undefined || value === ''
    ? '—'
    : String(value);
}

function safeLinkedInUrl(value) {
  if (!value) {
    return null;
  }

  try {
    const url = new URL(value);
    const hostname = url.hostname.toLowerCase();

    if (
      url.protocol !== 'https:' ||
      url.username ||
      url.password ||
      !(
        hostname === 'linkedin.com' ||
        hostname.endsWith('.linkedin.com')
      )
    ) {
      return null;
    }

    return url.href;
  } catch {
    return null;
  }
}

/*
 * Remount the page when navigating between contact IDs.
 * This prevents an edit session from carrying over to another contact.
 */
export default function ContactDetailPage() {
  const { id } = useParams();
  const { user } = useOutletContext();

  return (
    <ContactDetails
      key={`${user.id}:${id}`}
      id={id}
      user={user}
    />
  );
}

function ContactDetails({ id, user }) {
  const queryClient = useQueryClient();

  const [editingContact, setEditingContact] = useState(null);
  const [success, setSuccess] = useState('');
  const [refreshError, setRefreshError] = useState('');
  const [isOpeningEditor, setIsOpeningEditor] = useState(false);

  const queryKey = ['contact', user.id, id];

  const query = useQuery({
    queryKey,
    queryFn: ({ signal }) => fetchContact(id, { signal }),
    retry: false,
  });

  /*
   * Load the latest details before opening an editing session.
   * Store a snapshot so background refetches do not reset the form.
   */
  async function startEditing() {
    setSuccess('');
    setRefreshError('');
    setIsOpeningEditor(true);

    try {
      const result = await query.refetch();

      if (result.isError || !result.data) {
        setRefreshError(
          result.error?.message ||
            'Unable to load the latest contact details.',
        );
        return;
      }

      setEditingContact({ ...result.data });
    } finally {
      setIsOpeningEditor(false);
    }
  }

  function cancelEditing() {
    setEditingContact(null);
    setRefreshError('');
    void query.refetch();
  }

  async function handleUpdated(updatedContact) {
    // Prevent an older detail request from replacing the saved values.
    await queryClient.cancelQueries({ queryKey });

    queryClient.setQueryData(queryKey, updatedContact);

    setEditingContact(null);
    setRefreshError('');
    setSuccess('Contact updated successfully.');

    // Refresh Contact Master and company contact lists.
    void queryClient.invalidateQueries({
      queryKey: ['contacts'],
    });
  }

  const backLink = (
    <Link
      to="/contacts"
      className="inline-block text-sm font-semibold text-action hover:underline"
    >
      ← Back to contacts
    </Link>
  );

  if (query.isPending) {
    return (
      <div className="mx-auto max-w-7xl text-ink">
        {backLink}

        <p role="status" className="mt-6 text-subtle">
          Loading contact…
        </p>
      </div>
    );
  }

  /*
   * Keep an open form mounted if a background fetch fails.
   * This preserves unsaved input.
   */
  if (query.isError && !editingContact) {
    return (
      <div className="mx-auto max-w-7xl text-ink">
        {backLink}

        <div className="mt-6 rounded-xl border border-line bg-surface p-6">
          <p role="alert" className="text-[var(--crm-danger-text)]">
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

  const contact = editingContact || query.data;

  if (!contact) {
    return (
      <div className="mx-auto max-w-7xl text-ink">
        {backLink}

        <p role="alert" className="mt-6 text-subtle">
          Contact details are unavailable.
        </p>
      </div>
    );
  }

  const linkedInUrl = safeLinkedInUrl(contact.linkedin);

  const details = [
    ['Designation', contact.designation],
    ['Department', contact.department],
    ['Phone', contact.phone],
    ['WhatsApp', contact.whatsapp],
    ['Email', contact.email],
    [
      'Decision-maker',
      contact.decision_maker ? 'Yes' : 'No',
    ],
    [
      'Communication status',
      contact.communication_status?.replaceAll('_', ' '),
    ],
    ['Owner', contact.owner_name],
    ['Created by', contact.created_by_name],
  ];

  return (
    <div className="mx-auto max-w-7xl text-ink">
      {backLink}

      <div className="mt-5 flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="break-words text-2xl font-bold text-ink">
            {contact.name}
          </h1>

          <p className="mt-2 break-all text-xs text-muted">
            {contact.contact_code}
          </p>

          <p className="mt-3 text-sm text-subtle">
            Company: {contact.company_name}
          </p>
        </div>

        {!editingContact && (
          <button
            type="button"
            onClick={startEditing}
            disabled={isOpeningEditor}
            className="rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-surface hover:bg-brand-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isOpeningEditor ? 'Loading…' : 'Edit contact'}
          </button>
        )}
      </div>

      {success && (
        <p
          role="status"
          className="mt-5 rounded-lg bg-success-soft p-3 text-sm text-[var(--crm-success-text)]"
        >
          {success}
        </p>
      )}

      {refreshError && (
        <p
          role="alert"
          className="mt-5 rounded-lg bg-danger-soft p-3 text-sm text-[var(--crm-danger-text)]"
        >
          {refreshError}
        </p>
      )}

      {editingContact ? (
        <>
          {query.isError && (
            <p
              role="alert"
              className="mt-5 rounded-lg bg-warning-soft p-3 text-sm text-[var(--crm-warning-text)]"
            >
              The latest contact details could not be refreshed.
              Your unsaved entries are still available in the form.
            </p>
          )}

          <ContactForm
            key={`${editingContact.id}:${editingContact.version}`}
            contact={editingContact}
            onUpdated={handleUpdated}
            onCancel={cancelEditing}
          />
        </>
      ) : (
        <section className="mt-6 rounded-xl border border-line bg-surface p-5 sm:p-6">
          <h2 className="text-lg font-semibold text-ink">
            Contact information
          </h2>

          <dl className="mt-5 grid gap-x-8 gap-y-5 sm:grid-cols-2">
            {details.map(([label, value]) => (
              <div key={label} className="min-w-0">
                <dt className="text-xs font-medium text-muted">
                  {label}
                </dt>

                <dd className="mt-1 break-words text-sm text-ink">
                  {displayValue(value)}
                </dd>
              </div>
            ))}

            <div className="min-w-0 sm:col-span-2">
              <dt className="text-xs font-medium text-muted">
                LinkedIn
              </dt>

              <dd className="mt-1 break-all text-sm text-ink">
                {linkedInUrl ? (
                  <a
                    href={linkedInUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-action hover:underline"
                  >
                    {contact.linkedin}
                  </a>
                ) : (
                  displayValue(contact.linkedin)
                )}
              </dd>
            </div>

            <div className="min-w-0 sm:col-span-2">
              <dt className="text-xs font-medium text-muted">
                Notes
              </dt>

              <dd className="mt-1 whitespace-pre-wrap break-words text-sm text-ink">
                {displayValue(contact.notes)}
              </dd>
            </div>
          </dl>
        </section>
      )}
    </div>
  );
}