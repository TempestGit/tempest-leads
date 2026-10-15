
import { useMemo, useState } from "react";

import {
  Activity,
  AlertCircle,
  Building2,
  CheckCircle2,
  LoaderCircle,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  UserRound,
  UserRoundCheck,
  UserRoundX,
  Users,
  X,
} from "lucide-react";

import useAuth from "../auth/useAuth.js";

import {
  useUpdateUserStatusMutation,
  useUsersQuery,
} from "./users.queries.js";

import UserFormModal from "./UserFormModal.jsx";

import "./users-glass.css";

/*
|--------------------------------------------------------------------------
| Helpers
|--------------------------------------------------------------------------
*/

const getInitials = (value) => {
  const parts = String(value || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (!parts.length) return "U";

  return parts
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");
};

const normalizeStatus = (value) =>
  String(value || "").trim().toUpperCase();

/*
|--------------------------------------------------------------------------
| Users Page
|--------------------------------------------------------------------------
*/

const UsersPage = () => {
  const { user: currentUser } = useAuth();

  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [error, setError] = useState("");

  /*
  |--------------------------------------------------------------------------
  | Query
  |--------------------------------------------------------------------------
  */

  const params = useMemo(
    () => ({
      search: search.trim() || undefined,
    }),
    [search]
  );

  const query = useUsersQuery(params);

  const statusMutation = useUpdateUserStatusMutation();

  const users = query.data?.data?.users || [];

  const isAdmin = currentUser?.role === "SUPER_ADMIN";

  /*
  |--------------------------------------------------------------------------
  | Statistics
  |--------------------------------------------------------------------------
  */

  const stats = useMemo(() => {
    let active = 0;
    let inactive = 0;
    let owners = 0;
    let admins = 0;
    let assignedLeads = 0;

    users.forEach((user) => {
      const status = normalizeStatus(user.status);

      if (status === "ACTIVE") active += 1;
      if (status === "INACTIVE") inactive += 1;

      if (user.role === "OWNER") owners += 1;
      if (user.role === "SUPER_ADMIN") admins += 1;

      assignedLeads += Number(user.assignedLeads) || 0;
    });

    return {
      total: users.length,
      active,
      inactive,
      owners,
      admins,
      assignedLeads,
    };
  }, [users]);

  /*
  |--------------------------------------------------------------------------
  | Modal Actions
  |--------------------------------------------------------------------------
  */

  const openCreate = () => {
    setEditingUser(null);
    setError("");
    setModalOpen(true);
  };

  const openEdit = (user) => {
    setEditingUser(user);
    setError("");
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingUser(null);
  };

  /*
  |--------------------------------------------------------------------------
  | Status Mutation
  |--------------------------------------------------------------------------
  */

  const toggleStatus = async (user) => {
    const nextStatus =
      user.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";

    const action =
      nextStatus === "ACTIVE" ? "activate" : "deactivate";

    if (
      action === "deactivate" &&
      !window.confirm(
        `Deactivate ${user.fullName}? Any owned leads will be reassigned to an active Super Admin.`
      )
    ) {
      return;
    }

    setError("");

    try {
      await statusMutation.mutateAsync({
        userId: user.id,
        status: nextStatus,
      });
    } catch (requestError) {
      setError(
        requestError?.response?.data?.message ||
          `Unable to ${action} user.`
      );
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Restricted Access
  |--------------------------------------------------------------------------
  */

  if (!isAdmin) {
    return (
      <div className="gup-page workflow-page min-w-0 p-4 sm:p-6 xl:p-8">
        <section className="gup-panel flex min-h-[380px] flex-col items-center justify-center rounded-[24px] px-6 text-center">
          <span className="gup-restricted-icon mb-5 flex h-20 w-20 items-center justify-center rounded-3xl">
            <ShieldCheck size={34} />
          </span>

          <h2 className="gup-title text-xl font-extrabold">
            Access Restricted
          </h2>

          <p className="gup-muted mt-3 max-w-md text-sm leading-6">
            User management is available only to Super Admin.
            Contact your administrator if you need access.
          </p>
        </section>
      </div>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Render
  |--------------------------------------------------------------------------
  */

  return (
    <div className="gup-page workflow-page min-w-0 space-y-6 p-4 sm:p-6 xl:p-8">
      {/* ========================================================= */}
      {/* HEADER */}
      {/* ========================================================= */}

      <section className="gup-header relative overflow-hidden rounded-[26px] p-5 sm:p-7">
        <div className="gup-header-glow pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full" />

        <div className="relative flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
          <div className="flex min-w-0 items-start gap-4">
            <span className="gup-header-icon flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl">
              <Users size={26} />
            </span>

            <div className="min-w-0">
              <p className="gup-eyebrow mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em]">
                <span className="gup-live-dot h-2 w-2 rounded-full" />
                TEAM & ACCESS MANAGEMENT
              </p>

              <h1 className="gup-title text-2xl font-extrabold tracking-tight sm:text-3xl">
                Users / Owners
              </h1>

              <p className="gup-muted mt-2 max-w-2xl text-sm leading-6">
                Manage account access, lead ownership,
                departments, and branch assignments from
                one workspace.
              </p>
            </div>
          </div>

          <div className="flex shrink-0 flex-wrap items-center gap-3">
            <button
              type="button"
              className="gup-secondary inline-flex h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm font-bold"
              onClick={() => query.refetch()}
              disabled={query.isFetching}
            >
              <RefreshCw
                size={16}
                className={query.isFetching ? "animate-spin" : ""}
              />
              Refresh
            </button>

            <button
              type="button"
              className="gup-primary inline-flex h-11 items-center justify-center gap-2 rounded-xl px-5 text-sm font-bold"
              onClick={openCreate}
            >
              <Plus size={18} />
              Add User
            </button>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* METRICS */}
      {/* ========================================================= */}

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <article className="gup-metric gup-metric-primary relative overflow-hidden rounded-[22px] p-5">
          <div className="relative flex items-start justify-between gap-3">
            <div>
              <p className="gup-metric-label text-xs font-semibold">
                Total Users
              </p>

              <h2 className="gup-metric-value mt-3 text-3xl font-extrabold">
                {query.isLoading ? "—" : stats.total}
              </h2>

              <p className="gup-metric-description mt-2 text-xs">
                Registered team members
              </p>
            </div>

            <span className="gup-metric-icon flex h-11 w-11 shrink-0 items-center justify-center rounded-xl">
              <Users size={21} />
            </span>
          </div>

          <div className="gup-metric-decoration pointer-events-none absolute -bottom-12 -right-10 h-32 w-32 rounded-full" />
        </article>

        <article className="gup-metric gup-metric-green rounded-[22px] p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="gup-metric-label text-xs font-semibold">
                Active Users
              </p>

              <h2 className="gup-metric-value mt-3 text-3xl font-extrabold">
                {query.isLoading ? "—" : stats.active}
              </h2>

              <p className="gup-metric-description mt-2 text-xs">
                Accounts currently active
              </p>
            </div>

            <span className="gup-metric-icon flex h-11 w-11 shrink-0 items-center justify-center rounded-xl">
              <UserRoundCheck size={21} />
            </span>
          </div>
        </article>

        <article className="gup-metric gup-metric-violet rounded-[22px] p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="gup-metric-label text-xs font-semibold">
                Owners
              </p>

              <h2 className="gup-metric-value mt-3 text-3xl font-extrabold">
                {query.isLoading ? "—" : stats.owners}
              </h2>

              <p className="gup-metric-description mt-2 text-xs">
                Lead ownership accounts
              </p>
            </div>

            <span className="gup-metric-icon flex h-11 w-11 shrink-0 items-center justify-center rounded-xl">
              <UserRound size={21} />
            </span>
          </div>
        </article>

        <article className="gup-metric gup-metric-orange rounded-[22px] p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="gup-metric-label text-xs font-semibold">
                Assigned Leads
              </p>

              <h2 className="gup-metric-value mt-3 text-3xl font-extrabold">
                {query.isLoading ? "—" : stats.assignedLeads}
              </h2>

              <p className="gup-metric-description mt-2 text-xs">
                Across listed users
              </p>
            </div>

            <span className="gup-metric-icon flex h-11 w-11 shrink-0 items-center justify-center rounded-xl">
              <Activity size={21} />
            </span>
          </div>
        </article>
      </section>

      {/* ========================================================= */}
      {/* MUTATION ERROR */}
      {/* ========================================================= */}

      {error && (
        <div
          role="alert"
          className="gup-error flex items-start gap-3 rounded-2xl px-5 py-4 text-sm"
        >
          <AlertCircle size={18} className="mt-0.5 shrink-0" />
          <span>{error}</span>

          <button
            type="button"
            className="ml-auto shrink-0"
            onClick={() => setError("")}
            aria-label="Dismiss error"
          >
            <X size={17} />
          </button>
        </div>
      )}

      {/* ========================================================= */}
      {/* USERS TABLE */}
      {/* ========================================================= */}

      <section className="gup-panel overflow-hidden rounded-[24px]">
        <div className="gup-panel-header flex flex-col justify-between gap-4 px-5 py-5 lg:flex-row lg:items-center lg:px-6">
          <div className="flex items-center gap-3">
            <span className="gup-section-icon flex h-11 w-11 items-center justify-center rounded-xl">
              <ShieldCheck size={20} />
            </span>

            <div>
              <h2 className="gup-title text-base font-extrabold">
                Team Directory
              </h2>

              <p className="gup-muted mt-1 text-xs">
                {query.isLoading
                  ? "Loading team members..."
                  : `${users.length} user${users.length === 1 ? "" : "s"} found`}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <label className="gup-search flex h-11 min-w-0 items-center gap-3 rounded-xl px-4 sm:min-w-[290px]">
              <Search size={17} className="shrink-0" />

              <input
                type="search"
                className="min-w-0 flex-1 border-0 bg-transparent text-sm outline-none"
                placeholder="Search name, email, department..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />

              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  aria-label="Clear search"
                >
                  <X size={15} />
                </button>
              )}
            </label>

            <span className="gup-count inline-flex shrink-0 items-center gap-2 self-start rounded-full px-3 py-1.5 text-xs font-bold sm:self-auto">
              <span className="gup-count-dot h-2 w-2 rounded-full" />

              {query.isLoading
                ? "Loading"
                : `${users.length} records`}
            </span>
          </div>
        </div>

        {query.isError ? (
          <div className="flex min-h-[280px] flex-col items-center justify-center px-5 text-center">
            <span className="gup-error-icon mb-4 flex h-16 w-16 items-center justify-center rounded-2xl">
              <AlertCircle size={28} />
            </span>

            <h3 className="gup-title text-base font-bold">
              Unable to load users
            </h3>

            <p className="gup-muted mt-2 max-w-md text-sm leading-6">
              {query.error?.response?.data?.message ||
                "Something went wrong while loading users."}
            </p>

            <button
              type="button"
              className="gup-secondary mt-5 inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold"
              onClick={() => query.refetch()}
            >
              <RefreshCw size={16} />
              Try Again
            </button>
          </div>
        ) : query.isLoading ? (
          <div className="flex min-h-[280px] flex-col items-center justify-center gap-3">
            <LoaderCircle
              size={28}
              className="gup-loading animate-spin"
            />

            <p className="gup-muted text-sm">
              Loading Users / Owners...
            </p>
          </div>
        ) : (
          <div className="gup-table-wrap w-full overflow-x-auto">
            <table className="gup-table w-full border-collapse text-left">
              <thead>
                <tr>
                  <th>User</th>
                  <th>User ID</th>
                  <th>Role</th>
                  <th>Department</th>
                  <th>Branch</th>
                  <th>Status</th>
                  <th>Assigned Leads</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {users.map((user) => {
                  const isActive =
                    normalizeStatus(user.status) === "ACTIVE";

                  const isCurrentUser =
                    Number(user.id) === Number(currentUser?.id);

                  return (
                    <tr key={user.id}>
                      <td>
                        <div className="flex min-w-[200px] items-center gap-3">
                          <span className="gup-avatar flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-sm font-extrabold">
                            {getInitials(user.fullName)}
                          </span>

                          <div className="min-w-0">
                            <p className="gup-user-name flex flex-wrap items-center gap-2 text-sm font-bold">
                              {user.fullName}

                              {isCurrentUser && (
                                <span className="gup-you-badge rounded-full px-2 py-0.5 text-[10px] font-bold">
                                  You
                                </span>
                              )}
                            </p>

                            <p className="gup-user-email mt-1 break-all text-xs">
                              {user.email}
                            </p>

                            {user.location && (
                              <p className="gup-user-email mt-1 text-[11px]">
                                {user.location}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      <td>
                        <span className="gup-user-code text-xs font-bold">
                          {user.userCode || "—"}
                        </span>
                      </td>

                      <td>
                        <span
                          className="gup-role inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-bold"
                          data-role={user.role}
                        >
                          {user.role === "SUPER_ADMIN" ? (
                            <ShieldCheck size={13} />
                          ) : (
                            <UserRound size={13} />
                          )}

                          {user.role === "SUPER_ADMIN"
                            ? "Super Admin"
                            : "Owner"}
                        </span>
                      </td>

                      <td>
                        <span className="gup-cell-text text-xs">
                          {user.department || "—"}
                        </span>
                      </td>

                      <td>
                        <span className="gup-cell-text inline-flex items-center gap-1.5 text-xs">
                          <Building2 size={14} />

                          {user.role === "SUPER_ADMIN"
                            ? "All branches"
                            : user.branchName || "—"}
                        </span>
                      </td>

                      <td>
                        <span
                          className="gup-status inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-bold"
                          data-status={normalizeStatus(user.status)}
                        >
                          <span className="h-1.5 w-1.5 rounded-full bg-current" />
                          {user.status || "—"}
                        </span>
                      </td>

                      <td>
                        <span className="gup-assigned inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-bold">
                          <Activity size={14} />
                          {user.assignedLeads ?? 0}
                        </span>
                      </td>

                      <td>
                        <div className="flex min-w-[180px] flex-wrap items-center gap-2">
                          <button
                            type="button"
                            className="gup-action-edit inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold"
                            onClick={() => openEdit(user)}
                          >
                            <Pencil size={14} />
                            Edit
                          </button>

                          {!isCurrentUser && (
                            <button
                              type="button"
                              className="gup-action-status inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold"
                              data-action={
                                isActive ? "deactivate" : "activate"
                              }
                              disabled={statusMutation.isPending}
                              onClick={() => toggleStatus(user)}
                            >
                              {isActive ? (
                                <UserRoundX size={14} />
                              ) : (
                                <UserRoundCheck size={14} />
                              )}

                              {isActive ? "Deactivate" : "Activate"}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {!users.length && (
                  <tr>
                    <td colSpan={8}>
                      <div className="flex min-h-[220px] flex-col items-center justify-center text-center">
                        <span className="gup-empty-icon mb-4 flex h-16 w-16 items-center justify-center rounded-2xl">
                          <Users size={27} />
                        </span>

                        <h3 className="gup-title text-sm font-bold">
                          No users found
                        </h3>

                        <p className="gup-muted mt-2 text-xs">
                          Try adjusting your search or add a new user.
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {!query.isError && !query.isLoading && (
          <div className="gup-panel-footer flex flex-wrap items-center justify-between gap-3 px-5 py-4 sm:px-6">
            <p className="gup-muted text-xs">
              Showing {users.length} user
              {users.length === 1 ? "" : "s"}
            </p>

            {query.isFetching && (
              <span className="gup-muted inline-flex items-center gap-2 text-xs">
                <LoaderCircle
                  size={14}
                  className="animate-spin"
                />
                Updating
              </span>
            )}
          </div>
        )}
      </section>

      {/* ========================================================= */}
      {/* MODAL */}
      {/* ========================================================= */}

      <UserFormModal
        open={modalOpen}
        user={editingUser}
        onClose={closeModal}
      />
    </div>
  );
};

export default UsersPage;