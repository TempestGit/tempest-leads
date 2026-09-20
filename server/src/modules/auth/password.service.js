import argon2 from 'argon2';

export function validatePassword(password) {
  if (typeof password !== 'string') {
    return 'Password is required.';
  }

  const length = Array.from(password).length;

  if (length < 15) {
    return 'Use at least 15 characters. A long passphrase works well.';
  }

  if (length > 128) {
    return 'Password must not exceed 128 characters.';
  }

  if (!password.trim()) {
    return 'Password cannot contain only spaces.';
  }

  return true;
}

export async function hashPassword(password) {
  const result = validatePassword(password);

  if (result !== true) {
    throw new Error(result);
  }

  return argon2.hash(password, {
    type: argon2.argon2id,
    memoryCost: 65536,
    timeCost: 3,
    parallelism: 1,
  });
}

export async function verifyPassword(passwordHash, password) {
  if (
    typeof passwordHash !== 'string' ||
    typeof password !== 'string'
  ) {
    return false;
  }

  if (Array.from(password).length > 128) {
    return false;
  }

  return argon2.verify(passwordHash, password);
}