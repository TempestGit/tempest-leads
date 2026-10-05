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

/*
|--------------------------------------------------------------------------
| Local Date
|--------------------------------------------------------------------------
*/

const getLocalDate =
  () => {
    const now =
      new Date();

    const year =
      now.getFullYear();

    const month =
      String(
        now.getMonth() + 1
      ).padStart(
        2,
        "0"
      );

    const day =
      String(
        now.getDate()
      ).padStart(
        2,
        "0"
      );

    return `${year}-${month}-${day}`;
  };

/*
|--------------------------------------------------------------------------
| Local Time
|--------------------------------------------------------------------------
*/

const getLocalTime =
  () => {
    const now =
      new Date();

    const hours =
      String(
        now.getHours()
      ).padStart(
        2,
        "0"
      );

    const minutes =
      String(
        now.getMinutes()
      ).padStart(
        2,
        "0"
      );

    return `${hours}:${minutes}`;
  };

/*
|--------------------------------------------------------------------------
| Complete Follow-up Modal
|--------------------------------------------------------------------------
*/

const CompleteFollowupModal = ({
  open,
  followup,
  onClose,
}) => {
  const mutation =
    useCompleteFollowupMutation();

  /*
  |--------------------------------------------------------------------------
  | State
  |--------------------------------------------------------------------------
  */

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
  ] = useState(
    getLocalDate()
  );

  const [
    nextTime,
    setNextTime,
  ] = useState(
    getLocalTime()
  );

  const [
    error,
    setError,
  ] = useState("");

  /*
  |--------------------------------------------------------------------------
  | Reset When Opened
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (
      !open ||
      !followup
    ) {
      return;
    }

    /*
     * Calculate current date/time
     * whenever the modal opens.
     */

    const currentDate =
      getLocalDate();

    const currentTime =
      getLocalTime();

    setOutcome("");

    setNotes("");

    setNextAction("");

    setNextDate(
      currentDate
    );

    setNextTime(
      currentTime
    );

    setError("");
  }, [
    open,
    followup,
  ]);

  /*
  |--------------------------------------------------------------------------
  | Not Open
  |--------------------------------------------------------------------------
  */

  if (
    !open ||
    !followup
  ) {
    return null;
  }

  /*
  |--------------------------------------------------------------------------
  | Current Date / Time
  |--------------------------------------------------------------------------
  */

  const today =
    getLocalDate();

  const currentTime =
    getLocalTime();

  /*
  |--------------------------------------------------------------------------
  | Date Change
  |--------------------------------------------------------------------------
  */

  const handleDateChange =
    (
      event
    ) => {
      const selectedDate =
        event.target.value;

      const nowDate =
        getLocalDate();

      const nowTime =
        getLocalTime();

      /*
       * Allow clearing the field.
       */

      if (!selectedDate) {
        setNextDate("");

        setError("");

        return;
      }

      /*
       * Reject past date.
       */

      if (
        selectedDate <
        nowDate
      ) {
        setError(
          "Next follow-up date cannot be in the past."
        );

        return;
      }

      setNextDate(
        selectedDate
      );

      /*
       * If user changes back to today
       * and selected time has already
       * passed, automatically move the
       * time to current time.
       */

      if (
        selectedDate ===
          nowDate &&
        (
          !nextTime ||
          nextTime <
            nowTime
        )
      ) {
        setNextTime(
          nowTime
        );
      }

      setError("");
    };

  /*
  |--------------------------------------------------------------------------
  | Time Change
  |--------------------------------------------------------------------------
  */

  const handleTimeChange =
    (
      event
    ) => {
      const selectedTime =
        event.target.value;

      const nowDate =
        getLocalDate();

      const nowTime =
        getLocalTime();

      /*
       * Allow clearing.
       */

      if (!selectedTime) {
        setNextTime("");

        setError("");

        return;
      }

      /*
       * If date is today,
       * past time is not allowed.
       */

      if (
        nextDate ===
          nowDate &&
        selectedTime <
          nowTime
      ) {
        setError(
          "Next follow-up time cannot be in the past."
        );

        return;
      }

      setNextTime(
        selectedTime
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
      | Required Fields
      |--------------------------------------------------------------------------
      */

      if (
        !outcome.trim() ||
        !notes.trim() ||
        !nextAction.trim() ||
        !nextDate ||
        !nextTime
      ) {
        setError(
          "Outcome, notes, next action, next follow-up date and time are required."
        );

        return;
      }

      /*
      |--------------------------------------------------------------------------
      | Prevent Past Date
      |--------------------------------------------------------------------------
      */

      if (
        nextDate <
        getLocalDate()
      ) {
        setError(
          "Next follow-up date cannot be in the past."
        );

        return;
      }

      /*
      |--------------------------------------------------------------------------
      | Create Next Follow-up Date / Time
      |--------------------------------------------------------------------------
      */

      const nextFollowUpAt =
        new Date(
          `${nextDate}T${nextTime}:00`
        );

      /*
      |--------------------------------------------------------------------------
      | Validate Date
      |--------------------------------------------------------------------------
      */

      if (
        Number.isNaN(
          nextFollowUpAt.getTime()
        )
      ) {
        setError(
          "Enter a valid next follow-up date and time."
        );

        return;
      }

      /*
      |--------------------------------------------------------------------------
      | Prevent Past Date / Time
      |--------------------------------------------------------------------------
      |
      | The input min attributes prevent
      | normal past selections, but we
      | validate again before sending
      | the API request.
      |
      | 60-second tolerance allows the
      | current minute.
      |
      */

      const now =
        new Date();

      const minimumAllowed =
        now.getTime() -
        60 * 1000;

      if (
        nextFollowUpAt.getTime() <
        minimumAllowed
      ) {
        setError(
          "Next follow-up date and time cannot be in the past. Select the current time or a future time."
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
            requestError
              ?.message ||
            "Unable to complete follow-up."
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
      <section className="tl-modal">
        {/* Header */}

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

              {/* Notes */}

              <label className="full">
                Notes *

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

              {/* Next Follow-up Date */}

              <label>
                Next follow-up date *

                <input
                  type="date"
                  min={
                    today
                  }
                  value={
                    nextDate
                  }
                  onChange={
                    handleDateChange
                  }
                />
              </label>

              {/* Next Follow-up Time */}

              <label>
                Next follow-up time *

                <input
                  type="time"
                  min={
                    nextDate ===
                    today
                      ? currentTime
                      : undefined
                  }
                  value={
                    nextTime
                  }
                  onChange={
                    handleTimeChange
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
            disabled={
              mutation.isPending
            }
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