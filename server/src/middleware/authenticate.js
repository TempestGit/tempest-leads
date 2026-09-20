import { resolveSessionUser } from '../modules/auth/auth.service.js';

export async function authenticate(req, res, next) {
  const user = await resolveSessionUser(req);

  if (!user) {
    return res.status(401).json({
      message: 'Please log in to continue.',
    });
  }

  req.user = user;
  next();
}

export function requireAdmin(req, res, next) {
  if (req.user?.role !== 'SUPER_ADMIN') {
    return res.status(403).json({
      message: 'Super Admin access is required.',
    });
  }

  next();
}