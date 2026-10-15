
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";

import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Check,
  CheckCircle2,
  ClipboardList,
  ContactRound,
  FileText,
  LoaderCircle,
  ShieldCheck,
  Sparkles,
  UserRound,
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

import "./lead-form-glass.css";

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

const STEP_ICONS = [
  Building2,
  ContactRound,
  ClipboardList,
  UserRound,
  CheckCircle2,
];

const pad2 = (value) => String(value).padStart(2, "0");

const getLocalDate = (date = new Date()) =>
  `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(
    date.getDate()
  )}`;

const getLocalTime = (date = new Date()) =>
  `${pad2(date.getHours())}:${pad2(date.getMinutes())}`;

const getCurrentDateTimeValues = () => ({
  date: getLocalDate(),
  time: getLocalTime(),
});

const getDateTimeFormValues = (value) => {
  if (!value) return getCurrentDateTimeValues();

  const date = new Date(value);

  if (
    Number.isNaN(date.getTime()) ||
    date.getTime() < Date.now() - 60 * 1000
  ) {
    return getCurrentDateTimeValues();
  }

  return {
    date: getLocalDate(date),
    time: getLocalTime(date),
  };
};

const safeString = (value) =>
  value === null || value === undefined ? "" : String(value);

const getApiError = (error, fallback) => {
  const response = error?.response?.data;

  const validationErrors = Array.isArray(response?.errors)
    ? response.errors
        .map((item) =>
          typeof item === "string"
            ? item
            : item?.message || item?.msg || ""
        )
        .filter(Boolean)
        .join(" ")
    : "";

  return (
    validationErrors ||
    response?.message ||
    error?.message ||
    fallback
  );
};

const Field = ({
  label,
  required = false,
  error,
  children,
  full = false,
}) => (
  <div className={`glf-field ${full ? "sm:col-span-2" : ""}`}>
    <label className="glf-label mb-2 block text-xs font-bold">
      {label}
      {required && <span className="glf-required ml-1">*</span>}
    </label>

    {children}

    {error && (
      <p role="alert" className="glf-field-error mt-1.5 text-xs">
        {error}
      </p>
    )}
  </div>
);

const LeadFormModal = ({
  open,
  onClose,
  mode = "create",
  lead = null,
}) => {
  const { user } = useAuth();

  const isEdit = mode === "edit" && Boolean(lead?.id);
  const steps = isEdit ? EDIT_STEPS : CREATE_STEPS;
  const lastStep = steps.length;

  const [step, setStep] = useState(1);
  const [values, setValues] = useState(createLeadDefaults);
  const [errors, setErrors] = useState({});

  const createMutation = useCreateLeadMutation();
  const updateLeadMutation = useUpdateLeadMutation();
  const updateCompanyMutation = useUpdateCompanyMutation();
  const updateContactMutation = useUpdateContactMutation();
  const changeOwnerMutation = useChangeLeadOwnerMutation();

  const companyQuery = useCompanyQuery(
    isEdit && open ? lead?.companyId : null
  );

  const company = companyQuery.data?.data?.company || null;

  const contactQuery = useContactQuery(
    isEdit && open ? lead?.primaryContactId : null
  );

  const contact = contactQuery.data?.data?.contact || null;

  const branchOptionsQuery = useLeadOwnersQuery(null, open);

  const branches =
    branchOptionsQuery.data?.data?.branches || [];

  const ownersQuery = useLeadOwnersQuery(
    values.branchId || null,
    open && Boolean(values.branchId)
  );

  const owners = ownersQuery.data?.data?.owners || [];

  const selectedBranch = useMemo(
    () =>
      branches.find(
        (branch) =>
          Number(branch.id) === Number(values.branchId)
      ) ||
      ownersQuery.data?.data?.selectedBranch ||
      null,
    [branches, ownersQuery.data, values.branchId]
  );

  const isPending =
    createMutation.isPending ||
    updateLeadMutation.isPending ||
    updateCompanyMutation.isPending ||
    updateContactMutation.isPending ||
    changeOwnerMutation.isPending;

  const editDetailsLoading =
    isEdit &&
    (companyQuery.isLoading || contactQuery.isLoading);

  const defaultOwnerId = useMemo(() => {
    if (!owners.length) return "";

    const current = owners.find(
      (owner) => Number(owner.id) === Number(user?.id)
    );

    return String(current?.id || owners[0].id);
  }, [owners, user?.id]);

  // Initialize the create form.
  useEffect(() => {
    if (!open || isEdit) return;

    const now = getCurrentDateTimeValues();

    setStep(1);
    setErrors({});
    setValues({
      ...createLeadDefaults(),
      followUpDate: now.date,
      followUpTime: now.time,
    });
  }, [open, isEdit]);

  // Initialize the edit form from existing company/contact records.
  useEffect(() => {
    if (!open || !isEdit || !lead) return;

    if (lead.companyId && companyQuery.isLoading) return;
    if (lead.primaryContactId && contactQuery.isLoading) return;

    const followUp = getDateTimeFormValues(lead.followUpAt);

    setStep(1);
    setErrors({});

    setValues({
      ...createLeadDefaults(),

      companyName: safeString(
        company?.name ?? lead.companyName
      ),
      industry: safeString(
        company?.industry ?? lead.industry
      ),
      city: safeString(company?.city ?? lead.city),
      website: safeString(
        company?.website ?? lead.website
      ),
      agencyRelationship: safeString(
        company?.agencyRelationship
      ),
      marketingActivity: safeString(
        company?.marketingActivity
      ),

      contactName: safeString(
        contact?.name ??
          contact?.fullName ??
          lead.primaryContactName
      ),
      designation: safeString(
        contact?.designation ??
          lead.primaryContactDesignation
      ),
      phone: safeString(
        contact?.phone ?? lead.primaryContactPhone
      ),
      email: safeString(
        contact?.email ?? lead.primaryContactEmail
      ),
      decisionMaker: contact?.isDecisionMaker
        ? "Yes"
        : "No",

      serviceRequired: safeString(
        lead.serviceRequired
      ),
      source: safeString(lead.source),
      estimatedValueRupees:
        lead.estimatedValueRupees === null ||
        lead.estimatedValueRupees === undefined
          ? ""
          : String(lead.estimatedValueRupees),
      priority: safeString(lead.priority || "Medium"),
      description: safeString(lead.description),

      branchId: lead.branchId
        ? String(lead.branchId)
        : "",
      ownerId: lead.ownerId
        ? String(lead.ownerId)
        : "",

      nextAction: safeString(lead.nextAction),
      followUpDate: followUp.date,
      followUpTime: followUp.time,
      knownRelationship: lead.knownRelationship
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

  // Automatically select the only available branch.
  useEffect(() => {
    if (
      !open ||
      isEdit ||
      values.branchId ||
      branches.length !== 1
    ) {
      return;
    }

    setValues((current) => ({
      ...current,
      branchId: String(branches[0].id),
      ownerId: "",
    }));
  }, [branches, open, isEdit, values.branchId]);

  // Automatically select a default owner when creating.
  useEffect(() => {
    if (
      !open ||
      isEdit ||
      !values.branchId ||
      !defaultOwnerId
    ) {
      return;
    }

    setValues((current) => {
      if (current.ownerId) return current;

      return {
        ...current,
        ownerId: defaultOwnerId,
      };
    });
  }, [
    defaultOwnerId,
    open,
    isEdit,
    values.branchId,
  ]);

  // Static backdrop: lock scrolling; no Escape handler.
  useEffect(() => {
    if (!open) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  const handleClose = () => {
    if (!isPending) onClose();
  };

  const setField = (name, value) => {
    setValues((current) => ({
      ...current,
      [name]: value,
    }));

    setErrors((current) => ({
      ...current,
      [name]: undefined,
      root: undefined,
    }));
  };

  const change = (name) => (event) => {
    setField(name, event.target.value);
  };

  const changeBranch = (event) => {
    const branchId = event.target.value;

    setValues((current) => ({
      ...current,
      branchId,
      ownerId: "",
    }));

    setErrors((current) => ({
      ...current,
      branchId: undefined,
      ownerId: undefined,
      root: undefined,
    }));
  };

  const validateStep = () => {
    let schema;
    let data;

    if (step === 1) {
      schema = companyStepSchema;
      data = {
        companyName: values.companyName,
        industry: values.industry,
        city: values.city,
        website: values.website,
        agencyRelationship: values.agencyRelationship,
        marketingActivity: values.marketingActivity,
      };
    }

    if (step === 2) {
      schema = contactStepSchema;
      data = {
        contactName: values.contactName,
        designation: values.designation,
        phone: values.phone,
        email: values.email,
        decisionMaker: values.decisionMaker,
      };
    }

    if (step === 3) {
      schema = opportunityStepSchema;
      data = {
        serviceRequired: values.serviceRequired,
        source: values.source,
        estimatedValueRupees:
          values.estimatedValueRupees,
        priority: values.priority,
        description: values.description,
      };
    }

    if (step === 4) {
      schema = ownershipStepSchema;
      data = {
        branchId: values.branchId,
        ownerId: values.ownerId,
      };
    }

    if (step === 5) {
      schema = nextActionStepSchema;
      data = {
        nextAction: values.nextAction,
        followUpDate: values.followUpDate,
        followUpTime: values.followUpTime,
        knownRelationship: values.knownRelationship,
      };
    }

    const result = schema.safeParse(data);

    if (result.success) {
      setErrors({});
      return true;
    }

    const nextErrors = {};

    for (const issue of result.error.issues) {
      const key = issue.path[0];

      if (!nextErrors[key]) {
        nextErrors[key] = issue.message;
      }
    }

    setErrors(nextErrors);
    return false;
  };

  const continueForm = () => {
    if (!validateStep()) return;

    setStep((current) => Math.min(current + 1, lastStep));
  };

  const previousStep = () => {
    setErrors({});
    setStep((current) => Math.max(current - 1, 1));
  };

  const submit = async () => {
    if (isPending || !validateStep()) return;

    try {
      let date = null;

      if (!isEdit) {
        const time =
          values.followUpTime || getLocalTime();

        date = new Date(
          `${values.followUpDate}T${time}:00`
        );

        if (Number.isNaN(date.getTime())) {
          setErrors({
            followUpDate: "Enter a valid follow-up date.",
          });
          return;
        }

        if (date.getTime() < Date.now() - 60 * 1000) {
          setErrors({
            followUpDate:
              "Follow-up date and time cannot be in the past.",
            followUpTime:
              "Select the current time or a future time.",
          });
          return;
        }
      }

      if (!isEdit) {
        await createMutation.mutateAsync({
          company: {
            name: values.companyName,
            industry: values.industry,
            city: values.city,
            website: values.website,
            agencyRelationship:
              values.agencyRelationship,
            marketingActivity: values.marketingActivity,
          },
          contact: {
            name: values.contactName,
            designation: values.designation,
            phone: values.phone,
            email: values.email,
            isDecisionMaker:
              values.decisionMaker === "Yes",
          },
          serviceRequired: values.serviceRequired,
          source: values.source,
          estimatedValueRupees:
            values.estimatedValueRupees === ""
              ? 0
              : Number(values.estimatedValueRupees),
          priority: values.priority,
          description: values.description,
          branchId: Number(values.branchId),
          ownerId: Number(values.ownerId),
          nextAction: values.nextAction,
          followUpAt: date.toISOString(),
          knownRelationship:
            values.knownRelationship === "Yes / Existing",
        });

        onClose();
        return;
      }

      // Edit mode: preserve the original update sequence.

      if (lead.companyId) {
        await updateCompanyMutation.mutateAsync({
          companyId: Number(lead.companyId),
          data: {
            name: values.companyName,
            industry: values.industry,
            city: values.city || null,
            website: values.website || null,
            agencyRelationship:
              values.agencyRelationship || null,
            marketingActivity:
              values.marketingActivity || null,
          },
        });
      }

      if (lead.primaryContactId) {
        await updateContactMutation.mutateAsync({
          contactId: Number(lead.primaryContactId),
          data: {
            companyId: Number(lead.companyId),
            name: values.contactName,
            designation: values.designation || null,
            phone: values.phone || null,
            email: values.email || null,
            isDecisionMaker:
              values.decisionMaker === "Yes",
          },
        });
      }

      await updateLeadMutation.mutateAsync({
        leadId: Number(lead.id),
        data: {
          companyId: Number(lead.companyId),
          primaryContactId: Number(lead.primaryContactId),
          branchId: Number(values.branchId),
          serviceRequired: values.serviceRequired,
          source: values.source,
          estimatedValueRupees:
            values.estimatedValueRupees === ""
              ? 0
              : Number(values.estimatedValueRupees),
          priority: values.priority,
          description: values.description || null,
        },
      });

      if (
        Number(values.ownerId) !== Number(lead.ownerId)
      ) {
        await changeOwnerMutation.mutateAsync({
          leadId: Number(lead.id),
          data: {
            ownerId: Number(values.ownerId),
            reason: "Lead details updated.",
          },
        });
      }

      onClose();
    } catch (error) {
      setErrors({
        root: getApiError(
          error,
          isEdit
            ? "Unable to update lead."
            : "Unable to create lead."
        ),
      });
    }
  };

  if (!open) return null;

  const today = getLocalDate();
  const currentTime = getLocalTime();

  const inputClass = "glf-input w-full rounded-xl px-4 py-3 text-sm";
  const gridClass = "grid grid-cols-1 gap-5 sm:grid-cols-2";

  return createPortal(
    <div className="glf-overlay">
      <section
        className="glf-modal flex flex-col"
        role="dialog"
        aria-modal="true"
        aria-labelledby="lead-form-title"
      >
        {/* Header */}
        <header className="glf-header flex shrink-0 items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-4">
            <div className="glf-brand flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl">
              {isEdit ? (
                <Building2 size={23} />
              ) : (
                <Sparkles size={23} />
              )}
            </div>

            <div className="min-w-0">
              <p className="glf-eyebrow text-[11px] font-bold uppercase tracking-[0.15em]">
                Tempest Leads CRM
              </p>

              <h2
                id="lead-form-title"
                className="glf-title mt-1 text-xl font-extrabold"
              >
                {isEdit ? "Edit Lead Details" : "Add New Lead"}
              </h2>

              <p className="glf-muted mt-1 text-xs">
                {isEdit
                  ? "Update company, contact, opportunity and ownership."
                  : "Create a lead with the guided workflow."}
              </p>
            </div>
          </div>

          <button
            type="button"
            className="glf-close flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
            onClick={handleClose}
            disabled={isPending}
            aria-label="Close"
          >
            <X size={19} />
          </button>
        </header>

        {/* Progress */}
        <div className="glf-progress shrink-0 px-6 py-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <span className="glf-muted text-xs font-semibold">
              Step {step} of {lastStep}
            </span>

            <span className="glf-progress-label text-xs font-bold">
              {steps[step - 1]}
            </span>
          </div>

          <div
            className="grid gap-2"
            style={{
              gridTemplateColumns: `repeat(${lastStep}, minmax(0, 1fr))`,
            }}
          >
            {steps.map((label, index) => {
              const number = index + 1;
              const active = number === step;
              const completed = number < step;
              const StepIcon = STEP_ICONS[index];

              return (
                <button
                  key={label}
                  type="button"
                  disabled={number >= step || isPending}
                  onClick={() => {
                    setErrors({});
                    setStep(number);
                  }}
                  className={`glf-step flex min-w-0 flex-col items-center gap-2 rounded-xl p-2 ${
                    active ? "is-active" : ""
                  } ${completed ? "is-complete" : ""}`}
                >
                  <span className="glf-step-number flex h-9 w-9 items-center justify-center rounded-full">
                    {completed ? (
                      <Check size={17} />
                    ) : (
                      <StepIcon size={16} />
                    )}
                  </span>

                  <span className="hidden truncate text-center text-[11px] font-bold sm:block">
                    {label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Body */}
        <div className="glf-body min-h-0 flex-1 overflow-y-auto px-6 py-5">
          {editDetailsLoading ? (
            <div className="flex min-h-60 flex-col items-center justify-center gap-3">
              <LoaderCircle
                size={28}
                className="glf-loading animate-spin"
              />

              <h3 className="glf-title text-sm font-bold">
                Loading lead details
              </h3>

              <p className="glf-muted text-xs">
                Fetching company and contact information...
              </p>
            </div>
          ) : (
            <>
              {errors.root && (
                <div
                  role="alert"
                  className="glf-error mb-5 rounded-xl p-4 text-sm"
                >
                  {errors.root}
                </div>
              )}

              {/* STEP 1: COMPANY */}
              {step === 1 && (
                <div className="glf-section rounded-2xl p-5">
                  <div className="glf-section-heading mb-5 flex items-center gap-3">
                    <span className="glf-section-icon flex h-10 w-10 items-center justify-center rounded-xl">
                      <Building2 size={19} />
                    </span>

                    <div>
                      <h3 className="glf-title text-base font-extrabold">
                        Company Information
                      </h3>
                      <p className="glf-muted mt-1 text-xs">
                        Basic company and marketing details
                      </p>
                    </div>
                  </div>

                  <div className={gridClass}>
                    <Field
                      label="Company Name"
                      required
                      error={errors.companyName}
                    >
                      <input
                        autoFocus
                        className={inputClass}
                        value={values.companyName}
                        onChange={change("companyName")}
                        placeholder="Enter company name"
                      />
                    </Field>

                    <Field
                      label="Industry"
                      required
                      error={errors.industry}
                    >
                      <select
                        className={inputClass}
                        value={values.industry}
                        onChange={change("industry")}
                      >
                        {LEAD_INDUSTRIES.map((item) => (
                          <option key={item} value={item}>
                            {item}
                          </option>
                        ))}
                      </select>
                    </Field>

                    <Field label="City" error={errors.city}>
                      <input
                        className={inputClass}
                        value={values.city}
                        onChange={change("city")}
                        placeholder="Enter city"
                      />
                    </Field>

                    <Field
                      label="Website"
                      error={errors.website}
                    >
                      <input
                        className={inputClass}
                        value={values.website}
                        onChange={change("website")}
                        placeholder="https://example.com"
                      />
                    </Field>

                    <Field
                      label="Existing Agency"
                      error={errors.agencyRelationship}
                    >
                      <input
                        className={inputClass}
                        value={values.agencyRelationship}
                        onChange={change("agencyRelationship")}
                        placeholder="Current agency relationship"
                      />
                    </Field>

                    <Field
                      label="Marketing Activity"
                      error={errors.marketingActivity}
                      full
                    >
                      <textarea
                        rows={4}
                        className={inputClass}
                        value={values.marketingActivity}
                        onChange={change("marketingActivity")}
                        placeholder="Describe the company's current marketing activities"
                      />
                    </Field>
                  </div>
                </div>
              )}

              {/* STEP 2: CONTACT */}
              {step === 2 && (
                <div className="glf-section rounded-2xl p-5">
                  <div className="glf-section-heading mb-5 flex items-center gap-3">
                    <span className="glf-section-icon flex h-10 w-10 items-center justify-center rounded-xl">
                      <ContactRound size={19} />
                    </span>

                    <div>
                      <h3 className="glf-title text-base font-extrabold">
                        Primary Contact
                      </h3>
                      <p className="glf-muted mt-1 text-xs">
                        Main person associated with this lead
                      </p>
                    </div>
                  </div>

                  <div className={gridClass}>
                    <Field
                      label="Contact Name"
                      required
                      error={errors.contactName}
                    >
                      <input
                        autoFocus
                        className={inputClass}
                        value={values.contactName}
                        onChange={change("contactName")}
                        placeholder="Full name"
                      />
                    </Field>

                    <Field
                      label="Designation"
                      error={errors.designation}
                    >
                      <input
                        className={inputClass}
                        value={values.designation}
                        onChange={change("designation")}
                        placeholder="e.g. Marketing Manager"
                      />
                    </Field>

                    <Field label="Phone" error={errors.phone}>
                      <input
                        type="tel"
                        inputMode="numeric"
                        maxLength={10}
                        className={inputClass}
                        value={values.phone}
                        placeholder="9876543210"
                        onChange={(event) => {
                          const phone = event.target.value
                            .replace(/\D/g, "")
                            .slice(0, 10);

                          setField("phone", phone);
                        }}
                      />
                    </Field>

                    <Field label="Email" error={errors.email}>
                      <input
                        type="email"
                        className={inputClass}
                        value={values.email}
                        onChange={change("email")}
                        placeholder="name@company.com"
                      />
                    </Field>

                    <Field
                      label="Decision Maker"
                      error={errors.decisionMaker}
                    >
                      <select
                        className={inputClass}
                        value={values.decisionMaker}
                        onChange={change("decisionMaker")}
                      >
                        <option value="Yes">Yes</option>
                        <option value="No">No</option>
                      </select>
                    </Field>
                  </div>
                </div>
              )}

              {/* STEP 3: OPPORTUNITY */}
              {step === 3 && (
                <div className="glf-section rounded-2xl p-5">
                  <div className="glf-section-heading mb-5 flex items-center gap-3">
                    <span className="glf-section-icon flex h-10 w-10 items-center justify-center rounded-xl">
                      <ClipboardList size={19} />
                    </span>

                    <div>
                      <h3 className="glf-title text-base font-extrabold">
                        Opportunity Details
                      </h3>
                      <p className="glf-muted mt-1 text-xs">
                        Requirement, source, value and priority
                      </p>
                    </div>
                  </div>

                  <div className={gridClass}>
                    <Field
                      label="Potential Requirement"
                      required
                      error={errors.serviceRequired}
                    >
                      <input
                        autoFocus
                        className={inputClass}
                        value={values.serviceRequired}
                        onChange={change("serviceRequired")}
                        placeholder="e.g. Digital marketing"
                      />
                    </Field>

                    <Field
                      label="Lead Source"
                      required
                      error={errors.source}
                    >
                      <select
                        className={inputClass}
                        value={values.source}
                        onChange={change("source")}
                      >
                        {LEAD_SOURCES.map((item) => (
                          <option key={item} value={item}>
                            {item}
                          </option>
                        ))}
                      </select>
                    </Field>

                    <Field
                      label="Opportunity Value (₹)"
                      error={errors.estimatedValueRupees}
                    >
                      <input
                        type="number"
                        min="0"
                        step="1"
                        className={inputClass}
                        value={values.estimatedValueRupees}
                        onChange={change("estimatedValueRupees")}
                        placeholder="0"
                      />
                    </Field>

                    <Field
                      label="Priority"
                      error={errors.priority}
                    >
                      <select
                        className={inputClass}
                        value={values.priority}
                        onChange={change("priority")}
                      >
                        {LEAD_PRIORITIES.map((item) => (
                          <option key={item} value={item}>
                            {item}
                          </option>
                        ))}
                      </select>
                    </Field>

                    <Field
                      label="Opportunity Description"
                      error={errors.description}
                      full
                    >
                      <textarea
                        rows={4}
                        className={inputClass}
                        value={values.description}
                        onChange={change("description")}
                        placeholder="Describe the opportunity and client requirements"
                      />
                    </Field>
                  </div>
                </div>
              )}

              {/* STEP 4: OWNERSHIP */}
              {step === 4 && (
                <div className="glf-section rounded-2xl p-5">
                  <div className="glf-section-heading mb-5 flex items-center gap-3">
                    <span className="glf-section-icon flex h-10 w-10 items-center justify-center rounded-xl">
                      <UserRound size={19} />
                    </span>

                    <div>
                      <h3 className="glf-title text-base font-extrabold">
                        Lead Ownership
                      </h3>
                      <p className="glf-muted mt-1 text-xs">
                        Assign the responsible branch and owner
                      </p>
                    </div>
                  </div>

                  {branchOptionsQuery.isError && (
                    <div className="glf-error mb-5 rounded-xl p-4 text-sm">
                      {getApiError(
                        branchOptionsQuery.error,
                        "Unable to load branches."
                      )}

                      <button
                        type="button"
                        className="glf-retry mt-2 block text-xs font-bold"
                        onClick={() => branchOptionsQuery.refetch()}
                      >
                        Try again
                      </button>
                    </div>
                  )}

                  <div className={gridClass}>
                    <Field
                      label="Primary Branch"
                      required
                      error={errors.branchId}
                    >
                      <select
                        autoFocus
                        className={inputClass}
                        value={values.branchId}
                        onChange={changeBranch}
                        disabled={
                          branchOptionsQuery.isLoading ||
                          branchOptionsQuery.isError ||
                          branches.length === 0 ||
                          (user?.role !== "SUPER_ADMIN" &&
                            branches.length === 1)
                        }
                      >
                        <option value="">
                          {branchOptionsQuery.isLoading
                            ? "Loading branches..."
                            : branches.length === 0
                              ? "No branches available"
                              : "Select branch"}
                        </option>

                        {branches.map((branch) => (
                          <option
                            key={branch.id}
                            value={String(branch.id)}
                          >
                            {branch.name}
                          </option>
                        ))}
                      </select>
                    </Field>

                    <Field
                      label="Owner"
                      required
                      error={errors.ownerId}
                    >
                      <select
                        className={inputClass}
                        value={values.ownerId}
                        onChange={change("ownerId")}
                        disabled={
                          !values.branchId ||
                          ownersQuery.isLoading ||
                          ownersQuery.isError ||
                          owners.length === 0
                        }
                      >
                        <option value="">
                          {!values.branchId
                            ? "Select branch first"
                            : ownersQuery.isLoading
                              ? "Loading owners..."
                              : owners.length === 0
                                ? "No owners available"
                                : "Select owner"}
                        </option>

                        {owners.map((owner) => (
                          <option
                            key={owner.id}
                            value={String(owner.id)}
                          >
                            {owner.fullName ||
                              owner.name ||
                              `User ${owner.id}`}
                            {owner.role === "SUPER_ADMIN"
                              ? " · Global"
                              : owner.branchName
                                ? ` · ${owner.branchName}`
                                : ""}
                          </option>
                        ))}
                      </select>
                    </Field>
                  </div>

                  {values.branchId && ownersQuery.isError && (
                    <div className="glf-error mt-4 rounded-xl p-4 text-sm">
                      {getApiError(
                        ownersQuery.error,
                        "Unable to load owners for the selected branch."
                      )}

                      <button
                        type="button"
                        className="glf-retry mt-2 block text-xs font-bold"
                        onClick={() => ownersQuery.refetch()}
                      >
                        Try again
                      </button>
                    </div>
                  )}

                  {values.branchId &&
                    !ownersQuery.isLoading &&
                    !ownersQuery.isError &&
                    owners.length === 0 && (
                      <div className="glf-error mt-4 rounded-xl p-4 text-sm">
                        No active owners are available for this branch.
                      </div>
                    )}

                  {selectedBranch && (
                    <div className="glf-branch-summary mt-5 rounded-xl p-4">
                      <p className="text-xs font-bold">
                        Selected Primary Branch
                      </p>

                      <p className="mt-1 text-sm">
                        {selectedBranch.name}
                        {selectedBranch.code
                          ? ` (${selectedBranch.code})`
                          : ""}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* STEP 5: NEXT ACTION — CREATE ONLY */}
              {!isEdit && step === 5 && (
                <div className="glf-section rounded-2xl p-5">
                  <div className="glf-section-heading mb-5 flex items-center gap-3">
                    <span className="glf-section-icon flex h-10 w-10 items-center justify-center rounded-xl">
                      <CheckCircle2 size={19} />
                    </span>

                    <div>
                      <h3 className="glf-title text-base font-extrabold">
                        Next Action
                      </h3>
                      <p className="glf-muted mt-1 text-xs">
                        Schedule the first follow-up for this lead
                      </p>
                    </div>
                  </div>

                  <div className={gridClass}>
                    <Field
                      label="Next Action"
                      required
                      error={errors.nextAction}
                    >
                      <input
                        autoFocus
                        className={inputClass}
                        value={values.nextAction}
                        onChange={change("nextAction")}
                        placeholder="e.g. Call client to discuss requirements"
                      />
                    </Field>

                    <Field
                      label="Follow-up Date"
                      required
                      error={errors.followUpDate}
                    >
                      <input
                        type="date"
                        min={today}
                        className={inputClass}
                        value={values.followUpDate}
                        onChange={(event) => {
                          const selectedDate = event.target.value;
                          const nowTime = getLocalTime();

                          setValues((current) => {
                            let nextTime = current.followUpTime;

                            if (
                              selectedDate === getLocalDate() &&
                              (!nextTime || nextTime < nowTime)
                            ) {
                              nextTime = nowTime;
                            }

                            return {
                              ...current,
                              followUpDate: selectedDate,
                              followUpTime: nextTime,
                            };
                          });

                          setErrors((current) => ({
                            ...current,
                            followUpDate: undefined,
                            followUpTime: undefined,
                            root: undefined,
                          }));
                        }}
                      />
                    </Field>

                    <Field
                      label="Follow-up Time"
                      required
                      error={errors.followUpTime}
                    >
                      <input
                        type="time"
                        min={
                          values.followUpDate === today
                            ? currentTime
                            : undefined
                        }
                        className={inputClass}
                        value={values.followUpTime}
                        onChange={(event) => {
                          const selectedTime = event.target.value;

                          if (
                            values.followUpDate === getLocalDate() &&
                            selectedTime < getLocalTime()
                          ) {
                            setErrors((current) => ({
                              ...current,
                              followUpTime:
                                "Select the current time or a future time.",
                            }));
                            return;
                          }

                          setField("followUpTime", selectedTime);
                        }}
                      />
                    </Field>

                    <Field
                      label="Known Client / Industry?"
                      error={errors.knownRelationship}
                    >
                      <select
                        className={inputClass}
                        value={values.knownRelationship}
                        onChange={change("knownRelationship")}
                      >
                        <option value="No / Unknown">
                          No / Unknown
                        </option>
                        <option value="Yes / Existing">
                          Yes / Existing
                        </option>
                      </select>
                    </Field>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        {!editDetailsLoading && (
          <footer className="glf-footer flex shrink-0 flex-wrap items-center justify-between gap-3 px-6 py-4">
            <div className="hidden items-center gap-2 sm:flex">
              <ShieldCheck size={16} className="glf-security" />

              <span className="glf-muted text-xs">
                {isEdit ? "Secure lead update" : "Secure lead creation"}
              </span>
            </div>

            <div className="ml-auto flex items-center gap-3">
              {step > 1 ? (
                <button
                  type="button"
                  className="glf-secondary inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold"
                  onClick={previousStep}
                  disabled={isPending}
                >
                  <ArrowLeft size={16} />
                  Previous
                </button>
              ) : (
                <button
                  type="button"
                  className="glf-secondary inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold"
                  onClick={handleClose}
                  disabled={isPending}
                >
                  Cancel
                </button>
              )}

              {step < lastStep ? (
                <button
                  type="button"
                  className="glf-primary inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold"
                  onClick={continueForm}
                  disabled={isPending}
                >
                  Continue
                  <ArrowRight size={16} />
                </button>
              ) : (
                <button
                  type="button"
                  className="glf-primary inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold"
                  onClick={submit}
                  disabled={isPending}
                >
                  {isPending ? (
                    <LoaderCircle
                      size={16}
                      className="animate-spin"
                    />
                  ) : (
                    <Check size={16} />
                  )}

                  {isPending
                    ? isEdit
                      ? "Saving..."
                      : "Creating..."
                    : isEdit
                      ? "Save Changes"
                      : "Create Lead"}
                </button>
              )}
            </div>
          </footer>
        )}
      </section>
    </div>,
    document.body
  );
};

export default LeadFormModal;