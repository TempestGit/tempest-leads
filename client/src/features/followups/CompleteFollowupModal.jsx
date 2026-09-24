import {
  useEffect,
  useState,
} from "react";

import {
  X,
} from "lucide-react";

import {
  useCompleteFollowupMutation,
} from "./followups.queries.js";

const CompleteFollowupModal = ({
  open,
  followup,
  onClose,
}) => {
  const mutation =
    useCompleteFollowupMutation();

  const [
    outcome,
    setOutcome,
  ] = useState("");

  const [
    notes,
    setNotes,
  ] = useState("");

  const [
    nextAction,
    setNextAction,
  ] = useState("");

  const [
    nextDate,
    setNextDate,
  ] = useState("");

  const [
    nextTime,
    setNextTime,
  ] = useState(
    "10:00"
  );

  const [
    error,
    setError,
  ] = useState("");

  useEffect(() => {
    if (
      !open ||
      !followup
    ) {
      return;
    }

    setOutcome("");

    setNotes("");

    setNextAction("");

    setNextDate("");

    setNextTime(
      "10:00"
    );

    setError("");
  }, [
    open,
    followup,
  ]);

  if (
    !open ||
    !followup
  ) {
    return null;
  }

  const submit =
    async () => {
      setError("");

      if (
        !outcome.trim() ||
        !notes.trim() ||
        !nextAction.trim() ||
        !nextDate
      ) {
        setError(
          "Outcome, notes, next action and next follow-up date are required."
        );

        return;
      }

      const nextFollowUpAt =
        new Date(
          `${nextDate}T${nextTime || "10:00"}:00`
        );

      try {
        await mutation.mutateAsync({
          followupId:
            followup.id,

          data: {
            outcome:
              outcome.trim(),

            notes:
              notes.trim(),

            nextAction:
              nextAction.trim(),

            nextFollowUpAt:
              nextFollowUpAt.toISOString(),

            nextPriority:
              followup.priority,
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
            "Unable to complete follow-up."
        );
      }
    };

  return (
    <div className="modal-backdrop">
      <section className="tl-modal">
        <header className="modal-head">
          <div>
            <h2>
              Complete follow-up
            </h2>

            <p>
              <b>
                {
                  followup.action
                }
              </b>
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
                Outcome *

                <input
                  value={
                    outcome
                  }
                  onChange={(
                    event
                  ) =>
                    setOutcome(
                      event.target
                        .value
                    )
                  }
                />
              </label>

              <label className="full">
                Notes *

                <textarea
                  rows="4"
                  value={
                    notes
                  }
                  onChange={(
                    event
                  ) =>
                    setNotes(
                      event.target
                        .value
                    )
                  }
                />
              </label>

              <label>
                Next action *

                <input
                  value={
                    nextAction
                  }
                  onChange={(
                    event
                  ) =>
                    setNextAction(
                      event.target
                        .value
                    )
                  }
                />
              </label>

              <label>
                Next follow-up date *

                <input
                  type="date"
                  value={
                    nextDate
                  }
                  onChange={(
                    event
                  ) =>
                    setNextDate(
                      event.target
                        .value
                    )
                  }
                />
              </label>

              <label>
                Next follow-up time

                <input
                  type="time"
                  value={
                    nextTime
                  }
                  onChange={(
                    event
                  ) =>
                    setNextTime(
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
            {mutation.isPending
              ? "Completing..."
              : "Mark complete"}
          </button>
        </footer>
      </section>
    </div>
  );
};

export default CompleteFollowupModal;