
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  CalendarDays,
  Check,
  CheckCircle2,
  Clock3,
  FileText,
  LoaderCircle,
  RotateCcw,
  X,
} from "lucide-react";

import { useCompleteMeetingMutation } from "./meetings.queries.js";

const pad2 = (value) => String(value).padStart(2, "0");

const getLocalDate = (value = new Date()) =>
  `${value.getFullYear()}-${pad2(value.getMonth() + 1)}-${pad2(
    value.getDate()
  )}`;

const getLocalTime = (value = new Date()) =>
  `${pad2(value.getHours())}:${pad2(value.getMinutes())}`;

const CompleteMeetingModal = ({ open, meeting, onClose }) => {
  const mutation = useCompleteMeetingMutation();

  const [outcome, setOutcome] = useState("");
  const [notes, setNotes] = useState("");
  const [nextAction, setNextAction] = useState("");
  const [followUpDate, setFollowUpDate] = useState("");
  const [followUpTime, setFollowUpTime] = useState("");
  const [error, setError] = useState("");

  const busy = mutation.isPending;

  useEffect(() => {
    if (!open) return;

    setOutcome("");
    setNotes("");
    setNextAction("");
    setFollowUpDate("");
    setFollowUpTime("");
    setError("");
  }, [open, meeting?.id]);

  useEffect(() => {
    if (!open) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  const handleDateChange = (event) => {
    const selectedDate = event.target.value;

    if (!selectedDate) {
      setFollowUpDate("");
      setFollowUpTime("");
      setError("");
      return;
    }

    const today = getLocalDate();

    if (selectedDate < today) {
      setError("Follow-up date cannot be in the past.");
      return;
    }

    setFollowUpDate(selectedDate);

    if (
      selectedDate === today &&
      followUpTime &&
      followUpTime < getLocalTime()
    ) {
      setFollowUpTime("");
    }

    setError("");
  };

  const handleTimeChange = (event) => {
    const selectedTime = event.target.value;

    if (
      selectedTime &&
      followUpDate === getLocalDate() &&
      selectedTime < getLocalTime()
    ) {
      setError("Follow-up time cannot be in the past.");
      return;
    }

    setFollowUpTime(selectedTime);
    setError("");
  };

  const clearFollowUp = () => {
    setNextAction("");
    setFollowUpDate("");
    setFollowUpTime("");
    setError("");
  };

  const submit = async (event) => {
    event.preventDefault();
    if (busy) return;

    setError("");

    if (!meeting?.id) {
      setError("Meeting ID is missing. Refresh and try again.");
      return;
    }

    const cleanOutcome = outcome.trim();
    const cleanNotes = notes.trim();
    const cleanNextAction = nextAction.trim();

    if (cleanOutcome.length < 2) {
      setError("Meeting outcome must be at least 2 characters.");
      return;
    }

    if (cleanOutcome.length > 500) {
      setError("Meeting outcome cannot exceed 500 characters.");
      return;
    }

    if (cleanNotes.length < 2) {
      setError("Meeting notes must be at least 2 characters.");
      return;
    }

    if (cleanNotes.length > 5000) {
      setError("Meeting notes cannot exceed 5000 characters.");
      return;
    }

    const hasAnyFollowUp = Boolean(
      cleanNextAction || followUpDate || followUpTime
    );

    let followUpAt = null;

    if (hasAnyFollowUp) {
      if (!cleanNextAction) {
        setError("Enter a next action for the follow-up.");
        return;
      }

      if (cleanNextAction.length > 500) {
        setError("Next action cannot exceed 500 characters.");
        return;
      }

      if (!followUpDate) {
        setError("Select a follow-up date.");
        return;
      }

      if (!followUpTime) {
        setError("Select a follow-up time.");
        return;
      }

      const followUpDateTime = new Date(
        `${followUpDate}T${followUpTime}:00`
      );

      if (Number.isNaN(followUpDateTime.getTime())) {
        setError("Enter a valid follow-up date and time.");
        return;
      }

      if (followUpDateTime.getTime() <= Date.now()) {
        setError("Follow-up date and time must be in the future.");
        return;
      }

      followUpAt = followUpDateTime.toISOString();
    }

    try {
      await mutation.mutateAsync({
        meetingId: meeting.id,
        data: {
          outcome: cleanOutcome,
          notes: cleanNotes,
          nextAction: hasAnyFollowUp ? cleanNextAction : null,
          followUpAt: hasAnyFollowUp ? followUpAt : null,
        },
      });

      onClose();
    } catch (requestError) {
      const responseData = requestError?.response?.data;

      const validationMessage = Array.isArray(responseData?.errors)
        ? responseData.errors
            .map((item) =>
              typeof item === "string"
                ? item
                : item?.message || item?.msg
            )
            .filter(Boolean)
            .join(" ")
        : "";

      setError(
        validationMessage ||
          responseData?.message ||
          requestError?.message ||
          "Unable to complete meeting."
      );
    }
  };

  if (!open || !meeting) return null;

  return createPortal(
    <div className="gmp-popup-overlay">
      <section
        className="gmp-popup flex w-full max-w-[720px] flex-col overflow-hidden rounded-[24px]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="complete-meeting-title"
      >
        <header className="gmp-popup-header flex items-start justify-between gap-4 px-6 py-5">
          <div className="flex min-w-0 items-start gap-3">
            <span className="gmp-complete-brand flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl">
              <CheckCircle2 size={23} />
            </span>

            <div>
              <p className="gmp-eyebrow mb-1 text-[10px] font-bold uppercase tracking-[0.15em]">
                Meeting Management
              </p>
              <h2
                id="complete-meeting-title"
                className="gmp-heading text-xl font-extrabold"
              >
                Complete Meeting
              </h2>
              <p className="gmp-muted mt-1 text-xs">
                Record the outcome and optionally plan a follow-up.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            aria-label="Close complete meeting form"
            className="gmp-close flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
          >
            <X size={18} />
          </button>
        </header>

        <form
          onSubmit={submit}
          className="gmp-popup-form flex min-h-0 flex-1 flex-col"
        >
          <div className="gmp-popup-body min-h-0 flex-1 space-y-6 overflow-y-auto px-6 py-6">
            {error && (
              <div className="gmp-error rounded-xl p-3 text-sm" role="alert">
                {error}
              </div>
            )}

            <div className="gmp-context rounded-xl p-4">
              <p className="gmp-muted text-xs font-semibold">
                Selected Meeting
              </p>
              <p className="gmp-heading mt-1 text-sm font-bold">
                {meeting.title || "Untitled Meeting"}
              </p>
              {meeting.companyName && (
                <p className="gmp-muted mt-1 text-xs">
                  {meeting.companyName}
                </p>
              )}
            </div>

            <section className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="gmp-section-icon flex h-10 w-10 items-center justify-center rounded-xl">
                  <CheckCircle2 size={19} />
                </span>
                <div>
                  <h3 className="gmp-heading text-sm font-bold">
                    Meeting Outcome
                  </h3>
                  <p className="gmp-muted mt-1 text-xs">
                    Both fields are required
                  </p>
                </div>
              </div>

              <label className="flex flex-col gap-2">
                <span className="gmp-label flex items-center gap-2 text-xs font-bold">
                  <CheckCircle2 size={15} />
                  Outcome *
                </span>
                <textarea
                  rows={3}
                  maxLength={500}
                  value={outcome}
                  disabled={busy}
                  autoFocus
                  placeholder="What happened during the meeting?"
                  onChange={(event) => {
                    setOutcome(event.target.value);
                    setError("");
                  }}
                  className="gmp-input w-full resize-y rounded-xl p-3 text-sm"
                />
                <span className="gmp-muted text-right text-[11px]">
                  {outcome.length}/500
                </span>
              </label>

              <label className="flex flex-col gap-2">
                <span className="gmp-label flex items-center gap-2 text-xs font-bold">
                  <FileText size={15} />
                  Notes *
                </span>
                <textarea
                  rows={4}
                  maxLength={5000}
                  value={notes}
                  disabled={busy}
                  placeholder="Enter detailed meeting notes"
                  onChange={(event) => {
                    setNotes(event.target.value);
                    setError("");
                  }}
                  className="gmp-input w-full resize-y rounded-xl p-3 text-sm"
                />
                <span className="gmp-muted text-right text-[11px]">
                  {notes.length}/5000
                </span>
              </label>
            </section>

            <section className="gmp-followup-section space-y-4 rounded-2xl p-4 sm:p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="gmp-section-icon flex h-10 w-10 items-center justify-center rounded-xl">
                    <CalendarDays size={19} />
                  </span>
                  <div>
                    <h3 className="gmp-heading text-sm font-bold">
                      Next Follow-up
                    </h3>
                    <p className="gmp-muted mt-1 text-xs">
                      Optional
                    </p>
                  </div>
                </div>

                {(nextAction || followUpDate || followUpTime) && (
                  <button
                    type="button"
                    onClick={clearFollowUp}
                    disabled={busy}
                    className="gmp-secondary inline-flex min-h-9 items-center gap-2 rounded-xl px-3 text-xs font-semibold"
                  >
                    <RotateCcw size={14} />
                    Clear Follow-up
                  </button>
                )}
              </div>

              <label className="flex flex-col gap-2">
                <span className="gmp-label text-xs font-bold">
                  Next Action
                </span>
                <input
                  type="text"
                  maxLength={500}
                  value={nextAction}
                  disabled={busy}
                  placeholder="e.g. Send revised proposal"
                  onChange={(event) => {
                    setNextAction(event.target.value);
                    setError("");
                  }}
                  className="gmp-input h-11 w-full rounded-xl px-3 text-sm"
                />
              </label>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label className="flex flex-col gap-2">
                  <span className="gmp-label flex items-center gap-2 text-xs font-bold">
                    <CalendarDays size={15} />
                    Follow-up Date
                  </span>
                  <input
                    type="date"
                    min={getLocalDate()}
                    value={followUpDate}
                    disabled={busy}
                    onChange={handleDateChange}
                    className="gmp-input h-11 w-full rounded-xl px-3 text-sm"
                  />
                </label>

                <label className="flex flex-col gap-2">
                  <span className="gmp-label flex items-center gap-2 text-xs font-bold">
                    <Clock3 size={15} />
                    Follow-up Time
                  </span>
                  <input
                    type="time"
                    min={
                      followUpDate === getLocalDate()
                        ? getLocalTime()
                        : undefined
                    }
                    value={followUpTime}
                    disabled={busy || !followUpDate}
                    onChange={handleTimeChange}
                    className="gmp-input h-11 w-full rounded-xl px-3 text-sm"
                  />
                </label>
              </div>

              <p className="gmp-muted text-xs leading-5">
                If you add a follow-up, enter the next action, date and
                time together.
              </p>
            </section>
          </div>

          <footer className="gmp-popup-footer flex shrink-0 justify-end gap-3 px-6 py-5">
            <button
              type="button"
              onClick={onClose}
              disabled={busy}
              className="gmp-secondary min-h-11 rounded-xl px-5 text-sm font-semibold"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={busy}
              className="gmp-primary inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-5 text-sm font-bold"
            >
              {busy ? (
                <>
                  <LoaderCircle size={16} className="animate-spin" />
                  Completing...
                </>
              ) : (
                <>
                  <Check size={17} />
                  Complete Meeting
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

export default CompleteMeetingModal;