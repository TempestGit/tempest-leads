import apiClient from "../../lib/apiClient";

export const loginRequest = async (credentials) => {
  const response = await apiClient.post(
    "/auth/login",
    credentials
  );

  return response.data;
};

export const getMeRequest = async () => {
  const response = await apiClient.get("/auth/me");
  return response.data;
};

export const logoutRequest = async () => {
  const response = await apiClient.post("/auth/logout");
  return response.data;
};

export const forgotPasswordRequest = async (email) => {
  const response = await apiClient.post(
    "/auth/forgot-password",
    { email }
  );

  return response.data;
};

export const resetPasswordRequest = async ({
  token,
  newPassword,
  confirmPassword,
}) => {
  const response = await apiClient.post(
    "/auth/reset-password",
    {
      token,
      newPassword,
      confirmPassword,
    }
  );

  return response.data;
};

export const getProfileRequest = async () => {
  const response = await apiClient.get("/auth/profile");
  return response.data;
};

export const updateProfileRequest = async (profile) => {
  const response = await apiClient.patch(
    "/auth/profile",
    profile
  );

  return response.data;
};

export const changePasswordRequest = async (values) => {
  const response = await apiClient.post(
    "/auth/change-password",
    values
  );

  return response.data;
};

/*
|--------------------------------------------------------------------------
| Active Sessions
|--------------------------------------------------------------------------
*/

export const getSessionsRequest = async () => {
  const response = await apiClient.get("/auth/sessions");
  return response.data;
};

export const revokeSessionRequest = async (sessionId) => {
  const response = await apiClient.delete(
    `/auth/sessions/${encodeURIComponent(sessionId)}`
  );

  return response.data;
};

export const revokeOtherSessionsRequest = async () => {
  const response = await apiClient.delete(
    "/auth/sessions/others"
  );

  return response.data;
};

export const revokeAllSessionsRequest = async () => {
  const response = await apiClient.delete(
    "/auth/sessions/all"
  );

  return response.data;
};