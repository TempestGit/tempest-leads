
import ApiError from "../../utils/ApiError.js";

import {
  insertNotification,
  findNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
} from "./notifications.repository.js";

const allowedTypes = new Set([
  "LEAD_ASSIGNED",
  "LEAD_STAGE_CHANGED",
  "MEETING_SCHEDULED",
  "MEETING_REMINDER",
  "FOLLOWUP_SCHEDULED",
  "FOLLOWUP_REMINDER",
  "FOLLOWUP_OVERDUE",
  "NURTURE_RECONNECT",
  "SECURITY_ALERT",
  "GENERAL",
]);

export const createNotificationService = async (
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
  if (
    !Number.isSafeInteger(Number(recipientUserId)) ||
    Number(recipientUserId) <= 0
  ) {
    throw new Error("A valid notification recipient is required.");
  }

  if (!allowedTypes.has(type)) {
    throw new Error(`Unsupported notification type: ${type}`);
  }

  const normalizedTitle = String(title ?? "").trim();
  const normalizedMessage = String(message ?? "").trim();

  if (!normalizedTitle || !normalizedMessage) {
    throw new Error(
      "Notification title and message are required."
    );
  }

  if (normalizedTitle.length > 255) {
    throw new Error("Notification title is too long.");
  }

  if (normalizedMessage.length > 10000) {
    throw new Error("Notification message is too long.");
  }

  const safeActionUrl =
    typeof actionUrl === "string" &&
    actionUrl.startsWith("/") &&
    !actionUrl.startsWith("//") &&
    !actionUrl.includes("\\") &&
    !/[\r\n]/.test(actionUrl)
      ? actionUrl
      : null;

  return insertNotification(
    {
      recipientUserId,
      actorUserId,
      type,
      title: normalizedTitle,
      message: normalizedMessage,
      entityType,
      entityId,
      actionUrl: safeActionUrl,
    },
    connection
  );
};

export const getNotificationsService = async ({
  userId,
  filter = "all",
  page = 1,
  limit = 20,
}) => {
  const result = await findNotifications({
    userId,
    filter,
    page,
    limit,
  });

  return {
    ...result,
    pagination: {
      page,
      limit,
      total: result.total,
      totalPages: Math.ceil(result.total / limit),
    },
  };
};

export const markNotificationReadService = async ({
  notificationId,
  userId,
}) => {
  const found = await markNotificationRead({
    notificationId,
    userId,
  });

  if (!found) {
    throw new ApiError(
      404,
      "Notification not found.",
      [],
      "NOTIFICATION_NOT_FOUND"
    );
  }

  return { updated: true };
};

export const markAllNotificationsReadService = async (
  userId
) => ({
  updatedCount: await markAllNotificationsRead(userId),
});

export const deleteNotificationService = async ({
  notificationId,
  userId,
}) => {
  const found = await deleteNotification({
    notificationId,
    userId,
  });

  if (!found) {
    throw new ApiError(
      404,
      "Notification not found.",
      [],
      "NOTIFICATION_NOT_FOUND"
    );
  }

  return { deleted: true };
};