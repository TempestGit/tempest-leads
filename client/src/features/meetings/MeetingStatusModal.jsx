
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  AlertTriangle,
  CalendarX2,
  FileText,
  LoaderCircle,
  UserX,
  X,
} from "lucide-react";

import {
  useCancelMeetingMutation,
  useNoShowMeetingMutation,
} from "./meetings.queries.js";

const MeetingStatusModal = ({ open, meeting, action, onClose }) => {
  const cancelMutation = useCancelMeetingMutation();
  const noShowMutation = useNoShowMeetingMutation();

  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  const isNoShow = action === "NO_SHOW";
  const mutation = isNoShow ? noShowMutation : cancelMutation;
  const busy = mutation.isPending;

  useEffect(() => {
    if (!open) return;
    setReason("");
    setError("");
  }, [open, action, meeting?.id]);

  useEffect(() => {
    if (!open) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  const submit = async (event) => {
    event.preventDefault();
    if (busy) return;

    setError("");

    if (!meeting?.id) {
      setError("Meeting ID is missing. Refresh and try again.");
      return;
    }

    if (!reason.trim()) {
      setError(
        isNoShow
          ? "No-show note is required."
          : "Cancellation reason is required."
      );
      return;
    }

    try {
      await mutation.mutateAsync({
        meetingId: meeting.id,
        data: {
          reason: reason.trim(),
        },
      });

      onClose();
    } catch (requestError) {
      setError(
        requestError?.response?.data?.message ||
          requestError?.message ||
          "Unable to update meeting."
      );
    }
  };

  if (!open || !meeting) return null;

  const title = isNoShow ? "Mark as No-show" : "Cancel Meeting";
  const submitLabel = isNoShow ? "Mark No-show" : "Cancel Meeting";
  const HeaderIcon = isNoShow ? UserX : CalendarX2;

  return createPortal(
    <div className="gmp-popup-overlay">
      <section
        className="gmp-popup flex w-full max-w-[600px] flex-col overflow-hidden rounded-[24px]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="meeting-status-title"
      >
        <header className="gmp-popup-header flex items-start justify-between gap-4 px-6 py-5">
          <div className="flex min-w-0 items-start gap-3">
            <span
              className={`gmp-status-brand flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${
                isNoShow ? "gmp-status-warning" : "gmp-status-danger"
              }`}
            >
              <HeaderIcon size={23} />
            </span>

            <div>
              <p className="gmp-eyebrow mb-1 text-[10px] font-bold uppercase tracking-[0.15em]">
                Meeting Management
              </p>
              <h2
                id="meeting-status-title"
                className="gmp-heading text-xl font-extrabold tracking-tight"
              >
                {title}
              </h2>
              <p className="gmp-muted mt-1 text-xs leading-5">
                {isNoShow
                  ? "Record that the meeting did not take place."
                  : "Provide a reason for cancelling this meeting."}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            aria-label="Close meeting status form"
            className="gmp-close flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
          >
            <X size={18} />
          </button>
        </header>

        <form
          onSubmit={submit}
          className="gmp-popup-form flex min-h-0 flex-1 flex-col"
        >
          <div className="gmp-popup-body min-h-0 flex-1 overflow-y-auto px-6 py-6">
            {error && (
              <div className="gmp-error mb-5 rounded-xl p-3 text-sm" role="alert">
                {error}
              </div>
            )}

            <div className="gmp-context mb-5 rounded-xl p-4">
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

            <label className="flex flex-col gap-2">
              <span className="gmp-label flex items-center gap-2 text-xs font-bold">
                <FileText size={15} />
                {isNoShow ? "No-show Note *" : "Cancellation Reason *"}
              </span>

              <textarea
                rows={5}
                value={reason}
                disabled={busy}
                autoFocus
                onChange={(event) => {
                  setReason(event.target.value);
                  setError("");
                }}
                placeholder={
                  isNoShow
                    ? "Explain why this meeting was marked as no-show..."
                    : "Explain why this meeting is being cancelled..."
                }
                className="gmp-input w-full resize-y rounded-xl p-3 text-sm"
              />
            </label>

            <div
              className={`gmp-status-note mt-5 flex items-start gap-3 rounded-xl p-4 ${
                isNoShow ? "gmp-status-note-warning" : "gmp-status-note-danger"
              }`}
            >
              <AlertTriangle size={18} className="mt-0.5 shrink-0" />
              <p className="text-xs leading-5">
                {isNoShow
                  ? "This action will record the meeting as a no-show."
                  : "This action will change the meeting status to cancelled."}
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
              Back
            </button>

            <button
              type="submit"
              disabled={busy}
              className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-5 text-sm font-bold ${
                isNoShow ? "gmp-warning-button" : "gmp-danger-button"
              }`}
            >
              {busy ? (
                <>
                  <LoaderCircle size={16} className="animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <HeaderIcon size={17} />
                  {submitLabel}
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

export default MeetingStatusModal;