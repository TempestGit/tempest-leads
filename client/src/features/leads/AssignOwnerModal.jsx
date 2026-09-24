import {
  useEffect,
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
*/

const AssignOwnerModal = ({
  open,
  leadIds = [],
  onClose,
}) => {
  /*
  |--------------------------------------------------------------------------
  | Owners
  |--------------------------------------------------------------------------
  */

  const ownersQuery =
    useLeadOwnersQuery(
      open
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
  | Data
  |--------------------------------------------------------------------------
  */

  const owners =
    ownersQuery
      .data
      ?.data
      ?.owners ||
    [];

  /*
  |--------------------------------------------------------------------------
  | State
  |--------------------------------------------------------------------------
  */

  const [
    ownerId,
    setOwnerId,
  ] = useState("");

  const [
    reason,
    setReason,
  ] = useState("");

  const [
    error,
    setError,
  ] = useState("");

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
  ]);

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
  | Submit
  |--------------------------------------------------------------------------
  */

  const submit =
    async () => {
      setError("");

      /*
      |--------------------------------------------------------------------------
      | Validate Leads
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
      | Save
      |--------------------------------------------------------------------------
      */

      try {
        for (
          const leadId of
          leadIds
        ) {
          await mutation.mutateAsync({
            leadId:
              Number(
                leadId
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
            "Unable to assign owner."
        );
      }
    };

  /*
  |--------------------------------------------------------------------------
  | Render
  |--------------------------------------------------------------------------
  */

  return (
    <div className="modal-backdrop">
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
              Assign owner
            </h2>

            <p>
              Assign{" "}
              {leadIds.length}{" "}
              selected lead(s).
              The change will be
              recorded.
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

        {/* --------------------------------------------------------------- */}
        {/* Body */}
        {/* --------------------------------------------------------------- */}

        <div className="modal-body">
          {/* Request / Mutation Error */}

          {error && (
            <div className="error-box">
              {error}
            </div>
          )}

          {/* Owner API Error */}

          {ownersQuery.isError && (
            <div className="error-box">
              {ownersQuery
                .error
                ?.response
                ?.data
                ?.message ||
                "Unable to load owners."}

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

          {/* No Owners */}

          {!ownersQuery.isLoading &&
            !ownersQuery.isError &&
            owners.length ===
              0 && (
              <div className="error-box">
                No active owners are
                available. Check the
                Users / Owners
                module and make sure
                the users are active.
              </div>
            )}

          {/* Form */}

          <div className="form-section">
            <div className="form-grid2">
              {/* Owner */}

              <label>
                Owner *

                <select
                  value={
                    ownerId
                  }
                  disabled={
                    ownersQuery.isLoading ||
                    ownersQuery.isError ||
                    mutation.isPending
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
                    {ownersQuery.isLoading
                      ? "Loading owners..."
                      : owners.length ===
                          0
                        ? "No owners available"
                        : "Select owner"}
                  </option>

                  {owners.map(
                    (
                      owner
                    ) => (
                      <option
                        key={
                          owner.id
                        }
                        value={
                          owner.id
                        }
                      >
                        {owner.fullName ||
                          owner.name ||
                          `User ${owner.id}`}

                        {owner.branchName
                          ? ` · ${owner.branchName}`
                          : ""}
                      </option>
                    )
                  )}
                </select>
              </label>

              {/* Reason */}

              <label className="full">
                Reason

                <textarea
                  rows="3"
                  value={
                    reason
                  }
                  disabled={
                    mutation.isPending
                  }
                  placeholder="Reason for assignment / reassignment"
                  onChange={(
                    event
                  ) =>
                    setReason(
                      event.target
                        .value
                    )
                  }
                />
              </label>
            </div>
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
            disabled={
              mutation.isPending ||
              ownersQuery.isLoading ||
              ownersQuery.isError ||
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
                : "Assigning..."
              : "Assign"}
          </button>
        </footer>
      </section>
    </div>
  );
};

export default AssignOwnerModal;