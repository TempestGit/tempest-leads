import { useId, useState } from 'react';
import { useForm } from 'react-hook-form';

import { createActivity } from './activities.api';

const activityTypes = [
  ['CALL', 'Call'],
  ['EMAIL', 'Email'],
  ['WHATSAPP', 'WhatsApp'],
  ['LINKEDIN', 'LinkedIn'],
  ['MEETING', 'Meeting'],
  ['REFERRAL', 'Referral'],
  ['FOLLOW_UP', 'Follow-up'],
  ['NOTE', 'Internal note'],
  ['PITCH', 'Pitch'],
  ['COMMERCIAL_DISCUSSION', 'Commercial discussion'],
  ['CONTRACT', 'Contract'],
  ['ONBOARDING', 'Onboarding'],
  ['OTHER', 'Other'],
];

const inputClass =
  'mt-2 w-full min-w-0 rounded-lg border border-line-strong bg-field px-3 py-2.5 text-sm text-ink placeholder:text-muted';

const focusClass =
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus';

function initialIstTime() {
  const offsetMilliseconds = 330 * 60 * 1000;
  const shifted = new Date(Date.now() + offsetMilliseconds);
  const iso = shifted.toISOString();

  return {
    date: iso.slice(0, 10),
    time: iso.slice(11, 16),
  };
}

function toOccurredAt(date, time) {
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(date || '') ||
    !/^\d{2}:\d{2}$/.test(time || '')
  ) {
    return null;
  }

  const [year, month, day] = date.split('-').map(Number);
  const [hour, minute] = time.split(':').map(Number);

  if (
    year < 1000 ||
    year > 9999 ||
    month < 1 ||
    month > 12 ||
    day < 1 ||
    day > 31 ||
    hour > 23 ||
    minute > 59
  ) {
    return null;
  }

  const calendarDate = new Date(
    Date.UTC(year, month - 1, day),
  );

  if (
    calendarDate.getUTCFullYear() !== year ||
    calendarDate.getUTCMonth() !== month - 1 ||
    calendarDate.getUTCDate() !== day
  ) {
    return null;
  }

  const result = new Date(`${date}T${time}:00+05:30`);

  return Number.isNaN(result.getTime())
    ? null
    : result.toISOString();
}

function Field({ id, label, error, children }) {
  return (
    <div className="min-w-0">
      <label
        htmlFor={id}
        className="block text-sm font-medium text-subtle"
      >
        {label}
      </label>

      {children}

      {error && (
        <p
          id={`${id}-error`}
          role="alert"
          className="mt-1 text-sm text-danger"
        >
          {error}
        </p>
      )}
    </div>
  );
}

export default function ActivityForm({
  lead,
  onCreated,
  onCancel,
}) {
  const formId = useId();
  const [initialTime] = useState(initialIstTime);
  const [submitError, setSubmitError] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      activity_type: 'CALL',
      contact_id: lead.primary_contact_id
        ? String(lead.primary_contact_id)
        : '',
      direction: 'OUTBOUND',
      subject: '',
      notes: '',
      outcome: '',
      occurred_date: initialTime.date,
      occurred_time: initialTime.time,
    },
  });

  const activityType = watch('activity_type');

  function fieldId(name) {
    return `${formId}-${name}`;
  }

  function accessibilityProps(name) {
    return {
      id: fieldId(name),
      'aria-invalid': Boolean(errors[name]),
      'aria-describedby': errors[name]
        ? `${fieldId(name)}-error`
        : undefined,
    };
  }

  async function submit(values) {
    setSubmitError('');

    const subject = values.subject.trim();
    const notes = values.notes.trim();

    if (!subject && !notes) {
      setError(
        'notes',
        {
          type: 'validate',
          message: 'Enter an activity subject or notes.',
        },
        { shouldFocus: true },
      );
      return;
    }

    const occurredAt = toOccurredAt(
      values.occurred_date,
      values.occurred_time,
    );

    if (!occurredAt || Date.parse(occurredAt) > Date.now()) {
      setError(
        'occurred_time',
        {
          type: 'validate',
          message:
            'Enter a valid time in IST that is not in the future.',
        },
        { shouldFocus: true },
      );
      return;
    }

    let activity;

    try {
      activity = await createActivity({
        lead_id: String(lead.id),
        contact_id: values.contact_id || null,
        activity_type: values.activity_type,
        direction:
          values.activity_type === 'NOTE'
            ? null
            : values.direction || null,
        subject,
        notes,
        outcome: values.outcome.trim(),
        occurred_at: occurredAt,
      });
    } catch (error) {
      setSubmitError(
        error.message || 'Unable to save the activity.',
      );

      const fieldMap = {
        activity_type: 'activity_type',
        contact_id: 'contact_id',
        direction: 'direction',
        subject: 'subject',
        notes: 'notes',
        outcome: 'outcome',
        occurred_at: 'occurred_time',
      };

      for (const [field, messages] of Object.entries(
        error.errors || {},
      )) {
        const formField = fieldMap[field];

        if (!formField) {
          continue;
        }

        const message = Array.isArray(messages)
          ? messages[0]
          : messages;

        if (typeof message === 'string' && message) {
          setError(formField, {
            type: 'server',
            message,
          });
        }
      }

      return;
    }

    // The parent closes the form and refreshes the timeline.
    onCreated(activity);
  }

  return (
    <form
      noValidate
      onSubmit={handleSubmit(submit)}
      aria-busy={isSubmitting}
      className="mt-5 rounded-xl border border-line bg-surface p-5 sm:p-6"
    >
      <h3 className="text-lg font-semibold text-ink">
        Record activity
      </h3>

      <p className="mt-2 text-sm text-subtle">
        Record an interaction that has already happened.
        Planned actions belong in follow-ups.
      </p>

      <fieldset disabled={isSubmitting} className="mt-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field
            id={fieldId('activity_type')}
            label="Activity type *"
            error={errors.activity_type?.message}
          >
            <select
              {...accessibilityProps('activity_type')}
              className={inputClass}
              {...register('activity_type', {
                required: 'Select an activity type.',
                onChange: (event) => {
                  if (event.target.value === 'NOTE') {
                    setValue('direction', '', {
                      shouldDirty: true,
                    });
                    clearErrors('direction');
                  }
                },
              })}
            >
              {activityTypes.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </Field>

          <Field
            id={fieldId('contact_id')}
            label="Related contact"
            error={errors.contact_id?.message}
          >
            <select
              {...accessibilityProps('contact_id')}
              className={inputClass}
              {...register('contact_id')}
            >
              <option value="">General lead activity</option>

              {lead.primary_contact_id && (
                <option value={String(lead.primary_contact_id)}>
                  {lead.contact_name || 'Primary contact'}
                </option>
              )}
            </select>
          </Field>

          <Field
            id={fieldId('direction')}
            label="Direction"
            error={errors.direction?.message}
          >
            <select
              {...accessibilityProps('direction')}
              disabled={isSubmitting || activityType === 'NOTE'}
              className={inputClass}
              {...register('direction')}
            >
              <option value="">Not applicable</option>
              <option value="OUTBOUND">Outbound</option>
              <option value="INBOUND">Inbound</option>
            </select>
          </Field>

          <Field
            id={fieldId('outcome')}
            label="Outcome"
            error={errors.outcome?.message}
          >
            <input
              {...accessibilityProps('outcome')}
              maxLength={50}
              placeholder="For example: Connected or No response"
              className={inputClass}
              {...register('outcome', {
                maxLength: {
                  value: 50,
                  message: 'Use 50 characters or fewer.',
                },
              })}
            />
          </Field>

          <div className="sm:col-span-2">
            <Field
              id={fieldId('subject')}
              label="Subject"
              error={errors.subject?.message}
            >
              <input
                {...accessibilityProps('subject')}
                maxLength={190}
                className={inputClass}
                {...register('subject', {
                  maxLength: {
                    value: 190,
                    message: 'Use 190 characters or fewer.',
                  },
                })}
              />
            </Field>
          </div>

          <div className="sm:col-span-2">
            <Field
              id={fieldId('notes')}
              label="Notes"
              error={errors.notes?.message}
            >
              <textarea
                {...accessibilityProps('notes')}
                rows={4}
                maxLength={10000}
                placeholder="Describe what happened."
                className={inputClass}
                {...register('notes', {
                  maxLength: {
                    value: 10000,
                    message: 'Use 10000 characters or fewer.',
                  },
                })}
              />
            </Field>
          </div>

          <Field
            id={fieldId('occurred_date')}
            label="Activity date *"
            error={errors.occurred_date?.message}
          >
            <input
              {...accessibilityProps('occurred_date')}
              type="date"
              min="1000-01-01"
              max="9999-12-31"
              className={inputClass}
              {...register('occurred_date', {
                required: 'Select the activity date.',
              })}
            />
          </Field>

          <Field
            id={fieldId('occurred_time')}
            label="Activity time (IST) *"
            error={errors.occurred_time?.message}
          >
            <input
              {...accessibilityProps('occurred_time')}
              type="time"
              step={60}
              className={inputClass}
              {...register('occurred_time', {
                required: 'Select the activity time.',
              })}
            />
          </Field>
        </div>

        <p className="mt-3 text-xs text-muted">
          Enter India Standard Time, regardless of your device timezone.
          Provide at least a subject or notes.
        </p>

        {submitError && (
          <p
            role="alert"
            className="mt-5 rounded-lg bg-danger-soft p-3 text-sm text-[var(--crm-danger-text)]"
          >
            {submitError}
          </p>
        )}

        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className={`rounded-lg border border-line-strong bg-surface px-4 py-2.5 text-sm font-semibold text-subtle hover:bg-surface-hover ${focusClass}`}
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className={`rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-surface hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-50 ${focusClass}`}
          >
            {isSubmitting ? 'Saving…' : 'Save activity'}
          </button>
        </div>
      </fieldset>
    </form>
  );
}