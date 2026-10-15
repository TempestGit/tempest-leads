
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

import {
  CalendarDays,
  Check,
  CheckCircle2,
  Clock3,
  FileText,
  Flag,
  LoaderCircle,
  RotateCcw,
  X,
} from "lucide-react";

import { useCompleteFollowupMutation } from "./followups.queries.js";

const pad2 = (value) => String(value).padStart(2, "0");

const getLocalDate = (value = new Date()) =>
  `${value.getFullYear()}-${pad2(value.getMonth() + 1)}-${pad2(
    value.getDate()
  )}`;

const getLocalTime = (value = new Date()) =>
  `${pad2(value.getHours())}:${pad2(value.getMinutes())}`;

const getApiError = (error, fallback) => {
  const response = error?.response?.data;

  const validation = (
    Array.isArray(response?.errors) ? response.errors : []
  )
    .map((item) =>
      typeof item === "string"
        ? item
        : item?.message || item?.msg || ""
    )
    .filter(Boolean)
    .join(" ");

  return validation || response?.message || error?.message || fallback;
};

const CompleteFollowupModal = ({
  open,
  followup,
  onClose,
}) => {
  const mutation = useCompleteFollowupMutation();

  const [outcome, setOutcome] = useState("");
  const [notes, setNotes] = useState("");
  const [nextAction, setNextAction] = useState("");
  const [nextDate, setNextDate] = useState("");
  const [nextTime, setNextTime] = useState("");
  const [nextPriority, setNextPriority] = useState("Medium");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;

    setOutcome("");
    setNotes("");
    setNextAction("");
    setNextDate("");
    setNextTime("");
    setNextPriority(
      ["High", "Medium", "Low"].includes(followup?.priority)
        ? followup.priority
        : "Medium"
    );
    setError("");
  }, [open, followup?.id, followup?.priority]);

  useEffect(() => {
    if (!open) return undefined;

    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  if (!open || !followup) return null;

  const busy = mutation.isPending;
  const today = getLocalDate();
  const currentTime = getLocalTime();

  const clearNextFollowup = () => {
    setNextAction("");
    setNextDate("");
    setNextTime("");
    setNextPriority(
      ["High", "Medium", "Low"].includes(followup.priority)
        ? followup.priority
        : "Medium"
    );
    setError("");
  };

  const handleDateChange = (event) => {
    const value = event.target.value;

    if (!value) {
      setNextDate("");
      setNextTime("");
      setError("");
      return;
    }

    if (value < getLocalDate()) {
      setError("Next follow-up date cannot be in the past.");
      return;
    }

    setNextDate(value);

    if (
      value === getLocalDate() &&
      nextTime &&
      nextTime < getLocalTime()
    ) {
      setNextTime("");
    }

    setError("");
  };

  const handleTimeChange = (event) => {
    const value = event.target.value;

    if (
      value &&
      nextDate === getLocalDate() &&
      value < getLocalTime()
    ) {
      setError("Next follow-up time cannot be in the past.");
      return;
    }

    setNextTime(value);
    setError("");
  };

  const submit = async (event) => {
    event.preventDefault();
    if (busy) return;

    setError("");

    if (!followup.id) {
      setError("Follow-up ID is missing. Refresh and try again.");
      return;
    }

    const cleanOutcome = outcome.trim();
    const cleanNotes = notes.trim();
    const cleanNextAction = nextAction.trim();

    if (cleanOutcome.length < 2) {
      setError(
        cleanOutcome
          ? "Outcome must be at least 2 characters."
          : "Outcome is required."
      );
      return;
    }

    if (cleanOutcome.length > 500) {
      setError("Outcome cannot exceed 500 characters.");
      return;
    }

    if (cleanNotes.length < 2) {
      setError(
        cleanNotes
          ? "Notes must be at least 2 characters."
          : "Notes are required."
      );
      return;
    }

    if (cleanNotes.length > 5000) {
      setError("Notes cannot exceed 5000 characters.");
      return;
    }

    const hasNext = Boolean(cleanNextAction || nextDate || nextTime);

    const data = {
      outcome: cleanOutcome,
      notes: cleanNotes,
    };

    if (hasNext) {
      if (cleanNextAction.length < 2) {
        setError("Next action must be at least 2 characters.");
        return;
      }

      if (cleanNextAction.length > 500) {
        setError("Next action cannot exceed 500 characters.");
        return;
      }

      if (!nextDate) {
        setError("Select a next follow-up date.");
        return;
      }

      if (!nextTime) {
        setError("Select a next follow-up time.");
        return;
      }

      if (!["High", "Medium", "Low"].includes(nextPriority)) {
        setError("Select a valid next priority.");
        return;
      }

      const nextDateTime = new Date(
        `${nextDate}T${nextTime}:00`
      );

      if (Number.isNaN(nextDateTime.getTime())) {
        setError("Enter a valid next follow-up date and time.");
        return;
      }

      if (nextDateTime.getTime() < Date.now() - 60 * 1000) {
        setError("Next follow-up cannot be in the past.");
        return;
      }

      data.nextAction = cleanNextAction;
      data.nextFollowUpAt = nextDateTime.toISOString();
      data.nextPriority = nextPriority;
    }

    try {
      await mutation.mutateAsync({
        followupId: followup.id,
        data,
      });

      onClose();
    } catch (requestError) {
      setError(
        getApiError(requestError, "Unable to complete follow-up.")
      );
    }
  };

  return createPortal(
    <div className="gfp-modal-overlay" role="presentation">
      <section
        className="gfp-modal gfp-modal-wide"
        role="dialog"
        aria-modal="true"
        aria-labelledby="gfp-complete-title"
      >
        <header className="gfp-modal-header">
          <div className="flex items-center gap-3">
            <span className="gfp-modal-brand gfp-modal-brand-green flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl">
              <CheckCircle2 size={23} />
            </span>

            <div>
              <h2
                id="gfp-complete-title"
                className="text-lg font-extrabold"
              >
                Complete Follow-up
              </h2>

              <p className="mt-1 text-xs">
                Record the result and plan the next step.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            aria-label="Close"
            className="gfp-modal-close flex h-9 w-9 items-center justify-center rounded-xl"
          >
            <X size={18} />
          </button>
        </header>

        <form onSubmit={submit} className="gfp-modal-form">
          <div className="gfp-modal-body space-y-5">
            {error && (
              <div
                role="alert"
                className="gfp-modal-error rounded-xl px-4 py-3 text-sm"
              >
                {error}
              </div>
            )}

            <div className="gfp-context rounded-2xl p-4">
              <p className="text-[11px] font-bold uppercase tracking-wide">
                Current Follow-up
              </p>

              <p className="mt-2 text-sm font-bold">
                {followup.action || "Follow-up"}
              </p>

              {followup.companyName && (
                <p className="mt-1 text-xs">
                  {followup.companyName}
                </p>
              )}
            </div>

            <label className="gfp-field">
              <span className="flex items-center gap-2">
                <CheckCircle2 size={15} />
                Outcome *
              </span>

              <textarea
                rows={3}
                maxLength={500}
                autoFocus
                value={outcome}
                disabled={busy}
                placeholder="What happened with this follow-up?"
                onChange={(event) => {
                  setOutcome(event.target.value);
                  setError("");
                }}
              />
            </label>

            <label className="gfp-field">
              <span className="flex items-center gap-2">
                <FileText size={15} />
                Notes *
              </span>

              <textarea
                rows={4}
                maxLength={5000}
                value={notes}
                disabled={busy}
                placeholder="Record the follow-up notes"
                onChange={(event) => {
                  setNotes(event.target.value);
                  setError("");
                }}
              />
            </label>

            <div className="gfp-next-section space-y-4 rounded-2xl p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="gfp-heading flex items-center gap-2 text-sm font-bold">
                    <RotateCcw size={16} />
                    Next Follow-up
                  </h3>

                  <p className="gfp-muted mt-1 text-xs">
                    Optional — leave blank to finish without scheduling another.
                  </p>
                </div>

                {(nextAction || nextDate || nextTime) && (
                  <button
                    type="button"
                    onClick={clearNextFollowup}
                    disabled={busy}
                    className="gfp-modal-secondary rounded-lg px-3 py-2 text-xs font-bold"
                  >
                    Clear
                  </button>
                )}
              </div>

              <label className="gfp-field">
                <span>Next Action</span>

                <input
                  type="text"
                  maxLength={500}
                  value={nextAction}
                  disabled={busy}
                  placeholder="e.g. Call customer next week"
                  onChange={(event) => {
                    setNextAction(event.target.value);
                    setError("");
                  }}
                />
              </label>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label className="gfp-field">
                  <span className="flex items-center gap-2">
                    <CalendarDays size={15} />
                    Follow-up Date
                  </span>

                  <input
                    type="date"
                    min={today}
                    value={nextDate}
                    disabled={busy}
                    onChange={handleDateChange}
                  />
                </label>

                <label className="gfp-field">
                  <span className="flex items-center gap-2">
                    <Clock3 size={15} />
                    Follow-up Time
                  </span>

                  <input
                    type="time"
                    min={
                      nextDate === today
                        ? currentTime
                        : undefined
                    }
                    value={nextTime}
                    disabled={busy || !nextDate}
                    onChange={handleTimeChange}
                  />
                </label>
              </div>

              <label className="gfp-field">
                <span className="flex items-center gap-2">
                  <Flag size={15} />
                  Next Priority
                </span>

                <select
                  value={nextPriority}
                  disabled={busy}
                  onChange={(event) => {
                    setNextPriority(event.target.value);
                    setError("");
                  }}
                >
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </label>
            </div>
          </div>

          <footer className="gfp-modal-footer flex flex-wrap items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={busy}
              className="gfp-modal-secondary rounded-xl px-5 py-2.5 text-sm font-bold"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={busy}
              className="gfp-modal-primary gfp-modal-success inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold"
            >
              {busy ? (
                <LoaderCircle size={16} className="animate-spin" />
              ) : (
                <Check size={16} />
              )}

              {busy ? "Completing..." : "Complete Follow-up"}
            </button>
          </footer>
        </form>
      </section>
    </div>,
    document.body
  );
};

export default CompleteFollowupModal;