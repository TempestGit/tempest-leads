import { LoaderCircle, X } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCompaniesQuery } from "../companies/companies.queries.js";
import { useCreateContactMutation, useUpdateContactMutation } from "./contacts.queries.js";
import { contactFormSchema, defaultContactValues } from "./contacts.schema.js";

const FieldError = ({ message }) => message ? <span className="form-error">{message}</span> : null;

const ContactFormModal = ({ open, onClose, fixedCompanyId = null, fixedCompanyName = "", contact = null }) => {
  const createMutation = useCreateContactMutation();
  const updateMutation = useUpdateContactMutation();
  const isEditing = Boolean(contact?.id);
  const hasFixedCompany = fixedCompanyId !== null && fixedCompanyId !== undefined && String(fixedCompanyId).trim() !== "";
  const { data: companiesResponse, isLoading: companiesLoading } = useCompaniesQuery({
    page: 1, limit: 100, sort: "name", direction: "asc",
  });
  const companies = companiesResponse?.data?.companies || [];
  const { register, handleSubmit, reset, setError, setValue, watch, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(contactFormSchema), mode: "onChange", defaultValues: defaultContactValues,
  });
  const phoneValue = watch("phone") || "";
  const busy = isSubmitting || createMutation.isPending || updateMutation.isPending;

  useEffect(() => {
    if (!open) return;
    reset({
      companyId: String(hasFixedCompany ? fixedCompanyId : contact?.companyId ?? ""),
      name: contact?.name ?? contact?.fullName ?? "",
      designation: contact?.designation ?? "",
      phone: contact?.phone ?? "",
      email: contact?.email ?? "",
      isDecisionMaker: contact?.isDecisionMaker ? "true" : "false",
    });
  }, [open, reset, contact, fixedCompanyId, hasFixedCompany]);

  useEffect(() => {
    if (!open) return undefined;
    const handleKeyDown = event => {
      if (event.key === "Escape" && !busy) onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, busy, onClose]);

  if (!open) return null;

  const submit = async values => {
    try {
      const data = {
        ...values,
        companyId: hasFixedCompany ? Number(fixedCompanyId) : Number(values.companyId),
        designation: values.designation?.trim() || null,
        phone: values.phone?.trim() || null,
        email: values.email?.trim() || null,
      };
      if (isEditing) {
        await updateMutation.mutateAsync({ contactId: contact.id, data });
      } else {
        await createMutation.mutateAsync(data);
      }
      onClose();
    } catch (error) {
      const details = error?.response?.data?.errors;
      if (Array.isArray(details)) {
        details.forEach(item => {
          const field = Array.isArray(item.path) ? item.path.at(-1) : item.field;
          if (field && field in defaultContactValues) {
            setError(field, { type: "server", message: item.message });
          }
        });
      }
      setError("root", { type: "server", message: error?.response?.data?.message || `Unable to ${isEditing ? "update" : "create"} contact.` });
    }
  };

  const handlePhoneChange = event => {
    setValue("phone", event.target.value.replace(/\D/g, "").slice(0, 10), {
      shouldValidate: true, shouldDirty: true, shouldTouch: true,
    });
  };

  return (
    <div className="modal-backdrop">
      <section className="tl-modal" role="dialog" aria-modal="true" aria-labelledby="contact-modal-title">
        <header className="modal-head">
          <div>
            <h2 id="contact-modal-title">{isEditing ? "Edit contact" : "Add contact"}</h2>
            {hasFixedCompany && fixedCompanyName && <p className="muted">{isEditing ? "Editing contact for" : "Adding contact to"} <b>{fixedCompanyName}</b></p>}
          </div>
          <button type="button" className="icon-control" onClick={onClose} disabled={busy} aria-label="Close"><X size={15} /></button>
        </header>
        <form onSubmit={handleSubmit(submit)}>
          <div className="modal-body">
            {errors.root && <div className="error-box" style={{ marginBottom: 12 }}>{errors.root.message}</div>}
            <div className="form-section"><div className="form-grid2">
              <label>Company *
                {hasFixedCompany ? <>
                  <input type="hidden" {...register("companyId")} />
                  <input type="text" value={fixedCompanyName || `Company #${fixedCompanyId}`} readOnly disabled />
                </> : <select {...register("companyId")} disabled={companiesLoading || busy}>
                  <option value="">{companiesLoading ? "Loading companies..." : "Select company"}</option>
                  {companies.map(company => <option key={company.id} value={company.id}>{company.name}</option>)}
                </select>}
                <FieldError message={errors.companyId?.message} />
              </label>
              <label>Name *
                <input type="text" {...register("name")} maxLength={150} disabled={busy} autoFocus />
                <FieldError message={errors.name?.message} />
              </label>
              <label>Designation
                <input type="text" {...register("designation")} maxLength={150} disabled={busy} />
                <FieldError message={errors.designation?.message} />
              </label>
              <label>Phone
                <input type="tel" inputMode="numeric" autoComplete="tel-national" placeholder="10-digit mobile number"
                  maxLength={10} {...register("phone", { onChange: handlePhoneChange })}
                  value={phoneValue} disabled={busy} />
                <FieldError message={errors.phone?.message} />
                {!errors.phone && phoneValue.length > 0 && <small className="muted">{phoneValue.length}/10 digits</small>}
              </label>
              <label>Email
                <input type="email" placeholder="name@example.com" maxLength={190} {...register("email")} disabled={busy} />
                <FieldError message={errors.email?.message} />
              </label>
              <label>Decision maker
                <select {...register("isDecisionMaker")} disabled={busy}>
                  <option value="false">No</option><option value="true">Yes</option>
                </select>
                <FieldError message={errors.isDecisionMaker?.message} />
              </label>
            </div></div>
          </div>
          <footer className="modal-foot">
            <button type="button" className="tl-secondary" onClick={onClose} disabled={busy}>Cancel</button>
            <button type="submit" className="tl-primary" disabled={busy}>
              {busy ? <><LoaderCircle size={15} className="spin" /> Saving...</> : isEditing ? "Save changes" : "Add contact"}
            </button>
          </footer>
        </form>
      </section>
    </div>
  );
};

export default ContactFormModal;