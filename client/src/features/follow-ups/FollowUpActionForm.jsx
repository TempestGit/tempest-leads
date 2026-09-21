import { useId, useState } from 'react';
import { useForm } from 'react-hook-form';

import {
  completeFollowUp,
  rescheduleFollowUp,
} from './followUps.api';

const inputClass =
  'mt-2 w-full min-w-0 rounded-lg border border-line-strong bg-field px-3 py-2.5 text-sm text-ink placeholder:text-muted';

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
  const date = new Date(value);

  if (!value || Number.isNaN(date.getTime())) {
    return '—';
  }

  return `${dateFormatter.format(date)} IST`;
}

function toFutureIso(date, time) {
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

  // Interpret the input as India Standard Time.
  const result = new Date(`${date}T${time}:00+05:30`);

  if (
    Number.isNaN(result.getTime()) ||
    result.getTime() <= Date.now()
  ) {
    return null;
  }

  return result.toISOString();
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

/*
 * mode: 'complete' or 'reschedule'
 *
 * The parent should mount a fresh form for each action session
 * and pass a snapshot of the selected follow-up.
 */
export default function FollowUpActionForm({
  followUp,
  mode = 'complete',
  onSaved,
  onCancel,
}) {
  const formId = useId();

  // Keep the original data and version together while editing.
  const [snapshot] = useState(() => ({
    ...followUp,
  }));

  const [submitError, setSubmitError] = useState('');
  const [hasConflict, setHasConflict] = useState(false);
  const [hasSaved, setHasSaved] = useState(false);

  const isCompletion = mode === 'complete';
  const validMode =
    mode === 'complete' || mode === 'reschedule';

  const canChange =
    snapshot.status === 'PENDING' &&
    ['OPEN', 'NURTURE'].includes(snapshot.lead_status);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      outcome: '',
      notes: '',
      reason: '',
      next_action: isCompletion ? '' : snapshot.action || '',
      next_date: '',
      next_time: '',
    },
  });

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
    if (
      !validMode ||
      !canChange ||
      hasConflict ||
      hasSaved
    ) {
      return;
    }

    setSubmitError('');

    const nextFollowUpAt = toFutureIso(
      values.next_date,
      values.next_time,
    );

    if (!nextFollowUpAt) {
      setError(
        'next_time',
        {
          type: 'validate',
          message: 'Choose a valid future date and time in IST.',
        },
        { shouldFocus: true },
      );
      return;
    }

    if (
      !isCompletion &&
      Date.parse(nextFollowUpAt) === Date.parse(snapshot.due_at)
    ) {
      setError(
        'next_time',
        {
          type: 'validate',
          message: 'Choose a different time when rescheduling.',
        },
        { shouldFocus: true },
      );
      return;
    }

    const commonValues = {
      version: Number(snapshot.version),
      next_action: values.next_action.trim(),
      next_follow_up_at: nextFollowUpAt,
    };

    let result;

    try {
      if (isCompletion) {
        result = await completeFollowUp(snapshot.id, {
          ...commonValues,
          outcome: values.outcome.trim(),
          notes: values.notes.trim(),
        });
      } else {
        result = await rescheduleFollowUp(snapshot.id, {
          ...commonValues,
          reason: values.reason.trim(),
        });
      }
    } catch (error) {
      if (error.status === 409) {
        setHasConflict(true);
        setSubmitError(
          `${error.message || 'This record can no longer be changed.'} ` +
            'Your entries remain visible. Copy anything you need, ' +
            'then cancel and reload the latest record.',
        );
      } else {
        setSubmitError(
          error.message || 'Unable to save the follow-up.',
        );
      }

      const fieldMap = {
        outcome: 'outcome',
        notes: 'notes',
        reason: 'reason',
        next_action: 'next_action',
        next_follow_up_at: 'next_time',
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

    // Prevent another submission while the parent refreshes.
    setHasSaved(true);
    onSaved(result);
  }

  return (
    <form
      noValidate
      onSubmit={handleSubmit(submit)}
      aria-busy={isSubmitting}
      className="mt-5 rounded-xl border border-line bg-surface p-5 sm:p-6"
    >
      <h3 className="text-lg font-semibold text-ink">
        {isCompletion ? 'Complete follow-up' : 'Reschedule follow-up'}
      </h3>

      <div className="mt-4 rounded-lg bg-selected p-4">
        <p className="break-words text-sm font-semibold text-ink">
          {snapshot.company_name}
        </p>

        <p className="mt-2 whitespace-pre-wrap break-words text-sm text-subtle">
          {snapshot.action}
        </p>

        <p className="mt-2 text-xs text-muted">
          Scheduled: {formatDate(snapshot.due_at)}
        </p>
      </div>

      {(!validMode || !canChange) && (
        <p
          role="alert"
          className="mt-4 rounded-lg bg-warning-soft p-3 text-sm text-[var(--crm-warning-text)]"
        >
          {!validMode
            ? 'This follow-up action is not supported.'
            : 'Only pending follow-ups on open or nurture leads can be changed.'}
        </p>
      )}

      <fieldset
        disabled={isSubmitting || hasSaved || !canChange || !validMode}
        className="mt-5"
      >
        <div className="space-y-5">
          {isCompletion ? (
            <>
              <Field
                id={fieldId('outcome')}
                label="Outcome *"
                error={errors.outcome?.message}
              >
                <input
                  {...accessibilityProps('outcome')}
                  maxLength={190}
                  placeholder="For example: Spoke with client; brief requested"
                  className={inputClass}
                  {...register('outcome', {
                    validate: (value) =>
                      value.trim().length >= 2 ||
                      'Enter the follow-up outcome.',
                    maxLength: {
                      value: 190,
                      message: 'Use 190 characters or fewer.',
                    },
                  })}
                />
              </Field>

              <Field
                id={fieldId('notes')}
                label="Completion notes *"
                error={errors.notes?.message}
              >
                <textarea
                  {...accessibilityProps('notes')}
                  rows={4}
                  maxLength={10000}
                  className={inputClass}
                  {...register('notes', {
                    validate: (value) =>
                      value.trim().length >= 2 ||
                      'Describe what happened.',
                    maxLength: {
                      value: 10000,
                      message: 'Use 10000 characters or fewer.',
                    },
                  })}
                />
              </Field>
            </>
          ) : (
            <Field
              id={fieldId('reason')}
              label="Rescheduling reason *"
              error={errors.reason?.message}
            >
              <textarea
                {...accessibilityProps('reason')}
                rows={3}
                maxLength={10000}
                className={inputClass}
                {...register('reason', {
                  validate: (value) =>
                    value.trim().length >= 2 ||
                    'Explain why this follow-up is being rescheduled.',
                  maxLength: {
                    value: 10000,
                    message: 'Use 10000 characters or fewer.',
                  },
                })}
              />
            </Field>
          )}

          <Field
            id={fieldId('next_action')}
            label={isCompletion ? 'Next action *' : 'Rescheduled action *'}
            error={errors.next_action?.message}
          >
            <textarea
              {...accessibilityProps('next_action')}
              rows={3}
              maxLength={500}
              className={inputClass}
              {...register('next_action', {
                validate: (value) =>
                  value.trim().length >= 2 ||
                  'Enter the next action.',
                maxLength: {
                  value: 500,
                  message: 'Use 500 characters or fewer.',
                },
              })}
            />
          </Field>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field
              id={fieldId('next_date')}
              label="Next follow-up date *"
              error={errors.next_date?.message}
            >
              <input
                {...accessibilityProps('next_date')}
                type="date"
                min="1000-01-01"
                max="9999-12-31"
                className={inputClass}
                {...register('next_date', {
                  required: 'Select the next follow-up date.',
                })}
              />
            </Field>

            <Field
              id={fieldId('next_time')}
              label="Next follow-up time (IST) *"
              error={errors.next_time?.message}
            >
              <input
                {...accessibilityProps('next_time')}
                type="time"
                step={60}
                className={inputClass}
                {...register('next_time', {
                  required: 'Select the next follow-up time.',
                })}
              />
            </Field>
          </div>
        </div>

        <p className="mt-3 text-xs text-muted">
          Enter India Standard Time. The previous follow-up remains
          in history, and a new pending follow-up is created.
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
          Follow-up saved successfully.
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
          disabled={
            isSubmitting ||
            hasConflict ||
            hasSaved ||
            !canChange ||
            !validMode
          }
          className={`rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-surface hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-50 ${focusClass}`}
        >
          {isSubmitting
            ? 'Saving…'
            : isCompletion
              ? 'Complete and schedule next'
              : 'Reschedule'}
        </button>
      </div>
    </form>
  );
}