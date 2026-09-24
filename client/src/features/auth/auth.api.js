import apiClient from "../../lib/apiClient";

export const loginRequest =
  async (credentials) => {
    const response =
      await apiClient.post(
        "/auth/login",
        credentials
      );

    return response.data;
  };

export const getMeRequest =
  async () => {
    const response =
      await apiClient.get(
        "/auth/me"
      );

    return response.data;
  };

export const logoutRequest =
  async () => {
    const response =
      await apiClient.post(
        "/auth/logout"
      );

    return response.data;
  };