
import { useEffect } from "react";
import { createPortal } from "react-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Building2,
  Check,
  LoaderCircle,
  Mail,
  Phone,
  ShieldCheck,
  UserRound,
  X,
} from "lucide-react";

import { useCompaniesQuery } from "../companies/companies.queries.js";

import {
  useCreateContactMutation,
  useUpdateContactMutation,
} from "./contacts.queries.js";

import {
  contactFormSchema,
  defaultContactValues,
} from "./contacts.schema.js";

/* =========================================================
   Field Error
   ========================================================= */

const FieldError = ({ message }) => {
  if (!message) return null;

  return (
    <span
      className="gcm-form-error mt-1 block text-xs"
      role="alert"
    >
      {message}
    </span>
  );
};

/* =========================================================
   Contact Form Modal
   ========================================================= */

const ContactFormModal = ({
  open,
  onClose,
  fixedCompanyId = null,
  fixedCompanyName = "",
  contact = null,
}) => {
  const createMutation = useCreateContactMutation();
  const updateMutation = useUpdateContactMutation();

  const isEditing = Boolean(contact?.id);

  const hasFixedCompany =
    fixedCompanyId !== null &&
    fixedCompanyId !== undefined &&
    String(fixedCompanyId).trim() !== "";

  /* -------------------------------------------------------
     Companies
     ------------------------------------------------------- */

  const {
    data: companiesResponse,
    isLoading: companiesLoading,
  } = useCompaniesQuery({
    page: 1,
    limit: 100,
    sort: "name",
    direction: "asc",
  });

  const companies =
    companiesResponse?.data?.companies || [];

  /* -------------------------------------------------------
     React Hook Form
     ------------------------------------------------------- */

  const {
    register,
    handleSubmit,
    reset,
    setError,
    setValue,
    watch,
    formState: {
      errors,
      isSubmitting,
    },
  } = useForm({
    resolver: zodResolver(contactFormSchema),
    mode: "onChange",
    defaultValues: defaultContactValues,
  });

  const phoneValue = watch("phone") || "";

  const busy =
    isSubmitting ||
    createMutation.isPending ||
    updateMutation.isPending;

  /* -------------------------------------------------------
     Reset Form on Open
     ------------------------------------------------------- */

  useEffect(() => {
    if (!open) return;

    reset({
      companyId: String(
        hasFixedCompany
          ? fixedCompanyId
          : contact?.companyId ?? ""
      ),

      name:
        contact?.name ??
        contact?.fullName ??
        "",

      designation:
        contact?.designation ?? "",

      phone:
        contact?.phone ?? "",

      email:
        contact?.email ?? "",

      isDecisionMaker:
        contact?.isDecisionMaker
          ? "true"
          : "false",
    });
  }, [
    open,
    reset,
    contact,
    fixedCompanyId,
    hasFixedCompany,
  ]);


  /* -------------------------------------------------------
     Prevent Background Scrolling
     ------------------------------------------------------- */

  useEffect(() => {
    if (!open) return undefined;

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow =
        previousOverflow;
    };
  }, [open]);

  /* -------------------------------------------------------
     Submit
     ------------------------------------------------------- */

  const submit = async (values) => {
    try {
      const data = {
        ...values,

        companyId: hasFixedCompany
          ? Number(fixedCompanyId)
          : Number(values.companyId),

        designation:
          values.designation?.trim() || null,

        phone:
          values.phone?.trim() || null,

        email:
          values.email?.trim() || null,
      };

      if (isEditing) {
        await updateMutation.mutateAsync({
          contactId: contact.id,
          data,
        });
      } else {
        await createMutation.mutateAsync(data);
      }

      onClose();
    } catch (error) {
      const details =
        error?.response?.data?.errors;

      if (Array.isArray(details)) {
        details.forEach((item) => {
          const field = Array.isArray(item.path)
            ? item.path.at(-1)
            : item.field;

          if (
            field &&
            field in defaultContactValues
          ) {
            setError(field, {
              type: "server",
              message: item.message,
            });
          }
        });
      }

      setError("root", {
        type: "server",
        message:
          error?.response?.data?.message ||
          `Unable to ${
            isEditing ? "update" : "create"
          } contact.`,
      });
    }
  };

  /* -------------------------------------------------------
     Phone Input
     ------------------------------------------------------- */

  const handlePhoneChange = (event) => {
    const cleaned = event.target.value
      .replace(/\D/g, "")
      .slice(0, 10);

    setValue("phone", cleaned, {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true,
    });
  };

  /* -------------------------------------------------------
     Backdrop Click
     ------------------------------------------------------- */

  const handleBackdropClick = (event) => {
    if (
      event.target === event.currentTarget &&
      !busy
    ) {
      onClose();
    }
  };

  /* -------------------------------------------------------
     Render
     ------------------------------------------------------- */

  if (!open) return null;

  const modal = (
    <div
      className="gcm-popup-overlay"
    >
      <section
        className="gcm-popup-container"
        role="dialog"
        aria-modal="true"
        aria-labelledby="contact-modal-title"
      >
        {/* ===============================================
            Header
            =============================================== */}

        <header className="gcm-popup-header flex items-start justify-between gap-4 px-6 py-5">
          <div className="flex min-w-0 items-start gap-3">
            <div className="gcm-popup-header-icon flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl">
              <UserRound size={23} />
            </div>

            <div className="min-w-0">
              <p className="gcm-popup-eyebrow mb-1 text-[10px] font-bold uppercase tracking-[0.15em]">
                Contact Management
              </p>

              <h2
                id="contact-modal-title"
                className="gcm-popup-title text-xl font-extrabold tracking-tight"
              >
                {isEditing
                  ? "Edit Contact"
                  : "Add New Contact"}
              </h2>

              <p className="gcm-popup-muted mt-1 text-xs leading-5">
                {hasFixedCompany && fixedCompanyName
                  ? `${
                      isEditing
                        ? "Editing contact for"
                        : "Adding contact to"
                    } ${fixedCompanyName}`
                  : isEditing
                    ? "Update contact information."
                    : "Create a new company contact."}
              </p>
            </div>
          </div>

          <button
            type="button"
            className="gcm-popup-close flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
            onClick={onClose}
            disabled={busy}
            aria-label="Close contact form"
          >
            <X size={18} />
          </button>
        </header>

        {/* ===============================================
            Form
            =============================================== */}

        <form
          className="gcm-popup-form"
          onSubmit={handleSubmit(submit)}
          noValidate
        >
          <div className="gcm-popup-body px-6 py-6">
            {/* Server Error */}

            {errors.root && (
              <div
                className="gcm-popup-error mb-5 rounded-xl p-3 text-sm"
                role="alert"
              >
                {errors.root.message}
              </div>
            )}

            {/* Section Heading */}

            <div className="mb-5 flex items-center gap-3">
              <span className="gcm-popup-section-icon flex h-10 w-10 items-center justify-center rounded-xl">
                <UserRound size={18} />
              </span>

              <div>
                <h3 className="gcm-popup-title text-sm font-bold">
                  Contact Information
                </h3>

                <p className="gcm-popup-muted mt-1 text-xs">
                  Fields marked * are required
                </p>
              </div>
            </div>

            {/* Fields */}

            <div className="grid grid-cols-1 gap-x-5 gap-y-5 sm:grid-cols-2">
              {/* Company */}

              <label className="flex min-w-0 flex-col gap-2">
                <span className="gcm-popup-label flex items-center gap-2 text-xs font-bold">
                  <Building2 size={15} />
                  Company *
                </span>

                {hasFixedCompany ? (
                  <>
                    <input
                      type="hidden"
                      {...register("companyId")}
                    />

                    <input
                      type="text"
                      value={
                        fixedCompanyName ||
                        `Company #${fixedCompanyId}`
                      }
                      readOnly
                      disabled
                      className="gcm-popup-input h-11 w-full rounded-xl px-3 text-sm"
                    />
                  </>
                ) : (
                  <select
                    {...register("companyId")}
                    disabled={
                      companiesLoading || busy
                    }
                    className="gcm-popup-input h-11 w-full rounded-xl px-3 text-sm"
                  >
                    <option value="">
                      {companiesLoading
                        ? "Loading companies..."
                        : "Select company"}
                    </option>

                    {companies.map((company) => (
                      <option
                        key={company.id}
                        value={company.id}
                      >
                        {company.name}
                      </option>
                    ))}
                  </select>
                )}

                <FieldError
                  message={errors.companyId?.message}
                />
              </label>

              {/* Name */}

              <label className="flex min-w-0 flex-col gap-2">
                <span className="gcm-popup-label flex items-center gap-2 text-xs font-bold">
                  <UserRound size={15} />
                  Full Name *
                </span>

                <input
                  type="text"
                  {...register("name")}
                  maxLength={150}
                  disabled={busy}
                  autoFocus
                  placeholder="Enter contact name"
                  className="gcm-popup-input h-11 w-full rounded-xl px-3 text-sm"
                />

                <FieldError
                  message={errors.name?.message}
                />
              </label>

              {/* Designation */}

              <label className="flex min-w-0 flex-col gap-2">
                <span className="gcm-popup-label flex items-center gap-2 text-xs font-bold">
                  <UserRound size={15} />
                  Designation
                </span>

                <input
                  type="text"
                  {...register("designation")}
                  maxLength={150}
                  disabled={busy}
                  placeholder="e.g. Marketing Director"
                  className="gcm-popup-input h-11 w-full rounded-xl px-3 text-sm"
                />

                <FieldError
                  message={errors.designation?.message}
                />
              </label>

              {/* Phone */}

              <label className="flex min-w-0 flex-col gap-2">
                <span className="gcm-popup-label flex items-center gap-2 text-xs font-bold">
                  <Phone size={15} />
                  Phone Number
                </span>

                <input
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel-national"
                  placeholder="10-digit mobile number"
                  maxLength={10}
                  {...register("phone", {
                    onChange: handlePhoneChange,
                  })}
                  value={phoneValue}
                  disabled={busy}
                  className="gcm-popup-input h-11 w-full rounded-xl px-3 text-sm"
                />

                <FieldError
                  message={errors.phone?.message}
                />

                {!errors.phone &&
                  phoneValue.length > 0 && (
                    <small className="gcm-popup-muted text-[11px]">
                      {phoneValue.length}/10 digits
                    </small>
                  )}
              </label>

              {/* Email */}

              <label className="flex min-w-0 flex-col gap-2">
                <span className="gcm-popup-label flex items-center gap-2 text-xs font-bold">
                  <Mail size={15} />
                  Email Address
                </span>

                <input
                  type="email"
                  placeholder="name@example.com"
                  maxLength={190}
                  {...register("email")}
                  disabled={busy}
                  className="gcm-popup-input h-11 w-full rounded-xl px-3 text-sm"
                />

                <FieldError
                  message={errors.email?.message}
                />
              </label>

              {/* Decision Maker */}

              <label className="flex min-w-0 flex-col gap-2">
                <span className="gcm-popup-label flex items-center gap-2 text-xs font-bold">
                  <ShieldCheck size={15} />
                  Decision Maker
                </span>

                <select
                  {...register("isDecisionMaker")}
                  disabled={busy}
                  className="gcm-popup-input h-11 w-full rounded-xl px-3 text-sm"
                >
                  <option value="false">No</option>
                  <option value="true">Yes</option>
                </select>

                <FieldError
                  message={
                    errors.isDecisionMaker?.message
                  }
                />
              </label>
            </div>

            {/* Information Note */}

            <div className="gcm-popup-note mt-6 flex items-start gap-3 rounded-xl p-4">
              <ShieldCheck
                size={18}
                className="mt-0.5 shrink-0"
              />

              <p className="text-xs leading-5">
                Contact details will be saved using
                your existing CRM validation and API.
              </p>
            </div>
          </div>

          {/* ===============================================
              Footer
              =============================================== */}

          <footer className="gcm-popup-footer flex flex-wrap justify-end gap-3 px-6 py-5">
            <button
              type="button"
              className="gcm-popup-secondary inline-flex min-h-11 items-center justify-center rounded-xl px-5 text-sm font-semibold"
              onClick={onClose}
              disabled={busy}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="gcm-popup-primary inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-5 text-sm font-bold"
              disabled={busy}
            >
              {busy ? (
                <>
                  <LoaderCircle
                    size={16}
                    className="animate-spin"
                  />
                  Saving...
                </>
              ) : (
                <>
                  {/* <Check size={17} /> */}
                  {isEditing
                    ? "Save Changes"
                    : "Add Contact"}
                </>
              )}
            </button>
          </footer>
        </form>
      </section>
    </div>
  );

  return createPortal(modal, document.body);
};

export default ContactFormModal;
