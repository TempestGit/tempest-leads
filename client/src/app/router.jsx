import {
  Navigate,
  createBrowserRouter,
} from "react-router-dom";

import ProtectedRoute from "./ProtectedRoute";
import RoleRoute from "./RoleRoute";

import AppLayout from "../components/layout/AppLayout";
import PagePlaceholder from "../components/common/PagePlaceholder";

import LoginPage from "../features/auth/LoginPage";
import CompaniesPage from "../features/companies/CompaniesPage";
import ContactsPage from "../features/contacts/ContactsPage.jsx";
import LeadsPage from "../features/leads/LeadsPage.jsx";
import LeadDetailPage from "../features/leads/LeadDetailPage.jsx";
import ActivitiesPage from "../features/activities/ActivitiesPage.jsx";
import MeetingsPage from "../features/meetings/MeetingsPage.jsx";
import FollowupsPage from "../features/followups/FollowupsPage.jsx";

import NotFoundPage from "../pages/NotFoundPage";

const page = (
  title,
  description
) => {
  return (
    <PagePlaceholder
      title={title}
      description={
        description
      }
    />
  );
};

export const router =
  createBrowserRouter([
    {
      path: "/login",
      element:
        <LoginPage />,
    },

    {
      element:
        <ProtectedRoute />,

      children: [
        {
          element:
            <AppLayout />,

          children: [
            {
              index: true,

              element: (
                <Navigate
                  to="/dashboard"
                  replace
                />
              ),
            },

            {
              path: "dashboard",

              element: page(
                "Dashboard",
                "Acquisition performance, pipeline activity and priority actions."
              ),
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

              element: page(
                "Nurture",
                "Manage long-term opportunities and reconnect plans."
              ),
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
                <RoleRoute
                  allowedRoles={[
                    "SUPER_ADMIN",
                  ]}
                />
              ),

              children: [
                {
                  path:
                    "admin/users",

                  element: page(
                    "Users / Owners",
                    "Manage CRM users, roles and access."
                  ),
                },

                {
                  path:
                    "admin/team",

                  element: page(
                    "Team Performance",
                    "Review ownership, activity and pipeline performance."
                  ),
                },

                {
                  path:
                    "admin/settings",

                  element: page(
                    "Settings",
                    "Configure CRM-level settings."
                  ),
                },

                {
                  path:
                    "admin/audit",

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

      element:
        <NotFoundPage />,
    },
  ]);