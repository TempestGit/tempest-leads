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
| Local Date
|--------------------------------------------------------------------------
*/

const getLocalDate =
  () => {
    const date =
      new Date();

    const year =
      date.getFullYear();

    const month =
      String(
        date.getMonth() + 1
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
| Tomorrow
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
        date.getMonth() + 1
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

  /*
  |--------------------------------------------------------------------------
  | State
  |--------------------------------------------------------------------------
  */

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

    /*
     * Default follow-up remains tomorrow.
     */

    setFollowUpDate(
      getTomorrow()
    );

    setError("");
  }, [
    open,
    meeting,
  ]);

  /*
  |--------------------------------------------------------------------------
  | Not Open
  |--------------------------------------------------------------------------
  */

  if (
    !open ||
    !meeting
  ) {
    return null;
  }

  /*
  |--------------------------------------------------------------------------
  | Current Date
  |--------------------------------------------------------------------------
  */

  const today =
    getLocalDate();

  /*
  |--------------------------------------------------------------------------
  | Follow-up Date Change
  |--------------------------------------------------------------------------
  */

  const handleFollowUpDateChange =
    (
      event
    ) => {
      const selectedDate =
        event.target.value;

      /*
       * Allow clearing so normal
       * required validation can handle it.
       */

      if (!selectedDate) {
        setFollowUpDate("");

        setError("");

        return;
      }

      /*
       * Reject past date.
       */

      if (
        selectedDate <
        getLocalDate()
      ) {
        setError(
          "Follow-up date cannot be in the past."
        );

        return;
      }

      setFollowUpDate(
        selectedDate
      );

      setError("");
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
      | Notes
      |--------------------------------------------------------------------------
      */

      if (
        !notes.trim()
      ) {
        setError(
          "Meeting notes are required."
        );

        return;
      }

      /*
      |--------------------------------------------------------------------------
      | Outcome
      |--------------------------------------------------------------------------
      */

      if (
        !outcome.trim()
      ) {
        setError(
          "Meeting outcome is required."
        );

        return;
      }

      /*
      |--------------------------------------------------------------------------
      | Next Action
      |--------------------------------------------------------------------------
      */

      if (
        !nextAction.trim()
      ) {
        setError(
          "Next action is required."
        );

        return;
      }

      /*
      |--------------------------------------------------------------------------
      | Follow-up Date
      |--------------------------------------------------------------------------
      */

      if (
        !followUpDate
      ) {
        setError(
          "Follow-up date is required."
        );

        return;
      }

      /*
      |--------------------------------------------------------------------------
      | Prevent Past Date
      |--------------------------------------------------------------------------
      */

      const currentDate =
        getLocalDate();

      if (
        followUpDate <
        currentDate
      ) {
        setError(
          "Follow-up date cannot be in the past."
        );

        return;
      }

      /*
      |--------------------------------------------------------------------------
      | Build Follow-up Date / Time
      |--------------------------------------------------------------------------
      |
      | This modal currently does not have a time field.
      |
      | If TODAY is selected:
      | use current local time.
      |
      | If a FUTURE date is selected:
      | use 10:00 AM.
      |
      | This prevents today's follow-up from becoming a past datetime
      | when the current time is already after 10:00 AM.
      |
      */

      let followUpAt;

      if (
        followUpDate ===
        currentDate
      ) {
        /*
         * Current time + small buffer.
         *
         * The buffer prevents the timestamp
         * from becoming past while the
         * request is being submitted.
         */

        followUpAt =
          new Date(
            Date.now() +
              60 * 1000
          );
      } else {
        followUpAt =
          new Date(
            `${followUpDate}T10:00:00`
          );
      }

      /*
      |--------------------------------------------------------------------------
      | Validate Generated Date
      |--------------------------------------------------------------------------
      */

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

      /*
      |--------------------------------------------------------------------------
      | Final Past Date / Time Protection
      |--------------------------------------------------------------------------
      */

      const minimumAllowed =
        Date.now() -
        60 * 1000;

      if (
        followUpAt.getTime() <
        minimumAllowed
      ) {
        setError(
          "Follow-up date cannot be in the past."
        );

        return;
      }

      /*
      |--------------------------------------------------------------------------
      | Request
      |--------------------------------------------------------------------------
      */

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
            requestError
              ?.message ||
            "Unable to complete meeting."
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
      >
        {/* Header */}

        <header className="modal-head">
          <div>
            <h2>
              Complete meeting
            </h2>

            <p>
              <b>
                {
                  meeting.title
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

        {/* Body */}

        <div className="modal-body">
          {error && (
            <div className="error-box">
              {error}
            </div>
          )}

          <div className="form-section">
            <div className="form-grid2">
              {/* Meeting Notes */}

              <label className="full">
                Meeting notes *

                <textarea
                  rows="4"
                  value={
                    notes
                  }
                  onChange={(
                    event
                  ) => {
                    setNotes(
                      event.target
                        .value
                    );

                    setError("");
                  }}
                  autoFocus
                />
              </label>

              {/* Outcome */}

              <label>
                Outcome *

                <input
                  type="text"
                  value={
                    outcome
                  }
                  onChange={(
                    event
                  ) => {
                    setOutcome(
                      event.target
                        .value
                    );

                    setError("");
                  }}
                />
              </label>

              {/* Next Action */}

              <label>
                Next action *

                <input
                  type="text"
                  value={
                    nextAction
                  }
                  onChange={(
                    event
                  ) => {
                    setNextAction(
                      event.target
                        .value
                    );

                    setError("");
                  }}
                />
              </label>

              {/* Follow-up Date */}

              <label>
                Follow-up date *

                <input
                  type="date"
                  min={
                    today
                  }
                  value={
                    followUpDate
                  }
                  onChange={
                    handleFollowUpDateChange
                  }
                />
              </label>
            </div>
          </div>
        </div>

        {/* Footer */}

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