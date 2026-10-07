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
| Date / Time Helpers
|--------------------------------------------------------------------------
*/

const pad2 = (value) =>
  String(value).padStart(2, "0");

const getLocalDate = (
  value = new Date()
) =>
  `${value.getFullYear()}-${pad2(
    value.getMonth() + 1
  )}-${pad2(value.getDate())}`;

const getLocalTime = (
  value = new Date()
) =>
  `${pad2(value.getHours())}:${pad2(
    value.getMinutes()
  )}`;

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
  ] = useState("");

  const [
    nextTime,
    setNextTime,
  ] = useState("");

  const [
    nextPriority,
    setNextPriority,
  ] = useState(
    "Medium"
  );

  const [
    error,
    setError,
  ] = useState("");

  /*
  |--------------------------------------------------------------------------
  | Reset On Open
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (!open) {
      return;
    }

    setOutcome("");
    setNotes("");

    /*
     * Next follow-up is optional.
     *
     * Do not create a hidden date/time.
     */
    setNextAction("");
    setNextDate("");
    setNextTime("");

    if (
      [
        "High",
        "Medium",
        "Low",
      ].includes(
        followup?.priority
      )
    ) {
      setNextPriority(
        followup.priority
      );
    } else {
      setNextPriority(
        "Medium"
      );
    }

    setError("");
  }, [
    open,
    followup?.id,
    followup?.priority,
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

    const handler = (
      event
    ) => {
      if (
        event.key ===
          "Escape" &&
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
  | Closed
  |--------------------------------------------------------------------------
  */

  if (
    !open ||
    !followup
  ) {
    return null;
  }

  const today =
    getLocalDate();

  const currentTime =
    getLocalTime();

  /*
  |--------------------------------------------------------------------------
  | Date Change
  |--------------------------------------------------------------------------
  */

  const handleDateChange = (
    event
  ) => {
    const selectedDate =
      event.target.value;

    if (!selectedDate) {
      setNextDate("");
      setNextTime("");
      setError("");

      return;
    }

    const nowDate =
      getLocalDate();

    const nowTime =
      getLocalTime();

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

    if (
      selectedDate ===
        nowDate &&
      nextTime &&
      nextTime < nowTime
    ) {
      setNextTime("");
    }

    setError("");
  };

  /*
  |--------------------------------------------------------------------------
  | Time Change
  |--------------------------------------------------------------------------
  */

  const handleTimeChange = (
    event
  ) => {
    const selectedTime =
      event.target.value;

    if (!selectedTime) {
      setNextTime("");
      setError("");

      return;
    }

    const nowDate =
      getLocalDate();

    const nowTime =
      getLocalTime();

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
  | Clear Optional Next Follow-up
  |--------------------------------------------------------------------------
  */

  const clearNextFollowup =
    () => {
      setNextAction("");
      setNextDate("");
      setNextTime("");

      if (
        [
          "High",
          "Medium",
          "Low",
        ].includes(
          followup?.priority
        )
      ) {
        setNextPriority(
          followup.priority
        );
      } else {
        setNextPriority(
          "Medium"
        );
      }

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
      | Follow-up ID
      |--------------------------------------------------------------------------
      */

      if (
        !followup?.id
      ) {
        setError(
          "Follow-up ID is missing. Refresh the page and try again."
        );

        return;
      }

      /*
      |--------------------------------------------------------------------------
      | Outcome
      |--------------------------------------------------------------------------
      */

      const cleanOutcome =
        outcome.trim();

      if (!cleanOutcome) {
        setError(
          "Outcome is required."
        );

        return;
      }

      if (
        cleanOutcome.length <
        2
      ) {
        setError(
          "Outcome must be at least 2 characters."
        );

        return;
      }

      if (
        cleanOutcome.length >
        500
      ) {
        setError(
          "Outcome cannot exceed 500 characters."
        );

        return;
      }

      /*
      |--------------------------------------------------------------------------
      | Notes
      |--------------------------------------------------------------------------
      */

      const cleanNotes =
        notes.trim();

      if (!cleanNotes) {
        setError(
          "Notes are required."
        );

        return;
      }

      if (
        cleanNotes.length <
        2
      ) {
        setError(
          "Notes must be at least 2 characters."
        );

        return;
      }

      if (
        cleanNotes.length >
        5000
      ) {
        setError(
          "Notes cannot exceed 5000 characters."
        );

        return;
      }

      /*
      |--------------------------------------------------------------------------
      | Optional Next Follow-up
      |--------------------------------------------------------------------------
      */

      const cleanNextAction =
        nextAction.trim();

      const hasAction =
        Boolean(
          cleanNextAction
        );

      const hasDate =
        Boolean(
          nextDate
        );

      const hasTime =
        Boolean(
          nextTime
        );

      const hasAnyNextFollowup =
        hasAction ||
        hasDate ||
        hasTime;

      let nextFollowUpAt;

      /*
       * If the user does not enter anything
       * for the next follow-up, completion
       * is allowed.
       */
      if (
        hasAnyNextFollowup
      ) {
        if (!hasAction) {
          setError(
            "Enter a next action or clear the next follow-up."
          );

          return;
        }

        if (
          cleanNextAction.length <
          2
        ) {
          setError(
            "Next action must be at least 2 characters."
          );

          return;
        }

        if (
          cleanNextAction.length >
          500
        ) {
          setError(
            "Next action cannot exceed 500 characters."
          );

          return;
        }

        if (!hasDate) {
          setError(
            "Select a next follow-up date or clear the next follow-up."
          );

          return;
        }

        if (!hasTime) {
          setError(
            "Select a next follow-up time or clear the next follow-up."
          );

          return;
        }

        /*
        |--------------------------------------------------------------------------
        | Construct Date / Time
        |--------------------------------------------------------------------------
        */

        const nextDateTime =
          new Date(
            `${nextDate}T${nextTime}:00`
          );

        if (
          Number.isNaN(
            nextDateTime.getTime()
          )
        ) {
          setError(
            "Enter a valid next follow-up date and time."
          );

          return;
        }

        /*
        |--------------------------------------------------------------------------
        | Match Server's 60 Second Tolerance
        |--------------------------------------------------------------------------
        */

        const minimumAllowed =
          Date.now() -
          60 * 1000;

        if (
          nextDateTime.getTime() <
          minimumAllowed
        ) {
          setError(
            "Next follow-up date and time cannot be in the past."
          );

          return;
        }

        nextFollowUpAt =
          nextDateTime.toISOString();
      }

      /*
      |--------------------------------------------------------------------------
      | Build Payload
      |--------------------------------------------------------------------------
      |
      | Important:
      |
      | When no next follow-up exists we
      | OMIT the optional properties.
      |
      | We do not send:
      |
      | nextAction: null
      | nextFollowUpAt: null
      |
      */

      const data = {
        outcome:
          cleanOutcome,

        notes:
          cleanNotes,
      };

      if (
        hasAnyNextFollowup
      ) {
        data.nextAction =
          cleanNextAction;

        data.nextFollowUpAt =
          nextFollowUpAt;

        data.nextPriority =
          nextPriority;
      }

      /*
      |--------------------------------------------------------------------------
      | Complete
      |--------------------------------------------------------------------------
      */

      try {
        await mutation.mutateAsync({
          followupId:
            followup.id,

          data,
        });

        onClose();
      } catch (
        requestError
      ) {
        const responseData =
          requestError
            ?.response
            ?.data;

        const errors =
          Array.isArray(
            responseData?.errors
          )
            ? responseData.errors
            : [];

        const validationMessage =
          errors
            .map(
              (item) => {
                if (
                  typeof item ===
                  "string"
                ) {
                  return item;
                }

                return (
                  item?.message ||
                  item?.msg ||
                  null
                );
              }
            )
            .filter(Boolean)
            .join(" ");

        setError(
          validationMessage ||
            responseData
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
      <section
        className="tl-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="complete-followup-title"
      >
        {/* Header */}

        <header className="modal-head">
          <div>
            <h2 id="complete-followup-title">
              Complete follow-up
            </h2>

            <p>
              Record the result and
              optionally schedule
              another follow-up.
            </p>
          </div>

          <button
            type="button"
            className="icon-control"
            disabled={
              mutation.isPending
            }
            onClick={
              onClose
            }
            aria-label="Close"
          >
            <X
              size={15}
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

          {/* Context */}

          <div className="activity-context">
            <small>
              Follow-up
            </small>

            <b>
              {followup.action ||
                "Follow-up"}
            </b>

            {followup.companyName && (
              <span>
                {
                  followup.companyName
                }
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
                  value={
                    outcome
                  }
                  disabled={
                    mutation.isPending
                  }
                  placeholder="What happened with this follow-up?"
                  onChange={(
                    event
                  ) => {
                    setOutcome(
                      event
                        .target
                        .value
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
                  value={
                    notes
                  }
                  disabled={
                    mutation.isPending
                  }
                  placeholder="Record the follow-up notes"
                  onChange={(
                    event
                  ) => {
                    setNotes(
                      event
                        .target
                        .value
                    );

                    setError("");
                  }}
                />
              </label>

              {/* Optional Next Follow-up */}

              <div className="full">
                <div
                  style={{
                    display:
                      "flex",

                    alignItems:
                      "center",

                    justifyContent:
                      "space-between",

                    gap:
                      "12px",
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

                  {(
                    nextAction ||
                    nextDate ||
                    nextTime
                  ) && (
                    <button
                      type="button"
                      className="tl-secondary"
                      disabled={
                        mutation.isPending
                      }
                      onClick={
                        clearNextFollowup
                      }
                    >
                      Clear
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
                  value={
                    nextAction
                  }
                  disabled={
                    mutation.isPending
                  }
                  placeholder="Optional — e.g. Call customer next week"
                  onChange={(
                    event
                  ) => {
                    setNextAction(
                      event
                        .target
                        .value
                    );

                    setError("");
                  }}
                />
              </label>

              {/* Next Date */}

              <label>
                Follow-up date

                <input
                  type="date"
                  min={today}
                  value={
                    nextDate
                  }
                  disabled={
                    mutation.isPending
                  }
                  onChange={
                    handleDateChange
                  }
                />
              </label>

              {/* Next Time */}

              <label>
                Follow-up time

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
                  disabled={
                    mutation.isPending ||
                    !nextDate
                  }
                  onChange={
                    handleTimeChange
                  }
                />
              </label>

              {/* Priority */}

              <label>
                Next priority

                <select
                  value={
                    nextPriority
                  }
                  disabled={
                    mutation.isPending
                  }
                  onChange={(
                    event
                  ) => {
                    setNextPriority(
                      event
                        .target
                        .value
                    );

                    setError("");
                  }}
                >
                  <option value="High">
                    High
                  </option>

                  <option value="Medium">
                    Medium
                  </option>

                  <option value="Low">
                    Low
                  </option>
                </select>
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
              : "Complete follow-up"}
          </button>
        </footer>
      </section>
    </div>
  );
};

export default CompleteFollowupModal;