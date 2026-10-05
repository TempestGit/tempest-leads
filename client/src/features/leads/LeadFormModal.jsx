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
  useUpdateLeadMutation,
  useChangeLeadOwnerMutation,
  useLeadOwnersQuery,
} from "./leads.queries.js";

import {
  useCompanyQuery,
  useUpdateCompanyMutation,
} from "../companies/companies.queries.js";

import {
  useContactQuery,
  useUpdateContactMutation,
} from "../contacts/contacts.queries.js";

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

const CREATE_STEPS = [
  "Company",
  "Contact",
  "Opportunity",
  "Ownership",
  "Next action",
];

const EDIT_STEPS = [
  "Company",
  "Contact",
  "Opportunity",
  "Ownership",
];

/*
|--------------------------------------------------------------------------
| Local Date
|--------------------------------------------------------------------------
*/

const getLocalDate = () => {
  const now = new Date();

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

/*
|--------------------------------------------------------------------------
| Local Time
|--------------------------------------------------------------------------
*/

const getLocalTime = () => {
  const now = new Date();

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

/*
|--------------------------------------------------------------------------
| Current Date / Time
|--------------------------------------------------------------------------
*/

const getCurrentDateTimeValues =
  () => ({
    date:
      getLocalDate(),

    time:
      getLocalTime(),
  });

/*
|--------------------------------------------------------------------------
| Convert Existing Date To Local Form Values
|--------------------------------------------------------------------------
*/

const getDateTimeFormValues = (
  value
) => {
  if (!value) {
    return getCurrentDateTimeValues();
  }

  const date =
    new Date(
      value
    );

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return getCurrentDateTimeValues();
  }

  /*
  |--------------------------------------------------------------------------
  | Existing follow-up may already be overdue.
  |--------------------------------------------------------------------------
  |
  | Our form/backend no longer accepts past follow-up dates.
  | If it is overdue, initialise it to the current local date/time.
  |
  */

  if (
    date.getTime() <
    Date.now() -
      60 * 1000
  ) {
    return getCurrentDateTimeValues();
  }

  const year =
    date.getFullYear();

  const month =
    String(
      date.getMonth() + 1
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

  return {
    date:
      `${year}-${month}-${day}`,

    time:
      `${hours}:${minutes}`,
  };
};

/*
|--------------------------------------------------------------------------
| Helper
|--------------------------------------------------------------------------
*/

const safeString = (
  value
) => {
  if (
    value === null ||
    value === undefined
  ) {
    return "";
  }

  return String(
    value
  );
};

/*
|--------------------------------------------------------------------------
| Component
|--------------------------------------------------------------------------
*/

const LeadFormModal = ({
  open,
  onClose,
  mode = "create",
  lead = null,
}) => {
  const {
    user,
  } = useAuth();

  const isEdit =
    mode === "edit" &&
    Boolean(
      lead?.id
    );

  const steps =
    isEdit
      ? EDIT_STEPS
      : CREATE_STEPS;

  const lastStep =
    steps.length;

  /*
  |--------------------------------------------------------------------------
  | Form State
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
  | Mutations
  |--------------------------------------------------------------------------
  */

  const createMutation =
    useCreateLeadMutation();

  const updateLeadMutation =
    useUpdateLeadMutation();

  const updateCompanyMutation =
    useUpdateCompanyMutation();

  const updateContactMutation =
    useUpdateContactMutation();

  const changeOwnerMutation =
    useChangeLeadOwnerMutation();

  /*
  |--------------------------------------------------------------------------
  | Company Detail
  |--------------------------------------------------------------------------
  |
  | Lead detail contains the main company fields, but the company endpoint
  | contains all company-specific fields such as agency relationship and
  | marketing activity.
  |
  */

  const companyQuery =
    useCompanyQuery(
      isEdit &&
        open
        ? lead?.companyId
        : null
    );

  const company =
    companyQuery
      .data
      ?.data
      ?.company ||
    null;

  /*
  |--------------------------------------------------------------------------
  | Contact Detail
  |--------------------------------------------------------------------------
  |
  | This is also required for isDecisionMaker.
  |
  */

  const contactQuery =
    useContactQuery(
      isEdit &&
        open
        ? lead?.primaryContactId
        : null
    );

  const contact =
    contactQuery
      .data
      ?.data
      ?.contact ||
    null;

  /*
  |--------------------------------------------------------------------------
  | Branch Options
  |--------------------------------------------------------------------------
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
  | Owners
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
        ownersQuery.data,
        values.branchId,
      ]
    );

  /*
  |--------------------------------------------------------------------------
  | Pending
  |--------------------------------------------------------------------------
  */

  const isPending =
    createMutation
      .isPending ||
    updateLeadMutation
      .isPending ||
    updateCompanyMutation
      .isPending ||
    updateContactMutation
      .isPending ||
    changeOwnerMutation
      .isPending;

  /*
  |--------------------------------------------------------------------------
  | Loading Existing Details
  |--------------------------------------------------------------------------
  */

  const editDetailsLoading =
    isEdit &&
    (
      companyQuery.isLoading ||
      contactQuery.isLoading
    );

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
  | Initialise Create Form
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (
      !open ||
      isEdit
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
    isEdit,
  ]);

  /*
  |--------------------------------------------------------------------------
  | Initialise Edit Form
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (
      !open ||
      !isEdit ||
      !lead
    ) {
      return;
    }

    /*
    |--------------------------------------------------------------------------
    | Wait For Company / Contact Detail
    |--------------------------------------------------------------------------
    */

    if (
      lead.companyId &&
      companyQuery.isLoading
    ) {
      return;
    }

    if (
      lead.primaryContactId &&
      contactQuery.isLoading
    ) {
      return;
    }

    const followUp =
      getDateTimeFormValues(
        lead.followUpAt
      );

    setStep(
      1
    );

    setErrors({});

    setValues({
      ...createLeadDefaults(),

      /*
      |--------------------------------------------------------------------------
      | Company
      |--------------------------------------------------------------------------
      */

      companyName:
        safeString(
          company?.name ??
            lead.companyName
        ),

      industry:
        safeString(
          company?.industry ??
            lead.industry
        ),

      city:
        safeString(
          company?.city ??
            lead.city
        ),

      website:
        safeString(
          company?.website ??
            lead.website
        ),

      agencyRelationship:
        safeString(
          company
            ?.agencyRelationship
        ),

      marketingActivity:
        safeString(
          company
            ?.marketingActivity
        ),

      /*
      |--------------------------------------------------------------------------
      | Contact
      |--------------------------------------------------------------------------
      */

      contactName:
        safeString(
          contact?.name ??
            contact?.fullName ??
            lead.primaryContactName
        ),

      designation:
        safeString(
          contact?.designation ??
            lead
              .primaryContactDesignation
        ),

      phone:
        safeString(
          contact?.phone ??
            lead.primaryContactPhone
        ),

      email:
        safeString(
          contact?.email ??
            lead.primaryContactEmail
        ),

      decisionMaker:
        (
          contact?.isDecisionMaker
        )
          ? "Yes"
          : "No",

      /*
      |--------------------------------------------------------------------------
      | Opportunity
      |--------------------------------------------------------------------------
      */

      serviceRequired:
        safeString(
          lead.serviceRequired
        ),

      source:
        safeString(
          lead.source
        ),

      estimatedValueRupees:
        lead
          .estimatedValueRupees ===
          null ||
        lead
          .estimatedValueRupees ===
          undefined
          ? ""
          : String(
              lead
                .estimatedValueRupees
            ),

      priority:
        safeString(
          lead.priority ||
            "Medium"
        ),

      description:
        safeString(
          lead.description
        ),

      /*
      |--------------------------------------------------------------------------
      | Ownership
      |--------------------------------------------------------------------------
      */

      branchId:
        lead.branchId
          ? String(
              lead.branchId
            )
          : "",

      ownerId:
        lead.ownerId
          ? String(
              lead.ownerId
            )
          : "",

      /*
      |--------------------------------------------------------------------------
      | Next Action
      |--------------------------------------------------------------------------
      */

      nextAction:
        safeString(
          lead.nextAction
        ),

      followUpDate:
        followUp.date,

      followUpTime:
        followUp.time,

      knownRelationship:
        lead.knownRelationship
          ? "Yes / Existing"
          : "No / Unknown",
    });
  }, [
    open,
    isEdit,
    lead,
    company,
    contact,
    companyQuery.isLoading,
    contactQuery.isLoading,
  ]);

  /*
  |--------------------------------------------------------------------------
  | Default Branch For Create Mode
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (
      !open ||
      isEdit ||
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
    isEdit,
    values.branchId,
  ]);

  /*
  |--------------------------------------------------------------------------
  | Apply Default Owner - Create Mode Only
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (
      !open ||
      isEdit ||
      !values.branchId ||
      !defaultOwnerId
    ) {
      return;
    }

    setValues(
      (
        current
      ) => {
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
    isEdit,
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
          !isPending
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
    isPending,
  ]);

  /*
  |--------------------------------------------------------------------------
  | Close
  |--------------------------------------------------------------------------
  */

  const handleClose =
    () => {
      if (
        isPending
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
            values
              .estimatedValueRupees,

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
            values
              .knownRelationship,
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
        result.error.issues
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
            lastStep
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
        let date = null;

        if (!isEdit) {
          /*
          |--------------------------------------------------------------------------
          | Follow-up Date / Time - Create Mode Only
          |--------------------------------------------------------------------------
          */

          const time =
            values.followUpTime ||
            getLocalTime();

          date =
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

          const minimumAllowed =
            Date.now() -
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
        }

        /*
        |--------------------------------------------------------------------------
        | CREATE MODE
        |--------------------------------------------------------------------------
        */

        if (
          !isEdit
        ) {
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
                  values
                    .agencyRelationship,

                marketingActivity:
                  values
                    .marketingActivity,
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
                  values
                    .decisionMaker ===
                  "Yes",
              },

              serviceRequired:
                values
                  .serviceRequired,

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

              branchId:
                Number(
                  values.branchId
                ),

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

          return;
        }

        /*
        |--------------------------------------------------------------------------
        | EDIT MODE
        |--------------------------------------------------------------------------
        */

        /*
        |--------------------------------------------------------------------------
        | 1. Update Company
        |--------------------------------------------------------------------------
        */

        if (
          lead.companyId
        ) {
          await updateCompanyMutation
            .mutateAsync({
              companyId:
                Number(
                  lead.companyId
                ),

              data: {
                name:
                  values.companyName,

                industry:
                  values.industry,

                city:
                  values.city ||
                  null,

                website:
                  values.website ||
                  null,

                agencyRelationship:
                  values
                    .agencyRelationship ||
                  null,

                marketingActivity:
                  values
                    .marketingActivity ||
                  null,
              },
            });
        }

        /*
        |--------------------------------------------------------------------------
        | 2. Update Primary Contact
        |--------------------------------------------------------------------------
        */

        if (
          lead.primaryContactId
        ) {
          await updateContactMutation
            .mutateAsync({
              contactId:
                Number(
                  lead.primaryContactId
                ),

              data: {
                companyId:
                  Number(
                    lead.companyId
                  ),

                name:
                  values.contactName,

                designation:
                  values.designation ||
                  null,

                phone:
                  values.phone ||
                  null,

                email:
                  values.email ||
                  null,

                isDecisionMaker:
                  values
                    .decisionMaker ===
                  "Yes",
              },
            });
        }

        /*
        |--------------------------------------------------------------------------
        | 3. Update Lead
        |--------------------------------------------------------------------------
        |
        | Owner is intentionally handled separately because your backend has a
        | dedicated owner endpoint.
        |
        */

        await updateLeadMutation
          .mutateAsync({
            leadId:
              Number(
                lead.id
              ),

            data: {
              companyId:
                Number(
                  lead.companyId
                ),

              primaryContactId:
                Number(
                  lead.primaryContactId
                ),

              branchId:
                Number(
                  values.branchId
                ),

              serviceRequired:
                values
                  .serviceRequired,

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
                values.description ||
                null,

            },
          });

        /*
        |--------------------------------------------------------------------------
        | 4. Change Owner Only If Changed
        |--------------------------------------------------------------------------
        */

        if (
          Number(
            values.ownerId
          ) !==
          Number(
            lead.ownerId
          )
        ) {
          await changeOwnerMutation
            .mutateAsync({
              leadId:
                Number(
                  lead.id
                ),

              data: {
                ownerId:
                  Number(
                    values.ownerId
                  ),

                reason:
                  "Lead details updated.",
              },
            });
        }

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
            (
              isEdit
                ? "Unable to update lead."
                : "Unable to create lead."
            ),
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
    <div className="modal-backdrop">
      <section
        className="tl-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="lead-form-title"
      >
        {/* --------------------------------------------------------------- */}
        {/* Header */}
        {/* --------------------------------------------------------------- */}

        <header className="modal-head">
          <div>
            <h2 id="lead-form-title">
              {
                isEdit
                  ? "Edit details"
                  : "Add lead"
              }
            </h2>

            <p>
              {
                isEdit
                  ? "Update the lead, company and primary contact details."
                  : "Changes are saved securely to the CRM database."
              }
            </p>
          </div>

          <button
            type="button"
            className="icon-control"
            onClick={
              handleClose
            }
            disabled={
              isPending
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
          {/* Loading Edit Data */}
          {/* ------------------------------------------------------------- */}

          {editDetailsLoading ? (
            <div className="empty-state">
              <h2>
                Loading details
              </h2>

              <p>
                Loading the existing
                lead information...
              </p>
            </div>
          ) : (
            <>
              {/* --------------------------------------------------------- */}
              {/* Stepper */}
              {/* --------------------------------------------------------- */}

              <div className="lead-stepper">
                {steps.map(
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

              {/* --------------------------------------------------------- */}
              {/* Root Error */}
              {/* --------------------------------------------------------- */}

              {errors.root && (
                <div className="error-box">
                  {
                    errors.root
                  }
                </div>
              )}

              {/* --------------------------------------------------------- */}
              {/* STEP 1 - Company */}
              {/* --------------------------------------------------------- */}

              {step ===
                1 && (
                <div className="form-section">
                  <h3>
                    Company information
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

                      {fieldError(
                        "website"
                      )}
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

              {/* --------------------------------------------------------- */}
              {/* STEP 2 - Contact */}
              {/* --------------------------------------------------------- */}

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
                        inputMode="numeric"
                        maxLength={
                          10
                        }
                        value={
                          values.phone
                        }
                        onChange={(
                          event
                        ) => {
                          const value =
                            event
                              .target
                              .value
                              .replace(
                                /\D/g,
                                ""
                              )
                              .slice(
                                0,
                                10
                              );

                          change(
                            "phone"
                          )({
                            ...event,

                            target: {
                              ...event.target,
                              value,
                            },
                          });
                        }}
                        placeholder="9876543210"
                      />

                      {fieldError(
                        "phone"
                      )}
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

              {/* --------------------------------------------------------- */}
              {/* STEP 3 - Opportunity */}
              {/* --------------------------------------------------------- */}

              {step ===
                3 && (
                <div className="form-section">
                  <h3>
                    Opportunity
                  </h3>

                  <div className="form-grid2">
                    <label>
                      Potential requirement *

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
                      Opportunity value

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
                      Opportunity description

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

              {/* --------------------------------------------------------- */}
              {/* STEP 4 - Ownership */}
              {/* --------------------------------------------------------- */}

              {step ===
                4 && (
                <div className="form-section">
                  <h3>
                    Ownership
                  </h3>

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
                    <label>
                      Primary branch *

                      <select
                        value={
                          values.branchId
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
                          !values.branchId ||
                          ownersQuery
                            .isLoading ||
                          ownersQuery
                            .isError ||
                          owners.length ===
                            0
                        }
                      >
                        <option value="">
                          {!values.branchId
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
                        No active owners are
                        available for this
                        branch.
                      </div>
                    )}

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

              {/* --------------------------------------------------------- */}
              {/* STEP 5 - Next Action */}
              {/* --------------------------------------------------------- */}

              {!isEdit &&
                step ===
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
                        min={
                          today
                        }
                        value={
                          values
                            .followUpDate
                        }
                        onChange={(
                          event
                        ) => {
                          const selectedDate =
                            event
                              .target
                              .value;

                          const nowTime =
                            getLocalTime();

                          setValues(
                            (
                              current
                            ) => {
                              let nextTime =
                                current
                                  .followUpTime;

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
                        onChange={(
                          event
                        ) => {
                          const selectedTime =
                            event
                              .target
                              .value;

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
            </>
          )}
        </div>

        {/* --------------------------------------------------------------- */}
        {/* Footer */}
        {/* --------------------------------------------------------------- */}

        {!editDetailsLoading && (
          <footer className="modal-foot">
            {step > 1 && (
              <button
                type="button"
                className="tl-secondary"
                disabled={
                  isPending
                }
                onClick={
                  previousStep
                }
              >
                Previous
              </button>
            )}

            {step < lastStep ? (
              <button
                type="button"
                className="tl-primary"
                onClick={
                  continueForm
                }
                disabled={
                  isPending
                }
              >
                Continue
              </button>
            ) : (
              <button
                type="button"
                className="tl-primary"
                disabled={
                  isPending
                }
                onClick={
                  submit
                }
              >
                {isPending
                  ? (
                      isEdit
                        ? "Saving..."
                        : "Creating..."
                    )
                  : (
                      isEdit
                        ? "Save changes"
                        : "Create lead"
                    )}
              </button>
            )}
          </footer>
        )}
      </section>
    </div>
  );
};

export default LeadFormModal;