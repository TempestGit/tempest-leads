import db from '../database/knex.js';

export async function checkDatabaseConnection() {
  await db.raw('SELECT 1 AS connected').timeout(5000);
}

export async function closeDatabaseConnection() {
  await db.destroy();
}