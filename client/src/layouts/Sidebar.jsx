import { NavLink } from 'react-router-dom';
import { getNavigation } from '../app/navigation';

export default function Sidebar({ user, onNavigate }) {
  const groups = getNavigation(user.role);

  return (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-ink">
      <div className="border-b border-sidebar-line px-5 py-6">
        <p className="text-lg font-extrabold tracking-wide text-sidebar-ink">
          TEMPEST{' '}
          <span className="text-sidebar-accent">LEADS</span>
        </p>

        <p className="mt-1 text-[10px] tracking-[0.2em] text-sidebar-muted">
          ACQUISITION CRM TEST
        </p>
      </div>

      <nav
        aria-label="Main navigation"
        className="crm-sidebar-scroll flex-1 space-y-6 overflow-y-auto px-3 py-5"
        style={{ scrollbarWidth: 'thin' }}
      >
        {groups.map((group) => (
          <div key={group.title}>
            <p className="mb-2 px-3 text-[10px] font-semibold tracking-widest text-sidebar-muted uppercase">
              {group.title}
            </p>

            <ul className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon;

                return (
                  <li key={item.to}>
                    {item.enabled ? (
                      <NavLink
                        to={item.to}
                        onClick={onNavigate}
                        className={({ isActive }) =>
                          [
                            'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm',
                            'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sidebar-ink',
                            isActive
                              ? 'bg-brand font-semibold text-surface'
                              : 'text-sidebar-ink hover:bg-sidebar-hover',
                          ].join(' ')
                        }
                      >
                        <Icon size={18} aria-hidden="true" />
                        <span>{item.label}</span>
                      </NavLink>
                    ) : (
                      <div
                        aria-disabled="true"
                        title="Not available yet"
                        className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-sidebar-disabled"
                      >
                        <Icon size={18} aria-hidden="true" />
                        <span>{item.label}</span>

                        <span className="sr-only">
                          — not available yet
                        </span>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t border-sidebar-line px-5 py-4">
        <p className="truncate text-sm font-semibold text-sidebar-ink">
          {user.name}
        </p>

        <p className="mt-1 text-xs text-sidebar-muted">
          {user.role === 'SUPER_ADMIN' ? 'Super Admin' : 'Owner'}
        </p>
      </div>
    </div>
  );
}