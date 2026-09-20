import { apiRequest } from '../../lib/apiClient';
import { getSession } from '../auth/auth.api';

export function fetchCompanies({ search, page, signal }) {
  const params = new URLSearchParams({
    search,
    page: String(page),
    limit: '10',
  });

  return apiRequest(`/companies?${params}`, { signal });
}

export function fetchCompany(id, { signal } = {}) {
  return apiRequest(`/companies/${encodeURIComponent(id)}`, {
    signal,
  });
}

export async function createCompany(values) {
  await getSession();

  return apiRequest('/companies', {
    method: 'POST',
    body: values,
  });
}

export async function updateCompany(id, values) {
  await getSession();

  return apiRequest(`/companies/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: values,
  });
}