import {
  Navigate,
  Outlet,
  useLocation,
} from "react-router-dom";

import useAuth from "../features/auth/useAuth";

const ProtectedRoute = () => {
  const {
    authenticated,
    initializing,
  } = useAuth();

  const location =
    useLocation();

  if (initializing) {
    return (
      <main className="grid min-h-screen place-items-center bg-canvas">
        <div className="text-center">
          <div className="mx-auto size-8 animate-spin rounded-full border-4 border-line border-t-brand" />

          <p className="mt-4 text-sm text-muted">
            Loading TEMPEST
            LEADS...
          </p>
        </div>
      </main>
    );
  }

  if (!authenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: location,
        }}
      />
    );
  }

  return <Outlet />;
};

export default ProtectedRoute;