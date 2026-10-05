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
| Date Input
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
| Local Date
|--------------------------------------------------------------------------
|
| Returns today's date using the browser's local timezone.
|
| Example:
| 2026-10-01
|
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
  |
  | Needed for the global Activities page.
  |
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
    nextFollowUp,
    setNextFollowUp,
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

    setNextAction(
      lead?.nextAction ||
        ""
    );

    /*
     * Only use the existing follow-up
     * when it is today or in the future.
     *
     * If the lead contains an old/past
     * follow-up date, do not put that
     * past date back into the field.
     */

    const existingFollowUp =
      toDateInput(
        lead?.followUpAt
      );

    setNextFollowUp(
      existingFollowUp &&
        existingFollowUp >=
          getLocalDate()
        ? existingFollowUp
        : ""
    );

    setError("");
  }, [
    open,
    lead,
  ]);

  /*
  |--------------------------------------------------------------------------
  | Update Defaults When Global Lead Changes
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

    setNextAction(
      resolvedLead.nextAction ||
        ""
    );

    /*
     * Do not load an old follow-up
     * date into the date input.
     */

    const existingFollowUp =
      toDateInput(
        resolvedLead.followUpAt
      );

    setNextFollowUp(
      existingFollowUp &&
        existingFollowUp >=
          getLocalDate()
        ? existingFollowUp
        : ""
    );
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
  | Current Date
  |--------------------------------------------------------------------------
  */

  const today =
    getLocalDate();

  /*
  |--------------------------------------------------------------------------
  | Next Follow-up Change
  |--------------------------------------------------------------------------
  */

  const handleNextFollowUpChange =
    (
      event
    ) => {
      const selectedDate =
        event.target.value;

      const currentDate =
        getLocalDate();

      /*
       * Empty value is allowed because
       * Next follow-up itself is optional.
       */

      if (!selectedDate) {
        setNextFollowUp("");

        setError("");

        return;
      }

      /*
       * Browser min normally prevents
       * this, but keep a JavaScript
       * check as additional protection.
       */

      if (
        selectedDate <
        currentDate
      ) {
        setError(
          "Next follow-up date cannot be in the past."
        );

        return;
      }

      setNextFollowUp(
        selectedDate
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
      | Next Action / Follow-up Must Be Together
      |--------------------------------------------------------------------------
      */

      const hasAction =
        Boolean(
          nextAction.trim()
        );

      const hasDate =
        Boolean(
          nextFollowUp
        );

      if (
        hasAction !==
        hasDate
      ) {
        setError(
          "Next action and next follow-up must be provided together."
        );

        return;
      }

      /*
      |--------------------------------------------------------------------------
      | Prevent Past Follow-up Date
      |--------------------------------------------------------------------------
      |
      | Do not rely only on min={today}.
      | Browser validation can be bypassed,
      | so validate again before API request.
      |
      */

      if (
        hasDate &&
        nextFollowUp <
          getLocalDate()
      ) {
        setError(
          "Next follow-up date cannot be in the past."
        );

        return;
      }

      let nextFollowUpAt =
        null;

      /*
      |--------------------------------------------------------------------------
      | Prototype Follow-up Time
      |--------------------------------------------------------------------------
      */

      if (
        hasAction &&
        hasDate
      ) {
        const followUpDate =
          new Date(
            `${nextFollowUp}T10:00:00`
          );

        /*
         * Validate generated date.
         */

        if (
          Number.isNaN(
            followUpDate.getTime()
          )
        ) {
          setError(
            "Enter a valid next follow-up date."
          );

          return;
        }

        /*
         * Final date protection.
         *
         * Since this modal only asks for
         * a date and not a time, today's
         * date is valid regardless of
         * whether 10:00 AM has passed.
         */

        const selectedDateOnly =
          nextFollowUp;

        const todayDateOnly =
          getLocalDate();

        if (
          selectedDateOnly <
          todayDateOnly
        ) {
          setError(
            "Next follow-up date cannot be in the past."
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
        {/* ------------------------------------------------------------- */}
        {/* Header */}
        {/* ------------------------------------------------------------- */}

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
              size={
                15
              }
            />
          </button>
        </header>

        {/* ------------------------------------------------------------- */}
        {/* Body */}
        {/* ------------------------------------------------------------- */}

        <div className="modal-body">
          {error && (
            <div className="error-box">
              {error}
            </div>
          )}

          <div className="form-section">
            <div className="form-grid2">
              {/* ------------------------------------------------------- */}
              {/* Related Lead - Global Page Only */}
              {/* ------------------------------------------------------- */}

              {!lead && (
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

              {/* ------------------------------------------------------- */}
              {/* Current Lead Context */}
              {/* ------------------------------------------------------- */}

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
                  onChange={(
                    event
                  ) => {
                    setNextAction(
                      event.target
                        .value
                    );

                    setError("");
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
                  onChange={(
                    event
                  ) =>
                    setNotes(
                      event.target
                        .value
                    )
                  }
                />
              </label>

              {/* Follow-up */}

              <label>
                Next follow-up

                <input
                  type="date"
                  min={
                    today
                  }
                  value={
                    nextFollowUp
                  }
                  onChange={
                    handleNextFollowUpChange
                  }
                />
              </label>
            </div>
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* Footer */}
        {/* ------------------------------------------------------------- */}

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