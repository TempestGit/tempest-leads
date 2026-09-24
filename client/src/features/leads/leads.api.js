import apiClient from "../../lib/apiClient.js";

/*
|--------------------------------------------------------------------------
| List Leads
|--------------------------------------------------------------------------
*/

export const getLeadsRequest = async (
  params = {}
) => {
  const response =
    await apiClient.get(
      "/leads",
      {
        params,
      }
    );

  return response.data;
};

/*
|--------------------------------------------------------------------------
| Lead Options
|--------------------------------------------------------------------------
*/

export const getLeadOptionsRequest =
  async () => {
    const response =
      await apiClient.get(
        "/leads/options"
      );

    return response.data;
  };

/*
|--------------------------------------------------------------------------
| Get Lead
|--------------------------------------------------------------------------
*/

export const getLeadRequest = async (
  leadId
) => {
  const response =
    await apiClient.get(
      `/leads/${leadId}`
    );

  return response.data;
};

/*
|--------------------------------------------------------------------------
| Create Lead
|--------------------------------------------------------------------------
*/

export const createLeadRequest =
  async (data) => {
    const response =
      await apiClient.post(
        "/leads",
        data
      );

    return response.data;
  };

/*
|--------------------------------------------------------------------------
| Update Lead
|--------------------------------------------------------------------------
*/

export const updateLeadRequest =
  async ({
    leadId,
    data,
  }) => {
    const response =
      await apiClient.patch(
        `/leads/${leadId}`,
        data
      );

    return response.data;
  };

/*
|--------------------------------------------------------------------------
| Change Stage
|--------------------------------------------------------------------------
*/

export const changeLeadStageRequest =
  async ({
    leadId,
    data,
  }) => {
    const response =
      await apiClient.patch(
        `/leads/${leadId}/stage`,
        data
      );

    return response.data;
  };

/*
|--------------------------------------------------------------------------
| Change Owner
|--------------------------------------------------------------------------
*/

export const changeLeadOwnerRequest =
  async ({
    leadId,
    data,
  }) => {
    const response =
      await apiClient.patch(
        `/leads/${leadId}/owner`,
        data
      );

    return response.data;
  };