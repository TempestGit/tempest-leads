import app from "./app.js";
import { env } from "./config/env.js";
import { testDatabaseConnection } from "./config/db.js";

const startServer = async () => {
  try {
    await testDatabaseConnection();

    console.log("MySQL database connected.");

    app.listen(env.PORT, () => {
      console.log(
        `TEMPEST LEADS API running at http://localhost:${env.PORT}`
      );
    });
  } catch (error) {
    console.error("Failed to start server:");
    console.error(error);

    process.exit(1);
  }
};

startServer();