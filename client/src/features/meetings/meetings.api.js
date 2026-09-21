import { apiRequest } from '../../lib/apiClient';
import { getSession } from '../auth/auth.api';

/*
 * List meetings.
 *
 * Views:
 * ALL, TODAY, UPCOMING, PAST_DUE,
 * COMPLETED, RESCHEDULED, CANCELLED, NO_SHOW
 */
export function fetchMeetings({
  view = 'TODAY',
  leadId,
  ownerId,
  meetingType,
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
    meeting_type: meetingType,
  };

  for (const [key, value] of Object.entries(optionalFilters)) {
    if (value !== undefined && value !== null && value !== '') {
      params.set(key, String(value));
    }
  }

  return apiRequest(`/meetings?${params.toString()}`, {
    signal,
  });
}

/*
 * Fetch one meeting, including its participants.
 * Returns the meeting directly.
 */
export async function fetchMeeting(id, { signal } = {}) {
  const result = await apiRequest(
    `/meetings/${encodeURIComponent(String(id))}`,
    { signal },
  );

  return result.data;
}

/*
 * Schedule a meeting.
 * Refresh the session's CSRF token before submitting.
 * Returns the created meeting directly.
 *
 * Scheduling does not send invitations.
 */
export async function createMeeting(values) {
  await getSession();

  const result = await apiRequest('/meetings', {
    method: 'POST',
    body: values,
  });

  return result.data;
}