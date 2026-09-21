import {
  useMemo,
  useRef,
  useState,
} from "react";

import {
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import {
  useForm,
} from "react-hook-form";

import {
  fetchCompanies,
} from "../companies/companies.api.js";

import {
  fetchContacts,
} from "../contacts/contacts.api.js";

import {
  createLead,
  fetchAssignableOwners,
} from "./leads.api.js";

/*
|--------------------------------------------------------------------------
| Steps
|--------------------------------------------------------------------------
*/

const STEPS = [
  "Company",
  "Contact",
  "Opportunity",
  "Follow-up",
  "Review",
];

/*
|--------------------------------------------------------------------------
| Default Values
|--------------------------------------------------------------------------
*/

const DEFAULT_VALUES = {
  company_id: "",
  primary_contact_id: "",

  potential_requirement: "",
  opportunity_description: "",
  service_interest: "",
  lead_source: "",

  priority: "MEDIUM",

  opportunity_value: "",
  currency: "INR",

  owner_id: "",

  next_action: "",
  next_follow_up_at: "",
};

/*
|--------------------------------------------------------------------------
| Convert Date/Time To ISO
|--------------------------------------------------------------------------
|
| datetime-local does not include a timezone.
|
| The application is being used in India, so the selected local time is
| interpreted as Asia/Kolkata (+05:30).
|
*/

function followUpIso(value) {
  if (!value) {
    return null;
  }

  const normalized =
    String(value).trim();

  const withSeconds =
    normalized.length === 16
      ? `${normalized}:00`
      : normalized;

  const date =
    new Date(
      `${withSeconds}+05:30`,
    );

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return null;
  }

  return date.toISOString();
}

/*
|--------------------------------------------------------------------------
| Request Key
|--------------------------------------------------------------------------
*/

function generateRequestKey() {
  if (
    globalThis.crypto &&
    typeof globalThis.crypto
      .randomUUID ===
      "function"
  ) {
    return globalThis.crypto
      .randomUUID();
  }

  throw new Error(
    "Your browser does not support secure request IDs.",
  );
}

/*
|--------------------------------------------------------------------------
| Component
|--------------------------------------------------------------------------
*/

export default function CreateLeadPage() {
  const navigate =
    useNavigate();

  const queryClient =
    useQueryClient();

  const [
    step,
    setStep,
  ] = useState(0);

  const [
    companySearch,
    setCompanySearch,
  ] = useState("");

  const [
    contactSearch,
    setContactSearch,
  ] = useState("");

  const [
    submitError,
    setSubmitError,
  ] = useState("");

  /*
  |--------------------------------------------------------------------------
  | Idempotency Request State
  |--------------------------------------------------------------------------
  |
  | Same payload after network failure:
  |
  | same request key
  |
  | Changed payload:
  |
  | new request key
  |
  */

  const submissionRef =
    useRef({
      key: null,
      signature: null,
    });

  /*
  |--------------------------------------------------------------------------
  | Form
  |--------------------------------------------------------------------------
  */

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    setError,
    clearErrors,
    formState: {
      errors,
      isSubmitting,
    },
  } = useForm({
    defaultValues:
      DEFAULT_VALUES,
  });

  const companyId =
    watch(
      "company_id",
    );

  const contactId =
    watch(
      "primary_contact_id",
    );

  const ownerId =
    watch(
      "owner_id",
    );

  /*
  |--------------------------------------------------------------------------
  | Companies
  |--------------------------------------------------------------------------
  */

  const companiesQuery =
    useQuery({
      queryKey: [
        "companies",
        "lead-create",
        companySearch,
      ],

      queryFn: ({
        signal,
      }) =>
        fetchCompanies({
          search:
            companySearch,

          page: 1,

          signal,
        }),
    });

  const companies =
    companiesQuery
      .data
      ?.data || [];

  /*
  |--------------------------------------------------------------------------
  | Contacts
  |--------------------------------------------------------------------------
  */

  const contactsQuery =
    useQuery({
      queryKey: [
        "contacts",
        "lead-create",
        companyId,
        contactSearch,
      ],

      enabled:
        Boolean(
          companyId,
        ),

      queryFn: ({
        signal,
      }) =>
        fetchContacts({
          companyId,

          search:
            contactSearch,

          page: 1,

          signal,
        }),
    });

  const contacts =
    contactsQuery
      .data
      ?.data || [];

  /*
  |--------------------------------------------------------------------------
  | Owners
  |--------------------------------------------------------------------------
  */

  const ownersQuery =
    useQuery({
      queryKey: [
        "lead-owners",
      ],

      queryFn: ({
        signal,
      }) =>
        fetchAssignableOwners({
          signal,
        }),
    });

  const owners =
    ownersQuery.data || [];

  /*
  |--------------------------------------------------------------------------
  | Selected Records
  |--------------------------------------------------------------------------
  */

  const selectedCompany =
    useMemo(
      () =>
        companies.find(
          (company) =>
            String(
              company.id,
            ) ===
            String(
              companyId,
            ),
        ) || null,
      [
        companies,
        companyId,
      ],
    );

  const selectedContact =
    useMemo(
      () =>
        contacts.find(
          (contact) =>
            String(
              contact.id,
            ) ===
            String(
              contactId,
            ),
        ) || null,
      [
        contacts,
        contactId,
      ],
    );

  const selectedOwner =
    useMemo(
      () =>
        owners.find(
          (owner) =>
            String(
              owner.id,
            ) ===
            String(
              ownerId,
            ),
        ) || null,
      [
        owners,
        ownerId,
      ],
    );

  /*
  |--------------------------------------------------------------------------
  | Company Change
  |--------------------------------------------------------------------------
  */

  function selectCompany(
    id,
  ) {
    setValue(
      "company_id",
      String(id),
      {
        shouldValidate:
          true,
      },
    );

    /*
     * Company changed, so old contact must be removed.
     */
    setValue(
      "primary_contact_id",
      "",
    );

    setContactSearch("");

    clearErrors(
      "company_id",
    );

    clearErrors(
      "primary_contact_id",
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Contact Change
  |--------------------------------------------------------------------------
  */

  function selectContact(
    id,
  ) {
    setValue(
      "primary_contact_id",
      String(id),
      {
        shouldValidate:
          true,
      },
    );

    clearErrors(
      "primary_contact_id",
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Previous Step
  |--------------------------------------------------------------------------
  */

  function previousStep() {
    setSubmitError("");

    setStep(
      (current) =>
        Math.max(
          0,
          current - 1,
        ),
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Validate Current Step
  |--------------------------------------------------------------------------
  */

  function validateStep(
    values,
  ) {
    clearErrors();

    if (
      step === 0 &&
      !values.company_id
    ) {
      setError(
        "company_id",
        {
          type:
            "manual",

          message:
            "Please select a company.",
        },
      );

      return false;
    }

    if (
      step === 1 &&
      !values.primary_contact_id
    ) {
      setError(
        "primary_contact_id",
        {
          type:
            "manual",

          message:
            "Please select a contact.",
        },
      );

      return false;
    }

    if (step === 2) {
      if (
        !String(
          values
            .potential_requirement ||
            "",
        ).trim()
      ) {
        setError(
          "potential_requirement",
          {
            type:
              "manual",

            message:
              "Potential requirement is required.",
          },
        );

        return false;
      }
    }

    if (step === 3) {
      if (
        !String(
          values
            .next_action ||
            "",
        ).trim()
      ) {
        setError(
          "next_action",
          {
            type:
              "manual",

            message:
              "Next action is required.",
          },
        );

        return false;
      }

      if (
        !values
          .next_follow_up_at
      ) {
        setError(
          "next_follow_up_at",
          {
            type:
              "manual",

            message:
              "Next follow-up date and time is required.",
          },
        );

        return false;
      }

      const iso =
        followUpIso(
          values
            .next_follow_up_at,
        );

      if (!iso) {
        setError(
          "next_follow_up_at",
          {
            type:
              "manual",

            message:
              "Next follow-up date is invalid.",
          },
        );

        return false;
      }

      if (
        new Date(
          iso,
        ).getTime() <=
        Date.now()
      ) {
        setError(
          "next_follow_up_at",
          {
            type:
              "manual",

            message:
              "Next follow-up must be in the future.",
          },
        );

        return false;
      }
    }

    return true;
  }

  /*
  |--------------------------------------------------------------------------
  | API Error Fields
  |--------------------------------------------------------------------------
  */

  function applyApiErrors(
    error,
  ) {
    if (
      !Array.isArray(
        error?.errors,
      )
    ) {
      return;
    }

    for (
      const item of
      error.errors
    ) {
      const field =
        String(
          item?.field ||
          "",
        )
          .replace(
            /^body\./,
            "",
          );

      if (!field) {
        continue;
      }

      if (
        field ===
        "Idempotency-Key"
      ) {
        continue;
      }

      setError(
        field,
        {
          type:
            "server",

          message:
            item?.message ||
            error.message,
        },
      );

      if (
        field ===
        "company_id"
      ) {
        setStep(0);
      } else if (
        field ===
        "primary_contact_id"
      ) {
        setStep(1);
      } else if (
        [
          "potential_requirement",
          "opportunity_description",
          "service_interest",
          "lead_source",
          "priority",
          "opportunity_value",
          "currency",
        ].includes(
          field,
        )
      ) {
        setStep(2);
      } else if (
        [
          "owner_id",
          "next_action",
          "next_follow_up_at",
        ].includes(
          field,
        )
      ) {
        setStep(3);
      }
    }
  }

  /*
  |--------------------------------------------------------------------------
  | Submit
  |--------------------------------------------------------------------------
  */

  async function submit(
    values,
  ) {
    setSubmitError("");

    /*
    |--------------------------------------------------------------------------
    | Continue To Next Step
    |--------------------------------------------------------------------------
    */

    if (step < 4) {
      if (
        !validateStep(
          values,
        )
      ) {
        return;
      }

      setStep(
        (current) =>
          current + 1,
      );

      return;
    }

    /*
    |--------------------------------------------------------------------------
    | Build Follow-up Date
    |--------------------------------------------------------------------------
    */

    const nextFollowUpAt =
      followUpIso(
        values
          .next_follow_up_at,
      );

    if (!nextFollowUpAt) {
      setStep(3);

      setError(
        "next_follow_up_at",
        {
          type:
            "manual",

          message:
            "Next follow-up date is invalid.",
        },
      );

      return;
    }

    if (
      new Date(
        nextFollowUpAt,
      ).getTime() <=
      Date.now()
    ) {
      setStep(3);

      setError(
        "next_follow_up_at",
        {
          type:
            "manual",

          message:
            "Next follow-up must be in the future.",
        },
      );

      return;
    }

    /*
    |--------------------------------------------------------------------------
    | Build Payload
    |--------------------------------------------------------------------------
    */

    const payload = {
      company_id:
        Number(
          values
            .company_id,
        ),

      primary_contact_id:
        Number(
          values
            .primary_contact_id,
        ),

      potential_requirement:
        String(
          values
            .potential_requirement ||
            "",
        ).trim(),

      opportunity_description:
        String(
          values
            .opportunity_description ||
            "",
        ).trim() ||
        null,

      service_interest:
        String(
          values
            .service_interest ||
            "",
        ).trim() ||
        null,

      lead_source:
        String(
          values
            .lead_source ||
            "",
        ).trim() ||
        null,

      priority:
        values.priority ||
        "MEDIUM",

      opportunity_value:
        values
          .opportunity_value !==
          ""
          ? values
              .opportunity_value
          : null,

      currency:
        values.currency ||
        "INR",

      owner_id:
        values.owner_id
          ? Number(
              values
                .owner_id,
            )
          : null,

      next_action:
        String(
          values
            .next_action ||
            "",
        ).trim(),

      next_follow_up_at:
        nextFollowUpAt,
    };

    /*
    |--------------------------------------------------------------------------
    | Retry Protection
    |--------------------------------------------------------------------------
    |
    | Same payload:
    |
    | reuse same UUID.
    |
    | User changed the payload after failure:
    |
    | generate a new UUID.
    |
    */

    const signature =
      JSON.stringify(
        payload,
      );

    if (
      !submissionRef
        .current
        .key ||
      submissionRef
        .current
        .signature !==
        signature
    ) {
      submissionRef.current = {
        key:
          generateRequestKey(),

        signature,
      };
    }

    const requestKey =
      submissionRef
        .current
        .key;

    try {
      const createdLead =
        await createLead(
          payload,
          {
            requestKey,
          },
        );

      /*
      |--------------------------------------------------------------------------
      | Creation Successful
      |--------------------------------------------------------------------------
      |
      | New logical submission should receive a new key.
      |
      */

      submissionRef.current = {
        key: null,
        signature: null,
      };

      await queryClient
        .invalidateQueries({
          queryKey: [
            "leads",
          ],
        });

      navigate(
        "/leads",
        {
          replace: true,

          state: {
            success:
              `Lead ${
                createdLead
                  ?.lead_code ||
                ""
              } created successfully.`.trim(),
          },
        },
      );
    } catch (error) {
      /*
      |--------------------------------------------------------------------------
      | IMPORTANT
      |--------------------------------------------------------------------------
      |
      | Do NOT clear submissionRef here.
      |
      | If the server successfully saved the lead but the response was lost,
      | retrying must use the same UUID.
      |
      */

      console.error(
        "Create lead failed:",
        error,
      );

      applyApiErrors(
        error,
      );

      setSubmitError(
        error?.message ||
          "Something went wrong. Please try again.",
      );
    }
  }

  /*
  |--------------------------------------------------------------------------
  | Render
  |--------------------------------------------------------------------------
  */

  return (
    <div className="mx-auto max-w-5xl">
      {/* Header */}

      <div className="mb-6">
        <Link
          to="/leads"
          className="text-sm font-semibold text-action hover:underline"
        >
          ← Back to leads
        </Link>

        <h1 className="mt-3 text-2xl font-bold text-ink">
          Create Lead
        </h1>

        <p className="mt-2 text-sm text-subtle">
          Add a new lead and schedule the first follow-up.
        </p>
      </div>

      {/* Steps */}

      <div className="mb-6 overflow-x-auto">
        <div className="flex min-w-max gap-2">
          {STEPS.map(
            (
              item,
              index,
            ) => (
              <div
                key={item}
                className={`rounded-lg px-4 py-2 text-sm font-semibold ${
                  index ===
                  step
                    ? "bg-action text-white"
                    : index <
                        step
                      ? "bg-selected text-ink"
                      : "border border-line bg-surface text-muted"
                }`}
              >
                {index + 1}.{" "}
                {item}
              </div>
            ),
          )}
        </div>
      </div>

      <form
        onSubmit={
          handleSubmit(
            submit,
          )
        }
        className="rounded-xl border border-line bg-surface p-5 shadow-sm sm:p-6"
      >
        {/* Error */}

        {submitError && (
          <div
            role="alert"
            className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {submitError}
          </div>
        )}

        {/* Step 1 - Company */}

        {step === 0 && (
          <div>
            <h2 className="text-lg font-semibold text-ink">
              Select company
            </h2>

            <p className="mt-1 text-sm text-subtle">
              Select the company associated with this lead.
            </p>

            <input
              type="search"
              value={
                companySearch
              }
              onChange={(
                event,
              ) =>
                setCompanySearch(
                  event
                    .target
                    .value,
                )
              }
              placeholder="Search companies..."
              className="mt-5 w-full rounded-lg border border-line px-3 py-2.5 text-sm outline-none focus:border-action"
            />

            <input
              type="hidden"
              {...register(
                "company_id",
              )}
            />

            {errors
              .company_id && (
              <p className="mt-2 text-sm text-red-600">
                {
                  errors
                    .company_id
                    .message
                }
              </p>
            )}

            <div className="mt-4 divide-y divide-line overflow-hidden rounded-lg border border-line">
              {companiesQuery
                .isPending ? (
                <p className="p-4 text-sm text-subtle">
                  Loading companies…
                </p>
              ) : companiesQuery
                  .isError ? (
                <p className="p-4 text-sm text-red-600">
                  {
                    companiesQuery
                      .error
                      .message
                  }
                </p>
              ) : companies.length ===
                0 ? (
                <p className="p-4 text-sm text-subtle">
                  No companies found.
                </p>
              ) : (
                companies.map(
                  (
                    company,
                  ) => {
                    const selected =
                      String(
                        company.id,
                      ) ===
                      String(
                        companyId,
                      );

                    return (
                      <button
                        key={
                          company.id
                        }
                        type="button"
                        onClick={() =>
                          selectCompany(
                            company.id,
                          )
                        }
                        className={`block w-full px-4 py-3 text-left ${
                          selected
                            ? "bg-selected"
                            : "hover:bg-table-hover"
                        }`}
                      >
                        <span className="font-semibold text-ink">
                          {
                            company.name
                          }
                        </span>

                        <span className="mt-1 block text-xs text-muted">
                          {company.industry ||
                            "No industry"}
                          {company.city
                            ? ` · ${company.city}`
                            : ""}
                        </span>
                      </button>
                    );
                  },
                )
              )}
            </div>
          </div>
        )}

        {/* Step 2 - Contact */}

        {step === 1 && (
          <div>
            <h2 className="text-lg font-semibold text-ink">
              Select contact
            </h2>

            <p className="mt-1 text-sm text-subtle">
              Company:{" "}
              <strong>
                {selectedCompany
                  ?.name ||
                  "Selected company"}
              </strong>
            </p>

            <input
              type="search"
              value={
                contactSearch
              }
              onChange={(
                event,
              ) =>
                setContactSearch(
                  event
                    .target
                    .value,
                )
              }
              placeholder="Search contacts..."
              className="mt-5 w-full rounded-lg border border-line px-3 py-2.5 text-sm outline-none focus:border-action"
            />

            <input
              type="hidden"
              {...register(
                "primary_contact_id",
              )}
            />

            {errors
              .primary_contact_id && (
              <p className="mt-2 text-sm text-red-600">
                {
                  errors
                    .primary_contact_id
                    .message
                }
              </p>
            )}

            <div className="mt-4 divide-y divide-line overflow-hidden rounded-lg border border-line">
              {contactsQuery
                .isPending ? (
                <p className="p-4 text-sm text-subtle">
                  Loading contacts…
                </p>
              ) : contactsQuery
                  .isError ? (
                <p className="p-4 text-sm text-red-600">
                  {
                    contactsQuery
                      .error
                      .message
                  }
                </p>
              ) : contacts.length ===
                0 ? (
                <p className="p-4 text-sm text-subtle">
                  No contacts found for this company.
                </p>
              ) : (
                contacts.map(
                  (
                    contact,
                  ) => {
                    const selected =
                      String(
                        contact.id,
                      ) ===
                      String(
                        contactId,
                      );

                    return (
                      <button
                        key={
                          contact.id
                        }
                        type="button"
                        onClick={() =>
                          selectContact(
                            contact.id,
                          )
                        }
                        className={`block w-full px-4 py-3 text-left ${
                          selected
                            ? "bg-selected"
                            : "hover:bg-table-hover"
                        }`}
                      >
                        <span className="font-semibold text-ink">
                          {
                            contact.name
                          }
                        </span>

                        <span className="mt-1 block text-xs text-muted">
                          {contact.designation ||
                            "No designation"}
                          {contact.email
                            ? ` · ${contact.email}`
                            : ""}
                        </span>
                      </button>
                    );
                  },
                )
              )}
            </div>
          </div>
        )}

        {/* Step 3 - Opportunity */}

        {step === 2 && (
          <div>
            <h2 className="text-lg font-semibold text-ink">
              Opportunity details
            </h2>

            <div className="mt-5 grid gap-5 md:grid-cols-2">
              <label className="md:col-span-2">
                <span className="mb-1.5 block text-sm font-semibold text-ink">
                  Potential requirement *
                </span>

                <textarea
                  {...register(
                    "potential_requirement",
                  )}
                  rows={3}
                  className="w-full rounded-lg border border-line px-3 py-2.5 text-sm outline-none focus:border-action"
                />

                {errors
                  .potential_requirement && (
                  <span className="mt-1 block text-sm text-red-600">
                    {
                      errors
                        .potential_requirement
                        .message
                    }
                  </span>
                )}
              </label>

              <label className="md:col-span-2">
                <span className="mb-1.5 block text-sm font-semibold text-ink">
                  Opportunity description
                </span>

                <textarea
                  {...register(
                    "opportunity_description",
                  )}
                  rows={4}
                  className="w-full rounded-lg border border-line px-3 py-2.5 text-sm outline-none focus:border-action"
                />
              </label>

              <label>
                <span className="mb-1.5 block text-sm font-semibold text-ink">
                  Service interest
                </span>

                <input
                  {...register(
                    "service_interest",
                  )}
                  className="w-full rounded-lg border border-line px-3 py-2.5 text-sm outline-none focus:border-action"
                />
              </label>

              <label>
                <span className="mb-1.5 block text-sm font-semibold text-ink">
                  Lead source
                </span>

                <input
                  {...register(
                    "lead_source",
                  )}
                  className="w-full rounded-lg border border-line px-3 py-2.5 text-sm outline-none focus:border-action"
                />
              </label>

              <label>
                <span className="mb-1.5 block text-sm font-semibold text-ink">
                  Priority
                </span>

                <select
                  {...register(
                    "priority",
                  )}
                  className="w-full rounded-lg border border-line px-3 py-2.5 text-sm outline-none focus:border-action"
                >
                  <option value="LOW">
                    Low
                  </option>

                  <option value="MEDIUM">
                    Medium
                  </option>

                  <option value="HIGH">
                    High
                  </option>
                </select>
              </label>

              <div className="grid grid-cols-[1fr_100px] gap-2">
                <label>
                  <span className="mb-1.5 block text-sm font-semibold text-ink">
                    Opportunity value
                  </span>

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    {...register(
                      "opportunity_value",
                    )}
                    className="w-full rounded-lg border border-line px-3 py-2.5 text-sm outline-none focus:border-action"
                  />
                </label>

                <label>
                  <span className="mb-1.5 block text-sm font-semibold text-ink">
                    Currency
                  </span>

                  <select
                    {...register(
                      "currency",
                    )}
                    className="w-full rounded-lg border border-line px-3 py-2.5 text-sm outline-none focus:border-action"
                  >
                    <option value="INR">
                      INR
                    </option>

                    <option value="USD">
                      USD
                    </option>
                  </select>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Step 4 - Follow-up */}

        {step === 3 && (
          <div>
            <h2 className="text-lg font-semibold text-ink">
              Owner &amp; follow-up
            </h2>

            <div className="mt-5 grid gap-5 md:grid-cols-2">
              <label>
                <span className="mb-1.5 block text-sm font-semibold text-ink">
                  Owner
                </span>

                <select
                  {...register(
                    "owner_id",
                  )}
                  className="w-full rounded-lg border border-line px-3 py-2.5 text-sm outline-none focus:border-action"
                >
                  <option value="">
                    Current user
                  </option>

                  {owners.map(
                    (
                      owner,
                    ) => (
                      <option
                        key={
                          owner.id
                        }
                        value={
                          owner.id
                        }
                      >
                        {
                          owner.name
                        }{" "}
                        (
                        {
                          owner.role
                        }
                        )
                      </option>
                    ),
                  )}
                </select>

                {ownersQuery
                  .isError && (
                  <span className="mt-1 block text-sm text-red-600">
                    {
                      ownersQuery
                        .error
                        .message
                    }
                  </span>
                )}
              </label>

              <label>
                <span className="mb-1.5 block text-sm font-semibold text-ink">
                  Next follow-up *
                </span>

                <input
                  type="datetime-local"
                  {...register(
                    "next_follow_up_at",
                  )}
                  className="w-full rounded-lg border border-line px-3 py-2.5 text-sm outline-none focus:border-action"
                />

                {errors
                  .next_follow_up_at && (
                  <span className="mt-1 block text-sm text-red-600">
                    {
                      errors
                        .next_follow_up_at
                        .message
                    }
                  </span>
                )}
              </label>

              <label className="md:col-span-2">
                <span className="mb-1.5 block text-sm font-semibold text-ink">
                  Next action *
                </span>

                <textarea
                  {...register(
                    "next_action",
                  )}
                  rows={3}
                  placeholder="Example: Call client to discuss requirement"
                  className="w-full rounded-lg border border-line px-3 py-2.5 text-sm outline-none focus:border-action"
                />

                {errors
                  .next_action && (
                  <span className="mt-1 block text-sm text-red-600">
                    {
                      errors
                        .next_action
                        .message
                    }
                  </span>
                )}
              </label>
            </div>
          </div>
        )}

        {/* Step 5 - Review */}

        {step === 4 && (
          <div>
            <h2 className="text-lg font-semibold text-ink">
              Review lead
            </h2>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <ReviewItem
                label="Company"
                value={
                  selectedCompany
                    ?.name ||
                  companyId
                }
              />

              <ReviewItem
                label="Contact"
                value={
                  selectedContact
                    ?.name ||
                  contactId
                }
              />

              <ReviewItem
                label="Owner"
                value={
                  selectedOwner
                    ?.name ||
                  "Current user"
                }
              />

              <ReviewItem
                label="Priority"
                value={
                  watch(
                    "priority",
                  )
                }
              />

              <ReviewItem
                label="Requirement"
                value={
                  watch(
                    "potential_requirement",
                  )
                }
              />

              <ReviewItem
                label="Service interest"
                value={
                  watch(
                    "service_interest",
                  ) ||
                  "—"
                }
              />

              <ReviewItem
                label="Lead source"
                value={
                  watch(
                    "lead_source",
                  ) ||
                  "—"
                }
              />

              <ReviewItem
                label="Opportunity value"
                value={
                  watch(
                    "opportunity_value",
                  )
                    ? `${
                        watch(
                          "currency",
                        )
                      } ${watch(
                        "opportunity_value",
                      )}`
                    : "—"
                }
              />

              <ReviewItem
                label="Next action"
                value={
                  watch(
                    "next_action",
                  )
                }
              />

              <ReviewItem
                label="Next follow-up"
                value={
                  watch(
                    "next_follow_up_at",
                  )
                }
              />
            </div>
          </div>
        )}

        {/* Actions */}

        <div className="mt-7 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-5">
          <div>
            {step > 0 && (
              <button
                type="button"
                onClick={
                  previousStep
                }
                disabled={
                  isSubmitting
                }
                className="rounded-lg border border-line px-4 py-2.5 text-sm font-semibold text-ink hover:bg-table-hover disabled:opacity-50"
              >
                Back
              </button>
            )}
          </div>

          <button
            type="submit"
            disabled={
              isSubmitting
            }
            className="rounded-lg bg-action px-5 py-2.5 text-sm font-semibold text-white hover:bg-action-hover disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting
              ? "Saving..."
              : step === 4
                ? "Create lead"
                : "Continue"}
          </button>
        </div>
      </form>
    </div>
  );
}

/*
|--------------------------------------------------------------------------
| Review Item
|--------------------------------------------------------------------------
*/

function ReviewItem({
  label,
  value,
}) {
  return (
    <div className="rounded-lg border border-line bg-canvas p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted">
        {label}
      </p>

      <p className="mt-1 break-words text-sm font-medium text-ink">
        {value || "—"}
      </p>
    </div>
  );
}