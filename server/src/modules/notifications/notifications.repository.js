
import pool from "../../config/db.js";

const dbFor = (connection) => connection || pool;

const toUtcIso = (value) => {
  if (value == null) return null;

  if (value instanceof Date) {
    return Number.isNaN(value.getTime())
      ? null
      : value.toISOString();
  }

  const raw = String(value).trim();

  if (!raw) return null;

  const normalized = raw.replace(" ", "T");

  const hasZone = /(?:Z|[+-]\d{2}:\d{2})$/i.test(
    normalized
  );

  const date = new Date(
    hasZone ? normalized : `${normalized}Z`
  );

  return Number.isNaN(date.getTime())
    ? null
    : date.toISOString();
};

const mapNotification = (row) => ({
  id: String(row.id),
  recipientUserId: String(row.user_id),
  actorUserId: null,
  type: row.notification_type,
  title: row.title,
  message: row.message,
  entityType: row.lead_id == null ? null : "LEAD",
  entityId:
    row.lead_id == null ? null : String(row.lead_id),
  actionUrl: row.action_url,
  isRead: row.read_at != null,
  readAt: toUtcIso(row.read_at),
  createdAt: toUtcIso(row.created_at),
});

export const insertNotification = async (
  {
    recipientUserId,
    actorUserId = null,
    type,
    title,
    message,
    entityType = null,
    entityId = null,
    actionUrl = null,
  },
  connection = null
) => {
  void actorUserId;

  const leadId =
    entityType === "LEAD" && entityId != null
      ? entityId
      : null;

  const [result] = await dbFor(connection).query(
    `
      INSERT INTO notifications (
        user_id,
        lead_id,
        notification_type,
        title,
        message,
        action_url,
        created_at
      )
      VALUES (?, ?, ?, ?, ?, ?, UTC_TIMESTAMP())
    `,
    [
      recipientUserId,
      leadId,
      type,
      title,
      message,
      actionUrl,
    ]
  );

  return result.insertId;
};

export const findNotifications = async ({
  userId,
  filter = "all",
  page = 1,
  limit = 20,
}) => {
  const offset = (page - 1) * limit;

  const readCondition =
    filter === "unread"
      ? "AND read_at IS NULL"
      : filter === "read"
        ? "AND read_at IS NOT NULL"
        : "";

  const [rows] = await pool.query(
    `
      SELECT
        id,
        user_id,
        lead_id,
        notification_type,
        title,
        message,
        action_url,
        read_at,
        created_at
      FROM notifications
      WHERE user_id = ?
      ${readCondition}
      ORDER BY created_at DESC, id DESC
      LIMIT ? OFFSET ?
    `,
    [userId, limit, offset]
  );

  const [countRows] = await pool.query(
    `
      SELECT
        COUNT(*) AS total_count,
        COALESCE(
          SUM(CASE WHEN read_at IS NULL THEN 1 ELSE 0 END),
          0
        ) AS unread_count,
        COALESCE(
          SUM(CASE WHEN read_at IS NOT NULL THEN 1 ELSE 0 END),
          0
        ) AS read_count
      FROM notifications
      WHERE user_id = ?
    `,
    [userId]
  );

  const totalCount = Number(countRows[0]?.total_count ?? 0);
  const unreadCount = Number(countRows[0]?.unread_count ?? 0);
  const readCount = Number(countRows[0]?.read_count ?? 0);

  const total =
    filter === "unread"
      ? unreadCount
      : filter === "read"
        ? readCount
        : totalCount;

  return {
    notifications: rows.map(mapNotification),
    total,
    totalCount,
    unreadCount,
    readCount,
  };
};

export const markNotificationRead = async ({
  notificationId,
  userId,
}) => {
  const [result] = await pool.query(
    `
      UPDATE notifications
      SET read_at = COALESCE(read_at, UTC_TIMESTAMP())
      WHERE id = ?
        AND user_id = ?
    `,
    [notificationId, userId]
  );

  return result.affectedRows > 0;
};

export const markAllNotificationsRead = async (userId) => {
  const [result] = await pool.query(
    `
      UPDATE notifications
      SET read_at = UTC_TIMESTAMP()
      WHERE user_id = ?
        AND read_at IS NULL
    `,
    [userId]
  );

  return result.affectedRows;
};

export const deleteNotification = async ({
  notificationId,
  userId,
}) => {
  const [result] = await pool.query(
    `
      DELETE FROM notifications
      WHERE id = ?
        AND user_id = ?
    `,
    [notificationId, userId]
  );

  return result.affectedRows > 0;
};