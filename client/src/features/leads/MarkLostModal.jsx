
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

import {
  AlertCircle,
  ArchiveX,
  CheckCircle2,
  FileText,
  HeartHandshake,
  Info,
  LoaderCircle,
  MessageSquareText,
  ShieldCheck,
  UserRoundX,
  X,
} from "lucide-react";

import { useMarkLeadLostMutation } from "./leads.queries.js";

import "./mark-lost-glass.css";

/*
|--------------------------------------------------------------------------
| Lost Reasons
|--------------------------------------------------------------------------
*/

const LOST_REASONS = [
  "Budget",
  "Timing",
  "No requirement",
  "Creative / pitch",
  "Competitor",
  "Existing agency",
  "Internal decision",
  "No response",
  "Other",
];

/*
|--------------------------------------------------------------------------
| Mark Lost Modal
|--------------------------------------------------------------------------
*/

const MarkLostModal = ({
  open,
  lead,
  onClose,
}) => {
  const mutation = useMarkLeadLostMutation();

  /*
  |--------------------------------------------------------------------------
  | Form State
  |--------------------------------------------------------------------------
  */

  const [reason, setReason] = useState("Budget");
  const [comment, setComment] = useState("");
  const [moveToNurture, setMoveToNurture] = useState(true);
  const [error, setError] = useState("");

  const isSaving = mutation.isPending;

  /*
  |--------------------------------------------------------------------------
  | Reset Form
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (!open) return;

    setReason("Budget");
    setComment("");
    setMoveToNurture(true);
    setError("");
  }, [open, lead]);

  /*
  |--------------------------------------------------------------------------
  | Lock Background Scroll
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (!open || !lead) return undefined;

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open, lead]);

  /*
  |--------------------------------------------------------------------------
  | Close
  |--------------------------------------------------------------------------
  */

  const handleClose = () => {
    if (isSaving) return;

    onClose?.();
  };

  /*
  |--------------------------------------------------------------------------
  | Submit
  |--------------------------------------------------------------------------
  */

  const submit = async () => {
    if (isSaving) return;

    setError("");

    if (!lead?.id) {
      setError("Select a lead before closing it.");
      return;
    }

    if (!LOST_REASONS.includes(reason)) {
      setError("Select a valid lost reason.");
      return;
    }

    if (!comment.trim()) {
      setError("Close comment is required.");
      return;
    }

    try {
      await mutation.mutateAsync({
        leadId: Number(lead.id),
        data: {
          reason,
          comment: comment.trim(),
          moveToNurture,
        },
      });

      onClose?.();
    } catch (requestError) {
      setError(
        requestError?.response?.data?.message ||
          requestError?.message ||
          "Unable to close lead."
      );
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Closed
  |--------------------------------------------------------------------------
  */

  if (!open || !lead) return null;

  /*
  |--------------------------------------------------------------------------
  | Render
  |--------------------------------------------------------------------------
  */

  return createPortal(
    <div className="gml-overlay">
      <section
        className="gml-modal flex flex-col"
        role="dialog"
        aria-modal="true"
        aria-labelledby="gml-modal-title"
      >
        {/* ========================================================= */}
        {/* HEADER */}
        {/* ========================================================= */}

        <header className="gml-header flex shrink-0 items-center justify-between gap-4 px-6 py-5">
          <div className="flex min-w-0 items-center gap-4">
            <span className="gml-brand flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl">
              <ArchiveX size={23} />
            </span>

            <div className="min-w-0">
              <p className="gml-eyebrow mb-1 text-[11px] font-bold uppercase tracking-[0.14em]">
                LEAD PIPELINE MANAGEMENT
              </p>

              <h2
                id="gml-modal-title"
                className="gml-title text-xl font-extrabold"
              >
                Mark as Lost
              </h2>

              <p className="gml-muted mt-1 text-xs leading-5">
                Close this opportunity while preserving its
                history and future reconnect options.
              </p>
            </div>
          </div>

          <button
            type="button"
            className="gml-close flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
            onClick={handleClose}
            disabled={isSaving}
            aria-label="Close"
          >
            <X size={19} />
          </button>
        </header>

        {/* ========================================================= */}
        {/* BODY */}
        {/* ========================================================= */}

        <div className="gml-body min-h-0 flex-1 space-y-5 overflow-y-auto px-6 py-5">
          {/* Lead Summary */}

          <div className="gml-summary flex items-start gap-4 rounded-2xl p-4">
            <span className="gml-summary-icon flex h-12 w-12 shrink-0 items-center justify-center rounded-xl">
              <UserRoundX size={22} />
            </span>

            <div className="min-w-0">
              <p className="gml-summary-eyebrow text-[11px] font-bold uppercase tracking-[0.12em]">
                CLOSING OPPORTUNITY
              </p>

              <h3 className="gml-title mt-1 break-words text-sm font-extrabold">
                {lead.companyName ||
                  lead.name ||
                  lead.leadCode ||
                  `Lead #${lead.id}`}
              </h3>

              <p className="gml-muted mt-1 text-xs leading-5">
                {lead.leadCode
                  ? `${lead.leadCode} · `
                  : ""}
                {lead.stage || "Current opportunity"}
              </p>
            </div>
          </div>

          {/* Error */}

          {error && (
            <div
              role="alert"
              className="gml-error flex items-start gap-3 rounded-xl p-4 text-sm"
            >
              <AlertCircle
                size={18}
                className="mt-0.5 shrink-0"
              />

              <span className="min-w-0 break-words">
                {error}
              </span>
            </div>
          )}

          {/* ======================================================= */}
          {/* CLOSE DETAILS */}
          {/* ======================================================= */}

          <div className="gml-section rounded-2xl p-5">
            <div className="gml-section-heading mb-5 flex items-center gap-3">
              <span className="gml-section-icon flex h-10 w-10 items-center justify-center rounded-xl">
                <FileText size={19} />
              </span>

              <div>
                <h3 className="gml-title text-sm font-extrabold">
                  Close Details
                </h3>

                <p className="gml-muted mt-1 text-xs">
                  Record why the opportunity was lost
                </p>
              </div>
            </div>

            <div className="space-y-5">
              {/* Lost Reason */}

              <div>
                <label
                  htmlFor="gml-reason"
                  className="gml-label mb-2 block text-xs font-bold"
                >
                  Lost Reason
                  <span className="gml-required ml-1">*</span>
                </label>

                <select
                  id="gml-reason"
                  className="gml-input w-full rounded-xl px-4 py-3 text-sm"
                  value={reason}
                  disabled={isSaving}
                  onChange={(event) => {
                    setReason(event.target.value);
                    setError("");
                  }}
                >
                  {LOST_REASONS.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              {/* Close Comment */}

              <div>
                <label
                  htmlFor="gml-comment"
                  className="gml-label mb-2 flex items-center gap-2 text-xs font-bold"
                >
                  <MessageSquareText size={15} />

                  Close Comment
                  <span className="gml-required">*</span>
                </label>

                <textarea
                  id="gml-comment"
                  rows={4}
                  className="gml-input gml-textarea w-full resize-y rounded-xl px-4 py-3 text-sm"
                  value={comment}
                  disabled={isSaving}
                  autoFocus
                  placeholder="Explain why the opportunity was lost or why the prospect is not interested..."
                  onChange={(event) => {
                    setComment(event.target.value);
                    setError("");
                  }}
                />

                <p className="gml-muted mt-2 text-xs leading-5">
                  This comment is mandatory and will be
                  retained in the lead's history.
                </p>
              </div>
            </div>
          </div>

          {/* ======================================================= */}
          {/* NURTURE OPTION */}
          {/* ======================================================= */}

          <div className="gml-section rounded-2xl p-5">
            <div className="gml-section-heading mb-5 flex items-center gap-3">
              <span className="gml-nurture-section-icon flex h-10 w-10 items-center justify-center rounded-xl">
                <HeartHandshake size={19} />
              </span>

              <div>
                <h3 className="gml-title text-sm font-extrabold">
                  Future Engagement
                </h3>

                <p className="gml-muted mt-1 text-xs">
                  Decide whether to keep this prospect in
                  your nurture pipeline
                </p>
              </div>
            </div>

            <div className="gml-nurture-card flex flex-col gap-4 rounded-xl p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 items-start gap-3">
                <span className="gml-nurture-icon flex h-11 w-11 shrink-0 items-center justify-center rounded-xl">
                  <HeartHandshake size={20} />
                </span>

                <div className="min-w-0">
                  <p className="gml-title text-sm font-extrabold">
                    Move to Nurture?
                  </p>

                  <p className="gml-muted mt-1 text-xs leading-5">
                    Keep this prospect available for
                    future follow-ups and reconnects.
                  </p>
                </div>
              </div>

              <div className="gml-nurture-options flex shrink-0 items-center gap-2">
                <button
                  type="button"
                  className={`gml-choice rounded-lg px-4 py-2 text-xs font-bold ${
                    moveToNurture ? "is-active" : ""
                  }`}
                  aria-pressed={moveToNurture}
                  disabled={isSaving}
                  onClick={() => setMoveToNurture(true)}
                >
                  Yes
                </button>

                <button
                  type="button"
                  className={`gml-choice rounded-lg px-4 py-2 text-xs font-bold ${
                    !moveToNurture ? "is-active" : ""
                  }`}
                  aria-pressed={!moveToNurture}
                  disabled={isSaving}
                  onClick={() => setMoveToNurture(false)}
                >
                  No
                </button>
              </div>
            </div>

            <div className="gml-nurture-notice mt-4 flex items-start gap-3 rounded-xl p-4">
              {moveToNurture ? (
                <HeartHandshake
                  size={18}
                  className="mt-0.5 shrink-0"
                />
              ) : (
                <Info
                  size={18}
                  className="mt-0.5 shrink-0"
                />
              )}

              <p className="text-xs leading-5">
                {moveToNurture
                  ? "This lead will be moved into the Nurture workflow for future engagement."
                  : "This lead will be closed without moving into the Nurture workflow."}
              </p>
            </div>
          </div>

          {/* Audit Notice */}

          <div className="gml-info flex items-start gap-3 rounded-2xl p-4">
            <span className="gml-info-icon flex h-10 w-10 shrink-0 items-center justify-center rounded-xl">
              <ShieldCheck size={19} />
            </span>

            <div>
              <p className="text-xs font-extrabold">
                History & Audit Trail
              </p>

              <p className="mt-1 text-xs leading-5">
                Closing this lead preserves its existing
                records. The lost reason and close comment
                will be submitted with the status change.
              </p>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* FOOTER */}
        {/* ========================================================= */}

        <footer className="gml-footer flex shrink-0 items-center justify-between gap-3 px-6 py-4">
          <span className="gml-footer-note hidden items-center gap-2 text-xs sm:inline-flex">
            <ShieldCheck size={15} />
            Audit tracked
          </span>

          <div className="ml-auto flex items-center gap-3">
            <button
              type="button"
              className="gml-secondary inline-flex h-11 items-center justify-center rounded-xl px-5 text-sm font-bold"
              onClick={handleClose}
              disabled={isSaving}
            >
              Cancel
            </button>

            <button
              type="button"
              className="gml-danger inline-flex h-11 items-center justify-center gap-2 rounded-xl px-5 text-sm font-bold"
              onClick={submit}
              disabled={isSaving}
            >
              {isSaving ? (
                <LoaderCircle
                  size={17}
                  className="animate-spin"
                />
              ) : (
                <ArchiveX size={17} />
              )}

              {isSaving ? "Closing..." : "Close Lead"}
            </button>
          </div>
        </footer>
      </section>
    </div>,
    document.body
  );
};

export default MarkLostModal;