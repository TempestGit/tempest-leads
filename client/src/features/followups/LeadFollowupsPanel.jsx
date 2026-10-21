
import { useMemo, useState } from "react";

import {
  CalendarClock,
  CheckCircle2,
  Clock3,
  ListTodo,
  LoaderCircle,
  Plus,
  RefreshCw,
} from "lucide-react";

import "./followups-glass.css";

import { useFollowupsQuery } from "./followups.queries.js";

import FollowupsTable from "./FollowupsTable.jsx";
import ScheduleFollowupModal from "./ScheduleFollowupModal.jsx";
import CompleteFollowupModal from "./CompleteFollowupModal.jsx";
import RescheduleFollowupModal from "./RescheduleFollowupModal.jsx";

/*
|--------------------------------------------------------------------------
| Helpers
|--------------------------------------------------------------------------
*/

const normalizeStatus = (value) =>
  String(value ?? "")
    .trim()
    .toUpperCase()
    .replace(/[\s-]+/g, "_");

const getFollowupDate = (followup) => {
  if (!followup) return null;

  // Match the backend's dueAt field first.
  const value =
    followup.dueAt ??
    followup.followUpAt ??
    followup.followupAt ??
    followup.scheduledAt ??
    null;

  if (!value) return null;

  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? null : date;
};

/*
|--------------------------------------------------------------------------
| Summary Card
|--------------------------------------------------------------------------
*/

const FollowupMetric = ({
  title,
  value,
  icon: Icon,
  tone = "blue",
  description,
}) => (
  <article
    className={`gfp-metric gfp-metric-${tone} rounded-[20px] p-4 sm:p-5`}
  >
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="gfp-metric-label text-xs font-semibold">
          {title}
        </p>

        <h3 className="gfp-metric-value mt-3 text-2xl font-extrabold">
          {value}
        </h3>

        <p className="gfp-metric-description mt-2 text-[11px]">
          {description}
        </p>
      </div>

      <span className="gfp-metric-icon flex h-11 w-11 shrink-0 items-center justify-center rounded-xl">
        <Icon size={20} />
      </span>
    </div>
  </article>
);

/*
|--------------------------------------------------------------------------
| Lead Follow-ups Panel
|--------------------------------------------------------------------------
*/

const LeadFollowupsPanel = ({ lead }) => {
  const [scheduleOpen, setScheduleOpen] = useState(false);

  const [completeItem, setCompleteItem] = useState(null);

  const [rescheduleItem, setRescheduleItem] = useState(null);

  /*
  |--------------------------------------------------------------------------
  | Query
  |--------------------------------------------------------------------------
  */

  const params = useMemo(
    () => ({
      leadId: Number(lead.id),
      view: "ALL",
      page: 1,
      limit: 100,
    }),
    [lead.id]
  );

  const query = useFollowupsQuery(params);

  const followups = query.data?.data?.followups || [];

  /*
  |--------------------------------------------------------------------------
  | Summary Statistics
  |--------------------------------------------------------------------------
  |
  | Business rules:
  |
  | PENDING:
  |   Future due date = Upcoming
  |   Past due date   = Overdue
  |
  | COMPLETED:
  |   Count only under Completed
  |
  | RESCHEDULED:
  |   Keep in history
  |   Do not count as Upcoming or Overdue
  |
  | CANCELLED / SKIPPED:
  |   Keep in history
  |   Do not count as Upcoming or Overdue
  |
  | This ensures that a rescheduled original follow-up
  | cannot incorrectly appear in the overdue count.
  |--------------------------------------------------------------------------
  */

  const stats = useMemo(() => {
    const now = Date.now();

    let completed = 0;
    let upcoming = 0;
    let overdue = 0;

    for (const followup of followups) {
      const status = normalizeStatus(followup.status);

      // Completed follow-ups are historical records.
      if (status === "COMPLETED" || status === "DONE") {
        completed += 1;
        continue;
      }

      // Only active pending follow-ups can become
      // upcoming or overdue.
      //
      // This automatically excludes:
      // RESCHEDULED, CANCELLED, CANCELED, SKIPPED,
      // and any other inactive status.
      if (status !== "PENDING") {
        continue;
      }

      const dueDate = getFollowupDate(followup);

      // Invalid or missing dates must not be
      // incorrectly counted.
      if (!dueDate) {
        continue;
      }

      if (dueDate.getTime() < now) {
        overdue += 1;
      } else {
        upcoming += 1;
      }
    }

    return {
      total: followups.length,
      completed,
      upcoming,
      overdue,
    };
  }, [followups]);

  /*
  |--------------------------------------------------------------------------
  | Close Handlers
  |--------------------------------------------------------------------------
  */

  const closeSchedule = () => {
    setScheduleOpen(false);
    query.refetch();
  };

  const closeComplete = () => {
    setCompleteItem(null);
    query.refetch();
  };

  const closeReschedule = () => {
    setRescheduleItem(null);
    query.refetch();
  };

  /*
  |--------------------------------------------------------------------------
  | Render
  |--------------------------------------------------------------------------
  */

  return (
    <>
      <section className="glass-followups space-y-5">

        {/* ========================================================= */}
        {/* HEADER */}
        {/* ========================================================= */}

        <header className="gfp-panel rounded-[24px] p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <span className="gfp-header-icon flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl">
                <ListTodo size={23} />
              </span>

              <div>
                <p className="gfp-eyebrow mb-1 text-[10px] font-bold uppercase tracking-[0.15em]">
                  Lead Engagement
                </p>

                <h2 className="gfp-heading text-xl font-extrabold tracking-tight">
                  Follow-ups
                </h2>

                <p className="gfp-muted mt-1 text-sm leading-6">
                  Manage upcoming actions, completed tasks,
                  and overdue follow-ups for this lead.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => query.refetch()}
                disabled={query.isFetching}
                aria-label="Refresh follow-ups"
                title="Refresh follow-ups"
                className="gfp-secondary flex h-11 w-11 items-center justify-center rounded-xl"
              >
                <RefreshCw
                  size={17}
                  className={
                    query.isFetching ? "animate-spin" : ""
                  }
                />
              </button>

              <button
                type="button"
                onClick={() => setScheduleOpen(true)}
                className="gfp-primary inline-flex min-h-11 items-center gap-2 rounded-xl px-4 text-sm font-bold"
              >
                <Plus size={17} />
                Schedule Follow-up
              </button>
            </div>
          </div>
        </header>

        {/* ========================================================= */}
        {/* SUMMARY CARDS */}
        {/* ========================================================= */}

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">

          <FollowupMetric
            title="Total Follow-ups"
            value={query.isLoading ? "—" : stats.total}
            icon={ListTodo}
            tone="blue"
            description="Loaded records"
          />

          <FollowupMetric
            title="Upcoming"
            value={query.isLoading ? "—" : stats.upcoming}
            icon={CalendarClock}
            tone="violet"
            description="Scheduled for later"
          />

          <FollowupMetric
            title="Completed"
            value={query.isLoading ? "—" : stats.completed}
            icon={CheckCircle2}
            tone="green"
            description="Finished actions"
          />

          <FollowupMetric
            title="Overdue"
            value={query.isLoading ? "—" : stats.overdue}
            icon={Clock3}
            tone="orange"
            description="Past due actions"
          />

        </div>

        {/* ========================================================= */}
        {/* FOLLOW-UP HISTORY */}
        {/* ========================================================= */}

        <article className="gfp-panel overflow-hidden rounded-[24px]">
          <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-5 sm:px-6">
            <div className="flex items-center gap-3">
              <span className="gfp-section-icon flex h-10 w-10 items-center justify-center rounded-xl">
                <ListTodo size={19} />
              </span>

              <div>
                <h3 className="gfp-heading text-base font-bold">
                  Follow-up History
                </h3>

                <p className="gfp-muted mt-1 text-xs">
                  {followups.length} loaded follow-up records
                </p>
              </div>
            </div>

            {query.isFetching && (
              <span className="gfp-muted inline-flex items-center gap-2 text-xs">
                <LoaderCircle
                  size={14}
                  className="animate-spin"
                />
                Refreshing
              </span>
            )}
          </div>

          {query.isError ? (
            <div
              role="alert"
              className="px-5 py-12 text-center"
            >
              <h3 className="gfp-heading font-bold">
                Unable to load follow-ups
              </h3>

              <p className="gfp-muted mt-2 text-sm">
                {query.error?.response?.data?.message ||
                  "Something went wrong while loading follow-ups."}
              </p>

              <button
                type="button"
                onClick={() => query.refetch()}
                disabled={query.isFetching}
                className="gfp-primary mt-5 rounded-xl px-5 py-2.5 text-sm font-bold"
              >
                Try Again
              </button>
            </div>
          ) : (
            <div className="gfp-table-wrap overflow-x-auto">
              <FollowupsTable
                followups={followups}
                loading={query.isLoading}
                onComplete={setCompleteItem}
                onReschedule={setRescheduleItem}
              />
            </div>
          )}

          <footer className="gfp-footer px-5 py-3 text-xs sm:px-6">
            Showing up to 100 follow-ups linked to this lead.
          </footer>
        </article>
      </section>

      {/* =========================================================== */}
      {/* SCHEDULE MODAL */}
      {/* =========================================================== */}

      <ScheduleFollowupModal
        open={scheduleOpen}
        lead={lead}
        onClose={closeSchedule}
      />

      {/* =========================================================== */}
      {/* COMPLETE MODAL */}
      {/* =========================================================== */}

      <CompleteFollowupModal
        open={Boolean(completeItem)}
        followup={completeItem}
        onClose={closeComplete}
      />

      {/* =========================================================== */}
      {/* RESCHEDULE MODAL */}
      {/* =========================================================== */}

      <RescheduleFollowupModal
        open={Boolean(rescheduleItem)}
        followup={rescheduleItem}
        onClose={closeReschedule}
      />
    </>
  );
};

export default LeadFollowupsPanel;