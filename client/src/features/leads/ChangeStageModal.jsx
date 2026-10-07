import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { useChangeLeadStageMutation } from "./leads.queries.js";

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

  useEffect(() => {
    if (!open) {
      return;
    }

    setStage(STAGES.includes(initialStage) ? initialStage : "New");
    setReason("");
    setError("");
  }, [open, initialStage]);

  if (!open) {
    return null;
  }

  const submit = async () => {
    setError("");

    if (!leadIds.length) {
      setError("No lead selected.");
      return;
    }

    if (!reason.trim()) {
      setError("Reason or comment is required.");
      return;
    }

    const succeeded = [];
    const skipped = [];
    const failed = [];

    for (const leadId of leadIds) {
      try {
        await mutation.mutateAsync({
          leadId: Number(leadId),
          data: { stage, reason: reason.trim() },
        });
        succeeded.push(leadId);
      } catch (requestError) {
        const status = requestError?.response?.status;
        const message =
          requestError?.response?.data?.message || "Unable to change stage.";

        // Lead is already in the target stage: nothing to do.
        if (status === 409 && /already in this stage/i.test(message)) {
          skipped.push(leadId);
        } else {
          failed.push({ leadId, message });
        }
      }
    }

    if (succeeded.length && onPartialSuccess) {
      onPartialSuccess([...succeeded, ...skipped]);
    }

    if (!failed.length) {
      onClose();
      return;
    }

    setError(
      `${succeeded.length} lead(s) updated, ${skipped.length} already in "${stage}", ` +
        `${failed.length} failed. First error: ${failed[0].message}`,
    );
  };

  return (
    <div className="modal-backdrop">
      <section className="tl-modal">
        <header className="modal-head">
          <div>
            <h2>Change stage</h2>
            <p>Every change creates a history and audit entry.</p>
          </div>
          <button
            type="button"
            className="icon-control"
            onClick={onClose}
            disabled={mutation.isPending}
          >
            <X size={15} />
          </button>
        </header>

        <div className="modal-body">
          {error && <div className="error-box">{error}</div>}

          <div className="form-section">
            <div className="form-grid2">
              <label>
                New stage
                <select
                  value={stage}
                  onChange={(event) => setStage(event.target.value)}
                >
                  {STAGES.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </label>

              <label className="full">
                Reason / comment *
                <textarea
                  rows="4"
                  value={reason}
                  onChange={(event) => setReason(event.target.value)}
                />
              </label>
            </div>
          </div>
        </div>

        <footer className="modal-foot">
          <button
            type="button"
            className="tl-secondary"
            onClick={onClose}
            disabled={mutation.isPending}
          >
            Cancel
          </button>
          <button
            type="button"
            className="tl-primary"
            onClick={submit}
            disabled={mutation.isPending}
          >
            {mutation.isPending ? "Changing..." : "Change stage"}
          </button>
        </footer>
      </section>
    </div>
  );
};

export default ChangeStageModal;