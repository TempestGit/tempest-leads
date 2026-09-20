import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';

import ContactForm from './ContactForm';
import ContactsPage from './ContactsPage';

export default function CompanyContactsPanel({ companyId }) {
  const queryClient = useQueryClient();

  const [showForm, setShowForm] = useState(false);
  const [success, setSuccess] = useState('');
  const [listVersion, setListVersion] = useState(0);

  function handleCreated(contact) {
    setShowForm(false);
    setSuccess(`${contact.name} was added successfully.`);

    // Reset search/pagination so the newly added contact is visible.
    setListVersion((value) => value + 1);

    void queryClient.invalidateQueries({
      queryKey: ['contacts'],
    });
  }

  return (
    <section className="mt-6 rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-slate-900">
          Company contacts
        </h2>

        {!showForm && (
          <button
            type="button"
            onClick={() => {
              setSuccess('');
              setShowForm(true);
            }}
            className="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700"
          >
            Add contact
          </button>
        )}
      </div>

      {success && (
        <p
          role="status"
          className="mt-4 rounded-lg bg-green-50 p-3 text-sm text-green-800"
        >
          {success}
        </p>
      )}

      {showForm && (
        <ContactForm
          companyId={companyId}
          onCreated={handleCreated}
          onCancel={() => setShowForm(false)}
        />
      )}

      <div className="mt-5">
        <ContactsPage
          key={`${companyId}-${listVersion}`}
          companyId={companyId}
        />
      </div>
    </section>
  );
}