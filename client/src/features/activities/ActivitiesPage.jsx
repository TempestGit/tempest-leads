
import { useMemo, useState } from "react";

import { useNavigate } from "react-router-dom";

import {
  Activity,
  ArrowUpRight,
  CalendarClock,
  CheckCircle2,
  Clock3,
  History,
  LoaderCircle,
  Plus,
  RefreshCw,
  TrendingUp,
  Users,
} from "lucide-react";

import { useActivitiesQuery } from "./activities.queries.js";

import ActivityTimeline from "./ActivityTimeline.jsx";

import AddActivityModal from "./AddActivityModal.jsx";

/*
|--------------------------------------------------------------------------
| Activities Page — Glass Premium Modern Bento Grid
|--------------------------------------------------------------------------
*/

const ActivitiesPage = () => {
  const navigate = useNavigate();

  const [addOpen, setAddOpen] = useState(false);

  /*
  |--------------------------------------------------------------------------
  | Query
  |--------------------------------------------------------------------------
  */

  const params = useMemo(
    () => ({
      page: 1,
      limit: 100,
    }),
    []
  );

  const {
    data,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useActivitiesQuery(params);

  const activities = data?.data?.activities || [];

  /*
  |--------------------------------------------------------------------------
  | Activity Statistics
  |--------------------------------------------------------------------------
  */

  const stats = useMemo(() => {
    const now = new Date();

    const todayStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );

    const weekStart = new Date(todayStart);
    weekStart.setDate(weekStart.getDate() - 6);

    const monthStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      1
    );

    let today = 0;
    let thisWeek = 0;
    let thisMonth = 0;

    const uniqueLeads = new Set();

    activities.forEach((item) => {
      const dateValue =
        item.createdAt ||
        item.occurredAt ||
        item.activityAt ||
        item.date;

      if (dateValue) {
        const activityDate = new Date(dateValue);

        if (!Number.isNaN(activityDate.getTime())) {
          if (activityDate >= todayStart) {
            today += 1;
          }

          if (activityDate >= weekStart) {
            thisWeek += 1;
          }

          if (activityDate >= monthStart) {
            thisMonth += 1;
          }
        }
      }

      if (item.leadId !== null && item.leadId !== undefined) {
        uniqueLeads.add(String(item.leadId));
      }
    });

    return {
      total: activities.length,
      today,
      thisWeek,
      thisMonth,
      uniqueLeads: uniqueLeads.size,
    };
  }, [activities]);

  /*
  |--------------------------------------------------------------------------
  | Helpers
  |--------------------------------------------------------------------------
  */

  const handleOpenLead = (leadId) => {
    if (!leadId) return;

    navigate(`/leads/${leadId}`);
  };

  const handleCloseModal = () => {
    setAddOpen(false);
    refetch();
  };

  const handleRefresh = () => {
    refetch();
  };

  /*
  |--------------------------------------------------------------------------
  | Render
  |--------------------------------------------------------------------------
  */

  return (
    <div className="glass-activities workflow-page workflow-activities min-w-0 space-y-6 p-4 sm:p-6 xl:p-8">
      {/* ============================================================= */}
      {/* PAGE HEADER */}
      {/* ============================================================= */}

      <section className="gac-header relative overflow-hidden rounded-[26px] p-5 sm:p-7">
        <div className="gac-header-glow pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full" />

        <div className="relative flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
          <div className="flex min-w-0 items-start gap-4">
            <div className="gac-header-icon flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl">
              <History size={26} />
            </div>

            <div className="min-w-0">
              <div className="gac-eyebrow mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em]">
                <span className="gac-live-dot h-2 w-2 rounded-full" />
                CRM ACTIVITY TRACKING
              </div>

              <h1 className="gac-title text-2xl font-extrabold tracking-tight sm:text-3xl">
                Activity Log
              </h1>

              <p className="gac-muted mt-2 max-w-2xl text-sm leading-6">
                A chronological record of every material
                interaction, customer engagement, and workflow
                change across your CRM.
              </p>
            </div>
          </div>

          <div className="flex shrink-0 flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleRefresh}
              disabled={isFetching}
              className="gac-secondary inline-flex h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw
                size={16}
                className={isFetching ? "animate-spin" : ""}
              />

              Refresh
            </button>

            <button
              type="button"
              onClick={() => setAddOpen(true)}
              className="gac-primary inline-flex h-11 items-center justify-center gap-2 rounded-xl px-5 text-sm font-bold"
            >
              <Plus size={18} />
              Add Activity
            </button>
          </div>
        </div>
      </section>

      {/* ============================================================= */}
      {/* ACTIVITY METRICS */}
      {/* ============================================================= */}

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {/* Total Activities */}

        <article className="gac-metric gac-metric-primary relative overflow-hidden rounded-[22px] p-5">
          <div className="relative flex items-start justify-between gap-3">
            <div>
              <p className="gac-metric-label text-xs font-semibold">
                Total Activities
              </p>

              <h2 className="gac-metric-value mt-3 text-3xl font-extrabold tracking-tight">
                {isLoading ? "—" : stats.total}
              </h2>

              <p className="gac-metric-description mt-2 text-xs">
                Recent activity records
              </p>
            </div>

            <span className="gac-metric-icon flex h-11 w-11 shrink-0 items-center justify-center rounded-xl">
              <Activity size={21} />
            </span>
          </div>

          <div className="gac-metric-decoration pointer-events-none absolute -bottom-12 -right-10 h-32 w-32 rounded-full" />
        </article>

        {/* Today */}

        <article className="gac-metric gac-metric-green rounded-[22px] p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="gac-metric-label text-xs font-semibold">
                Today's Activities
              </p>

              <h2 className="gac-metric-value mt-3 text-3xl font-extrabold tracking-tight">
                {isLoading ? "—" : stats.today}
              </h2>

              <p className="gac-metric-description mt-2 text-xs">
                Recorded today
              </p>
            </div>

            <span className="gac-metric-icon flex h-11 w-11 shrink-0 items-center justify-center rounded-xl">
              <Clock3 size={21} />
            </span>
          </div>
        </article>

        {/* Last 7 Days */}

        <article className="gac-metric gac-metric-violet rounded-[22px] p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="gac-metric-label text-xs font-semibold">
                Last 7 Days
              </p>

              <h2 className="gac-metric-value mt-3 text-3xl font-extrabold tracking-tight">
                {isLoading ? "—" : stats.thisWeek}
              </h2>

              <p className="gac-metric-description mt-2 text-xs">
                Recent weekly engagement
              </p>
            </div>

            <span className="gac-metric-icon flex h-11 w-11 shrink-0 items-center justify-center rounded-xl">
              <TrendingUp size={21} />
            </span>
          </div>
        </article>

        {/* This Month */}

        <article className="gac-metric gac-metric-orange rounded-[22px] p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="gac-metric-label text-xs font-semibold">
                This Month
              </p>

              <h2 className="gac-metric-value mt-3 text-3xl font-extrabold tracking-tight">
                {isLoading ? "—" : stats.thisMonth}
              </h2>

              <p className="gac-metric-description mt-2 text-xs">
                Current month activity
              </p>
            </div>

            <span className="gac-metric-icon flex h-11 w-11 shrink-0 items-center justify-center rounded-xl">
              <CalendarClock size={21} />
            </span>
          </div>
        </article>
      </section>

      {/* ============================================================= */}
      {/* TIMELINE PANEL */}
      {/* ============================================================= */}

      <section className="gac-panel overflow-hidden rounded-[24px]">
        {/* Timeline header */}

        <div className="gac-panel-header flex flex-col justify-between gap-4 px-5 py-5 sm:flex-row sm:items-center sm:px-6">
          <div className="flex items-center gap-3">
            <span className="gac-section-icon flex h-11 w-11 items-center justify-center rounded-xl">
              <History size={20} />
            </span>

            <div>
              <h2 className="gac-title text-base font-extrabold">
                Activity Timeline
              </h2>

              <p className="gac-muted mt-1 text-xs">
                Latest interactions and workflow updates
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span className="gac-count inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold">
              <span className="gac-count-dot h-2 w-2 rounded-full" />
              {isLoading ? "Loading" : `${activities.length} records`}
            </span>

            {isFetching && !isLoading && (
              <span className="gac-muted inline-flex items-center gap-2 text-xs">
                <LoaderCircle
                  size={14}
                  className="animate-spin"
                />
                Updating
              </span>
            )}
          </div>
        </div>

        {/* Timeline content */}

        <div className="gac-timeline-content min-w-0 p-4 sm:p-6">
          {isError ? (
            <div className="flex min-h-[280px] flex-col items-center justify-center px-4 text-center">
              <span className="gac-error-icon mb-4 flex h-16 w-16 items-center justify-center rounded-2xl">
                <Activity size={27} />
              </span>

              <h3 className="gac-title text-base font-bold">
                Unable to load activities
              </h3>

              <p className="gac-muted mt-2 max-w-md text-sm leading-6">
                {error?.response?.data?.message ||
                  "Something went wrong while loading activities."}
              </p>

              <button
                type="button"
                onClick={handleRefresh}
                disabled={isFetching}
                className="gac-secondary mt-5 inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold"
              >
                <RefreshCw
                  size={16}
                  className={isFetching ? "animate-spin" : ""}
                />
                Try Again
              </button>
            </div>
          ) : (
            <ActivityTimeline
              activities={activities}
              loading={isLoading}
              showContext
              onLeadClick={handleOpenLead}
            />
          )}
        </div>

        {/* Timeline footer */}

        {!isError && !isLoading && (
          <div className="gac-panel-footer flex flex-wrap items-center justify-between gap-3 px-5 py-4 sm:px-6">
            <p className="gac-muted text-xs">
              Showing {activities.length} recent activity
              {activities.length === 1 ? "" : " records"}
            </p>

            <span className="gac-footer-label inline-flex items-center gap-2 text-xs font-semibold">
              <CheckCircle2 size={15} />
              Activity history
            </span>
          </div>
        )}
      </section>

      {/* ============================================================= */}
      {/* ADD ACTIVITY MODAL */}
      {/* ============================================================= */}

      <AddActivityModal
        open={addOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
};

export default ActivitiesPage;