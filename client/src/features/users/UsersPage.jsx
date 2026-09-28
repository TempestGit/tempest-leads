import {
  useMemo,
  useState,
} from "react";

import {
  Pencil,
  Plus,
  Search,
} from "lucide-react";

import useAuth from "../auth/useAuth.js";

import {
  useUpdateUserStatusMutation,
  useUsersQuery,
} from "./users.queries.js";

import UserFormModal from "./UserFormModal.jsx";

const UsersPage = () => {
  const {
    user: currentUser,
  } =
    useAuth();

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    modalOpen,
    setModalOpen,
  ] = useState(false);

  const [
    editingUser,
    setEditingUser,
  ] = useState(null);

  const [
    error,
    setError,
  ] = useState("");

  const params =
    useMemo(
      () => ({
        search:
          search.trim() ||
          undefined,
      }),
      [
        search,
      ]
    );

  const query =
    useUsersQuery(
      params
    );

  const statusMutation =
    useUpdateUserStatusMutation();

  const users =
    query.data
      ?.data
      ?.users ||
    [];

  const isAdmin =
    currentUser?.role ===
    "SUPER_ADMIN";

  const openCreate =
    () => {
      setEditingUser(
        null
      );

      setError("");

      setModalOpen(
        true
      );
    };

  const openEdit =
    (
      user
    ) => {
      setEditingUser(
        user
      );

      setError("");

      setModalOpen(
        true
      );
    };

  const closeModal =
    () => {
      setModalOpen(
        false
      );

      setEditingUser(
        null
      );
    };

  const toggleStatus =
    async (
      user
    ) => {
      const nextStatus =
        user.status ===
        "ACTIVE"
          ? "INACTIVE"
          : "ACTIVE";

      const action =
        nextStatus ===
        "ACTIVE"
          ? "activate"
          : "deactivate";

      if (
        action ===
          "deactivate" &&
        !window.confirm(
          `Deactivate ${user.fullName}? Any owned leads will be reassigned to an active Super Admin.`
        )
      ) {
        return;
      }

      setError("");

      try {
        await statusMutation.mutateAsync({
          userId:
            user.id,

          status:
            nextStatus,
        });
      } catch (
        requestError
      ) {
        setError(
          requestError
            ?.response
            ?.data
            ?.message ||
            `Unable to ${action} user.`
        );
      }
    };

  if (!isAdmin) {
    return (
      <article className="tl-card">
        <div className="empty-state">
          <h2>
            Access restricted
          </h2>

          <p>
            User management is
            available only to Super
            Admin.
          </p>
        </div>
      </article>
    );
  }

  if (
    query.isLoading
  ) {
    return (
      <article className="tl-card">
        <div className="empty-state">
          <h2>
            Loading users
          </h2>

          <p>
            Loading Users / Owners...
          </p>
        </div>
      </article>
    );
  }

  return (
    <>
      <div className="page-header">
        <div>
          <h1>
            Users / Owners
          </h1>

          <p className="muted">
            Manage account access,
            lead ownership and branch
            assignments.
          </p>
        </div>

        <button
          type="button"
          className="tl-primary"
          onClick={
            openCreate
          }
        >
          <Plus size={16} />

          Add user
        </button>
      </div>

      {error && (
        <div className="error-box">
          {error}
        </div>
      )}

      <article className="tl-card">
        <div className="tl-card-head">
          <div>
            <h2>
              USERS / OWNERS
            </h2>

            <p className="muted">
              {users.length} user
              {users.length === 1
                ? ""
                : "s"}
            </p>
          </div>

          <label className="top-search">
            <Search size={16} />

            <input
              type="search"
              placeholder="Search name, email or department..."
              value={
                search
              }
              onChange={(
                event
              ) =>
                setSearch(
                  event.target
                    .value
                )
              }
            />
          </label>
        </div>

        {query.isError ? (
          <div className="empty-state">
            <h2>
              Unable to load users
            </h2>

            <p>
              {query.error
                ?.response
                ?.data
                ?.message ||
                "Something went wrong."}
            </p>

            <button
              type="button"
              className="tl-secondary"
              onClick={() =>
                query.refetch()
              }
            >
              Try again
            </button>
          </div>
        ) : (
          <div className="table-wrap">
            <table className="tl-table">
              <thead>
                <tr>
                  <th>
                    User ID
                  </th>

                  <th>
                    Name
                  </th>

                  <th>
                    Email
                  </th>

                  <th>
                    Role
                  </th>

                  <th>
                    Department
                  </th>

                  <th>
                    Branch
                  </th>

                  <th>
                    Status
                  </th>

                  <th>
                    Assigned leads
                  </th>

                  <th>
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {users.map(
                  (
                    user
                  ) => (
                    <tr
                      key={
                        user.id
                      }
                    >
                      <td>
                        {
                          user.userCode
                        }
                      </td>

                      <td>
                        <b>
                          {
                            user.fullName
                          }
                        </b>

                        {user.location && (
                          <small>
                            {
                              user.location
                            }
                          </small>
                        )}
                      </td>

                      <td>
                        {
                          user.email
                        }
                      </td>

                      <td>
                        <span className="status-chip">
                          {user.role ===
                          "SUPER_ADMIN"
                            ? "Super Admin"
                            : "Owner"}
                        </span>
                      </td>

                      <td>
                        {user.department ||
                          "—"}
                      </td>

                      <td>
                        {user.role ===
                        "SUPER_ADMIN"
                          ? "All branches"
                          : user.branchName ||
                            "—"}
                      </td>

                      <td>
                        <span
                          className={`status-chip ${String(
                            user.status ||
                              ""
                          ).toLowerCase()}`}
                        >
                          {
                            user.status
                          }
                        </span>
                      </td>

                      <td>
                        {
                          user.assignedLeads
                        }
                      </td>

                      <td>
                        <div className="table-actions">
                          <button
                            type="button"
                            className="tl-link"
                            onClick={() =>
                              openEdit(
                                user
                              )
                            }
                          >
                            <Pencil
                              size={14}
                            />

                            Edit
                          </button>

                          {Number(
                            user.id
                          ) !==
                            Number(
                              currentUser?.id
                            ) && (
                            <button
                              type="button"
                              className="tl-link"
                              disabled={
                                statusMutation
                                  .isPending
                              }
                              onClick={() =>
                                toggleStatus(
                                  user
                                )
                              }
                            >
                              {user.status ===
                              "ACTIVE"
                                ? "Deactivate"
                                : "Activate"}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                )}

                {!users.length && (
                  <tr>
                    <td
                      colSpan="9"
                    >
                      <div className="empty-state">
                        No users found.
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </article>

      <UserFormModal
        open={
          modalOpen
        }
        user={
          editingUser
        }
        onClose={
          closeModal
        }
      />
    </>
  );
};

export default UsersPage;