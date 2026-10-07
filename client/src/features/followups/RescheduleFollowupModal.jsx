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
| Convert Timestamp To Local Inputs
|--------------------------------------------------------------------------
*/

const toLocalInputs = (
  value
) => {
  if (!value) {
    return {
      date: "",
      time: "",
    };
  }

  const parsed =
    new Date(value);

  if (
    Number.isNaN(
      parsed.getTime()
    )
  ) {
    return {
      date: "",
      time: "",
    };
  }

  return {
    date:
      getLocalDate(
        parsed
      ),

    time:
      getLocalTime(
        parsed
      ),
  };
};

/*
|--------------------------------------------------------------------------
| Reschedule Follow-up Modal
|--------------------------------------------------------------------------
*/

const RescheduleFollowupModal = ({
  open,
  followup,
  onClose,
}) => {
  const mutation =
    useRescheduleFollowupMutation();

  /*
  |--------------------------------------------------------------------------
  | State
  |--------------------------------------------------------------------------
  */

  const [
    date,
    setDate,
  ] = useState("");

  const [
    time,
    setTime,
  ] = useState("");

  const [
    reason,
    setReason,
  ] = useState("");

  const [
    error,
    setError,
  ] = useState("");

  /*
  |--------------------------------------------------------------------------
  | Populate Every Time Modal Opens
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
     * Follow-up API exposes the
     * scheduled timestamp as dueAt.
     */
    const existingValue =
      followup.dueAt ||
      null;

    const existing =
      toLocalInputs(
        existingValue
      );

    const existingDateTime =
      existingValue
        ? new Date(
            existingValue
          )
        : null;

    /*
     * If the existing follow-up is
     * overdue, its current timestamp
     * cannot be reused.
     *
     * Suggest 30 minutes from now.
     */
    if (
      !existingDateTime ||
      Number.isNaN(
        existingDateTime.getTime()
      ) ||
      existingDateTime.getTime() <=
        Date.now()
    ) {
      const suggested =
        new Date(
          Date.now() +
            30 *
              60 *
              1000
        );

      setDate(
        getLocalDate(
          suggested
        )
      );

      setTime(
        getLocalTime(
          suggested
        )
      );
    } else {
      setDate(
        existing.date
      );

      setTime(
        existing.time
      );
    }

    /*
     * Reason must never carry over
     * from a previous modal session.
     */
    setReason("");
    setError("");
  }, [
    open,
    followup?.id,
    followup?.dueAt,
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
  | Not Open
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
      setDate("");
      setTime("");
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
        "Follow-up date cannot be in the past."
      );

      return;
    }

    setDate(
      selectedDate
    );

    /*
     * If the user moves back to today
     * while a past time is selected,
     * clear the time.
     */
    if (
      selectedDate ===
        nowDate &&
      time &&
      time < nowTime
    ) {
      setTime("");
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
      setTime("");
      setError("");

      return;
    }

    const nowDate =
      getLocalDate();

    const nowTime =
      getLocalTime();

    if (
      date === nowDate &&
      selectedTime <
        nowTime
    ) {
      setError(
        "Follow-up time cannot be in the past."
      );

      return;
    }

    setTime(
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
      | Date / Time
      |--------------------------------------------------------------------------
      */

      if (
        !date ||
        !time
      ) {
        setError(
          "Follow-up date and time are required."
        );

        return;
      }

      /*
      |--------------------------------------------------------------------------
      | Reason
      |--------------------------------------------------------------------------
      |
      | Backend:
      | required
      | min 2
      | max 1000
      |
      */

      const cleanReason =
        reason.trim();

      if (!cleanReason) {
        setError(
          "Reschedule reason is required."
        );

        return;
      }

      if (
        cleanReason.length <
        2
      ) {
        setError(
          "Reschedule reason must be at least 2 characters."
        );

        return;
      }

      if (
        cleanReason.length >
        1000
      ) {
        setError(
          "Reschedule reason cannot exceed 1000 characters."
        );

        return;
      }

      /*
      |--------------------------------------------------------------------------
      | Exact Local Timestamp
      |--------------------------------------------------------------------------
      */

      const dueAt =
        new Date(
          `${date}T${time}:00`
        );

      if (
        Number.isNaN(
          dueAt.getTime()
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
      |
      | Match backend's 60-second
      | tolerance.
      |
      */

      const minimumAllowed =
        Date.now() -
        60 * 1000;

      if (
        dueAt.getTime() <
        minimumAllowed
      ) {
        setError(
          "Follow-up date and time cannot be in the past."
        );

        return;
      }

      /*
      |--------------------------------------------------------------------------
      | Prevent No-op Reschedule
      |--------------------------------------------------------------------------
      */

      if (
        followup.dueAt
      ) {
        const oldDate =
          new Date(
            followup.dueAt
          );

        if (
          !Number.isNaN(
            oldDate.getTime()
          )
        ) {
          /*
           * HTML time inputs have
           * minute precision.
           */
          const oldMinute =
            Math.floor(
              oldDate.getTime() /
                60000
            );

          const newMinute =
            Math.floor(
              dueAt.getTime() /
                60000
            );

          if (
            oldMinute ===
            newMinute
          ) {
            setError(
              "Choose a different date or time to reschedule the follow-up."
            );

            return;
          }
        }
      }

      /*
      |--------------------------------------------------------------------------
      | Reschedule
      |--------------------------------------------------------------------------
      |
      | followups.api.js expects:
      |
      | {
      |   followupId,
      |   data
      | }
      |
      | Backend schema expects:
      |
      | {
      |   dueAt,
      |   reason,
      |   action?,
      |   priority?
      | }
      |
      | We intentionally omit action and
      | priority here. The service falls
      | back to the existing follow-up's
      | values.
      |
      */

      try {
        await mutation.mutateAsync({
          followupId:
            followup.id,

          data: {
            dueAt:
              dueAt.toISOString(),

            reason:
              cleanReason,
          },
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
            "Unable to reschedule follow-up."
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
        aria-labelledby="reschedule-followup-title"
      >
        {/* Header */}

        <header className="modal-head">
          <div>
            <h2 id="reschedule-followup-title">
              Reschedule follow-up
            </h2>

            <p>
              Choose a new date and
              time for this follow-up.
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

          {/* Follow-up Context */}

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

                {followup.leadCode
                  ? ` · ${followup.leadCode}`
                  : ""}
              </span>
            )}
          </div>

          <div className="form-section">
            <div className="form-grid2">

              {/* Date */}

              <label>
                New date *

                <input
                  type="date"
                  min={today}
                  value={date}
                  disabled={
                    mutation.isPending
                  }
                  onChange={
                    handleDateChange
                  }
                  autoFocus
                />
              </label>

              {/* Time */}

              <label>
                New time *

                <input
                  type="time"
                  min={
                    date === today
                      ? currentTime
                      : undefined
                  }
                  value={time}
                  disabled={
                    mutation.isPending ||
                    !date
                  }
                  onChange={
                    handleTimeChange
                  }
                />
              </label>

              {/* Reason */}

              <label className="full">
                Reschedule reason *

                <textarea
                  rows="3"
                  maxLength={1000}
                  value={reason}
                  disabled={
                    mutation.isPending
                  }
                  placeholder="Why is this follow-up being rescheduled?"
                  onChange={(
                    event
                  ) => {
                    setReason(
                      event
                        .target
                        .value
                    );

                    setError("");
                  }}
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
              ? "Rescheduling..."
              : "Reschedule follow-up"}
          </button>
        </footer>
      </section>
    </div>
  );
};

export default RescheduleFollowupModal;