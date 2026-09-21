import {
  LayoutDashboard,
  Building2,
  Users,
  Target,
  Activity,
  CalendarDays,
  ListChecks,
  HeartHandshake,
  Presentation,
  FileText,
  FileCheck,
  ClipboardCheck,
  Briefcase,
  ChartColumn,
  Settings,
  Shield,
  UserRound,
} from 'lucide-react';

export const navigation = [
  {
    title: 'Workspace',
    items: [
      {
        label: 'Dashboard',
        to: '/dashboard',
        icon: LayoutDashboard,
        enabled: true,
      },
      {
        label: 'Leads & Pipeline',
        to: '/leads',
        icon: Target,
        enabled: true,
      },
      {
        label: 'Companies',
        to: '/companies',
        icon: Building2,
        enabled: true,
      },
      {
        label: 'Contacts',
        to: '/contacts',
        icon: Users,
        enabled: true,
      },
      {
        label: 'Activities',
        to: '/activities',
        icon: Activity,
        enabled: true,
      },
      {
        label: 'Meetings',
        to: '/meetings',
        icon: CalendarDays,
      },
      {
        label: 'Follow-ups',
        to: '/follow-ups',
        icon: ListChecks,
        enabled: true,
      },
    ],
  },
  {
    title: 'Lifecycle',
    items: [
      {
        label: 'Nurture',
        to: '/nurture',
        icon: HeartHandshake,
      },
      {
        label: 'Pitches',
        to: '/pitches',
        icon: Presentation,
      },
      {
        label: 'Commercials',
        to: '/commercials',
        icon: FileText,
      },
      {
        label: 'Contracts / PO',
        to: '/contracts',
        icon: FileCheck,
      },
      {
        label: 'Onboarding',
        to: '/onboarding',
        icon: ClipboardCheck,
      },
      {
        label: 'Active Clients',
        to: '/clients',
        icon: Briefcase,
      },
      {
        label: 'Reports',
        to: '/reports',
        icon: ChartColumn,
      },
    ],
  },
  {
    title: 'Administration',
    adminOnly: true,
    items: [
      {
        label: 'Users / Owners',
        to: '/users',
        icon: Users,
      },
      {
        label: 'Team Performance',
        to: '/team-performance',
        icon: ChartColumn,
      },
      {
        label: 'Settings',
        to: '/settings',
        icon: Settings,
      },
      {
        label: 'Audit Log',
        to: '/audit',
        icon: Shield,
      },
    ],
  },
  {
    title: 'Account',
    items: [
      {
        label: 'My Account',
        to: '/account',
        icon: UserRound,
        enabled: true,
      },
    ],
  },
];

export function getNavigation(role) {
  return navigation.filter(
    (group) => !group.adminOnly || role === 'SUPER_ADMIN',
  );
}