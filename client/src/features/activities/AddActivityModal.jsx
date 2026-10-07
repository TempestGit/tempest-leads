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
  useCreateActivityMutation,
} from "./activities.queries.js";

/*
|--------------------------------------------------------------------------
| Local Date Helpers
|--------------------------------------------------------------------------
*/

const pad2 = (value) =>
  String(value).padStart(
    2,
    "0"
  );

const getLocalDate = (
  date = new Date()
) => {
  return [
    date.getFullYear(),
    pad2(
      date.getMonth() + 1
    ),
    pad2(
      date.getDate()
    ),
  ].join("-");
};

const getLocalTime = (
  date = new Date()
) => {
  return `${pad2(
    date.getHours()
  )}:${pad2(
    date.getMinutes()
  )}`;
};

/*
|--------------------------------------------------------------------------
| Existing Date/Time Helpers
|--------------------------------------------------------------------------
*/

const toDateInput = (
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

  return getLocalDate(
    date
  );
};

const toTimeInput = (
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

  return getLocalTime(
    date
  );
};

/*
|--------------------------------------------------------------------------
| Future Timestamp Check
|--------------------------------------------------------------------------
*/

const getFutureFollowUp =
  (value) => {
    if (!value) {
      return {
        date: "",
        time: "",
      };
    }

    const date =
      new Date(value);

    if (
      Number.isNaN(
        date.getTime()
      ) ||
      date.getTime() <=
        Date.now()
    ) {
      return {
        date: "",
        time: "",
      };
    }

    return {
      date:
        toDateInput(
          value
        ),

      time:
        toTimeInput(
          value
        ),
    };
  };

/*
|--------------------------------------------------------------------------
| Add Activity Modal
|--------------------------------------------------------------------------
*/

const AddActivityModal = ({
  open,
  lead = null,
  onClose,
}) => {
  const mutation =
    useCreateActivityMutation();

  /*
  |--------------------------------------------------------------------------
  | Load Available Leads
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
    outcome,
    setOutcome,
  ] = useState("");

  const [
    notes,
    setNotes,
  ] = useState("");

  const [
    nextAction,
    setNextAction,
  ] = useState("");

  const [
    nextFollowUpDate,
    setNextFollowUpDate,
  ] = useState("");

  const [
    nextFollowUpTime,
    setNextFollowUpTime,
  ] = useState("");

  const [
    error,
    setError,
  ] = useState("");

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
  | Load Lead Defaults
  |--------------------------------------------------------------------------
  */

  const applyLeadDefaults =
    (
      targetLead
    ) => {
      setNextAction(
        targetLead
          ?.nextAction ||
          ""
      );

      const followUp =
        getFutureFollowUp(
          targetLead
            ?.followUpAt
        );

      setNextFollowUpDate(
        followUp.date
      );

      setNextFollowUpTime(
        followUp.time
      );
    };

  /*
  |--------------------------------------------------------------------------
  | Reset When Opened
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

    setOutcome("");

    setNotes("");

    applyLeadDefaults(
      lead
    );

    setError("");
  }, [
    open,
    lead,
  ]);

  /*
  |--------------------------------------------------------------------------
  | Global Lead Selection Defaults
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (
      !open ||
      lead ||
      !resolvedLead
    ) {
      return;
    }

    applyLeadDefaults(
      resolvedLead
    );

    setError("");
  }, [
    open,
    lead,
    resolvedLead?.id,
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
      (event) => {
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

  const today =
    getLocalDate();

  /*
  |--------------------------------------------------------------------------
  | Follow-up Date Change
  |--------------------------------------------------------------------------
  */

  const handleDateChange =
    (event) => {
      const value =
        event.target.value;

      if (!value) {
        setNextFollowUpDate(
          ""
        );

        setNextFollowUpTime(
          ""
        );

        setError("");

        return;
      }

      if (
        value <
        getLocalDate()
      ) {
        setError(
          "Next follow-up date cannot be in the past."
        );

        return;
      }

      setNextFollowUpDate(
        value
      );

      setError("");
    };

  /*
  |--------------------------------------------------------------------------
  | Follow-up Time Change
  |--------------------------------------------------------------------------
  */

  const handleTimeChange =
    (event) => {
      setNextFollowUpTime(
        event.target.value
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
          "Select a related lead."
        );

        return;
      }

      /*
      |--------------------------------------------------------------------------
      | Outcome
      |--------------------------------------------------------------------------
      */

      if (
        !outcome.trim()
      ) {
        setError(
          "Outcome is required."
        );

        return;
      }

      /*
      |--------------------------------------------------------------------------
      | Follow-up Pair Validation
      |--------------------------------------------------------------------------
      |
      | Next action is optional.
      |
      | But if a next action is supplied,
      | both follow-up date and time must
      | also be supplied.
      |
      | Likewise, a follow-up date/time
      | cannot exist without a next action.
      |
      */

      const hasAction =
        Boolean(
          nextAction.trim()
        );

      const hasDate =
        Boolean(
          nextFollowUpDate
        );

      const hasTime =
        Boolean(
          nextFollowUpTime
        );

      const hasAnyFollowUp =
        hasDate ||
        hasTime;

      if (
        hasDate !==
        hasTime
      ) {
        setError(
          "Next follow-up date and time must both be provided."
        );

        return;
      }

      if (
        hasAction !==
        hasAnyFollowUp
      ) {
        setError(
          "Next action and next follow-up must be provided together."
        );

        return;
      }

      let nextFollowUpAt =
        null;

      /*
      |--------------------------------------------------------------------------
      | Exact Future Timestamp Validation
      |--------------------------------------------------------------------------
      */

      if (
        hasAction &&
        hasDate &&
        hasTime
      ) {
        const followUpDate =
          new Date(
            `${nextFollowUpDate}T${nextFollowUpTime}:00`
          );

        if (
          Number.isNaN(
            followUpDate.getTime()
          )
        ) {
          setError(
            "Enter a valid next follow-up date and time."
          );

          return;
        }

        if (
          followUpDate.getTime() <=
          Date.now()
        ) {
          setError(
            "Next follow-up must be in the future."
          );

          return;
        }

        nextFollowUpAt =
          followUpDate.toISOString();
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

          activityType:
            "Activity",

          outcome:
            outcome.trim(),

          notes:
            notes.trim() ||
            null,

          nextAction:
            hasAction
              ? nextAction.trim()
              : null,

          nextFollowUpAt,
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
            "Unable to record activity."
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
        aria-labelledby="add-activity-title"
      >
        <header className="modal-head">
          <div>
            <h2 id="add-activity-title">
              Add Activity
            </h2>

            <p>
              Record an
              interaction,
              outcome and next
              action.
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

        <div className="modal-body">
          {error && (
            <div className="error-box">
              {error}
            </div>
          )}

          <div className="form-section">
            <div className="form-grid2">

              {/* Related Lead */}

              {!lead && (
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
                    onChange={(
                      event
                    ) => {
                      setSelectedLeadId(
                        event.target
                          .value
                      );

                      setError(
                        ""
                      );
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
                          key={
                            item.id
                          }
                          value={
                            item.id
                          }
                        >
                          {
                            item.companyName
                          }{" "}
                          ·{" "}
                          {
                            item.leadCode
                          }

                          {item.primaryContactName
                            ? ` · ${item.primaryContactName}`
                            : ""}
                        </option>
                      )
                    )}
                  </select>
                </label>
              )}

              {/* Fixed Lead Context */}

              {lead && (
                <div className="activity-context full">
                  <small>
                    Related lead
                  </small>

                  <b>
                    {
                      lead.companyName
                    }{" "}
                    ·{" "}
                    {
                      lead.leadCode
                    }
                  </b>
                </div>
              )}

              {/* Outcome */}

              <label>
                Outcome *

                <input
                  type="text"
                  value={
                    outcome
                  }
                  disabled={
                    mutation.isPending
                  }
                  onChange={(
                    event
                  ) => {
                    setOutcome(
                      event.target
                        .value
                    );

                    setError(
                      ""
                    );
                  }}
                  autoFocus={
                    Boolean(
                      lead
                    )
                  }
                />
              </label>

              {/* Next Action */}

              <label>
                Next action

                <input
                  type="text"
                  value={
                    nextAction
                  }
                  disabled={
                    mutation.isPending
                  }
                  onChange={(
                    event
                  ) => {
                    setNextAction(
                      event.target
                        .value
                    );

                    setError(
                      ""
                    );
                  }}
                />
              </label>

              {/* Notes */}

              <label className="full">
                Notes

                <textarea
                  rows="4"
                  value={
                    notes
                  }
                  disabled={
                    mutation.isPending
                  }
                  onChange={(
                    event
                  ) => {
                    setNotes(
                      event.target
                        .value
                    );

                    setError(
                      ""
                    );
                  }}
                />
              </label>

              {/* Follow-up Date */}

              <label>
                Next follow-up date

                <input
                  type="date"
                  min={
                    today
                  }
                  value={
                    nextFollowUpDate
                  }
                  disabled={
                    mutation.isPending
                  }
                  onChange={
                    handleDateChange
                  }
                />
              </label>

              {/* Follow-up Time */}

              <label>
                Next follow-up time

                <input
                  type="time"
                  value={
                    nextFollowUpTime
                  }
                  disabled={
                    mutation.isPending ||
                    !nextFollowUpDate
                  }
                  onChange={
                    handleTimeChange
                  }
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
              ? "Saving..."
              : "Save activity"}
          </button>
        </footer>
      </section>
    </div>
  );
};

export default AddActivityModal;