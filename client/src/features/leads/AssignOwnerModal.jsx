import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  X,
} from "lucide-react";

import {
  useChangeLeadOwnerMutation,
  useLeadOwnersQuery,
} from "./leads.queries.js";

/*
|--------------------------------------------------------------------------
| Assign Owner Modal
|--------------------------------------------------------------------------
|
| Rules:
|
| - The lead's Primary Branch cannot be changed here.
| - Owner options come from the lead's Primary Branch.
| - SUPER_ADMIN is global and may appear for every branch.
| - Normal owners must belong to the same branch as the lead.
|
*/

const AssignOwnerModal = ({
  open,

  leadIds = [],

  /*
   * Pass the current lead when this
   * modal is opened from LeadDetailPage.
   */
  lead = null,

  /*
   * Optional fallback for another page
   * that already knows the branch.
   */
  branchId = null,

  onClose,
}) => {
  /*
  |--------------------------------------------------------------------------
  | Effective Lead Branch
  |--------------------------------------------------------------------------
  */

  const effectiveBranchId =
    lead?.branchId ||
    branchId ||
    null;

  /*
  |--------------------------------------------------------------------------
  | Owner Options
  |--------------------------------------------------------------------------
  |
  | Example:
  |
  | lead.branchId = 1
  |
  | GET /api/leads/owners?branchId=1
  |
  */

  const ownersQuery =
    useLeadOwnersQuery(
      effectiveBranchId,
      open &&
        Boolean(
          effectiveBranchId
        )
    );

  /*
  |--------------------------------------------------------------------------
  | Mutation
  |--------------------------------------------------------------------------
  */

  const mutation =
    useChangeLeadOwnerMutation();

  /*
  |--------------------------------------------------------------------------
  | API Data
  |--------------------------------------------------------------------------
  */

  const owners =
    ownersQuery
      .data
      ?.data
      ?.owners ||
    [];

  const selectedBranch =
    ownersQuery
      .data
      ?.data
      ?.selectedBranch ||
    null;

  /*
  |--------------------------------------------------------------------------
  | Resolved Branch
  |--------------------------------------------------------------------------
  */

  const branch =
    useMemo(
      () => {
        if (
          selectedBranch
        ) {
          return selectedBranch;
        }

        if (
          !lead
        ) {
          return null;
        }

        return {
          id:
            lead.branchId,

          name:
            lead.branchName,

          code:
            lead.branchCode,
        };
      },
      [
        lead,
        selectedBranch,
      ]
    );

  /*
  |--------------------------------------------------------------------------
  | State
  |--------------------------------------------------------------------------
  */

  const [
    ownerId,
    setOwnerId,
  ] =
    useState("");

  const [
    reason,
    setReason,
  ] =
    useState("");

  const [
    error,
    setError,
  ] =
    useState("");

  /*
  |--------------------------------------------------------------------------
  | Reset
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (!open) {
      return;
    }

    setOwnerId("");

    setReason("");

    setError("");
  }, [
    open,
    effectiveBranchId,
  ]);

  /*
  |--------------------------------------------------------------------------
  | Existing Owner
  |--------------------------------------------------------------------------
  */

  const currentOwnerId =
    lead?.ownerId
      ? Number(
          lead.ownerId
        )
      : null;

  /*
  |--------------------------------------------------------------------------
  | Close
  |--------------------------------------------------------------------------
  */

  const handleClose =
    () => {
      if (
        mutation.isPending
      ) {
        return;
      }

      onClose();
    };

  /*
  |--------------------------------------------------------------------------
  | Submit
  |--------------------------------------------------------------------------
  */

  const submit =
    async () => {
      setError("");

      /*
      |--------------------------------------------------------------------------
      | Validate Lead Selection
      |--------------------------------------------------------------------------
      */

      if (
        !leadIds.length
      ) {
        setError(
          "Select one or more leads first."
        );

        return;
      }

      /*
      |--------------------------------------------------------------------------
      | Validate Lead Branch
      |--------------------------------------------------------------------------
      */

      if (
        !effectiveBranchId
      ) {
        setError(
          "This lead does not have a Primary Branch. Assign a branch before changing the owner."
        );

        return;
      }

      /*
      |--------------------------------------------------------------------------
      | Validate Owner
      |--------------------------------------------------------------------------
      */

      if (!ownerId) {
        setError(
          "Select an owner."
        );

        return;
      }

      /*
      |--------------------------------------------------------------------------
      | Prevent Same Owner
      |--------------------------------------------------------------------------
      */

      if (
        leadIds.length ===
          1 &&
        currentOwnerId &&
        Number(
          ownerId
        ) ===
          currentOwnerId
      ) {
        setError(
          "This user already owns the lead."
        );

        return;
      }

      /*
      |--------------------------------------------------------------------------
      | Save
      |--------------------------------------------------------------------------
      */

      try {
        for (
          const itemLeadId of
          leadIds
        ) {
          await mutation.mutateAsync({
            leadId:
              Number(
                itemLeadId
              ),

            data: {
              ownerId:
                Number(
                  ownerId
                ),

              reason:
                reason.trim() ||
                null,
            },
          });
        }

        onClose();
      } catch (
        requestError
      ) {
        setError(
          requestError
            ?.response
            ?.data
            ?.message ||
            requestError
              ?.message ||
            "Unable to assign owner."
        );
      }
    };

  /*
  |--------------------------------------------------------------------------
  | Closed
  |--------------------------------------------------------------------------
  */

  if (!open) {
    return null;
  }

  /*
  |--------------------------------------------------------------------------
  | Render
  |--------------------------------------------------------------------------
  */

  return (
    <div
      className="modal-backdrop"
      onMouseDown={(
        event
      ) => {
        if (
          event.target ===
            event.currentTarget &&
          !mutation.isPending
        ) {
          handleClose();
        }
      }}
    >
      <section
        className="tl-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="assign-owner-title"
      >
        {/* --------------------------------------------------------------- */}
        {/* Header */}
        {/* --------------------------------------------------------------- */}

        <header className="modal-head">
          <div>
            <h2 id="assign-owner-title">
              {leadIds.length >
              1
                ? "Assign owner"
                : "Change owner"}
            </h2>

            <p>
              {leadIds.length >
              1
                ? `Assign ${leadIds.length} selected lead(s).`
                : "Reassign this lead to another active owner."}

              {" "}The change will
              be recorded in the
              activity and audit
              history.
            </p>
          </div>

          <button
            type="button"
            className="icon-control"
            onClick={
              handleClose
            }
            disabled={
              mutation.isPending
            }
            aria-label="Close"
          >
            <X
              size={
                15
              }
            />
          </button>
        </header>

        {/* --------------------------------------------------------------- */}
        {/* Body */}
        {/* --------------------------------------------------------------- */}

        <div className="modal-body">
          {/* ------------------------------------------------------------- */}
          {/* General Error */}
          {/* ------------------------------------------------------------- */}

          {error && (
            <div className="error-box">
              {error}
            </div>
          )}

          {/* ------------------------------------------------------------- */}
          {/* Missing Lead Branch */}
          {/* ------------------------------------------------------------- */}

          {!effectiveBranchId && (
            <div className="error-box">
              This lead does not
              have a Primary Branch.
              Assign a branch before
              changing its owner.
            </div>
          )}

          {/* ------------------------------------------------------------- */}
          {/* Owner API Error */}
          {/* ------------------------------------------------------------- */}

          {effectiveBranchId &&
            ownersQuery
              .isError && (
              <div className="error-box">
                {ownersQuery
                  .error
                  ?.response
                  ?.data
                  ?.message ||
                  "Unable to load owners for this branch."}

                <div
                  style={{
                    marginTop:
                      "8px",
                  }}
                >
                  <button
                    type="button"
                    className="tl-link"
                    onClick={() =>
                      ownersQuery.refetch()
                    }
                  >
                    Try again
                  </button>
                </div>
              </div>
            )}

          {/* ------------------------------------------------------------- */}
          {/* No Owners */}
          {/* ------------------------------------------------------------- */}

          {effectiveBranchId &&
            !ownersQuery
              .isLoading &&
            !ownersQuery
              .isError &&
            owners.length ===
              0 && (
              <div className="error-box">
                No active owners are
                available for this
                branch. Check the
                Users / Owners
                module and make sure
                the required users
                are active.
              </div>
            )}

          {/* ------------------------------------------------------------- */}
          {/* Form */}
          {/* ------------------------------------------------------------- */}

          <div className="form-section">
            <div className="form-grid2">
              {/* --------------------------------------------------------- */}
              {/* Lead Branch */}
              {/* --------------------------------------------------------- */}

              <label>
                Primary branch

                <input
                  type="text"
                  value={
                    branch?.name ||
                    lead
                      ?.branchName ||
                    ""
                  }
                  readOnly
                  placeholder="No branch assigned"
                />
              </label>

              {/* --------------------------------------------------------- */}
              {/* Current Owner */}
              {/* --------------------------------------------------------- */}

              {lead && (
                <label>
                  Current owner

                  <input
                    type="text"
                    value={
                      lead.ownerName ||
                      "—"
                    }
                    readOnly
                  />
                </label>
              )}

              {/* --------------------------------------------------------- */}
              {/* New Owner */}
              {/* --------------------------------------------------------- */}

              <label>
                New owner *

                <select
                  value={
                    ownerId
                  }
                  disabled={
                    !effectiveBranchId ||
                    ownersQuery
                      .isLoading ||
                    ownersQuery
                      .isError ||
                    mutation
                      .isPending ||
                    owners.length ===
                      0
                  }
                  onChange={(
                    event
                  ) => {
                    setOwnerId(
                      event.target
                        .value
                    );

                    setError("");
                  }}
                >
                  <option value="">
                    {!effectiveBranchId
                      ? "Primary branch required"
                      : ownersQuery
                            .isLoading
                        ? "Loading owners..."
                        : owners.length ===
                            0
                          ? "No owners available"
                          : "Select owner"}
                  </option>

                  {owners.map(
                    (
                      owner
                    ) => {
                      const isCurrent =
                        currentOwnerId &&
                        Number(
                          owner.id
                        ) ===
                          Number(
                            currentOwnerId
                          );

                      return (
                        <option
                          key={
                            owner.id
                          }
                          value={
                            owner.id
                          }
                          disabled={
                            Boolean(
                              isCurrent
                            )
                          }
                        >
                          {owner.fullName ||
                            owner.name ||
                            `User ${owner.id}`}

                          {owner.role ===
                          "SUPER_ADMIN"
                            ? " · Global"
                            : owner.branchName
                              ? ` · ${owner.branchName}`
                              : ""}

                          {isCurrent
                            ? " · Current"
                            : ""}
                        </option>
                      );
                    }
                  )}
                </select>

                {branch?.name && (
                  <small
                    style={{
                      display:
                        "block",

                      marginTop:
                        "6px",
                    }}
                  >
                    Only active{" "}
                    {
                      branch.name
                    }{" "}
                    owners and global
                    Super Admin users
                    are available.
                  </small>
                )}
              </label>

              {/* --------------------------------------------------------- */}
              {/* Reason */}
              {/* --------------------------------------------------------- */}

              <label className="full">
                Reason

                <textarea
                  rows="3"
                  value={
                    reason
                  }
                  disabled={
                    mutation
                      .isPending
                  }
                  placeholder="Reason for assignment / reassignment"
                  onChange={(
                    event
                  ) => {
                    setReason(
                      event.target
                        .value
                    );

                    setError("");
                  }}
                />
              </label>
            </div>

            {/* ----------------------------------------------------------- */}
            {/* Branch Information */}
            {/* ----------------------------------------------------------- */}

            {branch?.name && (
              <div
                className="brief-clarification"
                style={{
                  marginTop:
                    "12px",
                }}
              >
                <b>
                  Ownership rule
                </b>

                <span>
                  This lead remains
                  assigned to the{" "}
                  {
                    branch.name
                  }{" "}
                  branch. Changing
                  the owner does not
                  change the lead's
                  Primary Branch.
                </span>
              </div>
            )}
          </div>
        </div>

        {/* --------------------------------------------------------------- */}
        {/* Footer */}
        {/* --------------------------------------------------------------- */}

        <footer className="modal-foot">
          <button
            type="button"
            className="tl-secondary"
            onClick={
              handleClose
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
            disabled={
              mutation.isPending ||
              !effectiveBranchId ||
              ownersQuery
                .isLoading ||
              ownersQuery
                .isError ||
              owners.length ===
                0 ||
              !ownerId
            }
            onClick={
              submit
            }
          >
            {mutation.isPending
              ? leadIds.length >
                  1
                ? "Assigning..."
                : "Updating..."
              : leadIds.length >
                  1
                ? "Assign owner"
                : "Change owner"}
          </button>
        </footer>
      </section>
    </div>
  );
};

export default AssignOwnerModal;