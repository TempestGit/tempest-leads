import {
  Activity,
  BarChart3,
  BellRing,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  CircleDollarSign,
  ClipboardCheck,
  ContactRound,
  FileText,
  Gauge,
  Handshake,
  History,
  ListChecks,
  Settings,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";

export const workspaceNavigation = [
  {
    label: "Dashboard",
    path: "/dashboard",
    icon: Gauge,
  },
  {
    label: "Leads & Pipeline",
    path: "/leads",
    icon: BriefcaseBusiness,
  },
  {
    label: "Companies",
    path: "/companies",
    icon: Building2,
  },
  {
    label: "Contacts",
    path: "/contacts",
    icon: ContactRound,
  },
  {
    label: "Activities",
    path: "/activities",
    icon: Activity,
  },
  {
    label: "Meetings",
    path: "/meetings",
    icon: CalendarDays,
  },
  {
    label: "Follow-ups",
    path: "/followups",
    icon: ListChecks,
  },
];

export const lifecycleNavigation = [
  {
    label: "Nurture",
    path: "/nurture",
    icon: BellRing,
  },
  {
    label: "Pitch",
    path: "/pitch",
    icon: Sparkles,
  },
  {
    label: "Commercials",
    path: "/commercials",
    icon: CircleDollarSign,
  },
  {
    label: "Contracts / PO",
    path: "/contracts",
    icon: FileText,
  },
  {
    label: "Onboarding",
    path: "/onboarding",
    icon: ClipboardCheck,
  },
  {
    label: "Active Clients",
    path: "/clients",
    icon: Handshake,
  },
  {
    label: "Reports / Analytics",
    path: "/reports",
    icon: BarChart3,
  },
];

export const adminNavigation = [
  {
    label: "Users / Owners",
    path: "/admin/users",
    icon: Users,
  },
  {
    label: "Team Performance",
    path: "/admin/team",
    icon: ShieldCheck,
  },
  {
    label: "Settings",
    path: "/admin/settings",
    icon: Settings,
  },
  {
    label: "Audit Log",
    path: "/admin/audit",
    icon: History,
  },
];