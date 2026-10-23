
import {
  ArrowRight,
  Building2,
  CalendarClock,
  CheckCircle2,
  LockKeyhole,
  Mail,
  MapPin,
  ShieldCheck,
  UserRound,
  Users,
} from "lucide-react";

import { Link } from "react-router-dom";

import "./profile-glass.css";
import useAuth from "./useAuth";

const initials = (name) =>
  String(name || "User")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

const formatDate = (value) => {
  if (!value) return "Not available";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Not available";
  }

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
};

const InfoItem = ({ icon: Icon, label, value }) => (
  <div className="tlp-info-item flex min-w-0 items-start gap-3 p-4">
    <span className="tlp-info-icon flex h-10 w-10 shrink-0 items-center justify-center">
      <Icon size={19} aria-hidden="true" />
    </span>

    <div className="min-w-0">
      <p className="tlp-info-label text-xs">{label}</p>
      <p className="tlp-info-value mt-1 break-words text-sm font-semibold">
        {value || "Not provided"}
      </p>
    </div>
  </div>
);

const MyProfilePage = () => {
  const { user } = useAuth();

  const roleLabel =
    user?.role === "SUPER_ADMIN"
      ? "Super Admin"
      : user?.role === "OWNER"
        ? "Owner"
        : user?.role || "Not assigned";

  return (
    <main className="tlp-page mx-auto flex w-full max-w-6xl flex-col gap-6 p-4 md:p-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="tlp-eyebrow text-xs">
            My Workspace
          </p>

          <h1 className="tlp-page-title mt-2 text-2xl font-extrabold md:text-3xl">
            My Profile
          </h1>

          <p className="tlp-page-description mt-2 text-sm">
            View your personal information and account access.
          </p>
        </div>

        <Link
          to="/profile/settings"
          className="tlp-btn tlp-btn-secondary px-4 py-3 text-sm"
        >
          Edit Profile
          <ArrowRight size={17} aria-hidden="true" />
        </Link>
      </header>

      <section className="tlp-glass-card overflow-hidden p-6 md:p-8">
        <div className="flex flex-wrap items-center gap-5">
          <div className="tlp-profile-avatar flex h-20 w-20 shrink-0 items-center justify-center text-2xl font-extrabold">
            {initials(user?.fullName)}
          </div>

          <div className="min-w-0 flex-1">
            <h2 className="tlp-profile-name break-words text-2xl font-extrabold">
              {user?.fullName || "User"}
            </h2>

            <p className="tlp-muted mt-1 break-all text-sm">
              {user?.email || "No email available"}
            </p>

            <div className="mt-3 flex flex-wrap gap-2">
              <span className="tlp-profile-badge px-3 py-1 text-xs font-bold">
                {roleLabel}
              </span>

              <span className="tlp-profile-badge inline-flex items-center gap-1 px-3 py-1 text-xs font-bold">
                <CheckCircle2 size={13} aria-hidden="true" />
                {user?.status || "Not available"}
              </span>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <section className="tlp-glass-card min-w-0 p-5 md:p-7">
          <div className="mb-6 flex items-center gap-3">
            <span className="tlp-heading-icon flex h-10 w-10 items-center justify-center">
              <UserRound size={21} aria-hidden="true" />
            </span>

            <h2 className="tlp-card-heading text-lg font-extrabold">
              Personal Information
            </h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <InfoItem
              icon={UserRound}
              label="Full Name"
              value={user?.fullName}
            />

            <InfoItem
              icon={Mail}
              label="Email Address"
              value={user?.email}
            />

            <InfoItem
              icon={Building2}
              label="Department"
              value={user?.department}
            />

            <InfoItem
              icon={MapPin}
              label="Location"
              value={user?.location}
            />

            <InfoItem
              icon={Users}
              label="User Code"
              value={user?.userCode}
            />

            <InfoItem
              icon={ShieldCheck}
              label="Role"
              value={roleLabel}
            />

            <InfoItem
              icon={CalendarClock}
              label="Last Login"
              value={formatDate(user?.lastLoginAt)}
            />

            <InfoItem
              icon={CheckCircle2}
              label="Account Status"
              value={user?.status}
            />

            {user?.branchName && (
              <InfoItem
                icon={Building2}
                label="Branch"
                value={user.branchName}
              />
            )}
          </div>
        </section>

        <div className="flex flex-col gap-6">
          <section className="tlp-glass-card p-6">
            <div className="flex items-center gap-3">
              <span className="tlp-heading-icon flex h-10 w-10 items-center justify-center">
                <ShieldCheck size={21} aria-hidden="true" />
              </span>

              <h2 className="tlp-card-heading text-lg font-extrabold">
                Account Access
              </h2>
            </div>

            <p className="tlp-muted mt-4 text-sm leading-6">
              Your role and account status are managed by
              your CRM administrator.
            </p>

            <div className="tlp-info-item mt-5 p-4">
              <div>
                <p className="tlp-info-label text-xs">
                  Current Access Level
                </p>

                <p className="tlp-info-value mt-1 font-bold">
                  {roleLabel}
                </p>
              </div>
            </div>
          </section>

          <section className="tlp-glass-card p-6">
            <div className="flex items-center gap-3">
              <span className="tlp-heading-icon flex h-10 w-10 items-center justify-center">
                <LockKeyhole size={21} aria-hidden="true" />
              </span>

              <h2 className="tlp-card-heading text-lg font-extrabold">
                Security
              </h2>
            </div>

            <p className="tlp-muted mt-4 text-sm leading-6">
              Update your password to keep your CRM
              account secure.
            </p>

            <Link
              to="/profile/settings?tab=security"
              className="tlp-link mt-5 inline-flex items-center gap-2 text-sm font-bold"
            >
              Security Settings
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </section>
        </div>
      </div>
    </main>
  );
};

export default MyProfilePage;