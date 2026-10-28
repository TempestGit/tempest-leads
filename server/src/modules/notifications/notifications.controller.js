import {
  getNotificationsService,
  markNotificationReadService,
  markAllNotificationsReadService,
  deleteNotificationService,
  clearNotificationsService,
} from "./notifications.service.js";

import ApiError from "../../utils/ApiError.js";

const positiveInteger = (value, fallback, maximum) => {
  const number = Number(value);

  if (!Number.isSafeInteger(number) || number < 1) {
    return fallback;
  }

  return Math.min(number, maximum);
};

const validateNotificationId = (value) => {
  const id = String(value ?? "").trim();

  if (!/^[1-9]\d*$/.test(id)) {
    throw new ApiError(
      400,
      "A valid notification ID is required.",
      [],
      "INVALID_NOTIFICATION_ID"
    );
  }

  return id;
};

export const listNotificationsController = async (req, res) => {
  const filter = ["all", "unread", "read"].includes(
    req.query.filter
  )
    ? req.query.filter
    : "all";

  const page = positiveInteger(req.query.page, 1, 100000);
  const limit = positiveInteger(req.query.limit, 20, 100);

  const data = await getNotificationsService({
    userId: req.user.id,
    filter,
    page,
    limit,
  });

  res.status(200).json({
    success: true,
    data,
  });
};

export const markNotificationReadController = async (
  req,
  res
) => {
  const data = await markNotificationReadService({
    notificationId: validateNotificationId(
      req.params.notificationId
    ),
    userId: req.user.id,
  });

  res.status(200).json({
    success: true,
    message: "Notification marked as read.",
    data,
  });
};

export const markAllNotificationsReadController = async (
  req,
  res
) => {
  const data = await markAllNotificationsReadService(
    req.user.id
  );

  res.status(200).json({
    success: true,
    message: "All notifications marked as read.",
    data,
  });
};

export const deleteNotificationController = async (
  req,
  res
) => {
  const data = await deleteNotificationService({
    notificationId: validateNotificationId(
      req.params.notificationId
    ),
    userId: req.user.id,
  });

  res.status(200).json({
    success: true,
    message: "Notification deleted.",
    data,
  });
};

export const clearNotificationsController = async (
  req,
  res
) => {
  const data = await clearNotificationsService(
    req.user.id
  );

  res.status(200).json({
    success: true,
    message:
      data.deletedCount === 0
        ? "No notifications to clear."
        : `${data.deletedCount} notification${
            data.deletedCount === 1 ? "" : "s"
          } cleared successfully.`,
    data,
  });
};