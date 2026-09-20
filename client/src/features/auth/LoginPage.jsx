import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQueryClient } from '@tanstack/react-query';
import { Navigate, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, LoaderCircle } from 'lucide-react';

import { login } from './auth.api';
import {
  SESSION_QUERY_KEY,
  useSession,
} from './auth.queries';

const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email('Enter a valid email address.')
    .max(190),

  password: z
    .string()
    .min(1, 'Enter your password.')
    .refine(
      (value) => Array.from(value).length <= 128,
      'Password is too long.',
    ),

  rememberMe: z.boolean(),
});

const inputClass =
  'mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-3 text-slate-900 outline-none focus:border-red-600 focus:ring-2 focus:ring-red-100 disabled:opacity-60';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const session = useSession();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  async function onSubmit(values) {
    setSubmitError('');

    try {
      // Stop an older session request from overwriting login state.
      await queryClient.cancelQueries({
        queryKey: SESSION_QUERY_KEY,
      });

      const result = await login(values);

      // Remove any cached records from an earlier account.
      queryClient.clear();
      queryClient.setQueryData(SESSION_QUERY_KEY, result);

      navigate('/dashboard', { replace: true });
    } catch (error) {
      setSubmitError(error.message || 'Unable to log in.');
    }
  }

  if (session.isPending) {
    return (
      <main className="grid min-h-screen place-items-center bg-slate-950 text-white">
        <p role="status">Checking your session…</p>
      </main>
    );
  }

  if (session.data?.authenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <main className="grid min-h-screen bg-white lg:grid-cols-2">
      <section className="flex flex-col px-6 py-8 sm:px-12">
        <div>
          <p className="text-xl font-extrabold tracking-wide text-slate-900">
            TEMPEST <span className="text-red-600">LEADS</span>
          </p>

          <p className="mt-1 text-xs tracking-widest text-slate-500">
            ACQUISITION CRM
          </p>
        </div>

        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-12">
          <h1 className="text-3xl font-bold text-slate-900">
            Welcome back
          </h1>

          <p className="mt-3 text-slate-600">
            Sign in with your Tempest Leads account.
          </p>

          {session.isError && (
            <div
              role="alert"
              className="mt-6 rounded-lg bg-amber-50 p-4 text-sm text-amber-900"
            >
              {session.error.message}

              <button
                type="button"
                onClick={() => session.refetch()}
                disabled={session.isFetching}
                className="ml-2 font-semibold underline disabled:opacity-50"
              >
                Retry
              </button>
            </div>
          )}

          {submitError && (
            <div
              role="alert"
              className="mt-6 rounded-lg bg-red-50 p-4 text-sm text-red-700"
            >
              {submitError}
            </div>
          )}

          <form
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            className="mt-8 space-y-5"
          >
            <div>
              <label
                htmlFor="email"
                className="text-sm font-semibold text-slate-700"
              >
                Email address
              </label>

              <input
                id="email"
                type="email"
                autoComplete="username"
                disabled={isSubmitting}
                aria-invalid={Boolean(errors.email)}
                aria-describedby={
                  errors.email ? 'email-error' : undefined
                }
                className={inputClass}
                {...register('email')}
              />

              {errors.email && (
                <p
                  id="email-error"
                  className="mt-2 text-sm text-red-600"
                >
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="password"
                className="text-sm font-semibold text-slate-700"
              >
                Password
              </label>

              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  disabled={isSubmitting}
                  aria-invalid={Boolean(errors.password)}
                  aria-describedby={
                    errors.password ? 'password-error' : undefined
                  }
                  className={`${inputClass} pr-12`}
                  {...register('password')}
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  aria-label={
                    showPassword ? 'Hide password' : 'Show password'
                  }
                  aria-controls="password"
                  className="absolute right-3 top-5 rounded p-1 text-slate-500 focus-visible:outline-2 focus-visible:outline-red-600"
                >
                  {showPassword ? (
                    <EyeOff size={20} />
                  ) : (
                    <Eye size={20} />
                  )}
                </button>
              </div>

              {errors.password && (
                <p
                  id="password-error"
                  className="mt-2 text-sm text-red-600"
                >
                  {errors.password.message}
                </p>
              )}
            </div>

            <label className="flex items-center gap-2 text-sm text-slate-600">
              <input
                type="checkbox"
                disabled={isSubmitting}
                className="size-4 accent-red-600"
                {...register('rememberMe')}
              />
              Remember me
            </label>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-3 font-semibold text-white hover:bg-red-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting && (
                <LoaderCircle
                  size={18}
                  className="animate-spin"
                  aria-hidden="true"
                />
              )}

              {isSubmitting ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        </div>
      </section>

      <aside className="hidden items-end bg-slate-900 p-16 text-white lg:flex">
        <div className="max-w-lg">
          <p className="text-sm font-semibold tracking-widest text-red-400">
            TEMPEST ADVERTISING
          </p>

          <h2 className="mt-6 text-4xl leading-tight font-semibold">
            Turn every opportunity into a clear next move.
          </h2>

          <p className="mt-6 leading-relaxed text-slate-300">
            Manage acquisition, client onboarding, and long-term
            relationships in one workspace.
          </p>
        </div>
      </aside>
    </main>
  );
}