import session from 'express-session';
import db from '../../database/knex.js';

export default class MySQLSessionStore extends session.Store {
  get(sid, callback) {
    db('sessions')
      .where({ sid })
      .where('expires_at', '>', db.fn.now(3))
      .first()
      .then((row) => {
        if (!row) return null;

        return typeof row.data === 'string'
          ? JSON.parse(row.data)
          : row.data;
      })
      .then(
        (data) => callback(null, data),
        (error) => callback(error),
      );
  }

  set(sid, sessionData, callback = () => {}) {
    const expiresAt = new Date(sessionData.cookie.expires);

    if (!Number.isFinite(expiresAt.getTime())) {
      callback(new Error('Session expiry is required.'));
      return;
    }

    const values = {
      user_id: sessionData.userId ?? null,
      data: JSON.stringify(sessionData),
      expires_at: expiresAt,
      updated_at: db.fn.now(3),
    };

    db('sessions')
      .insert({
        sid,
        ...values,
        created_at: db.fn.now(3),
      })
      .onConflict('sid')
      .merge(values)
      .then(
        () => callback(null),
        (error) => callback(error),
      );
  }

  destroy(sid, callback = () => {}) {
    db('sessions')
      .where({ sid })
      .delete()
      .then(
        () => callback(null),
        (error) => callback(error),
      );
  }

  touch(sid, sessionData, callback = () => {}) {
    const expiresAt = new Date(sessionData.cookie.expires);

    if (!Number.isFinite(expiresAt.getTime())) {
      callback(new Error('Session expiry is required.'));
      return;
    }

    // Extend an existing session without recreating a deleted one.
    db('sessions')
      .where({ sid })
      .where('expires_at', '>', db.fn.now(3))
      .update({
        expires_at: expiresAt,
        updated_at: db.fn.now(3),
      })
      .then(
        () => callback(null),
        (error) => callback(error),
      );
  }
}