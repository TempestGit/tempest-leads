
import { useState } from "react";

import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  LoaderCircle,
  LockKeyhole,
  ShieldCheck,
} from "lucide-react";

import {
  Link,
  useSearchParams,
} from "react-router-dom";

import branding from "../../assets/tempest-branding.png";

import { resetPasswordRequest } from "./auth.api.js";

import "./login-glass.css";

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [completed, setCompleted] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (submitting) return;

    setError("");

    if (!/^[a-f0-9]{64}$/i.test(token)) {
      setError("The password reset link is invalid.");
      return;
    }

    if (newPassword.length < 12) {
      setError("Password must contain at least 12 characters.");
      return;
    }

    if (newPassword.length > 72) {
      setError("Password must not exceed 72 characters.");
      return;
    }

    if (!/[a-z]/.test(newPassword)) {
      setError("Password must include a lowercase letter.");
      return;
    }

    if (!/[A-Z]/.test(newPassword)) {
      setError("Password must include an uppercase letter.");
      return;
    }

    if (!/[0-9]/.test(newPassword)) {
      setError("Password must include a number.");
      return;
    }

    if (!/[^A-Za-z0-9]/.test(newPassword)) {
      setError("Password must include a special character.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setSubmitting(true);

    try {
      await resetPasswordRequest({
        token,
        newPassword,
        confirmPassword,
      });

      setNewPassword("");
      setConfirmPassword("");
      setCompleted(true);

      // Remove the reset token from the address bar.
      window.history.replaceState(
        window.history.state,
        "",
        "/reset-password"
      );
    } catch (requestError) {
      setError(
        requestError?.response?.data?.message ||
          "Unable to reset your password. Please request a new link."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const validToken = /^[a-f0-9]{64}$/i.test(token);

  return (
    <main className="tgl-page relative flex min-h-screen items-center justify-center overflow-hidden p-4 sm:p-6">
      <div className="tgl-orb tgl-orb-one" />
      <div className="tgl-orb tgl-orb-two" />
      <div className="tgl-orb tgl-orb-three" />

      <section className="tgl-shell relative z-10 w-full max-w-lg overflow-hidden rounded-3xl">
        <div className="tgl-login-panel px-6 py-9 sm:px-10 sm:py-12">
          <div className="mb-10 flex items-center justify-between gap-4">
            <img
              src={branding}
              alt="Tempest Leads"
              className="max-h-14 max-w-48 object-contain object-left"
            />

            <span className="tgl-secure-badge inline-flex items-center gap-2 rounded-full px-3 py-2 text-[11px] font-bold">
              <ShieldCheck size={14} />
              SECURE ACCESS
            </span>
          </div>

          <div className="mb-8">
            <span className="tgl-eyebrow mb-4 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold">
              <KeyRound size={14} />
              ACCOUNT RECOVERY
            </span>

            <h1 className="tgl-title text-3xl font-extrabold">
              Reset password<span className="tgl-title-dot">.</span>
            </h1>

            <p className="tgl-muted mt-3 text-sm leading-6">
              Choose a strong new password to secure
              your Tempest Leads account.
            </p>
          </div>

          {error && (
            <div
              role="alert"
              className="tgl-error mb-6 flex items-start gap-3 rounded-xl p-4 text-sm"
            >
              <AlertCircle size={18} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {completed ? (
            <div className="space-y-6">
              <div
                role="status"
                className="tgl-field flex items-start gap-3 rounded-xl p-4"
              >
                <CheckCircle2 size={22} className="shrink-0" />

                <p className="tgl-muted text-sm leading-6">
                  Your password has been reset successfully.
                  Please sign in with your new password.
                </p>
              </div>

              <Link
                to="/login"
                className="tgl-submit flex w-full items-center justify-center rounded-xl px-5 py-4 text-sm font-extrabold"
              >
                Sign In
              </Link>
            </div>
          ) : !validToken ? (
            <div className="space-y-6">
              <p className="tgl-muted text-sm leading-6">
                This password reset link is missing or invalid.
                Request a new link to continue.
              </p>

              <Link
                to="/forgot-password"
                className="tgl-submit flex w-full items-center justify-center rounded-xl px-5 py-4 text-sm font-extrabold"
              >
                Request New Link
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="reset-password"
                  className="tgl-label mb-2 block text-xs font-bold"
                >
                  New Password
                </label>

                <div className="tgl-field relative">
                  <LockKeyhole
                    size={19}
                    className="tgl-field-icon"
                  />

                  <input
                    id="reset-password"
                    type={showPassword ? "text" : "password"}
                    className="tgl-input tgl-password-input w-full rounded-xl text-sm"
                    autoComplete="new-password"
                    minLength={12}
                    maxLength={72}
                    required
                    value={newPassword}
                    disabled={submitting}
                    placeholder="Enter a new password"
                    onChange={(event) => {
                      setNewPassword(event.target.value);
                      setError("");
                    }}
                  />

                  <button
                    type="button"
                    className="tgl-password-toggle"
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                    onClick={() => setShowPassword((value) => !value)}
                  >
                    {showPassword ? (
                      <EyeOff size={19} />
                    ) : (
                      <Eye size={19} />
                    )}
                  </button>
                </div>

                <p className="tgl-muted mt-2 text-xs leading-5">
                  At least 12 characters, including uppercase,
                  lowercase, number and special character.
                </p>
              </div>

              <div>
                <label
                  htmlFor="reset-confirm"
                  className="tgl-label mb-2 block text-xs font-bold"
                >
                  Confirm New Password
                </label>

                <div className="tgl-field relative">
                  <LockKeyhole
                    size={19}
                    className="tgl-field-icon"
                  />

                  <input
                    id="reset-confirm"
                    type={showConfirm ? "text" : "password"}
                    className="tgl-input tgl-password-input w-full rounded-xl text-sm"
                    autoComplete="new-password"
                    required
                    value={confirmPassword}
                    disabled={submitting}
                    placeholder="Confirm your new password"
                    onChange={(event) => {
                      setConfirmPassword(event.target.value);
                      setError("");
                    }}
                  />

                  <button
                    type="button"
                    className="tgl-password-toggle"
                    aria-label={
                      showConfirm
                        ? "Hide confirmation"
                        : "Show confirmation"
                    }
                    onClick={() => setShowConfirm((value) => !value)}
                  >
                    {showConfirm ? (
                      <EyeOff size={19} />
                    ) : (
                      <Eye size={19} />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="tgl-submit flex w-full items-center justify-center gap-3 rounded-xl px-5 py-4 text-sm font-extrabold"
              >
                {submitting ? (
                  <>
                    <LoaderCircle
                      size={19}
                      className="animate-spin"
                    />
                    Updating Password...
                  </>
                ) : (
                  <>
                    <ShieldCheck size={19} />
                    Reset Password
                  </>
                )}
              </button>

              <Link
                to="/login"
                className="tgl-muted flex items-center justify-center gap-2 text-sm font-bold"
              >
                <ArrowLeft size={16} />
                Back to Sign In
              </Link>
            </form>
          )}

          <p className="tgl-login-footer mt-12 text-center text-xs">
            © {new Date().getFullYear()} Tempest Leads.
            All rights reserved.
          </p>
        </div>
      </section>
    </main>
  );
};

export default ResetPasswordPage;
