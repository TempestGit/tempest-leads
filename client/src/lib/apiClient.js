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
|
| Development:
|
| VITE_API_URL=/api
|
| Vite proxies:
|
| /api
|   ↓
| http://localhost:5000/api
|
|
| Production:
|
| VITE_API_URL=/api
|
| Netlify proxies:
|
| /api
|   ↓
| https://tempest-leads-api.onrender.com/api
|
|
| The React application therefore never needs to hardcode the Render URL.
|
*/

const rawApiUrl =
  String(
    import.meta.env
      .VITE_API_URL ??
      "/api"
  ).trim();

export const API_BASE_URL =
  rawApiUrl === "/"
    ? "/"
    : rawApiUrl.replace(
        /\/+$/,
        ""
      );

/*
|--------------------------------------------------------------------------
| Axios Defaults
|--------------------------------------------------------------------------
*/

const axiosDefaults = {
  baseURL:
    API_BASE_URL,

  withCredentials:
    true,

  headers: {
    Accept:
      "application/json",

    "Content-Type":
      "application/json",
  },

  timeout:
    20000,
};

/*
|--------------------------------------------------------------------------
| Main API Client
|--------------------------------------------------------------------------
|
| Used by:
|
| /leads
| /companies
| /contacts
| /meetings
| /followups
| etc.
|
*/

const apiClient =
  axios.create({
    ...axiosDefaults,
  });

/*
|--------------------------------------------------------------------------
| Refresh-only Client
|--------------------------------------------------------------------------
|
| IMPORTANT:
|
| This client deliberately does NOT use the main response interceptor.
|
| Otherwise:
|
| /auth/refresh
|      ↓
| 401
|      ↓
| interceptor
|      ↓
| /auth/refresh
|
| would create a refresh loop.
|
*/

const refreshClient =
  axios.create({
    ...axiosDefaults,
  });

/*
|--------------------------------------------------------------------------
| Attach Access Token
|--------------------------------------------------------------------------
|
| Access token stays in memory.
|
| Refresh token stays in the HTTP-only cookie.
|
*/

apiClient.interceptors.request.use(
  (config) => {
    const token =
      getAccessToken();

    if (!token) {
      return config;
    }

    config.headers =
      config.headers ||
      {};

    config.headers.Authorization =
      `Bearer ${token}`;

    return config;
  },

  (error) => {
    return Promise.reject(
      error
    );
  }
);

/*
|--------------------------------------------------------------------------
| Refresh Lock
|--------------------------------------------------------------------------
|
| Example:
|
| 5 API requests receive 401 simultaneously.
|
| Without lock:
|
| 5 refresh requests
| → refresh-token rotation conflicts
| → REFRESH_TOKEN_REUSED
|
| With lock:
|
| Request 1 → refreshes
| Request 2 → waits
| Request 3 → waits
| Request 4 → waits
| Request 5 → waits
|
| Only one refresh request is executed.
|
*/

let refreshPromise =
  null;

export const refreshSession =
  async () => {
    if (
      refreshPromise
    ) {
      return refreshPromise;
    }

    refreshPromise =
      refreshClient
        .post(
          "/auth/refresh"
        )
        .then(
          (
            response
          ) => {
            const data =
              response
                ?.data
                ?.data;

            const accessToken =
              data
                ?.accessToken;

            if (
              !accessToken
            ) {
              throw new Error(
                "Refresh response did not contain an access token."
              );
            }

            /*
            |--------------------------------------------------------------------------
            | Update In-memory Access Token
            |--------------------------------------------------------------------------
            */

            setAccessToken(
              accessToken
            );

            return data;
          }
        )
        .catch(
          (
            error
          ) => {
            clearAccessToken();

            throw error;
          }
        )
        .finally(
          () => {
            refreshPromise =
              null;
          }
        );

    return refreshPromise;
  };

/*
|--------------------------------------------------------------------------
| Response Interceptor
|--------------------------------------------------------------------------
|
| If a normal API request receives 401:
|
| 1. Refresh the access token.
| 2. Replace Authorization header.
| 3. Retry the original request once.
|
*/

apiClient.interceptors.response.use(
  (
    response
  ) => {
    return response;
  },

  async (
    error
  ) => {
    const originalRequest =
      error?.config;

    const status =
      error
        ?.response
        ?.status;

    /*
    |--------------------------------------------------------------------------
    | Non-authentication Error
    |--------------------------------------------------------------------------
    */

    if (
      status !== 401 ||
      !originalRequest
    ) {
      return Promise.reject(
        error
      );
    }

    const url =
      String(
        originalRequest
          ?.url ||
          ""
      );

    /*
    |--------------------------------------------------------------------------
    | Never Refresh Authentication Endpoints
    |--------------------------------------------------------------------------
    |
    | Login:
    | Invalid credentials should remain a normal 401.
    |
    | Refresh:
    | Prevent refresh recursion.
    |
    | Logout:
    | Do not try to create another session during logout.
    |
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
    | Prevent Retry Loop
    |--------------------------------------------------------------------------
    */

    if (
      originalRequest
        ._retry
    ) {
      return Promise.reject(
        error
      );
    }

    originalRequest
      ._retry =
      true;

    try {
      /*
      |--------------------------------------------------------------------------
      | Refresh Session
      |--------------------------------------------------------------------------
      */

      const session =
        await refreshSession();

      const accessToken =
        session
          ?.accessToken;

      if (
        !accessToken
      ) {
        throw new Error(
          "Unable to restore authenticated session."
        );
      }

      /*
      |--------------------------------------------------------------------------
      | Replace Access Token
      |--------------------------------------------------------------------------
      */

      originalRequest.headers =
        originalRequest
          .headers ||
        {};

      originalRequest
        .headers
        .Authorization =
        `Bearer ${accessToken}`;

      /*
      |--------------------------------------------------------------------------
      | Retry Original Request
      |--------------------------------------------------------------------------
      */

      return apiClient(
        originalRequest
      );
    } catch (
      refreshError
    ) {
      /*
      |--------------------------------------------------------------------------
      | Refresh Failed
      |--------------------------------------------------------------------------
      */

      clearAccessToken();

      /*
      |--------------------------------------------------------------------------
      | Inform Auth Provider
      |--------------------------------------------------------------------------
      |
      | AuthProvider / ProtectedRoute can listen for:
      |
      | window.addEventListener(
      |   "auth:expired",
      |   ...
      | );
      |
      */

      if (
        typeof window !==
        "undefined"
      ) {
        window.dispatchEvent(
          new Event(
            "auth:expired"
          )
        );
      }

      return Promise.reject(
        refreshError
      );
    }
  }
);

/*
|--------------------------------------------------------------------------
| Exports
|--------------------------------------------------------------------------
*/

export {
  refreshClient,
};

export default apiClient;