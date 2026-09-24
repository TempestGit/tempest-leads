import apiClient from "../../lib/apiClient.js";

/*
|--------------------------------------------------------------------------
| List Follow-ups
|--------------------------------------------------------------------------
*/

export const getFollowupsRequest =
  async (params = {}) => {
    const response =
      await apiClient.get(
        "/followups",
        {
          params,
        }
      );

    return response.data;
  };

/*
|--------------------------------------------------------------------------
| Schedule Follow-up
|--------------------------------------------------------------------------
*/

export const createFollowupRequest =
  async (data) => {
    const response =
      await apiClient.post(
        "/followups",
        data
      );

    return response.data;
  };

/*
|--------------------------------------------------------------------------
| Complete Follow-up
|--------------------------------------------------------------------------
*/

export const completeFollowupRequest =
  async ({
    followupId,
    data,
  }) => {
    const response =
      await apiClient.patch(
        `/followups/${followupId}/complete`,
        data
      );

    return response.data;
  };

/*
|--------------------------------------------------------------------------
| Reschedule Follow-up
|--------------------------------------------------------------------------
*/

export const rescheduleFollowupRequest =
  async ({
    followupId,
    data,
  }) => {
    const response =
      await apiClient.patch(
        `/followups/${followupId}/reschedule`,
        data
      );

    return response.data;
  };