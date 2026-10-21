
import { useState } from "react";

import {
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  Fingerprint,
  LayoutDashboard,
  LoaderCircle,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Users,
  AlertCircle,
} from "lucide-react";

import branding from "../../assets/tempest-branding.png";

import {
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";

import useAuth from "./useAuth";

import "./login-glass.css";

/*
|--------------------------------------------------------------------------
| Login Page
|--------------------------------------------------------------------------
*/

const LoginPage = () => {
  const {
    authenticated,
    initializing,
    login,
  } = useAuth();

  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  /*
  |--------------------------------------------------------------------------
  | Authentication Loading
  |--------------------------------------------------------------------------
  */

  if (initializing) {
    return (
      <main className="tgl-page flex min-h-screen items-center justify-center">
        <div className="tgl-loading flex flex-col items-center gap-4">
          <span className="tgl-loading-icon flex h-16 w-16 items-center justify-center rounded-2xl">
            <LoaderCircle size={29} className="animate-spin" />
          </span>

          <p className="text-sm font-bold">
            Loading TEMPEST LEADS...
          </p>
        </div>
      </main>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Already Authenticated
  |--------------------------------------------------------------------------
  */

  if (authenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  /*
  |--------------------------------------------------------------------------
  | Login
  |--------------------------------------------------------------------------
  */

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (submitting) return;

    setError("");

    const cleanEmail = email.trim();

    if (!cleanEmail) {
      setError("Email address is required.");
      return;
    }

    if (!password) {
      setError("Password is required.");
      return;
    }

    if (password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    setSubmitting(true);

    try {
      await login({
        email: cleanEmail,
        password,
      });

      const destination =
        location.state?.from?.pathname || "/dashboard";

      navigate(destination, {
        replace: true,
      });
    } catch (requestError) {
      setError(
        requestError?.response?.data?.message ||
          "Unable to sign in. Please check your credentials and try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Render
  |--------------------------------------------------------------------------
  */

  return (
    <main className="tgl-page relative flex min-h-screen items-center justify-center overflow-hidden p-4 sm:p-6 lg:p-10">
      {/* Background Effects */}

      <div className="tgl-orb tgl-orb-one" />
      <div className="tgl-orb tgl-orb-two" />
      <div className="tgl-orb tgl-orb-three" />

      <div className="tgl-shell relative z-10 grid w-full max-w-6xl overflow-hidden rounded-3xl lg:grid-cols-[1fr_1.05fr]">
        {/* ======================================================= */}
        {/* LOGIN PANEL */}
        {/* ======================================================= */}

        <section className="tgl-login-panel flex flex-col px-6 py-8 sm:px-10 sm:py-10 lg:px-12 lg:py-12">
          {/* Brand */}

          <div className="mb-12 flex items-center justify-between gap-4">
            <div className="tgl-brand flex items-center">
              <img
                src={branding}
                alt="Tempest Leads"
                className="max-h-14 max-w-52 object-contain object-left"
              />
            </div>

            <span className="tgl-secure-badge inline-flex items-center gap-2 rounded-full px-3 py-2 text-[11px] font-bold">
              <ShieldCheck size={14} />
              SECURE ACCESS
            </span>
          </div>

          {/* Heading */}

          <div className="mb-8">
            <div className="tgl-eyebrow mb-4 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold">
              <Sparkles size={14} />
              YOUR WORKSPACE AWAITS
            </div>

            <h1 className="tgl-title text-3xl font-extrabold tracking-tight sm:text-4xl">
              Welcome back
              <span className="tgl-title-dot">.</span>
            </h1>

            <p className="tgl-muted mt-3 text-sm leading-6">
              Sign in to your Tempest Leads workspace and
              keep every opportunity moving forward.
            </p>
          </div>

          {/* Error */}

          {error && (
            <div
              role="alert"
              className="tgl-error mb-6 flex items-start gap-3 rounded-xl p-4 text-sm"
            >
              <AlertCircle
                size={19}
                className="mt-0.5 shrink-0"
              />

              <span className="min-w-0 break-words">
                {error}
              </span>
            </div>
          )}

          {/* Form */}

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            {/* Email */}

            <div>
              <label
                htmlFor="tgl-email"
                className="tgl-label mb-2 block text-xs font-bold"
              >
                Email Address
              </label>

              <div className="tgl-field relative">
                <Mail
                  size={19}
                  className="tgl-field-icon"
                />

                <input
                  id="tgl-email"
                  type="email"
                  className="tgl-input w-full rounded-xl text-sm"
                  value={email}
                  required
                  autoComplete="email"
                  autoCapitalize="none"
                  spellCheck={false}
                  disabled={submitting}
                  placeholder="name@tempestadvertising.com"
                  onChange={(event) => {
                    setEmail(event.target.value);
                    if (error) setError("");
                  }}
                />
              </div>
            </div>

            {/* Password */}

            <div>
              <label
                htmlFor="tgl-password"
                className="tgl-label mb-2 block text-xs font-bold"
              >
                Password
              </label>

              <div className="tgl-field relative">
                <LockKeyhole
                  size={19}
                  className="tgl-field-icon"
                />

                <input
                  id="tgl-password"
                  type={showPassword ? "text" : "password"}
                  className="tgl-input tgl-password-input w-full rounded-xl text-sm"
                  value={password}
                  required
                  minLength={8}
                  autoComplete="current-password"
                  disabled={submitting}
                  placeholder="Enter your password"
                  onChange={(event) => {
                    setPassword(event.target.value);
                    if (error) setError("");
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
                  aria-pressed={showPassword}
                  disabled={submitting}
                  onClick={() =>
                    setShowPassword((current) => !current)
                  }
                >
                  {showPassword ? (
                    <EyeOff size={19} />
                  ) : (
                    <Eye size={19} />
                  )}
                </button>
              </div>
            </div>

            {/* Submit */}

            <button
              type="submit"
              disabled={submitting}
              className="tgl-submit mt-2 flex w-full items-center justify-center gap-3 rounded-xl px-5 py-4 text-sm font-extrabold"
            >
              {submitting ? (
                <>
                  <LoaderCircle
                    size={19}
                    className="animate-spin"
                  />
                  Signing in...
                </>
              ) : (
                <>
                  Sign In to Workspace
                </>
              )}
            </button>
          </form>

          {/* Footer */}

          <div className="tgl-login-footer mt-auto pt-10 text-center text-xs">
            © {new Date().getFullYear()} Tempest Leads.
            All rights reserved.
          </div>
        </section>

        {/* ======================================================= */}
        {/* BRAND / SHOWCASE PANEL */}
        {/* ======================================================= */}

        <aside className="tgl-showcase relative hidden flex-col justify-between overflow-hidden p-10 lg:flex xl:p-12">
          <div className="tgl-showcase-glow tgl-showcase-glow-one" />
          <div className="tgl-showcase-glow tgl-showcase-glow-two" />

          {/* Top Badge */}

          <div className="relative z-10">
            <span className="tgl-showcase-badge inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold">
              <Sparkles size={15} />
              TEMPEST LEADS CRM
            </span>
          </div>

          {/* Headline */}

          <div className="relative z-10 mt-12">
            <h2 className="tgl-showcase-title max-w-lg text-4xl font-extrabold leading-tight tracking-tight xl:text-5xl">
              Every lead.
              <br />
              Every conversation.
              <br />
              <span>One clear next move.</span>
            </h2>

            <p className="tgl-showcase-description mt-6 max-w-md text-sm leading-7">
              A disciplined workspace for acquisition,
              relationship management, onboarding and
              long-term nurture.
            </p>
          </div>

          {/* Bento Showcase */}

          <div className="relative z-10 mt-12 grid grid-cols-2 gap-4">
            <div className="tgl-bento-card rounded-2xl p-5">
              <span className="tgl-bento-icon flex h-11 w-11 items-center justify-center rounded-xl">
                <LayoutDashboard size={21} />
              </span>

              <p className="mt-5 text-sm font-extrabold">
                Pipeline Visibility
              </p>

              <p className="tgl-bento-description mt-2 text-xs leading-5">
                Track opportunities across every stage.
              </p>
            </div>

            <div className="tgl-bento-card rounded-2xl p-5">
              <span className="tgl-bento-icon flex h-11 w-11 items-center justify-center rounded-xl">
                <Users size={21} />
              </span>

              <p className="mt-5 text-sm font-extrabold">
                Client Relationships
              </p>

              <p className="tgl-bento-description mt-2 text-xs leading-5">
                Keep conversations and context connected.
              </p>
            </div>

            <div className="tgl-bento-card tgl-bento-wide col-span-2 flex items-center justify-between gap-4 rounded-2xl p-5">
              <div>
                <p className="text-sm font-extrabold">
                  Move with Confidence
                </p>

                <p className="tgl-bento-description mt-2 text-xs leading-5">
                  From first contact to the next milestone.
                </p>
              </div>

              <span className="tgl-bento-highlight flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl">
                <TrendingUp size={27} />
              </span>
            </div>
          </div>

          {/* Bottom */}

          <div className="tgl-showcase-footer relative z-10 mt-10 flex items-center gap-2 text-xs">
            <CheckCircle2 size={16} />
            Built for focused, accountable teamwork
          </div>
        </aside>
      </div>
    </main>
  );
};

export default LoginPage;