import {
  createNotificationService,
} from "../notifications/notifications.service.js";

/*
|--------------------------------------------------------------------------
| Helpers
|--------------------------------------------------------------------------
*/

const normalizeId = (value) => {
  if (value === null || value === undefined) {
    return null;
  }

  const id = Number(value);

  if (!Number.isSafeInteger(id) || id <= 0) {
    return null;
  }

  return id;
};

const normalizeText = (value, fallback = "") => {
  const text = String(value ?? "").trim();

  return text || fallback;
};

const createLeadNotification = async (
  {
    recipientUserId,
    actorUserId,
    type,
    title,
    message,
    leadId,
  },
  connection
) => {
  const recipientId = normalizeId(recipientUserId);
  const entityId = normalizeId(leadId);

  if (!recipientId || !entityId) {
    return null;
  }

  return createNotificationService(
    {
      recipientUserId: recipientId,

      actorUserId:
        normalizeId(actorUserId),

      type,

      title,

      message,

      entityType: "LEAD",

      entityId,

      actionUrl: `/leads/${entityId}`,
    },
    connection
  );
};

/*
|--------------------------------------------------------------------------
| New Lead Assignment
|--------------------------------------------------------------------------
*/

export const notifyLeadCreated = async (
  {
    leadId,
    leadCode,
    ownerId,
    actorUserId,
    companyName,
  },
  connection
) => {
  const leadLabel = normalizeText(
    leadCode,
    `#${leadId}`
  );

  const company = normalizeText(
    companyName,
    "a company"
  );

  return createLeadNotification(
    {
      recipientUserId: ownerId,

      actorUserId,

      type: "LEAD_ASSIGNED",

      title: "New lead assigned",

      message:
        `Lead ${leadLabel} for ${company} ` +
        "has been assigned to you.",

      leadId,
    },
    connection
  );
};

/*
|--------------------------------------------------------------------------
| Lead Reassignment
|--------------------------------------------------------------------------
*/

export const notifyLeadOwnerChanged = async (
  {
    leadId,
    leadCode,
    previousOwnerId,
    newOwnerId,
    actorUserId,
    reason,
  },
  connection
) => {
  const oldOwner = normalizeId(previousOwnerId);
  const newOwner = normalizeId(newOwnerId);

  if (!newOwner || oldOwner === newOwner) {
    return null;
  }

  const leadLabel = normalizeText(
    leadCode,
    `#${leadId}`
  );

  const reasonText = normalizeText(reason);

  return createLeadNotification(
    {
      recipientUserId: newOwner,

      actorUserId,

      type: "LEAD_ASSIGNED",

      title: "Lead assigned to you",

      message:
        `Lead ${leadLabel} has been reassigned ` +
        "to you." +
        (reasonText
          ? ` Reason: ${reasonText}.`
          : ""),

      leadId,
    },
    connection
  );
};

/*
|--------------------------------------------------------------------------
| Lead Stage Changed
|--------------------------------------------------------------------------
*/

export const notifyLeadStageChanged = async (
  {
    leadId,
    leadCode,
    ownerId,
    actorUserId,
    previousStage,
    newStage,
    reason,
  },
  connection
) => {
  const previous = normalizeText(
    previousStage,
    "Unknown"
  );

  const next = normalizeText(
    newStage,
    "Unknown"
  );

  if (previous === next) {
    return null;
  }

  const leadLabel = normalizeText(
    leadCode,
    `#${leadId}`
  );

  const reasonText = normalizeText(reason);

  return createLeadNotification(
    {
      recipientUserId: ownerId,

      actorUserId,

      type: "LEAD_STAGE_CHANGED",

      title: "Lead stage updated",

      message:
        `Lead ${leadLabel} moved from ` +
        `${previous} to ${next}.` +
        (reasonText
          ? ` Reason: ${reasonText}.`
          : ""),

      leadId,
    },
    connection
  );
};