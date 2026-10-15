
import { useEffect, useMemo, useState } from "react";
import {
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import {
  ArrowRight,
  ArrowUpRight,
  Building2,
  CalendarClock,
  Check,
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  Download,
  Filter,
  GripVertical,
  IndianRupee,
  KanbanSquare,
  Layers3,
  LayoutGrid,
  List,
  Plus,
  RefreshCw,
  Search,
  SlidersHorizontal,
  Sparkles,
  TrendingUp,
  UserRound,
  Users,
  X,
} from "lucide-react";

import useAuth from "../auth/useAuth.js";
import { useLeadsQuery } from "./leads.queries.js";
import { LEAD_STAGES } from "./leads.schema.js";

import LeadFormModal from "./LeadFormModal.jsx";
import AssignOwnerModal from "./AssignOwnerModal.jsx";
import ChangeStageModal from "./ChangeStageModal.jsx";

const VIEW_KEY = "tempest-leads-view";
const PAGE_SIZE = 20;

const readSavedView = () => {
  try {
    return localStorage.getItem(VIEW_KEY) === "kanban"
      ? "kanban"
      : "table";
  } catch {
    return "table";
  }
};

const formatDate = (value) => {
  if (!value) return "—";

  const parsed = new Date(value);

  return Number.isNaN(parsed.getTime())
    ? "—"
    : parsed.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
};

const formatTime = (value) => {
  if (!value) return "";

  const parsed = new Date(value);

  return Number.isNaN(parsed.getTime())
    ? ""
    : parsed.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
};

const money = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

const compactMoney = (value) => {
  const amount = Number(value || 0);

  if (Math.abs(amount) >= 10000000) {
    return `₹${(amount / 10000000).toFixed(2)}Cr`;
  }

  if (Math.abs(amount) >= 100000) {
    return `₹${(amount / 100000).toFixed(2)}L`;
  }

  if (Math.abs(amount) >= 1000) {
    return `₹${(amount / 1000).toFixed(1)}K`;
  }

  return money(amount);
};

const csvValue = (value) =>
  `"${String(value ?? "").replaceAll('"', '""')}"`;

const getInitials = (value) =>
  String(value || "?")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

const getPriority = (priority) =>
  String(priority || "").trim().toLowerCase();

const getStageTone = (stage) => {
  const tones = {
    New: "blue",
    "Contact Research": "violet",
    Connected: "cyan",
    Meeting: "amber",
    Brief: "pink",
    Pitch: "indigo",
    Commercials: "orange",
    "Contract / PO": "purple",
    Onboarding: "teal",
    "Active Client": "green",
    Lost: "rose",
    Nurture: "slate",
  };

  return tones[stage] || "blue";
};

const getLeadValue = (lead) =>
  Number(
    lead?.estimatedValue ??
      lead?.dealValue ??
      lead?.value ??
      0
  ) || 0;

const getLeadDate = (lead) =>
  lead?.createdAt || lead?.created_at || null;

function MetricCard({
  label,
  value,
  subtitle,
  icon: Icon,
  tone = "blue",
  featured = false,
  children,
}) {
  return (
    <article
      className={[
        "glass-leads-metric",
        "relative flex min-h-[170px] min-w-0",
        "flex-col overflow-hidden rounded-3xl p-5",
        featured ? "is-featured" : "",
      ].join(" ")}
    >
      <div className="relative z-10 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="glass-leads-metric-label">
            {label}
          </p>

          <h2 className="glass-leads-metric-value mt-3 break-words">
            {value}
          </h2>
        </div>

        <div
          className="glass-leads-metric-icon"
          data-tone={tone}
        >
          <Icon size={22} strokeWidth={1.8} />
        </div>
      </div>

      <div className="relative z-10 mt-auto pt-4">
        <p className="glass-leads-metric-subtitle">
          {subtitle}
        </p>

        {children}
      </div>
    </article>
  );
}

function StageBadge({ stage }) {
  return (
    <span
      className="glass-leads-stage"
      data-tone={getStageTone(stage)}
    >
      <span className="glass-leads-stage-dot" />
      {stage || "—"}
    </span>
  );
}

function PriorityBadge({ priority }) {
  return (
    <span
      className="glass-leads-priority"
      data-priority={getPriority(priority)}
    >
      {priority || "—"}
    </span>
  );
}

function EmptyState({ onAdd, filtered }) {
  return (
    <div className="flex flex-col items-center px-6 py-16 text-center">
      <div className="glass-leads-empty-icon">
        <Layers3 size={25} />
      </div>

      <h3 className="mt-5 text-base font-bold">
        {filtered
          ? "No matching leads"
          : "Your pipeline is ready"}
      </h3>

      <p className="glass-leads-muted mt-2 max-w-sm text-sm">
        {filtered
          ? "Try adjusting your search or filters."
          : "Add your first lead to start building your pipeline."}
      </p>

      {!filtered && (
        <button
          type="button"
          className="glass-leads-primary mt-5"
          onClick={onAdd}
        >
          <Plus size={16} />
          Add Lead
        </button>
      )}
    </div>
  );
}

function LeadsTable({
  leads,
  selected,
  toggleLead,
  allSelected,
  toggleAll,
  onOpen,
  onAdd,
  filtered,
}) {
  return (
    <div className="w-full min-w-0">
      <div className="w-full overflow-x-auto">
        <table className="glass-leads-table w-full">
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  aria-label="Select all visible leads"
                  checked={allSelected}
                  onChange={(event) =>
                    toggleAll(event.target.checked)
                  }
                />
              </th>

              <th>Lead ID</th>
              <th>Company / Contact</th>
              <th>Industry</th>
              <th>Source</th>
              <th>Owner</th>
              <th>Pipeline Stage</th>
              <th>Priority</th>
              <th>Last Touch</th>
              <th>Next Action</th>
              <th>Follow-up</th>
              <th />
            </tr>
          </thead>

          <tbody>
            {leads.map((lead) => (
              <tr
                key={lead.id}
                tabIndex={0}
                onClick={() => onOpen(lead.id)}
                onKeyDown={(event) => {
                  if (
                    event.target === event.currentTarget &&
                    (event.key === "Enter" ||
                      event.key === " ")
                  ) {
                    event.preventDefault();
                    onOpen(lead.id);
                  }
                }}
              >
                <td>
                  <input
                    type="checkbox"
                    aria-label={`Select ${
                      lead.companyName || lead.leadCode
                    }`}
                    checked={selected.includes(lead.id)}
                    onClick={(event) =>
                      event.stopPropagation()
                    }
                    onChange={() => toggleLead(lead.id)}
                  />
                </td>

                <td>
                  <span className="glass-leads-code">
                    {lead.leadCode || `#${lead.id}`}
                  </span>

                  <span className="glass-leads-cell-sub">
                    {lead.status || "—"}
                  </span>
                </td>

                <td>
                  <div className="flex items-center gap-3">
                    <span className="glass-leads-company-avatar">
                      {getInitials(lead.companyName)}
                    </span>

                    <div className="min-w-0">
                      <p className="glass-leads-cell-title">
                        {lead.companyName ||
                          "Unnamed company"}
                      </p>

                      <span className="glass-leads-cell-sub">
                        {lead.primaryContactName ||
                          "No primary contact"}
                      </span>
                    </div>
                  </div>
                </td>

                <td>{lead.industry || "—"}</td>
                <td>{lead.source || "—"}</td>

                <td>
                  <div className="flex items-center gap-2">
                    <span className="glass-leads-avatar">
                      {getInitials(lead.ownerName)}
                    </span>

                    <span className="max-w-[130px] truncate">
                      {lead.ownerName || "Unassigned"}
                    </span>
                  </div>
                </td>

                <td>
                  <StageBadge stage={lead.stage} />
                </td>

                <td>
                  <PriorityBadge priority={lead.priority} />
                </td>

                <td>
                  {formatDate(lead.lastTouchAt)}
                </td>

                <td>
                  <span className="glass-leads-next-action">
                    {lead.nextAction || "—"}
                  </span>
                </td>

                <td>
                  <span className="block whitespace-nowrap">
                    {formatDate(lead.followUpAt)}
                  </span>

                  <span className="glass-leads-cell-sub">
                    {formatTime(lead.followUpAt)}
                  </span>
                </td>

                <td>
                  <ArrowRight
                    size={16}
                    className="glass-leads-row-arrow"
                  />
                </td>
              </tr>
            ))}

            {!leads.length && (
              <tr>
                <td colSpan={12}>
                  <EmptyState
                    onAdd={onAdd}
                    filtered={filtered}
                  />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function KanbanCard({
  lead,
  onOpen,
  onDragStart,
  onDragEnd,
  dragging,
}) {
  return (
    <article
      draggable
      tabIndex={0}
      role="button"
      aria-label={`Open ${lead.companyName || "lead"}`}
      onDragStart={(event) => {
        event.dataTransfer.effectAllowed = "move";
        event.dataTransfer.setData(
          "text/plain",
          String(lead.id)
        );
        onDragStart(lead);
      }}
      onDragEnd={onDragEnd}
      onClick={() => onOpen(lead.id)}
      onKeyDown={(event) => {
        if (
          event.key === "Enter" ||
          event.key === " "
        ) {
          event.preventDefault();
          onOpen(lead.id);
        }
      }}
      className={[
        "glass-leads-kanban-card",
        "group flex cursor-grab flex-col",
        "gap-3 rounded-2xl p-4",
        "transition-all duration-200",
        "active:cursor-grabbing",
        dragging ? "opacity-40" : "",
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="glass-leads-eyebrow">
            {lead.leadCode || `LEAD-${lead.id}`}
          </p>

          <h3 className="mt-2 break-words text-sm font-bold leading-5">
            {lead.companyName || "Unnamed company"}
          </h3>
        </div>

        <GripVertical
          size={17}
          className="glass-leads-muted shrink-0"
        />
      </div>

      <div className="space-y-2">
        <div className="glass-leads-muted flex items-center gap-2 text-xs">
          <Users size={14} className="shrink-0" />

          <span className="min-w-0 truncate">
            {lead.primaryContactName || "No contact"}
          </span>
        </div>

        <div className="glass-leads-muted flex items-center gap-2 text-xs">
          <UserRound size={14} className="shrink-0" />

          <span className="min-w-0 truncate">
            {lead.ownerName || "Unassigned"}
          </span>
        </div>
      </div>

      {getLeadValue(lead) > 0 && (
        <p className="glass-leads-kanban-value">
          {compactMoney(getLeadValue(lead))}
        </p>
      )}

      <footer className="glass-leads-card-footer flex items-center justify-between gap-2 pt-3">
        <PriorityBadge priority={lead.priority} />

        <span className="glass-leads-muted whitespace-nowrap text-[11px]">
          {formatDate(lead.followUpAt)}
          {" · "}
          {lead.stageAgeDays || 0}d
        </span>
      </footer>
    </article>
  );
}

function KanbanBoard({
  leads,
  draggedLead,
  dragOverStage,
  setDraggedLead,
  setDragOverStage,
  setDropNotice,
  onDrop,
  onOpen,
}) {
  return (
    <div className="w-full min-w-0 overflow-hidden">
      <div className="w-full overflow-x-auto pb-5">
        <div className="flex w-max min-w-full items-start gap-4">
          {LEAD_STAGES.map((stageName) => {
            const stageLeads = leads.filter(
              (lead) => lead.stage === stageName
            );

            const stageValue = stageLeads.reduce(
              (sum, lead) => sum + getLeadValue(lead),
              0
            );

            const isDropTarget =
              draggedLead &&
              dragOverStage === stageName &&
              draggedLead.stage !== stageName;

            return (
              <section
                key={stageName}
                data-tone={getStageTone(stageName)}
                className={[
                  "glass-leads-kanban-column",
                  "flex w-[290px] min-w-[290px]",
                  "shrink-0 flex-col gap-3",
                  "rounded-2xl p-3",
                  isDropTarget
                    ? "is-drop-target"
                    : "",
                ].join(" ")}
                onDragOver={(event) => {
                  event.preventDefault();

                  event.dataTransfer.dropEffect =
                    "move";

                  if (draggedLead) {
                    setDragOverStage(stageName);
                  }
                }}
                onDragLeave={(event) => {
                  if (
                    !event.currentTarget.contains(
                      event.relatedTarget
                    )
                  ) {
                    setDragOverStage(null);
                  }
                }}
                onDrop={(event) => {
                  event.preventDefault();
                  onDrop(stageName);
                }}
              >
                <header className="glass-leads-kanban-header">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex min-w-0 items-center gap-2">
                      <span className="glass-leads-stage-dot" />

                      <h3 className="truncate text-xs font-bold">
                        {stageName}
                      </h3>
                    </div>

                    <span className="glass-leads-count">
                      {stageLeads.length}
                    </span>
                  </div>

                  {stageValue > 0 && (
                    <p className="glass-leads-muted mt-2 text-xs">
                      {compactMoney(stageValue)}
                    </p>
                  )}
                </header>

                <div className="flex flex-1 flex-col gap-3">
                  {stageLeads.length ? (
                    stageLeads.map((lead) => (
                      <KanbanCard
                        key={lead.id}
                        lead={lead}
                        onOpen={onOpen}
                        dragging={
                          draggedLead?.id === lead.id
                        }
                        onDragStart={(item) => {
                          setDraggedLead(item);
                          setDropNotice("");
                        }}
                        onDragEnd={() => {
                          setDraggedLead(null);
                          setDragOverStage(null);
                        }}
                      />
                    ))
                  ) : (
                    <div className="glass-leads-drop-empty p-4">
                      Drop leads here
                    </div>
                  )}
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function LeadsPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const { user } = useAuth();
  const isAdmin = user?.role === "SUPER_ADMIN";

  const [view, setView] = useState(readSavedView);
  const [search, setSearch] = useState(
    () => searchParams.get("search") || ""
  );
  const [stage, setStage] = useState("");
  const [priority, setPriority] = useState("");
  const [owner, setOwner] = useState("");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);

  const [filtersOpen, setFiltersOpen] =
    useState(false);
  const [selected, setSelected] = useState([]);

  const [addOpen, setAddOpen] = useState(false);
  const [ownerOpen, setOwnerOpen] = useState(false);
  const [stageOpen, setStageOpen] = useState(false);

  const [draggedLead, setDraggedLead] =
    useState(null);
  const [dragOverStage, setDragOverStage] =
    useState(null);
  const [droppedStage, setDroppedStage] =
    useState("New");
  const [dropNotice, setDropNotice] =
    useState("");

  useEffect(() => {
    try {
      localStorage.setItem(VIEW_KEY, view);
    } catch {
      // Storage is optional.
    }
  }, [view]);

  useEffect(() => {
    setSearch(searchParams.get("search") || "");
  }, [searchParams]);

  useEffect(() => {
    setSelected([]);
    setPage(1);
  }, [search, stage, priority, owner, sort]);

  const params = useMemo(
    () => ({
      search: search.trim(),
      ...(stage ? { stage } : {}),
      page: 1,
      limit: 100,
      sort: "createdAt",
      direction: "desc",
    }),
    [search, stage]
  );

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useLeadsQuery(params);

  const leads = data?.data?.leads || [];

  const owners = useMemo(
    () =>
      [...new Set(
        leads.map((lead) => lead.ownerName).filter(Boolean)
      )].sort(),
    [leads]
  );

  const filteredLeads = useMemo(() => {
    const items = leads.filter((lead) => {
      const matchesPriority =
        !priority ||
        getPriority(lead.priority) === priority;

      const matchesOwner =
        !owner || lead.ownerName === owner;

      return matchesPriority && matchesOwner;
    });

    return [...items].sort((a, b) => {
      if (sort === "company") {
        return String(a.companyName || "").localeCompare(
          String(b.companyName || "")
        );
      }

      const aTime = new Date(
        getLeadDate(a) || 0
      ).getTime();

      const bTime = new Date(
        getLeadDate(b) || 0
      ).getTime();

      return sort === "oldest"
        ? aTime - bTime
        : bTime - aTime;
    });
  }, [leads, priority, owner, sort]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredLeads.length / PAGE_SIZE)
  );

  const visibleLeads = filteredLeads.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  const selectedLeads = leads.filter((lead) =>
    selected.includes(lead.id)
  );

  const sharedBranchId =
    selectedLeads.length > 0 &&
    selectedLeads.every(
      (lead) =>
        lead.branchId &&
        lead.branchId === selectedLeads[0].branchId
    )
      ? selectedLeads[0].branchId
      : null;

  const allSelected =
    visibleLeads.length > 0 &&
    visibleLeads.every((lead) =>
      selected.includes(lead.id)
    );

  const metrics = useMemo(() => {
    const active = filteredLeads.filter(
      (lead) =>
        !["Lost", "Active Client"].includes(lead.stage)
    );

    const pipelineValue = active.reduce(
      (sum, lead) => sum + getLeadValue(lead),
      0
    );

    const newLeads = filteredLeads.filter(
      (lead) => lead.stage === "New"
    );

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const overdue = filteredLeads.filter((lead) => {
      if (
        !lead.followUpAt ||
        ["Lost", "Active Client"].includes(lead.stage)
      ) {
        return false;
      }

      const due = new Date(lead.followUpAt);
      return !Number.isNaN(due.getTime()) && due < today;
    });

    return {
      total: filteredLeads.length,
      active: active.length,
      new: newLeads.length,
      overdue: overdue.length,
      value: pipelineValue,
    };
  }, [filteredLeads]);

  const toggleLead = (id) => {
    setSelected((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id]
    );
  };

  const toggleAll = (checked) => {
    const visibleIds = visibleLeads.map(
      (lead) => lead.id
    );

    setSelected((current) =>
      checked
        ? [...new Set([...current, ...visibleIds])]
        : current.filter(
            (id) => !visibleIds.includes(id)
          )
    );
  };

  const changeView = (nextView) => {
    setView(nextView);
    setDraggedLead(null);
    setDragOverStage(null);
    setDropNotice("");
  };

  const exportLeads = () => {
    if (!filteredLeads.length) return;

    const rows = [
      [
        "Lead ID",
        "Company",
        "Contact",
        "Industry",
        "Source",
        "Owner",
        "Stage",
        "Status",
        "Priority",
        "Last touch",
        "Next action",
        "Follow-up",
      ],
      ...filteredLeads.map((lead) => [
        lead.leadCode,
        lead.companyName,
        lead.primaryContactName,
        lead.industry,
        lead.source,
        lead.ownerName,
        lead.stage,
        lead.status,
        lead.priority,
        lead.lastTouchAt,
        lead.nextAction,
        lead.followUpAt,
      ]),
    ];

    const csv = rows
      .map((row) => row.map(csvValue).join(","))
      .join("\r\n");

    const blob = new Blob(
      ["\uFEFF", csv],
      { type: "text/csv;charset=utf-8;" }
    );

    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");

    anchor.href = url;
    anchor.download = "tempest-leads.csv";

    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();

    URL.revokeObjectURL(url);
  };

  const handleDrop = (targetStage) => {
    setDragOverStage(null);

    if (
      !draggedLead ||
      draggedLead.stage === targetStage
    ) {
      setDraggedLead(null);
      return;
    }

    if (targetStage === "Lost") {
      setDropNotice(
        'To mark a lead as Lost, open its details and use "Mark lost".'
      );
      setDraggedLead(null);
      return;
    }

    setDropNotice("");
    setSelected([draggedLead.id]);
    setDroppedStage(targetStage);
    setDraggedLead(null);
    setStageOpen(true);
  };

  const resetFilters = () => {
    setSearch("");
    setStage("");
    setPriority("");
    setOwner("");
    setSort("newest");
    navigate("/leads", { replace: true });
  };

  const filtersActive = Boolean(
    search || stage || priority || owner ||
    sort !== "newest"
  );

  return (
    <>
      <div className="glass-leads space-y-5">
        {/* HEADER */}

        <header className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="glass-leads-eyebrow">
              Workspace / Leads & Pipeline
            </p>

            <h1 className="mt-2 flex items-center gap-2 text-2xl font-extrabold tracking-tight sm:text-3xl">
              Leads & Pipeline
              <Sparkles
                size={21}
                className="glass-leads-heading-icon"
              />
            </h1>

            <p className="glass-leads-muted mt-2 text-sm">
              Manage opportunities, owners, and
              every stage of your sales journey.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              className="glass-leads-button"
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

            <button
              type="button"
              className="glass-leads-button"
              disabled={!filteredLeads.length}
              onClick={exportLeads}
            >
              <Download size={16} />
              Export
            </button>

            <button
              type="button"
              className="glass-leads-primary"
              onClick={() => setAddOpen(true)}
            >
              <Plus size={17} />
              Add Lead
            </button>
          </div>
        </header>

        {/* BENTO KPI CARDS */}

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            label="Total Leads"
            value={metrics.total.toLocaleString("en-IN")}
            subtitle="Records in current filtered result"
            icon={Users}
            featured
          >
            <div className="mt-3 flex h-7 items-end gap-1">
              {[35, 60, 44, 78, 53, 95, 74, 100].map(
                (height, index) => (
                  <span
                    key={index}
                    className="glass-leads-spark-bar"
                    style={{ height: `${height}%` }}
                  />
                )
              )}
            </div>
          </MetricCard>

          <MetricCard
            label="Open Opportunities"
            value={metrics.active.toLocaleString("en-IN")}
            subtitle="Leads currently in progress"
            icon={Layers3}
            tone="green"
          />

          <MetricCard
            label="Pipeline Value"
            value={compactMoney(metrics.value)}
            subtitle="Estimated value of open opportunities"
            icon={IndianRupee}
            tone="violet"
          />

          <MetricCard
            label="Overdue Follow-ups"
            value={metrics.overdue.toLocaleString("en-IN")}
            subtitle="Follow-ups requiring attention"
            icon={CalendarClock}
            tone="rose"
          />
        </section>

        {/* MAIN WORKSPACE */}

        <section className="glass-leads-workspace overflow-hidden rounded-3xl">
          <div className="flex flex-wrap items-center justify-between gap-4 p-5">
            <div>
              <h2 className="text-base font-bold">
                Pipeline Workspace
              </h2>

              <p className="glass-leads-muted mt-1 text-xs">
                {filteredLeads.length} loaded matching
                records
              </p>
            </div>

            <div
              className="glass-leads-toggle"
              role="group"
              aria-label="Lead view"
            >
              <button
                type="button"
                className={
                  view === "table" ? "is-active" : ""
                }
                aria-pressed={view === "table"}
                onClick={() => changeView("table")}
              >
                <List size={16} />
                Table
              </button>

              <button
                type="button"
                className={
                  view === "kanban" ? "is-active" : ""
                }
                aria-pressed={view === "kanban"}
                onClick={() => changeView("kanban")}
              >
                <KanbanSquare size={16} />
                Kanban
              </button>
            </div>
          </div>

          {/* FILTER TOOLBAR */}

          <div className="glass-leads-toolbar flex flex-wrap items-center gap-3 px-5 pb-5">
            <label className="glass-leads-search">
              <Search size={17} />

              <input
                type="search"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search leads..."
                aria-label="Search leads"
              />

              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  aria-label="Clear search"
                >
                  <X size={14} />
                </button>
              )}
            </label>

            <select
              className="glass-leads-select"
              value={stage}
              onChange={(event) =>
                setStage(event.target.value)
              }
              aria-label="Filter by stage"
            >
              <option value="">All Stages</option>

              {LEAD_STAGES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>

            <select
              className="glass-leads-select"
              value={priority}
              onChange={(event) =>
                setPriority(event.target.value)
              }
              aria-label="Filter by priority"
            >
              <option value="">All Priorities</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>

            <button
              type="button"
              className="glass-leads-button"
              aria-expanded={filtersOpen}
              onClick={() =>
                setFiltersOpen((current) => !current)
              }
            >
              <SlidersHorizontal size={16} />
              More Filters
            </button>

            {filtersActive && (
              <button
                type="button"
                className="glass-leads-text-button"
                onClick={resetFilters}
              >
                Clear filters
              </button>
            )}
          </div>

          {filtersOpen && (
            <div className="glass-leads-filter-panel flex flex-wrap items-end gap-4 px-5 py-4">
              <label className="flex flex-col gap-2">
                <span className="glass-leads-eyebrow">
                  Owner
                </span>

                <select
                  className="glass-leads-select"
                  value={owner}
                  onChange={(event) =>
                    setOwner(event.target.value)
                  }
                >
                  <option value="">All owners</option>

                  {owners.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex flex-col gap-2">
                <span className="glass-leads-eyebrow">
                  Sort By
                </span>

                <select
                  className="glass-leads-select"
                  value={sort}
                  onChange={(event) =>
                    setSort(event.target.value)
                  }
                >
                  <option value="newest">
                    Newest First
                  </option>

                  <option value="oldest">
                    Oldest First
                  </option>

                  <option value="company">
                    Company A–Z
                  </option>
                </select>
              </label>
            </div>
          )}

          {/* BULK ACTIONS */}

          {selected.length > 0 && (
            <div className="glass-leads-bulk flex flex-wrap items-center gap-3 px-5 py-3">
              <span className="text-xs font-bold">
                {selected.length} selected
              </span>

              <button
                type="button"
                className="glass-leads-button"
                title={
                  selected.length && !sharedBranchId
                    ? "Select leads belonging to one branch."
                    : undefined
                }
                disabled={
                  !isAdmin || !sharedBranchId
                }
                onClick={() => setOwnerOpen(true)}
              >
                <UserRound size={15} />
                Assign Owner
              </button>

              <button
                type="button"
                className="glass-leads-button"
                onClick={() => {
                  setDroppedStage("New");
                  setStageOpen(true);
                }}
              >
                <Layers3 size={15} />
                Change Stage
              </button>

              <button
                type="button"
                className="glass-leads-text-button"
                onClick={() => setSelected([])}
              >
                Clear selection
              </button>
            </div>
          )}

          {/* QUERY STATES */}

          {isLoading && (
            <div
              className="glass-leads-muted px-6 py-16 text-center text-sm"
              role="status"
            >
              Loading pipeline records...
            </div>
          )}

          {!isLoading && isError && (
            <div className="px-6 py-12 text-center">
              <CircleAlert
                size={28}
                className="glass-leads-error-icon mx-auto"
              />

              <h3 className="mt-4 text-base font-bold">
                Unable to load leads
              </h3>

              <p className="glass-leads-muted mt-2 text-sm">
                {error?.response?.data?.message ||
                  "Something went wrong while loading leads."}
              </p>

              <button
                type="button"
                className="glass-leads-primary mt-5"
                onClick={() => refetch()}
              >
                Try Again
              </button>
            </div>
          )}

          {/* TABLE */}

          {!isLoading && !isError && view === "table" && (
            <>
              <LeadsTable
                leads={visibleLeads}
                selected={selected}
                toggleLead={toggleLead}
                allSelected={allSelected}
                toggleAll={toggleAll}
                onOpen={(id) =>
                  navigate(`/leads/${id}`)
                }
                onAdd={() => setAddOpen(true)}
                filtered={filtersActive}
              />

              <footer className="glass-leads-pagination flex flex-wrap items-center justify-between gap-3 px-5 py-4">
                <span className="glass-leads-muted text-xs">
                  Showing{" "}
                  {filteredLeads.length
                    ? (page - 1) * PAGE_SIZE + 1
                    : 0}
                  –
                  {Math.min(
                    page * PAGE_SIZE,
                    filteredLeads.length
                  )}{" "}
                  of {filteredLeads.length} loaded records
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="glass-leads-page-button"
                    disabled={page <= 1}
                    onClick={() =>
                      setPage((current) =>
                        Math.max(1, current - 1)
                      )
                    }
                    aria-label="Previous page"
                  >
                    <ChevronLeft size={16} />
                  </button>

                  <span className="glass-leads-muted px-2 text-xs font-semibold">
                    Page {page} of {totalPages}
                  </span>

                  <button
                    type="button"
                    className="glass-leads-page-button"
                    disabled={page >= totalPages}
                    onClick={() =>
                      setPage((current) =>
                        Math.min(
                          totalPages,
                          current + 1
                        )
                      )
                    }
                    aria-label="Next page"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </footer>
            </>
          )}
        </section>

        {/* KANBAN */}

        {!isLoading && !isError && view === "kanban" && (
          <section className="glass-leads-kanban-section min-w-0 rounded-3xl p-5">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold">
                  Pipeline Board
                </h2>

                <p className="glass-leads-muted mt-1 text-xs">
                  Drag a card to change its pipeline stage.
                </p>
              </div>

              <span className="glass-leads-kanban-summary">
                {filteredLeads.length} leads ·{" "}
                {LEAD_STAGES.length} stages
              </span>
            </div>

            {dropNotice && (
              <div
                role="alert"
                className="glass-leads-notice mb-4"
              >
                {dropNotice}
              </div>
            )}

            <KanbanBoard
              leads={filteredLeads}
              draggedLead={draggedLead}
              dragOverStage={dragOverStage}
              setDraggedLead={setDraggedLead}
              setDragOverStage={setDragOverStage}
              setDropNotice={setDropNotice}
              onDrop={handleDrop}
              onOpen={(id) =>
                navigate(`/leads/${id}`)
              }
            />
          </section>
        )}
      </div>

      {/* EXISTING MODALS */}

      <LeadFormModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
      />

      <AssignOwnerModal
        open={ownerOpen}
        leadIds={selected}
        branchId={sharedBranchId}
        onClose={() => {
          setOwnerOpen(false);
          setSelected([]);
        }}
      />

      <ChangeStageModal
        open={stageOpen}
        leadIds={selected}
        initialStage={droppedStage}
        onPartialSuccess={(doneIds) =>
          setSelected((current) =>
            current.filter(
              (id) => !doneIds.includes(id)
            )
          )
        }
        onClose={() => {
          setStageOpen(false);
          setSelected([]);
        }}
      />
    </>
  );
}
