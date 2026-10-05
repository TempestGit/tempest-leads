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
| Date To Local Input
|--------------------------------------------------------------------------
*/

const getDateInputValue =
  (
    value
  ) => {
    if (!value) {
      return "";
    }

    const date =
      new Date(
        value
      );

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return "";
    }

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
| Time To Local Input
|--------------------------------------------------------------------------
*/

const getTimeInputValue =
  (
    value
  ) => {
    if (!value) {
      return "";
    }

    const date =
      new Date(
        value
      );

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return "";
    }

    const hours =
      String(
        date.getHours()
      ).padStart(
        2,
        "0"
      );

    const minutes =
      String(
        date.getMinutes()
      ).padStart(
        2,
        "0"
      );

    return `${hours}:${minutes}`;
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
  | Reset
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (
      !open ||
      !followup
    ) {
      return;
    }

    const now =
      new Date();

    const currentDate =
      getLocalDate();

    const currentTime =
      getLocalTime();

    const existingDue =
      followup.dueAt
        ? new Date(
            followup.dueAt
          )
        : null;

    /*
    |--------------------------------------------------------------------------
    | Existing Follow-up Is Still Future
    |--------------------------------------------------------------------------
    |
    | Keep its existing date/time.
    |
    */

    if (
      existingDue &&
      !Number.isNaN(
        existingDue.getTime()
      ) &&
      existingDue.getTime() >=
        now.getTime()
    ) {
      setDate(
        getDateInputValue(
          followup.dueAt
        )
      );

      setTime(
        getTimeInputValue(
          followup.dueAt
        )
      );
    } else {
      /*
      |--------------------------------------------------------------------------
      | Existing Follow-up Is Past
      |--------------------------------------------------------------------------
      |
      | Do not put an overdue date/time
      | back into the form.
      |
      | Start from current date/time.
      |
      */

      setDate(
        currentDate
      );

      setTime(
        currentTime
      );
    }

    setReason("");

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
       * Allow empty value.
       */

      if (!selectedDate) {
        setDate("");

        setError("");

        return;
      }

      /*
       * Reject past dates.
       */

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
       * If user selects today and the
       * existing selected time has
       * already passed, automatically
       * move it to current time.
       */

      if (
        selectedDate ===
          nowDate &&
        (
          !time ||
          time <
            nowTime
        )
      ) {
        setTime(
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
       * Allow clearing the value.
       */

      if (!selectedTime) {
        setTime("");

        setError("");

        return;
      }

      /*
       * Past time is not allowed
       * when selected date is today.
       */

      if (
        date ===
          nowDate &&
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
      | Required Fields
      |--------------------------------------------------------------------------
      */

      if (
        !date ||
        !time ||
        !reason.trim()
      ) {
        setError(
          "New date, time and reason are required."
        );

        return;
      }

      /*
      |--------------------------------------------------------------------------
      | Prevent Past Date
      |--------------------------------------------------------------------------
      */

      if (
        date <
        getLocalDate()
      ) {
        setError(
          "Follow-up date cannot be in the past."
        );

        return;
      }

      /*
      |--------------------------------------------------------------------------
      | Create Local Date / Time
      |--------------------------------------------------------------------------
      */

      const dueAt =
        new Date(
          `${date}T${time}:00`
        );

      /*
      |--------------------------------------------------------------------------
      | Validate Date
      |--------------------------------------------------------------------------
      */

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
      | Reject Past Date / Time
      |--------------------------------------------------------------------------
      |
      | Allow the current minute.
      |
      | Example:
      | 11:58 selected
      | 11:58:30 submitted
      |
      | This should still be valid.
      |
      */

      const now =
        new Date();

      const minimumAllowed =
        now.getTime() -
        60 * 1000;

      if (
        dueAt.getTime() <
        minimumAllowed
      ) {
        setError(
          "Follow-up date and time cannot be in the past. Select the current time or a future time."
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
      <section className="tl-modal">
        {/* Header */}

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

          <div className="form-grid2">
            {/* New Date */}

            <label>
              New date *

              <input
                type="date"
                min={
                  today
                }
                value={
                  date
                }
                onChange={
                  handleDateChange
                }
              />
            </label>

            {/* New Time */}

            <label>
              New time *

              <input
                type="time"
                min={
                  date ===
                  today
                    ? currentTime
                    : undefined
                }
                value={
                  time
                }
                onChange={
                  handleTimeChange
                }
              />
            </label>

            {/* Reason */}

            <label className="full">
              Reason *

              <textarea
                rows="4"
                value={
                  reason
                }
                onChange={(
                  event
                ) => {
                  setReason(
                    event.target
                      .value
                  );

                  setError("");
                }}
              />
            </label>
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
              : "Reschedule"}
          </button>
        </footer>
      </section>
    </div>
  );
};

export default RescheduleFollowupModal;