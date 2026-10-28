
const DISPLAY_TIME_ZONE = "Asia/Kolkata";

export const parseNotificationTimestamp = (value) => {
  if (value == null || value === "") return null;

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }

  if (typeof value === "number") {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  const raw = String(value).trim();

  if (!raw) return null;

  if (/^\d{10}$/.test(raw)) {
    const date = new Date(Number(raw) * 1000);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  if (/^\d{13}$/.test(raw)) {
    const date = new Date(Number(raw));
    return Number.isNaN(date.getTime()) ? null : date;
  }

  const normalized = raw.replace(
    /^(\d{4}-\d{2}-\d{2})\s+(\d{2}:\d{2})/,
    "$1T$2"
  );

  const hasTimezone = /(?:Z|[+-]\d{2}:\d{2})$/i.test(
    normalized
  );

  const isDateTime =
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2}(?:\.\d+)?)?/.test(
      normalized
    );

  const timestamp =
    isDateTime && !hasTimezone
      ? `${normalized}Z`
      : normalized;

  const date = new Date(timestamp);

  return Number.isNaN(date.getTime()) ? null : date;
};

const format = (value, options) => {
  const date = parseNotificationTimestamp(value);

  if (!date) return "Not available";

  return new Intl.DateTimeFormat("en-IN", {
    timeZone: DISPLAY_TIME_ZONE,
    ...options,
  }).format(date);
};

export const formatNotificationTime = (value) =>
  format(value, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

export const formatNotificationTimeOnly = (value) =>
  format(value, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

export const formatNotificationDateOnly = (value) =>
  format(value, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

export default {
  parseNotificationTimestamp,
  formatNotificationTime,
  formatNotificationTimeOnly,
  formatNotificationDateOnly,
};