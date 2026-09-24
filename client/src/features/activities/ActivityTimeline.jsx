/*
|--------------------------------------------------------------------------
| Date / Time
|--------------------------------------------------------------------------
*/

const formatDateTime = (
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

  return date.toLocaleString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",

      hour: "2-digit",
      minute: "2-digit",
    }
  );
};

/*
|--------------------------------------------------------------------------
| Timeline
|--------------------------------------------------------------------------
*/

const ActivityTimeline = ({
  activities = [],
  loading = false,
  compact = false,
  showContext = false,
  onLeadClick,
}) => {
  /*
  |--------------------------------------------------------------------------
  | Loading
  |--------------------------------------------------------------------------
  */

  if (loading) {
    return (
      <div className="empty-state">
        <p>
          Loading activity...
        </p>
      </div>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Empty
  |--------------------------------------------------------------------------
  */

  if (
    !activities.length
  ) {
    return (
      <div className="empty-state">
        <h2>
          No activity recorded
        </h2>

        <p>
          Use Add Activity to
          start the history.
        </p>
      </div>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Recent Activity Limit
  |--------------------------------------------------------------------------
  */

  const visible =
    compact
      ? activities.slice(
          0,
          5
        )
      : activities;

  return (
    <div className="timeline">
      {visible.map(
        (
          activity
        ) => {
          const title = [
            activity.activityType,

            showContext
              ? activity.companyName
              : null,

            activity.outcome,
          ]
            .filter(
              Boolean
            )
            .join(
              " · "
            );

          return (
            <div
              key={
                activity.id
              }
              className="timeline-item"
            >
              {/* Title */}

              <b>
                {title}
              </b>

              {/* Meta */}

              <small>
                {formatDateTime(
                  activity.occurredAt
                )}

                {" · "}

                {activity.createdByName ||
                  "Unknown user"}

                {showContext &&
                  activity.leadCode && (
                    <>
                      {" · "}

                      <button
                        type="button"
                        className="activity-lead-link"
                        onClick={() =>
                          onLeadClick?.(
                            activity.leadId
                          )
                        }
                      >
                        {
                          activity.leadCode
                        }
                      </button>
                    </>
                  )}
              </small>

              {/* Contact */}

              {showContext &&
                activity.contactName && (
                  <small>
                    Contact:{" "}
                    {
                      activity.contactName
                    }
                  </small>
                )}

              {/* Notes */}

              {activity.notes && (
                <small>
                  {
                    activity.notes
                  }
                </small>
              )}
            </div>
          );
        }
      )}
    </div>
  );
};

export default ActivityTimeline;