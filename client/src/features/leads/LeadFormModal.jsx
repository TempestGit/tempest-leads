import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  X,
} from "lucide-react";

import useAuth from "../auth/useAuth.js";

import {
  useCreateLeadMutation,
  useLeadOwnersQuery,
} from "./leads.queries.js";

import {
  companyStepSchema,
  contactStepSchema,
  createLeadDefaults,
  LEAD_INDUSTRIES,
  LEAD_PRIORITIES,
  LEAD_SOURCES,
  nextActionStepSchema,
  opportunityStepSchema,
  ownershipStepSchema,
} from "./leads.schema.js";

/*
|--------------------------------------------------------------------------
| Steps
|--------------------------------------------------------------------------
*/

const STEPS = [
  "Company",
  "Contact",
  "Opportunity",
  "Ownership",
  "Next action",
];

/*
|--------------------------------------------------------------------------
| Component
|--------------------------------------------------------------------------
*/

const LeadFormModal = ({
  open,
  onClose,
}) => {
  const {
    user,
  } = useAuth();

  const ownersQuery =
    useLeadOwnersQuery(
      open
    );

  const createMutation =
    useCreateLeadMutation();

  const [
    step,
    setStep,
  ] = useState(1);

  const [
    values,
    setValues,
  ] = useState(
    createLeadDefaults
  );

  const [
    errors,
    setErrors,
  ] = useState({});

  const owners =
    ownersQuery
      .data
      ?.data
      ?.owners || [];

  /*
  |--------------------------------------------------------------------------
  | Default Owner
  |--------------------------------------------------------------------------
  */

  const defaultOwnerId =
    useMemo(
      () => {
        if (
          !owners.length
        ) {
          return "";
        }

        const current =
          owners.find(
            (owner) =>
              Number(
                owner.id
              ) ===
              Number(
                user?.id
              )
          );

        return String(
          current?.id ??
            owners[0].id
        );
      },
      [
        owners,
        user?.id,
      ]
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

    setStep(1);

    setErrors({});

    setValues(
      createLeadDefaults()
    );
  }, [open]);

  useEffect(() => {
    if (
      !open ||
      !defaultOwnerId
    ) {
      return;
    }

    setValues(
      (current) => ({
        ...current,

        ownerId:
          current.ownerId ||
          defaultOwnerId,
      })
    );
  }, [
    defaultOwnerId,
    open,
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
          !createMutation
            .isPending
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
    createMutation.isPending,
  ]);

  if (!open) {
    return null;
  }

  /*
  |--------------------------------------------------------------------------
  | Change
  |--------------------------------------------------------------------------
  */

  const change =
    (name) =>
    (event) => {
      setValues(
        (current) => ({
          ...current,
          [name]:
            event.target
              .value,
        })
      );

      setErrors(
        (current) => ({
          ...current,
          [name]:
            undefined,
          root:
            undefined,
        })
      );
    };

  /*
  |--------------------------------------------------------------------------
  | Validation
  |--------------------------------------------------------------------------
  */

  const validateStep =
    () => {
      let schema;
      let data;

      if (step === 1) {
        schema =
          companyStepSchema;

        data = {
          companyName:
            values.companyName,

          industry:
            values.industry,

          city:
            values.city,

          website:
            values.website,

          agencyRelationship:
            values.agencyRelationship,

          marketingActivity:
            values.marketingActivity,
        };
      }

      if (step === 2) {
        schema =
          contactStepSchema;

        data = {
          contactName:
            values.contactName,

          designation:
            values.designation,

          phone:
            values.phone,

          email:
            values.email,

          decisionMaker:
            values.decisionMaker,
        };
      }

      if (step === 3) {
        schema =
          opportunityStepSchema;

        data = {
          serviceRequired:
            values.serviceRequired,

          source:
            values.source,

          estimatedValueRupees:
            values.estimatedValueRupees,

          priority:
            values.priority,

          description:
            values.description,
        };
      }

      if (step === 4) {
        schema =
          ownershipStepSchema;

        data = {
          ownerId:
            values.ownerId,
        };
      }

      if (step === 5) {
        schema =
          nextActionStepSchema;

        data = {
          nextAction:
            values.nextAction,

          followUpDate:
            values.followUpDate,

          followUpTime:
            values.followUpTime,

          knownRelationship:
            values.knownRelationship,
        };
      }

      const result =
        schema.safeParse(
          data
        );

      if (
        result.success
      ) {
        setErrors({});
        return true;
      }

      const nextErrors = {};

      for (
        const issue of
        result.error.issues
      ) {
        const key =
          issue.path[0];

        if (
          !nextErrors[key]
        ) {
          nextErrors[key] =
            issue.message;
        }
      }

      setErrors(
        nextErrors
      );

      return false;
    };

  /*
  |--------------------------------------------------------------------------
  | Continue
  |--------------------------------------------------------------------------
  */

  const continueForm =
    () => {
      if (
        !validateStep()
      ) {
        return;
      }

      setStep(
        (current) =>
          Math.min(
            current + 1,
            5
          )
      );
    };

  /*
  |--------------------------------------------------------------------------
  | Submit
  |--------------------------------------------------------------------------
  */

  const submit =
    async () => {
      if (
        !validateStep()
      ) {
        return;
      }

      try {
        const time =
          values.followUpTime ||
          "10:00";

        const date =
          new Date(
            `${values.followUpDate}T${time}:00`
          );

        if (
          Number.isNaN(
            date.getTime()
          )
        ) {
          setErrors({
            followUpDate:
              "Enter a valid follow-up date.",
          });

          return;
        }

        await createMutation.mutateAsync(
          {
            company: {
              name:
                values.companyName,

              industry:
                values.industry,

              city:
                values.city,

              website:
                values.website,

              agencyRelationship:
                values.agencyRelationship,

              marketingActivity:
                values.marketingActivity,
            },

            contact: {
              name:
                values.contactName,

              designation:
                values.designation,

              phone:
                values.phone,

              email:
                values.email,

              isDecisionMaker:
                values.decisionMaker ===
                "Yes",
            },

            serviceRequired:
              values.serviceRequired,

            source:
              values.source,

            estimatedValueRupees:
              values.estimatedValueRupees ===
              ""
                ? 0
                : Number(
                    values.estimatedValueRupees
                  ),

            priority:
              values.priority,

            description:
              values.description,

            ownerId:
              Number(
                values.ownerId
              ),

            nextAction:
              values.nextAction,

            followUpAt:
              date.toISOString(),

            knownRelationship:
              values.knownRelationship ===
              "Yes / Existing",
          }
        );

        onClose();
      } catch (error) {
        const response =
          error?.response
            ?.data;

        const apiErrors =
          Array.isArray(
            response?.errors
          )
            ? response.errors
            : [];

        const fieldMap = {
          "company.name":
            "companyName",

          "company.industry":
            "industry",

          "company.city":
            "city",

          "company.website":
            "website",

          "company.agencyRelationship":
            "agencyRelationship",

          "company.marketingActivity":
            "marketingActivity",

          "contact.name":
            "contactName",

          "contact.designation":
            "designation",

          "contact.phone":
            "phone",

          "contact.email":
            "email",

          "contact.isDecisionMaker":
            "decisionMaker",

          serviceRequired:
            "serviceRequired",

          source:
            "source",

          estimatedValueRupees:
            "estimatedValueRupees",

          priority:
            "priority",

          description:
            "description",

          ownerId:
            "ownerId",

          nextAction:
            "nextAction",

          followUpAt:
            "followUpDate",

          knownRelationship:
            "knownRelationship",
        };

        const stepMap = {
          companyName: 1,
          industry: 1,
          city: 1,
          website: 1,
          agencyRelationship: 1,
          marketingActivity: 1,

          contactName: 2,
          designation: 2,
          phone: 2,
          email: 2,
          decisionMaker: 2,

          serviceRequired: 3,
          source: 3,
          estimatedValueRupees: 3,
          priority: 3,
          description: 3,

          ownerId: 4,

          nextAction: 5,
          followUpDate: 5,
          followUpTime: 5,
          knownRelationship: 5,
        };

        const nextErrors = {};

        let firstErrorStep =
          null;

        for (
          const item of
          apiErrors
        ) {
          const rawField =
            String(
              item?.field ||
              ""
            ).replace(
              /^body\./,
              ""
            );

          const localField =
            fieldMap[
              rawField
            ] ||
            rawField;

          if (
            localField &&
            !nextErrors[
              localField
            ]
          ) {
            nextErrors[
              localField
            ] =
              item?.message ||
              "Invalid value.";

            const errorStep =
              stepMap[
                localField
              ];

            if (
              errorStep &&
              (
                firstErrorStep ===
                  null ||
                errorStep <
                  firstErrorStep
              )
            ) {
              firstErrorStep =
                errorStep;
            }
          }
        }

        nextErrors.root =
          apiErrors.length
            ? "Please correct the highlighted fields."
            : response?.message ||
              "Unable to create lead.";

        setErrors(
          nextErrors
        );

        if (
          firstErrorStep
        ) {
          setStep(
            firstErrorStep
          );
        }

        console.error(
          "Create lead failed:",
          response ||
            error
        );
      }
    };

  /*
  |--------------------------------------------------------------------------
  | Field Error
  |--------------------------------------------------------------------------
  */

  const fieldError =
    (field) => {
      if (
        !errors[field]
      ) {
        return null;
      }

      return (
        <span className="form-error">
          {errors[field]}
        </span>
      );
    };

  /*
  |--------------------------------------------------------------------------
  | Content
  |--------------------------------------------------------------------------
  */

  return (
    <div className="modal-backdrop">
      <section
        className="tl-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-lead-title"
      >
        <header className="modal-head">
          <div>
            <h2 id="add-lead-title">
              Add lead
            </h2>

            <p>
              Changes are saved
              securely to the CRM
              database.
            </p>
          </div>

          <button
            type="button"
            className="icon-control"
            onClick={
              onClose
            }
            disabled={
              createMutation.isPending
            }
            aria-label="Close"
          >
            <X size={15} />
          </button>
        </header>

        <div className="modal-body">
          <div className="lead-stepper">
            {STEPS.map(
                (
                label,
                index
                ) => {
                const stepNumber =
                    index + 1;

                const active =
                    step ===
                    stepNumber;

                const complete =
                    step >
                    stepNumber;

                return (
                    <button
                    key={label}
                    type="button"
                    className={[
                        "lead-step",

                        active
                        ? "is-active"
                        : "",

                        complete
                        ? "is-complete"
                        : "",
                    ]
                        .filter(
                        Boolean
                        )
                        .join(" ")}
                    onClick={() => {
                        /*
                        |--------------------------------------------------------------
                        | User may move backwards only.
                        |--------------------------------------------------------------
                        */

                        if (
                        stepNumber <
                        step
                        ) {
                        setErrors({});

                        setStep(
                            stepNumber
                        );
                        }
                    }}
                    >
                    <span className="lead-step-number">
                        {complete
                        ? "✓"
                        : stepNumber}
                    </span>

                    <span className="lead-step-copy">
                        <small>
                        Step{" "}
                        {
                            stepNumber
                        }
                        </small>

                        <b>
                        {label}
                        </b>
                    </span>
                    </button>
                );
                }
            )}
            </div>

          {errors.root && (
            <div className="error-box">
              {
                errors.root
              }
            </div>
          )}

          {/* STEP 1 */}

          {step === 1 && (
            <div className="form-section">
              <h3>
                Company
                information
              </h3>

              <div className="form-grid2">
                <label>
                  Company name *

                  <input
                    value={
                      values.companyName
                    }
                    onChange={
                      change(
                        "companyName"
                      )
                    }
                    autoFocus
                  />

                  {fieldError(
                    "companyName"
                  )}
                </label>

                <label>
                  Industry *

                  <select
                    value={
                      values.industry
                    }
                    onChange={
                      change(
                        "industry"
                      )
                    }
                  >
                    {LEAD_INDUSTRIES.map(
                      (
                        item
                      ) => (
                        <option
                          key={
                            item
                          }
                          value={
                            item
                          }
                        >
                          {item}
                        </option>
                      )
                    )}
                  </select>

                  {fieldError(
                    "industry"
                  )}
                </label>

                <label>
                  City

                  <input
                    value={
                      values.city
                    }
                    onChange={
                      change(
                        "city"
                      )
                    }
                  />
                </label>

                <label>
                  Website

                  <input
                    value={
                      values.website
                    }
                    onChange={
                      change(
                        "website"
                      )
                    }
                  />
                </label>

                <label>
                  Existing agency

                  <input
                    value={
                      values.agencyRelationship
                    }
                    onChange={
                      change(
                        "agencyRelationship"
                      )
                    }
                  />
                </label>

                <label className="full">
                  Marketing activity

                  <textarea
                    rows="3"
                    value={
                      values.marketingActivity
                    }
                    onChange={
                      change(
                        "marketingActivity"
                      )
                    }
                  />
                </label>
              </div>
            </div>
          )}

          {/* STEP 2 */}

          {step === 2 && (
            <div className="form-section">
              <h3>
                Primary contact
              </h3>

              <div className="form-grid2">
                <label>
                  Contact name *

                  <input
                    value={
                      values.contactName
                    }
                    onChange={
                      change(
                        "contactName"
                      )
                    }
                    autoFocus
                  />

                  {fieldError(
                    "contactName"
                  )}
                </label>

                <label>
                  Designation

                  <input
                    value={
                      values.designation
                    }
                    onChange={
                      change(
                        "designation"
                      )
                    }
                  />
                </label>

                <label>
                  Phone

                  <input
                    type="tel"
                    value={
                      values.phone
                    }
                    onChange={
                      change(
                        "phone"
                      )
                    }
                  />
                </label>

                <label>
                  Email

                  <input
                    type="email"
                    value={
                      values.email
                    }
                    onChange={
                      change(
                        "email"
                      )
                    }
                  />

                  {fieldError(
                    "email"
                  )}
                </label>

                <label>
                  Decision maker

                  <select
                    value={
                      values.decisionMaker
                    }
                    onChange={
                      change(
                        "decisionMaker"
                      )
                    }
                  >
                    <option>
                      Yes
                    </option>

                    <option>
                      No
                    </option>
                  </select>
                </label>
              </div>
            </div>
          )}

          {/* STEP 3 */}

          {step === 3 && (
            <div className="form-section">
              <h3>
                Opportunity
              </h3>

              <div className="form-grid2">
                <label>
                  Potential
                  requirement *

                  <input
                    value={
                      values.serviceRequired
                    }
                    onChange={
                      change(
                        "serviceRequired"
                      )
                    }
                    autoFocus
                  />

                  {fieldError(
                    "serviceRequired"
                  )}
                </label>

                <label>
                  Lead source *

                  <select
                    value={
                      values.source
                    }
                    onChange={
                      change(
                        "source"
                      )
                    }
                  >
                    {LEAD_SOURCES.map(
                      (
                        item
                      ) => (
                        <option
                          key={
                            item
                          }
                          value={
                            item
                          }
                        >
                          {item}
                        </option>
                      )
                    )}
                  </select>
                </label>

                <label>
                  Opportunity
                  value

                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={
                      values.estimatedValueRupees
                    }
                    onChange={
                      change(
                        "estimatedValueRupees"
                      )
                    }
                  />

                  {fieldError(
                    "estimatedValueRupees"
                  )}
                </label>

                <label>
                  Priority

                  <select
                    value={
                      values.priority
                    }
                    onChange={
                      change(
                        "priority"
                      )
                    }
                  >
                    {LEAD_PRIORITIES.map(
                      (
                        item
                      ) => (
                        <option
                          key={
                            item
                          }
                        >
                          {item}
                        </option>
                      )
                    )}
                  </select>
                </label>

                <label className="full">
                  Opportunity
                  description

                  <textarea
                    rows="3"
                    value={
                      values.description
                    }
                    onChange={
                      change(
                        "description"
                      )
                    }
                  />
                </label>
              </div>
            </div>
          )}

          {/* STEP 4 */}

          {step === 4 && (
            <div className="form-section">
              <h3>
                Ownership
              </h3>

              {ownersQuery.isError && (
                <div className="error-box">
                  {ownersQuery
                    .error
                    ?.response
                    ?.data
                    ?.message ||
                    "Unable to load owners."}

                  <div
                    style={{
                      marginTop:
                        "8px",
                    }}
                  >
                    <button
                      type="button"
                      className="tl-link"
                      onClick={() =>
                        ownersQuery.refetch()
                      }
                    >
                      Try again
                    </button>
                  </div>
                </div>
              )}

              {!ownersQuery.isLoading &&
                !ownersQuery.isError &&
                owners.length === 0 && (
                  <div className="error-box">
                    No active owners are
                    available.
                  </div>
                )}

              <div className="form-grid2">
                <label>
                  Owner *

                  <select
                    value={
                      values.ownerId
                    }
                    onChange={
                      change(
                        "ownerId"
                      )
                    }
                    disabled={
                      ownersQuery.isLoading ||
                      ownersQuery.isError
                    }
                    autoFocus
                  >
                    <option value="">
                      {ownersQuery.isLoading
                        ? "Loading owners..."
                        : owners.length === 0
                          ? "No owners available"
                          : "Select owner"}
                    </option>

                    {owners.map(
                      (
                        owner
                      ) => (
                        <option
                          key={
                            owner.id
                          }
                          value={
                            owner.id
                          }
                        >
                          {owner.fullName ||
                            owner.name ||
                            `User ${owner.id}`}

                          {owner.branchName
                            ? ` · ${owner.branchName}`
                            : ""}
                        </option>
                      )
                    )}
                  </select>

                  {fieldError(
                    "ownerId"
                  )}
                </label>
              </div>
            </div>
          )}

          {/* STEP 5 */}

          {step === 5 && (
            <div className="form-section">
              <h3>
                Next action
              </h3>

              <div className="form-grid2">
                <label>
                  Next action *

                  <input
                    value={
                      values.nextAction
                    }
                    onChange={
                      change(
                        "nextAction"
                      )
                    }
                    autoFocus
                  />

                  {fieldError(
                    "nextAction"
                  )}
                </label>

                <label>
                  Follow-up date *

                  <input
                    type="date"
                    value={
                      values.followUpDate
                    }
                    onChange={
                      change(
                        "followUpDate"
                      )
                    }
                  />

                  {fieldError(
                    "followUpDate"
                  )}
                </label>

                <label>
                  Follow-up time

                  <input
                    type="time"
                    value={
                      values.followUpTime
                    }
                    onChange={
                      change(
                        "followUpTime"
                      )
                    }
                  />
                </label>

                <label>
                  Known client /
                  industry?

                  <select
                    value={
                      values.knownRelationship
                    }
                    onChange={
                      change(
                        "knownRelationship"
                      )
                    }
                  >
                    <option>
                      No / Unknown
                    </option>

                    <option>
                      Yes / Existing
                    </option>
                  </select>
                </label>
              </div>
            </div>
          )}
        </div>

        <footer className="modal-foot">
          <button
            type="button"
            className="tl-secondary"
            disabled={
              createMutation.isPending
            }
            onClick={
              onClose
            }
          >
            Cancel
          </button>

          {step < 5 ? (
            <button
              type="button"
              className="tl-primary"
              onClick={
                continueForm
              }
            >
              Continue
            </button>
          ) : (
            <button
              type="button"
              className="tl-primary"
              disabled={
                createMutation.isPending
              }
              onClick={
                submit
              }
            >
              Create lead
            </button>
          )}
        </footer>
      </section>
    </div>
  );
};

export default LeadFormModal;