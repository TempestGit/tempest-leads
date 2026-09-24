import {
  useEffect,
  useState,
} from "react";

import {
  X,
} from "lucide-react";

import {
  useChangeLeadStageMutation,
} from "./leads.queries.js";

import {
  LEAD_STAGES,
} from "./leads.schema.js";

const ChangeStageModal = ({
  open,
  leadIds = [],
  initialStage = "New",
  onClose,
}) => {
  const mutation =
    useChangeLeadStageMutation();

  const [
    stage,
    setStage,
  ] = useState(
    initialStage
  );

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

    setStage(
      initialStage ||
        "New"
    );

    setReason("");
    setError("");
  }, [
    open,
    initialStage,
  ]);

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

      if (
        !reason.trim()
      ) {
        setError(
          "A reason is required."
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
              stage,
              reason:
                reason.trim(),
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
            "Unable to change stage."
        );
      }
    };

  return (
    <div className="modal-backdrop">
      <section className="tl-modal">
        <header className="modal-head">
          <div>
            <h2>
              Change stage
            </h2>

            <p>
              Stage changes are
              never silent.
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
                New stage

                <select
                  value={
                    stage
                  }
                  onChange={(
                    event
                  ) =>
                    setStage(
                      event.target
                        .value
                    )
                  }
                >
                  {LEAD_STAGES.map(
                    (
                      item
                    ) => (
                      <option
                        key={
                          item
                        }
                      >
                        {item}
                      </option>
                    )
                  )}
                </select>
              </label>

              <label className="full">
                Reason *

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
            Change stage
          </button>
        </footer>
      </section>
    </div>
  );
};

export default ChangeStageModal;