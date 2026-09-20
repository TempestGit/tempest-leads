import { randomBytes, timingSafeEqual } from 'node:crypto';

export function getCsrfToken(req) {
  if (!req.session.csrfToken) {
    req.session.csrfToken = randomBytes(32).toString('hex');
  }

  return req.session.csrfToken;
}

export function csrfProtection(req, res, next) {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  const suppliedToken = req.get('X-CSRF-Token');
  const expectedToken = req.session.csrfToken;

  if (
    typeof suppliedToken !== 'string' ||
    typeof expectedToken !== 'string' ||
    suppliedToken.length !== 64 ||
    expectedToken.length !== 64
  ) {
    return res.status(403).json({
      message: 'Invalid security token. Refresh your session and try again.',
    });
  }

  const supplied = Buffer.from(suppliedToken, 'utf8');
  const expected = Buffer.from(expectedToken, 'utf8');

  if (
    supplied.length !== expected.length ||
    !timingSafeEqual(supplied, expected)
  ) {
    return res.status(403).json({
      message: 'Invalid security token. Refresh your session and try again.',
    });
  }

  next();
}