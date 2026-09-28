import {
  useEffect,
  useState,
} from "react";

import {
  X,
} from "lucide-react";

import {
  useSaveTeamAssignmentMutation,
  useTeamAssignmentOptionsQuery,
} from "./teamAssignments.queries.js";

const RESPONSIBILITIES = [
  {
    value:
      "ACCOUNT_SERVICING",
    label:
      "Account / Servicing",
  },
  {
    value:
      "STRATEGY",
    label:
      "Strategy",
  },
  {
    value:
      "CREATIVE",
    label:
      "Creative",
  },
  {
    value:
      "DESIGN",
    label:
      "Design",
  },
  {
    value:
      "COPY",
    label:
      "Copy",
  },
  {
    value:
      "MEDIA_DIGITAL",
    label:
      "Media / Digital",
  },
  {
    value:
      "PRODUCTION",
    label:
      "Production",
  },
  {
    value:
      "PRESENTATION_OWNER",
    label:
      "Presentation Owner",
  },
];

const STATUSES = [
  {
    value:
      "PENDING",
    label:
      "Pending",
  },
  {
    value:
      "IN_PROGRESS",
    label:
      "In Progress",
  },
  {
    value:
      "COMPLETED",
    label:
      "Completed",
  },
];

const toInputDateTime =
  (
    value
  ) => {
    if (!value) {
      return "";
    }

    const date =
      new Date(value);

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return "";
    }

    const pad =
      (
        number
      ) =>
        String(
          number
        ).padStart(
          2,
          "0"
        );

    return `${date.getFullYear()}-${pad(
      date.getMonth() +
        1
    )}-${pad(
      date.getDate()
    )}T${pad(
      date.getHours()
    )}:${pad(
      date.getMinutes()
    )}`;
  };

const TeamAssignmentModal = ({
  open,
  lead,
  assignment = null,
  onClose,
}) => {
  const mutation =
    useSaveTeamAssignmentMutation();

  const [
    form,
    setForm,
  ] = useState({
    responsibility:
      "ACCOUNT_SERVICING",

    userId:
      "",

    branchId:
      "",

    crossBranch:
      false,

    dueAt:
      "",

    status:
      "PENDING",
  });

  const [
    error,
    setError,
  ] = useState("");

  /*
  |--------------------------------------------------------------------------
  | Current Branch
  |--------------------------------------------------------------------------
  */

  const selectedBranchId =
    form.branchId
      ? Number(
          form.branchId
        )
      : null;

  /*
  |--------------------------------------------------------------------------
  | Options
  |--------------------------------------------------------------------------
  */

const optionsQuery =
  useTeamAssignmentOptionsQuery(
    selectedBranchId,
    open
  );

  const options =
    optionsQuery.data
      ?.data ||
    {};

  const branches =
    options.branches ||
    [];

  const users =
    options.users ||
    [];

  const responsibilities =
    options.responsibilities
      ?.length
      ? options.responsibilities
      : RESPONSIBILITIES;

  const statuses =
    options.statuses
      ?.length
      ? options.statuses
      : STATUSES;

  /*
  |--------------------------------------------------------------------------
  | Reset
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (!open) {
      return;
    }

    setError("");

    if (
      assignment
    ) {
      setForm({
        responsibility:
          assignment.responsibility,

        userId:
          String(
            assignment.userId
          ),

        branchId:
          String(
            assignment.memberBranchId ||
              lead.branchId ||
              ""
          ),

        crossBranch:
          Boolean(
            assignment.isCrossBranch
          ),

        dueAt:
          toInputDateTime(
            assignment.dueAt
          ),

        status:
          assignment.status ||
          "PENDING",
      });

      return;
    }

    setForm({
      responsibility:
        "ACCOUNT_SERVICING",

      userId:
        "",

      branchId:
        lead.branchId
          ? String(
              lead.branchId
            )
          : "",

      crossBranch:
        false,

      dueAt:
        "",

      status:
        "PENDING",
    });
  }, [
    open,
    assignment,
    lead.branchId,
  ]);

  /*
  |--------------------------------------------------------------------------
  | Clear User When Branch Changes
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (
      !open
    ) {
      return;
    }

    if (
      assignment &&
      Number(
        assignment.memberBranchId
      ) ===
        Number(
          selectedBranchId
        )
    ) {
      return;
    }

    setForm(
      (
        previous
      ) => ({
        ...previous,

        userId:
          "",
      })
    );
  }, [
    selectedBranchId,
    open,
    assignment,
  ]);

  /*
  |--------------------------------------------------------------------------
  | Toggle Cross Branch
  |--------------------------------------------------------------------------
  */

  const toggleCrossBranch =
    (
      checked
    ) => {
      setForm(
        (
          previous
        ) => ({
          ...previous,

          crossBranch:
            checked,

          branchId:
            checked
              ? ""
              : lead.branchId
                ? String(
                    lead.branchId
                  )
                : "",

          userId:
            "",
        })
      );
    };

  /*
  |--------------------------------------------------------------------------
  | Update
  |--------------------------------------------------------------------------
  */

  const update =
    (
      field,
      value
    ) => {
      setForm(
        (
          previous
        ) => ({
          ...previous,

          [field]:
            value,
        })
      );
    };

  /*
  |--------------------------------------------------------------------------
  | Submit
  |--------------------------------------------------------------------------
  */

  const submit =
    async () => {
      setError("");

      if (
        !lead.branchId
      ) {
        setError(
          "This lead does not have a branch. Assign the lead branch first."
        );

        return;
      }

      if (
        !form.branchId
      ) {
        setError(
          "Select a branch."
        );

        return;
      }

      if (
        !form.userId
      ) {
        setError(
          "Select a team member."
        );

        return;
      }

      try {
        await mutation.mutateAsync({
          leadId:
            Number(
              lead.id
            ),

          data: {
            userId:
              Number(
                form.userId
              ),

            responsibility:
              form.responsibility,

            memberBranchId:
              Number(
                form.branchId
              ),

            isCrossBranch:
              Boolean(
                form.crossBranch
              ),

            dueAt:
              form.dueAt
                ? new Date(
                    form.dueAt
                  ).toISOString()
                : null,

            status:
              form.status,
          },
        });

        onClose();
      } catch (
        requestError
      ) {
        setError(
          requestError
            ?.response
            ?.data
            ?.message ||
            "Unable to save team assignment."
        );
      }
    };

  if (
    !open ||
    !lead
  ) {
    return null;
  }

  return (
    <div className="modal-backdrop">
      <section
        className="tl-modal"
        role="dialog"
        aria-modal="true"
      >
        <header className="modal-head">
          <div>
            <h2>
              {assignment
                ? "Edit team assignment"
                : "Assign team member"}
            </h2>

            <p>
              Default assignments
              use the lead branch.
              Cross-branch members
              can be selected when
              required.
            </p>
          </div>

          <button
            type="button"
            className="icon-control"
            onClick={
              onClose
            }
            disabled={
              mutation.isPending
            }
            aria-label="Close"
          >
            <X
              size={15}
            />
          </button>
        </header>

        <div className="modal-body">
          {error && (
            <div className="error-box">
              {error}
            </div>
          )}

          {!lead.branchId && (
            <div className="error-box">
              Lead branch is not
              configured yet.
            </div>
          )}

          <div className="form-section">
            <h3>
              Responsibility
            </h3>

            <div className="form-grid2">
              <label>
                Responsibility *

                <select
                  value={
                    form.responsibility
                  }
                  disabled={
                    Boolean(
                      assignment
                    )
                  }
                  onChange={(
                    event
                  ) =>
                    update(
                      "responsibility",
                      event.target
                        .value
                    )
                  }
                >
                  {responsibilities.map(
                    (
                      item
                    ) => (
                      <option
                        key={
                          item.value
                        }
                        value={
                          item.value
                        }
                      >
                        {
                          item.label
                        }
                      </option>
                    )
                  )}
                </select>
              </label>

              <div className="team-lead-branch-field">
                <small>
                  LEAD BRANCH
                </small>

                <b>
                  {lead.branchName ||
                    "Not assigned"}
                </b>
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>
              Team member
            </h3>

            <label className="team-cross-branch-toggle">
              <input
                type="checkbox"
                checked={
                  form.crossBranch
                }
                onChange={(
                  event
                ) =>
                  toggleCrossBranch(
                    event.target
                      .checked
                  )
                }
              />

              <span>
                Assign member from
                another branch
              </span>
            </label>

            <div className="form-grid2">
              <label>
                Member branch *

                {form.crossBranch ? (
                  <select
                    value={
                      form.branchId
                    }
                    onChange={(
                      event
                    ) =>
                      update(
                        "branchId",
                        event.target
                          .value
                      )
                    }
                  >
                    <option value="">
                      Select branch
                    </option>

                    {branches
                      .filter(
                        (
                          branch
                        ) =>
                          Number(
                            branch.id
                          ) !==
                          Number(
                            lead.branchId
                          )
                      )
                      .map(
                        (
                          branch
                        ) => (
                          <option
                            key={
                              branch.id
                            }
                            value={
                              branch.id
                            }
                          >
                            {
                              branch.name
                            }
                          </option>
                        )
                      )}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={
                      lead.branchName ||
                      ""
                    }
                    readOnly
                  />
                )}
              </label>

              <label>
                Team member *

                <select
                  value={
                    form.userId
                  }
                  disabled={
                    !form.branchId ||
                    optionsQuery.isLoading
                  }
                  onChange={(
                    event
                  ) =>
                    update(
                      "userId",
                      event.target
                        .value
                    )
                  }
                >
                  <option value="">
                    {optionsQuery.isLoading
                      ? "Loading members..."
                      : users.length
                        ? "Select team member"
                        : "No team members available"}
                  </option>

                  {users.map(
                    (
                      member
                    ) => (
                      <option
                        key={
                          member.id
                        }
                        value={
                          member.id
                        }
                      >
                        {member.fullName}
                      </option>
                    )
                  )}
                </select>
              </label>

              <label>
                Due date

                <input
                  type="datetime-local"
                  value={
                    form.dueAt
                  }
                  onChange={(
                    event
                  ) =>
                    update(
                      "dueAt",
                      event.target
                        .value
                    )
                  }
                />
              </label>

              <label>
                Status

                <select
                  value={
                    form.status
                  }
                  onChange={(
                    event
                  ) =>
                    update(
                      "status",
                      event.target
                        .value
                    )
                  }
                >
                  {statuses.map(
                    (
                      item
                    ) => (
                      <option
                        key={
                          item.value
                        }
                        value={
                          item.value
                        }
                      >
                        {
                          item.label
                        }
                      </option>
                    )
                  )}
                </select>
              </label>
            </div>

            {form.crossBranch && (
              <div className="team-cross-branch-note">
                <b>
                  Cross-branch assignment
                </b>

                <span>
                  This member will
                  work on the{" "}
                  {lead.branchName}{" "}
                  opportunity while
                  remaining part of
                  their own branch.
                </span>
              </div>
            )}
          </div>
        </div>

        <footer className="modal-foot">
          <button
            type="button"
            className="tl-secondary"
            onClick={
              onClose
            }
            disabled={
              mutation.isPending
            }
          >
            Cancel
          </button>

          <button
            type="button"
            className="tl-primary"
            onClick={
              submit
            }
            disabled={
              mutation.isPending ||
              !lead.branchId
            }
          >
            {mutation.isPending
              ? "Saving..."
              : assignment
                ? "Update assignment"
                : "Assign member"}
          </button>
        </footer>
      </section>
    </div>
  );
};

export default TeamAssignmentModal;