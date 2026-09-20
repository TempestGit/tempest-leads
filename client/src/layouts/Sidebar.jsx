import { NavLink } from 'react-router-dom';
import { getNavigation } from '../app/navigation';

export default function Sidebar({ user, onNavigate }) {
  const groups = getNavigation(user.role);

  return (
    <div className="flex h-full flex-col bg-[#18181B] text-[#FAFAFA]">
      <div className="border-b border-[#303036] px-5 py-6">
        <p className="text-lg font-extrabold tracking-wide text-[#FAFAFA]">
          TEMPEST <span className="text-[#FF737A]">LEADS</span>
        </p>

        <p className="mt-1 text-[10px] tracking-[0.2em] text-[#A1A1AA]">
          ACQUISITION CRM
        </p>
      </div>

      <nav
        aria-label="Main navigation"
        className="flex-1 space-y-6 overflow-y-auto px-3 py-5"
        style={{
          scrollbarColor: '#52525B #18181B',
          scrollbarWidth: 'thin',
        }}
      >
        {groups.map((group) => (
          <div key={group.title}>
            <p className="mb-2 px-3 text-[10px] font-semibold tracking-widest text-[#A1A1AA] uppercase">
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
                            'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white',
                            isActive
                              ? 'bg-[#C91820] font-semibold text-white'
                              : 'text-[#D4D4D8] hover:bg-[#27272A] hover:text-white',
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
                        className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-[#85858F]"
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

      <div className="border-t border-[#303036] px-5 py-4">
        <p className="truncate text-sm font-semibold text-[#FAFAFA]">
          {user.name}
        </p>

        <p className="mt-1 text-xs text-[#A1A1AA]">
          {user.role === 'SUPER_ADMIN' ? 'Super Admin' : 'Owner'}
        </p>
      </div>
    </div>
  );
}