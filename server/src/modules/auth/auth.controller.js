import {
  SESSION_COOKIE_NAME,
  SESSION_DURATION,
  sessionCookieOptions,
} from '../../config/session.js';
import { getCsrfToken } from '../../middleware/csrfProtection.js';
import { loginSchema } from './auth.validation.js';
import {
  verifyCredentials,
  resolveSessionUser,
  publicUser,
  regenerateSession,
  saveSession,
  destroySession,
  recordLogin,
} from './auth.service.js';

export async function getSession(req, res) {
  const user = await resolveSessionUser(req);
  const csrfToken = getCsrfToken(req);

  await saveSession(req);

  res.json({
    authenticated: Boolean(user),
    user,
    csrfToken,
  });
}

export async function login(req, res) {
  const result = loginSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      message: 'Enter a valid email and password.',
      errors: result.error.flatten().fieldErrors,
    });
  }

  const { email, password, rememberMe } = result.data;
  const user = await verifyCredentials(email, password);

  if (!user) {
    return res.status(401).json({
      message: 'Invalid email or password, or account inactive.',
    });
  }

  await recordLogin(user.id);

  // Replace the pre-login session to prevent session fixation.
  await regenerateSession(req);

  req.session.userId = String(user.id);
  req.session.sessionVersion = Number(user.session_version);
  req.session.cookie.maxAge = rememberMe
    ? SESSION_DURATION.remember
    : SESSION_DURATION.standard;

  const csrfToken = getCsrfToken(req);

  await saveSession(req);

  res.json({
    message: 'Logged in successfully.',
    authenticated: true,
    user: publicUser(user),
    csrfToken,
  });
}

export async function logout(req, res) {
  await destroySession(req);

  res.clearCookie(SESSION_COOKIE_NAME, sessionCookieOptions);
  res.status(204).end();
}