
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  Building2,
  CalendarClock,
  CalendarDays,
  Check,
  Clock3,
  Ellipsis,
  LoaderCircle,
  Phone,
  UserX,
  Video,
  X,
} from "lucide-react";

const TYPE_LABELS = {
  VIDEO_CALL: "Video call",
  IN_PERSON: "In person",
  PHONE_CALL: "Phone",
};

const TYPE_ICONS = {
  VIDEO_CALL: Video,
  IN_PERSON: Building2,
  PHONE_CALL: Phone,
};

const formatDate = (value) => {
  if (!value) return "—";
  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? "—"
    : date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
};

const formatTime = (value) => {
  if (!value) return "—";
  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? "—"
    : date.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
      });
};

const normalizeStatus = (value) =>
  String(value || "")
    .trim()
    .toUpperCase()
    .replace(/[\s-]+/g, "_");

const statusLabel = (value) => {
  const status = normalizeStatus(value);

  return (
    {
      SCHEDULED: "Scheduled",
      RESCHEDULED: "Rescheduled",
      COMPLETED: "Completed",
      CANCELLED: "Cancelled",
      CANCELED: "Cancelled",
      NO_SHOW: "No-show",
    }[status] ||
    String(value || "Unknown").replaceAll("_", " ")
  );
};

const getInitials = (name) =>
  String(name || "C")
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

const MeetingsTable = ({
  meetings = [],
  loading = false,
  onComplete,
  onReschedule,
  onCancel,
  onNoShow,
  onOpenLead,
}) => {
  const [menu, setMenu] = useState(null);
  const menuRef = useRef(null);

  const openMenu = (event, meeting) => {
    event.stopPropagation();

    const rect = event.currentTarget.getBoundingClientRect();
    const width = 210;
    const height = 156;
    const gap = 6;

    const left = Math.max(
      10,
      Math.min(rect.right - width, window.innerWidth - width - 10)
    );

    const below = rect.bottom + gap;
    const above = rect.top - height - gap;

    const top =
      below + height <= window.innerHeight - 10
        ? below
        : Math.max(10, above);

    setMenu({ meeting, top, left });
  };

  useEffect(() => {
    if (!menu) return undefined;

    const closeMenu = () => setMenu(null);

    const handlePointerDown = (event) => {
      if (!menuRef.current?.contains(event.target)) {
        closeMenu();
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") closeMenu();
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    window.addEventListener("resize", closeMenu);
    window.addEventListener("scroll", closeMenu, true);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize", closeMenu);
      window.removeEventListener("scroll", closeMenu, true);
    };
  }, [menu]);

  const runAction = (callback) => {
    const selectedMeeting = menu?.meeting;
    setMenu(null);

    if (selectedMeeting && callback) {
      callback(selectedMeeting);
    }
  };

  if (loading) {
    return (
      <div className="gmp-muted flex min-h-[240px] flex-col items-center justify-center gap-3">
        <LoaderCircle size={28} className="animate-spin" />
        <p className="text-sm">Loading meetings...</p>
      </div>
    );
  }

  if (!meetings.length) {
    return (
      <div className="flex min-h-[260px] flex-col items-center justify-center px-5 text-center">
        <span className="gmp-empty-icon mb-4 flex h-16 w-16 items-center justify-center rounded-2xl">
          <CalendarDays size={29} />
        </span>
        <h3 className="gmp-heading text-base font-bold">
          No Meetings Found
        </h3>
        <p className="gmp-muted mt-2 max-w-sm text-sm">
          Use Schedule Meeting to arrange your first client conversation.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="gmp-meetings-table w-full min-w-[1000px] border-collapse text-left">
          <thead>
            <tr>
              {[
                "Company",
                "Meeting",
                "Date",
                "Time",
                "Type",
                "Status",
                "Actions",
              ].map((heading) => (
                <th
                  key={heading}
                  className="whitespace-nowrap px-5 py-4 text-xs font-bold"
                >
                  {heading}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {meetings.map((meeting) => {
              const status = normalizeStatus(meeting.status);
              const active = ["SCHEDULED", "RESCHEDULED"].includes(status);
              const TypeIcon = TYPE_ICONS[meeting.meetingType] || Video;
              const isMenuOpen = menu?.meeting?.id === meeting.id;

              return (
                <tr key={meeting.id}>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <span className="gmp-company-avatar flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xs font-bold">
                        {getInitials(meeting.companyName)}
                      </span>

                      <div className="min-w-0">
                        {onOpenLead ? (
                          <button
                            type="button"
                            onClick={() => onOpenLead(meeting.leadId)}
                            className="gmp-company-link max-w-[170px] truncate text-left text-sm font-bold"
                          >
                            {meeting.companyName || "—"}
                          </button>
                        ) : (
                          <p className="gmp-heading max-w-[170px] truncate text-sm font-bold">
                            {meeting.companyName || "—"}
                          </p>
                        )}
                        <p className="gmp-muted mt-1 text-[11px]">
                          {meeting.leadCode || "—"}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="px-5 py-4">
                    <p className="gmp-heading max-w-[220px] truncate text-sm font-semibold">
                      {meeting.title || "Untitled Meeting"}
                    </p>
                    {meeting.contactName && (
                      <p className="gmp-muted mt-1 max-w-[200px] truncate text-xs">
                        {meeting.contactName}
                      </p>
                    )}
                  </td>

                  <td className="px-5 py-4">
                    <span className="gmp-muted inline-flex items-center gap-2 whitespace-nowrap text-xs">
                      <CalendarDays size={14} />
                      {formatDate(meeting.startsAt)}
                    </span>
                  </td>

                  <td className="px-5 py-4">
                    <span className="gmp-muted inline-flex items-center gap-2 whitespace-nowrap text-xs">
                      <Clock3 size={14} />
                      {formatTime(meeting.startsAt)}
                    </span>
                  </td>

                  <td className="px-5 py-4">
                    <span className="gmp-type inline-flex items-center gap-2 whitespace-nowrap rounded-lg px-2.5 py-1.5 text-xs font-semibold">
                      <TypeIcon size={14} />
                      {TYPE_LABELS[meeting.meetingType] ||
                        meeting.meetingType ||
                        "—"}
                    </span>
                  </td>

                  <td className="px-5 py-4">
                    <span
                      className="gmp-status inline-flex whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-bold"
                      data-status={status}
                    >
                      {statusLabel(meeting.status)}
                    </span>
                  </td>

                  <td className="px-5 py-4">
                    {active ? (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => onComplete?.(meeting)}
                          disabled={!onComplete}
                          className="gmp-complete-button inline-flex h-9 items-center gap-1.5 rounded-xl px-3 text-xs font-bold disabled:opacity-50"
                        >
                          <Check size={15} />
                          Complete
                        </button>

                        <button
                          type="button"
                          aria-label="More meeting actions"
                          aria-haspopup="menu"
                          aria-expanded={isMenuOpen}
                          onClick={(event) => {
                            if (isMenuOpen) {
                              setMenu(null);
                            } else {
                              openMenu(event, meeting);
                            }
                          }}
                          className={`gmp-more-button flex h-9 w-9 items-center justify-center rounded-xl ${
                            isMenuOpen ? "gmp-more-active" : ""
                          }`}
                        >
                          <Ellipsis size={18} />
                        </button>
                      </div>
                    ) : (
                      <span className="gmp-muted text-xs font-semibold">
                        {statusLabel(meeting.status)}
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {menu &&
        createPortal(
          <div
            ref={menuRef}
            className="gmp-floating-menu fixed w-[210px] overflow-hidden rounded-2xl p-1.5"
            style={{
              top: menu.top,
              left: menu.left,
              zIndex: 2147482000,
            }}
            role="menu"
            aria-label="Meeting actions"
          >
            <button
              type="button"
              role="menuitem"
              onClick={() => runAction(onReschedule)}
              className="gmp-menu-item flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-xs font-semibold"
            >
              <CalendarClock size={16} />
              Reschedule
            </button>

            <button
              type="button"
              role="menuitem"
              onClick={() => runAction(onNoShow)}
              className="gmp-menu-item flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-xs font-semibold"
            >
              <UserX size={16} />
              Mark No-show
            </button>

            <div className="gmp-menu-divider my-1" />

            <button
              type="button"
              role="menuitem"
              onClick={() => runAction(onCancel)}
              className="gmp-menu-danger flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-xs font-semibold"
            >
              <X size={16} />
              Cancel Meeting
            </button>
          </div>,
          document.body
        )}
    </>
  );
};

export default MeetingsTable;