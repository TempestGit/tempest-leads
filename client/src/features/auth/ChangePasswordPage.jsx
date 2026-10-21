
import { useState } from "react";

import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  LoaderCircle,
  LockKeyhole,
  ShieldCheck,
} from "lucide-react";

import {
  Navigate,
  useNavigate,
} from "react-router-dom";

import apiClient from "../../lib/apiClient";
import useAuth from "./useAuth";

import branding from "../../assets/tempest-branding.png";
import "./login-glass.css";

const ChangePasswordPage = () => {
  const navigate = useNavigate();

  const {
    authenticated,
    initializing,
    mustChangePassword,
    clearSession,
  } = useAuth();

  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showPasswords, setShowPasswords] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const updateField = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));

    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (submitting) return;

    setError("");

    if (!form.currentPassword) {
      setError("Enter your temporary password.");
      return;
    }

    if (form.newPassword.length < 12) {
      setError("New password must contain at least 12 characters.");
      return;
    }

    if (!/[a-z]/.test(form.newPassword)) {
      setError("Include at least one lowercase letter.");
      return;
    }

    if (!/[A-Z]/.test(form.newPassword)) {
      setError("Include at least one uppercase letter.");
      return;
    }

    if (!/[0-9]/.test(form.newPassword)) {
      setError("Include at least one number.");
      return;
    }

    if (!/[^A-Za-z0-9]/.test(form.newPassword)) {
      setError("Include at least one special character.");
      return;
    }

    if (form.newPassword.length > 72) {
      setError("New password must not exceed 72 characters.");
      return;
    }

    if (form.newPassword !== form.confirmPassword) {
      setError("New password and confirm password do not match.");
      return;
    }

    if (form.currentPassword === form.newPassword) {
      setError("New password must be different from your temporary password.");
      return;
    }

    setSubmitting(true);

    try {
      await apiClient.post("/auth/change-password", form);

      clearSession();

      navigate("/login", {
        replace: true,
        state: {
          passwordChanged: true,
        },
      });
    } catch (requestError) {
      setError(
        requestError?.response?.data?.message ||
        "Unable to change your password. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (initializing) {
    return (
      <main className="tgl-page flex min-h-screen items-center justify-center">
        <LoaderCircle size={32} className="animate-spin" />
      </main>
    );
  }

  if (!authenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!mustChangePassword) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <main className="tgl-page relative flex min-h-screen items-center justify-center overflow-hidden p-4 sm:p-6">
      <div className="tgl-orb tgl-orb-one" />
      <div className="tgl-orb tgl-orb-two" />
      <div className="tgl-orb tgl-orb-three" />

      <section className="tgl-shell relative z-10 w-full max-w-xl overflow-hidden rounded-3xl">
        <div className="tgl-login-panel px-6 py-9 sm:px-10 sm:py-11">
          <div className="mb-8 flex items-center justify-between gap-4">
            <img
              src={branding}
              alt="Tempest Leads"
              className="max-h-14 max-w-48 object-contain object-left"
            />

            <span className="tgl-secure-badge inline-flex items-center gap-2 rounded-full px-3 py-2 text-[11px] font-bold">
              <ShieldCheck size={14} />
              SECURE ACCOUNT
            </span>
          </div>

          <div className="tgl-eyebrow mb-4 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold">
            <KeyRound size={14} />
            FIRST LOGIN SECURITY
          </div>

          <h1 className="tgl-title text-3xl font-extrabold tracking-tight">
            Change your password
            <span className="tgl-title-dot">.</span>
          </h1>

          <p className="tgl-muted mt-3 text-sm leading-6">
            You're signed in using a temporary password.
            Create your own secure password before accessing
            your Tempest Leads workspace.
          </p>

          <div className="tgl-security-note my-7 flex items-start gap-3 rounded-xl p-4">
            <LockKeyhole size={21} className="mt-0.5 shrink-0" />
            <p className="text-xs leading-5">
              Use at least 12 characters, including uppercase
              and lowercase letters, a number, and a special character.
            </p>
          </div>

          {error && (
            <div
              role="alert"
              className="tgl-error mb-6 flex items-start gap-3 rounded-xl p-4 text-sm"
            >
              <AlertCircle size={19} className="mt-0.5 shrink-0" />
              <span className="min-w-0 break-words">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {[
              {
                key: "currentPassword",
                label: "Temporary Password",
                placeholder: "Enter your temporary password",
                autocomplete: "current-password",
              },
              {
                key: "newPassword",
                label: "New Password",
                placeholder: "Create a secure password",
                autocomplete: "new-password",
              },
              {
                key: "confirmPassword",
                label: "Confirm New Password",
                placeholder: "Re-enter your new password",
                autocomplete: "new-password",
              },
            ].map((field) => (
              <div key={field.key}>
                <label
                  htmlFor={field.key}
                  className="tgl-label mb-2 block text-xs font-bold"
                >
                  {field.label}
                </label>

                <div className="tgl-field relative">
                  <LockKeyhole
                    size={19}
                    className="tgl-field-icon"
                  />

                  <input
                    id={field.key}
                    type={showPasswords ? "text" : "password"}
                    className="tgl-input tgl-password-input w-full rounded-xl text-sm"
                    value={form[field.key]}
                    onChange={(event) =>
                      updateField(field.key, event.target.value)
                    }
                    autoComplete={field.autocomplete}
                    placeholder={field.placeholder}
                    disabled={submitting}
                    required
                  />
                </div>
              </div>
            ))}

            <button
              type="button"
              className="tgl-password-toggle relative ml-auto flex items-center gap-2"
              aria-pressed={showPasswords}
              onClick={() => setShowPasswords((value) => !value)}
              disabled={submitting}
            >
              {showPasswords ? <EyeOff size={17} /> : <Eye size={17} />}
              <span className="text-xs">
                {showPasswords ? "Hide passwords" : "Show passwords"}
              </span>
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="tgl-submit flex w-full items-center justify-center gap-3 rounded-xl px-5 py-4 text-sm font-extrabold"
            >
              {submitting ? (
                <>
                  <LoaderCircle size={19} className="animate-spin" />
                  Updating password...
                </>
              ) : (
                <>
                  Update Password
                  <ArrowRight size={19} />
                </>
              )}
            </button>
          </form>

          <div className="tgl-login-footer mt-7 flex items-center justify-center gap-2 text-xs">
            <CheckCircle2 size={15} />
            You'll sign in again after changing your password.
          </div>
        </div>
      </section>
    </main>
  );
};

export default ChangePasswordPage;
