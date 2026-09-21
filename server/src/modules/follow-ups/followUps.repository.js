import db from '../../database/knex.js';

const IST_OFFSET_MS = 330 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

function toMysqlUtc(date) {
  return date
    .toISOString()
    .slice(0, 23)
    .replace('T', ' ');
}

/*
 * Calculate today's boundaries in IST, then convert them to UTC.
 * This does not depend on the server machine's local timezone.
 */
function getDateBoundaries(now = new Date()) {
  const shifted = new Date(now.getTime() + IST_OFFSET_MS);

  const startOfTodayUtc =
    Date.UTC(
      shifted.getUTCFullYear(),
      shifted.getUTCMonth(),
      shifted.getUTCDate(),
    ) - IST_OFFSET_MS;

  return {
    now: toMysqlUtc(now),

    todayStart: toMysqlUtc(
      new Date(startOfTodayUtc),
    ),

    tomorrowStart: toMysqlUtc(
      new Date(startOfTodayUtc + DAY_MS),
    ),
  };
}

function scopedLeadQuery(user, connection = db) {
  const query = connection('leads');

  if (user.role !== 'SUPER_ADMIN') {
    query.where('owner_id', user.id);
  }

  return query;
}

/*
 * Permissions follow the lead's current owner.
 *
 * The follow-up's recorded owner is retained separately,
 * including on historical completed/rescheduled records.
 */
function scopedFollowUpQuery(user, connection = db) {
  const query = connection('follow_ups as f')
    .join('leads as l', 'l.id', 'f.lead_id')
    .join('companies as c', 'c.id', 'l.company_id')
    .join('contacts as ct', 'ct.id', 'f.contact_id')
    .join('users as owner', 'owner.id', 'f.owner_id')
    .join('users as creator', 'creator.id', 'f.created_by')
    .leftJoin(
      'users as completer',
      'completer.id',
      'f.completed_by',
    );

  if (user.role !== 'SUPER_ADMIN') {
    query.where('l.owner_id', user.id);
  }

  return query;
}

const followUpColumns = [
  'f.id',
  'f.lead_id',
  'l.lead_code',
  'l.stage as lead_stage',
  'l.status as lead_status',
  'l.priority as lead_priority',
  'l.owner_id as lead_owner_id',
  'l.company_id',
  'c.name as company_name',

  'f.contact_id',
  'ct.name as contact_name',
  'ct.phone as contact_phone',
  'ct.whatsapp as contact_whatsapp',
  'ct.email as contact_email',
  'ct.communication_status as contact_communication_status',

  'f.owner_id',
  'owner.name as owner_name',
  'f.created_by',
  'creator.name as created_by_name',

  'f.action',
  'f.due_at',
  'f.status',
  'f.outcome',
  'f.notes',

  'f.completed_at',
  'f.completed_by',
  'completer.name as completed_by_name',

  'f.previous_follow_up_id',
  'f.version',
  'f.created_at',
  'f.updated_at',
];

function serializeFollowUp(row) {
  if (!row) {
    return null;
  }

  const result = { ...row };

  const idFields = [
    'id',
    'lead_id',
    'lead_owner_id',
    'company_id',
    'contact_id',
    'owner_id',
    'created_by',
    'completed_by',
    'previous_follow_up_id',
  ];

  for (const field of idFields) {
    if (result[field] !== null && result[field] !== undefined) {
      result[field] = String(result[field]);
    }
  }

  result.version = Number(result.version);

  return result;
}

function applyViewFilter(query, view, boundaries) {
  switch (view) {
    case 'TODAY':
      query
        .andWhere('f.status', 'PENDING')
        .andWhere('f.due_at', '>=', boundaries.todayStart)
        .andWhere('f.due_at', '<', boundaries.tomorrowStart);
      break;

    case 'UPCOMING':
      query
        .andWhere('f.status', 'PENDING')
        .andWhere('f.due_at', '>=', boundaries.tomorrowStart);
      break;

    case 'OVERDUE':
      query
        .andWhere('f.status', 'PENDING')
        .andWhere('f.due_at', '<', boundaries.now);
      break;

    case 'COMPLETED':
      query.andWhere('f.status', 'COMPLETED');
      break;

    case 'RESCHEDULED':
      query.andWhere('f.status', 'RESCHEDULED');
      break;

    case 'CANCELLED':
      query.andWhere('f.status', 'CANCELLED');
      break;

    case 'ALL':
      break;

    default:
      throw new Error('Unsupported follow-up view.');
  }
}

/*
 * filters must first pass listFollowUpsSchema.
 *
 * Returns null when a specifically requested lead is
 * missing or inaccessible.
 */
export async function listFollowUps(user, filters) {
  const {
    view,
    lead_id,
    owner_id,
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

  const query = scopedFollowUpQuery(user);
  const boundaries = getDateBoundaries();

  applyViewFilter(query, view, boundaries);

  if (lead_id) {
    query.andWhere('f.lead_id', lead_id);
  }

  /*
   * Additional filtering never replaces the ownership scope.
   * This filters the follow-up's recorded assignee.
   */
  if (owner_id) {
    query.andWhere('f.owner_id', owner_id);
  }

  if (search) {
    const pattern = `%${search.replace(/[!%_]/g, '!$&')}%`;

    query.andWhere(function () {
      this.whereRaw("f.action LIKE ? ESCAPE '!'", [pattern])
        .orWhereRaw("c.name LIKE ? ESCAPE '!'", [pattern])
        .orWhereRaw("ct.name LIKE ? ESCAPE '!'", [pattern])
        .orWhereRaw("ct.phone LIKE ? ESCAPE '!'", [pattern])
        .orWhereRaw("ct.email LIKE ? ESCAPE '!'", [pattern])
        .orWhereRaw("l.lead_code LIKE ? ESCAPE '!'", [pattern]);
    });
  }

  const count = await query
    .clone()
    .count({ total: 'f.id' })
    .first();

  const recordsQuery = query
    .clone()
    .select(followUpColumns);

  if (view === 'COMPLETED') {
    recordsQuery
      .orderBy('f.completed_at', 'desc')
      .orderBy('f.id', 'desc');
  } else if (view === 'RESCHEDULED' || view === 'CANCELLED') {
    recordsQuery
      .orderBy('f.updated_at', 'desc')
      .orderBy('f.id', 'desc');
  } else if (view === 'ALL') {
    // Pending work first, then historical records.
    recordsQuery
      .orderByRaw(
        'CASE WHEN f.status = ? THEN 0 ELSE 1 END ASC',
        ['PENDING'],
      )
      .orderBy('f.due_at', 'asc')
      .orderBy('f.id', 'asc');
  } else {
    recordsQuery
      .orderBy('f.due_at', 'asc')
      .orderBy('f.id', 'asc');
  }

  const rows = await recordsQuery
    .limit(limit)
    .offset((page - 1) * limit);

  const total = Number(count.total);

  return {
    data: rows.map(serializeFollowUp),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    },
  };
}

/*
 * Returns null for a missing or inaccessible follow-up.
 * Accepts a transaction for later completion/rescheduling logic.
 */
export async function findFollowUp(
  user,
  id,
  connection = db,
) {
  const row = await scopedFollowUpQuery(user, connection)
    .where('f.id', id)
    .select(followUpColumns)
    .first();

  return serializeFollowUp(row);
}

function followUpError(code, message) {
  const error = new Error(message);
  error.code = code;

  return error;
}

function futureFollowUpTime(value) {
  if (
    typeof value !== 'string' ||
    !/(?:Z|[+-]\d{2}:\d{2})$/.test(value)
  ) {
    throw followUpError(
      'FOLLOW_UP_INVALID_TIME',
      'Enter a follow-up time with an explicit timezone.',
    );
  }

  const timestamp = Date.parse(value);

  if (
    !Number.isFinite(timestamp) ||
    timestamp <= Date.now()
  ) {
    throw followUpError(
      'FOLLOW_UP_INVALID_TIME',
      'Choose a future follow-up date and time.',
    );
  }

  const date = new Date(timestamp);
  const year = date.getUTCFullYear();

  if (year < 1000 || year > 9999) {
    throw followUpError(
      'FOLLOW_UP_INVALID_TIME',
      'Follow-up time is outside the supported date range.',
    );
  }

  return toMysqlUtc(date);
}

/*
 * Lock in this order:
 * actor → lead → follow-up.
 *
 * Locking the lead serializes follow-up changes for that lead.
 */
async function lockFollowUpForChange(trx, user, id) {
  const actor = await trx('users')
    .where({ id: user.id })
    .select('id', 'role', 'status')
    .forUpdate()
    .first();

  if (!actor || actor.status !== 'ACTIVE') {
    throw followUpError(
      'FOLLOW_UP_ACTOR_INACTIVE',
      'Your account is not active. Sign in again.',
    );
  }

  if (!['SUPER_ADMIN', 'OWNER'].includes(actor.role)) {
    throw followUpError(
      'FOLLOW_UP_FORBIDDEN',
      'You do not have permission to change follow-ups.',
    );
  }

  const currentUser = {
    id: String(actor.id),
    role: actor.role,
  };

  // Lookup only. Permission is checked on the locked lead below.
  const reference = await trx('follow_ups')
    .where({ id })
    .select('lead_id')
    .first();

  if (!reference) {
    throw followUpError(
      'FOLLOW_UP_NOT_FOUND',
      'Follow-up not found or you do not have access.',
    );
  }

  const lead = await scopedLeadQuery(currentUser, trx)
    .where('id', reference.lead_id)
    .select('id', 'company_id', 'owner_id', 'status', 'version')
    .forUpdate()
    .first();

  if (!lead) {
    throw followUpError(
      'FOLLOW_UP_NOT_FOUND',
      'Follow-up not found or you do not have access.',
    );
  }

  const followUp = await trx('follow_ups')
    .where({
      id,
      lead_id: lead.id,
    })
    .forUpdate()
    .first();

  if (!followUp) {
    throw followUpError(
      'FOLLOW_UP_NOT_FOUND',
      'Follow-up not found or you do not have access.',
    );
  }

  return {
    currentUser,
    lead,
    followUp,
  };
}

async function changeFollowUp(user, id, input, operation) {
  return db.transaction(async (trx) => {
    const {
      currentUser,
      lead,
      followUp,
    } = await lockFollowUpForChange(trx, user, id);

    if (
      followUp.status !== 'PENDING' ||
      Number(followUp.version) !== input.version
    ) {
      throw followUpError(
        'FOLLOW_UP_CONFLICT',
        'This follow-up has already changed. Reload its latest details.',
      );
    }

    /*
     * Nurture leads can still have reconnect follow-ups.
     * Lost/active-client transitions need their own work rules.
     */
    if (!['OPEN', 'NURTURE'].includes(lead.status)) {
      throw followUpError(
        'FOLLOW_UP_LEAD_CLOSED',
        'This lead is not open for follow-up changes.',
      );
    }

    if (Number(lead.version) >= 4294967295) {
      throw followUpError(
        'FOLLOW_UP_VERSION_LIMIT',
        'The lead has reached its record version limit.',
      );
    }

    /*
     * Preserve the old record's historical owner.
     * Assign the successor to the lead's current active owner.
     */
    const owner = await trx('users')
      .where({ id: lead.owner_id })
      .select('id', 'role', 'status')
      .forUpdate()
      .first();

    if (
      !owner ||
      owner.status !== 'ACTIVE' ||
      !['SUPER_ADMIN', 'OWNER'].includes(owner.role)
    ) {
      throw followUpError(
        'FOLLOW_UP_OWNER_INVALID',
        'The lead must have an active owner before continuing.',
      );
    }

    const contact = await trx('contacts')
      .where({
        id: followUp.contact_id,
        company_id: lead.company_id,
      })
      .select('id')
      .forUpdate()
      .first();

    if (!contact) {
      throw followUpError(
        'FOLLOW_UP_CONTACT_INVALID',
        'The follow-up contact no longer belongs to this company.',
      );
    }

    // Check time after waiting for database locks.
    const nextDueAt = futureFollowUpTime(
      input.next_follow_up_at,
    );

    if (
      operation === 'RESCHEDULE' &&
      String(
        await trx('follow_ups')
          .where({ id })
          .select(
            trx.raw(
              "DATE_FORMAT(due_at, '%Y-%m-%d %H:%i:%s.%f') AS due_value",
            ),
          )
          .first()
          .then((row) => row.due_value),
      ).slice(0, 23) === nextDueAt
    ) {
      throw followUpError(
        'FOLLOW_UP_UNCHANGED_TIME',
        'Choose a different time when rescheduling.',
      );
    }

    const now = toMysqlUtc(new Date());
    const isCompletion = operation === 'COMPLETE';

    const nextAction = input.next_action.trim();

    const updates = isCompletion
      ? {
          status: 'COMPLETED',
          outcome: input.outcome.trim(),
          notes: input.notes.trim(),
          completed_at: now,
          completed_by: currentUser.id,
        }
      : {
          status: 'RESCHEDULED',
          notes: [
            followUp.notes,
            `Rescheduling reason: ${input.reason.trim()}`,
          ]
            .filter(Boolean)
            .join('\n\n'),
        };

    const affectedRows = await trx('follow_ups')
      .where({
        id,
        status: 'PENDING',
        version: input.version,
      })
      .update({
        ...updates,
        version: input.version + 1,
        updated_at: now,
      });

    if (affectedRows !== 1) {
      throw followUpError(
        'FOLLOW_UP_CONFLICT',
        'This follow-up has already changed. Reload its latest details.',
      );
    }

    /*
     * previous_follow_up_id is unique.
     * A follow-up cannot acquire two successor records.
     */
    await trx('follow_ups').insert({
      lead_id: lead.id,
      contact_id: contact.id,
      owner_id: owner.id,
      created_by: currentUser.id,
      action: nextAction,
      due_at: nextDueAt,
      status: 'PENDING',
      previous_follow_up_id: followUp.id,
      version: 1,
      created_at: now,
      updated_at: now,
    });

    const successor = await trx('follow_ups')
      .where({
        previous_follow_up_id: followUp.id,
      })
      .select('id')
      .first();

    if (!successor) {
      throw new Error('Unable to load the successor follow-up.');
    }

    /*
     * Completion records the interaction.
     * Rescheduling records an internal note, not a contact attempt.
     */
    await trx('activities').insert({
        lead_id: lead.id,
        contact_id: contact.id,
        activity_type: isCompletion ? 'FOLLOW_UP' : 'NOTE',
        direction: null,
        subject: isCompletion
            ? 'Follow-up completed'
            : 'Follow-up rescheduled',

        notes: isCompletion
            ? [
                `Action: ${followUp.action}`,
                `Outcome: ${input.outcome.trim()}`,
                input.notes.trim(),
                `Next action: ${nextAction}`,
                `Next follow-up (UTC): ${nextDueAt}`,
            ].join('\n\n')
            : [
                `Previous action: ${followUp.action}`,
                `Reason: ${input.reason.trim()}`,
                `Next action: ${nextAction}`,
                `Next follow-up (UTC): ${nextDueAt}`,
            ].join('\n\n'),

        // Preserve the full outcome in notes without truncating it.
        outcome: null,
        occurred_at: now,
        created_by_user_id: currentUser.id,
        created_at: now,
        updated_at: now,
    });

    /*
     * Keep the lead summary aligned with its earliest pending action,
     * including when more than one pending record exists.
     */
    const nextPending = await trx('follow_ups')
      .where({
        lead_id: lead.id,
        status: 'PENDING',
      })
      .orderBy('due_at', 'asc')
      .orderBy('id', 'asc')
      .select('action', 'due_at')
      .forUpdate()
      .first();

    if (!nextPending) {
      throw new Error('Lead has no pending follow-up after update.');
    }

    const leadUpdates = {
      next_action: nextPending.action,
      next_follow_up_at: nextPending.due_at,
      version: Number(lead.version) + 1,
      updated_at: now,
    };

    if (isCompletion) {
      leadUpdates.last_touch_at = trx.raw(
        'CASE WHEN last_touch_at IS NULL OR last_touch_at < ? THEN ? ELSE last_touch_at END',
        [now, now],
      );
    }

    await trx('leads')
      .where({ id: lead.id })
      .update(leadUpdates);

    const savedFollowUp = await findFollowUp(
      currentUser,
      followUp.id,
      trx,
    );

    const nextFollowUp = await findFollowUp(
      currentUser,
      successor.id,
      trx,
    );

    if (!savedFollowUp || !nextFollowUp) {
      throw new Error('Unable to load the updated follow-up records.');
    }

    return {
      followUp: savedFollowUp,
      nextFollowUp,
    };
  });
}

/*
 * input must pass completeFollowUpSchema.
 */
export function completeFollowUpRecord(user, id, input) {
  return changeFollowUp(user, id, input, 'COMPLETE');
}

/*
 * input must pass rescheduleFollowUpSchema.
 */
export function rescheduleFollowUpRecord(user, id, input) {
  return changeFollowUp(user, id, input, 'RESCHEDULE');
}