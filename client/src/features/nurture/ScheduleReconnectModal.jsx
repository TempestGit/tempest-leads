import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  X,
} from "lucide-react";

import {
  useNurtureQuery,
  useScheduleReconnectMutation,
} from "./nurture.queries.js";

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
| Default Reconnect Date
|--------------------------------------------------------------------------
*/

const getDefaultDate =
  () => {
    const date =
      new Date();

    date.setDate(
      date.getDate() +
        30
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
| Modal
|--------------------------------------------------------------------------
*/

const ScheduleReconnectModal = ({
  open,
  lead = null,
  onClose,
}) => {
  const mutation =
    useScheduleReconnectMutation();

  /*
  |--------------------------------------------------------------------------
  | Available Nurture Leads
  |--------------------------------------------------------------------------
  */

  const params =
    useMemo(
      () => ({
        page: 1,
        limit: 100,
      }),
      []
    );

  const nurtureQuery =
    useNurtureQuery(
      params
    );

  const nurture =
    nurtureQuery.data
      ?.data
      ?.nurture ||
    [];

  /*
  |--------------------------------------------------------------------------
  | State
  |--------------------------------------------------------------------------
  */

  const [
    selectedLeadId,
    setSelectedLeadId,
  ] = useState("");

  const [
    action,
    setAction,
  ] = useState(
    "Reconnect"
  );

  const [
    date,
    setDate,
  ] = useState(
    getDefaultDate()
  );

  const [
    time,
    setTime,
  ] = useState(
    "10:00"
  );

  const [
    priority,
    setPriority,
  ] = useState(
    "Medium"
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

    setSelectedLeadId(
      lead?.leadId
        ? String(
            lead.leadId
          )
        : lead?.id
          ? String(
              lead.id
            )
          : ""
    );

    setAction(
      "Reconnect"
    );

    /*
     * Keep existing behavior:
     * default reconnect date is
     * 30 days from today.
     */

    setDate(
      getDefaultDate()
    );

    /*
     * Keep default future-date
     * reconnect time as 10:00.
     */

    setTime(
      "10:00"
    );

    setPriority(
      lead?.priority ||
        "Medium"
    );

    setError("");
  }, [
    open,
    lead,
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

    const handler =
      (
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

    return () =>
      window.removeEventListener(
        "keydown",
        handler
      );
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

  if (!open) {
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
  | Resolve Lead
  |--------------------------------------------------------------------------
  */

  const resolvedLead =
    lead ||
    nurture.find(
      (
        item
      ) =>
        Number(
          item.leadId
        ) ===
        Number(
          selectedLeadId
        )
    ) ||
    null;

  const resolvedLeadId =
    resolvedLead?.leadId ||
    resolvedLead?.id ||
    null;

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
       * Reject past date.
       */

      if (
        selectedDate <
        nowDate
      ) {
        setError(
          "Reconnect date cannot be in the past."
        );

        return;
      }

      setDate(
        selectedDate
      );

      /*
       * If the user selects today
       * and the selected time has
       * already passed, move it
       * automatically to current time.
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
       * Past time is blocked only
       * when today's date is selected.
       */

      if (
        date ===
          nowDate &&
        selectedTime <
          nowTime
      ) {
        setError(
          "Reconnect time cannot be in the past."
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
      | Related Lead
      |--------------------------------------------------------------------------
      */

      if (
        !resolvedLeadId
      ) {
        setError(
          "Related lead is required."
        );

        return;
      }

      /*
      |--------------------------------------------------------------------------
      | Action
      |--------------------------------------------------------------------------
      */

      if (
        !action.trim()
      ) {
        setError(
          "Reconnect action is required."
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
          "Reconnect date and time are required."
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
          "Reconnect date cannot be in the past."
        );

        return;
      }

      /*
      |--------------------------------------------------------------------------
      | Build Reconnect Date / Time
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
          "Enter a valid reconnect date and time."
        );

        return;
      }

      /*
      |--------------------------------------------------------------------------
      | Prevent Past Date / Time
      |--------------------------------------------------------------------------
      |
      | Browser min attributes protect
      | the normal UI flow.
      |
      | This additional validation
      | protects submission too.
      |
      | Current minute receives a
      | 60-second tolerance.
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
          "Reconnect date and time cannot be in the past. Select the current time or a future time."
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
          leadId:
            Number(
              resolvedLeadId
            ),

          data: {
            action:
              action.trim(),

            dueAt:
              dueAt.toISOString(),

            priority,

            notes:
              null,
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
            "Unable to schedule reconnect."
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
              Schedule reconnect
            </h2>

            <p>
              Create the next
              touchpoint for this
              nurture opportunity.
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
              {/* Related Lead */}

              {!lead ? (
                <label className="full">
                  Related lead *

                  <select
                    value={
                      selectedLeadId
                    }
                    disabled={
                      nurtureQuery.isLoading
                    }
                    onChange={(
                      event
                    ) => {
                      setSelectedLeadId(
                        event.target
                          .value
                      );

                      setError("");
                    }}
                  >
                    <option value="">
                      {nurtureQuery.isLoading
                        ? "Loading..."
                        : "Select nurture lead"}
                    </option>

                    {nurture.map(
                      (
                        item
                      ) => (
                        <option
                          key={
                            item.leadId
                          }
                          value={
                            item.leadId
                          }
                        >
                          {
                            item.companyName
                          }

                          {" · "}

                          {
                            item.leadCode
                          }
                        </option>
                      )
                    )}
                  </select>
                </label>
              ) : (
                <div className="activity-context full">
                  <small>
                    Related lead
                  </small>

                  <b>
                    {
                      lead.companyName
                    }

                    {" · "}

                    {
                      lead.leadCode
                    }
                  </b>
                </div>
              )}

              {/* Action */}

              <label>
                Action *

                <input
                  type="text"
                  value={
                    action
                  }
                  onChange={(
                    event
                  ) => {
                    setAction(
                      event.target
                        .value
                    );

                    setError("");
                  }}
                />
              </label>

              {/* Date */}

              <label>
                Date *

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

              {/* Time */}

              <label>
                Time *

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

              {/* Priority */}

              <label>
                Priority

                <select
                  value={
                    priority
                  }
                  onChange={(
                    event
                  ) => {
                    setPriority(
                      event.target
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
              ? "Scheduling..."
              : "Schedule"}
          </button>
        </footer>
      </section>
    </div>
  );
};

export default ScheduleReconnectModal;