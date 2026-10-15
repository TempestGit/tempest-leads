
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";

import {
  Activity,
  ArrowRight,
  Building2,
  CalendarClock,
  Check,
  ClipboardList,
  Clock3,
  FileText,
  LoaderCircle,
  Sparkles,
  X,
} from "lucide-react";

import { useLeadsQuery } from "../leads/leads.queries.js";

import { useCreateActivityMutation } from "./activities.queries.js";

import "./add-activity-glass.css";

/*
|--------------------------------------------------------------------------
| Date Helpers
|--------------------------------------------------------------------------
*/

const pad2 = (value) => String(value).padStart(2, "0");

const getLocalDate = (date = new Date()) =>
  [
    date.getFullYear(),
    pad2(date.getMonth() + 1),
    pad2(date.getDate()),
  ].join("-");

const getLocalTime = (date = new Date()) =>
  `${pad2(date.getHours())}:${pad2(date.getMinutes())}`;

const toDateInput = (value) => {
  if (!value) return "";

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? ""
    : getLocalDate(date);
};

const toTimeInput = (value) => {
  if (!value) return "";

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? ""
    : getLocalTime(date);
};

const getFutureFollowUp = (value) => {
  if (!value) {
    return { date: "", time: "" };
  }

  const date = new Date(value);

  if (
    Number.isNaN(date.getTime()) ||
    date.getTime() <= Date.now()
  ) {
    return { date: "", time: "" };
  }

  return {
    date: toDateInput(value),
    time: toTimeInput(value),
  };
};

/*
|--------------------------------------------------------------------------
| Reusable Field
|--------------------------------------------------------------------------
*/

const FormField = ({
  label,
  required = false,
  hint,
  children,
  full = false,
}) => (
  <div className={`aag-field ${full ? "sm:col-span-2" : ""}`}>
    <label className="aag-label mb-2 block text-xs font-bold">
      {label}
      {required && <span className="aag-required ml-1">*</span>}
    </label>

    {children}

    {hint && (
      <p className="aag-hint mt-1.5 text-[11px] leading-5">
        {hint}
      </p>
    )}
  </div>
);

/*
|--------------------------------------------------------------------------
| Add Activity Modal
|--------------------------------------------------------------------------
*/

const AddActivityModal = ({
  open,
  lead = null,
  onClose,
}) => {
  const mutation = useCreateActivityMutation();

  /*
  |--------------------------------------------------------------------------
  | Load Leads
  |--------------------------------------------------------------------------
  */

  const leadParams = useMemo(
    () => ({
      page: 1,
      limit: 100,
      sort: "createdAt",
      direction: "desc",
    }),
    []
  );

  const leadsQuery = useLeadsQuery(leadParams);

  const leads = leadsQuery.data?.data?.leads || [];

  /*
  |--------------------------------------------------------------------------
  | State
  |--------------------------------------------------------------------------
  */

  const [selectedLeadId, setSelectedLeadId] = useState("");
  const [outcome, setOutcome] = useState("");
  const [notes, setNotes] = useState("");
  const [nextAction, setNextAction] = useState("");
  const [nextFollowUpDate, setNextFollowUpDate] = useState("");
  const [nextFollowUpTime, setNextFollowUpTime] = useState("");
  const [error, setError] = useState("");

  /*
  |--------------------------------------------------------------------------
  | Resolve Lead
  |--------------------------------------------------------------------------
  */

  const resolvedLead =
    lead ||
    leads.find(
      (item) => Number(item.id) === Number(selectedLeadId)
    ) ||
    null;

  /*
  |--------------------------------------------------------------------------
  | Lead Defaults
  |--------------------------------------------------------------------------
  */

  const applyLeadDefaults = (targetLead) => {
    setNextAction(targetLead?.nextAction || "");

    const followUp = getFutureFollowUp(
      targetLead?.followUpAt
    );

    setNextFollowUpDate(followUp.date);
    setNextFollowUpTime(followUp.time);
  };

  /*
  |--------------------------------------------------------------------------
  | Reset When Opened
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (!open) return;

    setSelectedLeadId(lead?.id ? String(lead.id) : "");
    setOutcome("");
    setNotes("");
    setNextAction(lead?.nextAction || "");

    const followUp = getFutureFollowUp(lead?.followUpAt);

    setNextFollowUpDate(followUp.date);
    setNextFollowUpTime(followUp.time);
    setError("");
  }, [open, lead]);

  /*
  |--------------------------------------------------------------------------
  | Global Lead Selection Defaults
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (!open || lead || !resolvedLead) return;

    applyLeadDefaults(resolvedLead);
    setError("");
  }, [open, lead, resolvedLead?.id]);

  /*
  |--------------------------------------------------------------------------
  | Static Backdrop + Scroll Lock
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (!open) return undefined;

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  /*
  |--------------------------------------------------------------------------
  | Close
  |--------------------------------------------------------------------------
  */

  const handleClose = () => {
    if (mutation.isPending) return;
    onClose?.();
  };

  /*
  |--------------------------------------------------------------------------
  | Follow-up Date Change
  |--------------------------------------------------------------------------
  */

  const handleDateChange = (event) => {
    const value = event.target.value;

    if (!value) {
      setNextFollowUpDate("");
      setNextFollowUpTime("");
      setError("");
      return;
    }

    if (value < getLocalDate()) {
      setError("Next follow-up date cannot be in the past.");
      return;
    }

    setNextFollowUpDate(value);
    setError("");
  };

  /*
  |--------------------------------------------------------------------------
  | Follow-up Time Change
  |--------------------------------------------------------------------------
  */

  const handleTimeChange = (event) => {
    setNextFollowUpTime(event.target.value);
    setError("");
  };

  /*
  |--------------------------------------------------------------------------
  | Submit
  |--------------------------------------------------------------------------
  */

  const submit = async () => {
    if (mutation.isPending) return;

    setError("");

    if (!resolvedLead) {
      setError("Select a related lead.");
      return;
    }

    if (!outcome.trim()) {
      setError("Outcome is required.");
      return;
    }

    const hasAction = Boolean(nextAction.trim());
    const hasDate = Boolean(nextFollowUpDate);
    const hasTime = Boolean(nextFollowUpTime);
    const hasAnyFollowUp = hasDate || hasTime;

    if (hasDate !== hasTime) {
      setError(
        "Next follow-up date and time must both be provided."
      );
      return;
    }

    if (hasAction !== hasAnyFollowUp) {
      setError(
        "Next action and next follow-up must be provided together."
      );
      return;
    }

    let nextFollowUpAt = null;

    if (hasAction && hasDate && hasTime) {
      const followUpDate = new Date(
        `${nextFollowUpDate}T${nextFollowUpTime}:00`
      );

      if (Number.isNaN(followUpDate.getTime())) {
        setError(
          "Enter a valid next follow-up date and time."
        );
        return;
      }

      if (followUpDate.getTime() <= Date.now()) {
        setError("Next follow-up must be in the future.");
        return;
      }

      nextFollowUpAt = followUpDate.toISOString();
    }

    try {
      await mutation.mutateAsync({
        leadId: Number(resolvedLead.id),
        activityType: "Activity",
        outcome: outcome.trim(),
        notes: notes.trim() || null,
        nextAction: hasAction ? nextAction.trim() : null,
        nextFollowUpAt,
      });

      onClose?.();
    } catch (requestError) {
      setError(
        requestError?.response?.data?.message ||
          requestError?.message ||
          "Unable to record activity."
      );
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Render
  |--------------------------------------------------------------------------
  */

  if (!open) return null;

  const today = getLocalDate();

  const inputClass =
    "aag-input w-full rounded-xl px-4 py-3 text-sm";

  return createPortal(
    <div className="aag-overlay">
      <section
        className="aag-modal flex flex-col"
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-activity-title"
      >
        {/* ========================================================= */}
        {/* HEADER */}
        {/* ========================================================= */}

        <header className="aag-header flex shrink-0 items-center justify-between gap-4 px-6 py-5">
          <div className="flex min-w-0 items-center gap-4">
            <div className="aag-brand flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl">
              <Activity size={23} />
            </div>

            <div className="min-w-0">
              <p className="aag-eyebrow mb-1 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.14em]">
                <Sparkles size={12} />
                CRM ACTIVITY TRACKING
              </p>

              <h2
                id="add-activity-title"
                className="aag-title text-xl font-extrabold"
              >
                Add Activity
              </h2>

              <p className="aag-muted mt-1 text-xs leading-5">
                Record an interaction, its outcome, and any
                follow-up action.
              </p>
            </div>
          </div>

          <button
            type="button"
            className="aag-close flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
            disabled={mutation.isPending}
            onClick={handleClose}
            aria-label="Close"
          >
            <X size={19} />
          </button>
        </header>

        {/* ========================================================= */}
        {/* BODY */}
        {/* ========================================================= */}

        <div className="aag-body min-h-0 flex-1 space-y-5 overflow-y-auto px-6 py-5">
          {error && (
            <div
              role="alert"
              className="aag-error flex items-start gap-3 rounded-xl p-4 text-sm"
            >
              <span className="shrink-0 font-extrabold">!</span>
              <span>{error}</span>
            </div>
          )}

          {/* Lead Section */}

          <div className="aag-section rounded-2xl p-5">
            <div className="aag-section-heading mb-5 flex items-center gap-3">
              <span className="aag-section-icon flex h-10 w-10 items-center justify-center rounded-xl">
                <Building2 size={19} />
              </span>

              <div>
                <h3 className="aag-title text-sm font-extrabold">
                  Related Lead
                </h3>

                <p className="aag-muted mt-1 text-xs">
                  Choose the lead for this activity
                </p>
              </div>
            </div>

            {!lead ? (
              <FormField label="Select Lead" required>
                <select
                  className={inputClass}
                  value={selectedLeadId}
                  disabled={
                    leadsQuery.isLoading ||
                    mutation.isPending
                  }
                  onChange={(event) => {
                    setSelectedLeadId(event.target.value);
                    setError("");
                  }}
                >
                  <option value="">
                    {leadsQuery.isLoading
                      ? "Loading leads..."
                      : "Select lead"}
                  </option>

                  {leads.map((item) => (
                    <option
                      key={item.id}
                      value={String(item.id)}
                    >
                      {item.companyName} · {item.leadCode}
                      {item.primaryContactName
                        ? ` · ${item.primaryContactName}`
                        : ""}
                    </option>
                  ))}
                </select>
              </FormField>
            ) : (
              <div className="aag-lead-context flex items-center gap-3 rounded-xl p-4">
                <span className="aag-lead-avatar flex h-11 w-11 shrink-0 items-center justify-center rounded-xl">
                  <Building2 size={20} />
                </span>

                <div className="min-w-0">
                  <p className="aag-muted text-[11px] font-semibold">
                    Selected Lead
                  </p>

                  <p className="aag-title mt-1 break-words text-sm font-extrabold">
                    {lead.companyName || "Company"}
                  </p>

                  {lead.leadCode && (
                    <p className="aag-lead-code mt-1 text-xs font-bold">
                      {lead.leadCode}
                    </p>
                  )}
                </div>

                <Check
                  size={18}
                  className="aag-check ml-auto shrink-0"
                />
              </div>
            )}
          </div>

          {/* Activity Details */}

          <div className="aag-section rounded-2xl p-5">
            <div className="aag-section-heading mb-5 flex items-center gap-3">
              <span className="aag-section-icon flex h-10 w-10 items-center justify-center rounded-xl">
                <ClipboardList size={19} />
              </span>

              <div>
                <h3 className="aag-title text-sm font-extrabold">
                  Activity Details
                </h3>

                <p className="aag-muted mt-1 text-xs">
                  Describe what happened during the interaction
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <FormField label="Outcome" required>
                <input
                  type="text"
                  autoFocus={Boolean(lead)}
                  className={inputClass}
                  value={outcome}
                  disabled={mutation.isPending}
                  onChange={(event) => {
                    setOutcome(event.target.value);
                    setError("");
                  }}
                  placeholder="e.g. Client requested a proposal"
                />
              </FormField>

              <FormField
                label="Next Action"
                hint="Optional, unless a follow-up date/time is provided."
              >
                <input
                  type="text"
                  className={inputClass}
                  value={nextAction}
                  disabled={mutation.isPending}
                  onChange={(event) => {
                    setNextAction(event.target.value);
                    setError("");
                  }}
                  placeholder="e.g. Send pricing proposal"
                />
              </FormField>

              <FormField label="Notes" full>
                <textarea
                  rows={4}
                  className={inputClass}
                  value={notes}
                  disabled={mutation.isPending}
                  onChange={(event) => {
                    setNotes(event.target.value);
                    setError("");
                  }}
                  placeholder="Add conversation details, decisions, or important observations..."
                />
              </FormField>
            </div>
          </div>

          {/* Next Follow-up */}

          <div className="aag-section rounded-2xl p-5">
            <div className="aag-section-heading mb-5 flex items-center gap-3">
              <span className="aag-section-icon flex h-10 w-10 items-center justify-center rounded-xl">
                <CalendarClock size={19} />
              </span>

              <div>
                <h3 className="aag-title text-sm font-extrabold">
                  Next Follow-up
                </h3>

                <p className="aag-muted mt-1 text-xs">
                  Schedule the next interaction if required
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <FormField label="Follow-up Date">
                <div className="relative">
                  <input
                    type="date"
                    min={today}
                    className={inputClass}
                    value={nextFollowUpDate}
                    disabled={mutation.isPending}
                    onChange={handleDateChange}
                  />
                </div>
              </FormField>

              <FormField label="Follow-up Time">
                <div className="relative">
                  <input
                    type="time"
                    className={inputClass}
                    value={nextFollowUpTime}
                    disabled={
                      mutation.isPending ||
                      !nextFollowUpDate
                    }
                    onChange={handleTimeChange}
                  />
                </div>
              </FormField>
            </div>

            <div className="aag-info mt-4 flex items-start gap-3 rounded-xl p-3.5">
              <Clock3 size={17} className="mt-0.5 shrink-0" />

              <p className="text-xs leading-5">
                Next action, follow-up date, and follow-up time
                must be provided together. The scheduled time
                must be in the future.
              </p>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* FOOTER */}
        {/* ========================================================= */}

        <footer className="aag-footer flex shrink-0 items-center justify-between gap-3 px-6 py-4">
          <p className="aag-muted hidden text-xs sm:block">
            Activity history is saved to your CRM.
          </p>

          <div className="ml-auto flex items-center gap-3">
            <button
              type="button"
              className="aag-secondary inline-flex h-11 items-center justify-center rounded-xl px-5 text-sm font-bold"
              disabled={mutation.isPending}
              onClick={handleClose}
            >
              Cancel
            </button>

            <button
              type="button"
              className="aag-primary inline-flex h-11 items-center justify-center gap-2 rounded-xl px-5 text-sm font-bold"
              disabled={mutation.isPending}
              onClick={submit}
            >
              {mutation.isPending ? (
                <LoaderCircle
                  size={17}
                  className="animate-spin"
                />
              ) : (
                <Check size={17} />
              )}

              {mutation.isPending
                ? "Saving..."
                : "Save Activity"}
            </button>
          </div>
        </footer>
      </section>
    </div>,
    document.body
  );
};

export default AddActivityModal;