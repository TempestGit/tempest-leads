import { apiRequest } from '../../lib/apiClient';
import { getSession } from '../auth/auth.api';

export function fetchContacts({
  companyId,
  search = '',
  page = 1,
  signal,
}) {
  const params = new URLSearchParams({
    search,
    page: String(page),
    limit: '10',
  });

  if (companyId) {
    params.set('company_id', String(companyId));
  }

  return apiRequest(`/contacts?${params}`, { signal });
}

export async function createContact(values) {
  await getSession();

  return apiRequest('/contacts', {
    method: 'POST',
    body: values,
  });
}