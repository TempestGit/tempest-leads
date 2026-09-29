import {
  ChevronLeft,
  ChevronRight,
  LogOut,
  X,
} from "lucide-react";

import {
  NavLink,
} from "react-router-dom";

import {
  workspaceNavigation,
  lifecycleNavigation,
  adminNavigation,
} from "../../config/navigation";

import useAuth from "../../features/auth/useAuth";

const NavSection = ({
  title,
  items,
  collapsed,
  onNavigate,
}) => {
  return (
    <>
      <div className="nav-section">
        {title}
      </div>

      {items.map(
        ({
          label,
          path,
          icon: Icon,
        }) => (
          <NavLink
            key={path}
            to={path}
            onClick={
              onNavigate
            }
            title={
              collapsed
                ? label
                : undefined
            }
            className={({
              isActive,
            }) =>
              `tl-nav ${
                isActive
                  ? "active"
                  : ""
              }`
            }
          >
            <span className="nav-icon">
              <Icon
                size={16}
                strokeWidth={
                  1.8
                }
              />
            </span>

            <span className="nav-label">
              {label}
            </span>
          </NavLink>
        )
      )}
    </>
  );
};

const Sidebar = ({
  collapsed,
  mobileOpen,
  onToggleCollapse,
  onCloseMobile,
}) => {
  const {
    user,
    logout,
  } = useAuth();

  const isAdmin =
    user?.role ===
    "SUPER_ADMIN";

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
    <>
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={
            onCloseMobile
          }
          style={{
            position:
              "fixed",
            inset: 0,
            zIndex: 19,
            border: 0,
            background:
              "rgba(20, 38, 61, .45)",
          }}
        />
      )}

      <aside
        className={[
          "tl-sidebar",
          collapsed
            ? "collapsed"
            : "",
          mobileOpen
            ? "open"
            : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <div className="tl-brand">
          <div className="tl-brand-mark">
            T
          </div>

          <div className="brand-copy">
            <strong>
              TEMPEST LEADS
            </strong>

            <small>
              ACQUISITION CRM
            </small>
          </div>

          {/* <button
            type="button"
            onClick={
              onCloseMobile
            }
            className="sidebar-action"
            style={{
              marginLeft:
                "auto",
              flex: "none",
              width: 31,
            }}
            aria-label="Close menu"
          >
            <X size={15} />
          </button> */}
        </div>

        <nav>
          <NavSection
            title="Workspace"
            items={
              workspaceNavigation
            }
            collapsed={
              collapsed
            }
            onNavigate={
              onCloseMobile
            }
          />

          <NavSection
            title="Lifecycle"
            items={
              lifecycleNavigation
            }
            collapsed={
              collapsed
            }
            onNavigate={
              onCloseMobile
            }
          />

          {isAdmin && (
            <NavSection
              title="Administration"
              items={
                adminNavigation
              }
              collapsed={
                collapsed
              }
              onNavigate={
                onCloseMobile
              }
            />
          )}
        </nav>

        <div className="tl-profile-wrap">
          <div className="tl-profile">
            <span className="tl-avatar">
              {initials}
            </span>

            <div className="profile-copy">
              <b>
                {
                  user?.fullName
                }
              </b>

              <small>
                {user?.location ||
                  "Tempest"}
              </small>
            </div>

            <span className="role-chip">
              {isAdmin
                ? "ADMIN"
                : "OWNER"}
            </span>
          </div>

          <div className="sidebar-actions">
            <button
              type="button"
              className="sidebar-action"
              onClick={
                logout
              }
            >
              <LogOut
                size={14}
              />

              <span className="sidebar-action-label">
                Logout
              </span>
            </button>

            {/* <button
              type="button"
              className="sidebar-action sidebar-collapse"
              onClick={
                onToggleCollapse
              }
            >
              {collapsed ? (
                <ChevronRight
                  size={14}
                />
              ) : (
                <ChevronLeft
                  size={14}
                />
              )}
            </button> */}
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;