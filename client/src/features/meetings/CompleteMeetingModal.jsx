import {
  useEffect,
  useState,
} from "react";

import {
  X,
} from "lucide-react";

import {
  useCompleteMeetingMutation,
} from "./meetings.queries.js";

/*
|--------------------------------------------------------------------------
| Default Follow-up
|--------------------------------------------------------------------------
*/

const getTomorrow =
  () => {
    const date =
      new Date();

    date.setDate(
      date.getDate() +
        1
    );

    const year =
      date.getFullYear();

    const month =
      String(
        date.getMonth() +
          1
      ).padStart(
        2,
        "0"
      );

    const day =
      String(
        date.getDate()
      ).padStart(
        2,
        "0"
      );

    return `${year}-${month}-${day}`;
  };

/*
|--------------------------------------------------------------------------
| Complete Meeting
|--------------------------------------------------------------------------
*/

const CompleteMeetingModal = ({
  open,
  meeting,
  onClose,
}) => {
  const mutation =
    useCompleteMeetingMutation();

  const [
    notes,
    setNotes,
  ] = useState("");

  const [
    outcome,
    setOutcome,
  ] = useState("");

  const [
    nextAction,
    setNextAction,
  ] = useState("");

  const [
    followUpDate,
    setFollowUpDate,
  ] = useState(
    getTomorrow()
  );

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

    setNotes("");

    setOutcome("");

    setNextAction("");

    setFollowUpDate(
      getTomorrow()
    );

    setError("");
  }, [
    open,
    meeting,
  ]);

  if (
    !open ||
    !meeting
  ) {
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

      if (
        !notes.trim()
      ) {
        setError(
          "Meeting notes are required."
        );

        return;
      }

      if (
        !outcome.trim()
      ) {
        setError(
          "Meeting outcome is required."
        );

        return;
      }

      if (
        !nextAction.trim()
      ) {
        setError(
          "Next action is required."
        );

        return;
      }

      if (
        !followUpDate
      ) {
        setError(
          "Follow-up date is required."
        );

        return;
      }

      const followUpAt =
        new Date(
          `${followUpDate}T10:00:00`
        );

      if (
        Number.isNaN(
          followUpAt.getTime()
        )
      ) {
        setError(
          "Enter a valid follow-up date."
        );

        return;
      }

      try {
        await mutation.mutateAsync({
          meetingId:
            meeting.id,

          data: {
            outcome:
              outcome.trim(),

            notes:
              notes.trim(),

            nextAction:
              nextAction.trim(),

            followUpAt:
              followUpAt.toISOString(),
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
            "Unable to complete meeting."
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
              Complete meeting
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
                Meeting notes *

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
                  autoFocus
                />
              </label>

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
                Follow-up date *

                <input
                  type="date"
                  value={
                    followUpDate
                  }
                  onChange={(
                    event
                  ) =>
                    setFollowUpDate(
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
              mutation.isPending
            }
          >
            {mutation.isPending
              ? "Completing..."
              : "Complete meeting"}
          </button>
        </footer>
      </section>
    </div>
  );
};

export default CompleteMeetingModal;