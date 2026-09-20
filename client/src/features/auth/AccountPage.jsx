import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  useNavigate,
  useOutletContext,
} from 'react-router-dom';
import { LogOut, LoaderCircle } from 'lucide-react';

import { logout } from './auth.api';
import { SESSION_QUERY_KEY } from './auth.queries';

export default function AccountPage() {
  const { user } = useOutletContext();

  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [error, setError] = useState('');

  const queryClient = useQueryClient();
  const navigate = useNavigate();

  async function handleLogout() {
    setIsLoggingOut(true);
    setError('');

    try {
      await queryClient.cancelQueries({
        queryKey: SESSION_QUERY_KEY,
      });

      await logout();

      queryClient.clear();
      queryClient.setQueryData(SESSION_QUERY_KEY, {
        authenticated: false,
        user: null,
        csrfToken: null,
      });

      navigate('/login', { replace: true });
    } catch (logoutError) {
      setError(logoutError.message || 'Unable to log out.');
    } finally {
      setIsLoggingOut(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <section className="mx-auto max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10">
        <p className="text-sm font-bold tracking-widest text-red-600">
          TEMPEST LEADS
        </p>

        <h1 className="mt-4 text-3xl font-bold text-slate-900">
          Welcome, {user.name}
        </h1>

        <p className="mt-3 text-slate-600">
          You are signed in.
        </p>

        <dl className="mt-8 divide-y divide-slate-200">
          {[
            ['Name', user.name],
            ['Email', user.email],
            [
              'Role',
              user.role === 'SUPER_ADMIN' ? 'Super Admin' : 'Owner',
            ],
            ['Status', user.status],
          ].map(([label, value]) => (
            <div
              key={label}
              className="grid gap-1 py-4 sm:grid-cols-[100px_1fr]"
            >
              <dt className="text-sm text-slate-500">{label}</dt>
              <dd className="break-words font-medium text-slate-900">
                {value}
              </dd>
            </div>
          ))}
        </dl>

        {error && (
          <p
            role="alert"
            className="mt-6 rounded-lg bg-red-50 p-3 text-sm text-red-700"
          >
            {error}
          </p>
        )}

        <button
          type="button"
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="mt-8 inline-flex items-center gap-2 rounded-lg bg-slate-900 px-5 py-3 font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
        >
          {isLoggingOut ? (
            <LoaderCircle size={18} className="animate-spin" />
          ) : (
            <LogOut size={18} />
          )}

          {isLoggingOut ? 'Signing out…' : 'Sign out'}
        </button>
      </section>
    </div>
  );
}