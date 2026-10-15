
import { useMemo, useState } from "react";

import {
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import {
  CalendarDays,
  CalendarClock,
  CheckCircle2,
  Clock3,
  Filter,
  LoaderCircle,
  Plus,
  RefreshCw,
  Users,
  Video,
  X,
} from "lucide-react";

import { useMeetingsQuery } from "./meetings.queries.js";

import ScheduleMeetingModal from "./ScheduleMeetingModal.jsx";
import CompleteMeetingModal from "./CompleteMeetingModal.jsx";
import RescheduleMeetingModal from "./RescheduleMeetingModal.jsx";
import MeetingStatusModal from "./MeetingStatusModal.jsx";
import MeetingsTable from "./MeetingsTable.jsx";

import "./meetings-page-glass.css";

/*
|--------------------------------------------------------------------------
| Date Helpers
|--------------------------------------------------------------------------
*/

const getMeetingDate = (meeting) => {
  const value = meeting.startsAt;

  if (!value) return null;

  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? null : date;
};

const formatMeetingDate = (value) => {
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

const normalizeStatus = (value) =>
  String(value || "").trim().toUpperCase();

/*
|--------------------------------------------------------------------------
| Meetings Page
|--------------------------------------------------------------------------
*/

const MeetingsPage = () => {
  const navigate = useNavigate();

  const [searchParams, setSearchParams] = useSearchParams();

  const leadIdFromUrl = searchParams.get("leadId");

  /*
  |--------------------------------------------------------------------------
  | Modal State
  |--------------------------------------------------------------------------
  */

  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [completeMeeting, setCompleteMeeting] = useState(null);
  const [rescheduleMeeting, setRescheduleMeeting] = useState(null);
  const [statusMeeting, setStatusMeeting] = useState(null);
  const [statusAction, setStatusAction] = useState(null);

  /*
  |--------------------------------------------------------------------------
  | Query
  |--------------------------------------------------------------------------
  */

  const params = useMemo(
    () => ({
      ...(leadIdFromUrl
        ? { leadId: Number(leadIdFromUrl) }
        : {}),
      page: 1,
      limit: 100,
    }),
    [leadIdFromUrl]
  );

  const query = useMeetingsQuery(params);

  const meetings = query.data?.data?.meetings || [];

  /*
  |--------------------------------------------------------------------------
  | Statistics
  |--------------------------------------------------------------------------
  */

  const stats = useMemo(() => {
    const now = Date.now();

    let upcoming = 0;
    let completed = 0;
    let cancelled = 0;
    let videoCalls = 0;

    const upcomingMeetings = [];

    meetings.forEach((meeting) => {
      const status = normalizeStatus(meeting.status);
      const startDate = getMeetingDate(meeting);

      if (status === "COMPLETED") {
        completed += 1;
      }

      if (
        status === "CANCELLED" ||
        status === "CANCELED"
      ) {
        cancelled += 1;
      }

      if (meeting.meetingType === "VIDEO_CALL") {
        videoCalls += 1;
      }

      if (
        startDate &&
        startDate.getTime() >= now &&
        (status === "SCHEDULED" ||
          status === "RESCHEDULED")
      ) {
        upcoming += 1;
        upcomingMeetings.push(meeting);
      }
    });

    upcomingMeetings.sort((a, b) => {
      return (
        getMeetingDate(a).getTime() -
        getMeetingDate(b).getTime()
      );
    });

    return {
      total: meetings.length,
      upcoming,
      completed,
      cancelled,
      videoCalls,
      nextMeeting: upcomingMeetings[0] || null,
    };
  }, [meetings]);

  /*
  |--------------------------------------------------------------------------
  | Modal Helpers
  |--------------------------------------------------------------------------
  */

  const openStatusModal = (meeting, action) => {
    setStatusMeeting(meeting);
    setStatusAction(action);
  };

  const closeStatusModal = () => {
    setStatusMeeting(null);
    setStatusAction(null);
    query.refetch();
  };

  const handleRefresh = () => {
    query.refetch();
  };

  const clearLeadFilter = () => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete("leadId");
    setSearchParams(nextParams);
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
    <div className="gmp-page workflow-page workflow-meetings min-w-0 space-y-6 p-4 sm:p-6 xl:p-8">
      {/* ============================================================= */}
      {/* PAGE HEADER */}
      {/* ============================================================= */}

      <section className="gmp-page-header relative overflow-hidden rounded-[26px] p-5 sm:p-7">
        <div className="gmp-page-header-glow pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full" />

        <div className="relative flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
          <div className="flex min-w-0 items-start gap-4">
            <span className="gmp-page-header-icon flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl">
              <CalendarDays size={26} />
            </span>

            <div className="min-w-0">
              <p className="gmp-page-eyebrow mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em]">
                <span className="gmp-page-live-dot h-2 w-2 rounded-full" />
                CLIENT MEETING MANAGEMENT
              </p>

              <h1 className="gmp-page-title text-2xl font-extrabold tracking-tight sm:text-3xl">
                Meetings
              </h1>

              <p className="gmp-page-muted mt-2 max-w-2xl text-sm leading-6">
                Schedule, manage, and preserve every discovery
                meeting, client conversation, and important
                follow-up.
              </p>
            </div>
          </div>

          <div className="flex shrink-0 flex-wrap items-center gap-3">
            <button
              type="button"
              className="gmp-page-secondary inline-flex h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm font-bold"
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
              className="gmp-page-primary inline-flex h-11 items-center justify-center gap-2 rounded-xl px-5 text-sm font-bold"
              onClick={() => setScheduleOpen(true)}
            >
              <Plus size={18} />
              Schedule Meeting
            </button>
          </div>
        </div>
      </section>

      {/* ============================================================= */}
      {/* LEAD FILTER */}
      {/* ============================================================= */}

      {leadIdFromUrl && (
        <section className="gmp-page-filter flex flex-wrap items-center justify-between gap-3 rounded-2xl px-5 py-4">
          <div className="flex items-center gap-3">
            <span className="gmp-page-filter-icon flex h-10 w-10 items-center justify-center rounded-xl">
              <Filter size={18} />
            </span>

            <div>
              <p className="gmp-page-filter-title text-xs font-bold">
                Lead Filter Active
              </p>

              <p className="gmp-page-muted mt-1 text-xs">
                Showing meetings for Lead #{leadIdFromUrl}
              </p>
            </div>
          </div>

          <button
            type="button"
            className="gmp-page-filter-clear inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold"
            onClick={clearLeadFilter}
          >
            <X size={14} />
            Clear Filter
          </button>
        </section>
      )}

      {/* ============================================================= */}
      {/* METRIC CARDS */}
      {/* ============================================================= */}

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {/* Total */}

        <article className="gmp-page-metric gmp-page-metric-primary relative overflow-hidden rounded-[22px] p-5">
          <div className="relative flex items-start justify-between gap-3">
            <div>
              <p className="gmp-page-metric-label text-xs font-semibold">
                Total Meetings
              </p>

              <h2 className="gmp-page-metric-value mt-3 text-3xl font-extrabold">
                {query.isLoading ? "—" : stats.total}
              </h2>

              <p className="gmp-page-metric-description mt-2 text-xs">
                Recent meeting records
              </p>
            </div>

            <span className="gmp-page-metric-icon flex h-11 w-11 shrink-0 items-center justify-center rounded-xl">
              <CalendarDays size={21} />
            </span>
          </div>

          <div className="gmp-page-metric-decoration pointer-events-none absolute -bottom-12 -right-10 h-32 w-32 rounded-full" />
        </article>

        {/* Upcoming */}

        <article className="gmp-page-metric gmp-page-metric-violet rounded-[22px] p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="gmp-page-metric-label text-xs font-semibold">
                Upcoming
              </p>

              <h2 className="gmp-page-metric-value mt-3 text-3xl font-extrabold">
                {query.isLoading ? "—" : stats.upcoming}
              </h2>

              <p className="gmp-page-metric-description mt-2 text-xs">
                Scheduled for the future
              </p>
            </div>

            <span className="gmp-page-metric-icon flex h-11 w-11 shrink-0 items-center justify-center rounded-xl">
              <CalendarClock size={21} />
            </span>
          </div>
        </article>

        {/* Completed */}

        <article className="gmp-page-metric gmp-page-metric-green rounded-[22px] p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="gmp-page-metric-label text-xs font-semibold">
                Completed
              </p>

              <h2 className="gmp-page-metric-value mt-3 text-3xl font-extrabold">
                {query.isLoading ? "—" : stats.completed}
              </h2>

              <p className="gmp-page-metric-description mt-2 text-xs">
                Successfully concluded
              </p>
            </div>

            <span className="gmp-page-metric-icon flex h-11 w-11 shrink-0 items-center justify-center rounded-xl">
              <CheckCircle2 size={21} />
            </span>
          </div>
        </article>

        {/* Video Calls */}

        <article className="gmp-page-metric gmp-page-metric-orange rounded-[22px] p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="gmp-page-metric-label text-xs font-semibold">
                Video Calls
              </p>

              <h2 className="gmp-page-metric-value mt-3 text-3xl font-extrabold">
                {query.isLoading ? "—" : stats.videoCalls}
              </h2>

              <p className="gmp-page-metric-description mt-2 text-xs">
                Virtual client meetings
              </p>
            </div>

            <span className="gmp-page-metric-icon flex h-11 w-11 shrink-0 items-center justify-center rounded-xl">
              <Video size={21} />
            </span>
          </div>
        </article>
      </section>

      {/* ============================================================= */}
      {/* NEXT UPCOMING MEETING */}
      {/* ============================================================= */}

      {!query.isLoading &&
        !query.isError &&
        stats.nextMeeting && (
          <section className="gmp-page-next flex flex-col justify-between gap-4 rounded-[22px] p-5 sm:flex-row sm:items-center">
            <div className="flex min-w-0 items-center gap-4">
              <span className="gmp-page-next-icon flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl">
                <Clock3 size={22} />
              </span>

              <div className="min-w-0">
                <p className="gmp-page-next-eyebrow text-[11px] font-bold uppercase tracking-[0.12em]">
                  NEXT UPCOMING MEETING
                </p>

                <h3 className="gmp-page-title mt-1 truncate text-sm font-extrabold sm:text-base">
                  {stats.nextMeeting.title || "Client Meeting"}
                </h3>

                <p className="gmp-page-muted mt-1 text-xs">
                  {stats.nextMeeting.companyName
                    ? `${stats.nextMeeting.companyName} · `
                    : ""}
                  {formatMeetingDate(stats.nextMeeting.startsAt)}
                </p>
              </div>
            </div>

            {stats.nextMeeting.leadId && (
              <button
                type="button"
                className="gmp-page-secondary inline-flex shrink-0 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold"
                onClick={() =>
                  handleOpenLead(stats.nextMeeting.leadId)
                }
              >
                <Users size={15} />
                Open Lead
              </button>
            )}
          </section>
        )}

      {/* ============================================================= */}
      {/* MEETINGS TABLE */}
      {/* ============================================================= */}

      <section className="gmp-page-panel overflow-hidden rounded-[24px]">
        <div className="gmp-page-panel-header flex flex-col justify-between gap-4 px-5 py-5 sm:flex-row sm:items-center sm:px-6">
          <div className="flex items-center gap-3">
            <span className="gmp-page-section-icon flex h-11 w-11 items-center justify-center rounded-xl">
              <CalendarDays size={20} />
            </span>

            <div>
              <h2 className="gmp-page-title text-base font-extrabold">
                All Meetings
              </h2>

              <p className="gmp-page-muted mt-1 text-xs">
                Manage scheduled, completed, and rescheduled
                meetings
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="gmp-page-count inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold">
              <span className="gmp-page-count-dot h-2 w-2 rounded-full" />

              {query.isLoading
                ? "Loading"
                : `${meetings.length} records`}
            </span>

            {query.isFetching && !query.isLoading && (
              <span className="gmp-page-muted inline-flex items-center gap-2 text-xs">
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
            <span className="gmp-page-error-icon mb-4 flex h-16 w-16 items-center justify-center rounded-2xl">
              <CalendarDays size={28} />
            </span>

            <h3 className="gmp-page-title text-base font-bold">
              Unable to load meetings
            </h3>

            <p className="gmp-page-muted mt-2 max-w-md text-sm leading-6">
              {query.error?.response?.data?.message ||
                "Something went wrong while loading meetings."}
            </p>

            <button
              type="button"
              className="gmp-page-secondary mt-5 inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold"
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
          <div className="gmp-page-table min-w-0">
            <MeetingsTable
              meetings={meetings}
              loading={query.isLoading}
              onOpenLead={handleOpenLead}
              onComplete={(meeting) =>
                setCompleteMeeting(meeting)
              }
              onReschedule={(meeting) =>
                setRescheduleMeeting(meeting)
              }
              onCancel={(meeting) =>
                openStatusModal(meeting, "CANCEL")
              }
              onNoShow={(meeting) =>
                openStatusModal(meeting, "NO_SHOW")
              }
            />
          </div>
        )}

        {!query.isError && !query.isLoading && (
          <div className="gmp-page-panel-footer flex flex-wrap items-center justify-between gap-3 px-5 py-4 sm:px-6">
            <p className="gmp-page-muted text-xs">
              Showing {meetings.length} recent meeting
              {meetings.length === 1 ? "" : " records"}
            </p>

            <span className="gmp-page-footer-label inline-flex items-center gap-2 text-xs font-semibold">
              <CheckCircle2 size={15} />
              Meeting history
            </span>
          </div>
        )}
      </section>

      {/* ============================================================= */}
      {/* MODALS */}
      {/* ============================================================= */}

      <ScheduleMeetingModal
        open={scheduleOpen}
        onClose={() => {
          setScheduleOpen(false);
          query.refetch();
        }}
      />

      <CompleteMeetingModal
        open={Boolean(completeMeeting)}
        meeting={completeMeeting}
        onClose={() => {
          setCompleteMeeting(null);
          query.refetch();
        }}
      />

      <RescheduleMeetingModal
        open={Boolean(rescheduleMeeting)}
        meeting={rescheduleMeeting}
        onClose={() => {
          setRescheduleMeeting(null);
          query.refetch();
        }}
      />

      <MeetingStatusModal
        open={Boolean(statusMeeting)}
        meeting={statusMeeting}
        action={statusAction}
        onClose={closeStatusModal}
      />
    </div>
  );
};

export default MeetingsPage;