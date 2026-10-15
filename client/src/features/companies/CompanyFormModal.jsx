
import { useEffect } from "react";
import { createPortal } from "react-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Building2,
  BriefcaseBusiness,
  Check,
  Globe2,
  LoaderCircle,
  MapPin,
  Network,
  X,
} from "lucide-react";

import {
  COMPANY_INDUSTRIES,
  companyFormSchema,
  defaultCompanyValues,
} from "./companies.schema.js";

import {
  useCreateCompanyMutation,
} from "./companies.queries.js";

const FieldError = ({ message }) =>
  message ? (
    <span className="gco-form-error text-xs" role="alert">
      {message}
    </span>
  ) : null;

const CompanyFormModal = ({ open, onClose }) => {
  const createMutation = useCreateCompanyMutation();

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(companyFormSchema),
    defaultValues: defaultCompanyValues,
  });

  const busy = isSubmitting || createMutation.isPending;

  useEffect(() => {
    if (open) reset(defaultCompanyValues);
  }, [open, reset]);

  useEffect(() => {
    if (!open) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  const submit = async (values) => {
    try {
      await createMutation.mutateAsync(values);
      reset(defaultCompanyValues);
      onClose();
    } catch (error) {
      const response = error?.response?.data;

      if (response?.code === "COMPANY_ALREADY_EXISTS") {
        setError("name", {
          type: "server",
          message: "Possible existing company found.",
        });
        return;
      }

      setError("root", {
        type: "server",
        message: response?.message || "Unable to create company.",
      });
    }
  };

  if (!open) return null;

  return createPortal(
    <div className="gco-popup-overlay">
      <section
        className="gco-popup relative flex w-full max-w-[680px] flex-col overflow-hidden rounded-[24px]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-company-title"
      >
        <header className="gco-popup-header flex items-start justify-between gap-4 px-6 py-6">
          <div className="flex min-w-0 items-start gap-3">
            <span className="gco-popup-brand flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl">
              <Building2 size={23} />
            </span>

            <div>
              <p className="gco-eyebrow mb-1 text-[10px] font-bold uppercase tracking-[0.15em]">
                Company Management
              </p>
              <h2
                id="add-company-title"
                className="gco-heading text-xl font-extrabold tracking-tight"
              >
                Add New Company
              </h2>
              <p className="gco-muted mt-1 text-xs leading-5">
                Create a new company record in your CRM.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            aria-label="Close company form"
            className="gco-icon-button flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
          >
            <X size={18} />
          </button>
        </header>

        <form
          onSubmit={handleSubmit(submit)}
          noValidate
          className="gco-popup-form flex min-h-0 flex-1 flex-col"
        >
          <div className="gco-popup-body min-h-0 flex-1 overflow-y-auto px-6 py-6">
            {errors.root && (
              <div className="gco-error mb-5 rounded-xl p-3 text-sm" role="alert">
                {errors.root.message}
              </div>
            )}

            <div className="mb-5 flex items-center gap-3">
              <span className="gco-section-icon flex h-10 w-10 items-center justify-center rounded-xl">
                <Building2 size={19} />
              </span>
              <div>
                <h3 className="gco-heading text-sm font-bold">
                  Company Information
                </h3>
                <p className="gco-muted mt-1 text-xs">
                  Fields marked * are required
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-x-5 gap-y-5 sm:grid-cols-2">
              <label className="flex min-w-0 flex-col gap-2">
                <span className="gco-label flex items-center gap-2 text-xs font-bold">
                  <Building2 size={15} />
                  Company Name *
                </span>
                <input
                  type="text"
                  {...register("name")}
                  maxLength={190}
                  disabled={busy}
                  autoFocus
                  placeholder="Enter company or brand name"
                  className="gco-input h-11 w-full rounded-xl px-3 text-sm"
                />
                <FieldError message={errors.name?.message} />
              </label>

              <label className="flex min-w-0 flex-col gap-2">
                <span className="gco-label flex items-center gap-2 text-xs font-bold">
                  <BriefcaseBusiness size={15} />
                  Industry *
                </span>
                <select
                  {...register("industry")}
                  disabled={busy}
                  className="gco-input h-11 w-full rounded-xl px-3 text-sm"
                >
                  {COMPANY_INDUSTRIES.map((industry) => (
                    <option key={industry} value={industry}>
                      {industry}
                    </option>
                  ))}
                </select>
                <FieldError message={errors.industry?.message} />
              </label>

              <label className="flex min-w-0 flex-col gap-2">
                <span className="gco-label flex items-center gap-2 text-xs font-bold">
                  <MapPin size={15} />
                  City
                </span>
                <input
                  type="text"
                  {...register("city")}
                  maxLength={120}
                  disabled={busy}
                  placeholder="e.g. Hyderabad"
                  className="gco-input h-11 w-full rounded-xl px-3 text-sm"
                />
                <FieldError message={errors.city?.message} />
              </label>

              <label className="flex min-w-0 flex-col gap-2">
                <span className="gco-label flex items-center gap-2 text-xs font-bold">
                  <Globe2 size={15} />
                  Website
                </span>
                <input
                  type="text"
                  {...register("website")}
                  maxLength={500}
                  disabled={busy}
                  placeholder="https://example.com"
                  className="gco-input h-11 w-full rounded-xl px-3 text-sm"
                />
                <FieldError message={errors.website?.message} />
              </label>

              <label className="flex min-w-0 flex-col gap-2 sm:col-span-2">
                <span className="gco-label flex items-center gap-2 text-xs font-bold">
                  <Network size={15} />
                  Existing Agency
                </span>
                <input
                  type="text"
                  {...register("agencyRelationship")}
                  maxLength={255}
                  disabled={busy}
                  placeholder="Enter existing agency relationship"
                  className="gco-input h-11 w-full rounded-xl px-3 text-sm"
                />
                <FieldError message={errors.agencyRelationship?.message} />
              </label>
            </div>

            <div className="gco-form-note mt-6 flex items-start gap-3 rounded-xl p-4">
              <Building2 size={18} className="mt-0.5 shrink-0" />
              <p className="text-xs leading-5">
                Company details will be saved through your existing CRM API.
                Duplicate company names will be flagged when detected by
                the backend.
              </p>
            </div>
          </div>

          <footer className="gco-popup-footer flex shrink-0 flex-wrap justify-end gap-3 px-6 py-5">
            <button
              type="button"
              onClick={onClose}
              disabled={busy}
              className="gco-secondary min-h-11 rounded-xl px-5 text-sm font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={busy}
              className="gco-primary inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-5 text-sm font-bold"
            >
              {busy ? (
                <>
                  <LoaderCircle size={16} className="animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Check size={17} />
                  Create Company
                </>
              )}
            </button>
          </footer>
        </form>
      </section>
    </div>,
    document.body
  );
};

export default CompanyFormModal;