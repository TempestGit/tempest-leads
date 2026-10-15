
import {
  ChevronLeft,
  ChevronRight,
  LogOut,
  X,
} from "lucide-react";

import { NavLink } from "react-router-dom";

import Logo from "../../assets/tempest-branding.png";

import {
  workspaceNavigation,
  lifecycleNavigation,
  adminNavigation,
} from "../../config/navigation";

import useAuth from "../../features/auth/useAuth";

const getInitials = (name) =>
  String(name || "User")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

function NavigationSection({
  title,
  items,
  collapsed,
  onNavigate,
}) {
  return (
    <div className="glass-sidebar-section">
      {!collapsed && (
        <p className="glass-sidebar-heading">
          {title}
        </p>
      )}

      <div className="flex flex-col gap-1">
        {items.map(({ label, path, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            end={path === "/dashboard"}
            onClick={onNavigate}
            title={collapsed ? label : undefined}
            className={({ isActive }) =>
              [
                "glass-sidebar-link",
                "flex items-center gap-3",
                "rounded-xl px-3 py-2.5",
                "text-sm font-medium",
                "transition-all duration-200",
                isActive ? "is-active" : "",
              ].join(" ")
            }
          >
            <Icon
              size={18}
              strokeWidth={1.8}
              className="shrink-0"
            />

            {!collapsed && (
              <span className="min-w-0 flex-1 truncate">
                {label}
              </span>
            )}
          </NavLink>
        ))}
      </div>
    </div>
  );
}

export default function Sidebar({
  collapsed,
  mobileOpen,
  onToggleCollapse,
  onCloseMobile,
}) {
  const { user, logout } = useAuth();

  const isAdmin = user?.role === "SUPER_ADMIN";

  const initials = getInitials(user?.fullName);

  // A collapsed desktop sidebar still expands
  // fully when opened as a mobile drawer.
  const compact = collapsed && !mobileOpen;

  return (
    <>
      {mobileOpen && (
        <button
          type="button"
          className="glass-sidebar-backdrop"
          onClick={onCloseMobile}
          aria-label="Close navigation"
        />
      )}

      <aside
        className={[
          "tl-sidebar",
          "glass-sidebar",
          compact ? "collapsed" : "",
          mobileOpen ? "open" : "",
        ].join(" ")}
        aria-label="Main navigation"
      >
        {/* Brand */}

        <div className="glass-sidebar-brand flex items-center justify-between gap-2">
          {compact ? (
            <div
              className="glass-sidebar-monogram"
              title="Tempest Leads"
            >
              T
            </div>
          ) : (
            <img
              src={Logo}
              alt="Tempest Leads"
              className="glass-sidebar-logo"
            />
          )}

          <button
            type="button"
            className="glass-sidebar-mobile-close"
            onClick={onCloseMobile}
            aria-label="Close navigation"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation */}

        <nav className="glass-sidebar-nav">
          <NavigationSection
            title="Workspace"
            items={workspaceNavigation}
            collapsed={compact}
            onNavigate={onCloseMobile}
          />

          <NavigationSection
            title="Lifecycle"
            items={lifecycleNavigation}
            collapsed={compact}
            onNavigate={onCloseMobile}
          />

          {isAdmin && (
            <NavigationSection
              title="Administration"
              items={adminNavigation}
              collapsed={compact}
              onNavigate={onCloseMobile}
            />
          )}
        </nav>

        {/* Footer */}

        <div className="glass-sidebar-footer">
          <div className="glass-sidebar-profile flex items-center gap-3">
            <div className="glass-user-avatar">
              {initials}
            </div>

            {!compact && (
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold">
                  {user?.fullName || "User"}
                </p>

                <p className="glass-sidebar-muted mt-0.5 truncate text-xs">
                  {user?.location ||
                    (isAdmin
                      ? "Administrator"
                      : "Workspace")}
                </p>
              </div>
            )}
          </div>

          <div className="mt-3 flex items-center justify-between gap-2">
            <button
              type="button"
              className="glass-sidebar-footer-button"
              onClick={logout}
              title="Logout"
              aria-label="Logout"
            >
              <LogOut size={17} />

              {!compact && <span>Logout</span>}
            </button>

            <button
              type="button"
              className="glass-sidebar-footer-button glass-sidebar-collapse"
              onClick={onToggleCollapse}
              title={
                collapsed
                  ? "Expand sidebar"
                  : "Collapse sidebar"
              }
              aria-label={
                collapsed
                  ? "Expand sidebar"
                  : "Collapse sidebar"
              }
              aria-expanded={!collapsed}
            >
              {collapsed ? (
                <ChevronRight size={17} />
              ) : (
                <ChevronLeft size={17} />
              )}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
