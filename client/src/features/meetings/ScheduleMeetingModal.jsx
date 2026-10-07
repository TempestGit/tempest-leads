import { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";

import { useLeadsQuery } from "../leads/leads.queries.js";
import { useCreateMeetingMutation } from "./meetings.queries.js";

/*
|--------------------------------------------------------------------------
| Date / Time Helpers
|--------------------------------------------------------------------------
*/

const pad2 = (value) => String(value).padStart(2, "0");

const getLocalDate = (value = new Date()) =>
  `${value.getFullYear()}-${pad2(value.getMonth() + 1)}-${pad2(
    value.getDate()
  )}`;

const getLocalTime = (value = new Date()) =>
  `${pad2(value.getHours())}:${pad2(value.getMinutes())}`;

/*
|--------------------------------------------------------------------------
| Schedule Meeting Modal
|--------------------------------------------------------------------------
*/

const ScheduleMeetingModal = ({
  open,
  lead = null,
  onClose,
}) => {
  const mutation = useCreateMeetingMutation();

  /*
  |--------------------------------------------------------------------------
  | Leads
  |--------------------------------------------------------------------------
  */

  const leadParams = useMemo(
    () => ({
      page: 1,
      limit: 100,
      sort: "createdAt",
      direction: "desc",
    }),
    []
  );

  const leadsQuery = useLeadsQuery(leadParams);

  const leads =
    leadsQuery.data?.data?.leads || [];

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
  ] = useState("");

  const [
    time,
    setTime,
  ] = useState("");

  const [
    meetingType,
    setMeetingType,
  ] = useState("VIDEO_CALL");

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
  | Reset Every Time Modal Opens
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (!open) {
      return;
    }

    const now = new Date();

    /*
     * Default the meeting slightly into the future.
     *
     * This avoids opening the modal at 14:30:45,
     * displaying 14:30, and then immediately
     * submitting an already-past timestamp.
     */
    const defaultStart = new Date(
      now.getTime() + 5 * 60 * 1000
    );

    setSelectedLeadId(
      lead?.id
        ? String(lead.id)
        : ""
    );

    setTitle("");

    setDate(
      getLocalDate(defaultStart)
    );

    setTime(
      getLocalTime(defaultStart)
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

  if (!open) {
    return null;
  }

  /*
  |--------------------------------------------------------------------------
  | Current Date / Time
  |--------------------------------------------------------------------------
  */

  const today = getLocalDate();

  const currentTime = getLocalTime();

  /*
  |--------------------------------------------------------------------------
  | Resolve Lead
  |--------------------------------------------------------------------------
  */

  const resolvedLead =
    lead ||
    leads.find(
      (item) =>
        Number(item.id) ===
        Number(selectedLeadId)
    ) ||
    null;

  /*
  |--------------------------------------------------------------------------
  | Date Change
  |--------------------------------------------------------------------------
  */

  const handleDateChange = (event) => {
    const selectedDate =
      event.target.value;

    const nowDate =
      getLocalDate();

    const nowTime =
      getLocalTime();

    if (
      selectedDate &&
      selectedDate < nowDate
    ) {
      setError(
        "Meeting date cannot be in the past."
      );

      return;
    }

    setDate(selectedDate);

    /*
     * If the user switches back to today
     * while an older time is selected,
     * move it to the current minute.
     *
     * Exact validation still runs again
     * when the user submits.
     */
    if (
      selectedDate === nowDate &&
      (!time || time < nowTime)
    ) {
      setTime(nowTime);
    }

    setError("");
  };

  /*
  |--------------------------------------------------------------------------
  | Time Change
  |--------------------------------------------------------------------------
  */

  const handleTimeChange = (event) => {
    const selectedTime =
      event.target.value;

    const nowDate =
      getLocalDate();

    const nowTime =
      getLocalTime();

    if (
      date === nowDate &&
      selectedTime < nowTime
    ) {
      setError(
        "Meeting time cannot be in the past."
      );

      return;
    }

    setTime(selectedTime);

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
    | Lead
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
    | Title
    |--------------------------------------------------------------------------
    */

    if (!title.trim()) {
      setError(
        "Meeting title is required."
      );

      return;
    }

    /*
    |--------------------------------------------------------------------------
    | Date + Time
    |--------------------------------------------------------------------------
    */

    if (!date || !time) {
      setError(
        "Meeting date and time are required."
      );

      return;
    }

    /*
    |--------------------------------------------------------------------------
    | Construct Local Timestamp
    |--------------------------------------------------------------------------
    */

    const startsAt = new Date(
      `${date}T${time}:00`
    );

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
    | Exact Future Validation
    |--------------------------------------------------------------------------
    |
    | Do not use the old one-minute tolerance.
    |
    | A newly scheduled meeting should actually
    | be in the future.
    |
    */

    if (
      startsAt.getTime() <=
      Date.now()
    ) {
      setError(
        "Meeting date and time must be in the future."
      );

      return;
    }

    /*
    |--------------------------------------------------------------------------
    | Default Duration
    |--------------------------------------------------------------------------
    |
    | The existing UI does not expose an end
    | time, so preserve the existing one-hour
    | meeting duration.
    |
    */

    const endsAt = new Date(
      startsAt.getTime() +
        60 * 60 * 1000
    );

    /*
    |--------------------------------------------------------------------------
    | Create
    |--------------------------------------------------------------------------
    */

    try {
      await mutation.mutateAsync({
        leadId:
          Number(
            resolvedLead.id
          ),

        /*
         * Preserve existing behavior:
         * use the lead's primary contact.
         */
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

        participants: [],

        location: null,

        meetingUrl: null,

        agenda:
          agenda.trim() ||
          null,
      });

      onClose();
    } catch (requestError) {
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
        <header className="modal-head">
          <div>
            <h2 id="schedule-meeting-title">
              Schedule meeting
            </h2>

            <p>
              Schedule a discovery or
              client conversation.
            </p>
          </div>

          <button
            type="button"
            className="icon-control"
            onClick={onClose}
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

              {/* Related Lead */}

              {!lead ? (
                <label className="full">
                  Related lead *

                  <select
                    value={
                      selectedLeadId
                    }
                    disabled={
                      leadsQuery.isLoading ||
                      mutation.isPending
                    }
                    onChange={(event) => {
                      setSelectedLeadId(
                        event.target.value
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
                      (item) => (
                        <option
                          key={item.id}
                          value={item.id}
                        >
                          {item.companyName}
                          {" · "}
                          {item.leadCode}
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
                    {lead.companyName}
                    {" · "}
                    {lead.leadCode}
                  </b>
                </div>
              )}

              {/* Title */}

              <label>
                Meeting title *

                <input
                  type="text"
                  value={title}
                  disabled={
                    mutation.isPending
                  }
                  onChange={(event) => {
                    setTitle(
                      event.target.value
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
                  value={date}
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
                  value={time}
                  disabled={
                    mutation.isPending
                  }
                  onChange={
                    handleTimeChange
                  }
                />
              </label>

              {/* Meeting Type */}

              <label>
                Meeting type

                <select
                  value={
                    meetingType
                  }
                  disabled={
                    mutation.isPending
                  }
                  onChange={(event) => {
                    setMeetingType(
                      event.target.value
                    );

                    setError("");
                  }}
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
                  value={agenda}
                  disabled={
                    mutation.isPending
                  }
                  onChange={(event) => {
                    setAgenda(
                      event.target.value
                    );

                    setError("");
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
            onClick={onClose}
          >
            Cancel
          </button>

          <button
            type="button"
            className="tl-primary"
            disabled={
              mutation.isPending
            }
            onClick={submit}
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