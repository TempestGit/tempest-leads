import { randomUUID } from 'node:crypto';

import {
  findContact,
  insertContact,
  listContacts,
  updateContactRecord,
} from './contacts.repository.js';

export { listContacts };

function normalizeValues(input) {
  return Object.fromEntries(
    Object.entries(input).map(([key, value]) => [
      key,
      value === '' ? null : value,
    ]),
  );
}

export function createContact(user, input) {
  const values = normalizeValues(input);

  return insertContact(user, {
    ...values,
    contact_code: `CON-${randomUUID()}`,
  });
}

export function getContact(user, id) {
  return findContact(user, id);
}

export function updateContact(user, id, input) {
  const { version, ...profile } = input;
  const values = normalizeValues(profile);

  return updateContactRecord(user, id, version, values);
}