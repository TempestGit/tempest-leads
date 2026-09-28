import mysql from "mysql2/promise";

/*
|--------------------------------------------------------------------------
| Helpers
|--------------------------------------------------------------------------
*/

const toBoolean = (
  value,
  fallback = false
) => {
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return fallback;
  }

  return [
    "1",
    "true",
    "yes",
    "on",
  ].includes(
    String(value)
      .trim()
      .toLowerCase()
  );
};

/*
|--------------------------------------------------------------------------
| Normalize PEM Certificate
|--------------------------------------------------------------------------
|
| Render supports multiline environment values.
|
| This also supports:
|
| -----BEGIN CERTIFICATE-----\n...\n-----END CERTIFICATE-----
|
*/

const normalizeCertificate = (
  value
) => {
  if (!value) {
    return "";
  }

  return String(value)
    .replace(
      /\\n/g,
      "\n"
    )
    .trim();
};

/*
|--------------------------------------------------------------------------
| Environment
|--------------------------------------------------------------------------
*/

const DB_HOST =
  process.env.DB_HOST ||
  "127.0.0.1";

const DB_PORT =
  Number(
    process.env.DB_PORT ||
    3306
  );

const DB_NAME =
  process.env.DB_NAME ||
  "tempest_leads";

const DB_USER =
  process.env.DB_USER ||
  "root";

const DB_PASSWORD =
  process.env.DB_PASSWORD ||
  "";

const DB_SSL =
  toBoolean(
    process.env.DB_SSL,
    false
  );

const DB_CA_CERT =
  normalizeCertificate(
    process.env.DB_CA_CERT
  );

/*
|--------------------------------------------------------------------------
| Validate SSL
|--------------------------------------------------------------------------
*/

if (
  DB_SSL &&
  !DB_CA_CERT
) {
  throw new Error(
    "DB_SSL is enabled but DB_CA_CERT is missing."
  );
}

/*
|--------------------------------------------------------------------------
| SSL Configuration
|--------------------------------------------------------------------------
*/

const ssl =
  DB_SSL
    ? {
        ca:
          DB_CA_CERT,

        rejectUnauthorized:
          true,
      }
    : undefined;

/*
|--------------------------------------------------------------------------
| MySQL Pool
|--------------------------------------------------------------------------
*/

const pool =
  mysql.createPool({
    host:
      DB_HOST,

    port:
      DB_PORT,

    user:
      DB_USER,

    password:
      DB_PASSWORD,

    database:
      DB_NAME,

    ssl,

    /*
    |--------------------------------------------------------------------------
    | Pool
    |--------------------------------------------------------------------------
    */

    waitForConnections:
      true,

    connectionLimit:
      Number(
        process.env.DB_CONNECTION_LIMIT ||
        10
      ),

    maxIdle:
      Number(
        process.env.DB_MAX_IDLE ||
        10
      ),

    idleTimeout:
      Number(
        process.env.DB_IDLE_TIMEOUT ||
        60000
      ),

    queueLimit:
      0,

    /*
    |--------------------------------------------------------------------------
    | Connection
    |--------------------------------------------------------------------------
    */

    charset:
      "utf8mb4",

    timezone:
      "Z",

    enableKeepAlive:
      true,

    keepAliveInitialDelay:
      0,

    multipleStatements:
      false,

    decimalNumbers:
      true,
  });

/*
|--------------------------------------------------------------------------
| Test Connection
|--------------------------------------------------------------------------
*/

export const testDatabaseConnection =
  async () => {
    let connection;

    try {
      connection =
        await pool.getConnection();

      const [
        rows,
      ] =
        await connection.query(
          `
            SELECT
              DATABASE()
                AS databaseName,

              CURRENT_TIMESTAMP
                AS currentTime
          `
        );

      console.log(
        "MySQL database connected:",
        {
          host:
            DB_HOST,

          port:
            DB_PORT,

          database:
            rows[0]
              ?.databaseName ||
            DB_NAME,

          ssl:
            DB_SSL
              ? "enabled"
              : "disabled",
        }
      );

      return true;
    } catch (
      error
    ) {
      console.error(
        "MySQL connection failed:",
        {
          code:
            error.code,

          message:
            error.message,

          host:
            DB_HOST,

          port:
            DB_PORT,

          database:
            DB_NAME,

          ssl:
            DB_SSL,
        }
      );

      throw error;
    } finally {
      if (
        connection
      ) {
        connection.release();
      }
    }
  };

/*
|--------------------------------------------------------------------------
| Shutdown
|--------------------------------------------------------------------------
*/

export const closeDatabase =
  async () => {
    await pool.end();
};

/*
|--------------------------------------------------------------------------
| Default Export
|--------------------------------------------------------------------------
|
| Existing repositories can continue:
|
| import pool from "../../config/db.js";
|
*/

export default pool;