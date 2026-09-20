import db from '../../database/knex.js';

export function findUserByEmail(email) {
  return db('users').where({ email }).first();
}

export function findSessionUser(id) {
  return db('users')
    .select(
      'id',
      'name',
      'email',
      'role',
      'status',
      'session_version',
    )
    .where({ id })
    .first();
}

export function recordLogin(id) {
  return db('users').where({ id }).update({
    last_login_at: db.fn.now(3),
    updated_at: db.fn.now(3),
  });
}