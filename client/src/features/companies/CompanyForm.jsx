import { useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  createCompany,
  updateCompany,
} from './companies.api';

const fields = [
  ['name', 'Company / brand name', 190, true],
  ['industry', 'Industry', 100, true],
  ['sub_industry', 'Sub-industry', 100],
  ['city', 'City', 100],
  ['geography', 'Geography', 150],
  ['website', 'Website', 500],
  ['existing_agency', 'Existing agency', 190],
  ['lead_source', 'Lead source', 100],
];

const defaults = {
  name: '',
  industry: '',
  sub_industry: '',
  city: '',
  geography: '',
  website: '',
  existing_agency: '',
  lead_source: '',
  marketing_activity: '',
  potential_requirement: '',
  reconnect_date: '',
};

const inputClass =
  'mt-2 w-full rounded-lg border border-line-strong bg-surface px-3 py-2.5 text-ink focus:border-focus focus:outline-none focus:ring-2 focus:ring-brand-soft';

export default function CompanyForm({
  company = null,
  onCreated,
  onUpdated,
  onCancel,
}) {
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    setError: setFieldError,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: Object.fromEntries(
        Object.keys(defaults).map((key) => [
            key,
            company?.[key] ?? defaults[key],
        ]),
    ),
  });

async function submit(values) {
  setError('');

  let result;

  try {
    result = company
      ? await updateCompany(company.id, {
          ...values,
          version: company.version,
        })
      : await createCompany(values);
  } catch (requestError) {
    setError(requestError.message);

    for (const [field, messages] of Object.entries(
      requestError.errors || {},
    )) {
      if (field in defaults && messages?.length) {
        setFieldError(field, {
          type: 'server',
          message: messages[0],
        });
      }
    }

    return;
  }

  if (company) {
    onUpdated(result.data);
  } else {
    onCreated(result.data);
  }
}

  return (
    <section className="mt-6 rounded-xl border border-line bg-surface p-5 sm:p-6">
        <h2 className="text-lg font-semibold text-ink">
            {company ? 'Edit company' : 'Add company'}
        </h2>

        <p className="mt-2 text-sm text-subtle">
            {company
                ? 'Update the company information. Fields marked * are required.'
                : 'You will be assigned as the account owner. Fields marked * are required.'}
        </p>

      <form onSubmit={handleSubmit(submit)} className="mt-6">
        <fieldset disabled={isSubmitting}>
          <div className="grid gap-5 sm:grid-cols-2">
            {fields.map(([name, label, maxLength, required]) => (
              <div key={name}>
                <label
                  htmlFor={`company-${name}`}
                  className="text-sm font-medium text-subtle"
                >
                  {label}{required ? ' *' : ''}
                </label>

                <input
                  id={`company-${name}`}
                  type={name === 'website' ? 'url' : 'text'}
                  placeholder={
                    name === 'website' ? 'https://example.com' : ''
                  }
                  maxLength={maxLength}
                  aria-invalid={Boolean(errors[name])}
                  aria-describedby={
                    errors[name] ? `error-${name}` : undefined
                  }
                  className={inputClass}
                  {...register(name, {
                    validate: required
                      ? (value) =>
                          value.trim().length >= 2 ||
                          'Enter at least two characters.'
                      : undefined,
                  })}
                />

                {errors[name] && (
                  <p
                    id={`error-${name}`}
                    className="mt-1 text-sm text-danger"
                  >
                    {errors[name].message}
                  </p>
                )}
              </div>
            ))}

            <div>
              <label
                htmlFor="company-reconnect"
                className="text-sm font-medium text-subtle"
              >
                Reconnect date
              </label>

              <input
                id="company-reconnect"
                type="date"
                className={inputClass}
                {...register('reconnect_date')}
              />

              {errors.reconnect_date && (
                <p className="mt-1 text-sm text-danger">
                  {errors.reconnect_date.message}
                </p>
              )}
            </div>

            {[
              ['marketing_activity', 'Current marketing activity'],
              ['potential_requirement', 'Potential requirement'],
            ].map(([name, label]) => (
              <div key={name} className="sm:col-span-2">
                <label
                  htmlFor={`company-${name}`}
                  className="text-sm font-medium text-subtle"
                >
                  {label}
                </label>

                <textarea
                  id={`company-${name}`}
                  rows={3}
                  maxLength={5000}
                  className={inputClass}
                  {...register(name)}
                />

                {errors[name] && (
                  <p className="mt-1 text-sm text-danger">
                    {errors[name].message}
                  </p>
                )}
              </div>
            ))}
          </div>

          {error && (
            <p
              role="alert"
              className="mt-5 rounded-lg bg-danger-soft p-3 text-sm text-[var(--crm-danger-text)]"
            >
              {error}
            </p>
          )}

          <div className="mt-6 flex flex-wrap justify-end gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="rounded-lg border border-line-strong px-4 py-2.5 text-sm font-semibold text-subtle"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-surface hover:bg-brand-hover disabled:opacity-50"
            >
              {isSubmitting
                ? 'Saving…'
                : company
                    ? 'Save changes'
                    : 'Create company'}
            </button>
          </div>
        </fieldset>
      </form>
    </section>
  );
}