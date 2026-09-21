import db from '../../database/knex.js';

const activityTypes = new Set([
  'CALL',
  'EMAIL',
  'WHATSAPP',
  'LINKEDIN',
  'MEETING',
  'REFERRAL',
  'FOLLOW_UP',
  'NOTE',
  'PITCH',
  'COMMERCIAL_DISCUSSION',
  'CONTRACT',
  'ONBOARDING',
  'OTHER',
]);

/*
 * Internal notes and administrative records do not count
 * as contact attempts.
 */
const touchTypes = new Set([
  'CALL',
  'EMAIL',
  'WHATSAPP',
  'LINKEDIN',
  'MEETING',
  'FOLLOW_UP',
]);

function repositoryError(code, message) {
  const error = new Error(message);
  error.code = code;

  return error;
}

function scopedLeadQuery(user, connection = db) {
  const query = connection('leads');

  if (user.role !== 'SUPER_ADMIN') {
    query.where('owner_id', user.id);
  }

  return query;
}

function scopedActivityQuery(user, connection = db) {
  const query = connection('activities as a')
    .join('leads as l', 'l.id', 'a.lead_id')
    .join('companies as c', 'c.id', 'l.company_id')
    .join(
      'users as creator',
      'creator.id',
      'a.created_by_user_id',
    )
    .leftJoin('contacts as ct', 'ct.id', 'a.contact_id');

  if (user.role !== 'SUPER_ADMIN') {
    query.where('l.owner_id', user.id);
  }

  return query;
}

const activityColumns = [
  'a.id',
  'a.lead_id',
  'l.lead_code',
  'l.company_id',
  'c.name as company_name',
  'a.contact_id',
  'ct.name as contact_name',
  'a.activity_type',
  'a.direction',
  'a.subject',
  'a.notes',
  'a.outcome',
  'a.occurred_at',
  'a.created_by_user_id',
  'creator.name as created_by_name',
  'a.created_at',
  'a.updated_at',
];

function serializeActivity(row) {
  if (!row) {
    return null;
  }

  return {
    ...row,
    id: String(row.id),
    lead_id: String(row.lead_id),
    company_id: String(row.company_id),
    contact_id:
      row.contact_id === null
        ? null
        : String(row.contact_id),
    created_by_user_id: String(row.created_by_user_id),
  };
}

function optionalText(value) {
  if (typeof value !== 'string') {
    return null;
  }

  return value.trim() || null;
}

function toOccurredAt(value) {
  /*
   * The validator must require an ISO datetime containing
   * an explicit timezone. Reject timezone-free values here too.
   */
  if (
    typeof value !== 'string' ||
    !/(?:Z|[+-]\d{2}:\d{2})$/.test(value)
  ) {
    throw repositoryError(
      'ACTIVITY_INVALID_TIME',
      'Enter an activity time with an explicit timezone.',
    );
  }

  const timestamp = Date.parse(value);

  if (
    !Number.isFinite(timestamp) ||
    timestamp > Date.now()
  ) {
    throw repositoryError(
      'ACTIVITY_INVALID_TIME',
      'Activity time must be a valid date and cannot be in the future.',
    );
  }

  const date = new Date(timestamp);
  const year = date.getUTCFullYear();

  if (year < 1000 || year > 9999) {
    throw repositoryError(
      'ACTIVITY_INVALID_TIME',
      'Activity time is outside the supported date range.',
    );
  }

  return date
    .toISOString()
    .slice(0, 23)
    .replace('T', ' ');
}

/*
 * List activities for permitted leads.
 *
 * Expected validated filters:
 * {
 *   lead_id?: string,
 *   activity_type?: string,
 *   search?: string,
 *   page: number,
 *   limit: number
 * }
 *
 * Returns null when a specifically requested lead
 * does not exist or is inaccessible.
 */
export async function listActivities(user, filters) {
  const {
    lead_id,
    activity_type,
    search,
    page,
    limit,
  } = filters;

  if (lead_id) {
    const lead = await scopedLeadQuery(user)
      .where('id', lead_id)
      .select('id')
      .first();

    if (!lead) {
      return null;
    }
  }

  const query = scopedActivityQuery(user);

  if (lead_id) {
    query.andWhere('a.lead_id', lead_id);
  }

  if (activity_type) {
    query.andWhere('a.activity_type', activity_type);
  }

  if (search) {
    const pattern = `%${search.replace(/[!%_]/g, '!$&')}%`;

    query.andWhere(function () {
      this.whereRaw("a.subject LIKE ? ESCAPE '!'", [pattern])
        .orWhereRaw("a.notes LIKE ? ESCAPE '!'", [pattern])
        .orWhereRaw("c.name LIKE ? ESCAPE '!'", [pattern])
        .orWhereRaw("ct.name LIKE ? ESCAPE '!'", [pattern])
        .orWhereRaw("l.lead_code LIKE ? ESCAPE '!'", [pattern]);
    });
  }

  const count = await query
    .clone()
    .count({ total: 'a.id' })
    .first();

  const rows = await query
    .clone()
    .select(activityColumns)
    .orderBy('a.occurred_at', 'desc')
    .orderBy('a.id', 'desc')
    .limit(limit)
    .offset((page - 1) * limit);

  const total = Number(count.total);

  return {
    data: rows.map(serializeActivity),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    },
  };
}

/*
 * Returns null for a missing or inaccessible activity.
 */
export async function findActivity(
  user,
  id,
  connection = db,
) {
  const row = await scopedActivityQuery(user, connection)
    .where('a.id', id)
    .select(activityColumns)
    .first();

  return serializeActivity(row);
}

/*
 * Insert an activity and update the lead's last-touch time
 * in the same transaction.
 *
 * values must first pass the activity creation validator.
 * The browser cannot choose the activity's creator.
 */
export async function insertActivity(user, values) {
  return db.transaction(async (trx) => {
    const actor = await trx('users')
      .where({ id: user.id })
      .select('id', 'role', 'status')
      .forUpdate()
      .first();

    if (!actor || actor.status !== 'ACTIVE') {
      throw repositoryError(
        'ACTIVITY_ACTOR_INACTIVE',
        'Your account is not active. Sign in again.',
      );
    }

    if (!['SUPER_ADMIN', 'OWNER'].includes(actor.role)) {
      throw repositoryError(
        'ACTIVITY_CREATE_FORBIDDEN',
        'You do not have permission to record activities.',
      );
    }

    const currentUser = {
      id: String(actor.id),
      role: actor.role,
    };

    const lead = await scopedLeadQuery(currentUser, trx)
      .where('id', values.lead_id)
      .select('id', 'company_id')
      .forUpdate()
      .first();

    if (!lead) {
      throw repositoryError(
        'ACTIVITY_LEAD_FORBIDDEN',
        'Lead not found or you do not have access.',
      );
    }

    /*
     * The activity contact may be any contact at the lead's
     * company, not only its primary contact.
     */
    let contactId = null;

    if (values.contact_id) {
      const contact = await trx('contacts')
        .where({
          id: values.contact_id,
          company_id: lead.company_id,
        })
        .select('id')
        .forUpdate()
        .first();

      if (!contact) {
        throw repositoryError(
          'ACTIVITY_CONTACT_INVALID',
          'Select a contact belonging to the lead’s company.',
        );
      }

      contactId = String(contact.id);
    }

    if (!activityTypes.has(values.activity_type)) {
      throw repositoryError(
        'ACTIVITY_TYPE_INVALID',
        'Select a valid activity type.',
      );
    }

    const direction = values.direction || null;

    if (
      direction !== null &&
      !['INBOUND', 'OUTBOUND'].includes(direction)
    ) {
      throw repositoryError(
        'ACTIVITY_DIRECTION_INVALID',
        'Select a valid activity direction.',
      );
    }

    if (values.activity_type === 'NOTE' && direction !== null) {
      throw repositoryError(
        'ACTIVITY_DIRECTION_INVALID',
        'Internal notes must not have an inbound or outbound direction.',
      );
    }

    const subject = optionalText(values.subject);
    const notes = optionalText(values.notes);
    const outcome = optionalText(values.outcome);

    if (!subject && !notes) {
      throw repositoryError(
        'ACTIVITY_CONTENT_REQUIRED',
        'Enter an activity subject or notes.',
      );
    }

    const occurredAt = toOccurredAt(values.occurred_at);

    await trx('activities').insert({
      lead_id: lead.id,
      contact_id: contactId,
      activity_type: values.activity_type,
      direction,
      subject,
      notes,
      outcome,
      occurred_at: occurredAt,
      created_by_user_id: actor.id,
    });

    /*
     * LAST_INSERT_ID is connection-specific.
     * The transaction keeps this query on the same connection.
     * Casting to CHAR preserves BIGINT precision.
     */
    const [insertedRows] = await trx.raw(
      'SELECT CAST(LAST_INSERT_ID() AS CHAR) AS id',
    );

    const activityId = insertedRows[0]?.id;

    if (!activityId) {
      throw new Error('Unable to retrieve the created activity ID.');
    }

    /*
     * Backdated activity must not move last_touch_at backwards.
     * Keep comparison in SQL to avoid timezone/precision changes.
     *
     * Last touch here means latest contact attempt, not consent
     * or proof that the contact responded.
     */
    if (touchTypes.has(values.activity_type)) {
      await trx('leads')
        .where('id', lead.id)
        .andWhere(function () {
          this.whereNull('last_touch_at')
            .orWhere('last_touch_at', '<', occurredAt);
        })
        .update({
          last_touch_at: occurredAt,
          updated_at: trx.raw('CURRENT_TIMESTAMP(3)'),
          version: trx.raw('version + 1'),
        });
    }

    const activity = await findActivity(
      currentUser,
      activityId,
      trx,
    );

    if (!activity) {
      throw new Error('Unable to load the created activity.');
    }

    return activity;
  });
}