
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

import { useRescheduleMeetingMutation } from "./meetings.queries.js";

const pad2 = (value) => String(value).padStart(2, "0");

const getLocalDate = (value = new Date()) =>
  `${value.getFullYear()}-${pad2(value.getMonth() + 1)}-${pad2(
    value.getDate()
  )}`;

const getLocalTime = (value = new Date()) =>
  `${pad2(value.getHours())}:${pad2(value.getMinutes())}`;

const toValidDate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const RescheduleMeetingModal = ({ open, meeting, onClose }) => {
  const mutation = useRescheduleMeetingMutation();

  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  const busy = mutation.isPending;

  useEffect(() => {
    if (!open) return;

    const existingStart = toValidDate(meeting?.startsAt);

    setDate(existingStart ? getLocalDate(existingStart) : "");
    setTime(existingStart ? getLocalTime(existingStart) : "");
    setReason("");
    setError("");
  }, [open, meeting?.id, meeting?.startsAt]);

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
      setDate("");
      setTime("");
      setError("");
      return;
    }

    const today = getLocalDate();

    if (selectedDate < today) {
      setError("Meeting date cannot be in the past.");
      return;
    }

    setDate(selectedDate);

    if (selectedDate === today && time && time < getLocalTime()) {
      setTime("");
    }

    setError("");
  };

  const handleTimeChange = (event) => {
    const selectedTime = event.target.value;

    if (
      selectedTime &&
      date === getLocalDate() &&
      selectedTime < getLocalTime()
    ) {
      setError("Meeting time cannot be in the past.");
      return;
    }

    setTime(selectedTime);
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

    if (!date) {
      setError("Select a new meeting date.");
      return;
    }

    if (!time) {
      setError("Select a new meeting time.");
      return;
    }

    const cleanReason = reason.trim();

    if (cleanReason.length < 2) {
      setError("Reschedule reason must be at least 2 characters.");
      return;
    }

    if (cleanReason.length > 1000) {
      setError("Reschedule reason cannot exceed 1000 characters.");
      return;
    }

    const newStart = new Date(`${date}T${time}:00`);

    if (Number.isNaN(newStart.getTime())) {
      setError("Enter a valid meeting date and time.");
      return;
    }

    if (newStart.getTime() <= Date.now()) {
      setError("Meeting date and time must be in the future.");
      return;
    }

    const existingStart = toValidDate(meeting.startsAt);
    const existingEnd = toValidDate(meeting.endsAt);

    let newEnd = null;

    if (
      existingStart &&
      existingEnd &&
      existingEnd.getTime() > existingStart.getTime()
    ) {
      const duration = existingEnd.getTime() - existingStart.getTime();
      newEnd = new Date(newStart.getTime() + duration);
    }

    try {
      await mutation.mutateAsync({
        meetingId: meeting.id,
        data: {
          startsAt: newStart.toISOString(),
          endsAt: newEnd ? newEnd.toISOString() : null,
          reason: cleanReason,
        },
      });

      onClose();
    } catch (requestError) {
      const responseData = requestError?.response?.data;
      const arrayErrors = Array.isArray(responseData?.errors)
        ? responseData.errors
        : [];

      const validationMessage = arrayErrors
        .map((item) =>
          typeof item === "string"
            ? item
            : item?.message || item?.msg || null
        )
        .filter(Boolean)
        .join(" ");

      setError(
        validationMessage ||
          responseData?.message ||
          requestError?.message ||
          "Unable to reschedule meeting."
      );
    }
  };

  if (!open || !meeting) return null;

  return createPortal(
    <div className="gmp-popup-overlay">
      <section
        className="gmp-popup flex w-full max-w-[650px] flex-col overflow-hidden rounded-[24px]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="reschedule-meeting-title"
      >
        <header className="gmp-popup-header flex items-start justify-between gap-4 px-6 py-5">
          <div className="flex items-start gap-3">
            <span className="gmp-popup-brand flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl">
              <CalendarClock size={23} />
            </span>
            <div>
              <p className="gmp-eyebrow mb-1 text-[10px] font-bold uppercase tracking-[0.15em]">
                Meeting Management
              </p>
              <h2
                id="reschedule-meeting-title"
                className="gmp-heading text-xl font-extrabold"
              >
                Reschedule Meeting
              </h2>
              <p className="gmp-muted mt-1 text-xs">
                Choose a new date and time for this meeting.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            aria-label="Close reschedule meeting form"
            className="gmp-close flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
          >
            <X size={18} />
          </button>
        </header>

        <form
          className="gmp-popup-form flex min-h-0 flex-1 flex-col"
          onSubmit={submit}
        >
          <div className="gmp-popup-body min-h-0 flex-1 overflow-y-auto px-6 py-6">
            {error && (
              <div className="gmp-error mb-5 rounded-xl p-3 text-sm" role="alert">
                {error}
              </div>
            )}

            <div className="gmp-context mb-6 rounded-xl p-4">
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

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <label className="flex flex-col gap-2">
                <span className="gmp-label flex items-center gap-2 text-xs font-bold">
                  <CalendarDays size={15} />
                  New Date *
                </span>
                <input
                  type="date"
                  min={getLocalDate()}
                  value={date}
                  disabled={busy}
                  onChange={handleDateChange}
                  className="gmp-input h-11 w-full rounded-xl px-3 text-sm"
                />
              </label>

              <label className="flex flex-col gap-2">
                <span className="gmp-label flex items-center gap-2 text-xs font-bold">
                  <Clock3 size={15} />
                  New Time *
                </span>
                <input
                  type="time"
                  min={date === getLocalDate() ? getLocalTime() : undefined}
                  value={time}
                  disabled={busy || !date}
                  onChange={handleTimeChange}
                  className="gmp-input h-11 w-full rounded-xl px-3 text-sm"
                />
              </label>

              <label className="flex flex-col gap-2 sm:col-span-2">
                <span className="gmp-label flex items-center gap-2 text-xs font-bold">
                  <FileText size={15} />
                  Reason *
                </span>
                <textarea
                  rows={4}
                  maxLength={1000}
                  value={reason}
                  disabled={busy}
                  onChange={(event) => {
                    setReason(event.target.value);
                    setError("");
                  }}
                  placeholder="Why is this meeting being rescheduled?"
                  className="gmp-input w-full resize-y rounded-xl p-3 text-sm"
                />
                <p className="gmp-muted text-right text-[11px]">
                  {reason.length}/1000
                </p>
              </label>
            </div>

            <div className="gmp-note mt-5 rounded-xl p-4 text-xs leading-5">
              The meeting's existing duration will be preserved when
              valid start and end times are available.
            </div>
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
              className="gmp-primary inline-flex min-h-11 items-center gap-2 rounded-xl px-5 text-sm font-bold"
            >
              {busy ? (
                <>
                  <LoaderCircle size={16} className="animate-spin" />
                  Rescheduling...
                </>
              ) : (
                <>
                  <Check size={17} />
                  Reschedule Meeting
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

export default RescheduleMeetingModal;