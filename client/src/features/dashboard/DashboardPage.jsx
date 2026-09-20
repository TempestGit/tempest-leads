import { Link, useOutletContext } from 'react-router-dom';
import { ArrowRight, LayoutDashboard } from 'lucide-react';

export default function DashboardPage() {
  const { user } = useOutletContext();
  const isAdmin = user.role === 'SUPER_ADMIN';

  return (
    <div className="mx-auto max-w-7xl">
      <div>
        <p className="text-xs font-semibold tracking-widest text-brand uppercase">
          {isAdmin ? 'Administration workspace' : 'My workspace'}
        </p>

        <h1 className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">
          Welcome, {user.name}
        </h1>

        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
          {isAdmin
            ? 'Your workspace for managing lead acquisition, ownership, and client onboarding.'
            : 'Your workspace for managing assigned opportunities and upcoming actions.'}
        </p>
      </div>

      <section className="mt-8 rounded-xl border border-slate-200 bg-white p-6 sm:p-8">
        <span className="inline-flex rounded-xl bg-action-soft p-3 text-action">
          <LayoutDashboard size={26} aria-hidden="true" />
        </span>

        <h2 className="mt-5 text-xl font-semibold text-slate-900">
          Dashboard setup in progress
        </h2>

        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
          Lead totals, follow-ups, meetings, and pipeline performance will
          appear here once the CRM modules are connected. Unavailable
          modules are shown in muted text in the navigation.
        </p>

        <Link
          to="/account"
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-action px-4 py-3 text-sm font-semibold text-white hover:bg-action-hover"
        >
          View my account
          <ArrowRight size={17} aria-hidden="true" />
        </Link>
      </section>
    </div>
  );
}