import {
  AlertTriangle,
  LoaderCircle,
  X,
} from "lucide-react";

import {
  useEffect,
  useState,
} from "react";

import {
  useDeleteCompanyMutation,
} from "./companies.queries.js";

const DeleteCompanyModal = ({
  open,
  company,
  onClose,
}) => {
  const [
    error,
    setError,
  ] = useState("");

  const mutation =
    useDeleteCompanyMutation();

  useEffect(() => {
    if (open) {
      setError("");
    }
  }, [open]);

  if (
    !open ||
    !company
  ) {
    return null;
  }

  const handleDelete =
    async () => {
      setError("");

      try {
        await mutation.mutateAsync(
          company.id
        );

        onClose();
      } catch (
        requestError
      ) {
        setError(
          requestError
            ?.response?.data
            ?.message ||
            "Unable to delete company."
        );
      }
    };

  return (
    <div className="modal-backdrop">
      <div className="tl-modal small">
        <div className="modal-head">
          <div>
            <h2>
              Delete Company
            </h2>

            <p>
              This action uses
              a soft delete.
            </p>
          </div>

          <button
            type="button"
            className="icon-control"
            onClick={
              onClose
            }
          >
            <X size={15} />
          </button>
        </div>

        <div className="modal-body">
          <div
            style={{
              display:
                "flex",
              gap: 12,
              alignItems:
                "flex-start",
            }}
          >
            <div
              style={{
                width: 38,
                height: 38,
                display:
                  "grid",
                placeItems:
                  "center",
                borderRadius:
                  "50%",
                background:
                  "var(--crm-danger-soft)",
                color:
                  "var(--crm-danger)",
                flex: "none",
              }}
            >
              <AlertTriangle
                size={18}
              />
            </div>

            <div>
              <strong>
                Delete{" "}
                {
                  company.name
                }
                ?
              </strong>

              <p
                style={{
                  margin:
                    "6px 0 0",
                  color:
                    "var(--muted)",
                  fontSize: 12,
                  lineHeight:
                    1.5,
                }}
              >
                The company
                will disappear
                from active CRM
                records while
                audit history is
                preserved.
              </p>
            </div>
          </div>

          {error && (
            <div
              className="error-box"
              style={{
                marginTop:
                  15,
              }}
            >
              {error}
            </div>
          )}
        </div>

        <div className="modal-foot">
          <button
            type="button"
            className="tl-secondary"
            onClick={
              onClose
            }
            disabled={
              mutation.isPending
            }
          >
            Cancel
          </button>

          <button
            type="button"
            className="tl-danger"
            onClick={
              handleDelete
            }
            disabled={
              mutation.isPending
            }
          >
            {mutation.isPending && (
              <LoaderCircle
                size={14}
                className="animate-spin"
              />
            )}

            Delete Company
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteCompanyModal;