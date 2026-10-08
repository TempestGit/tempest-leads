import {
  Eye,
  EyeOff,
  LoaderCircle,
} from "lucide-react";

import branding from "../../assets/tempest-branding.png";

import {
  useState,
} from "react";

import {
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";

import useAuth from "./useAuth";

const LoginPage = () => {
  const {
    authenticated,
    initializing,
    login,
  } = useAuth();

  const navigate =
    useNavigate();

  const location =
    useLocation();

  const [
    email,
    setEmail,
  ] = useState("");

  const [
    password,
    setPassword,
  ] = useState("");

  const [
    showPassword,
    setShowPassword,
  ] = useState(false);

  const [
    submitting,
    setSubmitting,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  if (initializing) {
    return (
      <main className="auth-page">
        <div
          style={{
            placeSelf:
              "center",
          }}
        >
          Loading TEMPEST
          LEADS...
        </div>
      </main>
    );
  }

  if (authenticated) {
    return (
      <Navigate
        to="/dashboard"
        replace
      />
    );
  }

  const handleSubmit =
    async (event) => {
      event.preventDefault();

      setError("");
      setSubmitting(true);

      try {
        await login({
          email,
          password,
        });

        const destination =
          location.state
            ?.from
            ?.pathname ||
          "/dashboard";

        navigate(
          destination,
          {
            replace: true,
          }
        );
      } catch (
        requestError
      ) {
        setError(
          requestError
            ?.response?.data
            ?.message ||
            "Unable to sign in."
        );
      } finally {
        setSubmitting(
          false
        );
      }
    };

  return (
    <main className="auth-page">
      <div className="auth-brand">
        <img
          src={branding}
          alt="Tempest Leads"
        />
      </div>

      <section className="auth-card">
        <div className="eyebrow">
          SECURE WORKSPACE
        </div>

        <h1>
          Welcome back
        </h1>

        <p>
          Sign in to
          TEMPEST LEADS.
        </p>

        {error && (
          <div className="error-box">
            {error}
          </div>
        )}

        <form
          onSubmit={
            handleSubmit
          }
        >
          <label>
            Email

            <input
              type="email"
              value={email}
              onChange={(
                event
              ) =>
                setEmail(
                  event.target
                    .value
                )
              }
              required
              autoComplete="email"
              placeholder="name@tempestadvertising.com"
            />
          </label>

          <label>
            Password

            <div className="password-field">
              <input
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                value={password}
                onChange={(
                  event
                ) =>
                  setPassword(
                    event.target
                      .value
                  )
                }
                required
                minLength={8}
                autoComplete="current-password"
                placeholder="Enter your password"
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword(
                    (value) =>
                      !value
                  )
                }
              >
                {showPassword ? (
                  <EyeOff
                    size={15}
                  />
                ) : (
                  <Eye
                    size={15}
                  />
                )}
              </button>
            </div>
          </label>

          <div className="auth-row">
            <label>
              <input
                type="checkbox"
                defaultChecked
              />

              Remember me
            </label>

            <button
              type="button"
              className="auth-link"
            >
              Forgot password?
            </button>
          </div>

          <button
            type="submit"
            disabled={
              submitting
            }
            className="primary wide"
          >
            {submitting && (
              <LoaderCircle
                size={15}
                className="animate-spin"
              />
            )}

            {submitting
              ? "Signing in..."
              : "Log in"}
          </button>
        </form>
      </section>

      <aside className="auth-art">
        <div>
          <h2>
            Turn every
            opportunity into{" "}
            <b>
              a clear next
              move.
            </b>
          </h2>

          <p>
            A disciplined
            workspace for
            acquisition,
            onboarding and
            long-term
            nurture.
          </p>
        </div>
      </aside>
    </main>
  );
};

export default LoginPage;