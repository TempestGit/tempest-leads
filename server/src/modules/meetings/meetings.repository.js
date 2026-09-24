import crypto from "node:crypto";

import pool from "../../config/db.js";

/*
|--------------------------------------------------------------------------
| Mapper
|--------------------------------------------------------------------------
*/

const mapMeeting = (
  row
) => {
  if (!row) {
    return null;
  }

  let participants = [];

  if (
    row.participantsJson
  ) {
    try {
      participants =
        typeof row.participantsJson ===
        "string"
          ? JSON.parse(
              row.participantsJson
            )
          : row.participantsJson;
    } catch {
      participants = [];
    }
  }

  return {
    ...row,

    id:
      Number(
        row.id
      ),

    leadId:
      Number(
        row.leadId
      ),

    contactId:
      row.contactId
        ? Number(
            row.contactId
          )
        : null,

    participants,
  };
};

/*
|--------------------------------------------------------------------------
| SELECT
|--------------------------------------------------------------------------
*/

const MEETING_SELECT = `
  SELECT
    m.id,

    m.meeting_code
      AS meetingCode,

    m.lead_id
      AS leadId,

    l.lead_code
      AS leadCode,

    c.name
      AS companyName,

    m.contact_id
      AS contactId,

    ct.contact_code
      AS contactCode,

    ct.full_name
      AS contactName,

    m.title,

    m.starts_at
      AS startsAt,

    m.ends_at
      AS endsAt,

    m.meeting_type
      AS meetingType,

    m.status,

    m.participants_json
      AS participantsJson,

    m.meeting_url
      AS meetingUrl,

    m.location,

    m.agenda,

    m.notes,

    m.outcome,

    m.next_action
      AS nextAction,

    m.follow_up_at
      AS followUpAt,

    m.completed_at
      AS completedAt,

    m.completed_by
      AS completedBy,

    m.status_reason
      AS statusReason,

    m.created_by
      AS createdBy,

    creator.full_name
      AS createdByName,

    completer.full_name
      AS completedByName,

    l.owner_id
      AS ownerId,

    owner.full_name
      AS ownerName,

    m.created_at
      AS createdAt,

    m.updated_at
      AS updatedAt

  FROM meetings m

  INNER JOIN leads l
    ON l.id =
      m.lead_id
    AND l.deleted_at
      IS NULL

  INNER JOIN companies c
    ON c.id =
      l.company_id
    AND c.deleted_at
      IS NULL

  LEFT JOIN contacts ct
    ON ct.id =
      COALESCE(
        m.contact_id,
        l.primary_contact_id
      )
    AND ct.deleted_at
      IS NULL

  LEFT JOIN users creator
    ON creator.id =
      m.created_by

  LEFT JOIN users completer
    ON completer.id =
      m.completed_by

  LEFT JOIN users owner
    ON owner.id =
      l.owner_id
`;

/*
|--------------------------------------------------------------------------
| List Meetings
|--------------------------------------------------------------------------
*/

export const listMeetings =
  async ({
    leadId,
    status,
    page,
    limit,
    currentUser,
  }) => {
    const conditions = [];

    const values = [];

    /*
    |--------------------------------------------------------------------------
    | Owner Scope
    |--------------------------------------------------------------------------
    */

    if (
      currentUser.role !==
      "SUPER_ADMIN"
    ) {
      conditions.push(
        "l.owner_id = ?"
      );

      values.push(
        currentUser.id
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Lead
    |--------------------------------------------------------------------------
    */

    if (leadId) {
      conditions.push(
        "l.id = ?"
      );

      values.push(
        leadId
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Status
    |--------------------------------------------------------------------------
    */

    if (status) {
      conditions.push(
        "m.status = ?"
      );

      values.push(
        status
      );
    }

    const whereSql =
      conditions.length
        ? `WHERE ${conditions.join(
            " AND "
          )}`
        : "";

    /*
    |--------------------------------------------------------------------------
    | Count
    |--------------------------------------------------------------------------
    */

    const [
      countRows,
    ] =
      await pool.query(
        `
          SELECT
            COUNT(*) AS total

          FROM meetings m

          INNER JOIN leads l
            ON l.id =
              m.lead_id
            AND l.deleted_at
              IS NULL

          ${whereSql}
        `,
        values
      );

    const total =
      Number(
        countRows[0]
          ?.total || 0
      );

    const offset =
      (
        Number(page) -
        1
      ) *
      Number(limit);

    /*
    |--------------------------------------------------------------------------
    | Rows
    |--------------------------------------------------------------------------
    */

    const [rows] =
      await pool.query(
        `
          ${MEETING_SELECT}

          ${whereSql}

          ORDER BY
            m.starts_at DESC,
            m.id DESC

          LIMIT ?
          OFFSET ?
        `,
        [
          ...values,

          Number(limit),

          Number(offset),
        ]
      );

    return {
      rows:
        rows.map(
          mapMeeting
        ),

      total,
    };
  };

/*
|--------------------------------------------------------------------------
| Find Meeting
|--------------------------------------------------------------------------
*/

export const findMeetingById =
  async (
    meetingId,
    currentUser,
    connection = pool
  ) => {
    const conditions = [
      "m.id = ?",
    ];

    const values = [
      meetingId,
    ];

    if (
      currentUser.role !==
      "SUPER_ADMIN"
    ) {
      conditions.push(
        "l.owner_id = ?"
      );

      values.push(
        currentUser.id
      );
    }

    const [rows] =
      await connection.query(
        `
          ${MEETING_SELECT}

          WHERE
            ${conditions.join(
              " AND "
            )}

          LIMIT 1
        `,
        values
      );

    return mapMeeting(
      rows[0] ||
        null
    );
  };

/*
|--------------------------------------------------------------------------
| Create Meeting
|--------------------------------------------------------------------------
*/

export const createMeeting =
  async (
    {
      leadId,
      contactId,
      title,
      startsAt,
      endsAt,
      meetingType,
      participants,
      location,
      meetingUrl,
      agenda,
      userId,
    },

    connection = pool
  ) => {
    const temporaryCode =
      `TEMP-${crypto.randomUUID()}`;

    const [result] =
      await connection.query(
        `
          INSERT INTO meetings (
            meeting_code,
            lead_id,
            contact_id,
            title,
            starts_at,
            ends_at,
            meeting_type,
            status,
            participants_json,
            meeting_url,
            location,
            agenda,
            notes,
            outcome,
            created_by,
            updated_by
          )
          VALUES (
            ?,
            ?,
            ?,
            ?,
            ?,
            ?,
            ?,
            'SCHEDULED',
            ?,
            ?,
            ?,
            ?,
            NULL,
            NULL,
            ?,
            ?
          )
        `,
        [
          temporaryCode,
          leadId,
          contactId,
          title,
          startsAt,
          endsAt || null,
          meetingType,

          participants?.length
            ? JSON.stringify(
                participants
              )
            : null,

          meetingUrl || null,
          location || null,
          agenda || null,
          userId,
          userId,
        ]
      );

    return Number(
      result.insertId
    );
  };

/*
|--------------------------------------------------------------------------
| Update Meeting Code
|--------------------------------------------------------------------------
*/

export const updateMeetingCode =
  async (
    meetingId,
    meetingCode,
    connection = pool
  ) => {
    await connection.query(
      `
        UPDATE meetings

        SET
          meeting_code = ?

        WHERE id = ?
      `,
      [
        meetingCode,
        meetingId,
      ]
    );
  };

/*
|--------------------------------------------------------------------------
| Complete Meeting
|--------------------------------------------------------------------------
*/

export const completeMeeting =
  async (
    {
      meetingId,
      outcome,
      notes,
      nextAction,
      followUpAt,
      userId,
    },

    connection = pool
  ) => {
    const [result] =
      await connection.query(
        `
          UPDATE meetings

          SET
            status =
              'COMPLETED',

            outcome = ?,

            notes = ?,

            next_action = ?,

            follow_up_at = ?,

            completed_at =
              UTC_TIMESTAMP(),

            completed_by = ?,

            updated_by = ?

          WHERE id = ?
            AND status IN (
                'SCHEDULED',
                'RESCHEDULED'
            )
        `,
        [
          outcome,
          notes,
          nextAction || null,
          followUpAt || null,
          userId,
          userId,
          meetingId,
        ]
      );

    return (
      result.affectedRows >
      0
    );
  };


/*
|--------------------------------------------------------------------------
| Reschedule Meeting
|--------------------------------------------------------------------------
*/

export const rescheduleMeeting =
  async (
    {
      meetingId,
      startsAt,
      endsAt,
      reason,
      userId,
    },

    connection = pool
  ) => {
    const [result] =
      await connection.query(
        `
          UPDATE meetings

          SET
            starts_at = ?,
            ends_at = ?,
            status = 'RESCHEDULED',
            status_reason = ?,
            updated_by = ?

          WHERE id = ?
            AND status IN (
              'SCHEDULED',
              'RESCHEDULED'
            )
        `,
        [
          startsAt,
          endsAt || null,
          reason,
          userId,
          meetingId,
        ]
      );

    return (
      result.affectedRows >
      0
    );
  };

/*
|--------------------------------------------------------------------------
| Cancel Meeting
|--------------------------------------------------------------------------
*/

export const cancelMeeting =
  async (
    {
      meetingId,
      reason,
      userId,
    },

    connection = pool
  ) => {
    const [result] =
      await connection.query(
        `
          UPDATE meetings

          SET
            status = 'CANCELLED',
            status_reason = ?,
            updated_by = ?

          WHERE id = ?
            AND status IN (
              'SCHEDULED',
              'RESCHEDULED'
            )
        `,
        [
          reason,
          userId,
          meetingId,
        ]
      );

    return (
      result.affectedRows >
      0
    );
  };

/*
|--------------------------------------------------------------------------
| Mark No-show
|--------------------------------------------------------------------------
*/

export const markMeetingNoShow =
  async (
    {
      meetingId,
      reason,
      userId,
    },

    connection = pool
  ) => {
    const [result] =
      await connection.query(
        `
          UPDATE meetings

          SET
            status = 'NO_SHOW',
            status_reason = ?,
            updated_by = ?

          WHERE id = ?
            AND status IN (
              'SCHEDULED',
              'RESCHEDULED'
            )
        `,
        [
          reason,
          userId,
          meetingId,
        ]
      );

    return (
      result.affectedRows >
      0
    );
  };