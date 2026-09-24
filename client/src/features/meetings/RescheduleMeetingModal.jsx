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
| Reschedule Modal
|--------------------------------------------------------------------------
*/

const RescheduleMeetingModal = ({
  open,
  meeting,
  onClose,
}) => {
  const mutation =
    useRescheduleMeetingMutation();

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

    setReason("");

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
        !date ||
        !time
      ) {
        setError(
          "New date and time are required."
        );

        return;
      }

      if (
        !reason.trim()
      ) {
        setError(
          "Reason is required."
        );

        return;
      }

      const startsAt =
        new Date(
          `${date}T${time}:00`
        );

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
            "Unable to reschedule meeting."
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
              Reschedule meeting
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
              <label>
                New date *

                <input
                  type="date"
                  value={
                    date
                  }
                  onChange={(
                    event
                  ) =>
                    setDate(
                      event.target
                        .value
                    )
                  }
                />
              </label>

              <label>
                New time *

                <input
                  type="time"
                  value={
                    time
                  }
                  onChange={(
                    event
                  ) =>
                    setTime(
                      event.target
                        .value
                    )
                  }
                />
              </label>

              <label className="full">
                Reason *

                <textarea
                  rows="3"
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