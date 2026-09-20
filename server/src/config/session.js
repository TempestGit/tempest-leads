import session from 'express-session';
import MySQLSessionStore from '../infrastructure/sessions/mysqlSessionStore.js';

const secret = process.env.SESSION_SECRET;

if (!secret || secret.length < 64) {
  throw new Error(
    'Set SESSION_SECRET in server/.env using the secret-generation command.',
  );
}

export const SESSION_COOKIE_NAME = 'tempest.sid';

export const SESSION_DURATION = {
  standard: 8 * 60 * 60 * 1000,
  remember: 7 * 24 * 60 * 60 * 1000,
};

export const sessionCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  path: '/',
};

export const sessionMiddleware = session({
  name: SESSION_COOKIE_NAME,
  secret,
  store: new MySQLSessionStore(),
  resave: false,
  saveUninitialized: false,
  rolling: true,
  cookie: {
    ...sessionCookieOptions,
    maxAge: SESSION_DURATION.standard,
  },
});