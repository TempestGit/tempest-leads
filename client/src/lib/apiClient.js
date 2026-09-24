import axios from "axios";

import {
  getAccessToken,
  setAccessToken,
  clearAccessToken,
} from "./authToken";

/*
|--------------------------------------------------------------------------
| Main API Client
|--------------------------------------------------------------------------
*/

const apiClient = axios.create({
  baseURL: "/api",

  withCredentials: true,

  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },

  timeout: 15000,
});

/*
|--------------------------------------------------------------------------
| Refresh-only Client
|--------------------------------------------------------------------------
|
| This client does NOT use the normal response interceptor.
|
| That prevents:
|
| /auth/refresh
|    ↓
| 401
|    ↓
| try /auth/refresh again
|
| loops.
|
*/

const refreshClient = axios.create({
  baseURL: "/api",

  withCredentials: true,

  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },

  timeout: 15000,
});

/*
|--------------------------------------------------------------------------
| Attach Access Token
|--------------------------------------------------------------------------
*/

apiClient.interceptors.request.use(
  (config) => {
    const token =
      getAccessToken();

    if (token) {
      config.headers =
        config.headers || {};

      config.headers.Authorization =
        `Bearer ${token}`;
    }

    return config;
  },

  (error) =>
    Promise.reject(error)
);

/*
|--------------------------------------------------------------------------
| Global Refresh Lock
|--------------------------------------------------------------------------
|
| Every part of the application MUST use this function.
|
| If 5 requests simultaneously discover an expired access token:
|
| request 1 → actually calls /auth/refresh
| request 2 → waits
| request 3 → waits
| request 4 → waits
| request 5 → waits
|
| Only one refresh-token rotation happens.
|
*/

let refreshPromise = null;

export const refreshSession =
  async () => {
    if (!refreshPromise) {
      refreshPromise =
        refreshClient
          .post(
            "/auth/refresh"
          )
          .then(
            (response) => {
              const data =
                response.data
                  ?.data;

              const token =
                data?.accessToken;

              if (!token) {
                throw new Error(
                  "Refresh response did not contain an access token."
                );
              }

              setAccessToken(
                token
              );

              return data;
            }
          )
          .catch(
            (error) => {
              clearAccessToken();

              throw error;
            }
          )
          .finally(() => {
            refreshPromise =
              null;
          });
    }

    return refreshPromise;
  };

/*
|--------------------------------------------------------------------------
| Response Interceptor
|--------------------------------------------------------------------------
*/

apiClient.interceptors.response.use(
  (response) =>
    response,

  async (error) => {
    const originalRequest =
      error.config;

    const status =
      error.response?.status;

    if (
      status !== 401 ||
      !originalRequest
    ) {
      return Promise.reject(
        error
      );
    }

    const url =
      originalRequest.url ||
      "";

    /*
    |--------------------------------------------------------------------------
    | Never auto-refresh these endpoints
    |--------------------------------------------------------------------------
    */

    if (
      url.includes(
        "/auth/login"
      ) ||
      url.includes(
        "/auth/refresh"
      ) ||
      url.includes(
        "/auth/logout"
      )
    ) {
      return Promise.reject(
        error
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Prevent request retry loops
    |--------------------------------------------------------------------------
    */

    if (
      originalRequest._retry
    ) {
      return Promise.reject(
        error
      );
    }

    originalRequest._retry =
      true;

    try {
      const session =
        await refreshSession();

      originalRequest.headers =
        originalRequest.headers ||
        {};

      originalRequest.headers.Authorization =
        `Bearer ${session.accessToken}`;

      return apiClient(
        originalRequest
      );
    } catch (
      refreshError
    ) {
      clearAccessToken();

      window.dispatchEvent(
        new Event(
          "auth:expired"
        )
      );

      return Promise.reject(
        refreshError
      );
    }
  }
);

export {
  refreshClient,
};

export default apiClient;