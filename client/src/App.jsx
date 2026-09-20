import {
  Link,
  Navigate,
  Route,
  Routes,
  useParams,
} from 'react-router-dom';

import ProtectedRoute from './app/ProtectedRoute';
import AppLayout from './layouts/AppLayout';

import LoginPage from './features/auth/LoginPage';
import AccountPage from './features/auth/AccountPage';
import DashboardPage from './features/dashboard/DashboardPage';
import CompaniesPage from './features/companies/CompaniesPage';
import CompanyDetailPage from './features/companies/CompanyDetailPage';
import ContactsPage from './features/contacts/ContactsPage';

function CompanyDetailRoute() {
  const { id } = useParams();

  return <CompanyDetailPage key={id} />;
}

function NotFoundPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-slate-100 p-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-slate-900">
          Page not found
        </h1>

        <Link
          to="/dashboard"
          className="mt-4 inline-block font-semibold text-action"
        >
          Return to dashboard
        </Link>
      </div>
    </main>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/account" element={<AccountPage />} />
          <Route path="/companies" element={<CompaniesPage />} />
          <Route
            path="/companies/:id"
            element={<CompanyDetailRoute />}
          />
          <Route path="/contacts" element={<ContactsPage />} />
        </Route>
      </Route>

      <Route
        path="/"
        element={<Navigate to="/dashboard" replace />}
      />

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}