import { Link, useLocation } from 'react-router-dom';
import { Menu, X, UserRound } from 'lucide-react';

export default function Topbar({
  user,
  mobileOpen,
  onToggleNavigation,
}) {
  const { pathname } = useLocation();

  const titles = {
    '/dashboard': 'Dashboard',
    '/account': 'My Account',
    '/companies': 'Company Master',
    '/contacts': 'Contact Master',
    '/leads': 'Leads & Pipeline',
    '/leads/new': 'Create Lead',
  };

const title =
  titles[pathname] ||
  (pathname.startsWith('/companies/')
    ? 'Company Details'
    : pathname.startsWith('/contacts/')
      ? 'Contact Details'
      : pathname.startsWith('/leads/')
        ? 'Lead Details'
        : 'Tempest Leads');

  return (
    <header className="sticky top-0 z-20 flex min-h-16 items-center justify-between gap-3 border-b border-line bg-surface px-4 sm:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={onToggleNavigation}
          aria-label={
            mobileOpen ? 'Close navigation' : 'Open navigation'
          }
          aria-expanded={mobileOpen}
          aria-controls="mobile-navigation"
          className="rounded-lg p-2 text-muted hover:bg-surface-hover hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus lg:hidden"
        >
          {mobileOpen ? (
            <X size={22} aria-hidden="true" />
          ) : (
            <Menu size={22} aria-hidden="true" />
          )}
        </button>

        <p className="truncate font-semibold text-ink">
          {title}
        </p>
      </div>

      <Link
        to="/account"
        className="flex shrink-0 items-center gap-3 rounded-lg p-2 hover:bg-surface-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
      >
        <div className="hidden text-right sm:block">
          <p className="max-w-44 truncate text-sm font-semibold text-ink">
            {user.name}
          </p>

          <p className="text-xs text-muted">
            {user.role === 'SUPER_ADMIN' ? 'Super Admin' : 'Owner'}
          </p>
        </div>

        <span className="grid size-9 place-items-center rounded-full bg-brand-soft text-brand">
          <UserRound size={19} aria-hidden="true" />
        </span>

        <span className="sr-only">Open my account</span>
      </Link>
    </header>
  );
}