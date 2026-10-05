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
  useCreateMeetingMutation,
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
        date.getMonth() +
          1
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
| Schedule Meeting
|--------------------------------------------------------------------------
*/

const ScheduleMeetingModal = ({
  open,
  lead = null,
  onClose,
}) => {
  const mutation =
    useCreateMeetingMutation();

  /*
  |--------------------------------------------------------------------------
  | Leads
  |--------------------------------------------------------------------------
  */

  const leadParams =
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
      leadParams
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
    title,
    setTitle,
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
    meetingType,
    setMeetingType,
  ] = useState(
    "VIDEO_CALL"
  );

  const [
    agenda,
    setAgenda,
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
    if (!open) {
      return;
    }

    /*
     * Calculate the current date/time
     * every time the modal opens.
     *
     * Do not use values calculated when
     * the JavaScript file first loaded.
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

    setTitle("");

    setDate(
      currentDate
    );

    setTime(
      currentTime
    );

    setMeetingType(
      "VIDEO_CALL"
    );

    setAgenda("");

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
  | Lead
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
       * Browser min should already
       * prevent this, but keep a
       * JavaScript check as well.
       */

      if (
        selectedDate &&
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
       * If user changes the date back
       * to today and the selected time
       * is already in the past, move
       * the time to the current time.
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
       * Past times are not allowed
       * when the meeting date is today.
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
      | Lead
      |--------------------------------------------------------------------------
      */

      if (
        !resolvedLead
      ) {
        setError(
          "Related lead is required."
        );

        return;
      }

      /*
      |--------------------------------------------------------------------------
      | Title
      |--------------------------------------------------------------------------
      */

      if (
        !title.trim()
      ) {
        setError(
          "Meeting title is required."
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
          "Meeting date and time are required."
        );

        return;
      }

      /*
      |--------------------------------------------------------------------------
      | Browser Local Time -> Date
      |--------------------------------------------------------------------------
      */

      const startsAt =
        new Date(
          `${date}T${time}:00`
        );

      /*
      |--------------------------------------------------------------------------
      | Invalid Date
      |--------------------------------------------------------------------------
      */

      if (
        Number.isNaN(
          startsAt.getTime()
        )
      ) {
        setError(
          "Enter a valid meeting date and time."
        );

        return;
      }

      /*
      |--------------------------------------------------------------------------
      | Reject Past Date / Time
      |--------------------------------------------------------------------------
      |
      | The input min attributes improve the UI,
      | but this check is still required because
      | HTML validation can be bypassed.
      |
      | We allow the current minute. Without the
      | tolerance, selecting 14:38 and clicking
      | submit at 14:38:20 would incorrectly fail.
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
      | Default End Time
      |--------------------------------------------------------------------------
      |
      | Prototype does not ask for an
      | end time, so use one hour.
      |
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
      | Create Meeting
      |--------------------------------------------------------------------------
      */

      try {
        await mutation.mutateAsync({
          leadId:
            Number(
              resolvedLead.id
            ),

          contactId:
            resolvedLead.primaryContactId
              ? Number(
                  resolvedLead.primaryContactId
                )
              : null,

          title:
            title.trim(),

          startsAt:
            startsAt.toISOString(),

          endsAt:
            endsAt.toISOString(),

          meetingType,

          participants:
            [],

          location:
            null,

          meetingUrl:
            null,

          agenda:
            agenda.trim() ||
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
            "Unable to schedule meeting."
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
        aria-labelledby="schedule-meeting-title"
      >
        {/* Header */}

        <header className="modal-head">
          <div>
            <h2 id="schedule-meeting-title">
              Schedule meeting
            </h2>

            <p>
              Schedule a discovery
              or client
              conversation.
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

              {/* Title */}

              <label>
                Meeting title *

                <input
                  type="text"
                  value={
                    title
                  }
                  onChange={(
                    event
                  ) => {
                    setTitle(
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

              {/* Type */}

              <label>
                Meeting type

                <select
                  value={
                    meetingType
                  }
                  onChange={(
                    event
                  ) =>
                    setMeetingType(
                      event.target
                        .value
                    )
                  }
                >
                  <option value="VIDEO_CALL">
                    Video call
                  </option>

                  <option value="IN_PERSON">
                    In person
                  </option>

                  <option value="PHONE_CALL">
                    Phone
                  </option>
                </select>
              </label>

              {/* Agenda */}

              <label className="full">
                Agenda

                <textarea
                  rows="4"
                  value={
                    agenda
                  }
                  onChange={(
                    event
                  ) =>
                    setAgenda(
                      event.target
                        .value
                    )
                  }
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
              : "Schedule meeting"}
          </button>
        </footer>
      </section>
    </div>
  );
};

export default ScheduleMeetingModal;