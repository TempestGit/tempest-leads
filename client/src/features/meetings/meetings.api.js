import apiClient from "../../lib/apiClient.js";

/*
|--------------------------------------------------------------------------
| List Meetings
|--------------------------------------------------------------------------
*/

export const getMeetingsRequest = async (
  params = {}
) => {
  const response =
    await apiClient.get(
      "/meetings",
      {
        params,
      }
    );

  return response.data;
};

/*
|--------------------------------------------------------------------------
| Schedule Meeting
|--------------------------------------------------------------------------
*/

export const createMeetingRequest =
  async (data) => {
    const response =
      await apiClient.post(
        "/meetings",
        data
      );

    return response.data;
  };

/*
|--------------------------------------------------------------------------
| Complete Meeting
|--------------------------------------------------------------------------
*/

export const completeMeetingRequest =
  async ({
    meetingId,
    data,
  }) => {
    const response =
      await apiClient.patch(
        `/meetings/${meetingId}/complete`,
        data
      );

    return response.data;
  };

/*
|--------------------------------------------------------------------------
| Reschedule Meeting
|--------------------------------------------------------------------------
*/

export const rescheduleMeetingRequest =
  async ({
    meetingId,
    data,
  }) => {
    const response =
      await apiClient.patch(
        `/meetings/${meetingId}/reschedule`,
        data
      );

    return response.data;
  };

/*
|--------------------------------------------------------------------------
| Cancel Meeting
|--------------------------------------------------------------------------
*/

export const cancelMeetingRequest =
  async ({
    meetingId,
    data,
  }) => {
    const response =
      await apiClient.patch(
        `/meetings/${meetingId}/cancel`,
        data
      );

    return response.data;
  };

/*
|--------------------------------------------------------------------------
| Mark No-show
|--------------------------------------------------------------------------
*/

export const noShowMeetingRequest =
  async ({
    meetingId,
    data,
  }) => {
    const response =
      await apiClient.patch(
        `/meetings/${meetingId}/no-show`,
        data
      );

    return response.data;
  };