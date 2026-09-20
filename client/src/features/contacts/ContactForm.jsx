import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { createContact } from './contacts.api';

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
  'mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm';

export default function ContactForm({
  companyId,
  onCreated,
  onCancel,
}) {
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    setError: setFieldError,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: defaults,
  });

  async function submit(values) {
    setError('');

    let result;

    try {
      result = await createContact({
        ...values,
        company_id: String(companyId),
      });
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

    onCreated(result.data);
  }

  return (
    <form
      onSubmit={handleSubmit(submit)}
      className="mt-5 rounded-lg border border-slate-200 p-4 sm:p-5"
    >
      <h3 className="font-semibold text-slate-900">
        Add contact
      </h3>

      <fieldset disabled={isSubmitting} className="mt-5">
        <div className="grid gap-4 sm:grid-cols-2">
          {fields.map(([name, label, type, maxLength]) => (
            <div key={name}>
              <label
                htmlFor={`contact-${name}`}
                className="text-sm font-medium text-slate-700"
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
                  errors[name] ? `contact-error-${name}` : undefined
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
                  className="mt-1 text-sm text-red-600"
                >
                  {errors[name].message}
                </p>
              )}
            </div>
          ))}

          <div className="sm:col-span-2">
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                className="size-4"
                {...register('decision_maker')}
              />
              This contact is a decision-maker
            </label>
          </div>

          <div className="sm:col-span-2">
            <label
              htmlFor="contact-notes"
              className="text-sm font-medium text-slate-700"
            >
              Notes
            </label>

            <textarea
              id="contact-notes"
              rows={3}
              maxLength={5000}
              className={inputClass}
              {...register('notes')}
            />

            {errors.notes && (
              <p className="mt-1 text-sm text-red-600">
                {errors.notes.message}
              </p>
            )}
          </div>
        </div>

        {error && (
          <p
            role="alert"
            className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700"
          >
            {error}
          </p>
        )}

        <div className="mt-5 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold"
          >
            Cancel
          </button>

          <button
            type="submit"
            className="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
          >
            {isSubmitting ? 'Saving…' : 'Create contact'}
          </button>
        </div>
      </fieldset>
    </form>
  );
}