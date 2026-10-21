
import { useState } from "react";
import {
  CalendarClock,
  CalendarDays,
  Check,
  ChevronDown,
  Clock3,
  LoaderCircle,
  RotateCcw,
  UserRound,
  Building2,
  ListTodo,
} from "lucide-react";

const formatDate = (value) => {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatTime = (value) => {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const normalize = (value) =>
  String(value || "")
    .trim()
    .toUpperCase()
    .replace(/[\s-]+/g, "_");

const getInitials = (value) =>
  String(value || "C")
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

const FollowupsTable = ({
  followups = [],
  loading = false,
  onComplete,
  onReschedule,
  onOpenLead,
}) => {
  const [expandedId, setExpandedId] = useState(null);

  if (loading) {
    return (
      <div className="flex min-h-[250px] flex-col items-center justify-center gap-3">
        <LoaderCircle
          size={28}
          className="gfp-loading animate-spin"
        />
        <p className="gfp-muted text-sm">
          Loading follow-ups...
        </p>
      </div>
    );
  }

  if (!followups.length) {
    return (
      <div className="flex min-h-[290px] flex-col items-center justify-center px-5 text-center">
        <span className="gfp-empty-icon mb-4 flex h-16 w-16 items-center justify-center rounded-2xl">
          <ListTodo size={28} />
        </span>

        <h3 className="gfp-heading text-base font-bold">
          No follow-ups found
        </h3>

        <p className="gfp-muted mt-2 max-w-sm text-sm">
          Schedule a follow-up to create the next action
          for this lead.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto">
      <table className="gfp-followups-table w-full min-w-[1150px] border-collapse text-left">
        <thead>
          <tr>
            <th className="px-5 py-4">Company</th>
            <th className="px-5 py-4">Contact</th>
            <th className="px-5 py-4">Owner</th>
            <th className="px-5 py-4">Stage</th>
            <th className="px-5 py-4">Due</th>
            <th className="px-5 py-4">Action</th>
            <th className="px-5 py-4">Priority</th>
            <th className="px-5 py-4">Last touch</th>
            <th className="px-5 py-4 text-right">Actions</th>
          </tr>
        </thead>

        <tbody>
          {followups.map((followup) => {
            const pending =
              normalize(followup.status) === "PENDING";

            const priority = normalize(followup.priority);
            const displayStatus =
              followup.displayStatus ||
              followup.status ||
              "Unknown";

            const dueDate = followup.dueAt
              ? new Date(followup.dueAt)
              : null;

            const overdue =
              pending &&
              dueDate &&
              !Number.isNaN(dueDate.getTime()) &&
              dueDate.getTime() < Date.now();

            const expanded = expandedId === followup.id;

            return (
              <tr key={followup.id}>
                <td className="px-5 py-4 align-middle">
                  <div className="flex items-center gap-3">
                    <span className="gfp-company-avatar flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xs font-bold">
                      {getInitials(followup.companyName)}
                    </span>

                    <div className="min-w-0">
                      <button
                        type="button"
                        disabled={!onOpenLead}
                        onClick={() =>
                          onOpenLead?.(followup.leadId)
                        }
                        className="gfp-company-link block max-w-[160px] truncate text-left text-sm font-bold disabled:cursor-default"
                      >
                        {followup.companyName || "—"}
                      </button>

                      <p className="gfp-muted mt-1 text-[11px]">
                        {followup.leadCode || "—"}
                      </p>
                    </div>
                  </div>
                </td>

                <td className="px-5 py-4 align-middle">
                  <span className="gfp-body-text inline-flex items-center gap-2 text-xs">
                    <UserRound size={14} className="gfp-muted" />
                    {followup.contactName || "—"}
                  </span>
                </td>

                <td className="px-5 py-4 align-middle">
                  <span className="gfp-body-text text-xs font-medium">
                    {followup.ownerName ||
                      followup.assignedToName ||
                      "—"}
                  </span>
                </td>

                <td className="px-5 py-4 align-middle">
                  <span className="gfp-stage inline-flex whitespace-nowrap rounded-lg px-2.5 py-1.5 text-xs font-semibold">
                    {followup.leadStage || "—"}
                  </span>
                </td>

                <td className="px-5 py-4 align-middle">
                  <div className="flex flex-col gap-1">
                    <span
                      className={`inline-flex items-center gap-1.5 whitespace-nowrap text-xs font-bold ${
                        overdue ? "gfp-overdue-text" : "gfp-body-text"
                      }`}
                    >
                      <CalendarDays size={14} />
                      {formatDate(followup.dueAt)}
                    </span>

                    <span className="gfp-muted inline-flex items-center gap-1.5 text-[11px]">
                      <Clock3 size={13} />
                      {formatTime(followup.dueAt)}
                    </span>
                  </div>
                </td>

                <td className="px-5 py-4 align-middle">
                  <div className="max-w-[230px]">
                    <p className="gfp-heading line-clamp-2 text-xs font-semibold leading-5">
                      {followup.action || "—"}
                    </p>

                    {followup.statusReason && (
                      <div className="mt-1">
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedId(
                              expanded ? null : followup.id
                            )
                          }
                          className="gfp-detail-toggle inline-flex items-center gap-1 text-[11px] font-semibold"
                        >
                          Details
                          <ChevronDown
                            size={12}
                            className={
                              expanded ? "rotate-180" : ""
                            }
                          />
                        </button>

                        {expanded && (
                          <p className="gfp-muted mt-2 whitespace-pre-wrap break-words text-xs leading-5">
                            {followup.statusReason}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </td>

                <td className="px-5 py-4 align-middle">
                  <span
                    className="gfp-priority inline-flex rounded-full px-3 py-1.5 text-xs font-bold"
                    data-priority={priority}
                  >
                    {followup.priority || "—"}
                  </span>
                </td>

                <td className="px-5 py-4 align-middle">
                  <span className="gfp-muted whitespace-nowrap text-xs">
                    {formatDate(followup.lastTouchAt)}
                  </span>
                </td>

                <td className="px-5 py-4 text-right align-middle">
                  {pending ? (
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => onComplete?.(followup)}
                        disabled={!onComplete}
                        className="gfp-complete-action inline-flex h-9 items-center gap-1.5 whitespace-nowrap rounded-xl px-3 text-xs font-bold disabled:opacity-50"
                      >
                        {/* <Check size={15} /> */}
                        Complete
                      </button>

                      <button
                        type="button"
                        onClick={() => onReschedule?.(followup)}
                        disabled={!onReschedule}
                        className="gfp-reschedule-action inline-flex h-9 items-center gap-1.5 whitespace-nowrap rounded-xl px-3 text-xs font-bold disabled:opacity-50"
                      >
                        <RotateCcw size={14} />
                        Reschedule
                      </button>
                    </div>
                  ) : (
                    <span
                      className="gfp-followup-status inline-flex whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-bold"
                      data-status={normalize(displayStatus)}
                    >
                      {displayStatus}
                    </span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default FollowupsTable;