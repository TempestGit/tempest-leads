import dotenv from 'dotenv';
import { fileURLToPath } from 'node:url';

dotenv.config({
  path: fileURLToPath(new URL('./.env', import.meta.url)),
});

for (const name of ['DB_HOST', 'DB_PORT', 'DB_USER', 'DB_NAME']) {
  if (!process.env[name]?.trim()) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
}

const databasePort = Number(process.env.DB_PORT);

if (
  !Number.isInteger(databasePort) ||
  databasePort < 1 ||
  databasePort > 65535
) {
  throw new Error('DB_PORT must be a valid port number');
}

const config = {
  client: 'mysql2',

  connection: {
    host: process.env.DB_HOST,
    port: databasePort,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD ?? '',
    database: process.env.DB_NAME,
    charset: 'utf8mb4',
    timezone: 'Z',
    connectTimeout: 5000,
    multipleStatements: false,
    supportBigNumbers: true,
    bigNumberStrings: true,
  },

  pool: {
    min: 0,
    max: 10,

    afterCreate(connection, done) {
      connection.query("SET time_zone = '+00:00'", (error) => {
        done(error, connection);
      });
    },
  },

  acquireConnectionTimeout: 10000,

  migrations: {
    directory: fileURLToPath(
      new URL('./database/migrations/', import.meta.url),
    ),
    tableName: 'knex_migrations',
    extension: 'js',
    loadExtensions: ['.js'],
    disableTransactions: true,
  },
};

export default {
  development: config,
  production: config,
};