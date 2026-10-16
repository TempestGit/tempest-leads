
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  GitBranch,
  History,
  Info,
  LoaderCircle,
  MessageSquareText,
  ShieldCheck,
  Users,
  X,
} from "lucide-react";

import { useChangeLeadStageMutation } from "./leads.queries.js";

import "./change-stage-glass.css";

/*
|--------------------------------------------------------------------------
| Stages
|--------------------------------------------------------------------------
*/

const STAGES = [
  "New",
  "Contact Research",
  "Connected",
  "Meeting",
  "Brief",
  "Pitch",
  "Commercials",
  "Contract / PO",
  "Onboarding",
  "Active Client",
  "Nurture",
];

/*
|--------------------------------------------------------------------------
| Change Stage Modal
|--------------------------------------------------------------------------
*/

const ChangeStageModal = ({
  onPartialSuccess,
  open,
  leadIds = [],
  initialStage = "New",
  onClose,
}) => {
  const mutation = useChangeLeadStageMutation();

  const [stage, setStage] = useState("New");
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submittingRef = useRef(false);

  const isBusy = isSubmitting || mutation.isPending;

  const isBulk = leadIds.length > 1;

  const selectedStage = STAGES.includes(initialStage)
    ? initialStage
    : "New";

  /*
  |--------------------------------------------------------------------------
  | Reset Form
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (!open) return;

    setStage(selectedStage);
    setReason("");
    setError("");
  }, [open, selectedStage]);

  /*
  |--------------------------------------------------------------------------
  | Lock Background Scroll
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (!open) return undefined;

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  /*
  |--------------------------------------------------------------------------
  | Close
  |--------------------------------------------------------------------------
  */

  const handleClose = () => {
    if (submittingRef.current || isBusy) return;

    onClose?.();
  };

  /*
  |--------------------------------------------------------------------------
  | Submit
  |--------------------------------------------------------------------------
  */

  const submit = async () => {
    if (submittingRef.current) return;

    setError("");

    if (!leadIds.length) {
      setError("No lead selected.");
      return;
    }

    if (!STAGES.includes(stage)) {
      setError("Select a valid stage.");
      return;
    }

    if (!reason.trim()) {
      setError("Reason or comment is required.");
      return;
    }

    submittingRef.current = true;
    setIsSubmitting(true);

    const succeeded = [];
    const skipped = [];
    const failed = [];

    try {
      for (const leadId of leadIds) {
        try {
          await mutation.mutateAsync({
            leadId: Number(leadId),
            data: {
              stage,
              reason: reason.trim(),
            },
          });

          succeeded.push(leadId);
        } catch (requestError) {
          const status = requestError?.response?.status;

          const message =
            requestError?.response?.data?.message ||
            "Unable to change stage.";

          if (
            status === 409 &&
            /already in this stage/i.test(message)
          ) {
            skipped.push(leadId);
          } else {
            failed.push({
              leadId,
              message,
            });
          }
        }
      }

      if (succeeded.length && onPartialSuccess) {
        onPartialSuccess([...succeeded, ...skipped]);
      }

      if (!failed.length) {
        onClose?.();
        return;
      }

      setError(
        `${succeeded.length} lead(s) updated, ` +
          `${skipped.length} already in "${stage}", ` +
          `${failed.length} failed. ` +
          `First error: ${failed[0].message}`
      );
    } finally {
      submittingRef.current = false;
      setIsSubmitting(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Closed
  |--------------------------------------------------------------------------
  */

  if (!open) return null;

  /*
  |--------------------------------------------------------------------------
  | Render
  |--------------------------------------------------------------------------
  */

  return createPortal(
    <div className="gcsm-overlay">
      <section
        className="gcsm-modal flex flex-col"
        role="dialog"
        aria-modal="true"
        aria-labelledby="gcsm-modal-title"
      >
        {/* ========================================================= */}
        {/* HEADER */}
        {/* ========================================================= */}

        <header className="gcsm-header flex shrink-0 items-center justify-between gap-4 px-6 py-5">
          <div className="flex min-w-0 items-center gap-4">
            <span className="gcsm-brand flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl">
              <GitBranch size={23} />
            </span>

            <div className="min-w-0">
              <p className="gcsm-eyebrow mb-1 text-[11px] font-bold uppercase tracking-[0.14em]">
                LEAD PIPELINE MANAGEMENT
              </p>

              <h2
                id="gcsm-modal-title"
                className="gcsm-title text-xl font-extrabold"
              >
                Change Stage
              </h2>

              <p className="gcsm-muted mt-1 text-xs leading-5">
                {isBulk
                  ? `Update the pipeline stage for ${leadIds.length} selected leads.`
                  : "Move this lead to another pipeline stage."}
              </p>
            </div>
          </div>

          <button
            type="button"
            className="gcsm-close flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
            onClick={handleClose}
            disabled={isBusy}
            aria-label="Close"
          >
            <X size={19} />
          </button>
        </header>

        {/* ========================================================= */}
        {/* BODY */}
        {/* ========================================================= */}

        <div className="gcsm-body min-h-0 flex-1 space-y-5 overflow-y-auto px-6 py-5">
          {/* Summary */}

          <div className="gcsm-summary grid grid-cols-1 gap-3 rounded-2xl p-4 sm:grid-cols-2">
            <div className="gcsm-summary-card flex items-center gap-3 rounded-xl p-3">
              <span className="gcsm-summary-icon flex h-10 w-10 shrink-0 items-center justify-center rounded-xl">
                <Users size={19} />
              </span>

              <div>
                <p className="gcsm-muted text-[11px] font-semibold">
                  Selected Leads
                </p>

                <p className="gcsm-title mt-1 text-lg font-extrabold">
                  {leadIds.length}
                </p>
              </div>
            </div>

            <div className="gcsm-summary-card flex items-center gap-3 rounded-xl p-3">
              <span className="gcsm-summary-icon flex h-10 w-10 shrink-0 items-center justify-center rounded-xl">
                <GitBranch size={19} />
              </span>

              <div className="min-w-0">
                <p className="gcsm-muted text-[11px] font-semibold">
                  Current Stage
                </p>

                <p className="gcsm-title mt-1 truncate text-sm font-extrabold">
                  {isBulk ? "Multiple leads" : selectedStage}
                </p>
              </div>
            </div>
          </div>

          {/* Error */}

          {error && (
            <div
              role="alert"
              className="gcsm-error flex items-start gap-3 rounded-xl p-4 text-sm"
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
          {/* STAGE DETAILS */}
          {/* ======================================================= */}

          <div className="gcsm-section rounded-2xl p-5">
            <div className="gcsm-section-heading mb-5 flex items-center gap-3">
              <span className="gcsm-section-icon flex h-10 w-10 items-center justify-center rounded-xl">
                <GitBranch size={19} />
              </span>

              <div>
                <h3 className="gcsm-title text-sm font-extrabold">
                  Stage Details
                </h3>

                <p className="gcsm-muted mt-1 text-xs">
                  Select the destination stage and explain the change
                </p>
              </div>
            </div>

            <div className="space-y-5">
              {/* Stage */}

              <div>
                <label
                  htmlFor="gcsm-stage"
                  className="gcsm-label mb-2 block text-xs font-bold"
                >
                  New Stage
                  <span className="gcsm-required ml-1">*</span>
                </label>

                <select
                  id="gcsm-stage"
                  className="gcsm-input w-full rounded-xl px-4 py-3 text-sm"
                  value={stage}
                  disabled={isBusy}
                  onChange={(event) => {
                    setStage(event.target.value);
                    setError("");
                  }}
                >
                  {STAGES.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              {/* Stage Preview */}

              <div className="gcsm-transition flex flex-col items-center gap-3 rounded-xl p-4 sm:flex-row">
                <div className="gcsm-transition-stage min-w-0 flex-1 rounded-lg px-4 py-3">
                  <p className="gcsm-muted text-[10px] font-bold uppercase tracking-wider">
                    {isBulk ? "Selection" : "Current Stage"}
                  </p>

                  <p className="gcsm-title mt-1 truncate text-sm font-extrabold">
                    {isBulk ? "Multiple leads" : selectedStage}
                  </p>
                </div>

                <span className="gcsm-transition-arrow flex h-9 w-9 shrink-0 items-center justify-center rounded-full">
                  <ArrowRight size={18} />
                </span>

                <div className="gcsm-transition-stage gcsm-transition-target min-w-0 flex-1 rounded-lg px-4 py-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider">
                    Destination Stage
                  </p>

                  <p className="mt-1 truncate text-sm font-extrabold">
                    {stage}
                  </p>
                </div>
              </div>

              {/* Reason */}

              <div>
                <label
                  htmlFor="gcsm-reason"
                  className="gcsm-label mb-2 flex items-center gap-2 text-xs font-bold"
                >
                  <MessageSquareText size={15} />
                  Reason / Comment
                  <span className="gcsm-required">*</span>
                </label>

                <textarea
                  id="gcsm-reason"
                  rows={4}
                  className="gcsm-input gcsm-textarea w-full resize-y rounded-xl px-4 py-3 text-sm"
                  value={reason}
                  disabled={isBusy}
                  placeholder="Describe why the lead is moving to this stage..."
                  onChange={(event) => {
                    setReason(event.target.value);
                    setError("");
                  }}
                />

                <p className="gcsm-muted mt-2 text-xs leading-5">
                  A reason is required and will be recorded
                  with the stage change.
                </p>
              </div>
            </div>
          </div>

          {/* Audit Information */}

          <div className="gcsm-info flex items-start gap-3 rounded-2xl p-4">
            <span className="gcsm-info-icon flex h-10 w-10 shrink-0 items-center justify-center rounded-xl">
              <History size={19} />
            </span>

            <div>
              <p className="text-xs font-extrabold">
                Stage History & Audit Trail
              </p>

              <p className="mt-1 text-xs leading-5">
                Every successful stage change creates a
                history and audit entry, preserving the
                pipeline's activity record.
              </p>
            </div>
          </div>

          {isBulk && (
            <p className="gcsm-muted flex items-start gap-2 text-xs leading-5">
              <Info size={15} className="mt-0.5 shrink-0" />
              Leads already in the destination stage are
              skipped. Other leads are processed individually,
              so partial success is possible.
            </p>
          )}
        </div>

        {/* ========================================================= */}
        {/* FOOTER */}
        {/* ========================================================= */}

        <footer className="gcsm-footer flex shrink-0 items-center justify-between gap-3 px-6 py-4">
          <span className="gcsm-footer-note hidden items-center gap-2 text-xs sm:inline-flex">
            <ShieldCheck size={15} />
            Audit tracked
          </span>

          <div className="ml-auto flex items-center gap-3">
            <button
              type="button"
              className="gcsm-secondary inline-flex h-11 items-center justify-center rounded-xl px-5 text-sm font-bold"
              onClick={handleClose}
              disabled={isBusy}
            >
              Cancel
            </button>

            <button
              type="button"
              className="gcsm-primary inline-flex h-11 items-center justify-center gap-2 rounded-xl px-5 text-sm font-bold"
              onClick={submit}
              disabled={isBusy}
            >
              {isBusy ? (
                <LoaderCircle
                  size={17}
                  className="animate-spin"
                />
              ) : (
                <CheckCircle2 size={17} />
              )}

              {isBusy ? "Changing..." : "Change Stage"}
            </button>
          </div>
        </footer>
      </section>
    </div>,
    document.body
  );
};

export default ChangeStageModal;