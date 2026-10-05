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

        sort:
          "createdAt",

        direction:
          "desc",
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
  ] = useState(
    getLocalDate()
  );

  const [
    time,
    setTime,
  ] = useState(
    getLocalTime()
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
  | Reset When Opened
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (!open) {
      return;
    }

    /*
     * Always calculate the current
     * date/time when the modal opens.
     */

    const currentDate =
      getLocalDate();

    const currentTime =
      getLocalTime();

    setSelectedLeadId(
      lead?.id
        ? String(
            lead.id
          )
        : ""
    );

    setAction(
      lead?.nextAction ||
        ""
    );

    setDate(
      currentDate
    );

    setTime(
      currentTime
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
      (
        item
      ) =>
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
       * Allow clearing the field.
       */

      if (!selectedDate) {
        setDate("");

        setError("");

        return;
      }

      /*
       * Additional protection.
       * Browser min normally prevents
       * past date selection.
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
       * If the user changes back to
       * today and the currently selected
       * time has already passed,
       * automatically use current time.
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
       * Allow clearing the field.
       */

      if (!selectedTime) {
        setTime("");

        setError("");

        return;
      }

      /*
       * If follow-up is today,
       * past time is not allowed.
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
      | Related Lead
      |--------------------------------------------------------------------------
      */

      if (!resolvedLead) {
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
          "Action is required."
        );

        return;
      }

      /*
      |--------------------------------------------------------------------------
      | Date / Time Required
      |--------------------------------------------------------------------------
      */

      if (
        !date ||
        !time
      ) {
        setError(
          "Date and time are required."
        );

        return;
      }

      /*
      |--------------------------------------------------------------------------
      | Prevent Past Date
      |--------------------------------------------------------------------------
      */

      const nowDate =
        getLocalDate();

      if (
        date <
        nowDate
      ) {
        setError(
          "Follow-up date cannot be in the past."
        );

        return;
      }

      /*
      |--------------------------------------------------------------------------
      | Convert Local Date / Time
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
          "Enter a valid date and time."
        );

        return;
      }

      /*
      |--------------------------------------------------------------------------
      | Reject Past Date / Time
      |--------------------------------------------------------------------------
      |
      | HTML min protects the UI, but
      | validation is required here too.
      |
      | 60-second tolerance allows the
      | current minute.
      |
      | Example:
      |
      | Modal opens at 11:58:05.
      | Time field = 11:58.
      | User submits at 11:58:30.
      |
      | That should still be accepted.
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
          leadId:
            Number(
              resolvedLead.id
            ),

          action:
            action.trim(),

          dueAt:
            dueAt.toISOString(),

          priority,

          notes:
            null,
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
      <section className="tl-modal">
        {/* Header */}

        <header className="modal-head">
          <div>
            <h2>
              Schedule follow-up
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
                      leadsQuery.isLoading
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
                  autoFocus
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
                  ) =>
                    setPriority(
                      event.target
                        .value
                    )
                  }
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

export default ScheduleFollowupModal;