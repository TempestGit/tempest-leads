import { Navigate, Outlet } from 'react-router-dom';
import { useSession } from '../features/auth/auth.queries';

export default function ProtectedRoute() {
  const session = useSession();

  if (session.isPending) {
    return (
      <main className="grid min-h-screen place-items-center bg-canvas text-ink">
        <p role="status">Checking your session…</p>
      </main>
    );
  }

  if (session.isError) {
    return (
      <main className="grid min-h-screen place-items-center bg-canvas p-6 text-ink">
        <div className="max-w-md text-center">
          <h1 className="text-xl font-semibold">
            Could not check your session
          </h1>

          <p className="mt-3 text-subtle" role="alert">
            {session.error.message}
          </p>

          <button
            type="button"
            onClick={() => session.refetch()}
            disabled={session.isFetching}
            className="mt-6 rounded-lg bg-brand text-surface px-5 py-3 font-semibold disabled:opacity-50"
          >
            {session.isFetching ? 'Retrying…' : 'Try again'}
          </button>
        </div>
      </main>
    );
  }

  if (!session.data.authenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet context={{ user: session.data.user }} />;
}