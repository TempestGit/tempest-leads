import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useOutletContext } from 'react-router-dom';

import { fetchCompanies } from './companies.api';
import CompanyForm from './CompanyForm';

export default function CompaniesPage() {
  const { user } = useOutletContext();
  const queryClient = useQueryClient();

  const [showForm, setShowForm] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [filters, setFilters] = useState({
    search: '',
    page: 1,
  });
  const [success, setSuccess] = useState('');

  const query = useQuery({
    queryKey: ['companies', user.id, filters],
    queryFn: ({ signal }) =>
      fetchCompanies({ ...filters, signal }),
  });

  function search(event) {
    event.preventDefault();

    setFilters({
      search: searchInput.trim(),
      page: 1,
    });
  }

  function handleCreated(company) {
    setShowForm(false);
    setSuccess(`${company.name} was created successfully.`);
    setSearchInput('');
    setFilters({ search: '', page: 1 });

    void queryClient.invalidateQueries({
      queryKey: ['companies'],
    });
  }

  const companies = query.data?.data || [];
  const pagination = query.data?.pagination;

  return (
    <div className="mx-auto max-w-7xl text-ink">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink">
            Company Master
          </h1>

          <p className="mt-2 text-sm text-subtle">
            {user.role === 'SUPER_ADMIN'
              ? 'View companies across all account owners.'
              : 'View companies assigned to you.'}
          </p>
        </div>

        {!showForm && (
          <button
            type="button"
            onClick={() => {
              setSuccess('');
              setShowForm(true);
            }}
            className="rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-surface hover:bg-brand-hover"
          >
            Add company
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

      {showForm && (
        <CompanyForm
          onCreated={handleCreated}
          onCancel={() => setShowForm(false)}
        />
      )}

      <form
        onSubmit={search}
        className="mt-6 flex flex-wrap gap-3"
      >
        <label htmlFor="company-search" className="sr-only">
          Search companies
        </label>

        <input
          id="company-search"
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
          placeholder="Search name, company ID, city, or industry"
          maxLength={100}
          className="min-w-0 flex-1 rounded-lg border border-line-strong bg-field px-3 py-2.5 text-sm text-ink placeholder:text-muted"
        />

        <button
          type="submit"
          className="rounded-lg bg-secondary px-4 py-2.5 text-sm font-semibold text-surface hover:bg-secondary-hover"
        >
          Search
        </button>
      </form>

      <section
        className="mt-5 rounded-xl border border-line bg-surface"
        aria-label="Company results"
      >
        {query.isPending ? (
          <p role="status" className="p-6 text-subtle">
            Loading companies…
          </p>
        ) : query.isError ? (
          <div className="p-6">
            <p role="alert" className="text-danger">
              {query.error.message}
            </p>

            {query.error.status === 401 ? (
              <Link
                to="/login"
                className="mt-3 inline-block font-semibold text-action"
              >
                Sign in again
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => query.refetch()}
                disabled={query.isFetching}
                className="mt-3 font-semibold text-action"
              >
                {query.isFetching ? 'Retrying…' : 'Try again'}
              </button>
            )}
          </div>
        ) : companies.length === 0 ? (
          <div className="p-8 text-center">
            <h2 className="font-semibold text-ink">
              No companies found
            </h2>

            <p className="mt-2 text-sm text-subtle">
              {filters.search
                ? 'Try a different search.'
                : 'Use Add company to create your first record.'}
            </p>
          </div>
        ) : (
          <>
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-line bg-[var(--crm-table-header)] text-[var(--crm-table-header-text)]">
                  <tr>
                    {[
                      'Company',
                      'Industry',
                      'City',
                      'Owner',
                      'Status',
                    ].map((heading) => (
                      <th
                        key={heading}
                        scope="col"
                        className="px-5 py-3 font-semibold"
                      >
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="divide-y divide-line">
                  {companies.map((company) => (
                    <tr
                      key={company.id}
                      className="hover:bg-[var(--crm-table-hover)]"
                    >
                      <td className="px-5 py-4">
                        <Link
                          to={`/companies/${company.id}`}
                          className="font-semibold text-action hover:underline"
                        >
                          {company.name}
                        </Link>

                        <p className="mt-1 text-xs text-muted">
                          {company.company_code}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        {company.industry}
                      </td>

                      <td className="px-5 py-4">
                        {company.city || '—'}
                      </td>

                      <td className="px-5 py-4">
                        {company.owner_name}
                      </td>

                      <td className="px-5 py-4">
                        <span className="rounded bg-selected px-2 py-1 text-xs text-subtle">
                          {company.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <ul className="divide-y divide-line md:hidden">
              {companies.map((company) => (
                <li key={company.id} className="p-4">
                  <Link
                    to={`/companies/${company.id}`}
                    className="font-semibold text-action hover:underline"
                  >
                    {company.name}
                  </Link>

                  <p className="mt-1 break-all text-xs text-muted">
                    {company.company_code}
                  </p>

                  <p className="mt-3 text-sm text-subtle">
                    {company.industry} · {company.city || 'No city'}
                  </p>

                  <p className="mt-1 text-sm text-subtle">
                    Owner: {company.owner_name}
                  </p>

                  <p className="mt-2 text-xs font-semibold text-subtle">
                    {company.status}
                  </p>
                </li>
              ))}
            </ul>
          </>
        )}

        {pagination && !query.isError && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line p-4 text-sm">
            <p className="text-subtle">
              {pagination.total} companies · Page {pagination.page} of{' '}
              {pagination.totalPages}
            </p>

            <div className="flex gap-2">
              <button
                type="button"
                disabled={pagination.page <= 1 || query.isFetching}
                onClick={() =>
                  setFilters((current) => ({
                    ...current,
                    page: current.page - 1,
                  }))
                }
                className="rounded-lg border border-line-strong bg-surface px-3 py-2 text-ink disabled:opacity-40"
              >
                Previous
              </button>

              <button
                type="button"
                disabled={
                  pagination.page >= pagination.totalPages ||
                  query.isFetching
                }
                onClick={() =>
                  setFilters((current) => ({
                    ...current,
                    page: current.page + 1,
                  }))
                }
                className="rounded-lg border border-line-strong bg-surface px-3 py-2 text-ink disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}