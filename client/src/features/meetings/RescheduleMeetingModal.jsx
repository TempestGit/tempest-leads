import { useEffect, useState } from "react";
import { X } from "lucide-react";

import { useRescheduleMeetingMutation } from "./meetings.queries.js";

/*
|--------------------------------------------------------------------------
| Date / Time Helpers
|--------------------------------------------------------------------------
*/

const pad2 = (value) =>
  String(value).padStart(2, "0");

const getLocalDate = (value = new Date()) =>
  `${value.getFullYear()}-${pad2(
    value.getMonth() + 1
  )}-${pad2(value.getDate())}`;

const getLocalTime = (value = new Date()) =>
  `${pad2(value.getHours())}:${pad2(
    value.getMinutes()
  )}`;

/*
|--------------------------------------------------------------------------
| Safe Date
|--------------------------------------------------------------------------
*/

const toValidDate = (value) => {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return null;
  }

  return date;
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

  const [date, setDate] =
    useState("");

  const [time, setTime] =
    useState("");

  const [reason, setReason] =
    useState("");

  const [error, setError] =
    useState("");

  /*
  |--------------------------------------------------------------------------
  | Reset Every Time Modal Opens
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (!open) {
      return;
    }

    /*
     * Start with the meeting's existing
     * scheduled date/time when available.
     *
     * We do not invent a hidden time.
     */

    const existingStart =
      toValidDate(
        meeting?.startsAt
      );

    if (existingStart) {
      setDate(
        getLocalDate(
          existingStart
        )
      );

      setTime(
        getLocalTime(
          existingStart
        )
      );
    } else {
      setDate("");
      setTime("");
    }

    setReason("");
    setError("");
  }, [
    open,
    meeting?.id,
    meeting?.startsAt,
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
        "Meeting date cannot be in the past."
      );

      return;
    }

    setDate(
      selectedDate
    );

    /*
     * If user changes the meeting back
     * to today and the selected time has
     * already passed, clear the time.
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
    | Date
    |--------------------------------------------------------------------------
    */

    if (!date) {
      setError(
        "Select a new meeting date."
      );

      return;
    }

    /*
    |--------------------------------------------------------------------------
    | Time
    |--------------------------------------------------------------------------
    */

    if (!time) {
      setError(
        "Select a new meeting time."
      );

      return;
    }

    /*
    |--------------------------------------------------------------------------
    | Reason
    |--------------------------------------------------------------------------
    |
    | Backend requires:
    |
    | reason:
    |   string
    |   min 2
    |   max 1000
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
      cleanReason.length < 2
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
    | Construct New Start
    |--------------------------------------------------------------------------
    */

    const newStart =
      new Date(
        `${date}T${time}:00`
      );

    if (
      Number.isNaN(
        newStart.getTime()
      )
    ) {
      setError(
        "Enter a valid meeting date and time."
      );

      return;
    }

    /*
    |--------------------------------------------------------------------------
    | Exact Future Validation
    |--------------------------------------------------------------------------
    */

    if (
      newStart.getTime() <=
      Date.now()
    ) {
      setError(
        "Meeting date and time must be in the future."
      );

      return;
    }

    /*
    |--------------------------------------------------------------------------
    | Preserve Existing Meeting Duration
    |--------------------------------------------------------------------------
    |
    | If the existing meeting has a valid
    | startsAt and endsAt, preserve the
    | same duration when rescheduling.
    |
    | If there is no valid end time,
    | endsAt remains null because the
    | backend allows it.
    |
    */

    const existingStart =
      toValidDate(
        meeting.startsAt
      );

    const existingEnd =
      toValidDate(
        meeting.endsAt
      );

    let newEnd = null;

    if (
      existingStart &&
      existingEnd &&
      existingEnd.getTime() >
        existingStart.getTime()
    ) {
      const duration =
        existingEnd.getTime() -
        existingStart.getTime();

      newEnd =
        new Date(
          newStart.getTime() +
            duration
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Reschedule Meeting
    |--------------------------------------------------------------------------
    |
    | meetings.api.js expects:
    |
    | {
    |   meetingId,
    |   data
    | }
    |
    | Backend expects data:
    |
    | {
    |   startsAt,
    |   endsAt?,
    |   reason
    | }
    |
    */

    try {
      await mutation.mutateAsync({
        meetingId:
          meeting.id,

        data: {
          startsAt:
            newStart.toISOString(),

          endsAt:
            newEnd
              ? newEnd.toISOString()
              : null,

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

      /*
       * Support a few common backend
       * validation-error response shapes.
       */
      const arrayErrors =
        Array.isArray(
          responseData?.errors
        )
          ? responseData.errors
          : [];

      const validationMessage =
        arrayErrors
          .map((item) => {
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
          })
          .filter(Boolean)
          .join(" ");

      setError(
        validationMessage ||
          responseData
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
        aria-labelledby="reschedule-meeting-title"
      >
        <header className="modal-head">
          <div>
            <h2 id="reschedule-meeting-title">
              Reschedule meeting
            </h2>

            <p>
              Choose a new date
              and time for this
              meeting.
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
                {
                  meeting.companyName
                }
              </span>
            )}
          </div>

          <div className="form-section">
            <div className="form-grid2">

              {/* New Date */}

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
                />
              </label>

              {/* New Time */}

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
                Reason *

                <textarea
                  rows="4"
                  maxLength={
                    1000
                  }
                  value={
                    reason
                  }
                  disabled={
                    mutation.isPending
                  }
                  placeholder="Why is this meeting being rescheduled?"
                  onChange={(
                    event
                  ) => {
                    setReason(
                      event
                        .target
                        .value
                    );

                    setError(
                      ""
                    );
                  }}
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
              : "Reschedule meeting"}
          </button>
        </footer>
      </section>
    </div>
  );
};

export default RescheduleMeetingModal;