
import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";

import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

const STORAGE_KEY = "tempest-sidebar-collapsed";

function getSavedCollapseState() {
  try {
    return localStorage.getItem(STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

export default function AppLayout() {
  const location = useLocation();

  const [collapsed, setCollapsed] = useState(
    getSavedCollapseState
  );

  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        String(collapsed)
      );
    } catch {
      // Continue when browser storage is unavailable.
    }
  }, [collapsed]);

  useEffect(() => {
    if (!mobileOpen) return;

    const onEscape = (event) => {
      if (event.key === "Escape") {
        setMobileOpen(false);
      }
    };

    window.addEventListener("keydown", onEscape);

    return () => {
      window.removeEventListener("keydown", onEscape);
    };
  }, [mobileOpen]);

  return (
    <div
      className={[
        "tl-shell",
        "glass-app-shell",
        collapsed ? "is-collapsed" : "",
      ].join(" ")}
    >
      <Sidebar
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onToggleCollapse={() =>
          setCollapsed((current) => !current)
        }
        onCloseMobile={() => setMobileOpen(false)}
      />

      <div className="tl-main glass-app-main">
        <Topbar
          onOpenMobile={() => setMobileOpen(true)}
        />

        <main
          id="page-content"
          className="tl-page glass-app-content"
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}
