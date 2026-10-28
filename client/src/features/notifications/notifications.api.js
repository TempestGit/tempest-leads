import apiClient from "../../lib/apiClient.js";

const BASE_URL = "/notifications";
const MAX_LIMIT = 100;
const VALID_FILTERS = new Set(["all", "unread", "read"]);

const positiveInteger = (value, fallback) => {
  const number = Number(value);

  return Number.isSafeInteger(number) && number > 0
    ? number
    : fallback;
};

const validateId = (value) => {
  const id = String(value ?? "").trim();

  if (!/^[1-9]\d*$/.test(id)) {
    throw new Error("A valid notification ID is required.");
  }

  return id;
};

export const getNotificationsRequest = ({
  filter = "all",
  page = 1,
  limit = 20,
  signal,
} = {}) => {
  const normalizedFilter = String(filter).toLowerCase();

  return apiClient.get(BASE_URL, {
    params: {
      filter: VALID_FILTERS.has(normalizedFilter)
        ? normalizedFilter
        : "all",
      page: positiveInteger(page, 1),
      limit: Math.min(
        MAX_LIMIT,
        positiveInteger(limit, 20)
      ),
    },
    ...(signal ? { signal } : {}),
  });
};

export const getUnreadNotificationsRequest = (
  options = {}
) =>
  getNotificationsRequest({
    ...options,
    filter: "unread",
  });

export const getReadNotificationsRequest = (
  options = {}
) =>
  getNotificationsRequest({
    ...options,
    filter: "read",
  });

export const getUnreadNotificationCountRequest = async ({
  signal,
} = {}) => {
  const response = await getNotificationsRequest({
    page: 1,
    limit: 1,
    signal,
  });

  const data = response?.data?.data ?? response?.data;

  const unreadCount = Number(data?.unreadCount);

  if (
    !Number.isSafeInteger(unreadCount) ||
    unreadCount < 0
  ) {
    throw new Error(
      "Invalid unread notification count."
    );
  }

  return { unreadCount };
};

export const markNotificationReadRequest = (id) =>
  apiClient.patch(
    `${BASE_URL}/${encodeURIComponent(
      validateId(id)
    )}/read`
  );

export const markAllNotificationsReadRequest = () =>
  apiClient.patch(`${BASE_URL}/read-all`);

export const deleteNotificationRequest = (id) =>
  apiClient.delete(
    `${BASE_URL}/${encodeURIComponent(
      validateId(id)
    )}`
  );

/*
 * New bulk-clear API.
 *
 * DELETE /api/notifications
 *
 * Response:
 * {
 *   success: true,
 *   message: "...",
 *   data: {
 *     deletedCount: 3
 *   }
 * }
 */
export const clearNotificationsRequest = async () => {
  const response = await apiClient.delete(BASE_URL);

  return response?.data?.data ?? response?.data;
};

// Compatibility aliases for existing consumers.

export const getNotifications = async (options = {}) => {
  const response = await getNotificationsRequest({
    filter: options.unreadOnly
      ? "unread"
      : options.filter,
    page: options.page,
    limit: options.limit,
    signal: options.signal,
  });

  return response.data?.data ?? response.data;
};

export const getUnreadNotificationCount = async (
  options = {}
) => getUnreadNotificationCountRequest(options);

export const markNotificationAsRead = ({
  notificationId,
}) => markNotificationReadRequest(notificationId);

export const markAllNotificationsAsRead = () =>
  markAllNotificationsReadRequest();

export const clearAllNotifications = () =>
  clearNotificationsRequest();

export default {
  getNotificationsRequest,
  getUnreadNotificationsRequest,
  getReadNotificationsRequest,
  getUnreadNotificationCountRequest,
  markNotificationReadRequest,
  markAllNotificationsReadRequest,
  deleteNotificationRequest,
  clearNotificationsRequest,
  getNotifications,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  clearAllNotifications,
};