import { useState } from 'react';
import {
  Outlet,
  useLocation,
  useOutletContext,
} from 'react-router-dom';

import Sidebar from './Sidebar';
import Topbar from './Topbar';

export default function AppLayout() {
  const { user } = useOutletContext();
  const location = useLocation();

  const [mobileMenuLocation, setMobileMenuLocation] = useState(null);

  const mobileOpen = mobileMenuLocation === location.key;

  function toggleNavigation() {
    setMobileMenuLocation(mobileOpen ? null : location.key);
  }

  return (
    <div className="min-h-screen bg-canvas">
      <a
        href="#page-content"
        className="sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:not-sr-only focus:rounded-lg focus:bg-surface focus:p-3 focus:text-action"
      >
        Skip to content
      </a>

      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 lg:block">
        <Sidebar user={user} />
      </aside>

      <div className="min-w-0 lg:pl-64">
        <Topbar
          user={user}
          mobileOpen={mobileOpen}
          onToggleNavigation={toggleNavigation}
        />

        <div
          id="mobile-navigation"
          hidden={!mobileOpen}
          className="lg:hidden"
        >
          <div className="max-h-[65vh] overflow-y-auto">
            <Sidebar
              user={user}
              onNavigate={() => setMobileMenuLocation(null)}
            />
          </div>
        </div>

        <main
          id="page-content"
          tabIndex={-1}
          className="min-w-0 p-4 outline-none sm:p-6 lg:p-8"
        >
          <Outlet context={{ user }} />
        </main>
      </div>
    </div>
  );
}