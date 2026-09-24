import {
  useEffect,
  useState,
} from "react";

import {
  X,
} from "lucide-react";

import {
  useMarkLeadLostMutation,
} from "./leads.queries.js";

/*
|--------------------------------------------------------------------------
| Reasons
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
| Mark Lost
|--------------------------------------------------------------------------
*/

const MarkLostModal = ({
  open,
  lead,
  onClose,
}) => {
  const mutation =
    useMarkLeadLostMutation();

  const [
    reason,
    setReason,
  ] = useState(
    "Budget"
  );

  const [
    comment,
    setComment,
  ] = useState("");

  const [
    moveToNurture,
    setMoveToNurture,
  ] = useState(
    true
  );

  const [
    error,
    setError,
  ] = useState("");

  /*
  |--------------------------------------------------------------------------
  | Reset
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (!open) {
      return;
    }

    setReason(
      "Budget"
    );

    setComment("");

    setMoveToNurture(
      true
    );

    setError("");
  }, [
    open,
    lead,
  ]);

  /*
  |--------------------------------------------------------------------------
  | Escape
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const handleKeyDown =
      (
        event
      ) => {
        if (
          event.key ===
            "Escape" &&
          !mutation.isPending
        ) {
          onClose();
        }
      };

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () =>
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
  }, [
    open,
    onClose,
    mutation.isPending,
  ]);

  if (
    !open ||
    !lead
  ) {
    return null;
  }

  /*
  |--------------------------------------------------------------------------
  | Submit
  |--------------------------------------------------------------------------
  */

  const submit =
    async () => {
      setError("");

      if (!reason) {
        setError(
          "Reason is required."
        );

        return;
      }

      if (
        !comment.trim()
      ) {
        setError(
          "Close comment is required."
        );

        return;
      }

      try {
        await mutation.mutateAsync({
          leadId:
            Number(
              lead.id
            ),

          data: {
            reason,

            comment:
              comment.trim(),

            moveToNurture,
          },
        });

        onClose();
      } catch (
        requestError
      ) {
        setError(
          requestError
            ?.response
            ?.data
            ?.message ||
            "Unable to close lead."
        );
      }
    };

  return (
    <div className="modal-backdrop">
      <section
        className="tl-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="lost-title"
      >
        <header className="modal-head">
          <div>
            <h2 id="lost-title">
              Mark as lost /
              not interested
            </h2>

            <p>
              This preserves the
              record and allows
              the prospect to
              enter Nurture.
              Close details are
              mandatory.
            </p>
          </div>

          <button
            type="button"
            className="icon-control"
            disabled={
              mutation.isPending
            }
            onClick={
              onClose
            }
            aria-label="Close"
          >
            <X
              size={15}
            />
          </button>
        </header>

        <div className="modal-body">
          {error && (
            <div className="error-box">
              {error}
            </div>
          )}

          <div className="form-section">
            <div className="form-grid2">
              <label>
                Reason *

                <select
                  value={
                    reason
                  }
                  onChange={(
                    event
                  ) =>
                    setReason(
                      event.target
                        .value
                    )
                  }
                >
                  {LOST_REASONS.map(
                    (
                      item
                    ) => (
                      <option
                        key={
                          item
                        }
                        value={
                          item
                        }
                      >
                        {item}
                      </option>
                    )
                  )}
                </select>
              </label>

              <label>
                Move to nurture?

                <select
                  value={
                    moveToNurture
                      ? "Yes"
                      : "No"
                  }
                  onChange={(
                    event
                  ) =>
                    setMoveToNurture(
                      event.target
                        .value ===
                        "Yes"
                    )
                  }
                >
                  <option value="Yes">
                    Yes
                  </option>

                  <option value="No">
                    No
                  </option>
                </select>
              </label>

              <label className="full">
                Close comment *

                <textarea
                  rows="4"
                  value={
                    comment
                  }
                  onChange={(
                    event
                  ) =>
                    setComment(
                      event.target
                        .value
                    )
                  }
                  autoFocus
                />
              </label>
            </div>
          </div>
        </div>

        <footer className="modal-foot">
          <button
            type="button"
            className="tl-secondary"
            disabled={
              mutation.isPending
            }
            onClick={
              onClose
            }
          >
            Cancel
          </button>

          <button
            type="button"
            className="tl-danger"
            disabled={
              mutation.isPending
            }
            onClick={
              submit
            }
          >
            {mutation.isPending
              ? "Closing..."
              : "Close lead"}
          </button>
        </footer>
      </section>
    </div>
  );
};

export default MarkLostModal;