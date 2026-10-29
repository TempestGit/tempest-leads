
import ApiError from "../../utils/ApiError.js";

import {
  insertNotification,
  findNotifications,
  findActiveSuperAdminIds,
  findNotificationUserDetails,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
  clearNotifications,
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
  "ACTIVITY_CREATED",
]);

const normalizeId = (value) => {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const id = Number(value);

  return Number.isSafeInteger(id) && id > 0
    ? id
    : null;
};

const isSafeInternalPath = (value) =>
  typeof value === "string" &&
  value.startsWith("/") &&
  !value.startsWith("//") &&
  !value.includes("\\") &&
  !/[\r\n]/.test(value);

const removeReason = (message) =>
  String(message ?? "")
    .replace(/\s*Reason:\s*.*$/i, "")
    .trim()
    .replace(/\.\s*$/, "");

const finishSentence = (value) => {
  const text = String(value ?? "")
    .trim()
    .replace(/[.\s]+$/, "");

  return text ? `${text}.` : "";
};

const buildOwnerContent = ({
  type,
  title,
  message,
  actorName,
  actorIsAdmin,
}) => {
  const actor = actorName || "Another CRM user";

  if (type === "LEAD_STAGE_CHANGED") {
    const clean = removeReason(message);

    return {
      title: "Lead stage changed",
      message: finishSentence(
        `${clean}. Updated by ${actor}`
      ),
    };
  }

  if (type === "LEAD_ASSIGNED") {
    return {
      title: "Lead assigned to you",
      message: finishSentence(
        message
          .replace(/\s*Reason:\s*.*$/i, "")
          .trim()
      ),
    };
  }

  const suffix = actorIsAdmin
    ? `Updated by ${actor}`
    : `Updated by ${actor}`;

  return {
    title,
    message: finishSentence(
      `${message} ${suffix}`
    ),
  };
};

const buildAdminContent = ({
  type,
  title,
  message,
  ownerName,
  actorName,
}) => {
  const owner = ownerName || "a CRM user";
  const actor = actorName || "a CRM user";

  if (type === "LEAD_ASSIGNED") {
    return {
      title: `Lead assigned to ${owner}`,
      message: finishSentence(
        message
          .replace(/\s*Reason:\s*.*$/i, "")
          .replace(
            /\breassigned to you\b/gi,
            `reassigned to ${owner}`
          )
          .replace(
            /\bassigned to you\b/gi,
            `assigned to ${owner}`
          )
      ),
    };
  }

  if (type === "LEAD_STAGE_CHANGED") {
    return {
      title: "Lead stage changed",
      message: finishSentence(
        `${removeReason(message)}. Updated by ${actor}`
      ),
    };
  }

  if (type === "ACTIVITY_CREATED") {
    return {
      title: "Activity added",
      message: finishSentence(
        `${message} Added by ${actor}`
      ),
    };
  }

  if (
    type === "MEETING_SCHEDULED" ||
    type === "MEETING_REMINDER"
  ) {
    return {
      title,
      message: finishSentence(
        `${message} Lead owner: ${owner}. Updated by ${actor}`
      ),
    };
  }

  if (type.startsWith("FOLLOWUP_")) {
    return {
      title,
      message: finishSentence(
        `${message} Lead owner: ${owner}. Updated by ${actor}`
      ),
    };
  }

  if (type === "NURTURE_RECONNECT") {
    return {
      title,
      message: finishSentence(
        `${message} Responsible user: ${owner}. Updated by ${actor}`
      ),
    };
  }

  return {
    title,
    message: finishSentence(
      `${message} Updated by ${actor}`
    ),
  };
};

/*
 * Central notification dispatcher.
 *
 * recipientUserId:
 *   The lead's respective owner / intended recipient.
 *
 * actorUserId:
 *   The authenticated user performing the action.
 *
 * Routing:
 *   Owner action -> Super Admin
 *   Admin action -> Owner
 *   Other user action -> Owner + Super Admin
 *   Automated event -> Intended user + Super Admin
 *
 * Security alerts remain private.
 */
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
  const ownerId = normalizeId(recipientUserId);
  const actorId = normalizeId(actorUserId);

  if (!ownerId) {
    throw new Error(
      "A valid notification recipient is required."
    );
  }

  if (!allowedTypes.has(type)) {
    throw new Error(
      `Unsupported notification type: ${type}`
    );
  }

  const normalizedTitle = String(title ?? "").trim();

  const normalizedMessage =
    type === "LEAD_STAGE_CHANGED"
      ? finishSentence(removeReason(message))
      : String(message ?? "").trim();

  if (!normalizedTitle || !normalizedMessage) {
    throw new Error(
      "Notification title and message are required."
    );
  }

  if (normalizedTitle.length > 255) {
    throw new Error(
      "Notification title is too long."
    );
  }

  if (normalizedMessage.length > 1000) {
    throw new Error(
      "Notification message is too long."
    );
  }

  const safeActionUrl = isSafeInternalPath(actionUrl)
    ? actionUrl
    : null;

  const baseData = {
    actorUserId: actorId,
    type,
    entityType,
    entityId,
    actionUrl: safeActionUrl,
  };

  if (type === "SECURITY_ALERT") {
    return insertNotification(
      {
        ...baseData,
        recipientUserId: ownerId,
        title: normalizedTitle,
        message: normalizedMessage,
      },
      connection
    );
  }

  const adminIds = [
    ...new Set(
      (await findActiveSuperAdminIds(connection))
        .map(normalizeId)
        .filter(Boolean)
    ),
  ];

  const users = await findNotificationUserDetails(
    [
      ownerId,
      ...(actorId ? [actorId] : []),
    ],
    connection
  );

  const userMap = new Map(
    users.map((user) => [
      Number(user.id),
      user,
    ])
  );

  const owner = userMap.get(ownerId);
  const actor = actorId
    ? userMap.get(actorId)
    : null;

  const actorIsAdmin =
    actor?.role === "SUPER_ADMIN";

  const actorName =
    actor?.fullName ||
    (actorId ? "a CRM user" : "System");

  const ownerName =
    owner?.fullName || "a CRM user";

  const isAutomated = actorId === null;

  /*
   * Do not notify the actor about their own action.
   *
   * For automated events, notify the intended
   * recipient even when that user is an Admin.
   */
  const recipientIds = new Set();

  if (isAutomated) {
    recipientIds.add(ownerId);

    for (const adminId of adminIds) {
      recipientIds.add(adminId);
    }
  } else if (actorIsAdmin) {
    if (ownerId !== actorId) {
      recipientIds.add(ownerId);
    }
  } else {
    if (ownerId !== actorId) {
      recipientIds.add(ownerId);
    }

    for (const adminId of adminIds) {
      if (adminId !== actorId) {
        recipientIds.add(adminId);
      }
    }
  }

  if (recipientIds.size === 0) {
    return null;
  }

  const ownerContent = buildOwnerContent({
    type,
    title: normalizedTitle,
    message: normalizedMessage,
    actorName,
    actorIsAdmin,
  });

  const adminContent = buildAdminContent({
    type,
    title: normalizedTitle,
    message: normalizedMessage,
    ownerName,
    actorName,
  });

  let originalNotificationId = null;

  for (const recipientId of recipientIds) {
    const recipientIsAdmin =
      adminIds.includes(recipientId);

    const content = recipientIsAdmin
      ? adminContent
      : ownerContent;

    const notificationId = await insertNotification(
      {
        ...baseData,
        recipientUserId: recipientId,
        title: content.title.slice(0, 255),
        message: content.message.slice(0, 1000),
      },
      connection
    );

    if (recipientId === ownerId) {
      originalNotificationId = notificationId;
    }
  }

  return originalNotificationId;
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
      totalPages: Math.ceil(
        result.total / limit
      ),
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

  return {
    updated: true,
  };
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

  return {
    deleted: true,
  };
};

export const clearNotificationsService = async (
  userId
) => ({
  deletedCount: await clearNotifications(userId),
});