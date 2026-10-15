
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

import {
  CalendarClock,
  CalendarDays,
  Check,
  Clock3,
  FileText,
  LoaderCircle,
  X,
} from "lucide-react";

import { useRescheduleFollowupMutation } from "./followups.queries.js";

const pad2 = (value) => String(value).padStart(2, "0");

const getLocalDate = (value = new Date()) =>
  `${value.getFullYear()}-${pad2(value.getMonth() + 1)}-${pad2(
    value.getDate()
  )}`;

const getLocalTime = (value = new Date()) =>
  `${pad2(value.getHours())}:${pad2(value.getMinutes())}`;

const toLocalInputs = (value) => {
  if (!value) return { date: "", time: "" };

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return { date: "", time: "" };
  }

  return {
    date: getLocalDate(parsed),
    time: getLocalTime(parsed),
  };
};

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

const RescheduleFollowupModal = ({
  open,
  followup,
  onClose,
}) => {
  const mutation = useRescheduleFollowupMutation();

  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open || !followup) return;

    const existingDateTime = followup.dueAt
      ? new Date(followup.dueAt)
      : null;

    if (
      !existingDateTime ||
      Number.isNaN(existingDateTime.getTime()) ||
      existingDateTime.getTime() <= Date.now()
    ) {
      const suggested = new Date(Date.now() + 30 * 60 * 1000);

      setDate(getLocalDate(suggested));
      setTime(getLocalTime(suggested));
    } else {
      const existing = toLocalInputs(followup.dueAt);

      setDate(existing.date);
      setTime(existing.time);
    }

    setReason("");
    setError("");
  }, [open, followup?.id, followup?.dueAt]);

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

  const handleDateChange = (event) => {
    const value = event.target.value;

    if (!value) {
      setDate("");
      setTime("");
      setError("");
      return;
    }

    if (value < getLocalDate()) {
      setError("Follow-up date cannot be in the past.");
      return;
    }

    setDate(value);

    if (
      value === getLocalDate() &&
      time &&
      time < getLocalTime()
    ) {
      setTime("");
    }

    setError("");
  };

  const handleTimeChange = (event) => {
    const value = event.target.value;

    if (
      value &&
      date === getLocalDate() &&
      value < getLocalTime()
    ) {
      setError("Follow-up time cannot be in the past.");
      return;
    }

    setTime(value);
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

    if (!date || !time) {
      setError("Follow-up date and time are required.");
      return;
    }

    const cleanReason = reason.trim();

    if (cleanReason.length < 2) {
      setError(
        cleanReason
          ? "Reschedule reason must be at least 2 characters."
          : "Reschedule reason is required."
      );
      return;
    }

    if (cleanReason.length > 1000) {
      setError("Reschedule reason cannot exceed 1000 characters.");
      return;
    }

    const dueAt = new Date(`${date}T${time}:00`);

    if (Number.isNaN(dueAt.getTime())) {
      setError("Enter a valid follow-up date and time.");
      return;
    }

    if (dueAt.getTime() < Date.now() - 60 * 1000) {
      setError("Follow-up date and time cannot be in the past.");
      return;
    }

    if (followup.dueAt) {
      const oldDate = new Date(followup.dueAt);

      if (!Number.isNaN(oldDate.getTime())) {
        const oldMinute = Math.floor(
          oldDate.getTime() / 60000
        );

        const newMinute = Math.floor(
          dueAt.getTime() / 60000
        );

        if (oldMinute === newMinute) {
          setError(
            "Choose a different date or time to reschedule the follow-up."
          );
          return;
        }
      }
    }

    try {
      await mutation.mutateAsync({
        followupId: followup.id,
        data: {
          dueAt: dueAt.toISOString(),
          reason: cleanReason,
        },
      });

      onClose();
    } catch (requestError) {
      setError(
        getApiError(
          requestError,
          "Unable to reschedule follow-up."
        )
      );
    }
  };

  return createPortal(
    <div className="gfp-modal-overlay" role="presentation">
      <section
        className="gfp-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="gfp-reschedule-title"
      >
        <header className="gfp-modal-header">
          <div className="flex items-center gap-3">
            <span className="gfp-modal-brand gfp-modal-brand-violet flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl">
              <CalendarClock size={23} />
            </span>

            <div>
              <h2
                id="gfp-reschedule-title"
                className="text-lg font-extrabold"
              >
                Reschedule Follow-up
              </h2>

              <p className="mt-1 text-xs">
                Choose a new date and time.
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
                  {followup.leadCode
                    ? ` · ${followup.leadCode}`
                    : ""}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="gfp-field">
                <span className="flex items-center gap-2">
                  <CalendarDays size={15} />
                  New Date *
                </span>

                <input
                  type="date"
                  min={today}
                  value={date}
                  disabled={busy}
                  autoFocus
                  onChange={handleDateChange}
                />
              </label>

              <label className="gfp-field">
                <span className="flex items-center gap-2">
                  <Clock3 size={15} />
                  New Time *
                </span>

                <input
                  type="time"
                  min={date === today ? currentTime : undefined}
                  value={time}
                  disabled={busy || !date}
                  onChange={handleTimeChange}
                />
              </label>
            </div>

            <label className="gfp-field">
              <span className="flex items-center gap-2">
                <FileText size={15} />
                Reschedule Reason *
              </span>

              <textarea
                rows={4}
                maxLength={1000}
                value={reason}
                disabled={busy}
                placeholder="Why is this follow-up being rescheduled?"
                onChange={(event) => {
                  setReason(event.target.value);
                  setError("");
                }}
              />
            </label>
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
              className="gfp-modal-primary inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold"
            >
              {busy ? (
                <LoaderCircle size={16} className="animate-spin" />
              ) : (
                <Check size={16} />
              )}

              {busy ? "Rescheduling..." : "Reschedule Follow-up"}
            </button>
          </footer>
        </form>
      </section>
    </div>,
    document.body
  );
};

export default RescheduleFollowupModal;