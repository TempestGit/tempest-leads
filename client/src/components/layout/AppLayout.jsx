import {
  useState,
} from "react";

import {
  Outlet,
} from "react-router-dom";

import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

const AppLayout = () => {
  const [
    collapsed,
    setCollapsed,
  ] = useState(false);

  const [
    mobileOpen,
    setMobileOpen,
  ] = useState(false);

  return (
    <div className="tl-shell">
      <Sidebar
        collapsed={
          collapsed
        }
        mobileOpen={
          mobileOpen
        }
        onToggleCollapse={() =>
          setCollapsed(
            (value) =>
              !value
          )
        }
        onCloseMobile={() =>
          setMobileOpen(false)
        }
      />

      <div className="tl-main">
        <Topbar
          onOpenMobile={() =>
            setMobileOpen(true)
          }
        />

        <main
          id="page-content"
          className="tl-page"
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;