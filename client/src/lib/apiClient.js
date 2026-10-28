import axios from "axios";

import {
  getAccessToken,
  setAccessToken,
  clearAccessToken,
} from "./authToken";

/*
|--------------------------------------------------------------------------
| API Base URL
|--------------------------------------------------------------------------
*/

const rawApiUrl = String(
  import.meta.env.VITE_API_URL ?? "/api"
).trim();

export const API_BASE_URL =
  rawApiUrl === "/"
    ? "/"
    : rawApiUrl.replace(/\/+$/, "");

/*
|--------------------------------------------------------------------------
| Axios Defaults
|--------------------------------------------------------------------------
*/

const axiosDefaults = {
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
  timeout: 20000,
};

const apiClient = axios.create({
  ...axiosDefaults,
});

const refreshClient = axios.create({
  ...axiosDefaults,
});

/*
|--------------------------------------------------------------------------
| Authentication Helpers
|--------------------------------------------------------------------------
*/

const AUTH_EXPIRED_EVENT = "auth:expired";

const INVALID_SESSION_CODES = new Set([
  "SESSION_REVOKED",
  "INVALID_REFRESH_TOKEN",
  "REFRESH_TOKEN_EXPIRED",
  "REFRESH_TOKEN_REUSED",
  "REFRESH_TOKEN_MISSING",
  "INVALID_ACCESS_TOKEN",
]);

const getErrorCode = (error) =>
  error?.response?.data?.code ||
  error?.response?.data?.error?.code ||
  null;

const notifySessionExpired = () => {
  clearAccessToken();

  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new Event(AUTH_EXPIRED_EVENT)
    );
  }
};

/*
|--------------------------------------------------------------------------
| Refresh State
|--------------------------------------------------------------------------
*/

let refreshPromise = null;

/*
|--------------------------------------------------------------------------
| Authentication Generation
|--------------------------------------------------------------------------
|
| Incrementing this counter invalidates pending refresh results.
|
| Call invalidateAuthSession() when the user explicitly logs out
| or clears their session.
|
*/

let authGeneration = 0;

export const invalidateAuthSession = () => {
  authGeneration += 1;
  clearAccessToken();
};

/*
|--------------------------------------------------------------------------
| Attach Access Token
|--------------------------------------------------------------------------
*/

apiClient.interceptors.request.use(
  (config) => {
    const token = getAccessToken();

    config.headers = config.headers || {};

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      delete config.headers.Authorization;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/*
|--------------------------------------------------------------------------
| Single-flight Refresh
|--------------------------------------------------------------------------
*/

export const refreshSession = async () => {
  if (refreshPromise) {
    return refreshPromise;
  }

  const generationAtStart = authGeneration;

  const promise = refreshClient
    .post("/auth/refresh")
    .then((response) => {
      const data = response?.data?.data;
      const accessToken = data?.accessToken;

      if (!accessToken) {
        throw new Error(
          "Refresh response did not contain an access token."
        );
      }

      if (generationAtStart !== authGeneration) {
        throw new Error(
          "Authentication session was cleared during refresh."
        );
      }

      setAccessToken(accessToken);

      return data;
    })
    .catch((error) => {
      if (generationAtStart === authGeneration) {
        clearAccessToken();
      }

      throw error;
    })
    .finally(() => {
      if (refreshPromise === promise) {
        refreshPromise = null;
      }
    });

  refreshPromise = promise;

  return promise;
};

/*
|--------------------------------------------------------------------------
| Response Interceptor
|--------------------------------------------------------------------------
*/

apiClient.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error?.config;
    const status = error?.response?.status;
    const code = getErrorCode(error);

    if (status !== 401 || !originalRequest) {
      return Promise.reject(error);
    }

    const url = String(originalRequest.url || "");

    /*
    |--------------------------------------------------------------------------
    | Never refresh authentication endpoints.
    |--------------------------------------------------------------------------
    */

    if (
      url.includes("/auth/login") ||
      url.includes("/auth/refresh") ||
      url.includes("/auth/logout") ||
      url.includes("/auth/forgot-password") ||
      url.includes("/auth/reset-password")
    ) {
      return Promise.reject(error);
    }

    /*
    |--------------------------------------------------------------------------
    | Explicitly revoked sessions must not be refreshed.
    |--------------------------------------------------------------------------
    */

    if (
      code === "SESSION_REVOKED" ||
      code === "REFRESH_TOKEN_REUSED"
    ) {
      invalidateAuthSession();

      notifySessionExpired();

      return Promise.reject(error);
    }

    /*
    |--------------------------------------------------------------------------
    | Prevent infinite retries.
    |--------------------------------------------------------------------------
    */

    if (originalRequest._retry) {
      if (INVALID_SESSION_CODES.has(code)) {
        invalidateAuthSession();
        notifySessionExpired();
      }

      return Promise.reject(error);
    }

    originalRequest._retry = true;

    const generationAtStart = authGeneration;

    try {
      const session = await refreshSession();

      if (generationAtStart !== authGeneration) {
        throw new Error(
          "Authentication session changed during refresh."
        );
      }

      const accessToken = session?.accessToken;

      if (!accessToken) {
        throw new Error(
          "Unable to restore authenticated session."
        );
      }

      originalRequest.headers =
        originalRequest.headers || {};

      originalRequest.headers.Authorization =
        `Bearer ${accessToken}`;

      return apiClient(originalRequest);
    } catch (refreshError) {
      if (generationAtStart === authGeneration) {
        invalidateAuthSession();
        notifySessionExpired();
      }

      return Promise.reject(refreshError);
    }
  }
);

export { refreshClient };

export default apiClient;