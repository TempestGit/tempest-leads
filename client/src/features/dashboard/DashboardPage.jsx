
import { Link } from "react-router-dom";

import {
  ArrowRight,
  CalendarClock,
  CalendarDays,
  CircleAlert,
  IndianRupee,
  Layers3,
  RefreshCw,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";

import { useDashboardQuery } from "./dashboard.queries.js";

const number = (value) =>
  Number(value || 0).toLocaleString("en-IN");

const money = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

const date = (value) => {
  if (!value) return "—";

  const parsed = new Date(value);

  return Number.isNaN(parsed.getTime())
    ? "—"
    : parsed.toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
      });
};

const nice = (value) =>
  String(value || "—").replaceAll("_", " ");

const initials = (value) =>
  String(value || "?")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

function KpiCard({
  title,
  value,
  hint,
  icon: Icon,
  tone = "blue",
  featured = false,
  children,
}) {
  return (
    <article
      className={[
        "glass-dash-card",
        "glass-dash-kpi",
        "relative flex min-w-0 flex-col",
        "overflow-hidden rounded-2xl p-5",
        featured ? "is-featured" : "",
      ].join(" ")}
    >
      <div className="relative z-10 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="glass-dash-label">
            {title}
          </p>

          <p className="glass-dash-value mt-3 break-words">
            {value}
          </p>
        </div>

        <div
          className="glass-dash-icon"
          data-tone={tone}
        >
          <Icon size={21} strokeWidth={1.9} />
        </div>
      </div>

      <div className="relative z-10 mt-auto pt-3">
        {hint && (
          <p className="glass-dash-hint">
            {hint}
          </p>
        )}

        {children}
      </div>
    </article>
  );
}

function Panel({
  title,
  subtitle,
  to,
  children,
  className = "",
  icon: Icon,
}) {
  return (
    <section
      className={[
        "glass-dash-card",
        "min-w-0 rounded-3xl p-5",
        className,
      ].join(" ")}
    >
      <header className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          {Icon && (
            <div className="glass-dash-panel-icon">
              <Icon size={19} />
            </div>
          )}

          <div className="min-w-0">
            <h2 className="text-base font-bold">
              {title}
            </h2>

            {subtitle && (
              <p className="glass-dash-muted mt-1 text-xs">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {to && (
          <Link
            to={to}
            className="glass-dash-link"
          >
            View all
            <ArrowRight size={15} />
          </Link>
        )}
      </header>

      {children}
    </section>
  );
}

function PipelineChart({ stages }) {
  const max = Math.max(
    1,
    ...stages.map((item) =>
      Number(item.count || 0)
    )
  );

  if (!stages.length) {
    return (
      <p className="glass-dash-muted py-8 text-center text-sm">
        No pipeline data available.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {stages.map((item, index) => {
        const count = Number(item.count || 0);
        const width = (count / max) * 100;

        return (
          <div key={item.stage}>
            <div className="mb-2 flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-2">
                <span
                  className="glass-dash-stage-dot"
                  data-tone={index % 6}
                />

                <span className="truncate text-xs font-semibold">
                  {nice(item.stage)}
                </span>
              </div>

              <span className="glass-dash-muted shrink-0 text-xs">
                {number(count)} · {money(item.value)}
              </span>
            </div>

            <div className="glass-dash-track">
              <div
                className="glass-dash-track-fill"
                data-tone={index % 6}
                style={{
                  width: `${Math.max(
                    0,
                    Math.min(100, width)
                  )}%`,
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function MonthlyChart({ monthly }) {
  const max = Math.max(
    1,
    ...monthly.map((item) =>
      Number(item.count || 0)
    )
  );

  if (!monthly.length) {
    return (
      <div className="glass-dash-muted flex h-52 items-center justify-center text-sm">
        No leads in the last six months.
      </div>
    );
  }

  return (
    <div className="glass-dash-chart">
      {monthly.map((item, index) => {
        const count = Number(item.count || 0);

        return (
          <div
            key={item.month}
            className="glass-dash-chart-column"
          >
            <span className="glass-dash-muted text-xs font-semibold">
              {number(count)}
            </span>

            <div
              className="glass-dash-chart-bar"
              data-tone={index % 3}
              style={{
                height: `${Math.max(
                  2,
                  (count / max) * 100
                )}%`,
              }}
              title={`${item.month}: ${number(
                count
              )} leads`}
            />

            <span className="glass-dash-muted text-center text-xs">
              {String(item.month).slice(5)}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function FollowupList({ items }) {
  if (!items.length) {
    return (
      <p className="glass-dash-muted py-8 text-center text-sm">
        No pending follow-ups.
      </p>
    );
  }

  return (
    <div className="glass-dash-list">
      {items.map((item) => (
        <Link
          key={item.id}
          to={`/leads/${item.leadId}`}
          className="glass-dash-list-item"
        >
          <span className="glass-dash-list-avatar">
            <CalendarClock size={17} />
          </span>

          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-semibold">
              {item.companyName || "Lead"}
            </span>

            <span className="glass-dash-muted mt-1 block truncate text-xs">
              {item.action || "Follow-up"}
            </span>
          </span>

          <span className="glass-dash-muted shrink-0 text-right text-xs">
            {date(item.dueAt)}
          </span>

          <ArrowRight
            size={15}
            className="glass-dash-muted shrink-0"
          />
        </Link>
      ))}
    </div>
  );
}

function RecentLeadsList({ items }) {
  if (!items.length) {
    return (
      <p className="glass-dash-muted py-8 text-center text-sm">
        No leads yet.
      </p>
    );
  }

  return (
    <div className="glass-dash-list">
      {items.map((item) => (
        <Link
          key={item.id}
          to={`/leads/${item.id}`}
          className="glass-dash-list-item"
        >
          <span className="glass-dash-company-avatar">
            {initials(item.companyName)}
          </span>

          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-semibold">
              {item.companyName || "Unnamed company"}
            </span>

            <span className="glass-dash-muted mt-1 block truncate text-xs">
              {item.leadCode} · {nice(item.stage)}
            </span>
          </span>

          <span className="shrink-0 text-xs font-bold">
            {money(item.value)}
          </span>

          <ArrowRight
            size={15}
            className="glass-dash-muted shrink-0"
          />
        </Link>
      ))}
    </div>
  );
}

export default function DashboardPage() {
  const {
    data,
    isPending,
    isError,
    error,
    refetch,
    isFetching,
  } = useDashboardQuery();

  if (isPending) {
    return (
      <div
        className="glass-dashboard"
        role="status"
      >
        <div className="glass-dash-card rounded-2xl p-8">
          Loading dashboard…
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="glass-dashboard">
        <div className="glass-dash-card space-y-4 rounded-2xl p-8">
          <p role="alert">
            Could not load dashboard:{" "}
            {error?.response?.data?.message ||
              error?.message ||
              "Unknown error"}
          </p>

          <button
            type="button"
            className="glass-dash-button"
            onClick={() => refetch()}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const {
    summary: s = {},
    stages = [],
    followups = {},
    meetings = {},
    recentLeads = [],
    nextFollowups = [],
    monthly = [],
  } = data || {};

  // Preserves the existing Dashboard calculation:
  // won leads divided by all leads.
  const conversion = Number(s.totalLeads)
    ? (
        (100 * Number(s.wonLeads || 0)) /
        Number(s.totalLeads)
      ).toFixed(1)
    : "0.0";

  return (
    <div className="glass-dashboard min-w-0 space-y-5">
      {/* Page Header */}

      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="glass-dash-eyebrow">
            Workspace / Overview
          </p>

          <h1 className="mt-2 flex items-center gap-2 text-2xl font-bold tracking-tight sm:text-3xl">
            Dashboard
            <Sparkles
              size={21}
              className="glass-dash-heading-icon"
            />
          </h1>

          <p className="glass-dash-muted mt-2 text-sm">
            Your pipeline performance and priority
            actions at a glance.
          </p>
        </div>

        <button
          type="button"
          className="glass-dash-button"
          disabled={isFetching}
          onClick={() => refetch()}
        >
          <RefreshCw
            size={16}
            className={
              isFetching ? "animate-spin" : ""
            }
          />
          Refresh
        </button>
      </header>

      {/* Primary Bento Cards */}

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          title="Total Leads"
          value={number(s.totalLeads)}
          hint={`${number(s.newThisMonth)} added this month`}
          icon={Users}
          tone="blue"
          featured
        />

        <KpiCard
          title="Open Opportunities"
          value={number(s.activeLeads)}
          hint="Leads currently in progress"
          icon={Layers3}
          tone="green"
        />

        <KpiCard
          title="Pipeline Value"
          value={money(s.pipelineValue)}
          hint="Estimated open pipeline"
          icon={IndianRupee}
          tone="violet"
        />

        <KpiCard
          title="Lead Conversion"
          value={`${conversion}%`}
          hint={`${number(s.wonLeads)} won · ${number(
            s.lostLeads
          )} lost`}
          icon={TrendingUp}
          tone="orange"
        >
          <div className="glass-dash-progress mt-3">
            <span
              style={{
                width: `${Math.max(
                  0,
                  Math.min(100, Number(conversion))
                )}%`,
              }}
            />
          </div>
        </KpiCard>
      </section>

      {/* Operational Metrics */}

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          title="Overdue Follow-ups"
          value={number(followups.overdue)}
          hint="Requires attention"
          icon={CircleAlert}
          tone="rose"
        />

        <KpiCard
          title="Upcoming Follow-ups"
          value={number(followups.upcoming)}
          hint="Next 7 days"
          icon={CalendarDays}
          tone="blue"
        />

        <KpiCard
          title="Upcoming Meetings"
          value={number(meetings.upcoming)}
          hint="Next 7 days"
          icon={CalendarClock}
          tone="violet"
        />

        <KpiCard
          title="Won Leads"
          value={number(s.wonLeads)}
          hint="Successfully converted"
          icon={TrendingUp}
          tone="green"
        />
      </section>

      {/* Analytics Bento */}

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-5">
        <Panel
          title="Pipeline by Stage"
          subtitle="Lead distribution and estimated value"
          to="/leads"
          icon={Layers3}
          className="xl:col-span-3"
        >
          <PipelineChart stages={stages} />
        </Panel>

        <Panel
          title="Lead Acquisition"
          subtitle="New leads by month"
          to="/leads"
          icon={TrendingUp}
          className="xl:col-span-2"
        >
          <MonthlyChart monthly={monthly} />
        </Panel>
      </div>

      {/* Activity Bento */}

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <Panel
          title="Priority Follow-ups"
          subtitle="Your upcoming and pending actions"
          to="/followups"
          icon={CalendarClock}
        >
          <FollowupList items={nextFollowups} />
        </Panel>

        <Panel
          title="Recently Created Leads"
          subtitle="Latest additions to your pipeline"
          to="/leads"
          icon={Users}
        >
          <RecentLeadsList items={recentLeads} />
        </Panel>
      </div>
    </div>
  );
}
