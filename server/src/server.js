import app from './app.js';
import { closeDatabaseConnection } from './config/db.js';

const port = Number(process.env.PORT || 5000);

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error('PORT must be a valid port number');
}

const server = app.listen(port, () => {
  console.log(`Tempest Leads API: http://localhost:${port}`);
});

let shuttingDown = false;

function shutdown(signal) {
  if (shuttingDown) return;

  shuttingDown = true;

  console.log(`${signal} received. Closing server...`);

  const timeout = setTimeout(() => {
    console.error('Shutdown timed out.');
    process.exit(1);
  }, 10000);

  timeout.unref();

  server.close(async (error) => {
    try {
      await closeDatabaseConnection();
      clearTimeout(timeout);
      process.exit(error ? 1 : 0);
    } catch {
      console.error('Could not close the database pool.');
      process.exit(1);
    }
  });
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));