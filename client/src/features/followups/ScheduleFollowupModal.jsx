import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  X,
} from "lucide-react";

import {
  useLeadsQuery,
} from "../leads/leads.queries.js";

import {
  useCreateFollowupMutation,
} from "./followups.queries.js";

const todayInput =
  () => {
    const date =
      new Date();

    const year =
      date.getFullYear();

    const month =
      String(
        date.getMonth() + 1
      ).padStart(
        2,
        "0"
      );

    const day =
      String(
        date.getDate()
      ).padStart(
        2,
        "0"
      );

    return `${year}-${month}-${day}`;
  };

const ScheduleFollowupModal = ({
  open,
  lead = null,
  onClose,
}) => {
  const mutation =
    useCreateFollowupMutation();

  const params =
    useMemo(
      () => ({
        page: 1,
        limit: 100,
        sort:
          "createdAt",
        direction:
          "desc",
      }),
      []
    );

  const leadsQuery =
    useLeadsQuery(
      params
    );

  const leads =
    leadsQuery.data
      ?.data
      ?.leads || [];

  const [
    selectedLeadId,
    setSelectedLeadId,
  ] = useState("");

  const [
    action,
    setAction,
  ] = useState("");

  const [
    date,
    setDate,
  ] = useState(
    todayInput()
  );

  const [
    time,
    setTime,
  ] = useState(
    "10:00"
  );

  const [
    priority,
    setPriority,
  ] = useState(
    "Medium"
  );

  const [
    error,
    setError,
  ] = useState("");

  useEffect(() => {
    if (!open) {
      return;
    }

    setSelectedLeadId(
      lead?.id
        ? String(
            lead.id
          )
        : ""
    );

    setAction(
      lead?.nextAction ||
        ""
    );

    setDate(
      todayInput()
    );

    setTime(
      "10:00"
    );

    setPriority(
      lead?.priority ||
        "Medium"
    );

    setError("");
  }, [
    open,
    lead,
  ]);

  if (!open) {
    return null;
  }

  const resolvedLead =
    lead ||
    leads.find(
      (
        item
      ) =>
        Number(
          item.id
        ) ===
        Number(
          selectedLeadId
        )
    ) ||
    null;

  const submit =
    async () => {
      setError("");

      if (!resolvedLead) {
        setError(
          "Related lead is required."
        );

        return;
      }

      if (
        !action.trim()
      ) {
        setError(
          "Action is required."
        );

        return;
      }

      if (
        !date ||
        !time
      ) {
        setError(
          "Date and time are required."
        );

        return;
      }

      const dueAt =
        new Date(
          `${date}T${time}:00`
        );

      if (
        Number.isNaN(
          dueAt.getTime()
        )
      ) {
        setError(
          "Enter a valid date and time."
        );

        return;
      }

      try {
        await mutation.mutateAsync({
          leadId:
            Number(
              resolvedLead.id
            ),

          action:
            action.trim(),

          dueAt:
            dueAt.toISOString(),

          priority,

          notes:
            null,
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
            "Unable to schedule follow-up."
        );
      }
    };

  return (
    <div className="modal-backdrop">
      <section className="tl-modal">
        <header className="modal-head">
          <div>
            <h2>
              Schedule follow-up
            </h2>
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
        </header>

        <div className="modal-body">
          {error && (
            <div className="error-box">
              {error}
            </div>
          )}

          <div className="form-section">
            <div className="form-grid2">
              {!lead ? (
                <label className="full">
                  Related lead *

                  <select
                    value={
                      selectedLeadId
                    }
                    onChange={(
                      event
                    ) =>
                      setSelectedLeadId(
                        event.target
                          .value
                      )
                    }
                  >
                    <option value="">
                      Select lead
                    </option>

                    {leads.map(
                      (
                        item
                      ) => (
                        <option
                          key={
                            item.id
                          }
                          value={
                            item.id
                          }
                        >
                          {
                            item.companyName
                          }
                          {" · "}
                          {
                            item.leadCode
                          }
                        </option>
                      )
                    )}
                  </select>
                </label>
              ) : (
                <div className="activity-context full">
                  <small>
                    Related lead
                  </small>

                  <b>
                    {
                      lead.companyName
                    }
                    {" · "}
                    {
                      lead.leadCode
                    }
                  </b>
                </div>
              )}

              <label className="full">
                Action *

                <input
                  type="text"
                  value={
                    action
                  }
                  onChange={(
                    event
                  ) =>
                    setAction(
                      event.target
                        .value
                    )
                  }
                  autoFocus
                />
              </label>

              <label>
                Date *

                <input
                  type="date"
                  value={
                    date
                  }
                  onChange={(
                    event
                  ) =>
                    setDate(
                      event.target
                        .value
                    )
                  }
                />
              </label>

              <label>
                Time

                <input
                  type="time"
                  value={
                    time
                  }
                  onChange={(
                    event
                  ) =>
                    setTime(
                      event.target
                        .value
                    )
                  }
                />
              </label>

              <label>
                Priority

                <select
                  value={
                    priority
                  }
                  onChange={(
                    event
                  ) =>
                    setPriority(
                      event.target
                        .value
                    )
                  }
                >
                  <option value="High">
                    High
                  </option>

                  <option value="Medium">
                    Medium
                  </option>

                  <option value="Low">
                    Low
                  </option>
                </select>
              </label>
            </div>
          </div>
        </div>

        <footer className="modal-foot">
          <button
            type="button"
            className="tl-secondary"
            onClick={
              onClose
            }
          >
            Cancel
          </button>

          <button
            type="button"
            className="tl-primary"
            disabled={
              mutation.isPending
            }
            onClick={
              submit
            }
          >
            {mutation.isPending
              ? "Scheduling..."
              : "Schedule"}
          </button>
        </footer>
      </section>
    </div>
  );
};

export default ScheduleFollowupModal;