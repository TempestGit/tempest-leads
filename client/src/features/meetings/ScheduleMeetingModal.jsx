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
    "11:00"
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

    setSelectedLeadId(
      lead?.id
        ? String(
            lead.id
          )
        : ""
    );

    setTitle("");

    setDate(
      getLocalDate()
    );

    setTime(
      "11:00"
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

  if (!open) {
    return null;
  }

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
  | Submit
  |--------------------------------------------------------------------------
  */

  const submit =
    async () => {
      setError("");

      if (
        !resolvedLead
      ) {
        setError(
          "Related lead is required."
        );

        return;
      }

      if (
        !title.trim()
      ) {
        setError(
          "Meeting title is required."
        );

        return;
      }

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
      | Browser Local Time -> UTC ISO
      |--------------------------------------------------------------------------
      */

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
          "Enter a valid meeting date and time."
        );

        return;
      }

      /*
      |--------------------------------------------------------------------------
      | Prototype Does Not Ask For End Time.
      | Use One Hour As Default Duration.
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
            "Unable to schedule meeting."
        );
      }
    };

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
            <X size={15} />
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
                    ) =>
                      setSelectedLeadId(
                        event.target
                          .value
                      )
                    }
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
                  value={
                    title
                  }
                  onChange={(
                    event
                  ) =>
                    setTitle(
                      event.target
                        .value
                    )
                  }
                  autoFocus
                />
              </label>

              {/* Date */}

              <label>
                Date *

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

              {/* Time */}

              <label>
                Time *

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