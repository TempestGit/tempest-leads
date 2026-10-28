
import {
  Bell,
  CheckCheck,
  ChevronDown,
  LoaderCircle,
  LogOut,
  Menu,
  RefreshCw,
  Search,
  Settings,
  UserRound,
  X,
} from "lucide-react";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  useLocation,
  useNavigate,
} from "react-router-dom";

import useAuth from "../../features/auth/useAuth";

import {
  useNotificationsQuery,
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation,
} from "../../features/notifications/notifications.queries.js";

import {
  formatNotificationTime,
} from "../../features/notifications/notificationTime.js";

import "../../features/auth/profile-glass.css";

const getInitials = (name) =>
  String(name || "User")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

const getErrorMessage = (error, fallback) =>
  error?.response?.data?.message ||
  error?.response?.data?.error?.message ||
  error?.message ||
  fallback;

const isSafeInternalPath = (value) =>
  typeof value === "string" &&
  value.startsWith("/") &&
  !value.startsWith("//") &&
  !value.includes("\\") &&
  !/[\r\n]/.test(value);

export default function Topbar({ onOpenMobile }) {
  const { user, logout } = useAuth();

  const navigate = useNavigate();
  const location = useLocation();

  const searchRef = useRef(null);
  const notificationsRef = useRef(null);
  const profileRef = useRef(null);

  const [search, setSearch] = useState("");
  const [notificationsOpen, setNotificationsOpen] =
    useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState("");
  const [notificationError, setNotificationError] =
    useState("");
  const [notificationBusyId, setNotificationBusyId] =
    useState(null);

  const notificationsQuery = useNotificationsQuery({
    filter: "all",
    page: 1,
    limit: 10,
    enabled: Boolean(user?.id),
  });

  const markReadMutation =
    useMarkNotificationReadMutation();

  const markAllReadMutation =
    useMarkAllNotificationsReadMutation();

  const notifications = Array.isArray(
    notificationsQuery.data?.notifications
  )
    ? notificationsQuery.data.notifications
    : [];

  const unreadCount = Math.max(
    0,
    Number(notificationsQuery.data?.unreadCount) || 0
  );

  const loadingNotifications =
    notificationsQuery.isFetching;

  const markingAllRead =
    markAllReadMutation.isPending;

  const notificationBusy =
    notificationBusyId !== null || markingAllRead;

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (
        (event.ctrlKey || event.metaKey) &&
        event.key.toLowerCase() === "k"
      ) {
        event.preventDefault();
        searchRef.current?.focus();
      }

      if (event.key === "Escape") {
        setNotificationsOpen(false);
        setProfileOpen(false);
        searchRef.current?.blur();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, []);

  useEffect(() => {
    setNotificationsOpen(false);
    setProfileOpen(false);
    setNotificationError("");
    setLogoutError("");
  }, [location.pathname, location.search]);

  useEffect(() => {
    if (!notificationsOpen && !profileOpen) return;

    const handlePointerDown = (event) => {
      if (
        notificationsOpen &&
        !notificationsRef.current?.contains(event.target)
      ) {
        setNotificationsOpen(false);
      }

      if (
        profileOpen &&
        !profileRef.current?.contains(event.target)
      ) {
        setProfileOpen(false);
      }
    };

    document.addEventListener(
      "pointerdown",
      handlePointerDown
    );

    return () => {
      document.removeEventListener(
        "pointerdown",
        handlePointerDown
      );
    };
  }, [notificationsOpen, profileOpen]);

  const submitSearch = (event) => {
    event.preventDefault();

    const query = search.trim();

    navigate(
      query
        ? `/leads?search=${encodeURIComponent(query)}`
        : "/leads"
    );
  };

  const handleLogout = async () => {
    if (loggingOut) return;

    setLoggingOut(true);
    setLogoutError("");

    try {
      await logout();

      setProfileOpen(false);
      navigate("/login", { replace: true });
    } catch (error) {
      setLogoutError(
        getErrorMessage(
          error,
          "Unable to sign out. Please try again."
        )
      );
    } finally {
      setLoggingOut(false);
    }
  };

  const handleNotificationClick = async (notification) => {
    if (notificationBusy) return;

    setNotificationBusyId(notification.id);
    setNotificationError("");

    try {
      if (!notification.isRead) {
        await markReadMutation.mutateAsync(
          notification.id
        );
      }

      setNotificationsOpen(false);

      if (isSafeInternalPath(notification.actionUrl)) {
        navigate(notification.actionUrl);
      }
    } catch (error) {
      setNotificationError(
        getErrorMessage(
          error,
          "Unable to open notification."
        )
      );
    } finally {
      setNotificationBusyId(null);
    }
  };

  const handleMarkAllRead = async () => {
    if (notificationBusy || unreadCount === 0) return;

    setNotificationError("");

    try {
      await markAllReadMutation.mutateAsync();
    } catch (error) {
      setNotificationError(
        getErrorMessage(
          error,
          "Unable to mark notifications as read."
        )
      );
    }
  };

  const handleRefreshNotifications = async () => {
    setNotificationError("");

    try {
      const result = await notificationsQuery.refetch({
        cancelRefetch: true,
      });

      if (result.error) {
        setNotificationError(
          getErrorMessage(
            result.error,
            "Unable to refresh notifications."
          )
        );
      }
    } catch (error) {
      setNotificationError(
        getErrorMessage(
          error,
          "Unable to refresh notifications."
        )
      );
    }
  };

  return (
    <header className="tl-topbar glass-topbar">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <button
          type="button"
          className="glass-topbar-icon glass-topbar-menu"
          onClick={onOpenMobile}
          aria-label="Open navigation"
        >
          <Menu size={20} />
        </button>

        <form
          className="glass-topbar-search"
          onSubmit={submitSearch}
          role="search"
        >
          <Search
            size={18}
            className="shrink-0"
          />

          <input
            ref={searchRef}
            type="search"
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Search leads, companies, contacts..."
            aria-label="Search leads"
          />

          {search ? (
            <button
              type="button"
              onClick={() => setSearch("")}
              aria-label="Clear search"
            >
              <X size={15} />
            </button>
          ) : (
            <kbd className="glass-topbar-shortcut">
              Ctrl K
            </kbd>
          )}
        </form>
      </div>

      <div className="flex shrink-0 items-center gap-3">
        {/* Notifications */}
        <div
          ref={notificationsRef}
          className="relative"
        >
          <button
            type="button"
            className="glass-topbar-icon relative"
            onClick={() => {
              setNotificationsOpen((current) => !current);
              setProfileOpen(false);
              setNotificationError("");
            }}
            aria-label={`Notifications, ${unreadCount} unread`}
            aria-expanded={notificationsOpen}
            aria-haspopup="dialog"
          >
            <Bell size={19} />

            {unreadCount > 0 && (
              <span
                className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px] font-extrabold"
                style={{
                  background: "var(--crm-primary)",
                  color: "var(--crm-primary-foreground)",
                }}
              >
                {unreadCount > 99
                  ? "99+"
                  : unreadCount}
              </span>
            )}
          </button>

          {notificationsOpen && (
            <div
              className="glass-notification-panel"
              role="dialog"
              aria-label="Notifications"
            >
              <div className="glass-notification-heading flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold">
                    Notifications
                  </h3>

                  <p className="glass-topbar-muted mt-1 text-xs">
                    {unreadCount} unread
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleRefreshNotifications}
                    disabled={loadingNotifications}
                    aria-label="Refresh notifications"
                    title="Refresh notifications"
                    className="glass-topbar-icon disabled:opacity-50"
                  >
                    <RefreshCw
                      size={16}
                      className={
                        loadingNotifications
                          ? "animate-spin"
                          : ""
                      }
                    />
                  </button>

                  <button
                    type="button"
                    onClick={handleMarkAllRead}
                    disabled={
                      unreadCount === 0 ||
                      notificationBusy
                    }
                    aria-label="Mark all notifications as read"
                    title="Mark all as read"
                    className="glass-topbar-icon disabled:opacity-50"
                  >
                    {markingAllRead ? (
                      <LoaderCircle
                        size={16}
                        className="animate-spin"
                      />
                    ) : (
                      <CheckCheck size={16} />
                    )}
                  </button>
                </div>
              </div>

              {(notificationError ||
                notificationsQuery.isError) && (
                <p
                  role="alert"
                  className="tlp-alert tlp-alert-error mx-3 my-3 p-3 text-xs"
                >
                  {notificationError ||
                    getErrorMessage(
                      notificationsQuery.error,
                      "Unable to load notifications."
                    )}
                </p>
              )}

              {notificationsQuery.isPending &&
                loadingNotifications && (
                  <div className="flex items-center justify-center gap-2 px-5 py-8 text-sm">
                    <LoaderCircle
                      size={18}
                      className="animate-spin"
                    />
                    Loading notifications...
                  </div>
                )}

              {!notificationsQuery.isPending &&
                !notificationsQuery.isError &&
                notifications.length === 0 && (
                  <div className="px-5 py-6 text-center">
                    <Bell
                      size={23}
                      className="glass-topbar-muted mx-auto"
                    />

                    <p className="mt-3 text-sm font-semibold">
                      No notifications yet
                    </p>

                    <p className="glass-topbar-muted mt-1 text-xs">
                      Your CRM notifications will appear here.
                    </p>
                  </div>
                )}

              {notifications.length > 0 && (
                <div className="max-h-96 overflow-y-auto">
                  {notifications.map((notification) => (
                    <button
                      key={notification.id}
                      type="button"
                      disabled={notificationBusy}
                      onClick={() =>
                        handleNotificationClick(notification)
                      }
                      className="glass-topbar-profile-item flex w-full items-start gap-3 text-left disabled:opacity-50"
                    >
                      <span className="mt-1 shrink-0">
                        {notificationBusyId ===
                        notification.id ? (
                          <LoaderCircle
                            size={17}
                            className="animate-spin"
                          />
                        ) : (
                          <Bell size={17} />
                        )}
                      </span>

                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-2">
                          <span className="block truncate text-sm font-bold">
                            {notification.title}
                          </span>

                          {!notification.isRead && (
                            <span
                              className="h-2 w-2 shrink-0 rounded-full"
                              style={{
                                background:
                                  "var(--crm-primary)",
                              }}
                            />
                          )}
                        </span>

                        <span className="glass-topbar-muted mt-1 block text-xs leading-5">
                          {notification.message}
                        </span>

                        <span className="glass-topbar-muted mt-2 block text-[11px]">
                          {formatNotificationTime(
                            notification.createdAt
                          )}
                          {" IST"}
                        </span>
                      </span>
                    </button>
                  ))}
                </div>
              )}

              <div className="glass-notification-heading">
                <button
                  type="button"
                  onClick={() => {
                    setNotificationsOpen(false);
                    navigate("/notifications");
                  }}
                  className="glass-topbar-profile-item flex w-full items-center justify-center text-sm font-semibold"
                >
                  View all notifications
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="glass-topbar-divider" />

        {/* Profile */}
        <div
          ref={profileRef}
          className="relative"
        >
          <button
            type="button"
            onClick={() => {
              setProfileOpen((current) => !current);
              setNotificationsOpen(false);
              setLogoutError("");
            }}
            aria-label="Open account menu"
            aria-expanded={profileOpen}
            aria-haspopup="menu"
            className="glass-topbar-user flex items-center gap-3 text-left"
          >
            <span className="glass-user-avatar">
              {getInitials(user?.fullName)}
            </span>

            <div className="glass-topbar-user-copy">
              <p className="truncate text-xs font-bold">
                {user?.fullName || "User"}
              </p>

              <p className="glass-topbar-muted mt-0.5 text-xs">
                {user?.role === "SUPER_ADMIN"
                  ? "Administrator"
                  : "Workspace"}
              </p>
            </div>

            <ChevronDown
              size={15}
              className={`glass-topbar-muted glass-topbar-user-chevron transition-transform ${
                profileOpen ? "rotate-180" : ""
              }`}
              aria-hidden="true"
            />
          </button>

          {profileOpen && (
            <div
              role="menu"
              aria-label="Account options"
              className="glass-topbar-profile-dropdown"
            >
              <div className="glass-topbar-profile-heading">
                <p className="truncate text-sm font-bold">
                  {user?.fullName || "User"}
                </p>

                <p className="glass-topbar-muted mt-1 truncate text-xs">
                  {user?.email || "No email available"}
                </p>
              </div>

              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setProfileOpen(false);
                  navigate("/profile");
                }}
                className="glass-topbar-profile-item"
              >
                <UserRound size={18} />
                My Profile
              </button>

              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setProfileOpen(false);
                  navigate("/profile/settings");
                }}
                className="glass-topbar-profile-item"
              >
                <Settings size={18} />
                Account Settings
              </button>

              <div className="glass-topbar-profile-divider" />

              <button
                type="button"
                role="menuitem"
                disabled={loggingOut}
                onClick={handleLogout}
                className="glass-topbar-profile-item disabled:opacity-50"
              >
                <LogOut size={18} />

                {loggingOut
                  ? "Signing out..."
                  : "Logout"}
              </button>

              {logoutError && (
                <p
                  role="alert"
                  className="tlp-alert tlp-alert-error mx-2 my-2 p-3 text-xs"
                >
                  {logoutError}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}