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
| Local Date / Time Helpers
|--------------------------------------------------------------------------
*/

const getLocalDate = () => {
  const now =
    new Date();

  const year =
    now.getFullYear();

  const month =
    String(
      now.getMonth() + 1
    ).padStart(
      2,
      "0"
    );

  const day =
    String(
      now.getDate()
    ).padStart(
      2,
      "0"
    );

  return `${year}-${month}-${day}`;
};

const getLocalTime = () => {
  const now =
    new Date();

  const hours =
    String(
      now.getHours()
    ).padStart(
      2,
      "0"
    );

  const minutes =
    String(
      now.getMinutes()
    ).padStart(
      2,
      "0"
    );

  return `${hours}:${minutes}`;
};

const getCurrentDateTimeValues =
  () => ({
    date:
      getLocalDate(),

    time:
      getLocalTime(),
  });

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

  /*
  |--------------------------------------------------------------------------
  | Form
  |--------------------------------------------------------------------------
  */

  const [
    step,
    setStep,
  ] =
    useState(
      1
    );

  const [
    values,
    setValues,
  ] =
    useState(
      createLeadDefaults
    );

  const [
    errors,
    setErrors,
  ] =
    useState({});

  /*
  |--------------------------------------------------------------------------
  | Branch Options
  |--------------------------------------------------------------------------
  |
  | Always call without branchId.
  |
  | SUPER_ADMIN:
  | returns all active branches.
  |
  | OWNER:
  | returns their assigned branch.
  |
  */

  const branchOptionsQuery =
    useLeadOwnersQuery(
      null,
      open
    );

  const branches =
    branchOptionsQuery
      .data
      ?.data
      ?.branches ||
    [];

  /*
  |--------------------------------------------------------------------------
  | Owners For Selected Branch
  |--------------------------------------------------------------------------
  */

  const ownersQuery =
    useLeadOwnersQuery(
      values.branchId ||
        null,

      open &&
        Boolean(
          values.branchId
        )
    );

  const owners =
    ownersQuery
      .data
      ?.data
      ?.owners ||
    [];

  /*
  |--------------------------------------------------------------------------
  | Create
  |--------------------------------------------------------------------------
  */

  const createMutation =
    useCreateLeadMutation();

  /*
  |--------------------------------------------------------------------------
  | Selected Branch
  |--------------------------------------------------------------------------
  */

  const selectedBranch =
    useMemo(
      () =>
        branches.find(
          (
            branch
          ) =>
            Number(
              branch.id
            ) ===
            Number(
              values.branchId
            )
        ) ||
        ownersQuery
          .data
          ?.data
          ?.selectedBranch ||
        null,
      [
        branches,
        ownersQuery
          .data,
        values.branchId,
      ]
    );

  /*
  |--------------------------------------------------------------------------
  | Default Branch For Normal Owner
  |--------------------------------------------------------------------------
  |
  | Normal users receive only one branch from the backend.
  |
  | Super Admin receives all branches and must choose manually.
  |
  */

  useEffect(() => {
    if (
      !open ||
      values.branchId ||
      branches.length !==
        1
    ) {
      return;
    }

    setValues(
      (
        current
      ) => ({
        ...current,

        branchId:
          String(
            branches[0]
              .id
          ),

        ownerId:
          "",
      })
    );
  }, [
    branches,
    open,
    values.branchId,
  ]);

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

        /*
         * Prefer currently logged-in
         * user when available.
         */
        const current =
          owners.find(
            (
              owner
            ) =>
              Number(
                owner.id
              ) ===
              Number(
                user?.id
              )
          );

        if (
          current
        ) {
          return String(
            current.id
          );
        }

        /*
         * Otherwise use first
         * available owner.
         */
        return String(
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
    if (
      !open
    ) {
      return;
    }

    const now =
      getCurrentDateTimeValues();

    setStep(
      1
    );

    setErrors({});

    setValues({
      ...createLeadDefaults(),

      followUpDate:
        now.date,

      followUpTime:
        now.time,
    });
  }, [
    open,
  ]);

  /*
  |--------------------------------------------------------------------------
  | Apply Default Owner
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (
      !open ||
      !values.branchId ||
      !defaultOwnerId
    ) {
      return;
    }

    setValues(
      (
        current
      ) => {
        /*
         * Do not overwrite a valid
         * manual owner selection.
         */
        if (
          current.ownerId
        ) {
          return current;
        }

        return {
          ...current,

          ownerId:
            defaultOwnerId,
        };
      }
    );
  }, [
    defaultOwnerId,
    open,
    values.branchId,
  ]);

  /*
  |--------------------------------------------------------------------------
  | Escape
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (
      !open
    ) {
      return undefined;
    }

    const handler =
      (
        event
      ) => {
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
    createMutation
      .isPending,
  ]);

  /*
  |--------------------------------------------------------------------------
  | Close
  |--------------------------------------------------------------------------
  */

  const handleClose =
    () => {
      if (
        createMutation
          .isPending
      ) {
        return;
      }

      onClose();
    };

  /*
  |--------------------------------------------------------------------------
  | Generic Change
  |--------------------------------------------------------------------------
  */

  const change =
    (
      name
    ) =>
    (
      event
    ) => {
      setValues(
        (
          current
        ) => ({
          ...current,

          [name]:
            event.target
              .value,
        })
      );

      setErrors(
        (
          current
        ) => ({
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
  | Branch Change
  |--------------------------------------------------------------------------
  |
  | Important:
  |
  | Changing the primary branch MUST clear the existing owner.
  |
  | Example:
  |
  | Hyderabad / Venu
  |
  | changes to
  |
  | Pune / [empty owner]
  |
  | and Pune owners are loaded.
  |
  */

  const changeBranch =
    (
      event
    ) => {
      const branchId =
        event.target
          .value;

      setValues(
        (
          current
        ) => ({
          ...current,

          branchId,

          ownerId:
            "",
        })
      );

      setErrors(
        (
          current
        ) => ({
          ...current,

          branchId:
            undefined,

          ownerId:
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

      if (
        step ===
        1
      ) {
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

      if (
        step ===
        2
      ) {
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

      if (
        step ===
        3
      ) {
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

      if (
        step ===
        4
      ) {
        schema =
          ownershipStepSchema;

        data = {
          branchId:
            values.branchId,

          ownerId:
            values.ownerId,
        };
      }

      if (
        step ===
        5
      ) {
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

      const nextErrors =
        {};

      for (
        const issue of
        result.error
          .issues
      ) {
        const key =
          issue.path[0];

        if (
          !nextErrors[
            key
          ]
        ) {
          nextErrors[
            key
          ] =
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
        (
          current
        ) =>
          Math.min(
            current + 1,
            5
          )
      );
    };

  /*
  |--------------------------------------------------------------------------
  | Previous
  |--------------------------------------------------------------------------
  */

  const previousStep =
    () => {
      setErrors({});

      setStep(
        (
          current
        ) =>
          Math.max(
            current - 1,
            1
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
      /*
      |--------------------------------------------------------------------------
      | Follow-up Date / Time
      |--------------------------------------------------------------------------
      */

      const time =
        values.followUpTime ||
        getLocalTime();

      const date =
        new Date(
          `${values.followUpDate}T${time}:00`
        );

      /*
      |--------------------------------------------------------------------------
      | Invalid Date
      |--------------------------------------------------------------------------
      */

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

      /*
      |--------------------------------------------------------------------------
      | Prevent Past Date / Time
      |--------------------------------------------------------------------------
      |
      | 60 second tolerance prevents a valid "current minute" from failing
      | just because a few seconds passed before Create Lead was clicked.
      |
      */

      const now =
        new Date();

      const minimumAllowed =
        now.getTime() -
        60 * 1000;

      if (
        date.getTime() <
        minimumAllowed
      ) {
        setErrors({
          followUpDate:
            "Follow-up date and time cannot be in the past.",

          followUpTime:
            "Select the current time or a future time.",
        });

        return;
      }

      /*
      |--------------------------------------------------------------------------
      | Create Lead
      |--------------------------------------------------------------------------
      */

      await createMutation
        .mutateAsync({
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
            values
              .estimatedValueRupees ===
            ""
              ? 0
              : Number(
                  values
                    .estimatedValueRupees
                ),

          priority:
            values.priority,

          description:
            values.description,

          /*
          |--------------------------------------------------------------------------
          | Primary Branch
          |--------------------------------------------------------------------------
          */

          branchId:
            Number(
              values.branchId
            ),

          /*
          |--------------------------------------------------------------------------
          | Owner
          |--------------------------------------------------------------------------
          */

          ownerId:
            Number(
              values.ownerId
            ),

          nextAction:
            values.nextAction,

          followUpAt:
            date.toISOString(),

          knownRelationship:
            values
              .knownRelationship ===
            "Yes / Existing",
        });

      onClose();
    } catch (
      error
    ) {
      setErrors({
        root:
          error
            ?.response
            ?.data
            ?.message ||
          error
            ?.message ||
          "Unable to create lead.",
      });
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Field Error
  |--------------------------------------------------------------------------
  */

  const fieldError =
    (
      field
    ) => {
      if (
        !errors[
          field
        ]
      ) {
        return null;
      }

      return (
        <span className="form-error">
          {
            errors[
              field
            ]
          }
        </span>
      );
    };

  /*
  |--------------------------------------------------------------------------
  | Not Open
  |--------------------------------------------------------------------------
  */

  if (
    !open
  ) {
    return null;
  }

  const today =
    getLocalDate();

  const currentTime =
    getLocalTime();

  /*
  |--------------------------------------------------------------------------
  | Content
  |--------------------------------------------------------------------------
  */

  return (
    <div
      className="modal-backdrop"
    >
      <section
        className="tl-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-lead-title"
      >
        {/* --------------------------------------------------------------- */}
        {/* Header */}
        {/* --------------------------------------------------------------- */}

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
              handleClose
            }
            disabled={
              createMutation
                .isPending
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

        {/* --------------------------------------------------------------- */}
        {/* Body */}
        {/* --------------------------------------------------------------- */}

        <div className="modal-body">
          {/* ------------------------------------------------------------- */}
          {/* Stepper */}
          {/* ------------------------------------------------------------- */}

          <div className="lead-stepper">
            {STEPS.map(
              (
                label,
                index
              ) => {
                const stepNumber =
                  index +
                  1;

                const active =
                  step ===
                  stepNumber;

                const complete =
                  step >
                  stepNumber;

                return (
                  <button
                    key={
                      label
                    }
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
                      .join(
                        " "
                      )}
                    onClick={() => {
                      /*
                       * Backward movement only.
                       */
                      if (
                        stepNumber <
                        step
                      ) {
                        setErrors(
                          {}
                        );

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
                        {
                          label
                        }
                      </b>
                    </span>
                  </button>
                );
              }
            )}
          </div>

          {/* ------------------------------------------------------------- */}
          {/* Root Error */}
          {/* ------------------------------------------------------------- */}

          {errors.root && (
            <div className="error-box">
              {
                errors.root
              }
            </div>
          )}

          {/* ------------------------------------------------------------- */}
          {/* STEP 1 - Company */}
          {/* ------------------------------------------------------------- */}

          {step ===
            1 && (
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
                      values
                        .companyName
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
                      values
                        .industry
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
                          {
                            item
                          }
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
                      values
                        .city
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
                      values
                        .website
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
                      values
                        .agencyRelationship
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
                      values
                        .marketingActivity
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

          {/* ------------------------------------------------------------- */}
          {/* STEP 2 - Contact */}
          {/* ------------------------------------------------------------- */}

          {step ===
            2 && (
            <div className="form-section">
              <h3>
                Primary contact
              </h3>

              <div className="form-grid2">
                <label>
                  Contact name *

                  <input
                    value={
                      values
                        .contactName
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
                      values
                        .designation
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
                    inputMode="numeric"
                    maxLength={10}
                    value={values.phone}
                    onChange={(event) => {
                      const value =
                        event.target.value
                          .replace(/\D/g, "")
                          .slice(0, 10);

                      change("phone")({
                        ...event,
                        target: {
                          ...event.target,
                          value,
                        },
                      });
                    }}
                    placeholder="9876543210"
                  />

                  {errors.phone && (
                    <span className="form-error">
                      {errors.phone}
                    </span>
                  )}
                </label>

                <label>
                  Email

                  <input
                    type="email"
                    value={
                      values
                        .email
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
                      values
                        .decisionMaker
                    }
                    onChange={
                      change(
                        "decisionMaker"
                      )
                    }
                  >
                    <option value="Yes">
                      Yes
                    </option>

                    <option value="No">
                      No
                    </option>
                  </select>
                </label>
              </div>
            </div>
          )}

          {/* ------------------------------------------------------------- */}
          {/* STEP 3 - Opportunity */}
          {/* ------------------------------------------------------------- */}

          {step ===
            3 && (
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
                      values
                        .serviceRequired
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
                      values
                        .source
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
                          {
                            item
                          }
                        </option>
                      )
                    )}
                  </select>

                  {fieldError(
                    "source"
                  )}
                </label>

                <label>
                  Opportunity
                  value

                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={
                      values
                        .estimatedValueRupees
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
                      values
                        .priority
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
                          value={
                            item
                          }
                        >
                          {
                            item
                          }
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
                      values
                        .description
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

          {/* ------------------------------------------------------------- */}
          {/* STEP 4 - Ownership */}
          {/* ------------------------------------------------------------- */}

          {step ===
            4 && (
            <div className="form-section">
              <h3>
                Ownership
              </h3>

              {/* Branch loading error */}

              {branchOptionsQuery
                .isError && (
                <div className="error-box">
                  {branchOptionsQuery
                    .error
                    ?.response
                    ?.data
                    ?.message ||
                    "Unable to load branches."}

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
                        branchOptionsQuery
                          .refetch()
                      }
                    >
                      Try again
                    </button>
                  </div>
                </div>
              )}

              <div className="form-grid2">
                {/* ------------------------------------------------------- */}
                {/* Branch */}
                {/* ------------------------------------------------------- */}

                <label>
                  Primary branch *

                  <select
                    value={
                      values
                        .branchId
                    }
                    onChange={
                      changeBranch
                    }
                    disabled={
                      branchOptionsQuery
                        .isLoading ||
                      branchOptionsQuery
                        .isError ||
                      branches.length ===
                        0 ||
                      (
                        user?.role !==
                          "SUPER_ADMIN" &&
                        branches.length ===
                          1
                      )
                    }
                    autoFocus
                  >
                    <option value="">
                      {branchOptionsQuery
                        .isLoading
                        ? "Loading branches..."
                        : branches.length ===
                            0
                          ? "No branches available"
                          : "Select branch"}
                    </option>

                    {branches.map(
                      (
                        branch
                      ) => (
                        <option
                          key={
                            branch.id
                          }
                          value={
                            String(
                              branch.id
                            )
                          }
                        >
                          {
                            branch.name
                          }
                        </option>
                      )
                    )}
                  </select>

                  {fieldError(
                    "branchId"
                  )}
                </label>

                {/* ------------------------------------------------------- */}
                {/* Owner */}
                {/* ------------------------------------------------------- */}

                <label>
                  Owner *

                  <select
                    value={
                      values
                        .ownerId
                    }
                    onChange={
                      change(
                        "ownerId"
                      )
                    }
                    disabled={
                      !values
                        .branchId ||
                      ownersQuery
                        .isLoading ||
                      ownersQuery
                        .isError ||
                      owners.length ===
                        0
                    }
                  >
                    <option value="">
                      {!values
                        .branchId
                        ? "Select branch first"
                        : ownersQuery
                              .isLoading
                          ? "Loading owners..."
                          : owners.length ===
                              0
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
                            String(
                              owner.id
                            )
                          }
                        >
                          {owner.fullName ||
                            owner.name ||
                            `User ${owner.id}`}

                          {owner.role ===
                          "SUPER_ADMIN"
                            ? " · Global"
                            : owner.branchName
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

              {/* --------------------------------------------------------- */}
              {/* Owner Query Error */}
              {/* --------------------------------------------------------- */}

              {values.branchId &&
                ownersQuery
                  .isError && (
                  <div
                    className="error-box"
                    style={{
                      marginTop:
                        "12px",
                    }}
                  >
                    {ownersQuery
                      .error
                      ?.response
                      ?.data
                      ?.message ||
                      "Unable to load owners for the selected branch."}

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
                          ownersQuery
                            .refetch()
                        }
                      >
                        Try again
                      </button>
                    </div>
                  </div>
                )}

              {/* --------------------------------------------------------- */}
              {/* No Owners */}
              {/* --------------------------------------------------------- */}

              {values.branchId &&
                !ownersQuery
                  .isLoading &&
                !ownersQuery
                  .isError &&
                owners.length ===
                  0 && (
                  <div
                    className="error-box"
                    style={{
                      marginTop:
                        "12px",
                    }}
                  >
                    No active owners
                    are available for
                    this branch.
                  </div>
                )}

              {/* --------------------------------------------------------- */}
              {/* Selected Branch Summary */}
              {/* --------------------------------------------------------- */}

              {selectedBranch && (
                <div
                  className="brief-clarification"
                  style={{
                    marginTop:
                      "12px",
                  }}
                >
                  <b>
                    Primary branch
                  </b>

                  <span>
                    {
                      selectedBranch.name
                    }

                    {selectedBranch.code
                      ? ` (${selectedBranch.code})`
                      : ""}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* ------------------------------------------------------------- */}
          {/* STEP 5 - Next Action */}
          {/* ------------------------------------------------------------- */}

          {step ===
            5 && (
            <div className="form-section">
              <h3>
                Next action
              </h3>

              <div className="form-grid2">
                <label>
                  Next action *

                  <input
                    value={
                      values
                        .nextAction
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
                    min={
                      today
                    }
                    value={
                      values
                        .followUpDate
                    }
                    onChange={(event) => {
                      const selectedDate =
                        event.target.value;

                      const nowTime =
                        getLocalTime();

                      setValues(
                        (
                          current
                        ) => {
                          let nextTime =
                            current
                              .followUpTime;

                          /*
                          * If the user selects today
                          * and the selected time is
                          * already past, move it to
                          * the current time.
                          */
                          if (
                            selectedDate ===
                              getLocalDate() &&
                            (
                              !nextTime ||
                              nextTime <
                                nowTime
                            )
                          ) {
                            nextTime =
                              nowTime;
                          }

                          return {
                            ...current,

                            followUpDate:
                              selectedDate,

                            followUpTime:
                              nextTime,
                          };
                        }
                      );

                      setErrors(
                        (
                          current
                        ) => ({
                          ...current,

                          followUpDate:
                            undefined,

                          followUpTime:
                            undefined,

                          root:
                            undefined,
                        })
                      );
                    }}
                  />

                  {fieldError(
                    "followUpDate"
                  )}
                </label>

                <label>
                  Follow-up time *

                  <input
                    type="time"
                    min={
                      values
                        .followUpDate ===
                      today
                        ? currentTime
                        : undefined
                    }
                    value={
                      values
                        .followUpTime
                    }
                    onChange={(event) => {
                      const selectedTime =
                        event.target.value;

                      /*
                      * If date is today, don't
                      * accept a past time.
                      */
                      if (
                        values
                          .followUpDate ===
                          getLocalDate() &&
                        selectedTime <
                          getLocalTime()
                      ) {
                        setErrors(
                          (
                            current
                          ) => ({
                            ...current,

                            followUpTime:
                              "Select the current time or a future time.",
                          })
                        );

                        return;
                      }

                      setValues(
                        (
                          current
                        ) => ({
                          ...current,

                          followUpTime:
                            selectedTime,
                        })
                      );

                      setErrors(
                        (
                          current
                        ) => ({
                          ...current,

                          followUpTime:
                            undefined,

                          root:
                            undefined,
                        })
                      );
                    }}
                  />

                  {fieldError(
                    "followUpTime"
                  )}
                </label>

                <label>
                  Known client /
                  industry?

                  <select
                    value={
                      values
                        .knownRelationship
                    }
                    onChange={
                      change(
                        "knownRelationship"
                      )
                    }
                  >
                    <option value="No / Unknown">
                      No / Unknown
                    </option>

                    <option value="Yes / Existing">
                      Yes / Existing
                    </option>
                  </select>
                </label>
              </div>
            </div>
          )}
        </div>

        {/* --------------------------------------------------------------- */}
        {/* Footer */}
        {/* --------------------------------------------------------------- */}

        <footer className="modal-foot">
          {step > 1 && (
            <button
              type="button"
              className="tl-secondary"
              disabled={
                createMutation
                  .isPending
              }
              onClick={
                previousStep
              }
            >
              Previous
            </button>
          )}

          {step < 5 ? (
            <button
              type="button"
              className="tl-primary"
              onClick={
                continueForm
              }
              disabled={
                createMutation
                  .isPending
              }
            >
              Continue
            </button>
          ) : (
            <button
              type="button"
              className="tl-primary"
              disabled={
                createMutation
                  .isPending
              }
              onClick={
                submit
              }
            >
              {createMutation
                .isPending
                ? "Creating..."
                : "Create lead"}
            </button>
          )}
        </footer>
      </section>
    </div>
  );
};

export default LeadFormModal;