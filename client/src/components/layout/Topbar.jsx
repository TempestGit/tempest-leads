import {
  Bell,
  Menu,
  Search,
} from "lucide-react";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import useAuth from "../../features/auth/useAuth";

const Topbar = ({
  onOpenMobile,
}) => {
  const { user } =
    useAuth();

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    notificationsOpen,
    setNotificationsOpen,
  ] = useState(false);

  const searchRef =
    useRef(null);

  useEffect(() => {
    const handler = (
      event
    ) => {
      if (
        (event.ctrlKey ||
          event.metaKey) &&
        event.key.toLowerCase() ===
          "k"
      ) {
        event.preventDefault();

        searchRef.current?.focus();
      }
    };

    window.addEventListener(
      "keydown",
      handler
    );

    return () =>
      window.removeEventListener(
        "keydown",
        handler
      );
  }, []);

  const initials =
    user?.fullName
      ?.split(" ")
      .map(
        (part) =>
          part[0]
      )
      .join("")
      .slice(0, 2)
      .toUpperCase() ||
    "U";

  return (
    <header className="tl-topbar">
      <button
        type="button"
        className="icon-control mobile-menu"
        onClick={
          onOpenMobile
        }
        aria-label="Open menu"
      >
        <Menu size={17} />
      </button>

      <div className="top-search">
        <Search
          size={15}
        />

        <input
          ref={searchRef}
          value={search}
          onChange={(
            event
          ) =>
            setSearch(
              event.target
                .value
            )
          }
          placeholder="Search company, contact, lead or owner..."
        />

        <kbd>
          Ctrl K
        </kbd>
      </div>

      <div className="top-spacer" />

      <span className="top-followup">
        Follow-ups will
        appear here
      </span>

      <div className="notification-wrap">
        <button
          type="button"
          className="icon-control"
          onClick={() =>
            setNotificationsOpen(
              (value) =>
                !value
            )
          }
          aria-label="Notifications"
        >
          <Bell size={16} />

          <i className="unread" />
        </button>

        {notificationsOpen && (
          <div className="notification-panel">
            <div className="notification-title">
              Notifications
            </div>

            <div className="notif">
              <b>
                No notifications
                loaded
              </b>

              <small>
                Notifications
                will be connected
                to the API later.
              </small>
            </div>
          </div>
        )}
      </div>

      <span
        className="tl-avatar"
        title={
          user?.fullName
        }
      >
        {initials}
      </span>
    </header>
  );
};

export default Topbar;