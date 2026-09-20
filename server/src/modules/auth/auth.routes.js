import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';
import {
  getSession,
  login,
  logout,
} from './auth.controller.js';

const router = Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  message: {
    message: 'Too many login attempts. Try again in 15 minutes.',
  },
});

router.get('/session', getSession);
router.post('/login', loginLimiter, login);
router.post('/logout', logout);

export default router;