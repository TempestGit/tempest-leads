
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

import {
  AlertCircle,
  CalendarClock,
  CheckCircle2,
  Clock3,
  FileText,
  HeartHandshake,
  LoaderCircle,
  MessageSquareText,
  ShieldCheck,
  UserRound,
  X,
} from "lucide-react";

import {
  useNurtureQuery,
  useScheduleReconnectMutation,
} from "./nurture.queries.js";

import "./nurture-glass.css";

const pad2 = (value) => String(value).padStart(2, "0");

const getLocalDate = (value = new Date()) =>
  `${value.getFullYear()}-${pad2(value.getMonth() + 1)}-${pad2(
    value.getDate()
  )}`;

const getLocalTime = (value = new Date()) =>
  `${pad2(value.getHours())}:${pad2(value.getMinutes())}`;

const getLeadId = (record) => {
  if (!record) return null;

  const parsed = Number(record.leadId ?? record.id);

  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
};

const getErrorMessage = (requestError) => {
  const responseData = requestError?.response?.data;

  const errors = Array.isArray(responseData?.errors)
    ? responseData.errors
    : [];

  const validationMessage = errors
    .map((item) =>
      typeof item === "string"
        ? item
        : item?.message || item?.msg || null
    )
    .filter(Boolean)
    .join(" ");

  return (
    validationMessage ||
    responseData?.message ||
    requestError?.message ||
    "Unable to schedule reconnect."
  );
};

const ScheduleReconnectModal = ({
  open,
  nurture = null,
  onClose,
}) => {
  const mutation = useScheduleReconnectMutation();
  const submittingRef = useRef(false);

  const [selectedLeadId, setSelectedLeadId] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [action, setAction] = useState("Reconnect");
  const [priority, setPriority] = useState("Medium");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [now, setNow] = useState(() => new Date());

  const isBusy = isSubmitting || mutation.isPending;

  const nurtureParams = useMemo(
    () => ({ page: 1, limit: 100 }),
    []
  );

  const nurtureQuery = useNurtureQuery(nurtureParams);

  const nurtureRecords = useMemo(() => {
    const data = nurtureQuery.data?.data;
    const records = data?.nurture || data?.items || data?.records;

    return Array.isArray(records) ? records : [];
  }, [nurtureQuery.data]);

  useEffect(() => {
    if (!open) return;

    const suggested = new Date();
    suggested.setDate(suggested.getDate() + 30);
    suggested.setHours(10, 0, 0, 0);

    const initialLeadId = getLeadId(nurture);

    setSelectedLeadId(initialLeadId ? String(initialLeadId) : "");
    setDate(getLocalDate(suggested));
    setTime(getLocalTime(suggested));
    setAction("Reconnect");
    setPriority("Medium");
    setNotes("");
    setError("");
    setNow(new Date());
  }, [open, nurture]);

  useEffect(() => {
    if (!open) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const interval = window.setInterval(() => {
      setNow(new Date());
    }, 30000);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.clearInterval(interval);
    };
  }, [open]);

  const today = getLocalDate(now);
  const currentTime = getLocalTime(now);

  const resolvedNurture = nurture ||
    nurtureRecords.find(
      (item) => getLeadId(item) === Number(selectedLeadId)
    ) ||
    null;

  const resolvedLeadId =
    getLeadId(resolvedNurture) ||
    (Number.isInteger(Number(selectedLeadId)) &&
    Number(selectedLeadId) > 0
      ? Number(selectedLeadId)
      : null);

  const handleClose = () => {
    if (submittingRef.current || isBusy) return;
    onClose?.();
  };

  const handleDateChange = (event) => {
    const selectedDate = event.target.value;
    const current = new Date();
    const currentDate = getLocalDate(current);
    const currentClock = getLocalTime(current);

    if (selectedDate && selectedDate < currentDate) {
      setDate("");
      setTime("");
      setError("Reconnect date cannot be in the past.");
      return;
    }

    setDate(selectedDate);

    if (!selectedDate) {
      setTime("");
    } else if (
      selectedDate === currentDate &&
      time &&
      time < currentClock
    ) {
      setTime("");
    }

    setNow(current);
    setError("");
  };

  const handleTimeChange = (event) => {
    const selectedTime = event.target.value;
    const current = new Date();

    if (
      date === getLocalDate(current) &&
      selectedTime &&
      selectedTime < getLocalTime(current)
    ) {
      setTime("");
      setError("Reconnect time cannot be in the past.");
      return;
    }

    setTime(selectedTime);
    setNow(current);
    setError("");
  };

  const submit = async () => {
    if (submittingRef.current) return;

    setError("");

    if (!resolvedLeadId) {
      setError("Select a nurture lead.");
      return;
    }

    if (!date) {
      setError("Reconnect date is required.");
      return;
    }

    if (!time) {
      setError("Reconnect time is required.");
      return;
    }

    const cleanAction = action.trim();
    const cleanNotes = notes.trim();

    if (cleanAction.length < 2) {
      setError("Reconnect action must contain at least 2 characters.");
      return;
    }

    if (cleanAction.length > 500) {
      setError("Reconnect action cannot exceed 500 characters.");
      return;
    }

    if (!["High", "Medium", "Low"].includes(priority)) {
      setError("Select a valid priority.");
      return;
    }

    if (cleanNotes.length > 5000) {
      setError("Notes cannot exceed 5000 characters.");
      return;
    }

    const dueAt = new Date(`${date}T${time}:00`);

    if (
      Number.isNaN(dueAt.getTime()) ||
      getLocalDate(dueAt) !== date ||
      getLocalTime(dueAt) !== time
    ) {
      setError("Enter a valid reconnect date and time.");
      return;
    }

    if (dueAt.getTime() < Date.now() - 60 * 1000) {
      setError("Reconnect date and time cannot be in the past.");
      return;
    }

    submittingRef.current = true;
    setIsSubmitting(true);

    try {
      await mutation.mutateAsync({
        leadId: resolvedLeadId,
        data: {
          action: cleanAction,
          dueAt: dueAt.toISOString(),
          priority,
          notes: cleanNotes || null,
        },
      });

      onClose?.();
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      submittingRef.current = false;
      setIsSubmitting(false);
    }
  };

  if (!open) return null;

  return createPortal(
    <div className="gnm-overlay">
      <section
        className="gnm-modal flex flex-col"
        role="dialog"
        aria-modal="true"
        aria-labelledby="gnm-title"
      >
        <header className="gnm-header flex shrink-0 items-center justify-between gap-4 px-6 py-5">
          <div className="flex min-w-0 items-center gap-4">
            <span className="gnm-brand flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl">
              <CalendarClock size={23} />
            </span>

            <div className="min-w-0">
              <p className="gnm-eyebrow mb-1 text-[11px] font-bold uppercase tracking-wider">
                RELATIONSHIP RE-ENGAGEMENT
              </p>

              <h2
                id="gnm-title"
                className="gnm-heading text-xl font-extrabold"
              >
                Schedule Reconnect
              </h2>

              <p className="gnm-muted mt-1 text-xs leading-5">
                Plan when this prospect should return to your attention.
              </p>
            </div>
          </div>

          <button
            type="button"
            className="gnm-close flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
            onClick={handleClose}
            disabled={isBusy}
            aria-label="Close"
          >
            <X size={19} />
          </button>
        </header>

        <div className="gnm-body min-h-0 flex-1 space-y-5 overflow-y-auto px-6 py-5">
          {error && (
            <div
              role="alert"
              className="gnm-error flex items-start gap-3 rounded-xl p-4 text-sm"
            >
              <AlertCircle size={18} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="gnm-section rounded-2xl p-5">
            <div className="gnm-section-heading mb-5 flex items-center gap-3">
              <span className="gnm-section-icon flex h-10 w-10 items-center justify-center rounded-xl">
                <UserRound size={19} />
              </span>

              <div>
                <h3 className="gnm-heading text-sm font-extrabold">
                  Nurture Lead
                </h3>

                <p className="gnm-muted mt-1 text-xs">
                  Select the prospect to reconnect with
                </p>
              </div>
            </div>

            {!nurture ? (
              <>
                <label
                  htmlFor="gnm-lead"
                  className="gnm-label mb-2 block text-xs font-bold"
                >
                  Nurture Lead <span className="gnm-required">*</span>
                </label>

                <select
                  id="gnm-lead"
                  className="gnm-input w-full rounded-xl text-sm"
                  value={selectedLeadId}
                  disabled={nurtureQuery.isLoading || isBusy}
                  onChange={(event) => {
                    setSelectedLeadId(event.target.value);
                    setError("");
                  }}
                >
                  <option value="">
                    {nurtureQuery.isLoading
                      ? "Loading nurture leads..."
                      : "Select nurture lead"}
                  </option>

                  {nurtureRecords.map((item) => {
                    const itemLeadId = getLeadId(item);
                    if (!itemLeadId) return null;

                    return (
                      <option key={itemLeadId} value={itemLeadId}>
                        {item.companyName ||
                          item.leadName ||
                          item.name ||
                          `Lead #${itemLeadId}`}
                        {item.leadCode ? ` · ${item.leadCode}` : ""}
                      </option>
                    );
                  })}
                </select>

                {nurtureQuery.isError && (
                  <div className="mt-3 flex items-center justify-between gap-3">
                    <p className="gnm-error-text text-xs">
                      {nurtureQuery.error?.response?.data?.message ||
                        "Unable to load nurture leads."}
                    </p>

                    <button
                      type="button"
                      className="gnm-retry text-xs font-bold"
                      onClick={() => nurtureQuery.refetch()}
                    >
                      Retry
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="gnm-lead-summary flex items-center gap-3 rounded-xl p-4">
                <HeartHandshake size={21} className="shrink-0" />

                <div className="min-w-0">
                  <p className="gnm-muted text-xs">Selected Prospect</p>

                  <p className="gnm-heading mt-1 break-words text-sm font-extrabold">
                    {nurture.companyName ||
                      nurture.leadName ||
                      nurture.name ||
                      `Lead #${resolvedLeadId}`}
                    {nurture.leadCode
                      ? ` · ${nurture.leadCode}`
                      : ""}
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="gnm-section rounded-2xl p-5">
            <div className="gnm-section-heading mb-5 flex items-center gap-3">
              <span className="gnm-section-icon flex h-10 w-10 items-center justify-center rounded-xl">
                <CalendarClock size={19} />
              </span>

              <div>
                <h3 className="gnm-heading text-sm font-extrabold">
                  Reconnect Schedule
                </h3>

                <p className="gnm-muted mt-1 text-xs">
                  Choose a present or future date and time
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="gnm-date"
                  className="gnm-label mb-2 block text-xs font-bold"
                >
                  Reconnect Date <span className="gnm-required">*</span>
                </label>

                <div className="gnm-field-icon-wrap relative">
                  <CalendarClock
                    size={17}
                    className="gnm-field-icon"
                  />

                  <input
                    id="gnm-date"
                    type="date"
                    className="gnm-input gnm-input-with-icon w-full rounded-xl text-sm"
                    min={today}
                    value={date}
                    disabled={isBusy}
                    onChange={handleDateChange}
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="gnm-time"
                  className="gnm-label mb-2 block text-xs font-bold"
                >
                  Reconnect Time <span className="gnm-required">*</span>
                </label>

                <div className="gnm-field-icon-wrap relative">
                  <Clock3 size={17} className="gnm-field-icon" />

                  <input
                    id="gnm-time"
                    type="time"
                    className="gnm-input gnm-input-with-icon w-full rounded-xl text-sm"
                    min={date === today ? currentTime : undefined}
                    value={time}
                    disabled={isBusy || !date}
                    onChange={handleTimeChange}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="gnm-section rounded-2xl p-5">
            <div className="gnm-section-heading mb-5 flex items-center gap-3">
              <span className="gnm-section-icon flex h-10 w-10 items-center justify-center rounded-xl">
                <MessageSquareText size={19} />
              </span>

              <div>
                <h3 className="gnm-heading text-sm font-extrabold">
                  Reconnect Details
                </h3>

                <p className="gnm-muted mt-1 text-xs">
                  Describe the next engagement
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label
                  htmlFor="gnm-action"
                  className="gnm-label mb-2 block text-xs font-bold"
                >
                  Reconnect Action <span className="gnm-required">*</span>
                </label>

                <input
                  id="gnm-action"
                  type="text"
                  maxLength={500}
                  className="gnm-input w-full rounded-xl text-sm"
                  value={action}
                  disabled={isBusy}
                  placeholder="Reconnect"
                  onChange={(event) => {
                    setAction(event.target.value);
                    setError("");
                  }}
                />
              </div>

              <div>
                <label
                  htmlFor="gnm-priority"
                  className="gnm-label mb-2 block text-xs font-bold"
                >
                  Priority <span className="gnm-required">*</span>
                </label>

                <select
                  id="gnm-priority"
                  className="gnm-input w-full rounded-xl text-sm"
                  value={priority}
                  disabled={isBusy}
                  onChange={(event) => {
                    setPriority(event.target.value);
                    setError("");
                  }}
                >
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="gnm-notes"
                  className="gnm-label mb-2 block text-xs font-bold"
                >
                  <span className="inline-flex items-center gap-2">
                    <FileText size={15} />
                    Notes
                  </span>
                  <span className="gnm-muted ml-2 font-normal">
                    Optional
                  </span>
                </label>

                <textarea
                  id="gnm-notes"
                  rows={4}
                  maxLength={5000}
                  className="gnm-input gnm-textarea w-full resize-y rounded-xl text-sm"
                  value={notes}
                  disabled={isBusy}
                  placeholder="Optional reconnect context"
                  onChange={(event) => {
                    setNotes(event.target.value);
                    setError("");
                  }}
                />
              </div>
            </div>
          </div>

          <div className="gnm-info flex items-start gap-3 rounded-xl p-4">
            <ShieldCheck size={19} className="mt-0.5 shrink-0" />

            <p className="text-xs leading-5">
              Reconnect scheduling is saved to the selected lead.
              Past dates and times are not permitted.
            </p>
          </div>
        </div>

        <footer className="gnm-footer flex shrink-0 items-center justify-end gap-3 px-6 py-4">
          <button
            type="button"
            className="gnm-secondary inline-flex h-11 items-center justify-center rounded-xl px-5 text-sm font-bold"
            disabled={isBusy}
            onClick={handleClose}
          >
            Cancel
          </button>

          <button
            type="button"
            className="gnm-primary inline-flex h-11 items-center justify-center gap-2 rounded-xl px-5 text-sm font-bold"
            disabled={isBusy}
            onClick={submit}
          >
            {isBusy ? (
              <LoaderCircle size={17} className="animate-spin" />
            ) : (
              <CheckCircle2 size={17} />
            )}

            {isBusy ? "Scheduling..." : "Schedule Reconnect"}
          </button>
        </footer>
      </section>
    </div>,
    document.body
  );
};

export default ScheduleReconnectModal;