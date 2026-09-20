import knex from 'knex';
import configurations from '../../knexfile.js';

const environment = process.env.NODE_ENV || 'development';
const configuration = configurations[environment];

if (!configuration) {
  throw new Error(
    `No database configuration exists for NODE_ENV=${environment}`,
  );
}

export const db = knex(configuration);

export default db;