import { useEffect, useState } from "react";
import { X } from "lucide-react";

import { useCompleteMeetingMutation } from "./meetings.queries.js";

/*
|--------------------------------------------------------------------------
| Date / Time Helpers
|--------------------------------------------------------------------------
*/

const pad2 = (value) => String(value).padStart(2, "0");

const getLocalDate = (value = new Date()) =>
  `${value.getFullYear()}-${pad2(value.getMonth() + 1)}-${pad2(
    value.getDate()
  )}`;

const getLocalTime = (value = new Date()) =>
  `${pad2(value.getHours())}:${pad2(value.getMinutes())}`;

/*
|--------------------------------------------------------------------------
| Complete Meeting Modal
|--------------------------------------------------------------------------
*/

const CompleteMeetingModal = ({
  open,
  meeting,
  onClose,
}) => {
  const mutation = useCompleteMeetingMutation();

  /*
  |--------------------------------------------------------------------------
  | State
  |--------------------------------------------------------------------------
  */

  const [outcome, setOutcome] = useState("");
  const [notes, setNotes] = useState("");

  const [nextAction, setNextAction] = useState("");

  const [
    followUpDate,
    setFollowUpDate,
  ] = useState("");

  const [
    followUpTime,
    setFollowUpTime,
  ] = useState("");

  const [error, setError] = useState("");

  /*
  |--------------------------------------------------------------------------
  | Reset Every Time Modal Opens
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (!open) {
      return;
    }

    setOutcome("");
    setNotes("");

    /*
     * Follow-up is optional.
     *
     * Do not automatically populate
     * next action, date or time.
     */
    setNextAction("");
    setFollowUpDate("");
    setFollowUpTime("");

    setError("");
  }, [
    open,
    meeting?.id,
  ]);

  /*
  |--------------------------------------------------------------------------
  | Escape
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const handler = (event) => {
      if (
        event.key === "Escape" &&
        !mutation.isPending
      ) {
        onClose();
      }
    };

    window.addEventListener(
      "keydown",
      handler
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handler
      );
    };
  }, [
    open,
    onClose,
    mutation.isPending,
  ]);

  /*
  |--------------------------------------------------------------------------
  | Not Open
  |--------------------------------------------------------------------------
  */

  if (!open || !meeting) {
    return null;
  }

  const today = getLocalDate();
  const currentTime = getLocalTime();

  /*
  |--------------------------------------------------------------------------
  | Follow-up Date Change
  |--------------------------------------------------------------------------
  */

  const handleDateChange = (event) => {
    const selectedDate = event.target.value;

    if (!selectedDate) {
      setFollowUpDate("");
      setFollowUpTime("");
      setError("");

      return;
    }

    const nowDate = getLocalDate();
    const nowTime = getLocalTime();

    if (selectedDate < nowDate) {
      setError(
        "Follow-up date cannot be in the past."
      );

      return;
    }

    setFollowUpDate(selectedDate);

    /*
     * If the user changes the date back
     * to today and the selected time is
     * already past, clear the time.
     */
    if (
      selectedDate === nowDate &&
      followUpTime &&
      followUpTime < nowTime
    ) {
      setFollowUpTime("");
    }

    setError("");
  };

  /*
  |--------------------------------------------------------------------------
  | Follow-up Time Change
  |--------------------------------------------------------------------------
  */

  const handleTimeChange = (event) => {
    const selectedTime = event.target.value;

    if (!selectedTime) {
      setFollowUpTime("");
      setError("");

      return;
    }

    const nowDate = getLocalDate();
    const nowTime = getLocalTime();

    if (
      followUpDate === nowDate &&
      selectedTime < nowTime
    ) {
      setError(
        "Follow-up time cannot be in the past."
      );

      return;
    }

    setFollowUpTime(selectedTime);
    setError("");
  };

  /*
  |--------------------------------------------------------------------------
  | Clear Follow-up
  |--------------------------------------------------------------------------
  */

  const clearFollowUp = () => {
    setNextAction("");
    setFollowUpDate("");
    setFollowUpTime("");
    setError("");
  };

  /*
  |--------------------------------------------------------------------------
  | Submit
  |--------------------------------------------------------------------------
  */

  const submit = async () => {
    setError("");

    /*
    |--------------------------------------------------------------------------
    | Meeting ID
    |--------------------------------------------------------------------------
    */

    if (!meeting?.id) {
      setError(
        "Meeting ID is missing. Refresh the meetings page and try again."
      );

      return;
    }

    /*
    |--------------------------------------------------------------------------
    | Outcome
    |--------------------------------------------------------------------------
    */

    const cleanOutcome = outcome.trim();

    if (!cleanOutcome) {
      setError(
        "Meeting outcome is required."
      );

      return;
    }

    if (cleanOutcome.length < 2) {
      setError(
        "Meeting outcome must be at least 2 characters."
      );

      return;
    }

    if (cleanOutcome.length > 500) {
      setError(
        "Meeting outcome cannot exceed 500 characters."
      );

      return;
    }

    /*
    |--------------------------------------------------------------------------
    | Notes
    |--------------------------------------------------------------------------
    |
    | Backend completeMeetingSchema requires notes.
    | Minimum: 2
    | Maximum: 5000
    |
    */

    const cleanNotes = notes.trim();

    if (!cleanNotes) {
      setError(
        "Meeting notes are required."
      );

      return;
    }

    if (cleanNotes.length < 2) {
      setError(
        "Meeting notes must be at least 2 characters."
      );

      return;
    }

    if (cleanNotes.length > 5000) {
      setError(
        "Meeting notes cannot exceed 5000 characters."
      );

      return;
    }

    /*
    |--------------------------------------------------------------------------
    | Optional Follow-up
    |--------------------------------------------------------------------------
    |
    | Backend requires:
    |
    | nextAction + followUpAt
    |
    | to be supplied together.
    |
    | Both may also be omitted/null.
    |
    */

    const cleanNextAction =
      nextAction.trim();

    const hasNextAction = Boolean(
      cleanNextAction
    );

    const hasFollowUpDate = Boolean(
      followUpDate
    );

    const hasFollowUpTime = Boolean(
      followUpTime
    );

    const hasAnyFollowUp =
      hasNextAction ||
      hasFollowUpDate ||
      hasFollowUpTime;

    let followUpAt = null;

    /*
    |--------------------------------------------------------------------------
    | Validate Optional Follow-up
    |--------------------------------------------------------------------------
    */

    if (hasAnyFollowUp) {
      if (!hasNextAction) {
        setError(
          "Enter a next action for the follow-up."
        );

        return;
      }

      if (
        cleanNextAction.length > 500
      ) {
        setError(
          "Next action cannot exceed 500 characters."
        );

        return;
      }

      if (!hasFollowUpDate) {
        setError(
          "Select a follow-up date."
        );

        return;
      }

      if (!hasFollowUpTime) {
        setError(
          "Select a follow-up time."
        );

        return;
      }

      /*
      |--------------------------------------------------------------------------
      | Construct Exact Local Timestamp
      |--------------------------------------------------------------------------
      */

      const followUpDateTime =
        new Date(
          `${followUpDate}T${followUpTime}:00`
        );

      if (
        Number.isNaN(
          followUpDateTime.getTime()
        )
      ) {
        setError(
          "Enter a valid follow-up date and time."
        );

        return;
      }

      /*
      |--------------------------------------------------------------------------
      | Future Validation
      |--------------------------------------------------------------------------
      */

      if (
        followUpDateTime.getTime() <=
        Date.now()
      ) {
        setError(
          "Follow-up date and time must be in the future."
        );

        return;
      }

      followUpAt =
        followUpDateTime.toISOString();
    }

    /*
    |--------------------------------------------------------------------------
    | Complete Meeting
    |--------------------------------------------------------------------------
    |
    | meetings.api.js expects:
    |
    | {
    |   meetingId,
    |   data
    | }
    |
    */

    try {
      await mutation.mutateAsync({
        meetingId: meeting.id,

        data: {
          outcome: cleanOutcome,

          notes: cleanNotes,

          nextAction:
            hasAnyFollowUp
              ? cleanNextAction
              : null,

          followUpAt:
            hasAnyFollowUp
              ? followUpAt
              : null,
        },
      });

      onClose();
    } catch (requestError) {
      /*
       * Prefer detailed validation messages
       * when the backend provides them.
       */
      const responseData =
        requestError
          ?.response
          ?.data;

      const validationMessage =
        responseData
          ?.errors
          ?.map?.(
            (item) =>
              item?.message
          )
          ?.filter(Boolean)
          ?.join(" ");

      setError(
        validationMessage ||
        responseData?.message ||
        requestError?.message ||
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
        aria-labelledby="complete-meeting-title"
      >
        <header className="modal-head">
          <div>
            <h2 id="complete-meeting-title">
              Complete meeting
            </h2>

            <p>
              Record the outcome and,
              if needed, schedule the
              next follow-up.
            </p>
          </div>

          <button
            type="button"
            className="icon-control"
            disabled={
              mutation.isPending
            }
            onClick={onClose}
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

          {/* Meeting Context */}

          <div className="activity-context">
            <small>
              Meeting
            </small>

            <b>
              {meeting.title}
            </b>

            {meeting.companyName && (
              <span>
                {meeting.companyName}
              </span>
            )}
          </div>

          <div className="form-section">
            <div className="form-grid2">

              {/* Outcome */}

              <label className="full">
                Outcome *

                <textarea
                  rows="3"
                  maxLength={500}
                  value={outcome}
                  disabled={
                    mutation.isPending
                  }
                  placeholder="What happened during the meeting?"
                  onChange={(event) => {
                    setOutcome(
                      event.target.value
                    );

                    setError("");
                  }}
                  autoFocus
                />
              </label>

              {/* Notes */}

              <label className="full">
                Notes *

                <textarea
                  rows="4"
                  maxLength={5000}
                  value={notes}
                  disabled={
                    mutation.isPending
                  }
                  placeholder="Meeting notes are required"
                  onChange={(event) => {
                    setNotes(
                      event.target.value
                    );

                    setError("");
                  }}
                />
              </label>

              {/* Optional Follow-up */}

              <div className="full">
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent:
                      "space-between",
                    gap: "12px",
                  }}
                >
                  <div>
                    <strong>
                      Next follow-up
                    </strong>

                    <div>
                      <small>
                        Optional
                      </small>
                    </div>
                  </div>

                  {(nextAction ||
                    followUpDate ||
                    followUpTime) && (
                    <button
                      type="button"
                      className="tl-secondary"
                      disabled={
                        mutation.isPending
                      }
                      onClick={
                        clearFollowUp
                      }
                    >
                      Clear follow-up
                    </button>
                  )}
                </div>
              </div>

              {/* Next Action */}

              <label className="full">
                Next action

                <input
                  type="text"
                  maxLength={500}
                  value={nextAction}
                  disabled={
                    mutation.isPending
                  }
                  placeholder="e.g. Send revised proposal"
                  onChange={(event) => {
                    setNextAction(
                      event.target.value
                    );

                    setError("");
                  }}
                />
              </label>

              {/* Follow-up Date */}

              <label>
                Follow-up date

                <input
                  type="date"
                  min={today}
                  value={
                    followUpDate
                  }
                  disabled={
                    mutation.isPending
                  }
                  onChange={
                    handleDateChange
                  }
                />
              </label>

              {/* Follow-up Time */}

              <label>
                Follow-up time

                <input
                  type="time"
                  min={
                    followUpDate ===
                    today
                      ? currentTime
                      : undefined
                  }
                  value={
                    followUpTime
                  }
                  disabled={
                    mutation.isPending ||
                    !followUpDate
                  }
                  onChange={
                    handleTimeChange
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
            disabled={
              mutation.isPending
            }
            onClick={onClose}
          >
            Cancel
          </button>

          <button
            type="button"
            className="tl-primary"
            disabled={
              mutation.isPending
            }
            onClick={submit}
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