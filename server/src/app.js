import express from 'express';
import helmet from 'helmet';
import { checkDatabaseConnection } from './config/db.js';
import { sessionMiddleware } from './config/session.js';
import { csrfProtection } from './middleware/csrfProtection.js';
import authRoutes from './modules/auth/auth.routes.js';
import companiesRoutes from './modules/companies/companies.routes.js';
import contactsRoutes from './modules/contacts/contacts.routes.js';
import leadsRoutes from './modules/leads/leads.routes.js';
import activitiesRoutes from './modules/activities/activities.routes.js';
import followUpsRoutes from './modules/follow-ups/followUps.routes.js';
import meetingsRoutes from './modules/meetings/meetings.routes.js';

const app = express();

app.disable('x-powered-by');

app.use(helmet());
app.use(express.json({ limit: '1mb' }));

app.use('/api', (_req, res, next) => {
  res.set('Cache-Control', 'no-store');
  next();
});

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'tempest-leads-api',
  });
});

app.get('/api/ready', async (_req, res) => {
  try {
    await checkDatabaseConnection();

    res.json({
      status: 'ok',
      service: 'tempest-leads-api',
      database: 'connected',
    });
  } catch {
    res.status(503).json({
      status: 'unavailable',
      service: 'tempest-leads-api',
      database: 'disconnected',
    });
  }
});

app.use('/api', sessionMiddleware);
app.use('/api', csrfProtection);

app.use('/api/auth', authRoutes);
app.use('/api/companies', companiesRoutes);
app.use('/api/contacts', contactsRoutes);
app.use('/api/leads', leadsRoutes);
app.use('/api/activities', activitiesRoutes);
app.use('/api/follow-ups', followUpsRoutes);
app.use('/api/meetings', meetingsRoutes);

app.use((_req, res) => {
  res.status(404).json({
    message: 'Route not found',
  });
});

// Express error middleware requires all four parameters.
// eslint-disable-next-line no-unused-vars
app.use((error, _req, res, _next) => {
  if (error.type === 'entity.parse.failed') {
    return res.status(400).json({
      message: 'Invalid JSON request body.',
    });
  }

  if (error.type === 'entity.too.large') {
    return res.status(413).json({
      message: 'Request body is too large.',
    });
  }

  // Avoid logging passwords, session data, or database bindings.
  console.error('API request failed:', error.code || error.name);

  res.status(500).json({
    message: 'Something went wrong. Please try again.',
  });
});

export default app;