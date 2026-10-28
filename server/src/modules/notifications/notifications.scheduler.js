
import {
  processAllNotificationReminders,
} from "./notifications.reminders.js";

const DEFAULT_INTERVAL_MS = 60 * 1000;
const MIN_INTERVAL_MS = 10 * 1000;
const MAX_INTERVAL_MS = 60 * 60 * 1000;

const isEnabled = () => {
  const value = String(
    process.env.NOTIFICATION_REMINDERS_ENABLED ?? "true"
  )
    .trim()
    .toLowerCase();

  return ["true", "1", "yes", "on"].includes(value);
};

const getInterval = () => {
  const value = Number(
    process.env.NOTIFICATION_REMINDER_INTERVAL_MS
  );

  if (!Number.isFinite(value) || value <= 0) {
    return DEFAULT_INTERVAL_MS;
  }

  return Math.min(
    MAX_INTERVAL_MS,
    Math.max(MIN_INTERVAL_MS, Math.floor(value))
  );
};

let timer = null;
let activeRun = null;
let stopped = true;

export const runNotificationReminderCycle = () => {
  if (activeRun) {
    return activeRun;
  }

  activeRun = (async () => {
    try {
      const result = await processAllNotificationReminders();

      const groups = [
        result.meetings,
        result.upcomingFollowups,
        result.overdueFollowups,
      ];

      const totals = groups.reduce(
        (accumulator, group) => ({
          scanned:
            accumulator.scanned + (group?.scanned || 0),
          delivered:
            accumulator.delivered + (group?.delivered || 0),
          skipped:
            accumulator.skipped + (group?.skipped || 0),
          failed:
            accumulator.failed + (group?.failed || 0),
        }),
        {
          scanned: 0,
          delivered: 0,
          skipped: 0,
          failed: 0,
        }
      );

      if (totals.delivered > 0 || totals.failed > 0) {
        console.log(
          "[Notification Reminders] Cycle completed:",
          {
            ...totals,
            details: result,
          }
        );
      }

      return result;
    } catch (error) {
      console.error(
        "[Notification Reminders] Cycle failed:",
        error
      );

      return null;
    }
  })();

  const currentRun = activeRun;

  void currentRun.finally(() => {
    if (activeRun === currentRun) {
      activeRun = null;
    }
  });

  return currentRun;
};

export const startNotificationReminderScheduler = () => {
  if (!isEnabled()) {
    console.log("[Notification Reminders] Disabled.");
    return;
  }

  if (timer || !stopped) {
    return;
  }

  stopped = false;

  const interval = getInterval();

  timer = setInterval(() => {
    if (!stopped) {
      void runNotificationReminderCycle();
    }
  }, interval);

  console.log(
    `[Notification Reminders] Started. Interval: ${interval}ms`
  );

  void runNotificationReminderCycle();
};

export const stopNotificationReminderScheduler = async () => {
  stopped = true;

  if (timer) {
    clearInterval(timer);
    timer = null;
  }

  if (activeRun) {
    await activeRun;
  }

  console.log("[Notification Reminders] Stopped.");
};
