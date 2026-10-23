
import {
  Navigate,
  createBrowserRouter,
} from "react-router-dom";

import ProtectedRoute from "./ProtectedRoute";
import RoleRoute from "./RoleRoute";

import AppLayout from "../components/layout/AppLayout";
import PagePlaceholder from "../components/common/PagePlaceholder";

import LoginPage from "../features/auth/LoginPage";
import ChangePasswordPage from "../features/auth/ChangePasswordPage";
import ForgotPasswordPage from "../features/auth/ForgotPasswordPage";
import ResetPasswordPage from "../features/auth/ResetPasswordPage";
import MyProfilePage from "../features/auth/MyProfilePage";
import ProfileSettingsPage from "../features/auth/ProfileSettingsPage";

import CompaniesPage from "../features/companies/CompaniesPage";
import ContactsPage from "../features/contacts/ContactsPage.jsx";
import LeadsPage from "../features/leads/LeadsPage.jsx";
import DashboardPage from "../features/dashboard/DashboardPage.jsx";
import LeadDetailPage from "../features/leads/LeadDetailPage.jsx";
import ActivitiesPage from "../features/activities/ActivitiesPage.jsx";
import MeetingsPage from "../features/meetings/MeetingsPage.jsx";
import FollowupsPage from "../features/followups/FollowupsPage.jsx";
import NurturePage from "../features/nurture/NurturePage.jsx";
import UsersPage from "../features/users/UsersPage.jsx";

import NotFoundPage from "../pages/NotFoundPage";

const page = (title, description) => (
  <PagePlaceholder
    title={title}
    description={description}
  />
);

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/change-password",
    element: <ChangePasswordPage />,
  },
  {
    path: "/forgot-password",
    element: <ForgotPasswordPage />,
  },
  {
    path: "/reset-password",
    element: <ResetPasswordPage />,
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          {
            index: true,
            element: <Navigate to="/dashboard" replace />,
          },
          {
            path: "dashboard",
            element: <DashboardPage />,
          },
          {
            path: "profile",
            element: <MyProfilePage />,
          },
          {
            path: "profile/settings",
            element: <ProfileSettingsPage />,
          },
          {
            path: "leads",
            element: <LeadsPage />,
          },
          {
            path: "leads/:leadId",
            element: <LeadDetailPage />,
          },
          {
            path: "companies",
            element: <CompaniesPage />,
          },
          {
            path: "contacts",
            element: <ContactsPage />,
          },
          {
            path: "activities",
            element: <ActivitiesPage />,
          },
          {
            path: "meetings",
            element: <MeetingsPage />,
          },
          {
            path: "followups",
            element: <FollowupsPage />,
          },
          {
            path: "nurture",
            element: <NurturePage />,
          },
          {
            path: "pitch",
            element: page(
              "Pitch",
              "Track pitch preparation and client presentations."
            ),
          },
          {
            path: "commercials",
            element: page(
              "Commercials",
              "Track commercial discussions and proposal versions."
            ),
          },
          {
            path: "contracts",
            element: page(
              "Contracts / PO",
              "Manage contracts, purchase orders and approvals."
            ),
          },
          {
            path: "onboarding",
            element: page(
              "Onboarding",
              "Complete required onboarding activities before activation."
            ),
          },
          {
            path: "clients",
            element: page(
              "Active Clients",
              "View opportunities converted into active client relationships."
            ),
          },
          {
            path: "reports",
            element: page(
              "Reports / Analytics",
              "Analyse acquisition performance, sources and conversion."
            ),
          },
          {
            element: (
              <RoleRoute allowedRoles={["SUPER_ADMIN"]} />
            ),
            children: [
              {
                path: "admin/users",
                element: <UsersPage />,
              },
              {
                path: "admin/team",
                element: page(
                  "Team Performance",
                  "Review ownership, activity and pipeline performance."
                ),
              },
              {
                path: "admin/settings",
                element: page(
                  "Settings",
                  "Configure CRM-level settings."
                ),
              },
              {
                path: "admin/audit",
                element: page(
                  "Audit Log",
                  "Review important system and user changes."
                ),
              },
            ],
          },
        ],
      },
    ],
  },
  {
    path: "*",
    element: <NotFoundPage />,
  },
]);