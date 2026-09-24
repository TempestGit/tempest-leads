import {
  useEffect,
  useState,
} from "react";

import {
  Check,
  CalendarClock,
  Ellipsis,
  UserX,
  X,
} from "lucide-react";

import {
  createPortal,
} from "react-dom";

/*
|--------------------------------------------------------------------------
| Meeting Types
|--------------------------------------------------------------------------
*/

const TYPE_LABELS = {
  VIDEO_CALL: "Video call",
  IN_PERSON: "In person",
  PHONE_CALL: "Phone",
};

/*
|--------------------------------------------------------------------------
| Date
|--------------------------------------------------------------------------
*/

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

/*
|--------------------------------------------------------------------------
| Time
|--------------------------------------------------------------------------
*/

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

/*
|--------------------------------------------------------------------------
| Status
|--------------------------------------------------------------------------
*/

const statusClass = (
  value
) =>
  String(
    value || ""
  )
    .toLowerCase()
    .replaceAll(
      "_",
      "-"
    );

const statusLabel = (
  value
) =>
  String(
    value || ""
  )
    .replaceAll(
      "_",
      " "
    )
    .toLowerCase()
    .replace(
      /^\w/,
      (
        character
      ) =>
        character.toUpperCase()
    );

/*
|--------------------------------------------------------------------------
| Meetings Table
|--------------------------------------------------------------------------
*/

const MeetingsTable = ({
  meetings = [],
  loading = false,
  onComplete,
  onReschedule,
  onCancel,
  onNoShow,
  onOpenLead,
}) => {
  /*
  |--------------------------------------------------------------------------
  | Floating Action Menu
  |--------------------------------------------------------------------------
  */

  const [
    menu,
    setMenu,
  ] = useState(
    null
  );

  /*
  |--------------------------------------------------------------------------
  | Open Menu
  |--------------------------------------------------------------------------
  */

  const openMenu = (
    event,
    meeting
  ) => {
    event.stopPropagation();

    const rect =
      event.currentTarget
        .getBoundingClientRect();

    const menuWidth =
      190;

    const gap =
      6;

    /*
    |--------------------------------------------------------------------------
    | Prefer opening below.
    |--------------------------------------------------------------------------
    */

    let top =
      rect.bottom +
      gap;

    let left =
      rect.right -
      menuWidth;

    /*
    |--------------------------------------------------------------------------
    | Keep Inside Viewport
    |--------------------------------------------------------------------------
    */

    if (
      left < 10
    ) {
      left = 10;
    }

    if (
      left +
        menuWidth >
      window.innerWidth -
        10
    ) {
      left =
        window.innerWidth -
        menuWidth -
        10;
    }

    /*
    |--------------------------------------------------------------------------
    | If there isn't enough space below, open upward.
    |--------------------------------------------------------------------------
    */

    const estimatedMenuHeight =
      132;

    if (
      top +
        estimatedMenuHeight >
      window.innerHeight -
        10
    ) {
      top =
        rect.top -
        estimatedMenuHeight -
        gap;
    }

    setMenu({
      meeting,
      top,
      left,
    });
  };

  /*
  |--------------------------------------------------------------------------
  | Close On Outside Click / Scroll / Resize
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (!menu) {
      return undefined;
    }

    const closeMenu =
      () => {
        setMenu(
          null
        );
      };

    const handleKeyDown =
      (
        event
      ) => {
        if (
          event.key ===
          "Escape"
        ) {
          closeMenu();
        }
      };

    window.addEventListener(
      "resize",
      closeMenu
    );

    window.addEventListener(
      "scroll",
      closeMenu,
      true
    );

    document.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      window.removeEventListener(
        "resize",
        closeMenu
      );

      window.removeEventListener(
        "scroll",
        closeMenu,
        true
      );

      document.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [
    menu,
  ]);

  /*
  |--------------------------------------------------------------------------
  | Action Helper
  |--------------------------------------------------------------------------
  */

  const runAction = (
    callback
  ) => {
    const meeting =
      menu?.meeting;

    setMenu(
      null
    );

    if (
      meeting &&
      callback
    ) {
      callback(
        meeting
      );
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Loading
  |--------------------------------------------------------------------------
  */

  if (loading) {
    return (
      <div className="empty-state">
        <p>
          Loading meetings...
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
    !meetings.length
  ) {
    return (
      <div className="empty-state">
        <h2>
          No meetings found
        </h2>

        <p>
          Use Schedule meeting
          to arrange the first
          meeting.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="table-wrap">
        <table className="tl-table meetings-table">
          <thead>
            <tr>
              <th>
                Company
              </th>

              <th>
                Title
              </th>

              <th>
                Date
              </th>

              <th>
                Time
              </th>

              <th>
                Type
              </th>

              <th>
                Status
              </th>

              <th className="meeting-action-heading">
                Action
              </th>
            </tr>
          </thead>

          <tbody>
            {meetings.map(
              (
                meeting
              ) => {
                const active =
                  [
                    "SCHEDULED",
                    "RESCHEDULED",
                  ].includes(
                    meeting.status
                  );

                return (
                  <tr
                    key={
                      meeting.id
                    }
                  >
                    {/* Company */}

                    <td>
                      {onOpenLead ? (
                        <button
                          type="button"
                          className="meeting-company-link"
                          onClick={() =>
                            onOpenLead(
                              meeting.leadId
                            )
                          }
                        >
                          <b>
                            {
                              meeting.companyName
                            }
                          </b>

                          <small>
                            {
                              meeting.leadCode
                            }
                          </small>
                        </button>
                      ) : (
                        <div className="meeting-company-copy">
                          <b>
                            {
                              meeting.companyName
                            }
                          </b>

                          <small>
                            {
                              meeting.leadCode
                            }
                          </small>
                        </div>
                      )}
                    </td>

                    {/* Title */}

                    <td>
                      <div className="meeting-title-copy">
                        <b>
                          {
                            meeting.title
                          }
                        </b>

                        {meeting.contactName && (
                          <small>
                            {
                              meeting.contactName
                            }
                          </small>
                        )}
                      </div>
                    </td>

                    {/* Date */}

                    <td>
                      {formatDate(
                        meeting.startsAt
                      )}
                    </td>

                    {/* Time */}

                    <td>
                      {formatTime(
                        meeting.startsAt
                      )}
                    </td>

                    {/* Type */}

                    <td>
                      {TYPE_LABELS[
                        meeting.meetingType
                      ] ||
                        meeting.meetingType ||
                        "—"}
                    </td>

                    {/* Status */}

                    <td>
                      <span
                        className={`status ${statusClass(
                          meeting.status
                        )}`}
                      >
                        {statusLabel(
                          meeting.status
                        )}
                      </span>
                    </td>

                    {/* Actions */}

                    <td className="meeting-action-cell">
                      {active ? (
                        <div className="meeting-action-toolbar">
                          {/* Complete */}

                          <button
                            type="button"
                            className="meeting-complete-btn"
                            onClick={() =>
                              onComplete?.(
                                meeting
                              )
                            }
                          >
                            {/* <Check
                              size={14}
                              strokeWidth={2}
                            /> */}
                            

                            <span>
                              Complete
                            </span>
                          </button>

                          {/* More */}

                          <button
                            type="button"
                            className={`meeting-more-trigger ${
                              menu
                                ?.meeting
                                ?.id ===
                              meeting.id
                                ? "active"
                                : ""
                            }`}
                            aria-label="More meeting actions"
                            aria-expanded={
                              menu
                                ?.meeting
                                ?.id ===
                              meeting.id
                            }
                            title="More actions"
                            onClick={(
                              event
                            ) => {
                              if (
                                menu
                                  ?.meeting
                                  ?.id ===
                                meeting.id
                              ) {
                                setMenu(
                                  null
                                );

                                return;
                              }

                              openMenu(
                                event,
                                meeting
                              );
                            }}
                          >
                            <Ellipsis
                              size={17}
                            />
                          </button>
                        </div>
                      ) : (
                        <span
                          className={`meeting-closed-label ${statusClass(
                            meeting.status
                          )}`}
                        >
                          {meeting.status ===
                          "COMPLETED"
                            ? "Completed"
                            : meeting.status ===
                                "CANCELLED"
                              ? "Cancelled"
                              : meeting.status ===
                                  "NO_SHOW"
                                ? "No-show"
                                : statusLabel(
                                    meeting.status
                                  )}
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

      {/* --------------------------------------------------------------- */}
      {/* Floating Menu - Rendered Outside Table */}
      {/* --------------------------------------------------------------- */}

      {menu &&
        createPortal(
          <>
            {/* Invisible click-away layer */}

            <button
              type="button"
              className="meeting-menu-backdrop"
              aria-label="Close menu"
              onClick={() =>
                setMenu(
                  null
                )
              }
            />

            {/* Menu */}

            <div
              className="meeting-floating-menu"
              style={{
                top:
                  menu.top,

                left:
                  menu.left,
              }}
              role="menu"
            >
              {/* Reschedule */}

              <button
                type="button"
                role="menuitem"
                onClick={() =>
                  runAction(
                    onReschedule
                  )
                }
              >
                <CalendarClock
                  size={15}
                />

                <span>
                  Reschedule
                </span>
              </button>

              {/* No Show */}

              <button
                type="button"
                role="menuitem"
                onClick={() =>
                  runAction(
                    onNoShow
                  )
                }
              >
                <UserX
                  size={15}
                />

                <span>
                  Mark no-show
                </span>
              </button>

              <div className="meeting-menu-divider" />

              {/* Cancel */}

              <button
                type="button"
                role="menuitem"
                className="meeting-menu-danger"
                onClick={() =>
                  runAction(
                    onCancel
                  )
                }
              >
                <X
                  size={15}
                />

                <span>
                  Cancel meeting
                </span>
              </button>
            </div>
          </>,
          document.body
        )}
    </>
  );
};

export default MeetingsTable;