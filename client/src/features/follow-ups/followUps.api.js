import { apiRequest } from '../../lib/apiClient';
import { getSession } from '../auth/auth.api';

/*
 * List follow-ups.
 *
 * Views:
 * ALL, TODAY, UPCOMING, OVERDUE,
 * COMPLETED, RESCHEDULED, CANCELLED
 */
export function fetchFollowUps({
  view = 'TODAY',
  leadId,
  ownerId,
  search = '',
  page = 1,
  limit = 10,
  signal,
} = {}) {
  const params = new URLSearchParams({
    view,
    search,
    page: String(page),
    limit: String(limit),
  });

  const optionalFilters = {
    lead_id: leadId,
    owner_id: ownerId,
  };

  for (const [key, value] of Object.entries(optionalFilters)) {
    if (value !== undefined && value !== null && value !== '') {
      params.set(key, String(value));
    }
  }

  return apiRequest(`/follow-ups?${params.toString()}`, {
    signal,
  });
}

/*
 * Fetch one follow-up, including its current version.
 * Returns the record directly.
 */
export async function fetchFollowUp(id, { signal } = {}) {
  const result = await apiRequest(
    `/follow-ups/${encodeURIComponent(String(id))}`,
    { signal },
  );

  return result.data;
}

/*
 * Complete the current follow-up and schedule its successor.
 *
 * values:
 * {
 *   version,
 *   outcome,
 *   notes,
 *   next_action,
 *   next_follow_up_at
 * }
 */
export async function completeFollowUp(id, values) {
  await getSession();

  const result = await apiRequest(
    `/follow-ups/${encodeURIComponent(String(id))}/complete`,
    {
      method: 'POST',
      body: values,
    },
  );

  return result.data;
}

/*
 * Preserve the previous schedule and create its successor.
 *
 * values:
 * {
 *   version,
 *   reason,
 *   next_action,
 *   next_follow_up_at
 * }
 */
export async function rescheduleFollowUp(id, values) {
  await getSession();

  const result = await apiRequest(
    `/follow-ups/${encodeURIComponent(String(id))}/reschedule`,
    {
      method: 'POST',
      body: values,
    },
  );

  return result.data;
}