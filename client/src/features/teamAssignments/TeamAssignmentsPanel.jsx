import {
  useState,
} from "react";

import useAuth from "../auth/useAuth.js";

import {
  useDeleteTeamAssignmentMutation,
  useTeamAssignmentsQuery,
  useUpdateTeamAssignmentStatusMutation,
} from "./teamAssignments.queries.js";

import TeamAssignmentModal from "./TeamAssignmentModal.jsx";

/*
|--------------------------------------------------------------------------
| Responsibilities
|--------------------------------------------------------------------------
*/

const RESPONSIBILITIES = [
  {
    value: "ACCOUNT_SERVICING",
    label: "Account / Servicing",
  },
  {
    value: "STRATEGY",
    label: "Strategy",
  },
  {
    value: "CREATIVE",
    label: "Creative",
  },
  {
    value: "DESIGN",
    label: "Design",
  },
  {
    value: "COPY",
    label: "Copy",
  },
  {
    value: "MEDIA_DIGITAL",
    label: "Media / Digital",
  },
  {
    value: "PRODUCTION",
    label: "Production",
  },
  {
    value: "PRESENTATION_OWNER",
    label: "Presentation Owner",
  },
];

/*
|--------------------------------------------------------------------------
| Responsibility Labels
|--------------------------------------------------------------------------
*/

const RESPONSIBILITY_LABELS =
  Object.fromEntries(
    RESPONSIBILITIES.map(
      (item) => [
        item.value,
        item.label,
      ]
    )
  );

/*
|--------------------------------------------------------------------------
| Status Labels
|--------------------------------------------------------------------------
*/

const STATUS_LABELS = {
  PENDING: "Pending",
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
};

/*
|--------------------------------------------------------------------------
| Format Date
|--------------------------------------------------------------------------
*/

const formatDateTime = (
  value
) => {
  if (!value) {
    return "—";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "—";
  }

  return date.toLocaleString(
    "en-IN",
    {
      dateStyle: "medium",
      timeStyle: "short",
    }
  );
};

/*
|--------------------------------------------------------------------------
| Status Class
|--------------------------------------------------------------------------
*/

const statusClass = (
  status
) =>
  String(
    status || ""
  )
    .toLowerCase()
    .replaceAll(
      "_",
      "-"
    );

/*
|--------------------------------------------------------------------------
| Team Assignments Panel
|--------------------------------------------------------------------------
*/

const TeamAssignmentsPanel = ({
  lead,
}) => {
  /*
  |--------------------------------------------------------------------------
  | Auth
  |--------------------------------------------------------------------------
  */

  const {
    user,
  } =
    useAuth();

  /*
  |--------------------------------------------------------------------------
  | Queries
  |--------------------------------------------------------------------------
  */

  const query =
    useTeamAssignmentsQuery(
      lead.id
    );

  /*
  |--------------------------------------------------------------------------
  | Mutations
  |--------------------------------------------------------------------------
  */

  const statusMutation =
    useUpdateTeamAssignmentStatusMutation();

  const deleteMutation =
    useDeleteTeamAssignmentMutation();

  /*
  |--------------------------------------------------------------------------
  | State
  |--------------------------------------------------------------------------
  */

  const [
    modalOpen,
    setModalOpen,
  ] = useState(false);

  const [
    editingAssignment,
    setEditingAssignment,
  ] = useState(null);

  const [
    error,
    setError,
  ] = useState("");

  /*
  |--------------------------------------------------------------------------
  | Permissions
  |--------------------------------------------------------------------------
  */

  const isAdmin =
    user?.role ===
    "SUPER_ADMIN";

  /*
  |--------------------------------------------------------------------------
  | IMPORTANT
  |--------------------------------------------------------------------------
  |
  | Do NOT put useMemo/useEffect/useState/useQuery below the conditional
  | returns in this component.
  |
  | These are ordinary variables, so they are safe during every render.
  |
  */

  const teamLead =
    query.data
      ?.data
      ?.lead ||
    lead;

  const assignments =
    query.data
      ?.data
      ?.assignments ||
    [];

  const assignmentMap =
    Object.fromEntries(
      assignments.map(
        (
          assignment
        ) => [
          assignment.responsibility,
          assignment,
        ]
      )
    );

  const assignedCount =
    assignments.length;

  const crossBranchCount =
    assignments.filter(
      (
        assignment
      ) =>
        assignment.isCrossBranch
    ).length;

  const completedCount =
    assignments.filter(
      (
        assignment
      ) =>
        assignment.status ===
        "COMPLETED"
    ).length;

  /*
  |--------------------------------------------------------------------------
  | Open New
  |--------------------------------------------------------------------------
  */

  const openNew =
    () => {
      setEditingAssignment(
        null
      );

      setError("");

      setModalOpen(
        true
      );
    };

  /*
  |--------------------------------------------------------------------------
  | Edit
  |--------------------------------------------------------------------------
  */

  const openEdit =
    (
      assignment
    ) => {
      setEditingAssignment(
        assignment
      );

      setError("");

      setModalOpen(
        true
      );
    };

  /*
  |--------------------------------------------------------------------------
  | Change Status
  |--------------------------------------------------------------------------
  */

  const changeStatus =
    async (
      assignment,
      status
    ) => {
      setError("");

      try {
        await statusMutation.mutateAsync({
          assignmentId:
            assignment.id,

          status,
        });
      } catch (
        requestError
      ) {
        setError(
          requestError
            ?.response
            ?.data
            ?.message ||
            "Unable to update assignment status."
        );
      }
    };

  /*
  |--------------------------------------------------------------------------
  | Remove
  |--------------------------------------------------------------------------
  */

  const removeAssignment =
    async (
      assignment
    ) => {
      const responsibility =
        RESPONSIBILITY_LABELS[
          assignment.responsibility
        ] ||
        assignment.responsibility;

      const confirmed =
        window.confirm(
          `Remove ${assignment.userName} from ${responsibility}?`
        );

      if (!confirmed) {
        return;
      }

      setError("");

      try {
        await deleteMutation.mutateAsync(
          assignment.id
        );

        await query.refetch();
      } catch (
        requestError
      ) {
        setError(
          requestError
            ?.response
            ?.data
            ?.message ||
            "Unable to remove assignment."
        );
      }
    };

  /*
  |--------------------------------------------------------------------------
  | Loading
  |--------------------------------------------------------------------------
  |
  | All React hooks have already executed before this return.
  |
  */

  if (
    query.isLoading
  ) {
    return (
      <article className="tl-card">
        <div className="empty-state">
          <h2>
            Loading team
          </h2>

          <p>
            Loading team
            assignments...
          </p>
        </div>
      </article>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Error
  |--------------------------------------------------------------------------
  */

  if (
    query.isError
  ) {
    return (
      <article className="tl-card">
        <div className="empty-state">
          <h2>
            Unable to load team
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
      </article>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Render
  |--------------------------------------------------------------------------
  */

  return (
    <>
      <article className="tl-card">
        {/* --------------------------------------------------------------- */}
        {/* Header */}
        {/* --------------------------------------------------------------- */}

        <div className="tl-card-head">
          <div>
            <h2>
              TEAM ASSIGNMENT
            </h2>

            <p className="muted">
              Primary branch:{" "}

              <b>
                {teamLead.branchName ||
                  "Not assigned"}
              </b>
            </p>
          </div>

          {isAdmin && (
            <button
              type="button"
              className="tl-primary"
              onClick={
                openNew
              }
              disabled={
                !teamLead.branchId
              }
            >
              + Assign team member
            </button>
          )}
        </div>

        {/* --------------------------------------------------------------- */}
        {/* Missing Branch */}
        {/* --------------------------------------------------------------- */}

        {!teamLead.branchId && (
          <div className="brief-clarification">
            <b>
              Lead branch required
            </b>

            <span>
              Assign Hyderabad,
              Pune, Bangalore or
              Mumbai as the lead's
              primary branch before
              building the team.
            </span>
          </div>
        )}

        {/* --------------------------------------------------------------- */}
        {/* Summary */}
        {/* --------------------------------------------------------------- */}

        <div className="info-grid team-assignment-summary">
          <div className="info-field">
            <small>
              Primary branch
            </small>

            <b>
              {teamLead.branchName ||
                "—"}
            </b>
          </div>

          <div className="info-field">
            <small>
              Responsibilities
            </small>

            <b>
              {assignedCount} /{" "}
              {
                RESPONSIBILITIES.length
              }
            </b>
          </div>

          <div className="info-field">
            <small>
              Cross-branch
            </small>

            <b>
              {
                crossBranchCount
              }
            </b>
          </div>

          <div className="info-field">
            <small>
              Completed
            </small>

            <b>
              {
                completedCount
              }
            </b>
          </div>
        </div>

        {/* --------------------------------------------------------------- */}
        {/* Mutation Error */}
        {/* --------------------------------------------------------------- */}

        {error && (
          <div className="error-box team-assignment-error">
            {error}
          </div>
        )}

        {/* --------------------------------------------------------------- */}
        {/* Responsibility Cards */}
        {/* --------------------------------------------------------------- */}

        <div className="team-responsibility-grid">
          {RESPONSIBILITIES.map(
            (
              responsibility
            ) => {
              const assignment =
                assignmentMap[
                  responsibility.value
                ];

              return (
                <div
                  key={
                    responsibility.value
                  }
                  className={`team-responsibility-card ${
                    assignment
                      ? "assigned"
                      : ""
                  }`}
                >
                  <small>
                    {
                      responsibility.label
                    }
                  </small>

                  <b>
                    {assignment
                      ?.userName ||
                      "Unassigned"}
                  </b>

                  {assignment && (
                    <>
                      <span className="team-member-branch">
                        {assignment.memberBranchName ||
                          "No branch"}

                        {assignment.isCrossBranch
                          ? " · Cross-branch"
                          : ""}
                      </span>

                      <span
                        className={`team-assignment-status ${statusClass(
                          assignment.status
                        )}`}
                      >
                        {STATUS_LABELS[
                          assignment.status
                        ] ||
                          assignment.status}
                      </span>
                    </>
                  )}
                </div>
              );
            }
          )}
        </div>

        {/* --------------------------------------------------------------- */}
        {/* Empty */}
        {/* --------------------------------------------------------------- */}

        {assignments.length ===
          0 ? (
          <div className="empty-state team-assignment-empty">
            <h2>
              No team assigned
            </h2>

            <p>
              Team members from{" "}
              {teamLead.branchName ||
                "the primary branch"}{" "}
              will be shown first.
              Cross-branch members
              can be added whenever
              required.
            </p>

            {isAdmin &&
              teamLead.branchId && (
                <button
                  type="button"
                  className="tl-primary"
                  onClick={
                    openNew
                  }
                >
                  + Assign first member
                </button>
              )}
          </div>
        ) : (
          /* ------------------------------------------------------------- */
          /* Table */
          /* ------------------------------------------------------------- */

          <div className="table-wrap team-assignment-table-wrap">
            <table className="tl-table">
              <thead>
                <tr>
                  <th>
                    Role
                  </th>

                  <th>
                    Assignee
                  </th>

                  <th>
                    Branch
                  </th>

                  <th>
                    Assigned by
                  </th>

                  <th>
                    Assigned date
                  </th>

                  <th>
                    Due date
                  </th>

                  <th>
                    Status
                  </th>

                  <th>
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {assignments.map(
                  (
                    assignment
                  ) => {
                    const canUpdateStatus =
                      isAdmin ||
                      Number(
                        assignment.userId
                      ) ===
                        Number(
                          user?.id
                        );

                    return (
                      <tr
                        key={
                          assignment.id
                        }
                      >
                        {/* Role */}

                        <td>
                          <b>
                            {RESPONSIBILITY_LABELS[
                              assignment.responsibility
                            ] ||
                              assignment.responsibility}
                          </b>
                        </td>

                        {/* Assignee */}

                        <td>
                          {
                            assignment.userName
                          }
                        </td>

                        {/* Branch */}

                        <td>
                          <div className="team-branch-cell">
                            <span>
                              {assignment.memberBranchName ||
                                "—"}
                            </span>

                            {assignment.isCrossBranch && (
                              <small className="team-cross-branch-badge">
                                Cross-branch
                              </small>
                            )}
                          </div>
                        </td>

                        {/* Assigned By */}

                        <td>
                          {assignment.assignedByName ||
                            "—"}
                        </td>

                        {/* Assigned Date */}

                        <td>
                          {formatDateTime(
                            assignment.assignedAt
                          )}
                        </td>

                        {/* Due */}

                        <td>
                          {formatDateTime(
                            assignment.dueAt
                          )}
                        </td>

                        {/* Status */}

                        <td>
                          {canUpdateStatus ? (
                            <select
                              className="team-status-select"
                              value={
                                assignment.status
                              }
                              disabled={
                                statusMutation.isPending
                              }
                              onChange={(
                                event
                              ) =>
                                changeStatus(
                                  assignment,
                                  event.target
                                    .value
                                )
                              }
                            >
                              <option value="PENDING">
                                Pending
                              </option>

                              <option value="IN_PROGRESS">
                                In Progress
                              </option>

                              <option value="COMPLETED">
                                Completed
                              </option>
                            </select>
                          ) : (
                            <span
                              className={`team-assignment-status ${statusClass(
                                assignment.status
                              )}`}
                            >
                              {STATUS_LABELS[
                                assignment.status
                              ] ||
                                assignment.status}
                            </span>
                          )}
                        </td>

                        {/* Actions */}

                        <td>
                          {isAdmin ? (
                            <div className="team-assignment-actions">
                              <button
                                type="button"
                                className="tl-link"
                                onClick={() =>
                                  openEdit(
                                    assignment
                                  )
                                }
                              >
                                Edit
                              </button>

                              <button
                                type="button"
                                className="tl-link team-remove-action"
                                disabled={
                                  deleteMutation.isPending
                                }
                                onClick={() =>
                                  removeAssignment(
                                    assignment
                                  )
                                }
                              >
                                Remove
                              </button>
                            </div>
                          ) : (
                            "—"
                          )}
                        </td>
                      </tr>
                    );
                  }
                )}
              </tbody>
            </table>
          </div>
        )}
      </article>

      {/* ----------------------------------------------------------------- */}
      {/* Assignment Modal */}
      {/* ----------------------------------------------------------------- */}

      <TeamAssignmentModal
        open={
          modalOpen
        }
        lead={
          teamLead
        }
        assignment={
          editingAssignment
        }
        onClose={() => {
          setModalOpen(
            false
          );

          setEditingAssignment(
            null
          );

          query.refetch();
        }}
      />
    </>
  );
};

export default TeamAssignmentsPanel;