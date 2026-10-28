
import {
  AlertCircle,
  Bell,
  CalendarClock,
  Check,
  CheckCheck,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Inbox,
  LoaderCircle,
  RefreshCw,
  Trash2,
  Users,
} from "lucide-react";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";

import useAuth from "../auth/useAuth";

import {
  notificationQueryKeys,
  useNotificationsQuery,
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation,
} from "./notifications.queries.js";

import {
  deleteNotificationRequest,
} from "./notifications.api.js";

import {
  clearNotificationsRequest,
} from "./notifications.api.js";

import {
  formatNotificationTime,
} from "./notificationTime.js";

import "./notifications-glass.css";

const PAGE_SIZE = 15;
const CLEAR_PAGE_SIZE = 100;

const FILTERS = [
  { value: "all", label: "All notifications" },
  { value: "unread", label: "Unread" },
  { value: "read", label: "Read" },
];

const getErrorMessage = (error) =>
  error?.response?.data?.message ||
  error?.response?.data?.error?.message ||
  error?.message ||
  "Something went wrong. Please try again.";

const isSafeInternalPath = (value) =>
  typeof value === "string" &&
  value.startsWith("/") &&
  !value.startsWith("//") &&
  !value.includes("\\") &&
  !/[\r\n]/.test(value);

const normalizeCount = (value, fallback = 0) => {
  if (value === null || value === undefined || value === "") {
    return fallback;
  }

  const number = Number(value);

  return Number.isSafeInteger(number) && number >= 0
    ? number
    : fallback;
};

const getNotificationMeta = (notification) => {
  const type = String(
    notification?.notificationType ||
      notification?.type ||
      ""
  ).toUpperCase();

  if (type.includes("FOLLOWUP") || type.includes("FOLLOW_UP")) {
    return {
      label: "Follow-up",
      Icon: Clock3,
      tone: "warning",
    };
  }

  if (type.includes("MEETING")) {
    return {
      label: "Meeting",
      Icon: CalendarClock,
      tone: "info",
    };
  }

  if (type.includes("LEAD")) {
    return {
      label: "Lead",
      Icon: Users,
      tone: "primary",
    };
  }

  if (
    type.includes("COMPLETE") ||
    type.includes("SUCCESS") ||
    type.includes("APPROVED")
  ) {
    return {
      label: "Activity",
      Icon: CheckCheck,
      tone: "success",
    };
  }

  return {
    label: "General",
    Icon: Bell,
    tone: "neutral",
  };
};

const SummaryCard = ({ label, value, Icon, tone }) => (
  <div className="gnc-summary-card flex min-w-0 items-center justify-between gap-4 rounded-2xl p-5">
    <div className="min-w-0">
      <p className="gnc-muted text-xs font-medium">
        {label}
      </p>

      <p className="gnc-heading mt-2 text-3xl font-bold tracking-tight">
        {value}
      </p>
    </div>

    <span
      className={`gnc-summary-icon gnc-tone-${tone} flex h-11 w-11 shrink-0 items-center justify-center rounded-xl`}
    >
      <Icon size={20} strokeWidth={1.8} />
    </span>
  </div>
);

export default function NotificationsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [busyId, setBusyId] = useState(null);
  const [clearing, setClearing] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const notificationsQuery = useNotificationsQuery({
    filter,
    page,
    limit: PAGE_SIZE,
    enabled: Boolean(user?.id),
  });

  const markReadMutation =
    useMarkNotificationReadMutation();

  const markAllReadMutation =
    useMarkAllNotificationsReadMutation();

  const data = notificationsQuery.data;

  const notifications = Array.isArray(data?.notifications)
    ? data.notifications
    : [];

  const unreadCount = normalizeCount(data?.unreadCount);

  const filteredTotal = normalizeCount(
    data?.pagination?.total ?? data?.total,
    notifications.length
  );

  const totalPages = Math.max(
    1,
    normalizeCount(
      data?.pagination?.totalPages,
      Math.ceil(filteredTotal / PAGE_SIZE)
    )
  );

  const totalCount =
    data?.totalCount == null
      ? filter === "all"
        ? filteredTotal
        : null
      : normalizeCount(data.totalCount);

  const readCount =
    data?.readCount != null
      ? normalizeCount(data.readCount)
      : totalCount == null
        ? null
        : Math.max(0, totalCount - unreadCount);

  const loading = notificationsQuery.isPending;

  const refreshing =
    notificationsQuery.isFetching && !loading;

  const isBusy =
    busyId !== null ||
    clearing ||
    markReadMutation.isPending ||
    markAllReadMutation.isPending;

  useEffect(() => {
    if (
      !notificationsQuery.isPending &&
      !notificationsQuery.isError &&
      !notificationsQuery.isPlaceholderData &&
      page > totalPages
    ) {
      setPage(totalPages);
    }
  }, [
    notificationsQuery.isPending,
    notificationsQuery.isError,
    notificationsQuery.isPlaceholderData,
    page,
    totalPages,
  ]);

  useEffect(() => {
    setFeedback(null);
  }, [filter, page]);

  const invalidateNotifications = async () => {
    await queryClient.invalidateQueries({
      queryKey: notificationQueryKeys.all,
    });
  };

  const changeFilter = (nextFilter) => {
    if (filter === nextFilter) return;

    setFilter(nextFilter);
    setPage(1);
    setFeedback(null);
  };

  const handleRefresh = async () => {
    setFeedback(null);

    try {
      const result = await notificationsQuery.refetch({
        cancelRefetch: true,
      });

      if (result.error) {
        throw result.error;
      }
    } catch (error) {
      setFeedback({
        type: "error",
        message: getErrorMessage(error),
      });
    }
  };

  const handleOpen = async (notification) => {
    if (isBusy) return;

    setBusyId(notification.id);
    setFeedback(null);

    try {
      if (!notification.isRead) {
        await markReadMutation.mutateAsync(notification.id);
      }

      if (isSafeInternalPath(notification.actionUrl)) {
        navigate(notification.actionUrl);
      } else {
        await invalidateNotifications();
      }
    } catch (error) {
      setFeedback({
        type: "error",
        message: getErrorMessage(error),
      });
    } finally {
      setBusyId(null);
    }
  };

  const handleMarkAllRead = async () => {
    if (isBusy || unreadCount === 0) return;

    setFeedback(null);

    try {
      await markAllReadMutation.mutateAsync();

      setFeedback({
        type: "success",
        message: "All notifications marked as read.",
      });
    } catch (error) {
      setFeedback({
        type: "error",
        message: getErrorMessage(error),
      });
    }
  };

  /*
   * Clear all notifications using the existing
   * single-notification delete endpoint.
   *
   * A dedicated bulk-delete backend endpoint would be
   * preferable for larger notification histories.
   */
  const handleClearNotifications = async () => {
    if (isBusy || totalCount === 0) return;

    const confirmed = window.confirm(
      "Are you sure you want to clear all notifications? This action cannot be undone."
    );

    if (!confirmed) return;

    setClearing(true);
    setFeedback(null);

    try {
      const result = await clearNotificationsRequest();

      const deletedCount = Number(
        result?.deletedCount ?? 0
      );

      setPage(1);
      setFilter("all");

      await queryClient.invalidateQueries({
        queryKey: notificationQueryKeys.all,
      });

      setFeedback({
        type: "success",
        message:
          deletedCount === 0
            ? "No notifications to clear."
            : `${deletedCount} notification${
                deletedCount === 1 ? "" : "s"
              } cleared successfully.`,
      });
    } catch (error) {
      setFeedback({
        type: "error",
        message: getErrorMessage(error),
      });
    } finally {
      setClearing(false);
    }
  };

  const queryError = notificationsQuery.isError
    ? getErrorMessage(notificationsQuery.error)
    : "";

  return (
    <div className="gnc-page mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
      {/* HEADER */}

      <header className="flex flex-wrap items-center justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="gnc-heading text-2xl font-bold tracking-tight">
              Notifications
            </h1>

            {unreadCount > 0 && (
              <span className="gnc-header-count inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold">
                {unreadCount} unread
              </span>
            )}
          </div>

          <p className="gnc-muted mt-1 text-sm">
            Manage your CRM alerts and activity updates.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleRefresh}
            disabled={notificationsQuery.isFetching || isBusy}
            className="gnc-btn-secondary inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium"
          >
            <RefreshCw
              size={16}
              className={
                notificationsQuery.isFetching
                  ? "animate-spin"
                  : ""
              }
            />
            Refresh
          </button>

          <button
            type="button"
            onClick={handleMarkAllRead}
            disabled={isBusy || unreadCount === 0}
            className="gnc-btn-primary inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold"
          >
            {markAllReadMutation.isPending ? (
              <LoaderCircle
                size={16}
                className="animate-spin"
              />
            ) : (
              <CheckCheck size={16} />
            )}
            Mark all as read
          </button>

          <button
            type="button"
            onClick={handleClearNotifications}
            disabled={isBusy || totalCount === 0}
            className="gnc-btn-danger inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold"
          >
            {clearing ? (
              <LoaderCircle
                size={16}
                className="animate-spin"
              />
            ) : (
              <Trash2 size={16} />
            )}

            {clearing
              ? "Clearing..."
              : "Clear Notifications"}
          </button>
        </div>
      </header>

      {/* SUMMARY CARDS */}

      {/* <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <SummaryCard
          label="Total notifications"
          value={totalCount ?? "—"}
          Icon={Inbox}
          tone="primary"
        />

        <SummaryCard
          label="Unread notifications"
          value={unreadCount}
          Icon={Bell}
          tone="warning"
        />

        <SummaryCard
          label="Read notifications"
          value={readCount ?? "—"}
          Icon={CheckCheck}
          tone="success"
        />
      </div> */}

      {/* FEEDBACK */}

      {feedback?.type === "success" && (
        <div
          role="status"
          className="gnc-feedback-success flex items-center gap-2 rounded-xl px-4 py-3 text-sm"
        >
          <Check size={17} />
          {feedback.message}
        </div>
      )}

      {(queryError || feedback?.type === "error") && (
        <div
          role="alert"
          className="gnc-feedback-error flex items-start gap-3 rounded-xl px-4 py-3 text-sm"
        >
          <AlertCircle size={18} className="mt-0.5 shrink-0" />

          <span>
            {feedback?.type === "error"
              ? feedback.message
              : queryError}
          </span>
        </div>
      )}

      {/* NOTIFICATION INBOX */}

      <section className="gnc-inbox overflow-hidden rounded-2xl">
        <div className="gnc-inbox-toolbar flex flex-wrap items-center justify-between gap-3 px-5 pt-5 sm:px-6">
          <div>
            <h2 className="gnc-heading text-base font-semibold">
              Notification inbox
            </h2>

            <p className="gnc-muted mt-1 text-xs">
              Your recent updates in one place
            </p>
          </div>

          <div className="flex items-center gap-2">
            {refreshing && (
              <RefreshCw
                size={14}
                className="gnc-accent animate-spin"
              />
            )}

            <span className="gnc-muted text-xs font-medium">
              {filteredTotal} results
            </span>
          </div>
        </div>

        {/* FILTER TABS */}

        <div
          className="gnc-tabs mt-4 flex items-center gap-6 overflow-x-auto px-5 sm:px-6"
          role="group"
          aria-label="Notification filters"
        >
          {FILTERS.map((item) => {
            const active = filter === item.value;

            return (
              <button
                key={item.value}
                type="button"
                onClick={() => changeFilter(item.value)}
                aria-pressed={active}
                className={`gnc-tab ${
                  active ? "gnc-tab-active" : ""
                } inline-flex shrink-0 items-center gap-2 pb-3 text-sm font-medium`}
              >
                {item.label}

                {item.value === "unread" && unreadCount > 0 && (
                  <span className="gnc-tab-count inline-flex min-w-5 items-center justify-center rounded-full px-1.5 py-0.5 text-xs font-semibold">
                    {unreadCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* LOADING */}

        {loading && (
          <div className="flex flex-col items-center justify-center gap-3 px-6 py-20">
            <LoaderCircle
              size={25}
              className="gnc-accent animate-spin"
            />

            <p className="gnc-muted text-sm">
              Loading notifications...
            </p>
          </div>
        )}

        {/* EMPTY STATE */}

        {!loading &&
          !notificationsQuery.isError &&
          notifications.length === 0 && (
            <div className="flex flex-col items-center px-6 py-20 text-center">
              <span className="gnc-empty-icon flex h-16 w-16 items-center justify-center rounded-2xl">
                <Inbox size={28} />
              </span>

              <h3 className="gnc-heading mt-5 text-base font-semibold">
                {filter === "unread"
                  ? "You're all caught up"
                  : filter === "read"
                    ? "No read notifications"
                    : "No notifications yet"}
              </h3>

              <p className="gnc-muted mt-2 max-w-sm text-sm leading-6">
                {filter === "unread"
                  ? "There are no unread notifications at the moment."
                  : filter === "read"
                    ? "Notifications you open will appear here."
                    : "Your CRM notifications will appear here when activity occurs."}
              </p>
            </div>
          )}

        {/* NOTIFICATION ROWS */}

        {!loading && notifications.length > 0 && (
          <div className="gnc-rows">
            {notifications.map((notification) => {
              const meta = getNotificationMeta(notification);
              const Icon = meta.Icon;
              const unread = !notification.isRead;
              const rowBusy = busyId === notification.id;

              return (
                <article
                  key={notification.id}
                  className={`gnc-row ${
                    unread ? "gnc-row-unread" : ""
                  } flex items-start gap-3 px-4 py-4 sm:gap-4 sm:px-6`}
                >
                  <span
                    className={`gnc-row-icon gnc-tone-${meta.tone} mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl`}
                  >
                    <Icon size={18} strokeWidth={1.8} />
                  </span>

                  <button
                    type="button"
                    onClick={() => handleOpen(notification)}
                    disabled={isBusy}
                    className="gnc-row-content min-w-0 flex-1 text-left"
                  >
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="gnc-row-title text-sm font-semibold leading-6">
                        {notification.title}
                      </span>

                      {unread && (
                        <span className="gnc-unread-dot h-2 w-2 shrink-0 rounded-full" />
                      )}
                    </span>

                    <span className="gnc-row-message mt-1 block text-sm leading-6">
                      {notification.message}
                    </span>

                    <span className="mt-2.5 flex flex-wrap items-center gap-3">
                      <span className="gnc-category inline-flex items-center rounded-md px-2 py-1 text-xs font-medium">
                        {meta.label}
                      </span>

                      <span className="gnc-row-time inline-flex items-center gap-1.5 text-xs">
                        <Clock3 size={12} />
                        {formatNotificationTime(
                          notification.createdAt
                        )}{" "}
                        IST
                      </span>
                    </span>
                  </button>

                  {rowBusy && (
                    <LoaderCircle
                      size={17}
                      className="gnc-accent mt-2 shrink-0 animate-spin"
                    />
                  )}
                </article>
              );
            })}
          </div>
        )}

        {/* PAGINATION */}

        <footer className="gnc-pagination flex flex-wrap items-center justify-between gap-3 px-5 py-4 sm:px-6">
          <p className="gnc-muted text-xs">
            Page {page} of {totalPages}
            {" · "}
            {filteredTotal} notifications
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={
                loading ||
                notificationsQuery.isFetching ||
                page <= 1
              }
              onClick={() =>
                setPage((current) => Math.max(1, current - 1))
              }
              className="gnc-page-btn flex h-9 w-9 items-center justify-center rounded-lg"
              aria-label="Previous page"
            >
              <ChevronLeft size={17} />
            </button>

            <span className="gnc-muted min-w-10 text-center text-xs font-medium">
              {page} / {totalPages}
            </span>

            <button
              type="button"
              disabled={
                loading ||
                notificationsQuery.isFetching ||
                page >= totalPages
              }
              onClick={() =>
                setPage((current) => current + 1)
              }
              className="gnc-page-btn flex h-9 w-9 items-center justify-center rounded-lg"
              aria-label="Next page"
            >
              <ChevronRight size={17} />
            </button>
          </div>
        </footer>
      </section>
    </div>
  );
}