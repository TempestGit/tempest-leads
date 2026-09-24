import {
  useEffect,
  useState,
} from "react";

import {
  X,
} from "lucide-react";

import {
  useRescheduleFollowupMutation,
} from "./followups.queries.js";

const RescheduleFollowupModal = ({
  open,
  followup,
  onClose,
}) => {
  const mutation =
    useRescheduleFollowupMutation();

  const [
    date,
    setDate,
  ] = useState("");

  const [
    time,
    setTime,
  ] = useState(
    "10:00"
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
    if (
      !open ||
      !followup
    ) {
      return;
    }

    const due =
      new Date(
        followup.dueAt
      );

    setDate(
      due
        .toISOString()
        .slice(
          0,
          10
        )
    );

    setTime(
      due
        .toTimeString()
        .slice(
          0,
          5
        )
    );

    setReason("");

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
      if (
        !date ||
        !reason.trim()
      ) {
        setError(
          "New date and reason are required."
        );

        return;
      }

      const dueAt =
        new Date(
          `${date}T${time || "10:00"}:00`
        );

      try {
        await mutation.mutateAsync({
          followupId:
            followup.id,

          data: {
            dueAt:
              dueAt.toISOString(),

            action:
              followup.action,

            priority:
              followup.priority,

            reason:
              reason.trim(),
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
            "Unable to reschedule follow-up."
        );
      }
    };

  return (
    <div className="modal-backdrop">
      <section className="tl-modal">
        <header className="modal-head">
          <div>
            <h2>
              Reschedule follow-up
            </h2>
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

          <div className="form-grid2">
            <label>
              New date *

              <input
                type="date"
                value={
                  date
                }
                onChange={(
                  event
                ) =>
                  setDate(
                    event.target
                      .value
                  )
                }
              />
            </label>

            <label>
              New time

              <input
                type="time"
                value={
                  time
                }
                onChange={(
                  event
                ) =>
                  setTime(
                    event.target
                      .value
                  )
                }
              />
            </label>

            <label className="full">
              Reason *

              <textarea
                rows="4"
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
              ? "Rescheduling..."
              : "Reschedule"}
          </button>
        </footer>
      </section>
    </div>
  );
};

export default RescheduleFollowupModal;