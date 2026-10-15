
import { useMemo, useState } from "react";

import { useNavigate } from "react-router-dom";

import {
  AlertCircle,
  ArrowUpRight,
  CalendarClock,
  CheckCircle2,
  Clock3,
  ListTodo,
  LoaderCircle,
  Plus,
  RefreshCw,
  Timer,
} from "lucide-react";

import { useFollowupsQuery } from "./followups.queries.js";

import FollowupsTable from "./FollowupsTable.jsx";

import ScheduleFollowupModal from "./ScheduleFollowupModal.jsx";
import CompleteFollowupModal from "./CompleteFollowupModal.jsx";
import RescheduleFollowupModal from "./RescheduleFollowupModal.jsx";

import "./followups-page-glass.css";

/*
|--------------------------------------------------------------------------
| Helpers
|--------------------------------------------------------------------------
*/

const normalizeStatus = (value) =>
  String(value || "").trim().toUpperCase();

const getDueDate = (followup) => {
  if (!followup?.dueAt) return null;

  const date = new Date(followup.dueAt);

  return Number.isNaN(date.getTime()) ? null : date;
};

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

/*
|--------------------------------------------------------------------------
| Follow-ups Page
|--------------------------------------------------------------------------
*/

const FollowupsPage = () => {
  const navigate = useNavigate();

  /*
  |--------------------------------------------------------------------------
  | Modal State
  |--------------------------------------------------------------------------
  */

  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [completeItem, setCompleteItem] = useState(null);
  const [rescheduleItem, setRescheduleItem] = useState(null);

  /*
  |--------------------------------------------------------------------------
  | Query — Preserve ALL View
  |--------------------------------------------------------------------------
  */

  const params = useMemo(
    () => ({
      view: "ALL",
      page: 1,
      limit: 100,
    }),
    []
  );

  const query = useFollowupsQuery(params);

  const followups = query.data?.data?.followups || [];

  /*
  |--------------------------------------------------------------------------
  | Statistics
  |--------------------------------------------------------------------------
  */

  const stats = useMemo(() => {
    const now = Date.now();

    let completed = 0;
    let upcoming = 0;
    let overdue = 0;

    const upcomingItems = [];
    const overdueItems = [];

    followups.forEach((item) => {
      const status = normalizeStatus(item.status);
      const dueDate = getDueDate(item);

      const isCompleted = status === "COMPLETED";

      if (isCompleted) {
        completed += 1;
        return;
      }

      // Cancelled records are not active follow-ups.
      if (
        status === "CANCELLED" ||
        status === "CANCELED"
      ) {
        return;
      }

      if (!dueDate) return;

      if (dueDate.getTime() < now) {
        overdue += 1;
        overdueItems.push(item);
      } else {
        upcoming += 1;
        upcomingItems.push(item);
      }
    });

    upcomingItems.sort(
      (a, b) =>
        getDueDate(a).getTime() - getDueDate(b).getTime()
    );

    overdueItems.sort(
      (a, b) =>
        getDueDate(a).getTime() - getDueDate(b).getTime()
    );

    return {
      total: followups.length,
      completed,
      upcoming,
      overdue,
      nextFollowup: upcomingItems[0] || null,
      oldestOverdue: overdueItems[0] || null,
    };
  }, [followups]);

  /*
  |--------------------------------------------------------------------------
  | Actions
  |--------------------------------------------------------------------------
  */

  const handleRefresh = () => {
    query.refetch();
  };

  const handleOpenLead = (leadId) => {
    if (!leadId) return;

    navigate(`/leads/${leadId}`);
  };

  /*
  |--------------------------------------------------------------------------
  | Render
  |--------------------------------------------------------------------------
  */

  return (
    <div className="gfp-page workflow-page workflow-followups min-w-0 space-y-6 p-4 sm:p-6 xl:p-8">
      {/* ============================================================= */}
      {/* HEADER */}
      {/* ============================================================= */}

      <section className="gfp-page-header relative overflow-hidden rounded-[26px] p-5 sm:p-7">
        <div className="gfp-page-header-glow pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full" />

        <div className="relative flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
          <div className="flex min-w-0 items-start gap-4">
            <span className="gfp-page-header-icon flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl">
              <ListTodo size={26} />
            </span>

            <div className="min-w-0">
              <p className="gfp-page-eyebrow mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em]">
                <span className="gfp-page-live-dot h-2 w-2 rounded-full" />
                CLIENT FOLLOW-UP MANAGEMENT
              </p>

              <h1 className="gfp-page-title text-2xl font-extrabold tracking-tight sm:text-3xl">
                Follow-ups
              </h1>

              <p className="gfp-page-muted mt-2 max-w-2xl text-sm leading-6">
                Stay on top of every client commitment.
                Track upcoming actions, complete outcomes,
                and reschedule follow-ups when needed.
              </p>
            </div>
          </div>

          <div className="flex shrink-0 flex-wrap items-center gap-3">
            <button
              type="button"
              className="gfp-page-secondary inline-flex h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm font-bold"
              onClick={handleRefresh}
              disabled={query.isFetching}
            >
              <RefreshCw
                size={16}
                className={query.isFetching ? "animate-spin" : ""}
              />
              Refresh
            </button>

            <button
              type="button"
              className="gfp-page-primary inline-flex h-11 items-center justify-center gap-2 rounded-xl px-5 text-sm font-bold"
              onClick={() => setScheduleOpen(true)}
            >
              <Plus size={18} />
              Schedule Follow-up
            </button>
          </div>
        </div>
      </section>

      {/* ============================================================= */}
      {/* METRICS */}
      {/* ============================================================= */}

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {/* Total */}

        <article className="gfp-page-metric gfp-page-metric-primary relative overflow-hidden rounded-[22px] p-5">
          <div className="relative flex items-start justify-between gap-3">
            <div>
              <p className="gfp-page-metric-label text-xs font-semibold">
                Total Follow-ups
              </p>

              <h2 className="gfp-page-metric-value mt-3 text-3xl font-extrabold">
                {query.isLoading ? "—" : stats.total}
              </h2>

              <p className="gfp-page-metric-description mt-2 text-xs">
                Recent follow-up records
              </p>
            </div>

            <span className="gfp-page-metric-icon flex h-11 w-11 shrink-0 items-center justify-center rounded-xl">
              <ListTodo size={21} />
            </span>
          </div>

          <div className="gfp-page-metric-decoration pointer-events-none absolute -bottom-12 -right-10 h-32 w-32 rounded-full" />
        </article>

        {/* Upcoming */}

        <article className="gfp-page-metric gfp-page-metric-violet rounded-[22px] p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="gfp-page-metric-label text-xs font-semibold">
                Upcoming
              </p>

              <h2 className="gfp-page-metric-value mt-3 text-3xl font-extrabold">
                {query.isLoading ? "—" : stats.upcoming}
              </h2>

              <p className="gfp-page-metric-description mt-2 text-xs">
                Scheduled for the future
              </p>
            </div>

            <span className="gfp-page-metric-icon flex h-11 w-11 shrink-0 items-center justify-center rounded-xl">
              <CalendarClock size={21} />
            </span>
          </div>
        </article>

        {/* Completed */}

        <article className="gfp-page-metric gfp-page-metric-green rounded-[22px] p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="gfp-page-metric-label text-xs font-semibold">
                Completed
              </p>

              <h2 className="gfp-page-metric-value mt-3 text-3xl font-extrabold">
                {query.isLoading ? "—" : stats.completed}
              </h2>

              <p className="gfp-page-metric-description mt-2 text-xs">
                Outcomes captured
              </p>
            </div>

            <span className="gfp-page-metric-icon flex h-11 w-11 shrink-0 items-center justify-center rounded-xl">
              <CheckCircle2 size={21} />
            </span>
          </div>
        </article>

        {/* Overdue */}

        <article className="gfp-page-metric gfp-page-metric-red rounded-[22px] p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="gfp-page-metric-label text-xs font-semibold">
                Overdue
              </p>

              <h2 className="gfp-page-metric-value mt-3 text-3xl font-extrabold">
                {query.isLoading ? "—" : stats.overdue}
              </h2>

              <p className="gfp-page-metric-description mt-2 text-xs">
                Need attention
              </p>
            </div>

            <span className="gfp-page-metric-icon flex h-11 w-11 shrink-0 items-center justify-center rounded-xl">
              <AlertCircle size={21} />
            </span>
          </div>
        </article>
      </section>

      {/* ============================================================= */}
      {/* PRIORITY HIGHLIGHT */}
      {/* ============================================================= */}

      {!query.isLoading &&
        !query.isError &&
        (stats.oldestOverdue || stats.nextFollowup) && (
          <section
            className={`gfp-page-highlight flex flex-col justify-between gap-4 rounded-[22px] p-5 sm:flex-row sm:items-center ${
              stats.oldestOverdue ? "is-overdue" : ""
            }`}
          >
            <div className="flex min-w-0 items-center gap-4">
              <span className="gfp-page-highlight-icon flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl">
                {stats.oldestOverdue ? (
                  <AlertCircle size={22} />
                ) : (
                  <Clock3 size={22} />
                )}
              </span>

              <div className="min-w-0">
                <p className="gfp-page-highlight-eyebrow text-[11px] font-bold uppercase tracking-[0.12em]">
                  {stats.oldestOverdue
                    ? "OVERDUE FOLLOW-UP — ACTION REQUIRED"
                    : "NEXT UPCOMING FOLLOW-UP"}
                </p>

                <h3 className="gfp-page-title mt-1 break-words text-sm font-extrabold sm:text-base">
                  {(stats.oldestOverdue || stats.nextFollowup)
                    ?.action || "Client Follow-up"}
                </h3>

                <p className="gfp-page-muted mt-1 text-xs">
                  {(stats.oldestOverdue || stats.nextFollowup)
                    ?.companyName
                    ? `${
                        (stats.oldestOverdue || stats.nextFollowup)
                          .companyName
                      } · `
                    : ""}
                  {formatDateTime(
                    (stats.oldestOverdue || stats.nextFollowup)
                      ?.dueAt
                  )}
                </p>
              </div>
            </div>

            {(stats.oldestOverdue || stats.nextFollowup)
              ?.leadId && (
              <button
                type="button"
                className="gfp-page-secondary inline-flex shrink-0 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold"
                onClick={() =>
                  handleOpenLead(
                    (stats.oldestOverdue || stats.nextFollowup)
                      .leadId
                  )
                }
              >
                Open Lead
                <ArrowUpRight size={15} />
              </button>
            )}
          </section>
        )}

      {/* ============================================================= */}
      {/* FOLLOW-UPS TABLE */}
      {/* ============================================================= */}

      <section className="gfp-page-panel overflow-hidden rounded-[24px]">
        <div className="gfp-page-panel-header flex flex-col justify-between gap-4 px-5 py-5 sm:flex-row sm:items-center sm:px-6">
          <div className="flex items-center gap-3">
            <span className="gfp-page-section-icon flex h-11 w-11 items-center justify-center rounded-xl">
              <CalendarClock size={20} />
            </span>

            <div>
              <h2 className="gfp-page-title text-base font-extrabold">
                All Follow-ups
              </h2>

              <p className="gfp-page-muted mt-1 text-xs">
                Manage pending, completed, and overdue
                follow-ups
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="gfp-page-count inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold">
              <span className="gfp-page-count-dot h-2 w-2 rounded-full" />

              {query.isLoading
                ? "Loading"
                : `${followups.length} records`}
            </span>

            {query.isFetching && !query.isLoading && (
              <span className="gfp-page-muted inline-flex items-center gap-2 text-xs">
                <LoaderCircle
                  size={14}
                  className="animate-spin"
                />
                Updating
              </span>
            )}
          </div>
        </div>

        {query.isError ? (
          <div className="flex min-h-[280px] flex-col items-center justify-center px-5 text-center">
            <span className="gfp-page-error-icon mb-4 flex h-16 w-16 items-center justify-center rounded-2xl">
              <AlertCircle size={28} />
            </span>

            <h3 className="gfp-page-title text-base font-bold">
              Unable to load follow-ups
            </h3>

            <p className="gfp-page-muted mt-2 max-w-md text-sm leading-6">
              {query.error?.response?.data?.message ||
                "Something went wrong while loading follow-ups."}
            </p>

            <button
              type="button"
              className="gfp-page-secondary mt-5 inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold"
              onClick={handleRefresh}
              disabled={query.isFetching}
            >
              <RefreshCw
                size={16}
                className={query.isFetching ? "animate-spin" : ""}
              />
              Try Again
            </button>
          </div>
        ) : (
          <div className="gfp-page-table min-w-0">
            <FollowupsTable
              followups={followups}
              loading={query.isLoading}
              onOpenLead={handleOpenLead}
              onComplete={setCompleteItem}
              onReschedule={setRescheduleItem}
            />
          </div>
        )}

        {!query.isError && !query.isLoading && (
          <div className="gfp-page-panel-footer flex flex-wrap items-center justify-between gap-3 px-5 py-4 sm:px-6">
            <p className="gfp-page-muted text-xs">
              Showing {followups.length} recent follow-up
              {followups.length === 1 ? "" : " records"}
            </p>

            <span className="gfp-page-footer-label inline-flex items-center gap-2 text-xs font-semibold">
              <CheckCircle2 size={15} />
              Follow-up history
            </span>
          </div>
        )}
      </section>

      {/* ============================================================= */}
      {/* MODALS */}
      {/* ============================================================= */}

      <ScheduleFollowupModal
        open={scheduleOpen}
        onClose={() => {
          setScheduleOpen(false);
          query.refetch();
        }}
      />

      <CompleteFollowupModal
        open={Boolean(completeItem)}
        followup={completeItem}
        onClose={() => {
          setCompleteItem(null);
          query.refetch();
        }}
      />

      <RescheduleFollowupModal
        open={Boolean(rescheduleItem)}
        followup={rescheduleItem}
        onClose={() => {
          setRescheduleItem(null);
          query.refetch();
        }}
      />
    </div>
  );
};

export default FollowupsPage;