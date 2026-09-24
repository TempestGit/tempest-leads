import {
  useEffect,
  useState,
} from "react";

import {
  X,
} from "lucide-react";

import {
  useChangeLeadOwnerMutation,
  useLeadOptionsQuery,
} from "./leads.queries.js";

const AssignOwnerModal = ({
  open,
  leadIds = [],
  onClose,
}) => {
  const optionsQuery =
    useLeadOptionsQuery();

  const mutation =
    useChangeLeadOwnerMutation();

  const owners =
    optionsQuery
      .data
      ?.data
      ?.owners || [];

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

  useEffect(() => {
    if (!open) {
      return;
    }

    setOwnerId("");
    setReason("");
    setError("");
  }, [open]);

  if (!open) {
    return null;
  }

  const submit =
    async () => {
      if (
        !leadIds.length
      ) {
        setError(
          "Select one or more leads first."
        );

        return;
      }

      if (!ownerId) {
        setError(
          "Select an owner."
        );

        return;
      }

      try {
        for (
          const leadId of
          leadIds
        ) {
          await mutation.mutateAsync({
            leadId,

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
      } catch (requestError) {
        setError(
          requestError
            ?.response
            ?.data
            ?.message ||
            "Unable to assign owner."
        );
      }
    };

  return (
    <div className="modal-backdrop">
      <section className="tl-modal">
        <header className="modal-head">
          <div>
            <h2>
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
          >
            <X size={15} />
          </button>
        </header>

        <div className="modal-body">
          {error && (
            <div className="error-box">
              {error}
            </div>
          )}

          <div className="form-section">
            <div className="form-grid2">
              <label>
                Owner

                <select
                  value={
                    ownerId
                  }
                  onChange={(
                    event
                  ) =>
                    setOwnerId(
                      event.target
                        .value
                    )
                  }
                >
                  <option value="">
                    Select owner
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
                        {
                          owner.name
                        }
                      </option>
                    )
                  )}
                </select>
              </label>

              <label className="full">
                Reason

                <textarea
                  rows="3"
                  value={
                    reason
                  }
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

        <footer className="modal-foot">
          <button
            type="button"
            className="tl-secondary"
            onClick={
              onClose
            }
          >
            Cancel
          </button>

          <button
            type="button"
            className="tl-primary"
            disabled={
              mutation.isPending
            }
            onClick={
              submit
            }
          >
            Assign
          </button>
        </footer>
      </section>
    </div>
  );
};

export default AssignOwnerModal;