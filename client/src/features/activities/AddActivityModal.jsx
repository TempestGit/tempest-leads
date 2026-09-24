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

    setNextFollowUp(
      toDateInput(
        lead?.followUpAt
      )
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

    setNextFollowUp(
      toDateInput(
        resolvedLead.followUpAt
      )
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

  if (!open) {
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
        const date =
          new Date(
            `${nextFollowUp}T10:00:00`
          );

        if (
          Number.isNaN(
            date.getTime()
          )
        ) {
          setError(
            "Enter a valid next follow-up date."
          );

          return;
        }

        nextFollowUpAt =
          date.toISOString();
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
            "Unable to record activity."
        );
      }
    };

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
            <X size={15} />
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
                  ) =>
                    setNextAction(
                      event.target
                        .value
                    )
                  }
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
                  value={
                    nextFollowUp
                  }
                  onChange={(
                    event
                  ) =>
                    setNextFollowUp(
                      event.target
                        .value
                    )
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