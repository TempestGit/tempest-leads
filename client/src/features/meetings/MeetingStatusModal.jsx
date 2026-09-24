import {
  useEffect,
  useState,
} from "react";

import {
  X,
} from "lucide-react";

import {
  useCancelMeetingMutation,
  useNoShowMeetingMutation,
} from "./meetings.queries.js";

/*
|--------------------------------------------------------------------------
| Status Modal
|--------------------------------------------------------------------------
*/

const MeetingStatusModal = ({
  open,
  meeting,
  action,
  onClose,
}) => {
  const cancelMutation =
    useCancelMeetingMutation();

  const noShowMutation =
    useNoShowMeetingMutation();

  const [
    reason,
    setReason,
  ] = useState("");

  const [
    error,
    setError,
  ] = useState("");

  const isNoShow =
    action ===
    "NO_SHOW";

  const mutation =
    isNoShow
      ? noShowMutation
      : cancelMutation;

  useEffect(() => {
    if (!open) {
      return;
    }

    setReason("");

    setError("");
  }, [
    open,
    action,
    meeting,
  ]);

  if (
    !open ||
    !meeting
  ) {
    return null;
  }

  const title =
    isNoShow
      ? "Mark as no-show"
      : "Cancel meeting";

  const submitLabel =
    isNoShow
      ? "Mark no-show"
      : "Cancel meeting";

  /*
  |--------------------------------------------------------------------------
  | Submit
  |--------------------------------------------------------------------------
  */

  const submit =
    async () => {
      setError("");

      if (
        !reason.trim()
      ) {
        setError(
          isNoShow
            ? "No-show note is required."
            : "Cancellation reason is required."
        );

        return;
      }

      try {
        await mutation.mutateAsync({
          meetingId:
            meeting.id,

          data: {
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
            "Unable to update meeting."
        );
      }
    };

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
              {title}
            </h2>

            <p>
              <b>
                {meeting.title}
              </b>
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
              <label className="full">
                {isNoShow
                  ? "No-show note *"
                  : "Cancellation reason *"}

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
                  autoFocus
                />
              </label>
            </div>
          </div>
        </div>

        <footer className="modal-foot">
          <button
            type="button"
            className="tl-secondary"
            disabled={
              mutation.isPending
            }
            onClick={
              onClose
            }
          >
            Back
          </button>

          <button
            type="button"
            className={
              isNoShow
                ? "tl-primary"
                : "tl-danger"
            }
            disabled={
              mutation.isPending
            }
            onClick={
              submit
            }
          >
            {mutation.isPending
              ? "Saving..."
              : submitLabel}
          </button>
        </footer>
      </section>
    </div>
  );
};

export default MeetingStatusModal;