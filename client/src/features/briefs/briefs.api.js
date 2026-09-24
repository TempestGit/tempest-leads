import apiClient from "../../lib/apiClient.js";

/*
|--------------------------------------------------------------------------
| Get Brief
|--------------------------------------------------------------------------
*/

export const getBriefRequest =
  async (
    leadId
  ) => {
    const response =
      await apiClient.get(
        `/briefs/${leadId}`
      );

    return response.data;
  };

/*
|--------------------------------------------------------------------------
| Save Brief
|--------------------------------------------------------------------------
*/

export const saveBriefRequest =
  async ({
    leadId,
    data,
  }) => {
    const response =
      await apiClient.put(
        `/briefs/${leadId}`,
        data
      );

    return response.data;
  };

/*
|--------------------------------------------------------------------------
| Update Status
|--------------------------------------------------------------------------
*/

export const updateBriefStatusRequest =
  async ({
    leadId,
    data,
  }) => {
    const response =
      await apiClient.patch(
        `/briefs/${leadId}/status`,
        data
      );

    return response.data;
  };

/*
|--------------------------------------------------------------------------
| Update Route
|--------------------------------------------------------------------------
*/

export const updateBriefRouteRequest =
  async ({
    leadId,
    data,
  }) => {
    const response =
      await apiClient.patch(
        `/briefs/${leadId}/route`,
        data
      );

    return response.data;
  };