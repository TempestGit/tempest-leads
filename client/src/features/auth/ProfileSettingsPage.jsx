import { useCallback, useEffect, useState } from "react";

import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Clock3,
  Eye,
  EyeOff,
  Globe2,
  Laptop,
  LoaderCircle,
  LockKeyhole,
  LogOut,
  Monitor,
  RefreshCw,
  Save,
  ShieldCheck,
  Smartphone,
  Trash2,
  UserRound,
  X,
} from "lucide-react";

import {
  Link,
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import "./profile-glass.css";
import useAuth from "./useAuth";

import {
  updateProfileRequest,
  changePasswordRequest,
  getSessionsRequest,
  revokeSessionRequest,
  revokeOtherSessionsRequest,
  revokeAllSessionsRequest,
} from "./auth.api.js";

const getErrorMessage = (error, fallback) => {
  const data = error?.response?.data;
  const fieldErrors = data?.errors;

  if (Array.isArray(fieldErrors) && fieldErrors.length) {
    const messages = fieldErrors
      .map((item) =>
        typeof item === "string" ? item : item?.message
      )
      .filter(Boolean);

    if (messages.length) return messages.join(" ");
  }

  if (fieldErrors && typeof fieldErrors === "object") {
    const messages = Object.values(fieldErrors)
      .flat()
      .filter((value) => typeof value === "string");

    if (messages.length) return messages.join(" ");
  }

  return data?.message || error?.message || fallback;
};

const formatDateTime = (value) => {
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

const getDeviceDetails = (userAgent = "") => {
  const ua = String(userAgent || "");

  let browser = "Unknown browser";
  let device = "Unknown device";
  let Icon = Monitor;

  if (/Edg\//i.test(ua)) {
    browser = "Microsoft Edge";
  } else if (/OPR\/|Opera/i.test(ua)) {
    browser = "Opera";
  } else if (/Firefox\//i.test(ua)) {
    browser = "Firefox";
  } else if (/Chrome\//i.test(ua)) {
    browser = "Google Chrome";
  } else if (/Safari\//i.test(ua)) {
    browser = "Safari";
  }

  if (/iPhone/i.test(ua)) {
    device = "iPhone";
    Icon = Smartphone;
  } else if (/iPad/i.test(ua)) {
    device = "iPad";
    Icon = Smartphone;
  } else if (/Android/i.test(ua)) {
    device = "Android";
    Icon = Smartphone;
  } else if (/Windows/i.test(ua)) {
    device = "Windows";
    Icon = Laptop;
  } else if (/Macintosh|Mac OS X/i.test(ua)) {
    device = "macOS";
    Icon = Laptop;
  } else if (/Linux/i.test(ua)) {
    device = "Linux";
    Icon = Laptop;
  }

  return {
    browser,
    device,
    Icon,
  };
};

const profileFields = [
  {
    key: "fullName",
    label: "Full Name",
    required: true,
    maxLength: 190,
  },
  {
    key: "department",
    label: "Department",
    required: false,
    maxLength: 150,
  },
  {
    key: "location",
    label: "Location",
    required: false,
    maxLength: 150,
  },
];

const passwordFields = [
  {
    key: "currentPassword",
    label: "Current Password",
    autoComplete: "current-password",
  },
  {
    key: "newPassword",
    label: "New Password",
    autoComplete: "new-password",
  },
  {
    key: "confirmPassword",
    label: "Confirm New Password",
    autoComplete: "new-password",
  },
];

const ProfileSettingsPage = () => {
  const navigate = useNavigate();

  const [searchParams, setSearchParams] =
    useSearchParams();

  const {
    user,
    refreshUser,
    clearSession,
  } = useAuth();

  const requestedTab = searchParams.get("tab");

  const tab = [
    "profile",
    "security",
    "sessions",
  ].includes(requestedTab)
    ? requestedTab
    : "profile";

  const [form, setForm] = useState({
    fullName: "",
    department: "",
    location: "",
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showPasswords, setShowPasswords] =
    useState(false);

  const [saving, setSaving] = useState(false);

  const [changingPassword, setChangingPassword] =
    useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [sessions, setSessions] = useState([]);
  const [loadingSessions, setLoadingSessions] =
    useState(false);

  const [sessionsLoaded, setSessionsLoaded] =
    useState(false);

  const [sessionActionLoading, setSessionActionLoading] =
    useState(false);

  const [pendingAction, setPendingAction] =
    useState(null);

  useEffect(() => {
    setForm({
      fullName: user?.fullName || "",
      department: user?.department || "",
      location: user?.location || "",
    });
  }, [
    user?.fullName,
    user?.department,
    user?.location,
  ]);

  const switchTab = (nextTab) => {
    setError("");
    setSuccess("");
    setPendingAction(null);

    setSearchParams(
      nextTab === "profile"
        ? {}
        : { tab: nextTab }
    );
  };

  const updateField = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));

    setError("");
    setSuccess("");
  };

  const updatePasswordField = (field, value) => {
    setPasswordForm((current) => ({
      ...current,
      [field]: value,
    }));

    setError("");
  };

  const handleProfileSave = async (event) => {
    event.preventDefault();

    if (saving) return;

    setError("");
    setSuccess("");

    const fullName = form.fullName.trim();
    const department = form.department.trim();
    const location = form.location.trim();

    if (fullName.length < 2) {
      setError(
        "Full name must contain at least 2 characters."
      );
      return;
    }

    if (fullName.length > 190) {
      setError(
        "Full name must not exceed 190 characters."
      );
      return;
    }

    if (department.length > 150) {
      setError(
        "Department must not exceed 150 characters."
      );
      return;
    }

    if (location.length > 150) {
      setError(
        "Location must not exceed 150 characters."
      );
      return;
    }

    setSaving(true);

    try {
      await updateProfileRequest({
        fullName,
        department: department || null,
        location: location || null,
      });

      await refreshUser();

      setSuccess(
        "Your profile has been updated successfully."
      );
    } catch (requestError) {
      setError(
        getErrorMessage(
          requestError,
          "Unable to update your profile."
        )
      );
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (event) => {
    event.preventDefault();

    if (changingPassword) return;

    setError("");
    setSuccess("");

    const {
      currentPassword,
      newPassword,
      confirmPassword,
    } = passwordForm;

    if (!currentPassword) {
      setError("Enter your current password.");
      return;
    }

    if (newPassword.length < 12) {
      setError(
        "New password must contain at least 12 characters."
      );
      return;
    }

    if (newPassword.length > 72) {
      setError(
        "New password must not exceed 72 characters."
      );
      return;
    }

    if (!/[a-z]/.test(newPassword)) {
      setError(
        "Include at least one lowercase letter."
      );
      return;
    }

    if (!/[A-Z]/.test(newPassword)) {
      setError(
        "Include at least one uppercase letter."
      );
      return;
    }

    if (!/[0-9]/.test(newPassword)) {
      setError("Include at least one number.");
      return;
    }

    if (!/[^A-Za-z0-9]/.test(newPassword)) {
      setError(
        "Include at least one special character."
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setError(
        "New password and confirmation do not match."
      );
      return;
    }

    if (newPassword === currentPassword) {
      setError(
        "New password must be different from your current password."
      );
      return;
    }

    setChangingPassword(true);

    try {
      await changePasswordRequest({
        currentPassword,
        newPassword,
        confirmPassword,
      });

      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      clearSession();

      navigate("/login", {
        replace: true,
        state: {
          passwordChanged: true,
        },
      });
    } catch (requestError) {
      setError(
        getErrorMessage(
          requestError,
          "Unable to change your password."
        )
      );
    } finally {
      setChangingPassword(false);
    }
  };

  const loadSessions = useCallback(async () => {
    setLoadingSessions(true);
    setError("");

    try {
      const response = await getSessionsRequest();

      const receivedSessions = response?.data?.sessions;

      if (!Array.isArray(receivedSessions)) {
        throw new Error(
          "The server returned an invalid sessions response."
        );
      }

      setSessions(receivedSessions);
      setSessionsLoaded(true);
    } catch (requestError) {
      setError(
        getErrorMessage(
          requestError,
          "Unable to load active sessions."
        )
      );
    } finally {
      setLoadingSessions(false);
    }
  }, []);

  useEffect(() => {
    if (tab === "sessions" && !sessionsLoaded) {
      loadSessions();
    }
  }, [tab, sessionsLoaded, loadSessions]);

  const handleSessionAction = async () => {
    if (!pendingAction || sessionActionLoading) return;

    setSessionActionLoading(true);
    setError("");
    setSuccess("");

    try {
      let result;

      if (pendingAction.type === "single") {
        result = await revokeSessionRequest(
          pendingAction.sessionId
        );
      } else if (pendingAction.type === "others") {
        result = await revokeOtherSessionsRequest();
      } else if (pendingAction.type === "all") {
        result = await revokeAllSessionsRequest();
      } else {
        throw new Error("Unknown session action.");
      }

      const requiresLogin =
        Boolean(result?.data?.requiresLogin) ||
        pendingAction.type === "all" ||
        (
          pendingAction.type === "single" &&
          pendingAction.isCurrent
        );

      setPendingAction(null);

      if (requiresLogin) {
        clearSession();

        navigate("/login", {
          replace: true,
          state: {
            sessionRevoked: true,
          },
        });

        return;
      }

      await loadSessions();

      setSuccess(
        pendingAction.type === "others"
          ? "Other devices have been signed out successfully."
          : "The selected session has been revoked."
      );
    } catch (requestError) {
      setError(
        getErrorMessage(
          requestError,
          "Unable to revoke the selected session."
        )
      );
    } finally {
      setSessionActionLoading(false);
    }
  };

  const readonlyFields = [
    ["Email", user?.email],
    ["User Code", user?.userCode],
    [
      "Role",
      user?.role === "SUPER_ADMIN"
        ? "Super Admin"
        : user?.role === "OWNER"
          ? "Owner"
          : user?.role,
    ],
    ["Account Status", user?.status],
    ...(user?.branchName
      ? [["Branch", user.branchName]]
      : []),
  ];

  const otherSessions = sessions.filter(
    (session) => !session.isCurrent
  );

  const confirmationTitle =
    pendingAction?.type === "all"
      ? "Logout All Devices?"
      : pendingAction?.type === "others"
        ? "Logout Other Devices?"
        : pendingAction?.isCurrent
          ? "Logout Current Device?"
          : "Revoke This Session?";

  const confirmationDescription =
    pendingAction?.type === "all"
      ? "Every active session, including this device, will be revoked. You will need to sign in again."
      : pendingAction?.type === "others"
        ? "All other signed-in devices will lose access. Your current session will remain active."
        : pendingAction?.isCurrent
          ? "This device will be signed out immediately."
          : "The selected device will lose access to your CRM account.";

  return (
    <main className="tlp-page mx-auto flex w-full max-w-5xl flex-col gap-6 p-4 md:p-6">
      <header>
        <Link
          to="/profile"
          className="tlp-link mb-4 inline-flex items-center gap-2 text-sm font-semibold"
        >
          <ArrowLeft size={16} />
          Back to My Profile
        </Link>

        <p className="tlp-eyebrow text-xs">
          My Workspace
        </p>

        <h1 className="tlp-page-title mt-2 text-2xl font-extrabold md:text-3xl">
          Account Settings
        </h1>

        <p className="tlp-page-description mt-2 text-sm">
          Manage your personal information, account
          security, and signed-in devices.
        </p>
      </header>

      <section className="tlp-glass-card p-5 md:p-8">
        <div className="mb-7 flex flex-wrap gap-3 border-b border-[var(--border-color,var(--border))] pb-5">
          <button
            type="button"
            onClick={() => switchTab("profile")}
            aria-pressed={tab === "profile"}
            className={`tlp-tab inline-flex items-center gap-2 px-4 py-3 text-sm font-bold ${
              tab === "profile" ? "tlp-tab-active" : ""
            }`}
          >
            <UserRound size={18} />
            Edit Profile
          </button>

          <button
            type="button"
            onClick={() => switchTab("security")}
            aria-pressed={tab === "security"}
            className={`tlp-tab inline-flex items-center gap-2 px-4 py-3 text-sm font-bold ${
              tab === "security" ? "tlp-tab-active" : ""
            }`}
          >
            <ShieldCheck size={18} />
            Security
          </button>

          <button
            type="button"
            onClick={() => switchTab("sessions")}
            aria-pressed={tab === "sessions"}
            className={`tlp-tab inline-flex items-center gap-2 px-4 py-3 text-sm font-bold ${
              tab === "sessions" ? "tlp-tab-active" : ""
            }`}
          >
            <Monitor size={18} />
            Active Sessions
          </button>
        </div>

        {error && (
          <div
            role="alert"
            className="tlp-alert tlp-alert-error mb-6 flex items-start gap-3 p-4 text-sm"
          >
            <AlertCircle
              size={18}
              className="shrink-0"
            />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div
            role="status"
            className="tlp-alert tlp-alert-success mb-6 flex items-start gap-3 p-4 text-sm"
          >
            <CheckCircle2
              size={18}
              className="shrink-0"
            />
            <span>{success}</span>
          </div>
        )}

        {tab === "profile" && (
          <form
            onSubmit={handleProfileSave}
            className="max-w-2xl space-y-5"
          >
            <div>
              <h2 className="tlp-card-heading text-lg font-extrabold">
                Personal Information
              </h2>

              <p className="tlp-muted mt-2 text-sm">
                Your name, department and location can
                be updated.
              </p>
            </div>

            {profileFields.map((field) => (
              <div
                key={field.key}
                className="tlp-field"
              >
                <label
                  htmlFor={`profile-${field.key}`}
                  className="tlp-label mb-2 block text-sm font-semibold"
                >
                  {field.label}
                </label>

                <input
                  id={`profile-${field.key}`}
                  type="text"
                  required={field.required}
                  maxLength={field.maxLength}
                  value={form[field.key]}
                  disabled={saving}
                  onChange={(event) =>
                    updateField(
                      field.key,
                      event.target.value
                    )
                  }
                  className="tlp-input px-4 py-3 text-sm"
                />
              </div>
            ))}

            <div className="grid gap-4 sm:grid-cols-2">
              {readonlyFields.map(([label, value]) => (
                <div key={label}>
                  <p className="tlp-label mb-2 text-sm font-semibold">
                    {label}
                  </p>

                  <div className="tlp-readonly-value min-h-12 break-words px-4 py-3 text-sm">
                    {value || "Not available"}
                  </div>
                </div>
              ))}
            </div>

            <p className="tlp-field-help text-xs">
              Email, user code, role, branch and account
              status are read-only. Their values are
              managed administratively.
            </p>

            <button
              type="submit"
              disabled={saving}
              className="tlp-btn tlp-btn-primary px-5 py-3 text-sm"
            >
              {saving ? (
                <LoaderCircle
                  size={18}
                  className="animate-spin"
                />
              ) : (
                <Save size={18} />
              )}

              {saving ? "Saving..." : "Save Changes"}
            </button>
          </form>
        )}

        {tab === "security" && (
          <form
            onSubmit={handlePasswordChange}
            className="max-w-2xl space-y-5"
          >
            <div>
              <h2 className="tlp-card-heading flex items-center gap-2 text-lg font-extrabold">
                <LockKeyhole size={20} />
                Change Password
              </h2>

              <p className="tlp-muted mt-2 text-sm leading-6">
                After changing your password, all existing
                sessions will be revoked and you'll need
                to sign in again.
              </p>
            </div>

            {passwordFields.map((field) => (
              <div
                key={field.key}
                className="tlp-field"
              >
                <label
                  htmlFor={`settings-${field.key}`}
                  className="tlp-label mb-2 block text-sm font-semibold"
                >
                  {field.label}
                </label>

                <input
                  id={`settings-${field.key}`}
                  type={
                    showPasswords
                      ? "text"
                      : "password"
                  }
                  required
                  autoComplete={field.autoComplete}
                  value={passwordForm[field.key]}
                  disabled={changingPassword}
                  onChange={(event) =>
                    updatePasswordField(
                      field.key,
                      event.target.value
                    )
                  }
                  className="tlp-input px-4 py-3 text-sm"
                />
              </div>
            ))}

            <button
              type="button"
              onClick={() =>
                setShowPasswords((current) => !current)
              }
              className="tlp-link inline-flex items-center gap-2 text-sm font-semibold"
              aria-pressed={showPasswords}
            >
              {showPasswords ? (
                <EyeOff size={17} />
              ) : (
                <Eye size={17} />
              )}

              {showPasswords
                ? "Hide Passwords"
                : "Show Passwords"}
            </button>

            <div className="tlp-security-note p-4 text-xs leading-6">
              Your new password must contain 12–72
              characters, including uppercase and
              lowercase letters, a number, and a
              special character.
            </div>

            <button
              type="submit"
              disabled={changingPassword}
              className="tlp-btn tlp-btn-primary px-5 py-3 text-sm"
            >
              {changingPassword ? (
                <LoaderCircle
                  size={18}
                  className="animate-spin"
                />
              ) : (
                <LockKeyhole size={18} />
              )}

              {changingPassword
                ? "Updating Password..."
                : "Change Password"}
            </button>
          </form>
        )}

        {tab === "sessions" && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="tlp-card-heading flex items-center gap-2 text-lg font-extrabold">
                  <ShieldCheck size={20} />
                  Active Sessions
                </h2>

                <p className="tlp-muted mt-2 text-sm leading-6">
                  Review where you're signed in and
                  revoke devices you no longer use.
                </p>
              </div>

              <button
                type="button"
                onClick={loadSessions}
                disabled={
                  loadingSessions ||
                  sessionActionLoading
                }
                className="tlp-btn tlp-btn-secondary px-4 py-3 text-sm"
              >
                <RefreshCw
                  size={16}
                  className={
                    loadingSessions
                      ? "animate-spin"
                      : ""
                  }
                />
                Refresh
              </button>
            </div>

            {loadingSessions && !sessionsLoaded ? (
              <div className="tlp-security-note flex items-center justify-center gap-3 p-10 text-sm">
                <LoaderCircle
                  size={20}
                  className="animate-spin"
                />
                Loading your sessions...
              </div>
            ) : sessions.length === 0 ? (
              <div className="tlp-security-note p-8 text-center">
                <Monitor
                  size={32}
                  className="mx-auto mb-3"
                />

                <p className="tlp-card-heading font-bold">
                  No active sessions found
                </p>

                <p className="tlp-muted mt-2 text-sm">
                  Refresh the list or sign in again
                  if your session has expired.
                </p>
              </div>
            ) : (
              <>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="tlp-muted text-sm">
                    {sessions.length} active{" "}
                    {sessions.length === 1
                      ? "session"
                      : "sessions"}
                  </p>

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      disabled={
                        otherSessions.length === 0 ||
                        sessionActionLoading
                      }
                      onClick={() =>
                        setPendingAction({
                          type: "others",
                        })
                      }
                      className="tlp-btn tlp-btn-secondary px-4 py-3 text-sm"
                    >
                      <LogOut size={16} />
                      Logout Other Devices
                    </button>

                    <button
                      type="button"
                      disabled={sessionActionLoading}
                      onClick={() =>
                        setPendingAction({
                          type: "all",
                        })
                      }
                      className="tlp-btn tlp-btn-secondary px-4 py-3 text-sm"
                    >
                      <Trash2 size={16} />
                      Logout All Devices
                    </button>
                  </div>
                </div>

                <div className="grid gap-4">
                  {sessions.map((session) => {
                    const {
                      browser,
                      device,
                      Icon,
                    } = getDeviceDetails(
                      session.userAgent
                    );

                    return (
                      <article
                        key={session.id}
                        className="tlp-info-item p-4 md:p-5"
                      >
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                          <div className="tlp-info-icon flex h-12 w-12 shrink-0 items-center justify-center">
                            <Icon size={23} />
                          </div>

                          <div className="min-w-0 flex-1 space-y-3">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="tlp-card-heading font-bold">
                                {device} · {browser}
                              </h3>

                              {session.isCurrent && (
                                <span className="tlp-profile-badge tlp-profile-badge-success px-3 py-1 text-xs font-bold">
                                  Current Device
                                </span>
                              )}
                            </div>

                            <div className="grid gap-3 text-sm sm:grid-cols-2">
                              <div className="flex items-start gap-2">
                                <Globe2
                                  size={16}
                                  className="mt-0.5 shrink-0"
                                />

                                <div className="min-w-0">
                                  <p className="tlp-info-label text-xs">
                                    IP Address
                                  </p>
                                  <p className="tlp-info-value break-all">
                                    {session.ipAddress ||
                                      "Not available"}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-start gap-2">
                                <Clock3
                                  size={16}
                                  className="mt-0.5 shrink-0"
                                />

                                <div>
                                  <p className="tlp-info-label text-xs">
                                    Last Activity
                                  </p>
                                  <p className="tlp-info-value">
                                    {formatDateTime(
                                      session.lastActivityAt
                                    )}
                                  </p>
                                </div>
                              </div>

                              <div>
                                <p className="tlp-info-label text-xs">
                                  Signed In
                                </p>
                                <p className="tlp-info-value">
                                  {formatDateTime(
                                    session.createdAt
                                  )}
                                </p>
                              </div>

                              <div>
                                <p className="tlp-info-label text-xs">
                                  Session Expires
                                </p>
                                <p className="tlp-info-value">
                                  {formatDateTime(
                                    session.expiresAt
                                  )}
                                </p>
                              </div>
                            </div>

                            <div className="pt-1">
                              <button
                                type="button"
                                disabled={
                                  sessionActionLoading
                                }
                                onClick={() =>
                                  setPendingAction({
                                    type: "single",
                                    sessionId: session.id,
                                    isCurrent:
                                      session.isCurrent,
                                  })
                                }
                                className="tlp-btn tlp-btn-secondary px-4 py-2.5 text-xs"
                              >
                                <LogOut size={15} />
                                {session.isCurrent
                                  ? "Logout This Device"
                                  : "Revoke Session"}
                              </button>
                            </div>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </>
            )}

            <div className="tlp-security-note flex items-start gap-3 p-4 text-xs leading-6">
              <ShieldCheck
                size={20}
                className="mt-0.5 shrink-0"
              />
              <p>
                Revoked devices lose access to
                authenticated CRM requests. Browser
                and device names are estimated from
                the user-agent information provided
                during login.
              </p>
            </div>
          </div>
        )}
      </section>

      {pendingAction && (
        <div
          className="fixed inset-0 z-[1000] flex items-center justify-center p-4"
          role="presentation"
        >
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            aria-hidden="true"
          />

          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="session-dialog-title"
            aria-describedby="session-dialog-description"
            className="tlp-glass-card relative z-10 w-full max-w-md p-6"
          >
            <div className="mb-4 flex items-start justify-between gap-3">
              <div className="tlp-heading-icon flex h-12 w-12 items-center justify-center">
                <ShieldCheck size={22} />
              </div>

              <button
                type="button"
                disabled={sessionActionLoading}
                onClick={() => setPendingAction(null)}
                aria-label="Close confirmation"
                className="tlp-btn tlp-btn-secondary p-2"
              >
                <X size={18} />
              </button>
            </div>

            <h2
              id="session-dialog-title"
              className="tlp-card-heading text-xl font-extrabold"
            >
              {confirmationTitle}
            </h2>

            <p
              id="session-dialog-description"
              className="tlp-muted mt-3 text-sm leading-6"
            >
              {confirmationDescription}
            </p>

            <div className="mt-6 flex flex-wrap justify-end gap-3">
              <button
                type="button"
                disabled={sessionActionLoading}
                onClick={() => setPendingAction(null)}
                className="tlp-btn tlp-btn-secondary px-5 py-3 text-sm"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={sessionActionLoading}
                onClick={handleSessionAction}
                className="tlp-btn tlp-btn-primary px-5 py-3 text-sm"
              >
                {sessionActionLoading ? (
                  <LoaderCircle
                    size={17}
                    className="animate-spin"
                  />
                ) : (
                  <LogOut size={17} />
                )}

                {sessionActionLoading
                  ? "Processing..."
                  : "Confirm Logout"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default ProfileSettingsPage;