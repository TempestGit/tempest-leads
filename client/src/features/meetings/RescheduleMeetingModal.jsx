import {
  useEffect,
  useState,
} from "react";

import {
  X,
} from "lucide-react";

import {
  useRescheduleMeetingMutation,
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
| Local Time
|--------------------------------------------------------------------------
*/

const getLocalTime =
  () => {
    const date =
      new Date();

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
| Date Input
|--------------------------------------------------------------------------
*/

const getDateInput = (
  value
) => {
  if (!value) {
    return "";
  }

  const date =
    new Date(value);

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
| Time Input
|--------------------------------------------------------------------------
*/

const getTimeInput = (
  value
) => {
  if (!value) {
    return "";
  }

  const date =
    new Date(value);

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
| Reschedule Meeting Modal
|--------------------------------------------------------------------------
*/

const RescheduleMeetingModal = ({
  open,
  meeting,
  onClose,
}) => {
  const mutation =
    useRescheduleMeetingMutation();

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
      !meeting
    ) {
      return;
    }

    const now =
      new Date();

    const currentDate =
      getLocalDate();

    const currentTime =
      getLocalTime();

    const existingStart =
      meeting.startsAt
        ? new Date(
            meeting.startsAt
          )
        : null;

    /*
    |--------------------------------------------------------------------------
    | Existing Meeting Is Still Future
    |--------------------------------------------------------------------------
    |
    | Keep the existing meeting date/time.
    |
    */

    if (
      existingStart &&
      !Number.isNaN(
        existingStart.getTime()
      ) &&
      existingStart.getTime() >=
        now.getTime()
    ) {
      setDate(
        getDateInput(
          meeting.startsAt
        )
      );

      setTime(
        getTimeInput(
          meeting.startsAt
        )
      );
    } else {
      /*
      |--------------------------------------------------------------------------
      | Existing Meeting Is Past
      |--------------------------------------------------------------------------
      |
      | Do not preload an old meeting
      | date/time into the reschedule form.
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
       * Allow clearing.
       */

      if (!selectedDate) {
        setDate("");

        setError("");

        return;
      }

      /*
       * Prevent past dates.
       */

      if (
        selectedDate <
        nowDate
      ) {
        setError(
          "Meeting date cannot be in the past."
        );

        return;
      }

      setDate(
        selectedDate
      );

      /*
       * If the user changes the date
       * back to today and the selected
       * time has already passed,
       * automatically update it to
       * current time.
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
       * Allow clearing.
       */

      if (!selectedTime) {
        setTime("");

        setError("");

        return;
      }

      /*
       * When today is selected,
       * past time is not allowed.
       */

      if (
        date ===
          nowDate &&
        selectedTime <
          nowTime
      ) {
        setError(
          "Meeting time cannot be in the past."
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
      | Date / Time
      |--------------------------------------------------------------------------
      */

      if (
        !date ||
        !time
      ) {
        setError(
          "New date and time are required."
        );

        return;
      }

      /*
      |--------------------------------------------------------------------------
      | Reason
      |--------------------------------------------------------------------------
      */

      if (
        !reason.trim()
      ) {
        setError(
          "Reason is required."
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
          "Meeting date cannot be in the past."
        );

        return;
      }

      /*
      |--------------------------------------------------------------------------
      | Build Start Date / Time
      |--------------------------------------------------------------------------
      */

      const startsAt =
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
          startsAt.getTime()
        )
      ) {
        setError(
          "Enter a valid date and time."
        );

        return;
      }

      /*
      |--------------------------------------------------------------------------
      | Prevent Past Date / Time
      |--------------------------------------------------------------------------
      |
      | Allow the current minute.
      |
      | Example:
      |
      | Selected: 11:58
      | Submitted: 11:58:30
      |
      | This should remain valid.
      |
      */

      const now =
        new Date();

      const minimumAllowed =
        now.getTime() -
        60 * 1000;

      if (
        startsAt.getTime() <
        minimumAllowed
      ) {
        setError(
          "Meeting date and time cannot be in the past. Select the current time or a future time."
        );

        return;
      }

      /*
      |--------------------------------------------------------------------------
      | Default One-hour Duration
      |--------------------------------------------------------------------------
      */

      const endsAt =
        new Date(
          startsAt.getTime() +
            60 *
              60 *
              1000
        );

      /*
      |--------------------------------------------------------------------------
      | Safety Check
      |--------------------------------------------------------------------------
      */

      if (
        endsAt <=
        startsAt
      ) {
        setError(
          "Meeting end time must be after the start time."
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
            startsAt:
              startsAt.toISOString(),

            endsAt:
              endsAt.toISOString(),

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
            "Unable to reschedule meeting."
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
              Reschedule meeting
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
                  rows="3"
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
                  autoFocus
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
              : "Reschedule"}
          </button>
        </footer>
      </section>
    </div>
  );
};

export default RescheduleMeetingModal;