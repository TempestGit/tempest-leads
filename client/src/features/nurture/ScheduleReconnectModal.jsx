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
| Resolve Lead ID
|--------------------------------------------------------------------------
|
| Nurture routes are lead-based:
|
| /nurture/:leadId
| /nurture/:leadId/reconnect
|
| Depending on the list response, the lead
| identifier may be exposed as leadId or id.
|
*/

const getLeadId = (
  record
) => {
  if (!record) {
    return null;
  }

  const value =
    record.leadId ??
    record.id ??
    null;

  const parsed =
    Number(value);

  if (
    !Number.isInteger(
      parsed
    ) ||
    parsed <= 0
  ) {
    return null;
  }

  return parsed;
};

/*
|--------------------------------------------------------------------------
| Schedule Reconnect Modal
|--------------------------------------------------------------------------
*/

const ScheduleReconnectModal = ({
  open,
  nurture = null,
  onClose,
}) => {
  const mutation =
    useScheduleReconnectMutation();

  /*
  |--------------------------------------------------------------------------
  | Nurture Records
  |--------------------------------------------------------------------------
  |
  | Keep limit: 100 for Batch 2.
  |
  | Batch 3 will handle the global
  | pagination/dropdown ceiling.
  |
  */

  const nurtureParams =
    useMemo(
      () => ({
        page: 1,
        limit: 100,
      }),
      []
    );

  const nurtureQuery =
    useNurtureQuery(
      nurtureParams
    );

  const nurtureRecords =
    nurtureQuery.data
      ?.data
      ?.nurture ||
    nurtureQuery.data
      ?.data
      ?.items ||
    nurtureQuery.data
      ?.data
      ?.records ||
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
    date,
    setDate,
  ] = useState("");

  const [
    time,
    setTime,
  ] = useState("");

  const [
    action,
    setAction,
  ] = useState(
    "Reconnect"
  );

  const [
    priority,
    setPriority,
  ] = useState(
    "Medium"
  );

  const [
    notes,
    setNotes,
  ] = useState("");

  const [
    error,
    setError,
  ] = useState("");

  /*
  |--------------------------------------------------------------------------
  | Reset When Modal Opens
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (!open) {
      return;
    }

    /*
     * Suggest approximately
     * 30 days from now.
     */

    const suggested =
      new Date();

    suggested.setDate(
      suggested.getDate() +
        30
    );

    /*
     * Visible default time.
     */

    suggested.setHours(
      10,
      0,
      0,
      0
    );

    const initialLeadId =
      getLeadId(
        nurture
      );

    setSelectedLeadId(
      initialLeadId
        ? String(
            initialLeadId
          )
        : ""
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

    setAction(
      "Reconnect"
    );

    setPriority(
      "Medium"
    );

    setNotes("");

    setError("");
  }, [
    open,
    nurture,
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
  | Resolve Nurture Record
  |--------------------------------------------------------------------------
  */

  const selectedLeadIdNumber =
    Number(
      selectedLeadId
    );

  const resolvedNurture =
    nurture ||
    nurtureRecords.find(
      (item) =>
        getLeadId(item) ===
        selectedLeadIdNumber
    ) ||
    null;

  /*
  |--------------------------------------------------------------------------
  | Resolve Final Lead ID
  |--------------------------------------------------------------------------
  */

  const resolvedLeadId =
    getLeadId(
      resolvedNurture
    ) ||
    (
      Number.isInteger(
        selectedLeadIdNumber
      ) &&
      selectedLeadIdNumber > 0
        ? selectedLeadIdNumber
        : null
    );

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

    const now =
      new Date();

    const nowDate =
      getLocalDate(
        now
      );

    const nowTime =
      getLocalTime(
        now
      );

    /*
     * Past dates are not allowed.
     */

    if (
      selectedDate <
      nowDate
    ) {
      setDate("");
      setTime("");

      setError(
        "Reconnect date cannot be in the past."
      );

      return;
    }

    setDate(
      selectedDate
    );

    /*
     * If today is selected and the
     * previously selected time is
     * already past, clear it.
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

    const now =
      new Date();

    const nowDate =
      getLocalDate(
        now
      );

    const nowTime =
      getLocalTime(
        now
      );

    /*
     * When today is selected,
     * past times are not allowed.
     */

    if (
      date ===
        nowDate &&
      selectedTime <
        nowTime
    ) {
      setTime("");

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
      | Lead
      |--------------------------------------------------------------------------
      */

      if (
        !resolvedLeadId
      ) {
        setError(
          "Select a nurture lead."
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
          "Reconnect date is required."
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
          "Reconnect time is required."
        );

        return;
      }

      /*
      |--------------------------------------------------------------------------
      | Action
      |--------------------------------------------------------------------------
      */

      const cleanAction =
        action.trim();

      if (
        cleanAction.length <
        2
      ) {
        setError(
          "Reconnect action is required."
        );

        return;
      }

      if (
        cleanAction.length >
        500
      ) {
        setError(
          "Reconnect action cannot exceed 500 characters."
        );

        return;
      }

      /*
      |--------------------------------------------------------------------------
      | Priority
      |--------------------------------------------------------------------------
      */

      const allowedPriorities = [
        "High",
        "Medium",
        "Low",
      ];

      if (
        !allowedPriorities.includes(
          priority
        )
      ) {
        setError(
          "Select a valid priority."
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
      | Construct Timestamp
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
          "Enter a valid reconnect date and time."
        );

        return;
      }

      /*
      |--------------------------------------------------------------------------
      | Present / Future Validation
      |--------------------------------------------------------------------------
      |
      | Same 60-second tolerance as
      | the backend schema.
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
          "Reconnect date and time cannot be in the past."
        );

        return;
      }

      /*
      |--------------------------------------------------------------------------
      | Request
      |--------------------------------------------------------------------------
      |
      | nurture.api.js:
      |
      | scheduleReconnectRequest({
      |   leadId,
      |   data
      | })
      |
      */

      try {
        await mutation.mutateAsync({
          leadId:
            resolvedLeadId,

          data: {
            action:
              cleanAction,

            dueAt:
              dueAt.toISOString(),

            priority,

            notes:
              cleanNotes ||
              null,
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
        aria-labelledby="schedule-reconnect-title"
      >
        {/* Header */}

        <header className="modal-head">
          <div>
            <h2 id="schedule-reconnect-title">
              Schedule reconnect
            </h2>

            <p>
              Choose when this
              nurture lead should
              return to your
              attention.
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
            <div className="error-box mb-2">
              {error}
            </div>
          )}

          <div className="form-section">
            <div className="form-grid2">

              {/* Nurture Lead */}

              {!nurture ? (
                <label className="full">
                  Nurture lead *

                  <select
                    value={
                      selectedLeadId
                    }
                    disabled={
                      nurtureQuery.isLoading ||
                      mutation.isPending
                    }
                    onChange={(
                      event
                    ) => {
                      setSelectedLeadId(
                        event
                          .target
                          .value
                      );

                      setError("");
                    }}
                  >
                    <option value="">
                      {nurtureQuery.isLoading
                        ? "Loading nurture leads..."
                        : "Select nurture lead"}
                    </option>

                    {nurtureRecords.map(
                      (item) => {
                        const itemLeadId =
                          getLeadId(
                            item
                          );

                        if (
                          !itemLeadId
                        ) {
                          return null;
                        }

                        return (
                          <option
                            key={
                              itemLeadId
                            }
                            value={
                              itemLeadId
                            }
                          >
                            {item.companyName ||
                              item.leadName ||
                              item.name ||
                              `Lead #${itemLeadId}`}

                            {item.leadCode
                              ? ` · ${item.leadCode}`
                              : ""}
                          </option>
                        );
                      }
                    )}
                  </select>
                </label>
              ) : (
                <div className="activity-context full">
                  <small>
                    Nurture lead
                  </small>

                  <b>
                    {nurture.companyName ||
                      nurture.leadName ||
                      nurture.name ||
                      (
                        resolvedLeadId
                          ? `Lead #${resolvedLeadId}`
                          : "Nurture lead"
                      )}

                    {nurture.leadCode
                      ? ` · ${nurture.leadCode}`
                      : ""}
                  </b>
                </div>
              )}

              {/* Action */}

              <label className="full">
                Reconnect action *

                <input
                  type="text"
                  maxLength={500}
                  value={action}
                  disabled={
                    mutation.isPending
                  }
                  placeholder="Reconnect"
                  onChange={(
                    event
                  ) => {
                    setAction(
                      event
                        .target
                        .value
                    );

                    setError("");
                  }}
                />
              </label>

              {/* Date */}

              <label>
                Reconnect date *

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
                  autoFocus={
                    Boolean(
                      nurture
                    )
                  }
                />
              </label>

              {/* Time */}

              <label>
                Reconnect time *

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

              {/* Priority */}

              <label>
                Priority *

                <select
                  value={priority}
                  disabled={
                    mutation.isPending
                  }
                  onChange={(
                    event
                  ) => {
                    setPriority(
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

              {/* Notes */}

              <label className="full">
                Notes

                <textarea
                  rows="4"
                  maxLength={5000}
                  value={notes}
                  disabled={
                    mutation.isPending
                  }
                  placeholder="Optional reconnect context"
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
              : "Schedule reconnect"}
          </button>
        </footer>
      </section>
    </div>
  );
};

export default ScheduleReconnectModal;