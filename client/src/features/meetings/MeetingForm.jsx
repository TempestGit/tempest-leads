import { useId, useState } from 'react';
import { useForm } from 'react-hook-form';

import { createMeeting } from './meetings.api';

const inputClass =
  'mt-2 w-full min-w-0 rounded-lg border border-line-strong bg-field px-3 py-2.5 text-sm text-ink placeholder:text-muted';

const focusClass =
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus';

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

/*
 * Convert an explicitly entered IST date/time to UTC.
 * Browser timezone does not affect this conversion.
 */
function toUtcIso(date, time) {
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

function isValidMeetingUrl(value) {
  try {
    const url = new URL(value);

    return (
      url.protocol === 'https:' &&
      !url.username &&
      !url.password
    );
  } catch {
    return false;
  }
}

/*
 * The parent should mount a fresh form for each scheduling session
 * and when navigating to another lead.
 */
export default function MeetingForm({
  lead,
  onCreated,
  onCancel,
}) {
  const formId = useId();

  const [submitError, setSubmitError] = useState('');
  const [hasSaved, setHasSaved] = useState(false);

  const canSchedule =
    ['OPEN', 'NURTURE'].includes(lead.status) &&
    Boolean(lead.primary_contact_id);

  const {
    register,
    handleSubmit,
    watch,
    getValues,
    setValue,
    clearErrors,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      title: '',
      meeting_type: 'VIDEO_CALL',
      start_date: '',
      start_time: '',
      end_date: '',
      end_time: '',
      location: '',
      meeting_url: '',
      agenda: '',
    },
  });

  const meetingType = watch('meeting_type');

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

  function flagError(field, message) {
    setError(
      field,
      {
        type: 'validate',
        message,
      },
      { shouldFocus: true },
    );
  }

  async function submit(values) {
    if (!canSchedule || hasSaved) {
      return;
    }

    setSubmitError('');

    const startsAt = toUtcIso(
      values.start_date,
      values.start_time,
    );

    const endsAt = toUtcIso(
      values.end_date,
      values.end_time,
    );

    if (!startsAt || Date.parse(startsAt) <= Date.now()) {
      flagError(
        'start_time',
        'Choose a valid future start date and time in IST.',
      );
      return;
    }

    if (!endsAt || Date.parse(endsAt) <= Date.parse(startsAt)) {
      flagError(
        'end_time',
        'Meeting end must be after its start date and time.',
      );
      return;
    }

    const location =
      values.meeting_type === 'IN_PERSON'
        ? values.location.trim()
        : '';

    const meetingUrl =
      values.meeting_type === 'VIDEO_CALL'
        ? values.meeting_url.trim()
        : '';

    let meeting;

    try {
      meeting = await createMeeting({
        lead_id: String(lead.id),
        contact_id: String(lead.primary_contact_id),
        title: values.title.trim(),
        meeting_type: values.meeting_type,
        starts_at: startsAt,
        ends_at: endsAt,
        location,
        meeting_url: meetingUrl,
        agenda: values.agenda.trim(),

        // Owner and primary contact are added by the server.
        participants: [],
      });
    } catch (error) {
      setSubmitError(
        error.message || 'Unable to schedule the meeting.',
      );

      const fieldMap = {
        title: 'title',
        meeting_type: 'meeting_type',
        starts_at: 'start_time',
        ends_at: 'end_time',
        location: 'location',
        meeting_url: 'meeting_url',
        agenda: 'agenda',
      };

      for (const [field, messages] of Object.entries(
        error.errors || {},
      )) {
        const message = Array.isArray(messages)
          ? messages[0]
          : messages;

        if (typeof message !== 'string' || !message) {
          continue;
        }

        if (fieldMap[field]) {
          setError(fieldMap[field], {
            type: 'server',
            message,
          });
        } else {
          // Show errors for server-managed contact/participant fields.
          setSubmitError(message);
        }
      }

      return;
    }

    setHasSaved(true);
    onCreated(meeting);
  }

  return (
    <form
      noValidate
      onSubmit={handleSubmit(submit)}
      aria-busy={isSubmitting}
      className="mt-5 rounded-xl border border-line bg-surface p-5 sm:p-6"
    >
      <h3 className="text-lg font-semibold text-ink">
        Schedule meeting
      </h3>

      <div className="mt-4 rounded-lg bg-selected p-4">
        <p className="break-words text-sm font-semibold text-ink">
          {lead.company_name}
        </p>

        <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
          <div className="min-w-0">
            <dt className="text-xs text-muted">Primary contact</dt>
            <dd className="mt-1 break-words text-subtle">
              {lead.contact_name || '—'}
            </dd>
          </div>

          <div className="min-w-0">
            <dt className="text-xs text-muted">Meeting owner</dt>
            <dd className="mt-1 break-words text-subtle">
              {lead.owner_name || '—'}
            </dd>
          </div>
        </dl>
      </div>

      {!canSchedule && (
        <p
          role="alert"
          className="mt-4 rounded-lg bg-warning-soft p-3 text-sm text-[var(--crm-warning-text)]"
        >
          Meetings can be scheduled only for open or nurture leads
          with a primary contact.
        </p>
      )}

      <fieldset
        disabled={isSubmitting || hasSaved || !canSchedule}
        className="mt-5"
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Field
              id={fieldId('title')}
              label="Meeting title *"
              error={errors.title?.message}
            >
              <input
                {...accessibilityProps('title')}
                maxLength={190}
                placeholder="For example: Discovery meeting"
                className={inputClass}
                {...register('title', {
                  validate: (value) =>
                    value.trim().length >= 2 ||
                    'Enter a meeting title.',
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
              id={fieldId('meeting_type')}
              label="Meeting type *"
              error={errors.meeting_type?.message}
            >
              <select
                {...accessibilityProps('meeting_type')}
                className={inputClass}
                {...register('meeting_type', {
                  required: 'Select a meeting type.',
                  onChange: () => {
                    clearErrors(['location', 'meeting_url']);
                  },
                })}
              >
                <option value="VIDEO_CALL">Video call</option>
                <option value="IN_PERSON">In person</option>
                <option value="PHONE_CALL">Phone call</option>
              </select>
            </Field>
          </div>

          <Field
            id={fieldId('start_date')}
            label="Start date *"
            error={errors.start_date?.message}
          >
            <input
              {...accessibilityProps('start_date')}
              type="date"
              min="1000-01-01"
              max="9999-12-31"
              className={inputClass}
              {...register('start_date', {
                required: 'Select the start date.',
                onChange: (event) => {
                  if (!getValues('end_date')) {
                    setValue('end_date', event.target.value, {
                      shouldDirty: true,
                    });
                  }
                },
              })}
            />
          </Field>

          <Field
            id={fieldId('start_time')}
            label="Start time (IST) *"
            error={errors.start_time?.message}
          >
            <input
              {...accessibilityProps('start_time')}
              type="time"
              step={60}
              className={inputClass}
              {...register('start_time', {
                required: 'Select the start time.',
              })}
            />
          </Field>

          <Field
            id={fieldId('end_date')}
            label="End date *"
            error={errors.end_date?.message}
          >
            <input
              {...accessibilityProps('end_date')}
              type="date"
              min="1000-01-01"
              max="9999-12-31"
              className={inputClass}
              {...register('end_date', {
                required: 'Select the end date.',
              })}
            />
          </Field>

          <Field
            id={fieldId('end_time')}
            label="End time (IST) *"
            error={errors.end_time?.message}
          >
            <input
              {...accessibilityProps('end_time')}
              type="time"
              step={60}
              className={inputClass}
              {...register('end_time', {
                required: 'Select the end time.',
              })}
            />
          </Field>

          {meetingType === 'IN_PERSON' && (
            <div className="sm:col-span-2">
              <Field
                id={fieldId('location')}
                label="Location *"
                error={errors.location?.message}
              >
                <input
                  {...accessibilityProps('location')}
                  maxLength={500}
                  className={inputClass}
                  {...register('location', {
                    validate: (value) =>
                      getValues('meeting_type') !== 'IN_PERSON' ||
                      Boolean(value.trim()) ||
                      'Enter the meeting location.',
                  })}
                />
              </Field>
            </div>
          )}

          {meetingType === 'VIDEO_CALL' && (
            <div className="sm:col-span-2">
              <Field
                id={fieldId('meeting_url')}
                label="Meeting link *"
                error={errors.meeting_url?.message}
              >
                <input
                  {...accessibilityProps('meeting_url')}
                  type="url"
                  maxLength={2000}
                  placeholder="https://..."
                  className={inputClass}
                  {...register('meeting_url', {
                    validate: (value) =>
                      getValues('meeting_type') !== 'VIDEO_CALL' ||
                      isValidMeetingUrl(value.trim()) ||
                      'Enter a valid HTTPS meeting link without embedded credentials.',
                  })}
                />
              </Field>
            </div>
          )}

          <div className="sm:col-span-2">
            <Field
              id={fieldId('agenda')}
              label="Agenda"
              error={errors.agenda?.message}
            >
              <textarea
                {...accessibilityProps('agenda')}
                rows={4}
                maxLength={10000}
                placeholder="Topics and objectives for the meeting"
                className={inputClass}
                {...register('agenda', {
                  maxLength: {
                    value: 10000,
                    message: 'Use 10000 characters or fewer.',
                  },
                })}
              />
            </Field>
          </div>
        </div>

        <p className="mt-3 text-xs text-muted">
          Enter India Standard Time, regardless of your device timezone.
          Scheduling saves the meeting; it does not send invitations.
        </p>
      </fieldset>

      {submitError && (
        <p
          role="alert"
          className="mt-5 rounded-lg bg-danger-soft p-3 text-sm text-[var(--crm-danger-text)]"
        >
          {submitError}
        </p>
      )}

      {hasSaved && (
        <p
          role="status"
          className="mt-5 rounded-lg bg-success-soft p-3 text-sm text-[var(--crm-success-text)]"
        >
          Meeting scheduled successfully.
        </p>
      )}

      <div className="mt-6 flex flex-wrap justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className={`rounded-lg border border-line-strong bg-surface px-4 py-2.5 text-sm font-semibold text-subtle hover:bg-surface-hover disabled:opacity-50 ${focusClass}`}
        >
          {hasSaved ? 'Close' : 'Cancel'}
        </button>

        <button
          type="submit"
          disabled={isSubmitting || hasSaved || !canSchedule}
          className={`rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-surface hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-50 ${focusClass}`}
        >
          {isSubmitting ? 'Scheduling…' : 'Schedule meeting'}
        </button>
      </div>
    </form>
  );
}