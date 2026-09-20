import {
  apiRequest,
  setCsrfToken,
} from '../../lib/apiClient';

export async function getSession({ signal } = {}) {
  const data = await apiRequest('/auth/session', { signal });

  setCsrfToken(data.csrfToken);

  return data;
}

export async function login(credentials) {
  // Obtain a current CSRF token before logging in.
  await getSession();

  const data = await apiRequest('/auth/login', {
    method: 'POST',
    body: credentials,
  });

  // Login regenerates the session and rotates its CSRF token.
  setCsrfToken(data.csrfToken);

  return data;
}

export async function logout() {
  await getSession();

  await apiRequest('/auth/logout', {
    method: 'POST',
  });

  setCsrfToken(null);
}