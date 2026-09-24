import useAuth from "../features/auth/useAuth";

const HomePage = () => {
  const {
    user,
    logout,
  } = useAuth();

  return (
    <main className="min-h-screen bg-[#f4f7fa] p-8">
      <div className="mx-auto max-w-5xl">
        <div className="rounded-xl border border-slate-200 bg-white p-7 shadow-sm">
          <p className="text-xs font-bold tracking-wider text-red-600">
            TEMPEST LEADS
          </p>

          <h1 className="mt-2 text-3xl font-bold text-[#172b43]">
            Authentication
            successful
          </h1>

          <p className="mt-3 text-slate-500">
            You are signed into
            the production-backed
            CRM.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg bg-slate-50 p-4">
              <p className="text-xs text-slate-500">
                Name
              </p>

              <strong className="mt-1 block">
                {user?.fullName}
              </strong>
            </div>

            <div className="rounded-lg bg-slate-50 p-4">
              <p className="text-xs text-slate-500">
                Email
              </p>

              <strong className="mt-1 block">
                {user?.email}
              </strong>
            </div>

            <div className="rounded-lg bg-slate-50 p-4">
              <p className="text-xs text-slate-500">
                Role
              </p>

              <strong className="mt-1 block">
                {user?.role}
              </strong>
            </div>

            <div className="rounded-lg bg-slate-50 p-4">
              <p className="text-xs text-slate-500">
                Status
              </p>

              <strong className="mt-1 block text-emerald-600">
                {user?.status}
              </strong>
            </div>
          </div>

          <button
            onClick={logout}
            className="mt-8 rounded-lg border border-red-200 bg-red-50 px-5 py-2.5 text-sm font-semibold text-red-700"
          >
            Logout
          </button>
        </div>
      </div>
    </main>
  );
};

export default HomePage;