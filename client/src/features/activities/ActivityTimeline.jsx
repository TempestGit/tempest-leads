
import {
  Activity,
  ArrowUpRight,
  Building2,
  CalendarClock,
  CheckCircle2,
  Clock3,
  FileText,
  History,
  LoaderCircle,
  Mail,
  MessageSquare,
  Phone,
  UserRound,
  Users,
  Video,
} from "lucide-react";

/*
|--------------------------------------------------------------------------
| Date / Time
|--------------------------------------------------------------------------
*/

const formatDateTime = (value) => {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatRelativeTime = (value) => {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  const difference = Date.now() - date.getTime();
  const absolute = Math.abs(difference);
  const future = difference < 0;

  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (absolute < minute) return "Just now";

  if (absolute < hour) {
    const count = Math.floor(absolute / minute);

    return future
      ? `In ${count}m`
      : `${count}m ago`;
  }

  if (absolute < day) {
    const count = Math.floor(absolute / hour);

    return future
      ? `In ${count}h`
      : `${count}h ago`;
  }

  if (absolute < 7 * day) {
    const count = Math.floor(absolute / day);

    return future
      ? `In ${count}d`
      : `${count}d ago`;
  }

  return "";
};

/*
|--------------------------------------------------------------------------
| Activity Type
|--------------------------------------------------------------------------
*/

const normalizeActivityType = (value) =>
  String(value || "")
    .trim()
    .toUpperCase()
    .replace(/[\s-]+/g, "_");

const getActivityConfig = (value) => {
  const type = normalizeActivityType(value);

  if (
    type.includes("CALL") ||
    type.includes("PHONE")
  ) {
    return {
      icon: Phone,
      variant: "green",
      label: value || "Phone Call",
    };
  }

  if (
    type.includes("EMAIL") ||
    type.includes("MAIL")
  ) {
    return {
      icon: Mail,
      variant: "blue",
      label: value || "Email",
    };
  }

  if (
    type.includes("MEETING") ||
    type.includes("VIDEO") ||
    type.includes("DEMO")
  ) {
    return {
      icon: Video,
      variant: "violet",
      label: value || "Meeting",
    };
  }

  if (
    type.includes("MESSAGE") ||
    type.includes("WHATSAPP") ||
    type.includes("CHAT")
  ) {
    return {
      icon: MessageSquare,
      variant: "orange",
      label: value || "Message",
    };
  }

  if (
    type.includes("NOTE") ||
    type.includes("DOCUMENT")
  ) {
    return {
      icon: FileText,
      variant: "slate",
      label: value || "Note",
    };
  }

  if (
    type.includes("COMPLETE") ||
    type.includes("WON") ||
    type.includes("SUCCESS")
  ) {
    return {
      icon: CheckCircle2,
      variant: "green",
      label: value || "Completed",
    };
  }

  return {
    icon: Activity,
    variant: "blue",
    label: value || "Activity",
  };
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
      <div className="gat-state flex min-h-[230px] flex-col items-center justify-center gap-3 px-5 text-center">
        <span className="gat-state-icon flex h-16 w-16 items-center justify-center rounded-2xl">
          <LoaderCircle size={28} className="animate-spin" />
        </span>

        <h3 className="gat-heading text-sm font-bold">
          Loading activity...
        </h3>

        <p className="gat-muted text-xs">
          Fetching the latest CRM interactions.
        </p>
      </div>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Empty
  |--------------------------------------------------------------------------
  */

  if (!activities.length) {
    return (
      <div className="gat-state flex min-h-[260px] flex-col items-center justify-center px-5 text-center">
        <span className="gat-state-icon mb-4 flex h-16 w-16 items-center justify-center rounded-2xl">
          <History size={28} />
        </span>

        <h3 className="gat-heading text-base font-extrabold">
          No activity recorded
        </h3>

        <p className="gat-muted mt-2 max-w-sm text-sm leading-6">
          Use Add Activity to start tracking conversations,
          meetings, and important workflow changes.
        </p>
      </div>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Recent Activity Limit
  |--------------------------------------------------------------------------
  */

  const visible = compact
    ? activities.slice(0, 5)
    : activities;

  return (
    <div
      className={`gat-timeline relative min-w-0 ${
        compact ? "gat-compact" : ""
      }`}
    >
      {visible.map((activity, index) => {
        const config = getActivityConfig(activity.activityType);
        const Icon = config.icon;

        const title = [
          activity.activityType,
          showContext ? activity.companyName : null,
          activity.outcome,
        ]
          .filter(Boolean)
          .join(" · ");

        const isLast = index === visible.length - 1;

        return (
          <div
            key={activity.id}
            className="gat-item relative flex min-w-0 gap-4 pb-5 last:pb-0 sm:gap-5"
          >
            {/* Timeline rail */}

            <div className="gat-rail relative flex w-11 shrink-0 flex-col items-center sm:w-12">
              <span
                className="gat-marker relative z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl sm:h-12 sm:w-12"
                data-variant={config.variant}
              >
                <Icon size={20} />
              </span>

              {!isLast && (
                <span className="gat-line mt-2 w-[2px] flex-1 rounded-full" />
              )}
            </div>

            {/* Activity card */}

            <article className="gat-card min-w-0 flex-1 rounded-2xl p-4 sm:p-5">
              {/* Top row */}

              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                <div className="min-w-0">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <span
                      className="gat-type inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold"
                      data-variant={config.variant}
                    >
                      <Icon size={12} />
                      {config.label}
                    </span>

                    {activity.outcome && (
                      <span className="gat-outcome inline-flex max-w-full items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold">
                        <CheckCircle2 size={12} />
                        <span className="break-words">
                          {activity.outcome}
                        </span>
                      </span>
                    )}
                  </div>

                  <h3 className="gat-heading break-words text-sm font-extrabold leading-6 sm:text-[15px]">
                    {title || "CRM Activity"}
                  </h3>
                </div>

                {formatRelativeTime(activity.occurredAt) && (
                  <span className="gat-relative inline-flex shrink-0 items-center gap-1.5 self-start rounded-full px-2.5 py-1.5 text-[11px] font-semibold">
                    <Clock3 size={12} />
                    {formatRelativeTime(activity.occurredAt)}
                  </span>
                )}
              </div>

              {/* Metadata */}

              <div className="gat-meta mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
                <span className="inline-flex items-center gap-1.5">
                  <CalendarClock size={14} />
                  {formatDateTime(activity.occurredAt)}
                </span>

                <span className="inline-flex items-center gap-1.5">
                  <UserRound size={14} />
                  {activity.createdByName || "Unknown user"}
                </span>
              </div>

              {/* Context */}

              {showContext &&
                (activity.companyName ||
                  activity.leadCode ||
                  activity.contactName) && (
                  <div className="gat-context mt-4 flex flex-wrap items-center gap-3 rounded-xl px-3 py-3">
                    {activity.companyName && (
                      <span className="gat-context-text inline-flex items-center gap-1.5 text-xs font-semibold">
                        <Building2 size={14} />
                        {activity.companyName}
                      </span>
                    )}

                    {activity.leadCode && (
                      onLeadClick ? (
                        <button
                          type="button"
                          onClick={() =>
                            onLeadClick(activity.leadId)
                          }
                          className="gat-lead-link inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-bold"
                        >
                          {activity.leadCode}
                          <ArrowUpRight size={13} />
                        </button>
                      ) : (
                        <span className="gat-context-text text-xs font-semibold">
                          {activity.leadCode}
                        </span>
                      )
                    )}

                    {activity.contactName && (
                      <span className="gat-context-text inline-flex items-center gap-1.5 text-xs">
                        <Users size={14} />
                        {activity.contactName}
                      </span>
                    )}
                  </div>
                )}

              {/* Notes */}

              {activity.notes && (
                <div className="gat-notes mt-4 rounded-xl p-3.5">
                  <div className="mb-2 flex items-center gap-2">
                    <FileText size={14} />
                    <span className="text-[11px] font-bold uppercase tracking-wide">
                      Activity Notes
                    </span>
                  </div>

                  <p className="gat-notes-text whitespace-pre-wrap break-words text-xs leading-6 sm:text-[13px]">
                    {activity.notes}
                  </p>
                </div>
              )}
            </article>
          </div>
        );
      })}
    </div>
  );
};

export default ActivityTimeline;