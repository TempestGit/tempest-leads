import {
  useMemo,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import useAuth from "../auth/useAuth.js";

import {
  useLeadsQuery,
} from "./leads.queries.js";

import {
  LEAD_STAGES,
} from "./leads.schema.js";

import LeadFormModal from "./LeadFormModal.jsx";

import AssignOwnerModal from "./AssignOwnerModal.jsx";

import ChangeStageModal from "./ChangeStageModal.jsx";



/*
|--------------------------------------------------------------------------
| Date
|--------------------------------------------------------------------------
*/

const formatDate = (
  value
) => {
  if (!value) {
    return "—";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "—";
  }

  return date.toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
    }
  );
};

/*
|--------------------------------------------------------------------------
| Time
|--------------------------------------------------------------------------
*/

const formatTime = (
  value
) => {
  if (!value) {
    return "—";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "—";
  }

  return date.toLocaleTimeString(
    "en-IN",
    {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }
  );
};

/*
|--------------------------------------------------------------------------
| Classes
|--------------------------------------------------------------------------
*/

const stageClass = (
  stage
) =>
  String(stage || "")
    .replaceAll(
      " ",
      "-"
    )
    .replaceAll(
      "/",
      "-"
    );

const priorityClass = (
  priority
) =>
  String(
    priority || ""
  ).toLowerCase();

/*
|--------------------------------------------------------------------------
| CSV
|--------------------------------------------------------------------------
*/

const csvValue = (
  value
) =>
  `"${String(
    value ?? ""
  ).replaceAll(
    '"',
    '""'
  )}"`;

/*
|--------------------------------------------------------------------------
| Leads Page
|--------------------------------------------------------------------------
*/

const LeadsPage = () => {
  const navigate =
  useNavigate();
  const {
    user,
  } = useAuth();

  const [
    view,
    setView,
  ] = useState(
    "table"
  );

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    stage,
    setStage,
  ] = useState("");

  const [
    selected,
    setSelected,
  ] = useState([]);

  const [
    addOpen,
    setAddOpen,
  ] = useState(false);

  const [
    ownerOpen,
    setOwnerOpen,
  ] = useState(false);

  const [
    stageOpen,
    setStageOpen,
  ] = useState(false);

  const [
    draggedLead,
    setDraggedLead,
  ] = useState(null);

  const [
    droppedStage,
    setDroppedStage,
  ] = useState("New");

  /*
  |--------------------------------------------------------------------------
  | Params
  |--------------------------------------------------------------------------
  */

  const params =
    useMemo(
      () => ({
        search:
          search.trim(),

        ...(stage
          ? {
              stage,
            }
          : {}),

        page: 1,
        limit: 100,
        sort:
          "createdAt",
        direction:
          "desc",
      }),
      [
        search,
        stage,
      ]
    );

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } =
    useLeadsQuery(
      params
    );

  const leads =
    data?.data
      ?.leads || [];

  /*
  |--------------------------------------------------------------------------
  | Selection
  |--------------------------------------------------------------------------
  */

  const allSelected =
    leads.length > 0 &&
    leads.every(
      (lead) =>
        selected.includes(
          lead.id
        )
    );

  const toggleAll =
    (checked) => {
      if (checked) {
        setSelected(
          leads.map(
            (lead) =>
              lead.id
          )
        );

        return;
      }

      setSelected([]);
    };

  const toggleLead =
    (leadId) => {
      setSelected(
        (current) =>
          current.includes(
            leadId
          )
            ? current.filter(
                (id) =>
                  id !==
                  leadId
              )
            : [
                ...current,
                leadId,
              ]
      );
    };

  /*
  |--------------------------------------------------------------------------
  | Export
  |--------------------------------------------------------------------------
  */

  const exportLeads =
    () => {
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

        ...leads.map(
          (lead) => [
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
          ]
        ),
      ];

      const csv =
        rows
          .map(
            (row) =>
              row
                .map(
                  csvValue
                )
                .join(",")
          )
          .join("\n");

      const blob =
        new Blob(
          [csv],
          {
            type:
              "text/csv;charset=utf-8;",
          }
        );

      const url =
        URL.createObjectURL(
          blob
        );

      const anchor =
        document.createElement(
          "a"
        );

      anchor.href =
        url;

      anchor.download =
        "tempest-leads.csv";

      document.body.appendChild(
        anchor
      );

      anchor.click();
      anchor.remove();

      URL.revokeObjectURL(
        url
      );
    };

  /*
  |--------------------------------------------------------------------------
  | Kanban Drop
  |--------------------------------------------------------------------------
  |
  | We do not silently mutate the stage.
  | Dropping a card opens the mandatory reason modal.
  |
  */

  const handleDrop =
    (
      targetStage
    ) => {
      if (
        !draggedLead ||
        draggedLead.stage ===
          targetStage
      ) {
        setDraggedLead(
          null
        );

        return;
      }

      setSelected([
        draggedLead.id,
      ]);

      setDroppedStage(
        targetStage
      );

      setDraggedLead(
        null
      );

      setStageOpen(
        true
      );
    };

  /*
  |--------------------------------------------------------------------------
  | Admin
  |--------------------------------------------------------------------------
  */

  const isAdmin =
    user?.role ===
    "SUPER_ADMIN";

  return (
    <>
      <div className="tl-title-row">
        <div>
          <h1>
            Leads & Pipeline
          </h1>

          <p>
            Every open lead
            has an owner,
            stage, last touch
            and next action.
          </p>
        </div>

        <div className="button-row">
          {/* <button
            type="button"
            className="tl-secondary"
            onClick={() =>
              setView(
                (current) =>
                  current ===
                  "table"
                    ? "kanban"
                    : "table"
              )
            }
          >
            {view ===
            "table"
              ? "Kanban view"
              : "Table view"}
          </button> */}

          <button
            type="button"
            className="tl-secondary"
            onClick={
              exportLeads
            }
          >
            Export
          </button>

          <button
            type="button"
            className="tl-primary"
            onClick={() =>
              setAddOpen(
                true
              )
            }
          >
            + Add Lead
          </button>
        </div>
      </div>

      {/* Filters */}

      <div className="tl-filters">
        <input
          className="filter-input"
          value={search}
          onChange={(
            event
          ) =>
            setSearch(
              event.target
                .value
            )
          }
          placeholder="Search ID, company, contact, email or phone"
        />

        <select
          className="filter-select"
          value={stage}
          onChange={(
            event
          ) =>
            setStage(
              event.target
                .value
            )
          }
        >
          <option value="">
            All stages
          </option>

          {LEAD_STAGES.map(
            (item) => (
              <option
                key={
                  item
                }
                value={
                  item
                }
              >
                {item}
              </option>
            )
          )}
        </select>

        <button
          type="button"
          className="tl-secondary"
          disabled={
            !selected.length ||
            !isAdmin
          }
          onClick={() =>
            setOwnerOpen(
              true
            )
          }
        >
          Assign owner
        </button>

        <button
          type="button"
          className="tl-secondary"
          disabled={
            !selected.length
          }
          onClick={() => {
            setDroppedStage(
              "New"
            );

            setStageOpen(
              true
            );
          }}
        >
          Change stage
        </button>
      </div>

      {/* Loading */}

      {isLoading && (
        <article className="tl-card">
          <div className="empty-state">
            <h2>
              Loading leads
            </h2>

            <p>
              Loading pipeline
              records...
            </p>
          </div>
        </article>
      )}

      {/* Error */}

      {!isLoading &&
        isError && (
          <article className="tl-card">
            <div className="empty-state">
              <h2>
                Unable to load
                leads
              </h2>

              <p>
                {error
                  ?.response
                  ?.data
                  ?.message ||
                  "Something went wrong while loading leads."}
              </p>

              <button
                type="button"
                className="tl-primary"
                onClick={() =>
                  refetch()
                }
              >
                Try again
              </button>
            </div>
          </article>
        )}

      {/* Table */}

      {!isLoading &&
        !isError &&
        view ===
          "table" && (
          <article className="tl-card no-pad">
            <div className="table-wrap">
              <table className="tl-table">
                <thead>
                  <tr>
                    <th>
                      <input
                        type="checkbox"
                        checked={
                          allSelected
                        }
                        onChange={(
                          event
                        ) =>
                          toggleAll(
                            event
                              .target
                              .checked
                          )
                        }
                      />
                    </th>

                    <th>
                      Lead ID
                    </th>

                    <th>
                      Company /
                      contact
                    </th>

                    <th>
                      Industry
                    </th>

                    <th>
                      Source
                    </th>

                    <th>
                      Owner
                    </th>

                    <th>
                      Stage
                    </th>

                    <th>
                      Priority
                    </th>

                    <th>
                      Last touch
                    </th>

                    <th>
                      Next action
                    </th>

                    <th>
                      Follow-up
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {leads.map(
                    (lead) => (
                      <tr
                        key={lead.id}
                        style={{
                            cursor: "pointer",
                        }}
                        onClick={() =>
                            navigate(
                            `/leads/${lead.id}`
                            )
                        }
                      >
                        <td>
                            <input
                                className="pick"
                                type="checkbox"
                                checked={
                                    selected.includes(
                                    lead.id
                                    )
                                }
                                onClick={(
                                    event
                                ) =>
                                    event.stopPropagation()
                                }
                                onChange={() =>
                                    toggleLead(
                                    lead.id
                                    )
                                }
                            />
                        </td>

                        <td>
                          <b>
                            {
                              lead.leadCode
                            }
                          </b>

                          <small>
                            {
                              lead.status
                            }
                          </small>
                        </td>

                        <td>
                          <b>
                            {
                              lead.companyName
                            }
                          </b>

                          <small>
                            {lead.primaryContactName ||
                              "—"}
                          </small>
                        </td>

                        <td>
                          {lead.industry ||
                            "—"}
                        </td>

                        <td>
                          {lead.source ||
                            "—"}
                        </td>

                        <td>
                          {lead.ownerName ||
                            "—"}
                        </td>

                        <td>
                          <span
                            className={`status ${stageClass(
                              lead.stage
                            )}`}
                          >
                            {
                              lead.stage
                            }
                          </span>
                        </td>

                        <td>
                          <span
                            className={`priority ${priorityClass(
                              lead.priority
                            )}`}
                          >
                            {
                              lead.priority
                            }
                          </span>
                        </td>

                        <td>
                          {formatDate(
                            lead.lastTouchAt
                          )}
                        </td>

                        <td>
                          {lead.nextAction ||
                            "—"}
                        </td>

                        <td>
                          {formatDate(
                            lead.followUpAt
                          )}

                          <small>
                            {formatTime(
                              lead.followUpAt
                            )}
                          </small>
                        </td>
                      </tr>
                    )
                  )}

                  {!leads.length && (
                    <tr>
                      <td
                        colSpan={
                          11
                        }
                      >
                        <div className="empty-state">
                          <h2>
                            No leads
                            found
                          </h2>

                          <p>
                            Clear filters
                            or add a new
                            company lead.
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="table-pagination">
              <span>
                {leads.length}{" "}
                records
              </span>

              <span>
                Page 1 of 1
              </span>
            </div>
          </article>
        )}

      {/* Kanban */}

      {!isLoading &&
        !isError &&
        view ===
          "kanban" && (
          <article className="kanban">
            {LEAD_STAGES.map(
              (
                stageName
              ) => {
                const stageLeads =
                  leads.filter(
                    (lead) =>
                      lead.stage ===
                      stageName
                  );

                return (
                  <section
                    key={
                      stageName
                    }
                    className="kanban-col"
                    onDragOver={(
                      event
                    ) =>
                      event.preventDefault()
                    }
                    onDrop={() =>
                      handleDrop(
                        stageName
                      )
                    }
                  >
                    <header>
                      <span>
                        {stageName}
                      </span>

                      <b>
                        {
                          stageLeads.length
                        }
                      </b>
                    </header>

                    {stageLeads.map(
                      (
                        lead
                      ) => (
                        <article
                            key={lead.id}
                            className="kanban-card"
                            draggable
                            onClick={() =>
                                navigate(
                                `/leads/${lead.id}`
                                )
                            }
                        >
                          <b>
                            {
                              lead.companyName
                            }
                          </b>

                          <small>
                            {lead.primaryContactName ||
                              "—"}{" "}
                            ·{" "}
                            {lead.ownerName ||
                              "—"}
                          </small>

                          <footer>
                            <span
                              className={`priority ${priorityClass(
                                lead.priority
                              )}`}
                            >
                              {
                                lead.priority
                              }
                            </span>

                            <small>
                              {formatDate(
                                lead.followUpAt
                              )}{" "}
                              ·{" "}
                              {lead.stageAgeDays ||
                                0}
                              d
                            </small>
                          </footer>
                        </article>
                      )
                    )}
                  </section>
                );
              }
            )}
          </article>
        )}

      {/* Modals */}

      <LeadFormModal
        open={
          addOpen
        }
        onClose={() =>
          setAddOpen(
            false
          )
        }
      />

      <AssignOwnerModal
        open={
          ownerOpen
        }
        leadIds={
          selected
        }
        onClose={() => {
          setOwnerOpen(
            false
          );

          setSelected([]);
        }}
      />

      <ChangeStageModal
        open={
          stageOpen
        }
        leadIds={
          selected
        }
        initialStage={
          droppedStage
        }
        onClose={() => {
          setStageOpen(
            false
          );

          setSelected([]);
        }}
      />
    </>
  );
};

export default LeadsPage;