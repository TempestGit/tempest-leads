import apiClient from "../../lib/apiClient.js";

/*
|--------------------------------------------------------------------------
| List Nurture Leads
|--------------------------------------------------------------------------
*/

export const getNurtureRequest =
  async (params = {}) => {
    const response =
      await apiClient.get(
        "/nurture",
        {
          params,
        }
      );

    return response.data;
  };

/*
|--------------------------------------------------------------------------
| Get One Nurture Lead
|--------------------------------------------------------------------------
*/

export const getNurtureLeadRequest =
  async (leadId) => {
    const response =
      await apiClient.get(
        `/nurture/${leadId}`
      );

    return response.data;
  };

/*
|--------------------------------------------------------------------------
| Update Nurture Profile
|--------------------------------------------------------------------------
*/

export const updateNurtureRequest =
  async ({
    leadId,
    data,
  }) => {
    const response =
      await apiClient.patch(
        `/nurture/${leadId}`,
        data
      );

    return response.data;
  };

/*
|--------------------------------------------------------------------------
| Schedule Reconnect
|--------------------------------------------------------------------------
*/

export const scheduleReconnectRequest =
  async ({
    leadId,
    data,
  }) => {
    const response =
      await apiClient.post(
        `/nurture/${leadId}/reconnect`,
        data
      );

    return response.data;
  };