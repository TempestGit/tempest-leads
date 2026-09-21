import { apiRequest } from '../../lib/apiClient';
import { getSession } from '../auth/auth.api';

/*
 * List activities.
 * Omit leadId to fetch activities across permitted leads.
 */
export function fetchActivities({
  leadId,
  activityType,
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

  const optionalFilters = {
    lead_id: leadId,
    activity_type: activityType,
  };

  for (const [key, value] of Object.entries(optionalFilters)) {
    if (value !== undefined && value !== null && value !== '') {
      params.set(key, String(value));
    }
  }

  return apiRequest(`/activities?${params.toString()}`, {
    signal,
  });
}

/*
 * Fetch one activity.
 * Returns the activity directly.
 */
export async function fetchActivity(id, { signal } = {}) {
  const result = await apiRequest(
    `/activities/${encodeURIComponent(String(id))}`,
    { signal },
  );

  return result.data;
}

/*
 * Record an interaction that has already happened.
 * Refresh the session's CSRF token before submitting.
 * Returns the created activity directly.
 */
export async function createActivity(values) {
  await getSession();

  const result = await apiRequest('/activities', {
    method: 'POST',
    body: values,
  });

  return result.data;
}