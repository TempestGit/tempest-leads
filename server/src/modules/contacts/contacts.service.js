import { randomUUID } from 'node:crypto';

import {
  insertContact,
  listContacts,
} from './contacts.repository.js';

export { listContacts };

export function createContact(user, input) {
  const values = Object.fromEntries(
    Object.entries(input).map(([key, value]) => [
      key,
      value === '' ? null : value,
    ]),
  );

  return insertContact(user, {
    ...values,
    contact_code: `CON-${randomUUID()}`,
  });
}