import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  X,
} from "lucide-react";

import {
  useSaveBriefMutation,
} from "./briefs.queries.js";

/*
|--------------------------------------------------------------------------
| Status
|--------------------------------------------------------------------------
*/

const STATUS_OPTIONS = [
  {
    value:
      "DRAFT",

    label:
      "Draft",
  },
  {
    value:
      "AWAITING_CLARIFICATION",

    label:
      "Awaiting clarification",
  },
  {
    value:
      "READY",

    label:
      "Ready",
  },
  {
    value:
      "APPROVED",

    label:
      "Approved",
  },
];

/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
*/

const ROUTE_OPTIONS = [
  {
    value:
      "",

    label:
      "Select route",
  },
  {
    value:
      "KNOWN_EXISTING",

    label:
      "Known / Existing",
  },
  {
    value:
      "NEW_UNKNOWN",

    label:
      "New / Unknown",
  },
];

/*
|--------------------------------------------------------------------------
| Required Fields
|--------------------------------------------------------------------------
*/

const REQUIRED_FIELDS = [
  "businessObjective",
  "clientProblem",
  "targetAudience",
  "campaignRequirement",
  "currentActivity",
  "potentialScope",
  "timeline",
  "budget",
  "decisionMaker",
  "approvalProcess",
  "expectedDeliverables",
  "clientExpectations",
  "competitors",
  "categoryInsights",
  "mandatoryRequirements",
];

/*
|--------------------------------------------------------------------------
| Empty Form
|--------------------------------------------------------------------------
*/

const EMPTY_FORM = {
  businessObjective:
    "",

  clientProblem:
    "",

  targetAudience:
    "",

  campaignRequirement:
    "",

  currentActivity:
    "",

  potentialScope:
    "",

  timeline:
    "",

  budget:
    "",

  decisionMaker:
    "",

  approvalProcess:
    "",

  expectedDeliverables:
    "",

  clientExpectations:
    "",

  competitors:
    "",

  categoryInsights:
    "",

  mandatoryRequirements:
    "",

  status:
    "DRAFT",

  routeType:
    "",

  routeDecisionNote:
    "",
};

/*
|--------------------------------------------------------------------------
| Normalize
|--------------------------------------------------------------------------
*/

const normalizeForm =
  (
    brief
  ) => {
    if (!brief) {
      return {
        ...EMPTY_FORM,
      };
    }

    return {
      businessObjective:
        brief.businessObjective ||
        "",

      clientProblem:
        brief.clientProblem ||
        "",

      targetAudience:
        brief.targetAudience ||
        "",

      campaignRequirement:
        brief.campaignRequirement ||
        "",

      currentActivity:
        brief.currentActivity ||
        "",

      potentialScope:
        brief.potentialScope ||
        "",

      timeline:
        brief.timeline ||
        "",

      budget:
        brief.budget ||
        "",

      decisionMaker:
        brief.decisionMaker ||
        "",

      approvalProcess:
        brief.approvalProcess ||
        "",

      expectedDeliverables:
        brief.expectedDeliverables ||
        "",

      clientExpectations:
        brief.clientExpectations ||
        "",

      competitors:
        brief.competitors ||
        "",

      categoryInsights:
        brief.categoryInsights ||
        "",

      mandatoryRequirements:
        brief.mandatoryRequirements ||
        "",

      status:
        brief.status ||
        "DRAFT",

      routeType:
        brief.routeType ||
        "",

      routeDecisionNote:
        brief.routeDecisionNote ||
        "",
    };
  };

/*
|--------------------------------------------------------------------------
| Label
|--------------------------------------------------------------------------
*/

const FIELD_LABELS = {
  businessObjective:
    "Business objective",

  clientProblem:
    "Client problem",

  targetAudience:
    "Target audience",

  campaignRequirement:
    "Campaign requirement",

  currentActivity:
    "Current activity",

  potentialScope:
    "Potential scope",

  timeline:
    "Timeline",

  budget:
    "Budget",

  decisionMaker:
    "Decision maker",

  approvalProcess:
    "Approval process",

  expectedDeliverables:
    "Expected deliverables",

  clientExpectations:
    "Client expectations",

  competitors:
    "Competitors",

  categoryInsights:
    "Category insights",

  mandatoryRequirements:
    "Mandatory requirements",
};

/*
|--------------------------------------------------------------------------
| Form Modal
|--------------------------------------------------------------------------
*/

const BriefFormModal = ({
  open,
  lead,
  brief,
  onClose,
}) => {
  const mutation =
    useSaveBriefMutation();

  const [
    form,
    setForm,
  ] = useState(
    EMPTY_FORM
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

    setForm(
      normalizeForm(
        brief
      )
    );

    setError("");
  }, [
    open,
    brief,
  ]);

  /*
  |--------------------------------------------------------------------------
  | Missing Fields
  |--------------------------------------------------------------------------
  */

  const missingFields =
    useMemo(
      () =>
        REQUIRED_FIELDS.filter(
          (
            field
          ) =>
            !String(
              form[field] ||
                ""
            ).trim()
        ),
      [
        form,
      ]
    );

  const completedCount =
    REQUIRED_FIELDS.length -
    missingFields.length;

  const completeness =
    Math.round(
      (
        completedCount /
        REQUIRED_FIELDS.length
      ) *
        100
    );

  /*
  |--------------------------------------------------------------------------
  | Field Handler
  |--------------------------------------------------------------------------
  */

  const update =
    (
      field,
      value
    ) => {
      setForm(
        (
          previous
        ) => ({
          ...previous,

          [field]:
            value,
        })
      );
    };

  /*
  |--------------------------------------------------------------------------
  | Escape
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const handleKeyDown =
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
      handleKeyDown
    );

    return () =>
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
  }, [
    open,
    onClose,
    mutation.isPending,
  ]);

  if (
    !open ||
    !lead
  ) {
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
      | Ready / Approved Gate
      |--------------------------------------------------------------------------
      */

      if (
        [
          "READY",
          "APPROVED",
        ].includes(
          form.status
        ) &&
        missingFields.length
      ) {
        setError(
          `Complete all required brief fields before marking this brief ${
            form.status ===
            "READY"
              ? "Ready"
              : "Approved"
          }.`
        );

        return;
      }

      /*
      |--------------------------------------------------------------------------
      | Route Required
      |--------------------------------------------------------------------------
      */

      if (
        [
          "READY",
          "APPROVED",
        ].includes(
          form.status
        ) &&
        !form.routeType
      ) {
        setError(
          "Select Known / Existing or New / Unknown before progressing the brief."
        );

        return;
      }

      /*
      |--------------------------------------------------------------------------
      | Route Note
      |--------------------------------------------------------------------------
      */

      if (
        form.routeType &&
        !form.routeDecisionNote.trim()
      ) {
        setError(
          "Route decision note is required."
        );

        return;
      }

      try {
        await mutation.mutateAsync({
          leadId:
            Number(
              lead.id
            ),

          data: {
            businessObjective:
              form.businessObjective.trim() ||
              null,

            clientProblem:
              form.clientProblem.trim() ||
              null,

            targetAudience:
              form.targetAudience.trim() ||
              null,

            campaignRequirement:
              form.campaignRequirement.trim() ||
              null,

            currentActivity:
              form.currentActivity.trim() ||
              null,

            potentialScope:
              form.potentialScope.trim() ||
              null,

            timeline:
              form.timeline.trim() ||
              null,

            budget:
              form.budget.trim() ||
              null,

            decisionMaker:
              form.decisionMaker.trim() ||
              null,

            approvalProcess:
              form.approvalProcess.trim() ||
              null,

            expectedDeliverables:
              form.expectedDeliverables.trim() ||
              null,

            clientExpectations:
              form.clientExpectations.trim() ||
              null,

            competitors:
              form.competitors.trim() ||
              null,

            categoryInsights:
              form.categoryInsights.trim() ||
              null,

            mandatoryRequirements:
              form.mandatoryRequirements.trim() ||
              null,

            status:
              form.status,

            routeType:
              form.routeType ||
              null,

            routeDecisionNote:
              form.routeDecisionNote.trim() ||
              null,
          },
        });

        onClose();
      } catch (
        requestError
      ) {
        const response =
          requestError
            ?.response
            ?.data;

        if (
          response?.code ===
            "BRIEF_INCOMPLETE" &&
          Array.isArray(
            response.errors
          )
        ) {
          setError(
            response.errors
              .map(
                (
                  item
                ) =>
                  item.field
              )
              .filter(
                Boolean
              )
              .join(
                ", "
              ) ||
              response.message
          );

          return;
        }

        setError(
          response?.message ||
            "Unable to save brief."
        );
      }
    };

  return (
    <div className="modal-backdrop">
      <section
        className="tl-modal brief-modal"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}

        <header className="modal-head">
          <div>
            <h2>
              {brief
                ? "Edit brief"
                : "Add brief"}
            </h2>

            <p>
              Capture the client
              requirement before
              progressing the
              opportunity.
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

        <div className="modal-body brief-modal-body">
          {error && (
            <div className="error-box">
              {error}
            </div>
          )}

          {/* ------------------------------------------------------------- */}
          {/* Progress */}
          {/* ------------------------------------------------------------- */}

          <div className="brief-progress-card">
            <div>
              <small>
                BRIEF COMPLETENESS
              </small>

              <b>
                {completeness}%
              </b>
            </div>

            <div className="brief-progress-track">
              <span
                style={{
                  width:
                    `${completeness}%`,
                }}
              />
            </div>

            <small>
              {completedCount} of{" "}
              {
                REQUIRED_FIELDS.length
              } required fields
              completed
            </small>
          </div>

          {/* ------------------------------------------------------------- */}
          {/* Status */}
          {/* ------------------------------------------------------------- */}

          <div className="form-section">
            <h3>
              Brief status
            </h3>

            <div className="form-grid2">
              <label>
                Status *

                <select
                  value={
                    form.status
                  }
                  onChange={(
                    event
                  ) =>
                    update(
                      "status",
                      event.target
                        .value
                    )
                  }
                >
                  {STATUS_OPTIONS.map(
                    (
                      option
                    ) => (
                      <option
                        key={
                          option.value
                        }
                        value={
                          option.value
                        }
                      >
                        {
                          option.label
                        }
                      </option>
                    )
                  )}
                </select>
              </label>
            </div>
          </div>

          {/* ------------------------------------------------------------- */}
          {/* Business Context */}
          {/* ------------------------------------------------------------- */}

          <div className="form-section">
            <h3>
              Business context
            </h3>

            <div className="brief-form-grid">
              <label>
                Business objective *

                <textarea
                  rows="3"
                  value={
                    form.businessObjective
                  }
                  onChange={(
                    event
                  ) =>
                    update(
                      "businessObjective",
                      event.target
                        .value
                    )
                  }
                />
              </label>

              <label>
                Client problem *

                <textarea
                  rows="3"
                  value={
                    form.clientProblem
                  }
                  onChange={(
                    event
                  ) =>
                    update(
                      "clientProblem",
                      event.target
                        .value
                    )
                  }
                />
              </label>

              <label>
                Target audience *

                <textarea
                  rows="3"
                  value={
                    form.targetAudience
                  }
                  onChange={(
                    event
                  ) =>
                    update(
                      "targetAudience",
                      event.target
                        .value
                    )
                  }
                />
              </label>

              <label>
                Campaign requirement *

                <textarea
                  rows="3"
                  value={
                    form.campaignRequirement
                  }
                  onChange={(
                    event
                  ) =>
                    update(
                      "campaignRequirement",
                      event.target
                        .value
                    )
                  }
                />
              </label>

              <label>
                Current activity *

                <textarea
                  rows="3"
                  value={
                    form.currentActivity
                  }
                  onChange={(
                    event
                  ) =>
                    update(
                      "currentActivity",
                      event.target
                        .value
                    )
                  }
                />
              </label>

              <label>
                Potential scope *

                <textarea
                  rows="3"
                  value={
                    form.potentialScope
                  }
                  onChange={(
                    event
                  ) =>
                    update(
                      "potentialScope",
                      event.target
                        .value
                    )
                  }
                />
              </label>
            </div>
          </div>

          {/* ------------------------------------------------------------- */}
          {/* Commercial Context */}
          {/* ------------------------------------------------------------- */}

          <div className="form-section">
            <h3>
              Timeline & commercial context
            </h3>

            <div className="form-grid2">
              <label>
                Timeline *

                <input
                  type="text"
                  value={
                    form.timeline
                  }
                  placeholder="e.g. Launch in 8 weeks"
                  onChange={(
                    event
                  ) =>
                    update(
                      "timeline",
                      event.target
                        .value
                    )
                  }
                />
              </label>

              <label>
                Budget *

                <input
                  type="text"
                  value={
                    form.budget
                  }
                  placeholder="e.g. ₹15–20 lakh"
                  onChange={(
                    event
                  ) =>
                    update(
                      "budget",
                      event.target
                        .value
                    )
                  }
                />
              </label>

              <label>
                Decision maker *

                <input
                  type="text"
                  value={
                    form.decisionMaker
                  }
                  onChange={(
                    event
                  ) =>
                    update(
                      "decisionMaker",
                      event.target
                        .value
                    )
                  }
                />
              </label>

              <label>
                Approval process *

                <textarea
                  rows="3"
                  value={
                    form.approvalProcess
                  }
                  onChange={(
                    event
                  ) =>
                    update(
                      "approvalProcess",
                      event.target
                        .value
                    )
                  }
                />
              </label>
            </div>
          </div>

          {/* ------------------------------------------------------------- */}
          {/* Deliverables */}
          {/* ------------------------------------------------------------- */}

          <div className="form-section">
            <h3>
              Delivery expectations
            </h3>

            <div className="brief-form-grid">
              <label>
                Expected deliverables *

                <textarea
                  rows="3"
                  value={
                    form.expectedDeliverables
                  }
                  onChange={(
                    event
                  ) =>
                    update(
                      "expectedDeliverables",
                      event.target
                        .value
                    )
                  }
                />
              </label>

              <label>
                Client expectations *

                <textarea
                  rows="3"
                  value={
                    form.clientExpectations
                  }
                  onChange={(
                    event
                  ) =>
                    update(
                      "clientExpectations",
                      event.target
                        .value
                    )
                  }
                />
              </label>

              <label>
                Competitors *

                <textarea
                  rows="3"
                  value={
                    form.competitors
                  }
                  onChange={(
                    event
                  ) =>
                    update(
                      "competitors",
                      event.target
                        .value
                    )
                  }
                />
              </label>

              <label>
                Category insights *

                <textarea
                  rows="3"
                  value={
                    form.categoryInsights
                  }
                  onChange={(
                    event
                  ) =>
                    update(
                      "categoryInsights",
                      event.target
                        .value
                    )
                  }
                />
              </label>

              <label className="brief-full">
                Mandatory requirements *

                <textarea
                  rows="4"
                  value={
                    form.mandatoryRequirements
                  }
                  onChange={(
                    event
                  ) =>
                    update(
                      "mandatoryRequirements",
                      event.target
                        .value
                    )
                  }
                />
              </label>
            </div>
          </div>

          {/* ------------------------------------------------------------- */}
          {/* Route */}
          {/* ------------------------------------------------------------- */}

          <div className="form-section">
            <h3>
              Route decision
            </h3>

            <p className="muted">
              Is the client /
              industry already
              known?
            </p>

            <div className="form-grid2">
              <label>
                Client / industry route

                <select
                  value={
                    form.routeType
                  }
                  onChange={(
                    event
                  ) =>
                    update(
                      "routeType",
                      event.target
                        .value
                    )
                  }
                >
                  {ROUTE_OPTIONS.map(
                    (
                      option
                    ) => (
                      <option
                        key={
                          option.value
                        }
                        value={
                          option.value
                        }
                      >
                        {
                          option.label
                        }
                      </option>
                    )
                  )}
                </select>
              </label>

              <label className="full">
                Route decision note

                <textarea
                  rows="3"
                  value={
                    form.routeDecisionNote
                  }
                  placeholder="Explain why this route applies."
                  onChange={(
                    event
                  ) =>
                    update(
                      "routeDecisionNote",
                      event.target
                        .value
                    )
                  }
                />
              </label>
            </div>

            {form.routeType ===
              "KNOWN_EXISTING" && (
              <div className="brief-route-preview">
                <b>
                  Known / Existing
                </b>

                <span>
                  Brief → Scope
                  Confirmation →
                  Commercials →
                  Contract / PO →
                  Team Assignment →
                  Pitch
                </span>
              </div>
            )}

            {form.routeType ===
              "NEW_UNKNOWN" && (
              <div className="brief-route-preview">
                <b>
                  New / Unknown
                </b>

                <span>
                  Brief → Understand
                  Client + Industry →
                  Team Assignment →
                  Pitch →
                  Commercials →
                  Contract / PO →
                  Onboarding
                </span>
              </div>
            )}
          </div>

          {/* ------------------------------------------------------------- */}
          {/* Missing */}
          {/* ------------------------------------------------------------- */}

          {missingFields.length >
            0 && (
            <div className="brief-missing">
              <b>
                Missing required
                information
              </b>

              <p>
                {missingFields
                  .map(
                    (
                      field
                    ) =>
                      FIELD_LABELS[
                        field
                      ] ||
                      field
                  )
                  .join(
                    ", "
                  )}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}

        <footer className="modal-foot">
          <button
            type="button"
            className="tl-secondary"
            onClick={
              onClose
            }
            disabled={
              mutation.isPending
            }
          >
            Cancel
          </button>

          <button
            type="button"
            className="tl-primary"
            onClick={
              submit
            }
            disabled={
              mutation.isPending
            }
          >
            {mutation.isPending
              ? "Saving..."
              : "Save brief"}
          </button>
        </footer>
      </section>
    </div>
  );
};

export default BriefFormModal;