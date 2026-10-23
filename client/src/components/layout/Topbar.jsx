
import {
  Bell,
  ChevronDown,
  LogOut,
  Menu,
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

import "../../features/auth/profile-glass.css";

const getInitials = (name) =>
  String(name || "User")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

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

  useEffect(() => {
    const onKeyDown = (event) => {
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

    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener(
        "keydown",
        onKeyDown
      );
    };
  }, []);

  useEffect(() => {
    setNotificationsOpen(false);
    setProfileOpen(false);
    setLogoutError("");
  }, [location.pathname, location.search]);

  useEffect(() => {
    if (!notificationsOpen && !profileOpen) return;

    const onPointerDown = (event) => {
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
      onPointerDown
    );

    return () => {
      document.removeEventListener(
        "pointerdown",
        onPointerDown
      );
    };
  }, [notificationsOpen, profileOpen]);

  const submitSearch = (event) => {
    event.preventDefault();

    const query = search.trim();

    if (!query) {
      navigate("/leads");
      return;
    }

    navigate(
      `/leads?search=${encodeURIComponent(query)}`
    );
  };

  const handleLogout = async () => {
    if (loggingOut) return;

    setLoggingOut(true);
    setLogoutError("");

    try {
      await logout();

      setProfileOpen(false);

      navigate("/login", {
        replace: true,
      });
    } catch (error) {
      setLogoutError(
        error?.response?.data?.message ||
          error?.message ||
          "Unable to sign out. Please try again."
      );
    } finally {
      setLoggingOut(false);
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
        <div
          ref={notificationsRef}
          className="relative"
        >
          <button
            type="button"
            className="glass-topbar-icon"
            onClick={() => {
              setNotificationsOpen(
                (value) => !value
              );
              setProfileOpen(false);
            }}
            aria-label="Notifications"
            aria-expanded={notificationsOpen}
          >
            <Bell size={19} />
          </button>

          {notificationsOpen && (
            <div className="glass-notification-panel">
              <div className="glass-notification-heading">
                <h3 className="text-sm font-bold">
                  Notifications
                </h3>
              </div>

              <div className="px-5 py-6 text-center">
                <Bell
                  size={23}
                  className="glass-topbar-muted mx-auto"
                />

                <p className="mt-3 text-sm font-semibold">
                  No notifications loaded
                </p>

                <p className="glass-topbar-muted mt-1 text-xs">
                  Notifications will appear here
                  when connected to your API.
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="glass-topbar-divider" />

        <div
          ref={profileRef}
          className="relative"
        >
          <button
            type="button"
            onClick={() => {
              setProfileOpen(
                (value) => !value
              );
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
                profileOpen
                  ? "rotate-180"
                  : ""
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