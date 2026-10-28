/*
|--------------------------------------------------------------------------
| Load Environment
|--------------------------------------------------------------------------
*/

import "dotenv/config";

/*
|--------------------------------------------------------------------------
| Application
|--------------------------------------------------------------------------
*/

import app from "./app.js";

/*
|--------------------------------------------------------------------------
| Database
|--------------------------------------------------------------------------
*/

import {
  closeDatabase,
  testDatabaseConnection,
} from "./config/db.js";

/*
|--------------------------------------------------------------------------
| Notification Reminder Scheduler
|--------------------------------------------------------------------------
*/

import {
  startNotificationReminderScheduler,
  stopNotificationReminderScheduler,
} from "./modules/notifications/notifications.scheduler.js";

/*
|--------------------------------------------------------------------------
| Configuration
|--------------------------------------------------------------------------
*/

const PORT = Number(
  process.env.PORT || 5000
);

const HOST =
  process.env.HOST || "0.0.0.0";

/*
|--------------------------------------------------------------------------
| Server Reference
|--------------------------------------------------------------------------
*/

let server = null;

let shuttingDown = false;

/*
|--------------------------------------------------------------------------
| Start
|--------------------------------------------------------------------------
*/

const startServer = async () => {
  try {
    /*
    |--------------------------------------------------------------------------
    | Database
    |--------------------------------------------------------------------------
    */

    await testDatabaseConnection();

    /*
    |--------------------------------------------------------------------------
    | HTTP Server
    |--------------------------------------------------------------------------
    */

    server = app.listen(
      PORT,
      HOST,
      () => {
        console.log(
          `TEMPEST LEADS API running at http://${HOST}:${PORT}`
        );

        console.log(
          `Environment: ${
            process.env.NODE_ENV || "development"
          }`
        );

        /*
        |--------------------------------------------------------------------------
        | Start Notification Reminders
        |--------------------------------------------------------------------------
        */

        startNotificationReminderScheduler();
      }
    );
  } catch (error) {
    console.error(
      "Failed to start TEMPEST LEADS API:",
      error
    );

    process.exit(1);
  }
};

/*
|--------------------------------------------------------------------------
| Graceful Shutdown
|--------------------------------------------------------------------------
*/

const shutdown = async (signal) => {
  if (shuttingDown) {
    return;
  }

  shuttingDown = true;

  console.log(
    `${signal} received. Shutting down...`
  );

  try {
    /*
    |--------------------------------------------------------------------------
    | Stop Scheduler Before Closing Database
    |--------------------------------------------------------------------------
    */

    await stopNotificationReminderScheduler();

    /*
    |--------------------------------------------------------------------------
    | Stop HTTP Server
    |--------------------------------------------------------------------------
    */

    if (server) {
      await new Promise(
        (resolve, reject) => {
          server.close((error) => {
            if (error) {
              reject(error);
              return;
            }

            resolve();
          });
        }
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Close Database
    |--------------------------------------------------------------------------
    */

    await closeDatabase();

    console.log(
      "Server shutdown complete."
    );

    process.exit(0);
  } catch (error) {
    console.error(
      "Shutdown failed:",
      error
    );

    process.exit(1);
  }
};

/*
|--------------------------------------------------------------------------
| Process Events
|--------------------------------------------------------------------------
*/

process.on(
  "SIGTERM",
  () => void shutdown("SIGTERM")
);

process.on(
  "SIGINT",
  () => void shutdown("SIGINT")
);

process.on(
  "unhandledRejection",
  (reason) => {
    console.error(
      "Unhandled promise rejection:",
      reason
    );
  }
);

process.on(
  "uncaughtException",
  (error) => {
    console.error(
      "Uncaught exception:",
      error
    );

    process.exit(1);
  }
);

/*
|--------------------------------------------------------------------------
| Boot
|--------------------------------------------------------------------------
*/

startServer();