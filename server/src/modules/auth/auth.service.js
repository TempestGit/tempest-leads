import { randomBytes } from 'node:crypto';
import {
  hashPassword,
  verifyPassword,
} from './password.service.js';
import {
  findUserByEmail,
  findSessionUser,
  recordLogin,
} from './auth.repository.js';

let dummyHashPromise;

function getDummyHash() {
  if (!dummyHashPromise) {
    dummyHashPromise = hashPassword(
      randomBytes(32).toString('hex'),
    ).catch((error) => {
      dummyHashPromise = undefined;
      throw error;
    });
  }

  return dummyHashPromise;
}

export function publicUser(user) {
  return {
    id: String(user.id),
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status,
  };
}

export async function verifyCredentials(email, password) {
  const user = await findUserByEmail(email);

  // Perform password verification even when the email is unknown.
  const hash = user?.password_hash ?? (await getDummyHash());
  const matches = await verifyPassword(hash, password);

  if (!user || !matches || user.status !== 'ACTIVE') {
    return null;
  }

  return user;
}

export async function resolveSessionUser(req) {
  if (!req.session.userId) return null;

  const user = await findSessionUser(req.session.userId);

  const valid =
    user &&
    user.status === 'ACTIVE' &&
    Number(user.session_version) ===
      Number(req.session.sessionVersion);

  if (!valid) {
    await regenerateSession(req);
    return null;
  }

  return publicUser(user);
}

export function regenerateSession(req) {
  return new Promise((resolve, reject) => {
    req.session.regenerate((error) => {
      if (error) reject(error);
      else resolve();
    });
  });
}

export function saveSession(req) {
  return new Promise((resolve, reject) => {
    req.session.save((error) => {
      if (error) reject(error);
      else resolve();
    });
  });
}

export function destroySession(req) {
  return new Promise((resolve, reject) => {
    req.session.destroy((error) => {
      if (error) reject(error);
      else resolve();
    });
  });
}

export { recordLogin };