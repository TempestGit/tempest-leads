import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

import mysql from "mysql2/promise";

import { env } from "../config/env.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const migrationsDirectory = path.join(
  __dirname,
  "migrations"
);

const createMigrationConnection = async () => {
  return mysql.createConnection({
    host: env.DB_HOST,
    port: env.DB_PORT,
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    database: env.DB_NAME,

    charset: "utf8mb4",

    multipleStatements: true,
  });
};

const checksum = (contents) => {
  return crypto
    .createHash("sha256")
    .update(contents)
    .digest("hex");
};

const ensureMigrationsTable = async (connection) => {
  await connection.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,

      filename VARCHAR(255) NOT NULL,

      checksum CHAR(64) NOT NULL,

      applied_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

      PRIMARY KEY (id),

      UNIQUE KEY uq_schema_migrations_filename (filename)
    )
    ENGINE=InnoDB
    DEFAULT CHARSET=utf8mb4
    COLLATE=utf8mb4_unicode_ci
  `);
};

const getAppliedMigrations = async (connection) => {
  const [rows] = await connection.query(`
    SELECT
      filename,
      checksum
    FROM schema_migrations
    ORDER BY filename ASC
  `);

  return new Map(
    rows.map((migration) => [
      migration.filename,
      migration.checksum,
    ])
  );
};

const runMigrations = async () => {
  let connection;

  try {
    connection = await createMigrationConnection();

    console.log("Connected to MySQL.");

    await ensureMigrationsTable(connection);

    const files = (
      await fs.readdir(migrationsDirectory)
    )
      .filter((file) => file.endsWith(".sql"))
      .sort();

    if (files.length === 0) {
      console.log("No migration files found.");
      return;
    }

    const applied =
      await getAppliedMigrations(connection);

    for (const filename of files) {
      const fullPath = path.join(
        migrationsDirectory,
        filename
      );

      const sql = await fs.readFile(
        fullPath,
        "utf8"
      );

      const migrationChecksum = checksum(sql);

      const existingChecksum =
        applied.get(filename);

      /*
      |--------------------------------------------------------------------------
      | Already applied
      |--------------------------------------------------------------------------
      */

      if (existingChecksum) {
        if (
          existingChecksum !== migrationChecksum
        ) {
          throw new Error(
            `Migration ${filename} was modified after it was already applied.`
          );
        }

        console.log(
          `Already applied: ${filename}`
        );

        continue;
      }

      /*
      |--------------------------------------------------------------------------
      | Apply migration
      |--------------------------------------------------------------------------
      */

      console.log(
        `Applying migration: ${filename}`
      );

      await connection.query(sql);

      await connection.query(
        `
          INSERT INTO schema_migrations (
            filename,
            checksum
          )
          VALUES (?, ?)
        `,
        [
          filename,
          migrationChecksum,
        ]
      );

      console.log(
        `Applied: ${filename}`
      );
    }

    console.log(
      "All database migrations are up to date."
    );
  } catch (error) {
    console.error(
      "Migration failed:",
      error
    );

    process.exitCode = 1;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
};

runMigrations();