
import { useMemo, useState } from "react";
import {
  CalendarClock,
  CalendarDays,
  CheckCircle2,
  Clock3,
  LoaderCircle,
  Plus,
  RefreshCw,
  Video,
} from "lucide-react";

import { useMeetingsQuery } from "./meetings.queries.js";
import MeetingsTable from "./MeetingsTable.jsx";
import ScheduleMeetingModal from "./ScheduleMeetingModal.jsx";
import CompleteMeetingModal from "./CompleteMeetingModal.jsx";
import RescheduleMeetingModal from "./RescheduleMeetingModal.jsx";
import MeetingStatusModal from "./MeetingStatusModal.jsx";

const normalizeStatus = (status) =>
  String(status ?? "").trim().toUpperCase().replace(/[\s-]+/g, "_");

function MeetingMetric({ label, value, icon: Icon, tone = "blue" }) {
  return (
    <article className={`gmp-metric gmp-metric-${tone} rounded-[20px] p-4 sm:p-5`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="gmp-metric-label text-xs font-semibold">{label}</p>
          <p className="gmp-metric-value mt-3 text-2xl font-extrabold">
            {value}
          </p>
        </div>
        <span className="gmp-metric-icon flex h-11 w-11 items-center justify-center rounded-xl">
          <Icon size={20} />
        </span>
      </div>
    </article>
  );
}

const LeadMeetingsPanel = ({ lead }) => {
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [completeMeeting, setCompleteMeeting] = useState(null);
  const [rescheduleMeeting, setRescheduleMeeting] = useState(null);
  const [statusMeeting, setStatusMeeting] = useState(null);
  const [statusAction, setStatusAction] = useState(null);

  const params = useMemo(
    () => ({
      leadId: Number(lead.id),
      page: 1,
      limit: 100,
    }),
    [lead.id]
  );

  const query = useMeetingsQuery(params);
  const meetings = query.data?.data?.meetings || [];

  const stats = useMemo(() => {
    const now = Date.now();

    const completed = meetings.filter(
      (meeting) => normalizeStatus(meeting.status) === "COMPLETED"
    ).length;

    const upcoming = meetings.filter((meeting) => {
      const status = normalizeStatus(meeting.status);
      const start = new Date(meeting.startsAt).getTime();

      return (
        Number.isFinite(start) &&
        start > now &&
        !["COMPLETED", "CANCELLED", "CANCELED", "NO_SHOW"].includes(status)
      );
    }).length;

    const video = meetings.filter(
      (meeting) => meeting.meetingType === "VIDEO_CALL"
    ).length;

    return {
      total: meetings.length,
      completed,
      upcoming,
      video,
    };
  }, [meetings]);

  const openStatus = (meeting, action) => {
    setStatusMeeting(meeting);
    setStatusAction(action);
  };

  const closeStatus = () => {
    setStatusMeeting(null);
    setStatusAction(null);
    query.refetch();
  };

  const closeSchedule = () => {
    setScheduleOpen(false);
    query.refetch();
  };

  const closeComplete = () => {
    setCompleteMeeting(null);
    query.refetch();
  };

  const closeReschedule = () => {
    setRescheduleMeeting(null);
    query.refetch();
  };

  return (
    <>
      <section className="glass-meetings space-y-5">
        <header className="gmp-panel rounded-[24px] p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <span className="gmp-header-icon flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl">
                <CalendarDays size={23} />
              </span>

              <div>
                <p className="gmp-eyebrow mb-1 text-[10px] font-bold uppercase tracking-[0.15em]">
                  Lead Engagement
                </p>
                <h2 className="gmp-heading text-xl font-extrabold tracking-tight">
                  Meetings
                </h2>
                <p className="gmp-muted mt-1 text-sm leading-6">
                  Discovery calls and client conversations linked to this lead.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => query.refetch()}
                disabled={query.isFetching}
                aria-label="Refresh meetings"
                className="gmp-secondary flex h-11 w-11 items-center justify-center rounded-xl"
              >
                <RefreshCw
                  size={17}
                  className={query.isFetching ? "animate-spin" : ""}
                />
              </button>

              <button
                type="button"
                onClick={() => setScheduleOpen(true)}
                className="gmp-primary inline-flex min-h-11 items-center gap-2 rounded-xl px-4 text-sm font-bold"
              >
                <Plus size={17} />
                Schedule Meeting
              </button>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <MeetingMetric
            label="Total Meetings"
            value={stats.total}
            icon={CalendarDays}
            tone="blue"
          />
          <MeetingMetric
            label="Upcoming"
            value={stats.upcoming}
            icon={CalendarClock}
            tone="violet"
          />
          <MeetingMetric
            label="Completed"
            value={stats.completed}
            icon={CheckCircle2}
            tone="green"
          />
          <MeetingMetric
            label="Video Calls"
            value={stats.video}
            icon={Video}
            tone="orange"
          />
        </div>

        <article className="gmp-panel overflow-hidden rounded-[24px]">
          <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-5 sm:px-6">
            <div className="flex items-center gap-3">
              <span className="gmp-section-icon flex h-10 w-10 items-center justify-center rounded-xl">
                <Clock3 size={19} />
              </span>
              <div>
                <h3 className="gmp-heading text-base font-bold">
                  Meeting History
                </h3>
                <p className="gmp-muted mt-1 text-xs">
                  {meetings.length} loaded meeting records
                </p>
              </div>
            </div>

            {query.isFetching && (
              <span className="gmp-muted inline-flex items-center gap-2 text-xs">
                <LoaderCircle size={14} className="animate-spin" />
                Refreshing
              </span>
            )}
          </div>

          {query.isError ? (
            <div role="alert" className="px-5 py-12 text-center">
              <h3 className="gmp-heading font-bold">
                Unable to load meetings
              </h3>
              <p className="gmp-muted mt-2 text-sm">
                {query.error?.response?.data?.message ||
                  "Something went wrong while loading meetings."}
              </p>
              <button
                type="button"
                onClick={() => query.refetch()}
                className="gmp-primary mt-5 rounded-xl px-5 py-2.5 text-sm font-bold"
              >
                Try Again
              </button>
            </div>
          ) : (
            <div className="gmp-table-wrap overflow-x-auto">
              <MeetingsTable
                meetings={meetings}
                loading={query.isLoading}
                onComplete={setCompleteMeeting}
                onReschedule={setRescheduleMeeting}
                onCancel={(meeting) => openStatus(meeting, "CANCEL")}
                onNoShow={(meeting) => openStatus(meeting, "NO_SHOW")}
              />
            </div>
          )}

          <footer className="gmp-footer px-5 py-3 text-xs sm:px-6">
            Showing up to 100 meetings linked to this lead.
          </footer>
        </article>
      </section>

      <ScheduleMeetingModal
        open={scheduleOpen}
        lead={lead}
        onClose={closeSchedule}
      />

      <CompleteMeetingModal
        open={Boolean(completeMeeting)}
        meeting={completeMeeting}
        onClose={closeComplete}
      />

      <RescheduleMeetingModal
        open={Boolean(rescheduleMeeting)}
        meeting={rescheduleMeeting}
        onClose={closeReschedule}
      />

      <MeetingStatusModal
        open={Boolean(statusMeeting)}
        meeting={statusMeeting}
        action={statusAction}
        onClose={closeStatus}
      />
    </>
  );
};

export default LeadMeetingsPanel;