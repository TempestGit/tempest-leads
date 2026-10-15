
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import {
  CalendarDays,
  Check,
  Clock3,
  FileText,
  LoaderCircle,
  MonitorPlay,
  Users,
  Video,
  X,
} from "lucide-react";

import { useLeadsQuery } from "../leads/leads.queries.js";
import { useCreateMeetingMutation } from "./meetings.queries.js";

const pad2 = (value) => String(value).padStart(2, "0");

const getLocalDate = (value = new Date()) =>
  `${value.getFullYear()}-${pad2(value.getMonth() + 1)}-${pad2(
    value.getDate()
  )}`;

const getLocalTime = (value = new Date()) =>
  `${pad2(value.getHours())}:${pad2(value.getMinutes())}`;

const ScheduleMeetingModal = ({ open, lead = null, onClose }) => {
  const mutation = useCreateMeetingMutation();

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
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [meetingType, setMeetingType] = useState("VIDEO_CALL");
  const [agenda, setAgenda] = useState("");
  const [error, setError] = useState("");

  const busy = mutation.isPending;

  useEffect(() => {
    if (!open) return;

    const defaultStart = new Date(Date.now() + 5 * 60 * 1000);

    setSelectedLeadId(lead?.id ? String(lead.id) : "");
    setTitle("");
    setDate(getLocalDate(defaultStart));
    setTime(getLocalTime(defaultStart));
    setMeetingType("VIDEO_CALL");
    setAgenda("");
    setError("");
  }, [open, lead?.id]);

  useEffect(() => {
    if (!open) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  const resolvedLead =
    lead ||
    leads.find((item) => Number(item.id) === Number(selectedLeadId)) ||
    null;

  const handleDateChange = (event) => {
    const selectedDate = event.target.value;
    const today = getLocalDate();

    if (selectedDate && selectedDate < today) {
      setError("Meeting date cannot be in the past.");
      return;
    }

    setDate(selectedDate);

    if (selectedDate === today && (!time || time <= getLocalTime())) {
      const nextTime = new Date(Date.now() + 5 * 60 * 1000);
      setTime(
        getLocalDate(nextTime) === today
          ? getLocalTime(nextTime)
          : ""
      );
    }

    setError("");
  };

  const handleTimeChange = (event) => {
    const selectedTime = event.target.value;

    if (date === getLocalDate() && selectedTime < getLocalTime()) {
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

    if (!resolvedLead) {
      setError("Related lead is required.");
      return;
    }

    if (!title.trim()) {
      setError("Meeting title is required.");
      return;
    }

    if (!date || !time) {
      setError("Meeting date and time are required.");
      return;
    }

    const startsAt = new Date(`${date}T${time}:00`);

    if (Number.isNaN(startsAt.getTime())) {
      setError("Enter a valid meeting date and time.");
      return;
    }

    if (startsAt.getTime() <= Date.now()) {
      setError("Meeting date and time must be in the future.");
      return;
    }

    const endsAt = new Date(startsAt.getTime() + 60 * 60 * 1000);

    try {
      await mutation.mutateAsync({
        leadId: Number(resolvedLead.id),
        contactId: resolvedLead.primaryContactId
          ? Number(resolvedLead.primaryContactId)
          : null,
        title: title.trim(),
        startsAt: startsAt.toISOString(),
        endsAt: endsAt.toISOString(),
        meetingType,
        participants: [],
        location: null,
        meetingUrl: null,
        agenda: agenda.trim() || null,
      });

      onClose();
    } catch (requestError) {
      setError(
        requestError?.response?.data?.message ||
          requestError?.message ||
          "Unable to schedule meeting."
      );
    }
  };

  if (!open) return null;

  return createPortal(
    <div className="gmp-popup-overlay">
      <section
        className="gmp-popup flex w-full max-w-[720px] flex-col overflow-hidden rounded-[24px]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="schedule-meeting-title"
      >
        <header className="gmp-popup-header flex items-start justify-between gap-4 px-6 py-5">
          <div className="flex items-start gap-3">
            <span className="gmp-popup-brand flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl">
              <CalendarDays size={23} />
            </span>

            <div>
              <p className="gmp-eyebrow mb-1 text-[10px] font-bold uppercase tracking-[0.15em]">
                Meeting Management
              </p>
              <h2
                id="schedule-meeting-title"
                className="gmp-heading text-xl font-extrabold"
              >
                Schedule Meeting
              </h2>
              <p className="gmp-muted mt-1 text-xs">
                Plan your next client conversation.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            aria-label="Close schedule meeting form"
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

            <div className="mb-5 flex items-center gap-3">
              <span className="gmp-section-icon flex h-10 w-10 items-center justify-center rounded-xl">
                <CalendarDays size={18} />
              </span>
              <div>
                <h3 className="gmp-heading text-sm font-bold">
                  Meeting Details
                </h3>
                <p className="gmp-muted mt-1 text-xs">
                  Fields marked * are required
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div className="sm:col-span-2">
                {lead ? (
                  <div className="gmp-context rounded-xl p-4">
                    <span className="gmp-muted text-xs font-semibold">
                      Related Lead
                    </span>
                    <p className="gmp-heading mt-1 text-sm font-bold">
                      {lead.companyName || "Lead"} · {lead.leadCode || lead.id}
                    </p>
                  </div>
                ) : (
                  <label className="flex flex-col gap-2">
                    <span className="gmp-label flex items-center gap-2 text-xs font-bold">
                      <Users size={15} />
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
                        <option key={item.id} value={item.id}>
                          {item.companyName} · {item.leadCode}
                        </option>
                      ))}
                    </select>
                  </label>
                )}
              </div>

              <label className="flex flex-col gap-2 sm:col-span-2">
                <span className="gmp-label flex items-center gap-2 text-xs font-bold">
                  <FileText size={15} />
                  Meeting Title *
                </span>
                <input
                  type="text"
                  value={title}
                  disabled={busy}
                  autoFocus
                  onChange={(event) => {
                    setTitle(event.target.value);
                    setError("");
                  }}
                  placeholder="e.g. Initial discovery meeting"
                  className="gmp-input h-11 w-full rounded-xl px-3 text-sm"
                />
              </label>

              <label className="flex flex-col gap-2">
                <span className="gmp-label flex items-center gap-2 text-xs font-bold">
                  <CalendarDays size={15} />
                  Meeting Date *
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
                  Meeting Time *
                </span>
                <input
                  type="time"
                  min={date === getLocalDate() ? getLocalTime() : undefined}
                  value={time}
                  disabled={busy}
                  onChange={handleTimeChange}
                  className="gmp-input h-11 w-full rounded-xl px-3 text-sm"
                />
              </label>

              <label className="flex flex-col gap-2 sm:col-span-2">
                <span className="gmp-label flex items-center gap-2 text-xs font-bold">
                  <Video size={15} />
                  Meeting Type
                </span>
                <select
                  value={meetingType}
                  disabled={busy}
                  onChange={(event) => {
                    setMeetingType(event.target.value);
                    setError("");
                  }}
                  className="gmp-input h-11 w-full rounded-xl px-3 text-sm"
                >
                  <option value="VIDEO_CALL">Video Call</option>
                  <option value="IN_PERSON">In Person</option>
                  <option value="PHONE_CALL">Phone Call</option>
                </select>
              </label>

              <label className="flex flex-col gap-2 sm:col-span-2">
                <span className="gmp-label flex items-center gap-2 text-xs font-bold">
                  <FileText size={15} />
                  Agenda
                </span>
                <textarea
                  rows={4}
                  value={agenda}
                  disabled={busy}
                  onChange={(event) => {
                    setAgenda(event.target.value);
                    setError("");
                  }}
                  placeholder="What will you discuss?"
                  className="gmp-input w-full resize-y rounded-xl p-3 text-sm"
                />
              </label>
            </div>

            <div className="gmp-note mt-5 flex items-start gap-3 rounded-xl p-4">
              <MonitorPlay size={18} className="mt-0.5 shrink-0" />
              <p className="text-xs leading-5">
                Meetings are scheduled for one hour by default. The
                lead's primary contact is linked automatically when available.
              </p>
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
                  Scheduling...
                </>
              ) : (
                <>
                  <Check size={17} />
                  Schedule Meeting
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

export default ScheduleMeetingModal;