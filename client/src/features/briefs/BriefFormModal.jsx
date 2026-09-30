import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  X,
} from "lucide-react";

import {
  useContactsQuery,
} from "../contacts/contacts.queries.js";

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
    value: "DRAFT",
    label: "Draft",
  },
  {
    value: "AWAITING_CLARIFICATION",
    label: "Awaiting clarification",
  },
  {
    value: "READY",
    label: "Ready",
  },
  {
    value: "APPROVED",
    label: "Approved",
  },
];

/*
|--------------------------------------------------------------------------
| Required Brief Fields
|--------------------------------------------------------------------------
|
| Decision Maker is intentionally NOT here.
|
| Decision makers belong to Contacts.
| A company can have multiple decision makers.
|
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
  businessObjective: "",
  clientProblem: "",
  targetAudience: "",
  campaignRequirement: "",
  currentActivity: "",
  potentialScope: "",
  timeline: "",
  budget: "",
  approvalProcess: "",
  expectedDeliverables: "",
  clientExpectations: "",
  competitors: "",
  categoryInsights: "",
  mandatoryRequirements: "",
  status: "DRAFT",
  routeDecisionNote: "",
};

/*
|--------------------------------------------------------------------------
| Normalize Existing Brief
|--------------------------------------------------------------------------
*/

const normalizeForm = (
  brief
) => {
  if (!brief) {
    return {
      ...EMPTY_FORM,
    };
  }

  return {
    businessObjective:
      brief.businessObjective || "",

    clientProblem:
      brief.clientProblem || "",

    targetAudience:
      brief.targetAudience || "",

    campaignRequirement:
      brief.campaignRequirement || "",

    currentActivity:
      brief.currentActivity || "",

    potentialScope:
      brief.potentialScope || "",

    timeline:
      brief.timeline || "",

    budget:
      brief.budget || "",

    approvalProcess:
      brief.approvalProcess || "",

    expectedDeliverables:
      brief.expectedDeliverables || "",

    clientExpectations:
      brief.clientExpectations || "",

    competitors:
      brief.competitors || "",

    categoryInsights:
      brief.categoryInsights || "",

    mandatoryRequirements:
      brief.mandatoryRequirements || "",

    status:
      brief.status || "DRAFT",

    routeDecisionNote:
      brief.routeDecisionNote || "",
  };
};

/*
|--------------------------------------------------------------------------
| Field Labels
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
    "Detailed campaign requirement",

  currentActivity:
    "Current marketing / campaign activity",

  potentialScope:
    "Additional / future scope",

  timeline:
    "Timeline",

  budget:
    "Client confirmed budget",

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
| Route From Lead
|--------------------------------------------------------------------------
|
| Do not ask Known / Existing again in the Brief.
|
| LeadFormModal already stores knownRelationship.
|
*/

const getLeadRouteType = (
  lead
) => {
  if (
    lead?.knownRelationship ===
      undefined ||
    lead?.knownRelationship ===
      null
  ) {
    return null;
  }

  const knownRelationship =
    lead.knownRelationship === true ||
    Number(
      lead.knownRelationship
    ) === 1;

  return knownRelationship
    ? "KNOWN_EXISTING"
    : "NEW_UNKNOWN";
};

/*
|--------------------------------------------------------------------------
| Route Label
|--------------------------------------------------------------------------
*/

const getRouteLabel = (
  routeType
) => {
  if (
    routeType ===
    "KNOWN_EXISTING"
  ) {
    return "Known / Existing";
  }

  if (
    routeType ===
    "NEW_UNKNOWN"
  ) {
    return "New / Unknown";
  }

  return "Not available";
};

/*
|--------------------------------------------------------------------------
| Opportunity Value
|--------------------------------------------------------------------------
*/

const formatOpportunityValue = (
  value
) => {
  const amount =
    Number(
      value || 0
    );

  if (
    !Number.isFinite(
      amount
    ) ||
    amount <= 0
  ) {
    return "—";
  }

  return new Intl.NumberFormat(
    "en-IN",
    {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }
  ).format(
    amount
  );
};

/*
|--------------------------------------------------------------------------
| Brief Form Modal
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

  /*
  |--------------------------------------------------------------------------
  | Form
  |--------------------------------------------------------------------------
  */

  const [
    form,
    setForm,
  ] =
    useState(
      EMPTY_FORM
    );

  const [
    error,
    setError,
  ] =
    useState("");

  /*
  |--------------------------------------------------------------------------
  | Decision Makers
  |--------------------------------------------------------------------------
  |
  | Decision makers come from Contacts.
  |
  | Nothing is stored again inside the Brief.
  |
  */

  const decisionMakerParams =
    useMemo(
      () => ({
        companyId:
          lead?.companyId,

        isDecisionMaker:
          true,

        status:
          "ACTIVE",

        page:
          1,

        limit:
          100,

        sort:
          "name",

        direction:
          "asc",
      }),
      [
        lead?.companyId,
      ]
    );

  const decisionMakersQuery =
    useContactsQuery(
      decisionMakerParams
    );

  const decisionMakers =
    lead?.companyId
      ? decisionMakersQuery
          .data
          ?.data
          ?.contacts ||
        []
      : [];

  /*
  |--------------------------------------------------------------------------
  | Route
  |--------------------------------------------------------------------------
  */

  const routeType =
    useMemo(
      () =>
        getLeadRouteType(
          lead
        ),
      [
        lead,
      ]
    );

  const routeLabel =
    getRouteLabel(
      routeType
    );

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
  | Update Field
  |--------------------------------------------------------------------------
  */

  const update = (
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

    if (error) {
      setError("");
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Close
  |--------------------------------------------------------------------------
  */

  const handleClose =
    () => {
      if (
        mutation.isPending
      ) {
        return;
      }

      onClose();
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

    const handleKeyDown = (
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

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown
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
      | Completeness Gate
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
      | Route
      |--------------------------------------------------------------------------
      */

      if (
        !routeType
      ) {
        setError(
          "Lead route information is unavailable."
        );

        return;
      }

      /*
      |--------------------------------------------------------------------------
      | Route Decision Note
      |--------------------------------------------------------------------------
      */

      if (
        !form
          .routeDecisionNote
          .trim()
      ) {
        setError(
          "Route decision note is required."
        );

        return;
      }

      /*
      |--------------------------------------------------------------------------
      | Save
      |--------------------------------------------------------------------------
      */

      try {
        await mutation.mutateAsync({
          leadId:
            Number(
              lead.id
            ),

          data: {
            businessObjective:
              form
                .businessObjective
                .trim() ||
              null,

            clientProblem:
              form
                .clientProblem
                .trim() ||
              null,

            targetAudience:
              form
                .targetAudience
                .trim() ||
              null,

            campaignRequirement:
              form
                .campaignRequirement
                .trim() ||
              null,

            currentActivity:
              form
                .currentActivity
                .trim() ||
              null,

            potentialScope:
              form
                .potentialScope
                .trim() ||
              null,

            timeline:
              form
                .timeline
                .trim() ||
              null,

            budget:
              form
                .budget
                .trim() ||
              null,

            /*
            |--------------------------------------------------------------------------
            | NO decisionMaker
            |--------------------------------------------------------------------------
            |
            | Decision makers already belong to Contacts.
            |
            */

            approvalProcess:
              form
                .approvalProcess
                .trim() ||
              null,

            expectedDeliverables:
              form
                .expectedDeliverables
                .trim() ||
              null,

            clientExpectations:
              form
                .clientExpectations
                .trim() ||
              null,

            competitors:
              form
                .competitors
                .trim() ||
              null,

            categoryInsights:
              form
                .categoryInsights
                .trim() ||
              null,

            mandatoryRequirements:
              form
                .mandatoryRequirements
                .trim() ||
              null,

            status:
              form.status,

            /*
            |--------------------------------------------------------------------------
            | Route From Lead
            |--------------------------------------------------------------------------
            */

            routeType,

            routeDecisionNote:
              form
                .routeDecisionNote
                .trim() ||
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
          const fields =
            response.errors
              .map(
                (
                  item
                ) =>
                  item.field
              )
              .filter(
                Boolean
              );

          setError(
            fields.length
              ? `Complete: ${fields
                  .map(
                    (
                      field
                    ) =>
                      FIELD_LABELS[
                        field
                      ] ||
                      field
                  )
                  .join(", ")}`
              : response.message ||
                  "Brief is incomplete."
          );

          return;
        }

        setError(
          response?.message ||
            requestError
              ?.message ||
            "Unable to save brief."
        );
      }
    };

  /*
  |--------------------------------------------------------------------------
  | Render
  |--------------------------------------------------------------------------
  */

  return (
    <div
      className="modal-backdrop"
      onMouseDown={(
        event
      ) => {
        if (
          event.target ===
            event.currentTarget &&
          !mutation.isPending
        ) {
          handleClose();
        }
      }}
    >
      <section
        className="tl-modal brief-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="brief-modal-title"
      >
        {/* Header */}

        <header className="modal-head">
          <div>
            <h2 id="brief-modal-title">
              {brief
                ? "Edit brief"
                : "Add brief"}
            </h2>

            <p>
              Capture detailed
              client requirements
              without repeating
              existing CRM data.
            </p>
          </div>

          <button
            type="button"
            className="icon-control"
            onClick={
              handleClose
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

        <div className="modal-body brief-modal-body">
          {error && (
            <div className="error-box">
              {error}
            </div>
          )}

          {/* ------------------------------------------------------------- */}
          {/* Lead Context */}
          {/* ------------------------------------------------------------- */}

          <div className="form-section">
            <h3>
              Lead context
            </h3>

            <div className="info-grid">
              <div className="info-field">
                <small>
                  Company
                </small>

                <b>
                  {lead.companyName ||
                    "—"}
                </b>
              </div>

              <div className="info-field">
                <small>
                  Potential requirement
                </small>

                <b>
                  {lead.serviceRequired ||
                    "—"}
                </b>
              </div>

              <div className="info-field">
                <small>
                  Opportunity value
                </small>

                <b>
                  {formatOpportunityValue(
                    lead.estimatedValueRupees
                  )}
                </b>
              </div>

              <div className="info-field">
                <small>
                  Primary contact
                </small>

                <b>
                  {lead.primaryContactName ||
                    "—"}
                </b>
              </div>

              <div className="info-field">
                <small>
                  Primary branch
                </small>

                <b>
                  {lead.branchName ||
                    "—"}
                </b>
              </div>

              <div className="info-field">
                <small>
                  Lead owner
                </small>

                <b>
                  {lead.ownerName ||
                    "—"}
                </b>
              </div>

              <div className="info-field">
                <small>
                  Client / industry
                  route
                </small>

                <b>
                  {routeLabel}
                </b>
              </div>
            </div>
          </div>

          {/* ------------------------------------------------------------- */}
          {/* Decision Makers */}
          {/* ------------------------------------------------------------- */}

          <div className="form-section">
            <h3>
              Decision makers
            </h3>

            <p className="muted">
              Taken automatically
              from Company Contacts.
              Update decision makers
              from the Contacts
              section, not from the
              Brief.
            </p>

            {decisionMakersQuery
              .isLoading && (
              <div
                className="brief-route-preview"
                style={{
                  marginTop:
                    "12px",
                }}
              >
                <span>
                  Loading decision
                  makers...
                </span>
              </div>
            )}

            {decisionMakersQuery
              .isError && (
              <div
                className="error-box"
                style={{
                  marginTop:
                    "12px",
                }}
              >
                Unable to load
                decision makers from
                Contacts.
              </div>
            )}

            {!decisionMakersQuery
              .isLoading &&
              !decisionMakersQuery
                .isError &&
              decisionMakers.length ===
                0 && (
                <div
                  className="brief-route-preview"
                  style={{
                    marginTop:
                      "12px",
                  }}
                >
                  <b>
                    No decision makers
                  </b>

                  <span>
                    No active contact
                    for this company
                    is currently
                    marked as a
                    decision maker.
                  </span>
                </div>
              )}

            {decisionMakers.length >
              0 && (
              <div
                className="info-grid"
                style={{
                  marginTop:
                    "12px",
                }}
              >
                {decisionMakers.map(
                  (
                    contact
                  ) => (
                    <div
                      key={
                        contact.id
                      }
                      className="info-field"
                    >
                      <small>
                        {contact
                          .designation ||
                          "Decision maker"}
                      </small>

                      <b>
                        {contact.name}
                      </b>

                      {contact.email && (
                        <span className="muted">
                          {
                            contact.email
                          }
                        </span>
                      )}

                      {contact.phone && (
                        <span className="muted">
                          {
                            contact.phone
                          }
                        </span>
                      )}
                    </div>
                  )
                )}
              </div>
            )}
          </div>

          {/* ------------------------------------------------------------- */}
          {/* Completeness */}
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
              }{" "}
              required fields
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
                Detailed campaign
                requirement *

                <textarea
                  rows="3"
                  value={
                    form.campaignRequirement
                  }
                  placeholder="Add detailed requirements beyond the initial potential requirement."
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
                Current marketing /
                campaign activity *

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
                Additional / future
                scope *

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
          {/* Timeline & Commercial */}
          {/* ------------------------------------------------------------- */}

          <div className="form-section">
            <h3>
              Timeline & commercial
              context
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
                Client confirmed
                budget *

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

              <label className="full">
                Approval process *

                <textarea
                  rows="3"
                  value={
                    form.approvalProcess
                  }
                  placeholder="e.g. Marketing review → Management approval → Finance → PO"
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
          {/* Delivery Expectations */}
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
                Mandatory
                requirements *

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
          {/* Route Decision */}
          {/* ------------------------------------------------------------- */}

          <div className="form-section">
            <h3>
              Route decision
            </h3>

            <div className="brief-route-preview">
              <b>
                {routeLabel}
              </b>

              <span>
                Automatically taken
                from the lead's
                Known client /
                industry selection.
              </span>
            </div>

            {routeType ===
              "KNOWN_EXISTING" && (
              <div className="brief-route-preview">
                <b>
                  Known / Existing
                  route
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

            {routeType ===
              "NEW_UNKNOWN" && (
              <div className="brief-route-preview">
                <b>
                  New / Unknown route
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

            <div
              className="form-grid2"
              style={{
                marginTop: "12px",
              }}
            >
              <label className="full">
                Route decision note *

                <textarea
                  rows="3"
                  value={
                    form.routeDecisionNote
                  }
                  placeholder="Add route-specific context or notes."
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
          </div>

          {/* ------------------------------------------------------------- */}
          {/* Missing Required Fields */}
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
                  .join(", ")}
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
              handleClose
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