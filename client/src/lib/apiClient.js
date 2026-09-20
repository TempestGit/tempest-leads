let csrfToken = null;

export function setCsrfToken(token) {
  csrfToken = typeof token === 'string' ? token : null;
}

export class ApiError extends Error {
  constructor(message, status, errors = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errors = errors;
  }
}

export async function apiRequest(
  path,
  { method = 'GET', body, signal } = {},
) {
  const headers = {
    Accept: 'application/json',
  };

  const isMutation = !['GET', 'HEAD', 'OPTIONS'].includes(method);

  if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }

  if (isMutation && csrfToken) {
    headers['X-CSRF-Token'] = csrfToken;
  }

  let response;

  try {
    response = await fetch(`/api${path}`, {
      method,
      headers,
      credentials: 'include',
      body: body === undefined ? undefined : JSON.stringify(body),
      signal,
    });
  } catch (error) {
    if (error.name === 'AbortError') throw error;

    throw new ApiError(
      'Cannot reach the server. Check that the backend is running.',
      0,
    );
  }

  if (response.status === 204) {
    return null;
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new ApiError(
      data?.message || 'The request could not be completed.',
      response.status,
      data?.errors,
    );
  }

  if (!data) {
    throw new ApiError('The server returned an invalid response.', 502);
  }

  return data;
}