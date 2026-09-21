import { useState } from 'react';
import { useForm } from 'react-hook-form';

import {
  createContact,
  updateContact,
} from './contacts.api';

const defaults = {
  name: '',
  designation: '',
  department: '',
  phone: '',
  whatsapp: '',
  email: '',
  linkedin: '',
  decision_maker: false,
  notes: '',
};

const fields = [
  ['name', 'Contact name *', 'text', 150],
  ['designation', 'Designation', 'text', 150],
  ['department', 'Department', 'text', 100],
  ['phone', 'Phone', 'tel', 30],
  ['whatsapp', 'WhatsApp', 'tel', 30],
  ['email', 'Email', 'email', 190],
  ['linkedin', 'LinkedIn URL', 'url', 500],
];

const inputClass =
  'mt-2 w-full rounded-lg border border-line-strong bg-field px-3 py-2.5 text-sm text-ink placeholder:text-muted';

function getDefaultValues(contact) {
  if (!contact) {
    return { ...defaults };
  }

  return {
    name: contact.name ?? '',
    designation: contact.designation ?? '',
    department: contact.department ?? '',
    phone: contact.phone ?? '',
    whatsapp: contact.whatsapp ?? '',
    email: contact.email ?? '',
    linkedin: contact.linkedin ?? '',
    decision_maker: Boolean(Number(contact.decision_maker)),
    notes: contact.notes ?? '',
  };
}

export default function ContactForm({
  companyId,
  contact = null,
  onCreated,
  onUpdated,
  onCancel,
}) {
  const isEditing = contact !== null;

  const [error, setError] = useState('');
  const [hasConflict, setHasConflict] = useState(false);

  // Keep the version associated with the values initially loaded.
  // A background refetch must not silently advance the edit version.
  const [editingVersion] = useState(() => contact?.version);

  const {
    register,
    handleSubmit,
    clearErrors,
    setError: setFieldError,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: getDefaultValues(contact),
  });

  async function submit(values) {
    if (hasConflict) {
      return;
    }

    setError('');
    clearErrors();

    const profile = {
      name: values.name.trim(),
      designation: values.designation.trim(),
      department: values.department.trim(),
      phone: values.phone.trim(),
      whatsapp: values.whatsapp.trim(),
      email: values.email.trim().toLowerCase(),
      linkedin: values.linkedin.trim(),
      decision_maker: values.decision_maker,
      notes: values.notes.trim(),
    };

    let savedContact;

    try {
      if (isEditing) {
        savedContact = await updateContact(contact.id, {
          ...profile,
          version: editingVersion,
        });
      } else {
        if (
          companyId === undefined ||
          companyId === null ||
          companyId === ''
        ) {
          setError('Open a company before adding a contact.');
          return;
        }

        savedContact = await createContact({
          ...profile,
          company_id: String(companyId),
        });
      }
    } catch (requestError) {
      if (isEditing && requestError.status === 409) {
        setHasConflict(true);
        setError(
          'This contact was updated after you opened it. ' +
            'Your entries are still visible below. Copy any changes ' +
            'you need to keep, then cancel and reopen the edit form ' +
            'after loading the latest contact details.',
        );
      } else {
        setError(
          requestError.message || 'Unable to save the contact.',
        );
      }

      for (const [field, messages] of Object.entries(
        requestError.errors || {},
      )) {
        if (!Object.prototype.hasOwnProperty.call(defaults, field)) {
          continue;
        }

        const message = Array.isArray(messages)
          ? messages[0]
          : messages;

        if (typeof message === 'string' && message) {
          setFieldError(field, {
            type: 'server',
            message,
          });
        }
      }

      return;
    }

    // API helpers already return result.data.
    if (isEditing) {
      onUpdated?.(savedContact);
    } else {
      onCreated?.(savedContact);
    }
  }

  return (
    <form
      onSubmit={handleSubmit(submit)}
      className="mt-5 rounded-lg border border-line p-4 sm:p-5"
    >
      <h3 className="font-semibold text-ink">
        {isEditing ? 'Edit contact' : 'Add contact'}
      </h3>

      <fieldset disabled={isSubmitting} className="mt-5">
        <div className="grid gap-4 sm:grid-cols-2">
          {fields.map(([name, label, type, maxLength]) => (
            <div key={name}>
              <label
                htmlFor={`contact-${name}`}
                className="text-sm font-medium text-subtle"
              >
                {label}
              </label>

              <input
                id={`contact-${name}`}
                type={type}
                maxLength={maxLength}
                placeholder={
                  name === 'linkedin'
                    ? 'https://www.linkedin.com/in/...'
                    : undefined
                }
                aria-invalid={Boolean(errors[name])}
                aria-describedby={
                  errors[name]
                    ? `contact-error-${name}`
                    : undefined
                }
                className={inputClass}
                {...register(name, {
                  validate:
                    name === 'name'
                      ? (value) =>
                          value.trim().length >= 2 ||
                          'Enter at least two characters.'
                      : undefined,
                })}
              />

              {errors[name] && (
                <p
                  id={`contact-error-${name}`}
                  className="mt-1 text-sm text-danger"
                >
                  {errors[name].message}
                </p>
              )}
            </div>
          ))}

          <div className="sm:col-span-2">
            <label className="flex items-center gap-2 text-sm text-subtle">
              <input
                type="checkbox"
                className="size-4 accent-brand"
                {...register('decision_maker')}
              />
              This contact is a decision-maker
            </label>
          </div>

          <div className="sm:col-span-2">
            <label
              htmlFor="contact-notes"
              className="text-sm font-medium text-subtle"
            >
              Notes
            </label>

            <textarea
              id="contact-notes"
              rows={3}
              maxLength={5000}
              aria-invalid={Boolean(errors.notes)}
              aria-describedby={
                errors.notes ? 'contact-error-notes' : undefined
              }
              className={inputClass}
              {...register('notes')}
            />

            {errors.notes && (
              <p
                id="contact-error-notes"
                className="mt-1 text-sm text-danger"
              >
                {errors.notes.message}
              </p>
            )}
          </div>
        </div>

        {error && (
          <p
            role="alert"
            className="mt-4 rounded-lg bg-danger-soft p-3 text-sm text-[var(--crm-danger-text)]"
          >
            {error}
          </p>
        )}

        <div className="mt-5 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-line-strong px-4 py-2.5 text-sm font-semibold text-subtle"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={isSubmitting || hasConflict}
            className="rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-surface hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting
              ? 'Saving…'
              : isEditing
                ? 'Save changes'
                : 'Create contact'}
          </button>
        </div>
      </fieldset>
    </form>
  );
}