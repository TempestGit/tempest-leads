
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";

import {
  CalendarClock,
  CalendarDays,
  Check,
  Clock3,
  FileText,
  Flag,
  ListTodo,
  LoaderCircle,
  X,
} from "lucide-react";

import { useLeadsQuery } from "../leads/leads.queries.js";
import { useCreateFollowupMutation } from "./followups.queries.js";

const pad2 = (value) => String(value).padStart(2, "0");

const getLocalDate = (value = new Date()) =>
  `${value.getFullYear()}-${pad2(value.getMonth() + 1)}-${pad2(
    value.getDate()
  )}`;

const getLocalTime = (value = new Date()) =>
  `${pad2(value.getHours())}:${pad2(value.getMinutes())}`;

const getApiError = (error, fallback) => {
  const response = error?.response?.data;
  const items = Array.isArray(response?.errors)
    ? response.errors
    : [];

  const validation = items
    .map((item) =>
      typeof item === "string"
        ? item
        : item?.message || item?.msg || ""
    )
    .filter(Boolean)
    .join(" ");

  return (
    validation ||
    response?.message ||
    error?.message ||
    fallback
  );
};

const ScheduleFollowupModal = ({
  open,
  lead = null,
  onClose,
}) => {
  const mutation = useCreateFollowupMutation();

  const params = useMemo(
    () => ({
      page: 1,
      limit: 100,
      sort: "createdAt",
      direction: "desc",
    }),
    []
  );

  const leadsQuery = useLeadsQuery(params);
  const leads = leadsQuery.data?.data?.leads || [];

  const [selectedLeadId, setSelectedLeadId] = useState("");
  const [action, setAction] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;

    const now = new Date();

    setSelectedLeadId(lead?.id ? String(lead.id) : "");
    setAction(lead?.nextAction || "");
    setDate(getLocalDate(now));
    setTime(getLocalTime(now));

    setPriority(
      ["High", "Medium", "Low"].includes(lead?.priority)
        ? lead.priority
        : "Medium"
    );

    setNotes("");
    setError("");
  }, [open, lead]);

  useEffect(() => {
    if (!open) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  if (!open) return null;

  const today = getLocalDate();
  const currentTime = getLocalTime();

  const resolvedLead =
    lead ||
    leads.find(
      (item) => Number(item.id) === Number(selectedLeadId)
    ) ||
    null;

  const busy = mutation.isPending;

  const handleDateChange = (event) => {
    const selectedDate = event.target.value;

    if (!selectedDate) {
      setDate("");
      setTime("");
      setError("");
      return;
    }

    const nowDate = getLocalDate();
    const nowTime = getLocalTime();

    if (selectedDate < nowDate) {
      setError("Follow-up date cannot be in the past.");
      return;
    }

    setDate(selectedDate);

    if (selectedDate === nowDate && time && time < nowTime) {
      setTime("");
    }

    setError("");
  };

  const handleTimeChange = (event) => {
    const selectedTime = event.target.value;

    if (!selectedTime) {
      setTime("");
      setError("");
      return;
    }

    if (
      date === getLocalDate() &&
      selectedTime < getLocalTime()
    ) {
      setError("Follow-up time cannot be in the past.");
      return;
    }

    setTime(selectedTime);
    setError("");
  };

  const submit = async (event) => {
    event.preventDefault();

    if (busy) return;

    setError("");

    if (!resolvedLead?.id) {
      setError("Related lead is required.");
      return;
    }

    const cleanAction = action.trim();

    if (cleanAction.length < 2) {
      setError(
        cleanAction
          ? "Action must be at least 2 characters."
          : "Action is required."
      );
      return;
    }

    if (cleanAction.length > 500) {
      setError("Action cannot exceed 500 characters.");
      return;
    }

    if (!date) {
      setError("Follow-up date is required.");
      return;
    }

    if (!time) {
      setError("Follow-up time is required.");
      return;
    }

    const dueDate = new Date(`${date}T${time}:00`);

    if (Number.isNaN(dueDate.getTime())) {
      setError("Enter a valid follow-up date and time.");
      return;
    }

    if (dueDate.getTime() < Date.now() - 60 * 1000) {
      setError("Follow-up date and time cannot be in the past.");
      return;
    }

    if (!["High", "Medium", "Low"].includes(priority)) {
      setError("Select a valid priority.");
      return;
    }

    const cleanNotes = notes.trim();

    if (cleanNotes.length > 5000) {
      setError("Notes cannot exceed 5000 characters.");
      return;
    }

    try {
      await mutation.mutateAsync({
        leadId: Number(resolvedLead.id),
        action: cleanAction,
        dueAt: dueDate.toISOString(),
        priority,
        notes: cleanNotes || null,
      });

      onClose();
    } catch (requestError) {
      setError(
        getApiError(
          requestError,
          "Unable to schedule follow-up."
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
        aria-labelledby="gfp-schedule-title"
      >
        <header className="gfp-modal-header">
          <div className="flex items-center gap-3">
            <span className="gfp-modal-brand flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl">
              <CalendarClock size={23} />
            </span>

            <div>
              <h2
                id="gfp-schedule-title"
                className="text-lg font-extrabold"
              >
                Schedule Follow-up
              </h2>

              <p className="mt-1 text-xs">
                Plan the next action for your lead.
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
              <div role="alert" className="gfp-modal-error rounded-xl px-4 py-3 text-sm">
                {error}
              </div>
            )}

            {!lead ? (
              <label className="gfp-field">
                <span>Related Lead *</span>

                <select
                  value={selectedLeadId}
                  disabled={busy || leadsQuery.isLoading}
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
                    <option key={item.id} value={item.id}>
                      {item.companyName} · {item.leadCode}
                    </option>
                  ))}
                </select>
              </label>
            ) : (
              <div className="gfp-context rounded-2xl p-4">
                <p className="text-[11px] font-semibold uppercase tracking-wide">
                  Related Lead
                </p>

                <p className="mt-2 text-sm font-bold">
                  {lead.companyName || "Company"}
                </p>

                <p className="mt-1 text-xs">
                  {lead.leadCode || ""}
                </p>
              </div>
            )}

            <label className="gfp-field">
              <span className="flex items-center gap-2">
                <ListTodo size={15} />
                Action *
              </span>

              <input
                type="text"
                value={action}
                maxLength={500}
                disabled={busy}
                autoFocus
                placeholder="e.g. Call customer to discuss proposal"
                onChange={(event) => {
                  setAction(event.target.value);
                  setError("");
                }}
              />
            </label>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="gfp-field">
                <span className="flex items-center gap-2">
                  <CalendarDays size={15} />
                  Date *
                </span>

                <input
                  type="date"
                  min={today}
                  value={date}
                  disabled={busy}
                  onChange={handleDateChange}
                />
              </label>

              <label className="gfp-field">
                <span className="flex items-center gap-2">
                  <Clock3 size={15} />
                  Time *
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
                <Flag size={15} />
                Priority *
              </span>

              <select
                value={priority}
                disabled={busy}
                onChange={(event) => {
                  setPriority(event.target.value);
                  setError("");
                }}
              >
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </label>

            <label className="gfp-field">
              <span className="flex items-center gap-2">
                <FileText size={15} />
                Notes
              </span>

              <textarea
                rows={4}
                maxLength={5000}
                value={notes}
                disabled={busy}
                placeholder="Optional notes"
                onChange={(event) => {
                  setNotes(event.target.value);
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
                <LoaderCircle
                  size={16}
                  className="animate-spin"
                />
              ) : (
                <Check size={16} />
              )}

              {busy ? "Scheduling..." : "Schedule Follow-up"}
            </button>
          </footer>
        </form>
      </section>
    </div>,
    document.body
  );
};

export default ScheduleFollowupModal;