
import {
  Bell,
  Check,
  CheckCheck,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Inbox,
  LoaderCircle,
  RefreshCw,
  Trash2,
} from "lucide-react";

import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  useQueryClient,
} from "@tanstack/react-query";

import useAuth from "../auth/useAuth";

import {
  notificationQueryKeys,
  useNotificationsQuery,
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation,
  useDeleteNotificationMutation,
} from "./notifications.queries.js";

import {
  formatNotificationTime,
} from "./notificationTime.js";

import "./notifications-glass.css";

const PAGE_SIZE = 15;

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
  const number = Number(value);

  return Number.isSafeInteger(number) && number >= 0
    ? number
    : fallback;
};

export default function NotificationsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [busyId, setBusyId] = useState(null);
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

  const deleteMutation =
    useDeleteNotificationMutation();

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

  const loading =
    notificationsQuery.isPending &&
    notificationsQuery.isFetching;

  const refreshing =
    notificationsQuery.isFetching && !loading;

  const isBusy =
    busyId !== null ||
    markAllReadMutation.isPending ||
    deleteMutation.isPending ||
    markReadMutation.isPending;

  useEffect(() => {
    if (
      !notificationsQuery.isPending &&
      page > totalPages
    ) {
      setPage(totalPages);
    }
  }, [
    notificationsQuery.isPending,
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
      await notificationsQuery.refetch({
        cancelRefetch: true,
      });
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

  const handleMarkRead = async (notification) => {
    if (isBusy || notification.isRead) return;

    setBusyId(notification.id);
    setFeedback(null);

    try {
      await markReadMutation.mutateAsync(notification.id);

      setFeedback({
        type: "success",
        message: "Notification marked as read.",
      });
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

  const handleDelete = async (notification) => {
    if (isBusy) return;

    const confirmed = window.confirm(
      "Delete this notification?"
    );

    if (!confirmed) return;

    setBusyId(notification.id);
    setFeedback(null);

    try {
      await deleteMutation.mutateAsync(notification.id);

      setFeedback({
        type: "success",
        message: "Notification deleted.",
      });

      if (notifications.length === 1 && page > 1) {
        setPage((current) => Math.max(1, current - 1));
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

  const queryError =
    notificationsQuery.isError
      ? getErrorMessage(notificationsQuery.error)
      : "";

  return (
    <div className="tlp-notifications-page mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
      {/* Page header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-4">
          <div className="tlp-notification-header-icon flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl">
            <Bell size={25} />
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
                Notifications
              </h1>

              {unreadCount > 0 && (
                <span className="tlp-notification-count rounded-full px-2.5 py-1 text-xs font-bold">
                  {unreadCount} new
                </span>
              )}
            </div>

            <p className="tlp-notification-muted mt-1 text-sm">
              Stay informed about leads, meetings,
              follow-ups and CRM activity.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleRefresh}
            disabled={notificationsQuery.isFetching}
            className="tlp-notification-button inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold disabled:opacity-50"
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
            className="tlp-notification-primary inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold disabled:opacity-50"
          >
            {markAllReadMutation.isPending ? (
              <LoaderCircle
                size={16}
                className="animate-spin"
              />
            ) : (
              <CheckCheck size={16} />
            )}

            Mark all read
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="tlp-notification-stat flex items-center gap-4 rounded-2xl p-4">
          <span className="tlp-notification-stat-icon flex h-11 w-11 shrink-0 items-center justify-center rounded-xl">
            <Inbox size={20} />
          </span>

          <div>
            <p className="tlp-notification-muted text-xs font-semibold">
              Total notifications
            </p>

            <p className="mt-1 text-2xl font-extrabold">
              {totalCount ?? "—"}
            </p>
          </div>
        </div>

        <div className="tlp-notification-stat flex items-center gap-4 rounded-2xl p-4">
          <span className="tlp-notification-stat-icon flex h-11 w-11 shrink-0 items-center justify-center rounded-xl">
            <Bell size={20} />
          </span>

          <div>
            <p className="tlp-notification-muted text-xs font-semibold">
              Unread
            </p>

            <p className="mt-1 text-2xl font-extrabold">
              {unreadCount}
            </p>
          </div>
        </div>

        <div className="tlp-notification-stat flex items-center gap-4 rounded-2xl p-4">
          <span className="tlp-notification-stat-icon flex h-11 w-11 shrink-0 items-center justify-center rounded-xl">
            <CheckCheck size={20} />
          </span>

          <div>
            <p className="tlp-notification-muted text-xs font-semibold">
              Read
            </p>

            <p className="mt-1 text-2xl font-extrabold">
              {readCount ?? "—"}
            </p>
          </div>
        </div>
      </div>

      {/* Notification list */}
      <section className="tlp-notification-panel overflow-hidden rounded-2xl">
        <div className="tlp-notification-toolbar flex flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-5">
          <div
            className="flex flex-wrap items-center gap-2"
            role="group"
            aria-label="Notification filters"
          >
            {FILTERS.map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => changeFilter(item.value)}
                aria-pressed={filter === item.value}
                className={`tlp-notification-filter rounded-xl px-4 py-2 text-sm font-semibold ${
                  filter === item.value ? "is-active" : ""
                }`}
              >
                {item.label}

                {item.value === "unread" &&
                  unreadCount > 0 && (
                    <span className="tlp-notification-filter-count ml-2 rounded-full px-2 py-0.5 text-xs">
                      {unreadCount}
                    </span>
                  )}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            {refreshing && (
              <RefreshCw
                size={14}
                className="tlp-notification-muted animate-spin"
              />
            )}

            <span className="tlp-notification-muted text-xs font-medium">
              {filteredTotal} notifications
            </span>
          </div>
        </div>

        {(queryError || feedback?.type === "error") && (
          <div
            role="alert"
            className="tlp-notification-error mx-4 my-3 rounded-xl p-4 text-sm"
          >
            {feedback?.type === "error"
              ? feedback.message
              : queryError}
          </div>
        )}

        {feedback?.type === "success" && (
          <div
            role="status"
            className="tlp-notification-success mx-4 my-3 rounded-xl p-4 text-sm"
          >
            {feedback.message}
          </div>
        )}

        {loading && (
          <div className="flex flex-col items-center justify-center gap-3 px-6 py-20">
            <LoaderCircle
              size={25}
              className="tlp-notification-muted animate-spin"
            />

            <p className="tlp-notification-muted text-sm">
              Loading your notifications...
            </p>
          </div>
        )}

        {!loading &&
          !notificationsQuery.isError &&
          notifications.length === 0 && (
            <div className="flex flex-col items-center px-6 py-20 text-center">
              <div className="tlp-notification-empty-icon flex h-20 w-20 items-center justify-center rounded-3xl">
                <Inbox size={34} />
              </div>

              <h2 className="mt-5 text-lg font-bold">
                {filter === "unread"
                  ? "You're all caught up!"
                  : filter === "read"
                    ? "No read notifications"
                    : "No notifications yet"}
              </h2>

              <p className="tlp-notification-muted mt-2 max-w-md text-sm leading-6">
                {filter === "unread"
                  ? "You don't have any unread notifications right now."
                  : filter === "read"
                    ? "Notifications you've opened will appear here."
                    : "Updates about your CRM activity will appear here."}
              </p>
            </div>
          )}

        {!loading && notifications.length > 0 && (
          <div className="flex flex-col gap-3 p-3 sm:p-4">
            {notifications.map((notification) => (
              <article
                key={notification.id}
                className={`tlp-notification-item flex flex-col gap-4 rounded-2xl p-4 sm:flex-row sm:items-start sm:justify-between sm:p-5 ${
                  notification.isRead ? "" : "is-unread"
                }`}
              >
                <button
                  type="button"
                  onClick={() => handleOpen(notification)}
                  disabled={isBusy}
                  className="flex min-w-0 flex-1 items-start gap-4 text-left disabled:opacity-50"
                >
                  <span className="tlp-notification-icon flex h-11 w-11 shrink-0 items-center justify-center rounded-xl">
                    {busyId === notification.id ? (
                      <LoaderCircle
                        size={19}
                        className="animate-spin"
                      />
                    ) : (
                      <Bell size={19} />
                    )}
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-bold sm:text-base">
                        {notification.title}
                      </span>

                      {!notification.isRead && (
                        <span className="tlp-notification-unread-dot h-2 w-2 shrink-0 rounded-full" />
                      )}
                    </span>

                    <span className="tlp-notification-muted mt-1.5 block text-sm leading-6">
                      {notification.message}
                    </span>

                    <span className="tlp-notification-muted mt-3 flex items-center gap-1.5 text-xs">
                      <Clock3 size={13} />

                      {formatNotificationTime(
                        notification.createdAt
                      )}

                      <span>IST</span>
                    </span>
                  </span>
                </button>

                <div className="flex shrink-0 items-center gap-2 self-end sm:self-start">
                  {!notification.isRead && (
                    <button
                      type="button"
                      onClick={() => handleMarkRead(notification)}
                      disabled={isBusy}
                      title="Mark as read"
                      aria-label="Mark as read"
                      className="tlp-notification-button rounded-xl p-2.5 disabled:opacity-50"
                    >
                      <Check size={17} />
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => handleDelete(notification)}
                    disabled={isBusy}
                    title="Delete notification"
                    aria-label="Delete notification"
                    className="tlp-notification-button tlp-notification-delete rounded-xl p-2.5 disabled:opacity-50"
                  >
                    <Trash2 size={17} />
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}

        <div className="tlp-notification-footer flex flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-5">
          <p className="tlp-notification-muted text-xs">
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
              className="tlp-notification-button rounded-xl p-2.5 disabled:opacity-40"
              aria-label="Previous page"
            >
              <ChevronLeft size={18} />
            </button>

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
              className="tlp-notification-button rounded-xl p-2.5 disabled:opacity-40"
              aria-label="Next page"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}