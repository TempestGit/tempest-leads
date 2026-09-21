import { apiRequest } from '../../lib/apiClient';
import { getSession } from '../auth/auth.api';

/*
 * List contacts.
 * Used by Contact Master and the company contacts panel.
 */
export function fetchContacts({
  companyId,
  search = '',
  page = 1,
  limit = 10,
  signal,
} = {}) {
  const params = new URLSearchParams({
    search,
    page: String(page),
    limit: String(limit),
  });

  if (companyId !== undefined && companyId !== null && companyId !== '') {
    params.set('company_id', String(companyId));
  }

  return apiRequest(`/contacts?${params.toString()}`, {
    signal,
  });
}

/*
 * Load one contact, including its current record version.
 */
export async function fetchContact(id, { signal } = {}) {
  const result = await apiRequest(
    `/contacts/${encodeURIComponent(String(id))}`,
    { signal },
  );

  return result.data;
}

/*
 * Create a contact.
 * getSession refreshes the CSRF token used by apiRequest.
 */
export async function createContact(values) {
  await getSession();

  const result = await apiRequest('/contacts', {
    method: 'POST',
    body: values,
  });

  return result.data;
}

/*
 * Update the complete editable profile.
 * values must include the version originally loaded for editing.
 *
 * An outdated version produces an ApiError with status 409.
 */
export async function updateContact(id, values) {
  await getSession();

  const result = await apiRequest(
    `/contacts/${encodeURIComponent(String(id))}`,
    {
      method: 'PUT',
      body: values,
    },
  );

  return result.data;
}