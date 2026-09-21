let csrfToken = null;

/*
|--------------------------------------------------------------------------
| Set CSRF Token
|--------------------------------------------------------------------------
*/

export function setCsrfToken(token) {
  csrfToken =
    typeof token === "string" &&
    token.trim()
      ? token.trim()
      : null;
}

/*
|--------------------------------------------------------------------------
| API Error
|--------------------------------------------------------------------------
*/

export class ApiError extends Error {
  constructor(
    status,
    message = "API request failed.",
    errors = [],
  ) {
    super(message);

    this.name = "ApiError";
    this.status = status;
    this.errors =
      Array.isArray(errors)
        ? errors
        : [];
  }
}

/*
|--------------------------------------------------------------------------
| API Request
|--------------------------------------------------------------------------
*/

export async function apiRequest(
  path,
  {
    method = "GET",
    body,
    signal,
    headers = {},
  } = {},
) {
  const normalizedMethod =
    String(method)
      .trim()
      .toUpperCase();

  const hasBody =
    body !== undefined &&
    body !== null;

  const requestHeaders = {
    ...(hasBody
      ? {
          "Content-Type":
            "application/json",
        }
      : {}),

    ...(
      csrfToken &&
      normalizedMethod !== "GET" &&
      normalizedMethod !== "HEAD"
        ? {
            "X-CSRF-Token":
              csrfToken,
          }
        : {}
    ),

    ...headers,
  };

  let response;

  try {
    response =
      await fetch(
        `/api${path}`,
        {
          method:
            normalizedMethod,

          credentials:
            "include",

          signal,

          headers:
            requestHeaders,

          ...(hasBody
            ? {
                body:
                  JSON.stringify(
                    body,
                  ),
              }
            : {}),
        },
      );
  } catch (error) {
    /*
    |--------------------------------------------------------------------------
    | Abort
    |--------------------------------------------------------------------------
    */

    if (
      error?.name ===
      "AbortError"
    ) {
      throw error;
    }

    /*
    |--------------------------------------------------------------------------
    | Network Error
    |--------------------------------------------------------------------------
    */

    throw new ApiError(
      0,
      "Unable to connect to the server. Please check your connection and try again.",
    );
  }

  /*
  |--------------------------------------------------------------------------
  | No Content
  |--------------------------------------------------------------------------
  */

  if (
    response.status === 204
  ) {
    return null;
  }

  /*
  |--------------------------------------------------------------------------
  | Read Response
  |--------------------------------------------------------------------------
  */

  const contentType =
    response.headers.get(
      "content-type",
    ) || "";

  let data = null;

  if (
    contentType.includes(
      "application/json",
    )
  ) {
    try {
      data =
        await response.json();
    } catch {
      data = null;
    }
  } else {
    const text =
      await response.text();

    if (text) {
      data = {
        message: text,
      };
    }
  }

  /*
  |--------------------------------------------------------------------------
  | Failed Response
  |--------------------------------------------------------------------------
  */

  if (!response.ok) {
    const message =
      data?.message ||
      data?.error?.message ||
      data?.error ||
      `API request failed with status ${response.status}.`;

    const errors =
      Array.isArray(
        data?.errors,
      )
        ? data.errors
        : [];

    throw new ApiError(
      response.status,
      message,
      errors,
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Successful Empty Response
  |--------------------------------------------------------------------------
  */

  if (data === null) {
    return {};
  }

  return data;
}

export default apiRequest;