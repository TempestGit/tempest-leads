
import pool from "../../config/db.js";

import {
  createNotificationService,
} from "./notifications.service.js";

const BATCH_SIZE = 200;
const REMINDER_WINDOW_MINUTES = 15;

const findUpcomingMeetings = async () => {
  const [rows] = await pool.query(
    `
      SELECT
        m.id,
        m.meeting_code,
        m.title,
        m.starts_at,
        m.lead_id,
        l.owner_id AS recipient_user_id
      FROM meetings m
      INNER JOIN leads l
        ON l.id = m.lead_id
      INNER JOIN users u
        ON u.id = l.owner_id
      WHERE m.status IN ('SCHEDULED', 'RESCHEDULED')
        AND m.starts_at > UTC_TIMESTAMP()
        AND m.starts_at <= DATE_ADD(
          UTC_TIMESTAMP(),
          INTERVAL ? MINUTE
        )
        AND l.deleted_at IS NULL
        AND u.status = 'ACTIVE'
        AND NOT EXISTS (
          SELECT 1
          FROM notification_reminder_deliveries d
          WHERE d.reminder_type = 'MEETING_REMINDER'
            AND d.entity_id = m.id
            AND d.recipient_user_id = l.owner_id
            AND d.scheduled_for = m.starts_at
        )
      ORDER BY m.starts_at ASC, m.id ASC
      LIMIT ?
    `,
    [REMINDER_WINDOW_MINUTES, BATCH_SIZE]
  );

  return rows;
};

const findUpcomingFollowups = async () => {
  const [rows] = await pool.query(
    `
      SELECT
        f.id,
        f.followup_code,
        f.action,
        f.due_at,
        f.lead_id,
        f.assigned_to AS recipient_user_id
      FROM followups f
      INNER JOIN leads l
        ON l.id = f.lead_id
      INNER JOIN users u
        ON u.id = f.assigned_to
      WHERE f.status = 'PENDING'
        AND f.due_at > UTC_TIMESTAMP()
        AND f.due_at <= DATE_ADD(
          UTC_TIMESTAMP(),
          INTERVAL ? MINUTE
        )
        AND l.deleted_at IS NULL
        AND u.status = 'ACTIVE'
        AND NOT EXISTS (
          SELECT 1
          FROM notification_reminder_deliveries d
          WHERE d.reminder_type = 'FOLLOWUP_REMINDER'
            AND d.entity_id = f.id
            AND d.recipient_user_id = f.assigned_to
            AND d.scheduled_for = f.due_at
        )
      ORDER BY f.due_at ASC, f.id ASC
      LIMIT ?
    `,
    [REMINDER_WINDOW_MINUTES, BATCH_SIZE]
  );

  return rows;
};

const findOverdueFollowups = async () => {
  const [rows] = await pool.query(
    `
      SELECT
        f.id,
        f.followup_code,
        f.action,
        f.due_at,
        f.lead_id,
        f.assigned_to AS recipient_user_id
      FROM followups f
      INNER JOIN leads l
        ON l.id = f.lead_id
      INNER JOIN users u
        ON u.id = f.assigned_to
      WHERE f.status = 'PENDING'
        AND f.due_at <= UTC_TIMESTAMP()
        AND l.deleted_at IS NULL
        AND u.status = 'ACTIVE'
        AND NOT EXISTS (
          SELECT 1
          FROM notification_reminder_deliveries d
          WHERE d.reminder_type = 'FOLLOWUP_OVERDUE'
            AND d.entity_id = f.id
            AND d.recipient_user_id = f.assigned_to
            AND d.scheduled_for = f.due_at
        )
      ORDER BY f.due_at ASC, f.id ASC
      LIMIT ?
    `,
    [BATCH_SIZE]
  );

  return rows;
};

const deliverReminder = async ({
  reminderType,
  entityId,
  recipientUserId,
  scheduledFor,
  leadId,
  title,
  message,
}) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [claim] = await connection.query(
      `
        INSERT IGNORE INTO notification_reminder_deliveries (
          reminder_type,
          entity_id,
          recipient_user_id,
          scheduled_for,
          created_at
        )
        VALUES (?, ?, ?, ?, UTC_TIMESTAMP())
      `,
      [
        reminderType,
        entityId,
        recipientUserId,
        scheduledFor,
      ]
    );

    if (claim.affectedRows !== 1) {
      await connection.rollback();
      return false;
    }

    const notificationId = await createNotificationService(
      {
        recipientUserId,
        type: reminderType,
        title,
        message,
        entityType: "LEAD",
        entityId: leadId,
        actionUrl: `/leads/${leadId}`,
      },
      connection
    );

    const [linked] = await connection.query(
      `
        UPDATE notification_reminder_deliveries
        SET notification_id = ?
        WHERE id = ?
      `,
      [notificationId, claim.insertId]
    );

    if (linked.affectedRows !== 1) {
      throw new Error(
        "Unable to link notification to reminder delivery."
      );
    }

    await connection.commit();

    return true;
  } catch (error) {
    try {
      await connection.rollback();
    } catch (rollbackError) {
      console.error(
        "[Notification Reminders] Rollback failed:",
        rollbackError
      );
    }

    throw error;
  } finally {
    connection.release();
  }
};

const processBatch = async (rows, buildReminder) => {
  let delivered = 0;
  let skipped = 0;
  let failed = 0;

  for (const row of rows) {
    try {
      const reminder = buildReminder(row);
      const created = await deliverReminder(reminder);

      if (created) {
        delivered += 1;
      } else {
        skipped += 1;
      }
    } catch (error) {
      failed += 1;

      console.error(
        "[Notification Reminders] Delivery failed:",
        {
          recordId: row.id,
          message: error?.message || String(error),
        }
      );
    }
  }

  return {
    scanned: rows.length,
    delivered,
    skipped,
    failed,
  };
};

export const processMeetingReminders = async () => {
  const rows = await findUpcomingMeetings();

  return processBatch(rows, (meeting) => ({
    reminderType: "MEETING_REMINDER",
    entityId: meeting.id,
    recipientUserId: meeting.recipient_user_id,
    scheduledFor: meeting.starts_at,
    leadId: meeting.lead_id,
    title: "Meeting starting soon",
    message:
      `Meeting ${meeting.meeting_code} ` +
      `(${meeting.title}) starts within ` +
      `${REMINDER_WINDOW_MINUTES} minutes.`,
  }));
};

export const processUpcomingFollowupReminders = async () => {
  const rows = await findUpcomingFollowups();

  return processBatch(rows, (followup) => ({
    reminderType: "FOLLOWUP_REMINDER",
    entityId: followup.id,
    recipientUserId: followup.recipient_user_id,
    scheduledFor: followup.due_at,
    leadId: followup.lead_id,
    title: "Follow-up due soon",
    message:
      `Follow-up ${followup.followup_code} ` +
      `is due within ${REMINDER_WINDOW_MINUTES} minutes. ` +
      `Action: ${followup.action}.`,
  }));
};

export const processOverdueFollowupReminders = async () => {
  const rows = await findOverdueFollowups();

  return processBatch(rows, (followup) => ({
    reminderType: "FOLLOWUP_OVERDUE",
    entityId: followup.id,
    recipientUserId: followup.recipient_user_id,
    scheduledFor: followup.due_at,
    leadId: followup.lead_id,
    title: "Follow-up overdue",
    message:
      `Follow-up ${followup.followup_code} ` +
      `is overdue. Action: ${followup.action}.`,
  }));
};

const processSafely = async (name, handler) => {
  try {
    return await handler();
  } catch (error) {
    console.error(
      `[Notification Reminders] ${name} failed:`,
      error
    );

    return {
      scanned: 0,
      delivered: 0,
      skipped: 0,
      failed: 1,
    };
  }
};

export const processAllNotificationReminders = async () => {
  const meetings = await processSafely(
    "Meeting reminders",
    processMeetingReminders
  );

  const upcomingFollowups = await processSafely(
    "Upcoming follow-up reminders",
    processUpcomingFollowupReminders
  );

  const overdueFollowups = await processSafely(
    "Overdue follow-up reminders",
    processOverdueFollowupReminders
  );

  return {
    meetings,
    upcomingFollowups,
    overdueFollowups,
  };
};