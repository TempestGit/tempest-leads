
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import useAuth from "../auth/useAuth.js";
import { useLeadsQuery } from "./leads.queries.js";
import { LEAD_STAGES } from "./leads.schema.js";

import LeadFormModal from "./LeadFormModal.jsx";
import AssignOwnerModal from "./AssignOwnerModal.jsx";
import ChangeStageModal from "./ChangeStageModal.jsx";

/*
|--------------------------------------------------------------------------
| Helpers
|--------------------------------------------------------------------------
*/

const VIEW_STORAGE_KEY = "tempest-leads-view";

const getSavedView = () => {
  try {
    const savedView = window.localStorage.getItem(
      VIEW_STORAGE_KEY
    );

    return savedView === "kanban" ? "kanban" : "table";
  } catch {
    return "table";
  }
};

const formatDate = (value) => {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
  });
};

const formatTime = (value) => {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
};

const stageClass = (stage) =>
  String(stage || "")
    .replaceAll(" ", "-")
    .replaceAll("/", "-");

const priorityClass = (priority) =>
  String(priority || "").toLowerCase();

const csvValue = (value) =>
  `"${String(value ?? "").replaceAll('"', '""')}"`;

/*
|--------------------------------------------------------------------------
| Kanban Stage Colors
|--------------------------------------------------------------------------
*/

const STAGE_STYLES = {
  New: {
    column: "bg-blue-50 border-blue-200",
    header: "text-blue-700",
    count: "bg-blue-100 text-blue-700",
    accent: "bg-blue-500",
    drag: "border-blue-400",
  },

  Contacted: {
    column: "bg-teal-50 border-teal-200",
    header: "text-teal-700",
    count: "bg-teal-100 text-teal-700",
    accent: "bg-teal-500",
    drag: "border-teal-400",
  },

  Qualified: {
    column: "bg-green-50 border-green-200",
    header: "text-green-700",
    count: "bg-green-100 text-green-700",
    accent: "bg-green-500",
    drag: "border-green-400",
  },

  Proposal: {
    column: "bg-orange-50 border-orange-200",
    header: "text-orange-700",
    count: "bg-orange-100 text-orange-700",
    accent: "bg-orange-500",
    drag: "border-orange-400",
  },

  Negotiation: {
    column: "bg-purple-50 border-purple-200",
    header: "text-purple-700",
    count: "bg-purple-100 text-purple-700",
    accent: "bg-purple-500",
    drag: "border-purple-400",
  },

  Won: {
    column: "bg-emerald-50 border-emerald-200",
    header: "text-emerald-700",
    count: "bg-emerald-100 text-emerald-700",
    accent: "bg-emerald-500",
    drag: "border-emerald-400",
  },

  Lost: {
    column: "bg-red-50 border-red-200",
    header: "text-red-700",
    count: "bg-red-100 text-red-700",
    accent: "bg-red-500",
    drag: "border-red-400",
  },
};

const DEFAULT_STAGE_STYLE = {
  column: "bg-slate-50 border-slate-200",
  header: "text-slate-700",
  count: "bg-slate-100 text-slate-700",
  accent: "bg-slate-500",
  drag: "border-slate-400",
};

const PRIORITY_STYLES = {
  high: "bg-red-50 text-red-700 border-red-200",
  medium: "bg-amber-50 text-amber-700 border-amber-200",
  low: "bg-green-50 text-green-700 border-green-200",
};

/*
|--------------------------------------------------------------------------
| Leads Page
|--------------------------------------------------------------------------
*/

const LeadsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  /*
  |--------------------------------------------------------------------------
  | Persistent View
  |--------------------------------------------------------------------------
  */

  const [view, setView] = useState(getSavedView);

  useEffect(() => {
    try {
      window.localStorage.setItem(VIEW_STORAGE_KEY, view);
    } catch {
      // Continue normally if browser storage is unavailable.
    }
  }, [view]);

  /*
  |--------------------------------------------------------------------------
  | Filters and Selection
  |--------------------------------------------------------------------------
  */

  const [search, setSearch] = useState("");
  const [stage, setStage] = useState("");
  const [selected, setSelected] = useState([]);

  /*
  |--------------------------------------------------------------------------
  | Modals
  |--------------------------------------------------------------------------
  */

  const [addOpen, setAddOpen] = useState(false);
  const [ownerOpen, setOwnerOpen] = useState(false);
  const [stageOpen, setStageOpen] = useState(false);

  /*
  |--------------------------------------------------------------------------
  | Kanban Drag State
  |--------------------------------------------------------------------------
  */

  const [draggedLead, setDraggedLead] = useState(null);
  const [dragOverStage, setDragOverStage] = useState(null);
  const [droppedStage, setDroppedStage] = useState("New");
  const [dropNotice, setDropNotice] = useState("");

  /*
  |--------------------------------------------------------------------------
  | Clear Selection When Filters Change
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    setSelected([]);
  }, [search, stage]);

  /*
  |--------------------------------------------------------------------------
  | Query Params
  |--------------------------------------------------------------------------
  */

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

  /*
  |--------------------------------------------------------------------------
  | Leads Query
  |--------------------------------------------------------------------------
  */

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = useLeadsQuery(params);

  const leads = data?.data?.leads || [];

  /*
  |--------------------------------------------------------------------------
  | Selection Helpers
  |--------------------------------------------------------------------------
  */

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
    leads.length > 0 &&
    leads.every((lead) => selected.includes(lead.id));

  const isAdmin = user?.role === "SUPER_ADMIN";

  const toggleAll = (checked) => {
    if (checked) {
      setSelected(leads.map((lead) => lead.id));
      return;
    }

    setSelected([]);
  };

  const toggleLead = (leadId) => {
    setSelected((current) =>
      current.includes(leadId)
        ? current.filter((id) => id !== leadId)
        : [...current, leadId]
    );
  };

  /*
  |--------------------------------------------------------------------------
  | Toggle Table / Kanban View
  |--------------------------------------------------------------------------
  */

  const toggleView = () => {
    setView((current) =>
      current === "table" ? "kanban" : "table"
    );

    setDraggedLead(null);
    setDragOverStage(null);
    setDropNotice("");
  };

  /*
  |--------------------------------------------------------------------------
  | Export CSV
  |--------------------------------------------------------------------------
  */

  const exportLeads = () => {
    if (!leads.length) {
      return;
    }

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

      ...leads.map((lead) => [
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
      .join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");

    anchor.href = url;
    anchor.download = "tempest-leads.csv";

    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();

    URL.revokeObjectURL(url);
  };

  /*
  |--------------------------------------------------------------------------
  | Kanban Drop
  |--------------------------------------------------------------------------
  */

  const handleDrop = (targetStage) => {
    setDragOverStage(null);

    if (!draggedLead || draggedLead.stage === targetStage) {
      setDraggedLead(null);
      return;
    }

    if (targetStage === "Lost") {
      setDropNotice(
        'To mark a lead as Lost, open the lead and use "Mark lost".'
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

  /*
  |--------------------------------------------------------------------------
  | Render
  |--------------------------------------------------------------------------
  */

  return (
    <>
      {/* --------------------------------------------------------------- */}
      {/* Page Header */}
      {/* --------------------------------------------------------------- */}

      <div className="tl-title-row">
        <div>
          <h1>Leads &amp; Pipeline</h1>

          <p>
            Every open lead has an owner, stage, last touch
            and next action.
          </p>
        </div>

        <div className="button-row">
          <button
            type="button"
            className="tl-secondary"
            onClick={toggleView}
          >
            {view === "table"
              ? "Kanban view"
              : "Table view"}
          </button>

          <button
            type="button"
            className="tl-secondary"
            onClick={exportLeads}
          >
            Export
          </button>

          <button
            type="button"
            className="tl-primary"
            onClick={() => setAddOpen(true)}
          >
            + Add Lead
          </button>
        </div>
      </div>

      {/* --------------------------------------------------------------- */}
      {/* Filters */}
      {/* --------------------------------------------------------------- */}

      <div className="tl-filters">
        <input
          className="filter-input"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search ID, company, contact, email or phone"
        />

        <select
          className="filter-select"
          value={stage}
          onChange={(event) => setStage(event.target.value)}
        >
          <option value="">All stages</option>

          {LEAD_STAGES.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>

        <button
          type="button"
          className="tl-secondary"
          title={
            selected.length && !sharedBranchId
              ? "Selected leads belong to different branches or have no branch. Select leads from one branch."
              : undefined
          }
          disabled={
            !selected.length || !isAdmin || !sharedBranchId
          }
          onClick={() => setOwnerOpen(true)}
        >
          Assign owner
        </button>

        <button
          type="button"
          className="tl-secondary"
          disabled={!selected.length}
          onClick={() => {
            setDroppedStage("New");
            setStageOpen(true);
          }}
        >
          Change stage
        </button>
      </div>

      {/* --------------------------------------------------------------- */}
      {/* Loading */}
      {/* --------------------------------------------------------------- */}

      {isLoading && (
        <article className="tl-card">
          <div className="empty-state">
            <h2>Loading leads</h2>
            <p>Loading pipeline records...</p>
          </div>
        </article>
      )}

      {/* --------------------------------------------------------------- */}
      {/* Error */}
      {/* --------------------------------------------------------------- */}

      {!isLoading && isError && (
        <article className="tl-card">
          <div className="empty-state">
            <h2>Unable to load leads</h2>

            <p>
              {error?.response?.data?.message ||
                "Something went wrong while loading leads."}
            </p>

            <button
              type="button"
              className="tl-primary"
              onClick={() => refetch()}
            >
              Try again
            </button>
          </div>
        </article>
      )}

      {/* --------------------------------------------------------------- */}
      {/* Table View */}
      {/* --------------------------------------------------------------- */}

      {!isLoading && !isError && view === "table" && (
        <article className="tl-card no-pad">
          <div className="table-wrap">
            <table className="tl-table">
              <thead>
                <tr>
                  <th>
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={(event) =>
                        toggleAll(event.target.checked)
                      }
                    />
                  </th>

                  <th>Lead ID</th>
                  <th>Company / contact</th>
                  <th>Industry</th>
                  <th>Source</th>
                  <th>Owner</th>
                  <th>Stage</th>
                  <th>Priority</th>
                  <th>Last touch</th>
                  <th>Next action</th>
                  <th>Follow-up</th>
                </tr>
              </thead>

              <tbody>
                {leads.map((lead) => (
                  <tr
                    key={lead.id}
                    className="cursor-pointer"
                    onClick={() =>
                      navigate(`/leads/${lead.id}`)
                    }
                  >
                    <td>
                      <input
                        className="pick"
                        type="checkbox"
                        checked={selected.includes(lead.id)}
                        onClick={(event) =>
                          event.stopPropagation()
                        }
                        onChange={() => toggleLead(lead.id)}
                      />
                    </td>

                    <td>
                      <b>{lead.leadCode}</b>
                      <small>{lead.status}</small>
                    </td>

                    <td>
                      <b>{lead.companyName}</b>
                      <small>
                        {lead.primaryContactName || "—"}
                      </small>
                    </td>

                    <td>{lead.industry || "—"}</td>
                    <td>{lead.source || "—"}</td>
                    <td>{lead.ownerName || "—"}</td>

                    <td>
                      <span
                        className={`status ${stageClass(
                          lead.stage
                        )}`}
                      >
                        {lead.stage}
                      </span>
                    </td>

                    <td>
                      <span
                        className={`priority ${priorityClass(
                          lead.priority
                        )}`}
                      >
                        {lead.priority}
                      </span>
                    </td>

                    <td>
                      {formatDate(lead.lastTouchAt)}
                    </td>

                    <td>
                      {lead.nextAction || "—"}
                    </td>

                    <td>
                      {formatDate(lead.followUpAt)}
                      <small>
                        {formatTime(lead.followUpAt)}
                      </small>
                    </td>
                  </tr>
                ))}

                {!leads.length && (
                  <tr>
                    <td colSpan={11}>
                      <div className="empty-state">
                        <h2>No leads found</h2>

                        <p>
                          Clear filters or add a new company
                          lead.
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="table-pagination">
            <span>{leads.length} records</span>
            <span>Page 1 of 1</span>
          </div>
        </article>
      )}

      {/* --------------------------------------------------------------- */}
      {/* Kanban Notice */}
      {/* --------------------------------------------------------------- */}

      {!isLoading &&
        !isError &&
        view === "kanban" &&
        dropNotice && (
          <div
            role="alert"
            className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
          >
            {dropNotice}
          </div>
        )}

      {/* --------------------------------------------------------------- */}
      {/* Colored Kanban View */}
      {/* --------------------------------------------------------------- */}

      {!isLoading && !isError && view === "kanban" && (
        <div className="w-full min-w-0 max-w-full overflow-hidden">
          <div className="w-full overflow-x-auto pb-6">
            <div className="flex w-max min-w-full items-start gap-4">
              {LEAD_STAGES.map((stageName) => {
                const stageLeads = leads.filter(
                  (lead) => lead.stage === stageName
                );

                const style =
                  STAGE_STYLES[stageName] ||
                  DEFAULT_STAGE_STYLE;

                const isDragTarget =
                  draggedLead &&
                  dragOverStage === stageName &&
                  draggedLead.stage !== stageName;

                return (
                  <section
                    key={stageName}
                    className={[
                      "flex w-[300px] min-w-[300px] shrink-0",
                      "flex-col gap-3 rounded-xl border p-3",
                      "min-h-[250px] transition-all duration-150",
                      style.column,
                      isDragTarget
                        ? `ring-2 ring-offset-2 ${style.drag}`
                        : "",
                    ].join(" ")}
                    onDragOver={(event) => {
                      event.preventDefault();

                      event.dataTransfer.dropEffect =
                        "move";

                      if (
                        draggedLead &&
                        dragOverStage !== stageName
                      ) {
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
                      handleDrop(stageName);
                    }}
                  >
                    {/* Column Header */}

                    <header className="flex items-center justify-between gap-3 px-1 py-2">
                      <div className="flex min-w-0 items-center gap-2">
                        <span
                          className={[
                            "h-5 w-1 shrink-0 rounded-full",
                            style.accent,
                          ].join(" ")}
                        />

                        <h2
                          className={[
                            "truncate text-sm font-bold",
                            style.header,
                          ].join(" ")}
                        >
                          {stageName}
                        </h2>
                      </div>

                      <span
                        className={[
                          "inline-flex h-7 min-w-7",
                          "shrink-0 items-center justify-center",
                          "rounded-full px-2 text-xs font-bold",
                          style.count,
                        ].join(" ")}
                      >
                        {stageLeads.length}
                      </span>
                    </header>

                    {/* Lead Cards */}

                    <div className="flex flex-1 flex-col gap-3">
                      {stageLeads.length === 0 ? (
                        <div
                          className={[
                            "flex min-h-[120px] items-center",
                            "justify-center rounded-lg border-2",
                            "border-dashed border-slate-200",
                            "bg-white/60 p-4 text-center",
                            "text-xs text-slate-400",
                          ].join(" ")}
                        >
                          Drop leads here
                        </div>
                      ) : (
                        stageLeads.map((lead) => {
                          const priorityStyle =
                            PRIORITY_STYLES[
                              priorityClass(lead.priority)
                            ] ||
                            "bg-slate-50 text-slate-600 border-slate-200";

                          return (
                            <article
                              key={lead.id}
                              draggable
                              onDragStart={(event) => {
                                event.dataTransfer.effectAllowed =
                                  "move";

                                event.dataTransfer.setData(
                                  "text/plain",
                                  String(lead.id)
                                );

                                setDraggedLead(lead);
                                setDropNotice("");
                              }}
                              onDragEnd={() => {
                                setDraggedLead(null);
                                setDragOverStage(null);
                              }}
                              onClick={() =>
                                navigate(
                                  `/leads/${lead.id}`
                                )
                              }
                              className={[
                                "group flex min-w-0 cursor-grab",
                                "flex-col gap-3 rounded-lg",
                                "border border-slate-200",
                                "bg-white p-4 shadow-sm",
                                "transition-all duration-150",
                                "hover:-translate-y-0.5",
                                "hover:border-slate-300",
                                "hover:shadow-md",
                                "active:cursor-grabbing",
                                draggedLead?.id === lead.id
                                  ? "opacity-40"
                                  : "",
                              ].join(" ")}
                            >
                              {/* Lead ID / Company */}

                              <div className="flex min-w-0 items-start justify-between gap-2">
                                <div className="min-w-0 flex-1">
                                  <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                                    {lead.leadCode ||
                                      `LEAD-${lead.id}`}
                                  </p>

                                  <h3 className="break-words text-sm font-bold leading-5 text-slate-800 group-hover:text-blue-700">
                                    {lead.companyName ||
                                      "Unnamed company"}
                                  </h3>
                                </div>
                              </div>

                              {/* Contact / Owner */}

                              <div className="flex flex-col gap-2">
                                <div className="flex min-w-0 items-center gap-2 text-xs text-slate-600">

                                  <span className="min-w-0 truncate">
                                    {lead.primaryContactName ||
                                      "No contact"}
                                  </span>
                                </div>

                                <div className="flex min-w-0 items-center gap-2 text-xs text-slate-600">

                                  <span className="min-w-0 truncate">
                                    {lead.ownerName ||
                                      "Unassigned"}
                                  </span>
                                </div>
                              </div>

                              {/* Footer */}

                              <footer className="flex items-center justify-between gap-2 border-t border-slate-100 pt-3">
                                <span
                                  className={[
                                    "inline-flex items-center",
                                    "rounded-full border",
                                    "px-2.5 py-1",
                                    "text-[10px] font-semibold",
                                    priorityStyle,
                                  ].join(" ")}
                                >
                                  {lead.priority || "—"}
                                </span>

                                <span className="whitespace-nowrap text-[11px] text-slate-500">
                                  {formatDate(
                                    lead.followUpAt
                                  )}
                                  {" · "}
                                  {lead.stageAgeDays || 0}d
                                </span>
                              </footer>
                            </article>
                          );
                        })
                      )}
                    </div>
                  </section>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* --------------------------------------------------------------- */}
      {/* Modals */}
      {/* --------------------------------------------------------------- */}

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
        onPartialSuccess={(doneIds) =>
          setSelected((current) =>
            current.filter(
              (id) => !doneIds.includes(id)
            )
          )
        }
        leadIds={selected}
        initialStage={droppedStage}
        onClose={() => {
          setStageOpen(false);
          setSelected([]);
        }}
      />
    </>
  );
};

export default LeadsPage;
