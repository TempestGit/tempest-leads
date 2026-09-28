import apiClient from "../../lib/apiClient.js";

/*
|--------------------------------------------------------------------------
| List Users
|--------------------------------------------------------------------------
*/

export const getUsersRequest =
  async (
    params = {}
  ) => {
    const response =
      await apiClient.get(
        "/users",
        {
          params,
        }
      );

    return response.data;
  };

/*
|--------------------------------------------------------------------------
| Options
|--------------------------------------------------------------------------
*/

export const getUserOptionsRequest =
  async () => {
    const response =
      await apiClient.get(
        "/users/options"
      );

    return response.data;
  };

/*
|--------------------------------------------------------------------------
| Create
|--------------------------------------------------------------------------
*/

export const createUserRequest =
  async (
    data
  ) => {
    const response =
      await apiClient.post(
        "/users",
        data
      );

    return response.data;
  };

/*
|--------------------------------------------------------------------------
| Update
|--------------------------------------------------------------------------
*/

export const updateUserRequest =
  async ({
    userId,
    data,
  }) => {
    const response =
      await apiClient.patch(
        `/users/${userId}`,
        data
      );

    return response.data;
  };

/*
|--------------------------------------------------------------------------
| Status
|--------------------------------------------------------------------------
*/

export const updateUserStatusRequest =
  async ({
    userId,
    status,
  }) => {
    const response =
      await apiClient.patch(
        `/users/${userId}/status`,
        {
          status,
        }
      );

    return response.data;
  };