
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";

import {
  Activity,
  Building2,
  CalendarDays,
  Check,
  ClipboardList,
  Clock3,
  FileText,
  LoaderCircle,
  X,
} from "lucide-react";

import { useLeadsQuery } from "../leads/leads.queries.js";
import { useCreateActivityMutation } from "./activities.queries.js";

import "./add-activity-glass.css";

const pad2 = (value) => String(value).padStart(2, "0");

const getLocalDate = (date = new Date()) =>
  `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(
    date.getDate()
  )}`;

const getLocalTime = (date = new Date()) =>
  `${pad2(date.getHours())}:${pad2(date.getMinutes())}`;

const getFutureFollowUp = (value) => {
  if (!value) return { date: "", time: "" };

  const date = new Date(value);

  if (
    Number.isNaN(date.getTime()) ||
    date.getTime() <= Date.now()
  ) {
    return { date: "", time: "" };
  }

  return {
    date: getLocalDate(date),
    time: getLocalTime(date),
  };
};

const AddActivityModal = ({
  open,
  lead = null,
  onClose,
}) => {
  const mutation = useCreateActivityMutation();
  const busy = mutation.isPending;

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

  const [selectedLeadId, setSelectedLeadId] = useState("");
  const [outcome, setOutcome] = useState("");
  const [notes, setNotes] = useState("");
  const [nextAction, setNextAction] = useState("");
  const [nextFollowUpDate, setNextFollowUpDate] = useState("");
  const [nextFollowUpTime, setNextFollowUpTime] = useState("");
  const [error, setError] = useState("");

  const resolvedLead =
    lead ||
    leads.find(
      (item) => Number(item.id) === Number(selectedLeadId)
    ) ||
    null;

  useEffect(() => {
    if (!open) return;

    const followUp = getFutureFollowUp(lead?.followUpAt);

    setSelectedLeadId(lead?.id ? String(lead.id) : "");
    setOutcome("");
    setNotes("");
    setNextAction(lead?.nextAction || "");
    setNextFollowUpDate(followUp.date);
    setNextFollowUpTime(followUp.time);
    setError("");
  }, [open, lead?.id]);

  useEffect(() => {
    if (!open || lead || !resolvedLead) return;

    const followUp = getFutureFollowUp(
      resolvedLead.followUpAt
    );

    setNextAction(resolvedLead.nextAction || "");
    setNextFollowUpDate(followUp.date);
    setNextFollowUpTime(followUp.time);
    setError("");
  }, [open, lead, resolvedLead?.id]);

  useEffect(() => {
    if (!open) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  const handleClose = () => {
    if (busy) return;
    onClose?.();
  };

  const handleDateChange = (event) => {
    const selectedDate = event.target.value;
    const today = getLocalDate();

    if (selectedDate && selectedDate < today) {
      setError("Next follow-up date cannot be in the past.");
      return;
    }

    setNextFollowUpDate(selectedDate);

    if (!selectedDate) {
      setNextFollowUpTime("");
    } else if (
      selectedDate === today &&
      nextFollowUpTime &&
      nextFollowUpTime <= getLocalTime()
    ) {
      setNextFollowUpTime("");
    }

    setError("");
  };

  const handleTimeChange = (event) => {
    const selectedTime = event.target.value;

    if (
      nextFollowUpDate === getLocalDate() &&
      selectedTime &&
      selectedTime <= getLocalTime()
    ) {
      setError("Next follow-up time must be in the future.");
      return;
    }

    setNextFollowUpTime(selectedTime);
    setError("");
  };

  const submit = async (event) => {
    event.preventDefault();

    if (busy) return;

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
    const hasFollowUp = hasDate || hasTime;

    if (hasDate !== hasTime) {
      setError(
        "Next follow-up date and time must both be provided."
      );
      return;
    }

    if (hasAction !== hasFollowUp) {
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
        setError("Enter a valid next follow-up date and time.");
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

  if (!open) return null;

  const today = getLocalDate();

  return createPortal(
    <div className="gmp-popup-overlay">
      <section
        className="gmp-popup flex w-full max-w-[720px] flex-col overflow-hidden rounded-[24px]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-activity-title"
      >
        {/* HEADER */}

        <header className="gmp-popup-header flex items-start justify-between gap-4 px-6 py-5">
          <div className="flex items-start gap-3">
            <span className="gmp-popup-brand flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl">
              <Activity size={23} />
            </span>

            <div>
              <p className="gmp-eyebrow mb-1 text-[10px] font-bold uppercase tracking-[0.15em]">
                Activity Management
              </p>

              <h2
                id="add-activity-title"
                className="gmp-heading text-xl font-extrabold"
              >
                Add Activity
              </h2>

              <p className="gmp-muted mt-1 text-xs">
                Record your latest client interaction.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            disabled={busy}
            aria-label="Close add activity form"
            className="gmp-close flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
          >
            <X size={18} />
          </button>
        </header>

        {/* FORM */}

        <form
          className="gmp-popup-form flex min-h-0 flex-1 flex-col"
          onSubmit={submit}
        >
          <div className="gmp-popup-body min-h-0 flex-1 overflow-y-auto px-6 py-6">
            {error && (
              <div
                className="gmp-error mb-5 rounded-xl p-3 text-sm"
                role="alert"
              >
                {error}
              </div>
            )}

            {/* SECTION HEADING */}

            <div className="mb-5 flex items-center gap-3">
              <span className="gmp-section-icon flex h-10 w-10 items-center justify-center rounded-xl">
                <ClipboardList size={18} />
              </span>

              <div>
                <h3 className="gmp-heading text-sm font-bold">
                  Activity Details
                </h3>

                <p className="gmp-muted mt-1 text-xs">
                  Fields marked * are required
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              {/* RELATED LEAD */}

              <div className="sm:col-span-2">
                {lead ? (
                  <div className="gmp-context rounded-xl p-4">
                    <span className="gmp-muted text-xs font-semibold">
                      Related Lead
                    </span>

                    <p className="gmp-heading mt-1 text-sm font-bold">
                      {lead.companyName || "Lead"}
                      {" · "}
                      {lead.leadCode || lead.id}
                    </p>
                  </div>
                ) : (
                  <label className="flex flex-col gap-2">
                    <span className="gmp-label flex items-center gap-2 text-xs font-bold">
                      <Building2 size={15} />
                      Related Lead *
                    </span>

                    <select
                      value={selectedLeadId}
                      disabled={busy || leadsQuery.isLoading}
                      onChange={(event) => {
                        setSelectedLeadId(event.target.value);
                        setError("");
                      }}
                      className="gmp-input h-11 w-full rounded-xl px-3 text-sm"
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
                  </label>
                )}
              </div>

              {/* OUTCOME */}

              <label className="flex flex-col gap-2 sm:col-span-2">
                <span className="gmp-label flex items-center gap-2 text-xs font-bold">
                  <Check size={15} />
                  Outcome *
                </span>

                <input
                  type="text"
                  value={outcome}
                  disabled={busy}
                  autoFocus={Boolean(lead)}
                  onChange={(event) => {
                    setOutcome(event.target.value);
                    setError("");
                  }}
                  placeholder="e.g. Client requested a proposal"
                  className="gmp-input h-11 w-full rounded-xl px-3 text-sm"
                />
              </label>

              {/* NOTES */}

              <label className="flex flex-col gap-2 sm:col-span-2">
                <span className="gmp-label flex items-center gap-2 text-xs font-bold">
                  <FileText size={15} />
                  Notes
                </span>

                <textarea
                  rows={3}
                  value={notes}
                  disabled={busy}
                  onChange={(event) => {
                    setNotes(event.target.value);
                    setError("");
                  }}
                  placeholder="Add conversation details, decisions, or observations..."
                  className="gmp-input w-full resize-y rounded-xl p-3 text-sm"
                />
              </label>
            </div>

            {/* NEXT FOLLOW-UP */}

            <div className="my-6 border-t border-[var(--gmp-page-palette-003)]" />

            <div className="mb-5 flex items-center gap-3">
              <span className="gmp-section-icon flex h-10 w-10 items-center justify-center rounded-xl">
                <CalendarDays size={18} />
              </span>

              <div>
                <h3 className="gmp-heading text-sm font-bold">
                  Next Follow-up
                </h3>

                <p className="gmp-muted mt-1 text-xs">
                  Optional — schedule your next action
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              {/* NEXT ACTION */}

              <label className="flex flex-col gap-2 sm:col-span-2">
                <span className="gmp-label flex items-center gap-2 text-xs font-bold">
                  <ClipboardList size={15} />
                  Next Action
                </span>

                <input
                  type="text"
                  value={nextAction}
                  disabled={busy}
                  onChange={(event) => {
                    setNextAction(event.target.value);
                    setError("");
                  }}
                  placeholder="e.g. Send pricing proposal"
                  className="gmp-input h-11 w-full rounded-xl px-3 text-sm"
                />
              </label>

              {/* FOLLOW-UP DATE */}

              <label className="flex flex-col gap-2">
                <span className="gmp-label flex items-center gap-2 text-xs font-bold">
                  <CalendarDays size={15} />
                  Follow-up Date
                </span>

                <input
                  type="date"
                  min={today}
                  value={nextFollowUpDate}
                  disabled={busy}
                  onChange={handleDateChange}
                  className="gmp-input h-11 w-full rounded-xl px-3 text-sm"
                />
              </label>

              {/* FOLLOW-UP TIME */}

              <label className="flex flex-col gap-2">
                <span className="gmp-label flex items-center gap-2 text-xs font-bold">
                  <Clock3 size={15} />
                  Follow-up Time
                </span>

                <input
                  type="time"
                  min={
                    nextFollowUpDate === today
                      ? getLocalTime()
                      : undefined
                  }
                  value={nextFollowUpTime}
                  disabled={busy || !nextFollowUpDate}
                  onChange={handleTimeChange}
                  className="gmp-input h-11 w-full rounded-xl px-3 text-sm"
                />
              </label>
            </div>

            <div className="gmp-note mt-5 flex items-start gap-3 rounded-xl p-4">
              <Clock3
                size={18}
                className="mt-0.5 shrink-0"
              />

              <p className="text-xs leading-5">
                Next action, follow-up date, and
                follow-up time must be provided
                together. Follow-ups must be
                scheduled for a future date and time.
              </p>
            </div>
          </div>

          {/* FOOTER */}

          <footer className="gmp-popup-footer flex shrink-0 justify-end gap-3 px-6 py-5">
            <button
              type="button"
              onClick={handleClose}
              disabled={busy}
              className="gmp-secondary min-h-11 rounded-xl px-5 text-sm font-semibold"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={busy}
              className="gmp-primary inline-flex min-h-11 items-center gap-2 rounded-xl px-5 text-sm font-bold"
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
                  <Check size={17} />
                  Save Activity
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

export default AddActivityModal;