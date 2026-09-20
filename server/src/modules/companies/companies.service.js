import { randomUUID } from 'node:crypto';

import {
  insertCompany,
  listCompanies,
  findCompany,
  updateCompanyRecord,
} from './companies.repository.js';

export { listCompanies, findCompany };

function normalizeName(name) {
  return name
    .normalize('NFKC')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

function prepareValues(input) {
  return Object.fromEntries(
    Object.entries(input).map(([key, value]) => [
      key,
      value === '' ? null : value,
    ]),
  );
}

export async function createCompany(user, input) {
  return insertCompany({
    ...prepareValues(input),
    company_code: `CMP-${randomUUID()}`,
    normalized_name: normalizeName(input.name),
    owner_id: user.id,
    created_by: user.id,
    status: 'PROSPECT',
  });
}

export async function updateCompany(user, id, input) {
  const { version, ...fields } = input;

  return updateCompanyRecord(user, id, version, {
    ...prepareValues(fields),
    normalized_name: normalizeName(fields.name),
  });
}