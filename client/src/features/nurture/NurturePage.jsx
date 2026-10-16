
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Activity,
  ArrowUpRight,
  CalendarClock,
  Clock3,
  HeartHandshake,
  Plus,
  RefreshCw,
  Search,
  Users,
  AlertCircle,
} from "lucide-react";

import { useNurtureQuery } from "./nurture.queries.js";
import NurtureTable from "./NurtureTable.jsx";
import ScheduleReconnectModal from "./ScheduleReconnectModal.jsx";

import "./nurture-glass.css";

const validDate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const NurturePage = () => {
  const navigate = useNavigate();

  const [reconnectOpen, setReconnectOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("ALL");

  const params = useMemo(
    () => ({ page: 1, limit: 100 }),
    []
  );

  const query = useNurtureQuery(params);

  const nurture = useMemo(() => {
    const data = query.data?.data;
    const records = data?.nurture || data?.items || data?.records;
    return Array.isArray(records) ? records : [];
  }, [query.data]);

  const categories = useMemo(
    () =>
      [...new Set(
        nurture.map((item) => item.categoryLabel).filter(Boolean)
      )].sort(),
    [nurture]
  );

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();

    return nurture.filter((item) => {
      if (category !== "ALL" && item.categoryLabel !== category) {
        return false;
      }

      if (!term) return true;

      return [
        item.companyName,
        item.leadCode,
        item.contactName,
        item.designation,
        item.categoryLabel,
        item.reason,
        item.industry,
        item.ownerName,
      ]
        .some((value) =>
          String(value ?? "").toLowerCase().includes(term)
        );
    });
  }, [nurture, search, category]);

  const metrics = useMemo(() => {
    const now = Date.now();
    const sevenDays = 7 * 24 * 60 * 60 * 1000;

    let upcoming = 0;
    let overdue = 0;
    let nextWeek = 0;

    nurture.forEach((item) => {
      const date = validDate(item.reconnectAt);
      if (!date) return;

      const timestamp = date.getTime();

      if (timestamp < now) {
        overdue += 1;
      } else {
        upcoming += 1;
        if (timestamp <= now + sevenDays) {
          nextWeek += 1;
        }
      }
    });

    return {
      total: nurture.length,
      upcoming,
      overdue,
      nextWeek,
    };
  }, [nurture]);

  return (
    <div className="gn-page min-w-0 space-y-6 p-4 sm:p-6 xl:p-8">
      <header className="gn-hero relative overflow-hidden rounded-3xl p-6 sm:p-8">
        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <div className="gn-hero-eyebrow mb-3 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold">
              <HeartHandshake size={14} />
              RELATIONSHIP MANAGEMENT
            </div>

            <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
              Nurture Database
            </h1>

            <p className="gn-hero-description mt-3 max-w-2xl text-sm leading-6">
              Keep later-stage, no-response and lost opportunities
              organized, segmentable and ready to reconnect.
            </p>
          </div>

          <div className="flex shrink-0 flex-wrap items-center gap-3">
            <button
              type="button"
              className="gn-hero-secondary inline-flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-bold"
              onClick={() => query.refetch()}
              disabled={query.isFetching}
            >
              <RefreshCw
                size={17}
                className={query.isFetching ? "animate-spin" : ""}
              />
              Refresh
            </button>

            <button
              type="button"
              className="gn-hero-primary inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold"
              onClick={() => setReconnectOpen(true)}
            >
              <Plus size={18} />
              Schedule Reconnect
            </button>
          </div>
        </div>

        <div className="gn-hero-decoration gn-hero-decoration-one" />
        <div className="gn-hero-decoration gn-hero-decoration-two" />
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          {
            title: "Nurture Records",
            value: metrics.total,
            icon: Users,
            tone: "blue",
            description: "Records in the current list",
          },
          {
            title: "Upcoming Reconnects",
            value: metrics.upcoming,
            icon: CalendarClock,
            tone: "violet",
            description: "Scheduled for the future",
          },
          {
            title: "Overdue Reconnects",
            value: metrics.overdue,
            icon: Clock3,
            tone: "rose",
            description: "Scheduled time has passed",
          },
          {
            title: "Next 7 Days",
            value: metrics.nextWeek,
            icon: Activity,
            tone: "green",
            description: "Reconnects due within a week",
          },
        ].map((metric) => {
          const Icon = metric.icon;

          return (
            <article
              key={metric.title}
              className={`gn-metric gn-metric-${metric.tone} rounded-2xl p-5`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="gn-muted text-xs font-semibold">
                    {metric.title}
                  </p>

                  <p className="gn-heading mt-3 text-3xl font-extrabold">
                    {query.isLoading ? "—" : metric.value}
                  </p>
                </div>

                <span className="gn-metric-icon flex h-11 w-11 items-center justify-center rounded-xl">
                  <Icon size={21} />
                </span>
              </div>

              <p className="gn-muted mt-3 text-xs">
                {metric.description}
              </p>
            </article>
          );
        })}
      </div>

      <section className="gn-panel overflow-hidden rounded-3xl">
        <div className="gn-panel-header flex flex-col gap-5 p-5 sm:p-6 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="gn-heading text-lg font-extrabold">
                Nurture Records
              </h2>

              <span className="gn-count rounded-full px-2.5 py-1 text-xs font-bold">
                {filtered.length}
              </span>
            </div>

            <p className="gn-muted mt-1 text-xs">
              Browse prospects and open their lead profiles.
            </p>
          </div>

          <div className="flex w-full flex-col gap-3 sm:flex-row xl:w-auto">
            <div className="gn-search relative min-w-0 flex-1 xl:w-64">
              <Search
                size={17}
                className="absolute left-4 top-1/2 -translate-y-1/2"
              />

              <input
                aria-label="Search nurture records"
                type="search"
                value={search}
                placeholder="Search records..."
                onChange={(event) => setSearch(event.target.value)}
                className="gn-control gn-search-input w-full rounded-xl py-3 text-sm"
              />
            </div>

            <select
              aria-label="Filter by category"
              className="gn-control rounded-xl px-4 py-3 text-sm sm:min-w-44"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
            >
              <option value="ALL">All Categories</option>

              {categories.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
        </div>

        {query.isError ? (
          <div className="gn-state p-10 text-center">
            <AlertCircle size={35} className="mx-auto mb-4" />

            <h3 className="gn-heading text-lg font-extrabold">
              Unable to load nurture records
            </h3>

            <p className="gn-muted mx-auto mt-2 max-w-md text-sm">
              {query.error?.response?.data?.message ||
                "Something went wrong while loading nurture records."}
            </p>

            <button
              type="button"
              className="gn-action mt-5 inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold"
              onClick={() => query.refetch()}
            >
              <RefreshCw size={16} />
              Try Again
            </button>
          </div>
        ) : (
          <NurtureTable
            nurture={filtered}
            loading={query.isLoading}
            onOpenLead={(leadId) => navigate(`/leads/${leadId}`)}
          />
        )}

        {!query.isLoading && !query.isError && (
          <footer className="gn-table-footer flex flex-wrap items-center justify-between gap-3 px-5 py-4 text-xs sm:px-6">
            <span>
              Showing {filtered.length} of {nurture.length} loaded records
            </span>

            <span className="inline-flex items-center gap-1">
              Open a record to view details
              <ArrowUpRight size={14} />
            </span>
          </footer>
        )}
      </section>

      <ScheduleReconnectModal
        open={reconnectOpen}
        onClose={() => {
          setReconnectOpen(false);
          query.refetch();
        }}
      />
    </div>
  );
};

export default NurturePage;