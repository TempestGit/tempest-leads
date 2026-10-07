import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  X,
} from "lucide-react";

import {
  useLeadsQuery,
} from "../leads/leads.queries.js";

import {
  useCreateFollowupMutation,
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
| Schedule Follow-up Modal
|--------------------------------------------------------------------------
*/

const ScheduleFollowupModal = ({
  open,
  lead = null,
  onClose,
}) => {
  const mutation =
    useCreateFollowupMutation();

  /*
  |--------------------------------------------------------------------------
  | Leads
  |--------------------------------------------------------------------------
  */

  const params =
    useMemo(
      () => ({
        page: 1,
        limit: 100,
        sort: "createdAt",
        direction: "desc",
      }),
      []
    );

  const leadsQuery =
    useLeadsQuery(
      params
    );

  const leads =
    leadsQuery.data
      ?.data
      ?.leads || [];

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
  | Reset Every Time Modal Opens
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (!open) {
      return;
    }

    const now =
      new Date();

    setSelectedLeadId(
      lead?.id
        ? String(lead.id)
        : ""
    );

    setAction(
      lead?.nextAction ||
        ""
    );

    /*
     * Use the actual current date/time.
     *
     * Nothing is silently scheduled
     * for 10 AM.
     */
    setDate(
      getLocalDate(now)
    );

    setTime(
      getLocalTime(now)
    );

    /*
     * Follow-up priority is independent
     * from lead priority unless the lead
     * already has a compatible value.
     */
    if (
      [
        "High",
        "Medium",
        "Low",
      ].includes(
        lead?.priority
      )
    ) {
      setPriority(
        lead.priority
      );
    } else {
      setPriority(
        "Medium"
      );
    }

    setNotes("");
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
    leads.find(
      (item) =>
        Number(
          item.id
        ) ===
        Number(
          selectedLeadId
        )
    ) ||
    null;

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
     * If user moves the date back to
     * today and the selected time has
     * already passed, clear the time.
     *
     * Do not manufacture a hidden
     * replacement time.
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
      | Related Lead
      |--------------------------------------------------------------------------
      */

      if (
        !resolvedLead?.id
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
      |
      | Backend:
      | min 2
      | max 500
      |
      */

      const cleanAction =
        action.trim();

      if (!cleanAction) {
        setError(
          "Action is required."
        );

        return;
      }

      if (
        cleanAction.length <
        2
      ) {
        setError(
          "Action must be at least 2 characters."
        );

        return;
      }

      if (
        cleanAction.length >
        500
      ) {
        setError(
          "Action cannot exceed 500 characters."
        );

        return;
      }

      /*
      |--------------------------------------------------------------------------
      | Date / Time
      |--------------------------------------------------------------------------
      */

      if (!date) {
        setError(
          "Follow-up date is required."
        );

        return;
      }

      if (!time) {
        setError(
          "Follow-up time is required."
        );

        return;
      }

      /*
      |--------------------------------------------------------------------------
      | Construct Local Date / Time
      |--------------------------------------------------------------------------
      */

      const dueDate =
        new Date(
          `${date}T${time}:00`
        );

      if (
        Number.isNaN(
          dueDate.getTime()
        )
      ) {
        setError(
          "Enter a valid follow-up date and time."
        );

        return;
      }

      /*
      |--------------------------------------------------------------------------
      | Current / Future Validation
      |--------------------------------------------------------------------------
      |
      | Backend allows a 60-second
      | tolerance because browser time
      | fields operate at minute precision.
      |
      */

      const minimumAllowed =
        Date.now() -
        60 * 1000;

      if (
        dueDate.getTime() <
        minimumAllowed
      ) {
        setError(
          "Follow-up date and time cannot be in the past."
        );

        return;
      }

      /*
      |--------------------------------------------------------------------------
      | Priority
      |--------------------------------------------------------------------------
      */

      if (
        ![
          "High",
          "Medium",
          "Low",
        ].includes(
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
      | Create Follow-up
      |--------------------------------------------------------------------------
      |
      | Backend createFollowupSchema expects:
      |
      | {
      |   leadId,
      |   action,
      |   dueAt,
      |   priority,
      |   notes
      | }
      |
      */

      try {
        await mutation.mutateAsync({
          leadId:
            Number(
              resolvedLead.id
            ),

          action:
            cleanAction,

          dueAt:
            dueDate.toISOString(),

          priority,

          notes:
            cleanNotes ||
            null,
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
            "Unable to schedule follow-up."
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
        aria-labelledby="schedule-followup-title"
      >
        {/* Header */}

        <header className="modal-head">
          <div>
            <h2 id="schedule-followup-title">
              Schedule follow-up
            </h2>

            <p>
              Schedule the next
              action for this lead.
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
                      mutation.isPending ||
                      leadsQuery.isLoading
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
                      {leadsQuery.isLoading
                        ? "Loading leads..."
                        : "Select lead"}
                    </option>

                    {leads.map(
                      (
                        item
                      ) => (
                        <option
                          key={
                            item.id
                          }
                          value={
                            item.id
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

              <label className="full">
                Action *

                <input
                  type="text"
                  maxLength={500}
                  value={
                    action
                  }
                  disabled={
                    mutation.isPending
                  }
                  placeholder="e.g. Call customer to discuss proposal"
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
                  autoFocus
                />
              </label>

              {/* Date */}

              <label>
                Date *

                <input
                  type="date"
                  min={today}
                  value={
                    date
                  }
                  disabled={
                    mutation.isPending
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
                    date === today
                      ? currentTime
                      : undefined
                  }
                  value={
                    time
                  }
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
                  value={
                    priority
                  }
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
                  value={
                    notes
                  }
                  disabled={
                    mutation.isPending
                  }
                  placeholder="Optional notes"
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
              : "Schedule"}
          </button>
        </footer>
      </section>
    </div>
  );
};

export default ScheduleFollowupModal;