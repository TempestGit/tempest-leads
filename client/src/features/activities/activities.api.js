import apiClient from "../../lib/apiClient.js";

/*
|--------------------------------------------------------------------------
| Get Activities
|--------------------------------------------------------------------------
*/

export const getActivitiesRequest = async (
  params = {}
) => {
  const response =
    await apiClient.get(
      "/activities",
      {
        params,
      }
    );

  return response.data;
};

/*
|--------------------------------------------------------------------------
| Create Activity
|--------------------------------------------------------------------------
*/

export const createActivityRequest =
  async (data) => {
    const response =
      await apiClient.post(
        "/activities",
        data
      );

    return response.data;
  };