import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Link,
  useOutletContext,
  useParams,
} from 'react-router-dom';

import { fetchCompany } from './companies.api';
import CompanyForm from './CompanyForm';
import CompanyContactsPanel from '../contacts/CompanyContactsPanel';

function formatTimestamp(value) {
  if (!value) return '—';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return '—';

  return date.toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

function formatDate(value) {
  if (!value) return '—';

  const [year, month, day] = value.split('-');

  return `${day}/${month}/${year}`;
}

export default function CompanyDetailPage() {
  const { id } = useParams();
  const { user } = useOutletContext();
  const queryClient = useQueryClient();

  const [editingCompany, setEditingCompany] = useState(null);
  const [success, setSuccess] = useState('');

  const queryKey = ['company', user.id, id];

  const query = useQuery({
    queryKey,
    queryFn: ({ signal }) => fetchCompany(id, { signal }),
  });

  function handleUpdated(company) {
    queryClient.setQueryData(queryKey, { data: company });

    void queryClient.invalidateQueries({
      queryKey: ['companies'],
    });

    setEditingCompany(null);
    setSuccess('Company details updated successfully.');
  }

  function cancelEditing() {
    setEditingCompany(null);

    // Retrieve the latest version, including another user's edits.
    void query.refetch();
  }

  const backLink = (
    <Link
      to="/companies"
      className="inline-block text-sm font-semibold text-action hover:underline"
    >
      ← Back to companies
    </Link>
  );

  if (query.isPending) {
    return (
      <div>
        {backLink}
        <p role="status" className="mt-6 text-slate-600">
          Loading company details…
        </p>
      </div>
    );
  }

  if (query.isError) {
    return (
      <div>
        {backLink}

        <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6">
          <p role="alert" className="text-red-700">
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

  const company = query.data.data;

  const fields = [
    ['Industry', company.industry],
    ['Sub-industry', company.sub_industry],
    ['City', company.city],
    ['Geography', company.geography],
    ['Existing agency', company.existing_agency],
    ['Lead source', company.lead_source],
    ['Account owner', company.owner_name],
    ['Status', company.status],
    ['Reconnect date', formatDate(company.reconnect_date)],
    ['Created by', company.created_by_name],
    ['Created — IST', formatTimestamp(company.created_at)],
    ['Updated — IST', formatTimestamp(company.updated_at)],
  ];

  return (
    <div className="mx-auto max-w-7xl">
      {backLink}

      <div className="mt-5 flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="break-words text-2xl font-bold text-slate-900">
            {company.name}
          </h1>

          <p className="mt-2 break-all text-xs text-slate-500">
            {company.company_code}
          </p>
        </div>

        {!editingCompany && (
          <button
            type="button"
            onClick={() => {
              setSuccess('');
              setEditingCompany({ ...company });
            }}
            className="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700"
          >
            Edit company
          </button>
        )}
      </div>

      {success && (
        <p
          role="status"
          className="mt-5 rounded-lg bg-green-50 p-3 text-sm text-green-800"
        >
          {success}
        </p>
      )}

      {editingCompany ? (
        <CompanyForm
          key={`${editingCompany.id}-${editingCompany.version}`}
          company={editingCompany}
          onUpdated={handleUpdated}
          onCancel={cancelEditing}
        />
      ) : (
        <section className="mt-6 rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
          <h2 className="text-lg font-semibold text-slate-900">
            Company information
          </h2>

          <dl className="mt-5 grid gap-x-8 gap-y-5 sm:grid-cols-2">
            {fields.map(([label, value]) => (
              <div key={label} className="min-w-0">
                <dt className="text-xs font-medium text-slate-500">
                  {label}
                </dt>

                <dd className="mt-1 break-words text-sm text-slate-900">
                  {value || '—'}
                </dd>
              </div>
            ))}

            <div className="min-w-0 sm:col-span-2">
              <dt className="text-xs font-medium text-slate-500">
                Website
              </dt>

              <dd className="mt-1 break-all text-sm">
                {company.website ? (
                  <a
                    href={company.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-action hover:underline"
                  >
                    {company.website}
                  </a>
                ) : (
                  '—'
                )}
              </dd>
            </div>

            {[
              ['Current marketing activity', company.marketing_activity],
              ['Potential requirement', company.potential_requirement],
            ].map(([label, value]) => (
              <div key={label} className="min-w-0 sm:col-span-2">
                <dt className="text-xs font-medium text-slate-500">
                  {label}
                </dt>

                <dd className="mt-1 text-sm whitespace-pre-wrap break-words text-slate-900">
                  {value || '—'}
                </dd>
              </div>
            ))}
          </dl>
        </section>
      )}
      {!editingCompany && (
        <CompanyContactsPanel companyId={company.id} />
      )}
    </div>
  );
}