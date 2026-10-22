
import { useState } from "react";

import {
  ArrowLeft,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  LoaderCircle,
  Mail,
  ShieldCheck,
} from "lucide-react";

import { Link } from "react-router-dom";

import branding from "../../assets/tempest-branding.png";

import { forgotPasswordRequest } from "./auth.api.js";

import "./login-glass.css";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (submitting) return;

    setError("");
    setSuccess("");

    const cleanEmail = email.trim().toLowerCase();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setError("Enter a valid email address.");
      return;
    }

    setSubmitting(true);

    try {
      const result = await forgotPasswordRequest(cleanEmail);

      setSuccess(
        result.message ||
          "If an active account exists for this email, a reset link will be sent."
      );
    } catch (requestError) {
      setError(
        requestError?.response?.data?.message ||
          "Unable to process your request. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

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
              <Mail size={14} />
              ACCOUNT RECOVERY
            </span>

            <h1 className="tgl-title text-3xl font-extrabold">
              Forgot password<span className="tgl-title-dot">.</span>
            </h1>

            <p className="tgl-muted mt-3 text-sm leading-6">
              Enter your registered email address. If an active
              account exists, we'll email a secure link to reset
              your password.
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

          {success ? (
            <div className="space-y-6">
              <div
                role="status"
                className="tgl-field flex items-start gap-3 rounded-xl p-4 text-sm"
              >
                <CheckCircle2 size={20} className="shrink-0" />
                <p className="tgl-muted leading-6">{success}</p>
              </div>

              <p className="tgl-muted text-sm leading-6">
                Check your inbox and spam folder. The reset
                link is valid for 15 minutes.
              </p>

              <Link
                to="/login"
                className="tgl-submit flex w-full items-center justify-center gap-2 rounded-xl px-5 py-4 text-sm font-extrabold"
              >
                <ArrowLeft size={18} />
                Back to Sign In
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="forgot-email"
                  className="tgl-label mb-2 block text-xs font-bold"
                >
                  Email Address
                </label>

                <div className="tgl-field relative">
                  <Mail size={19} className="tgl-field-icon" />

                  <input
                    id="forgot-email"
                    type="email"
                    required
                    maxLength={190}
                    autoComplete="email"
                    className="tgl-input w-full rounded-xl text-sm"
                    value={email}
                    disabled={submitting}
                    placeholder="name@tempestadvertising.com"
                    onChange={(event) => {
                      setEmail(event.target.value);
                      setError("");
                    }}
                  />
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
                    Sending...
                  </>
                ) : (
                  <>
                    Send Reset Link
                    <ArrowRight size={19} />
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

export default ForgotPasswordPage;
