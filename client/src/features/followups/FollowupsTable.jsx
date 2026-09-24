import {
  CalendarClock,
  Check,
} from "lucide-react";

const formatDate = (
  value
) => {
  if (!value) {
    return "—";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "—";
  }

  return date.toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
};

const formatTime = (
  value
) => {
  if (!value) {
    return "—";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "—";
  }

  return date.toLocaleTimeString(
    "en-IN",
    {
      hour: "2-digit",
      minute: "2-digit",
    }
  );
};

const statusClass = (
  value
) =>
  String(
    value || ""
  )
    .toLowerCase()
    .replaceAll(
      " ",
      "-"
    );

const FollowupsTable = ({
  followups = [],
  loading = false,
  onComplete,
  onReschedule,
  onOpenLead,
}) => {
  if (loading) {
    return (
      <div className="empty-state">
        <p>
          Loading follow-ups...
        </p>
      </div>
    );
  }

  if (
    !followups.length
  ) {
    return (
      <div className="empty-state">
        <h2>
          No follow-ups found
        </h2>

        <p>
          Schedule a follow-up
          to create the next
          action.
        </p>
      </div>
    );
  }

  return (
    <div className="table-wrap">
      <table className="tl-table followups-table">
        <thead>
          <tr>
            <th>
              Company
            </th>

            <th>
              Contact
            </th>

            <th>
              Owner
            </th>

            <th>
              Stage
            </th>

            <th>
              Due
            </th>

            <th>
              Action
            </th>

            <th>
              Priority
            </th>

            <th>
              Last touch
            </th>

            <th></th>
          </tr>
        </thead>

        <tbody>
          {followups.map(
            (
              followup
            ) => {
              const pending =
                followup.status ===
                "PENDING";

              return (
                <tr
                  key={
                    followup.id
                  }
                >
                  <td>
                    <button
                      type="button"
                      className="followup-company-link"
                      onClick={() =>
                        onOpenLead?.(
                          followup.leadId
                        )
                      }
                    >
                      <b>
                        {
                          followup.companyName
                        }
                      </b>

                      <small>
                        {
                          followup.leadCode
                        }
                      </small>
                    </button>
                  </td>

                  <td>
                    {followup.contactName ||
                      "—"}
                  </td>

                  <td>
                    {followup.ownerName ||
                      followup.assignedToName ||
                      "—"}
                  </td>

                  <td>
                    <span className="status">
                      {
                        followup.leadStage
                      }
                    </span>
                  </td>

                  <td>
                    <div className="followup-due">
                      <b>
                        {formatDate(
                          followup.dueAt
                        )}
                      </b>

                      <small>
                        {formatTime(
                          followup.dueAt
                        )}
                      </small>
                    </div>
                  </td>

                  <td>
                    {
                      followup.action
                    }

                    {followup.statusReason && (
                      <small>
                        {
                          followup.statusReason
                        }
                      </small>
                    )}
                  </td>

                  <td>
                    <span
                      className={`priority ${String(
                        followup.priority ||
                          ""
                      ).toLowerCase()}`}
                    >
                      {
                        followup.priority
                      }
                    </span>
                  </td>

                  <td>
                    {formatDate(
                      followup.lastTouchAt
                    )}
                  </td>

                  <td className="followup-action-cell">
                    {pending ? (
                        <div className="followup-actions">
                            <button
                                type="button"
                                className="followup-complete-action"
                                onClick={() =>
                                onComplete?.(
                                    followup
                                )
                                }
                            >
                                Complete
                            </button>

                            <button
                                type="button"
                                className="followup-reschedule-action"
                                onClick={() =>
                                onReschedule?.(
                                    followup
                                )
                                }
                            >
                                Reschedule
                            </button>
                        </div>
                    ) : (
                        <span
                        className={`followup-status-label ${statusClass(
                            followup.displayStatus
                        )}`}
                        >
                        {followup.displayStatus}
                        </span>
                    )}
                  </td>
                </tr>
              );
            }
          )}
        </tbody>
      </table>
    </div>
  );
};

export default FollowupsTable;