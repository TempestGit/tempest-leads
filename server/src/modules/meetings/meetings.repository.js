import { randomUUID } from 'node:crypto';
import db from '../../database/knex.js';

const IST_OFFSET_MS = 330 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

function toMysqlUtc(date) {
  return date
    .toISOString()
    .slice(0, 23)
    .replace('T', ' ');
}

function getDateBoundaries(now = new Date()) {
  const shifted = new Date(now.getTime() + IST_OFFSET_MS);

  const todayStartUtc =
    Date.UTC(
      shifted.getUTCFullYear(),
      shifted.getUTCMonth(),
      shifted.getUTCDate(),
    ) - IST_OFFSET_MS;

  return {
    now: toMysqlUtc(now),
    todayStart: toMysqlUtc(new Date(todayStartUtc)),
    tomorrowStart: toMysqlUtc(
      new Date(todayStartUtc + DAY_MS),
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
 * Access follows the lead's current owner.
 * Meeting ownership and participant membership do not
 * independently grant access to another owner's lead.
 */
function scopedMeetingQuery(user, connection = db) {
  const query = connection('meetings as m')
    .join('leads as l', 'l.id', 'm.lead_id')
    .join('companies as c', 'c.id', 'l.company_id')
    .join('contacts as ct', 'ct.id', 'm.contact_id')
    .join('users as owner', 'owner.id', 'm.owner_id')
    .join('users as creator', 'creator.id', 'm.created_by');

  if (user.role !== 'SUPER_ADMIN') {
    query.where('l.owner_id', user.id);
  }

  return query;
}

const meetingListColumns = [
  'm.id',
  'm.meeting_code',
  'm.lead_id',
  'l.lead_code',
  'l.status as lead_status',
  'l.stage as lead_stage',
  'l.owner_id as lead_owner_id',
  'l.company_id',
  'c.name as company_name',
  'm.contact_id',
  'ct.name as contact_name',
  'm.title',
  'm.meeting_type',
  'm.starts_at',
  'm.ends_at',
  'm.location',
  'm.meeting_url',
  'm.owner_id',
  'owner.name as owner_name',
  'm.created_by',
  'creator.name as created_by_name',
  'm.status',
  'm.version',
  'm.created_at',
  'm.updated_at',
];

function serializeMeeting(row) {
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
    'status_changed_by',
    'previous_meeting_id',
    'completion_activity_id',
    'next_follow_up_id',
  ];

  for (const field of idFields) {
    if (result[field] !== null && result[field] !== undefined) {
      result[field] = String(result[field]);
    }
  }

  result.version = Number(result.version);

  return result;
}

function serializeParticipant(row) {
  return {
    ...row,
    id: String(row.id),
    meeting_id: String(row.meeting_id),
    user_id:
      row.user_id === null ? null : String(row.user_id),
    contact_id:
      row.contact_id === null ? null : String(row.contact_id),
  };
}

function applyViewFilter(query, view, boundaries) {
  switch (view) {
    case 'TODAY':
      query
        .andWhere('m.status', 'SCHEDULED')
        .andWhere('m.starts_at', '>=', boundaries.todayStart)
        .andWhere('m.starts_at', '<', boundaries.tomorrowStart);
      break;

    case 'UPCOMING':
      query
        .andWhere('m.status', 'SCHEDULED')
        .andWhere('m.starts_at', '>=', boundaries.tomorrowStart);
      break;

    case 'PAST_DUE':
      // A meeting becomes past due after its scheduled end.
      query
        .andWhere('m.status', 'SCHEDULED')
        .andWhere('m.ends_at', '<', boundaries.now);
      break;

    case 'COMPLETED':
      query.andWhere('m.status', 'COMPLETED');
      break;

    case 'RESCHEDULED':
      query.andWhere('m.status', 'RESCHEDULED');
      break;

    case 'CANCELLED':
      query.andWhere('m.status', 'CANCELLED');
      break;

    case 'NO_SHOW':
      query.andWhere('m.status', 'NO_SHOW');
      break;

    case 'ALL':
      break;

    default:
      throw new Error('Unsupported meeting view.');
  }
}

/*
 * filters must first pass listMeetingsSchema.
 *
 * Returns null when a specifically requested lead
 * is missing or inaccessible.
 */
export async function listMeetings(user, filters) {
  const {
    view,
    lead_id,
    owner_id,
    meeting_type,
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

  const query = scopedMeetingQuery(user);

  applyViewFilter(query, view, getDateBoundaries());

  if (lead_id) {
    query.andWhere('m.lead_id', lead_id);
  }

  if (owner_id) {
    query.andWhere('m.owner_id', owner_id);
  }

  if (meeting_type) {
    query.andWhere('m.meeting_type', meeting_type);
  }

  if (search) {
    const pattern = `%${search.replace(/[!%_]/g, '!$&')}%`;

    query.andWhere(function () {
      this.whereRaw("m.title LIKE ? ESCAPE '!'", [pattern])
        .orWhereRaw("m.meeting_code LIKE ? ESCAPE '!'", [pattern])
        .orWhereRaw("c.name LIKE ? ESCAPE '!'", [pattern])
        .orWhereRaw("ct.name LIKE ? ESCAPE '!'", [pattern])
        .orWhereRaw("l.lead_code LIKE ? ESCAPE '!'", [pattern])
        .orWhereRaw("m.location LIKE ? ESCAPE '!'", [pattern]);
    });
  }

  const count = await query
    .clone()
    .count({ total: 'm.id' })
    .first();

  const recordsQuery = query
    .clone()
    .select(meetingListColumns);

  if (view === 'COMPLETED') {
    recordsQuery
      .orderBy('m.completed_at', 'desc')
      .orderBy('m.id', 'desc');
  } else if (
    ['RESCHEDULED', 'CANCELLED', 'NO_SHOW'].includes(view)
  ) {
    recordsQuery
      .orderBy('m.status_changed_at', 'desc')
      .orderBy('m.id', 'desc');
  } else if (view === 'ALL') {
    recordsQuery
      .orderByRaw(
        'CASE WHEN m.status = ? THEN 0 ELSE 1 END ASC',
        ['SCHEDULED'],
      )
      .orderBy('m.starts_at', 'asc')
      .orderBy('m.id', 'asc');
  } else {
    recordsQuery
      .orderBy('m.starts_at', 'asc')
      .orderBy('m.id', 'asc');
  }

  const rows = await recordsQuery
    .limit(limit)
    .offset((page - 1) * limit);

  const total = Number(count.total);

  return {
    data: rows.map(serializeMeeting),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    },
  };
}

/*
 * Returns null for a missing or inaccessible meeting.
 * Accepts a transaction for later creation/update operations.
 */
export async function findMeeting(
  user,
  id,
  connection = db,
) {
  const row = await scopedMeetingQuery(user, connection)
    .leftJoin(
      'users as completer',
      'completer.id',
      'm.completed_by',
    )
    .leftJoin(
      'users as status_actor',
      'status_actor.id',
      'm.status_changed_by',
    )
    .where('m.id', id)
    .select(
      ...meetingListColumns,
      'ct.phone as contact_phone',
      'ct.email as contact_email',
      'ct.communication_status as contact_communication_status',
      'm.agenda',
      'm.notes',
      'm.outcome',
      'm.completed_at',
      'm.completed_by',
      'completer.name as completed_by_name',
      'm.status_reason',
      'm.status_changed_at',
      'm.status_changed_by',
      'status_actor.name as status_changed_by_name',
      'm.previous_meeting_id',
      'm.completion_activity_id',
      'm.next_follow_up_id',
    )
    .first();

  if (!row) {
    return null;
  }

  /*
   * Scope this query too, rather than fetching participants
   * solely by a client-provided meeting ID.
   */
  const participants = await scopedMeetingQuery(user, connection)
    .join(
      'meeting_participants as p',
      'p.meeting_id',
      'm.id',
    )
    .where('m.id', id)
    .select(
      'p.id',
      'p.meeting_id',
      'p.user_id',
      'p.contact_id',
      'p.name_snapshot',
      'p.email_snapshot',
      'p.created_at',
    )
    .orderBy('p.id', 'asc');

  return {
    ...serializeMeeting(row),
    participants: participants.map(serializeParticipant),
  };
}

function meetingError(code, message) {
  const error = new Error(message);
  error.code = code;

  return error;
}

function optionalMeetingText(value) {
  return typeof value === 'string'
    ? value.trim() || null
    : null;
}

function validateFutureMeetingRange(startsAt, endsAt) {
  const hasTimezone = (value) =>
    typeof value === 'string' &&
    /(?:Z|[+-]\d{2}:\d{2})$/.test(value);

  if (!hasTimezone(startsAt) || !hasTimezone(endsAt)) {
    throw meetingError(
      'MEETING_INVALID_TIME',
      'Meeting times must include an explicit timezone.',
    );
  }

  const start = Date.parse(startsAt);
  const end = Date.parse(endsAt);

  if (
    !Number.isFinite(start) ||
    !Number.isFinite(end) ||
    start <= Date.now() ||
    end <= start
  ) {
    throw meetingError(
      'MEETING_INVALID_TIME',
      'Choose a future start time and an end time after the start.',
    );
  }

  const startDate = new Date(start);
  const endDate = new Date(end);

  if (
    startDate.getUTCFullYear() < 1000 ||
    startDate.getUTCFullYear() > 9999 ||
    endDate.getUTCFullYear() < 1000 ||
    endDate.getUTCFullYear() > 9999
  ) {
    throw meetingError(
      'MEETING_INVALID_TIME',
      'Meeting times are outside the supported date range.',
    );
  }

  return {
    starts_at: toMysqlUtc(startDate),
    ends_at: toMysqlUtc(endDate),
  };
}

/*
 * Include the meeting owner and primary contact automatically.
 * Deduplicate additional participants against these defaults.
 *
 * Names/emails come from the database, never from the browser.
 */
async function resolveMeetingParticipants(
  trx,
  companyId,
  ownerId,
  primaryContactId,
  additionalParticipants = [],
) {
  if (
    !Array.isArray(additionalParticipants) ||
    additionalParticipants.length > 100
  ) {
    throw meetingError(
      'MEETING_PARTICIPANTS_INVALID',
      'Select at most 100 additional participants.',
    );
  }

  const requested = new Map();

  function addParticipant(participant) {
    const hasUser =
      participant.user_id !== undefined &&
      participant.user_id !== null &&
      participant.user_id !== '';

    const hasContact =
      participant.contact_id !== undefined &&
      participant.contact_id !== null &&
      participant.contact_id !== '';

    if (hasUser === hasContact) {
      throw meetingError(
        'MEETING_PARTICIPANTS_INVALID',
        'Each participant must be either a user or a contact.',
      );
    }

    const type = hasUser ? 'USER' : 'CONTACT';
    const id = String(
      hasUser ? participant.user_id : participant.contact_id,
    );

    requested.set(`${type}:${id}`, { type, id });
  }

  addParticipant({ user_id: ownerId });
  addParticipant({ contact_id: primaryContactId });

  for (const participant of additionalParticipants) {
    addParticipant(participant);
  }

  // Consistent ordering reduces competing participant-lock conflicts.
  const participants = [...requested.values()].sort((a, b) => {
    if (a.type !== b.type) {
      return a.type < b.type ? -1 : 1;
    }

    const left = BigInt(a.id);
    const right = BigInt(b.id);

    return left < right ? -1 : left > right ? 1 : 0;
  });

  const rows = [];

  for (const participant of participants) {
    if (participant.type === 'USER') {
      const user = await trx('users')
        .where({ id: participant.id })
        .select('id', 'name', 'email', 'status', 'role')
        .forUpdate()
        .first();

      if (
        !user ||
        user.status !== 'ACTIVE' ||
        !['SUPER_ADMIN', 'OWNER'].includes(user.role)
      ) {
        throw meetingError(
          'MEETING_PARTICIPANTS_INVALID',
          'One or more selected users are unavailable or inactive.',
        );
      }

      rows.push({
        user_id: user.id,
        contact_id: null,
        name_snapshot: user.name,
        email_snapshot: user.email || null,
      });
    } else {
      const contact = await trx('contacts')
        .where({
          id: participant.id,
          company_id: companyId,
        })
        .select('id', 'name', 'email')
        .forUpdate()
        .first();

      if (!contact) {
        throw meetingError(
          'MEETING_PARTICIPANTS_INVALID',
          'All contact participants must belong to the lead’s company.',
        );
      }

      rows.push({
        user_id: null,
        contact_id: contact.id,
        name_snapshot: contact.name,
        email_snapshot: contact.email || null,
      });
    }
  }

  return rows;
}

/*
 * input must first pass createMeetingSchema.
 *
 * Creates:
 * - Meeting
 * - Participant records
 * - Initial meeting history
 *
 * All three commit or roll back together.
 */
export async function insertMeeting(user, input) {
  return db.transaction(async (trx) => {
    const actor = await trx('users')
      .where({ id: user.id })
      .select('id', 'role', 'status')
      .forUpdate()
      .first();

    if (!actor || actor.status !== 'ACTIVE') {
      throw meetingError(
        'MEETING_ACTOR_INACTIVE',
        'Your account is not active. Sign in again.',
      );
    }

    if (!['SUPER_ADMIN', 'OWNER'].includes(actor.role)) {
      throw meetingError(
        'MEETING_CREATE_FORBIDDEN',
        'You do not have permission to schedule meetings.',
      );
    }

    const currentUser = {
      id: String(actor.id),
      role: actor.role,
    };

    const lead = await scopedLeadQuery(currentUser, trx)
      .where('id', input.lead_id)
      .select('id', 'company_id', 'owner_id', 'status')
      .forUpdate()
      .first();

    if (!lead) {
      throw meetingError(
        'MEETING_LEAD_FORBIDDEN',
        'Lead not found or you do not have access.',
      );
    }

    if (!['OPEN', 'NURTURE'].includes(lead.status)) {
      throw meetingError(
        'MEETING_LEAD_CLOSED',
        'Schedule meetings only for open or nurture leads.',
      );
    }

    const owner = await trx('users')
      .where({ id: lead.owner_id })
      .select('id', 'status', 'role')
      .forUpdate()
      .first();

    if (
      !owner ||
      owner.status !== 'ACTIVE' ||
      !['SUPER_ADMIN', 'OWNER'].includes(owner.role)
    ) {
      throw meetingError(
        'MEETING_OWNER_INVALID',
        'The lead must have an active owner.',
      );
    }

    const contact = await trx('contacts')
      .where({
        id: input.contact_id,
        company_id: lead.company_id,
      })
      .select('id')
      .forUpdate()
      .first();

    if (!contact) {
      throw meetingError(
        'MEETING_CONTACT_INVALID',
        'Select a contact belonging to the lead’s company.',
      );
    }

    const participantRows = await resolveMeetingParticipants(
      trx,
      lead.company_id,
      owner.id,
      contact.id,
      input.participants,
    );

    // Recheck the schedule after waiting for database locks.
    const schedule = validateFutureMeetingRange(
      input.starts_at,
      input.ends_at,
    );

    const meetingCode = `MTG-${randomUUID()}`;
    const now = toMysqlUtc(new Date());

    await trx('meetings').insert({
      meeting_code: meetingCode,
      lead_id: lead.id,
      contact_id: contact.id,

      title: input.title.trim(),
      meeting_type: input.meeting_type,
      starts_at: schedule.starts_at,
      ends_at: schedule.ends_at,

      location: optionalMeetingText(input.location),
      meeting_url: optionalMeetingText(input.meeting_url),
      agenda: optionalMeetingText(input.agenda),

      owner_id: owner.id,
      created_by: actor.id,

      status: 'SCHEDULED',
      status_reason: 'Meeting scheduled.',
      status_changed_at: now,
      status_changed_by: actor.id,

      version: 1,
      created_at: now,
      updated_at: now,
    });

    // Query by unique code to preserve BIGINT precision.
    const inserted = await trx('meetings')
      .where({ meeting_code: meetingCode })
      .select('id')
      .first();

    if (!inserted) {
      throw new Error('Unable to retrieve the created meeting.');
    }

    await trx('meeting_participants').insert(
      participantRows.map((participant) => ({
        ...participant,
        meeting_id: inserted.id,
        created_at: now,
      })),
    );

    const meeting = await findMeeting(
      currentUser,
      inserted.id,
      trx,
    );

    if (!meeting) {
      throw new Error('Unable to load the created meeting details.');
    }

    await trx('meeting_history').insert({
      meeting_id: inserted.id,
      actor_id: actor.id,
      action: 'CREATED',
      reason: 'Meeting scheduled.',
      previous_values: null,
      new_values: JSON.stringify(meeting),
      created_at: now,
    });

    return meeting;
  });
}