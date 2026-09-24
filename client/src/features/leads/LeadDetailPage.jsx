import {
  useMemo,
  useState,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import useAuth from "../auth/useAuth.js";

import {
  useContactsQuery,
} from "../contacts/contacts.queries.js";

import {
  useActivitiesQuery,
} from "../activities/activities.queries.js";

import ActivityTimeline from "../activities/ActivityTimeline.jsx";
import AddActivityModal from "../activities/AddActivityModal.jsx";
import LeadMeetingsPanel from "../meetings/LeadMeetingsPanel.jsx";
import ScheduleMeetingModal from "../meetings/ScheduleMeetingModal.jsx";
import LeadFollowupsPanel from "../followups/LeadFollowupsPanel.jsx";

import {
  useLeadQuery,
} from "./leads.queries.js";

import AssignOwnerModal from "./AssignOwnerModal.jsx";

import ChangeStageModal from "./ChangeStageModal.jsx";

/*
|--------------------------------------------------------------------------
| Tabs
|--------------------------------------------------------------------------
*/

const TABS = [
  "Overview",
  "Contacts",
  "Activity Timeline",
  "Meetings",
  "Follow-ups",
  "Brief",
  "Pitch",
  "Commercials",
  "Contract / PO",
  "Onboarding",
  "Nurture",
  "Documents",
];

/*
|--------------------------------------------------------------------------
| Date Time
|--------------------------------------------------------------------------
*/

const formatDateTime = (
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

  return date.toLocaleString(
    "en-IN",
    {
      dateStyle:
        "medium",

      timeStyle:
        "short",
    }
  );
};

/*
|--------------------------------------------------------------------------
| Currency
|--------------------------------------------------------------------------
*/

const formatCurrency = (
  value
) => {
  const amount =
    Number(
      value || 0
    );

  return new Intl.NumberFormat(
    "en-IN",
    {
      style:
        "currency",

      currency:
        "INR",

      maximumFractionDigits:
        0,
    }
  ).format(
    amount
  );
};

/*
|--------------------------------------------------------------------------
| Status Class
|--------------------------------------------------------------------------
*/

const statusClass = (
  value
) =>
  String(
    value || ""
  )
    .toLowerCase()
    .replaceAll(
      " ",
      "-"
    )
    .replaceAll(
      "/",
      "-"
    );

/*
|--------------------------------------------------------------------------
| Workflow
|--------------------------------------------------------------------------
*/

const getWorkflow = (
  lead
) => {
  /*
  |--------------------------------------------------------------------------
  | Known / Existing Client
  |--------------------------------------------------------------------------
  */

  if (
    lead.knownRelationship
  ) {
    return [
      "Brief",
      "Commercials",
      "Contract / PO",
      "Onboarding",
      "Active Client",
      "Pitch",
    ];
  }

  /*
  |--------------------------------------------------------------------------
  | New / Unknown Lead
  |--------------------------------------------------------------------------
  */

  return [
    "Brief",
    "Pitch",
    "Commercials",
    "Contract / PO",
    "Onboarding",
    "Active Client",
  ];
};

/*
|--------------------------------------------------------------------------
| Placeholder Tab
|--------------------------------------------------------------------------
*/

const LifecyclePlaceholder = ({
  title,
  description,
}) => {
  return (
    <article className="tl-card">
      <div className="tl-card-head">
        <h2>
          {title.toUpperCase()}
        </h2>
      </div>

      <p className="muted">
        {description}
      </p>
    </article>
  );
};

/*
|--------------------------------------------------------------------------
| Lead Detail Page
|--------------------------------------------------------------------------
*/

const LeadDetailPage =
  () => {
    /*
    |--------------------------------------------------------------------------
    | Router
    |--------------------------------------------------------------------------
    */

    const {
      leadId,
    } =
      useParams();

    const navigate =
      useNavigate();

    /*
    |--------------------------------------------------------------------------
    | Auth
    |--------------------------------------------------------------------------
    */

    const {
      user,
    } =
      useAuth();

    /*
    |--------------------------------------------------------------------------
    | UI State
    |--------------------------------------------------------------------------
    */

    const [
      activeTab,
      setActiveTab,
    ] = useState(
      "Overview"
    );

    const [
      stageModalOpen,
      setStageModalOpen,
    ] = useState(
      false
    );

    const [
      ownerModalOpen,
      setOwnerModalOpen,
    ] = useState(
      false
    );

    const [
      requestedStage,
      setRequestedStage,
    ] = useState(
      "New"
    );

    const [
      activityModalOpen,
      setActivityModalOpen,
    ] = useState(
      false
    );

    const [
      meetingModalOpen,
      setMeetingModalOpen,
    ] = useState(false);

    /*
    |--------------------------------------------------------------------------
    | Lead Query
    |--------------------------------------------------------------------------
    */

    const leadQuery =
      useLeadQuery(
        leadId
      );

    const lead =
      leadQuery.data
        ?.data
        ?.lead ||
      null;

    /*
    |--------------------------------------------------------------------------
    | Contacts Query
    |--------------------------------------------------------------------------
    */

    const contactParams =
      useMemo(
        () => ({
          companyId:
            lead
              ?.companyId,

          page: 1,

          limit: 100,

          sort:
            "createdAt",

          direction:
            "asc",
        }),
        [
          lead
            ?.companyId,
        ]
      );

    const contactsQuery =
      useContactsQuery(
        contactParams
      );

    const contacts =
      lead
        ? contactsQuery
            .data
            ?.data
            ?.contacts ||
          []
        : [];

    /*
    |--------------------------------------------------------------------------
    | Activity Query
    |--------------------------------------------------------------------------
    |
    | Important:
    |
    | Keep this hook before loading/error returns.
    | React hooks must never be called conditionally.
    |
    */

    const activityParams =
      useMemo(
        () => ({
          leadId:
            Number(
              leadId
            ),

          page:
            1,

          limit:
            100,
        }),
        [
          leadId,
        ]
      );

    const activitiesQuery =
      useActivitiesQuery(
        activityParams
      );

    const activities =
      activitiesQuery
        .data
        ?.data
        ?.activities ||
      [];

    /*
    |--------------------------------------------------------------------------
    | Loading
    |--------------------------------------------------------------------------
    */

    if (
      leadQuery
        .isLoading
    ) {
      return (
        <article className="tl-card">
          <div className="empty-state">
            <h2>
              Loading lead
            </h2>

            <p>
              Loading CRM
              profile...
            </p>
          </div>
        </article>
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Lead Error
    |--------------------------------------------------------------------------
    */

    if (
      leadQuery
        .isError ||
      !lead
    ) {
      return (
        <article className="tl-card">
          <div className="empty-state">
            <h2>
              Unable to load
              lead
            </h2>

            <p>
              {leadQuery
                .error
                ?.response
                ?.data
                ?.message ||
                "Lead not found."}
            </p>

            <button
              type="button"
              className="tl-secondary"
              onClick={() =>
                navigate(
                  "/leads"
                )
              }
            >
              Back to leads
            </button>
          </div>
        </article>
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Quick Action - Call
    |--------------------------------------------------------------------------
    */

    const callContact =
      () => {
        if (
          !lead.primaryContactPhone
        ) {
          return;
        }

        window.location.href =
          `tel:${lead.primaryContactPhone}`;
      };

    /*
    |--------------------------------------------------------------------------
    | Quick Action - Email
    |--------------------------------------------------------------------------
    */

    const emailContact =
      () => {
        if (
          !lead.primaryContactEmail
        ) {
          return;
        }

        window.location.href =
          `mailto:${lead.primaryContactEmail}`;
      };

    /*
    |--------------------------------------------------------------------------
    | Quick Action - WhatsApp
    |--------------------------------------------------------------------------
    */

    const whatsappContact =
      () => {
        if (
          !lead.primaryContactPhone
        ) {
          return;
        }

        let number =
          String(
            lead.primaryContactPhone
          ).replace(
            /\D/g,
            ""
          );

        /*
        |--------------------------------------------------------------------------
        | India Default
        |--------------------------------------------------------------------------
        |
        | If the DB contains a normal 10-digit Indian mobile number,
        | prepend country code 91.
        |
        */

        if (
          number.length ===
          10
        ) {
          number =
            `91${number}`;
        }

        window.open(
          `https://wa.me/${number}`,
          "_blank",
          "noopener,noreferrer"
        );
      };

    /*
    |--------------------------------------------------------------------------
    | Stage Modal
    |--------------------------------------------------------------------------
    */

    const openStageModal =
      (
        nextStage =
          lead.stage
      ) => {
        setRequestedStage(
          nextStage
        );

        setStageModalOpen(
          true
        );
      };

    /*
    |--------------------------------------------------------------------------
    | Workflow
    |--------------------------------------------------------------------------
    */

    const workflow =
      getWorkflow(
        lead
      );

    const workflowIndex =
      workflow.indexOf(
        lead.stage
      );

    /*
    |--------------------------------------------------------------------------
    | Activity Error
    |--------------------------------------------------------------------------
    */

    const renderActivityError =
      () => (
        <div className="empty-state">
          <h2>
            Unable to load
            activity
          </h2>

          <p>
            {activitiesQuery
              .error
              ?.response
              ?.data
              ?.message ||
              "Something went wrong while loading the activity timeline."}
          </p>

          <button
            type="button"
            className="tl-secondary"
            onClick={() =>
              activitiesQuery
                .refetch()
            }
          >
            Try again
          </button>
        </div>
      );

    /*
    |--------------------------------------------------------------------------
    | Render Tab
    |--------------------------------------------------------------------------
    */

    const renderTab =
      () => {
        /*
        |--------------------------------------------------------------------------
        | Overview
        |--------------------------------------------------------------------------
        */

        if (
          activeTab ===
          "Overview"
        ) {
          return (
            <div className="detail-grid">
              {/* ---------------------------------------------------------- */}
              {/* Opportunity */}
              {/* ---------------------------------------------------------- */}

              <article className="tl-card">
                <div className="tl-card-head">
                  <h2>
                    OPPORTUNITY
                  </h2>
                </div>

                <div className="info-grid">
                  {/* Lead ID */}

                  <div className="info-field">
                    <small>
                      Lead ID
                    </small>

                    <b>
                      {lead.leadCode}
                    </b>
                  </div>

                  {/* Requirement */}

                  <div className="info-field">
                    <small>
                      Potential
                      requirement
                    </small>

                    <b>
                      {lead.serviceRequired ||
                        "—"}
                    </b>
                  </div>

                  {/* Value */}

                  <div className="info-field">
                    <small>
                      Opportunity
                      value
                    </small>

                    <b>
                      {formatCurrency(
                        lead.estimatedValueRupees
                      )}
                    </b>
                  </div>

                  {/* Source */}

                  <div className="info-field">
                    <small>
                      Lead source
                    </small>

                    <b>
                      {lead.source ||
                        "—"}
                    </b>
                  </div>

                  {/* Stage */}

                  <div className="info-field">
                    <small>
                      Current stage
                    </small>

                    <b>
                      {lead.stage}
                    </b>
                  </div>

                  {/* Next Action */}

                  <div className="info-field">
                    <small>
                      Next action
                    </small>

                    <b>
                      {lead.nextAction ||
                        "—"}
                    </b>
                  </div>

                  {/* Follow Up */}

                  <div className="info-field">
                    <small>
                      Follow-up
                    </small>

                    <b>
                      {formatDateTime(
                        lead.followUpAt
                      )}
                    </b>
                  </div>

                  {/* Route */}

                  <div className="info-field">
                    <small>
                      Route
                    </small>

                    <b>
                      {lead.knownRelationship
                        ? "Known / existing: commercials first"
                        : "New / unknown: pitch first"}
                    </b>
                  </div>

                  {/* Stage Age */}

                  <div className="info-field">
                    <small>
                      Stage age
                    </small>

                    <b>
                      {lead.stageAgeDays ||
                        0}{" "}
                      days
                    </b>
                  </div>

                  {/* Last Touch */}

                  <div className="info-field">
                    <small>
                      Last touch
                    </small>

                    <b>
                      {formatDateTime(
                        lead.lastTouchAt
                      )}
                    </b>
                  </div>
                </div>

                {/* ---------------------------------------------------------- */}
                {/* Route Decision */}
                {/* ---------------------------------------------------------- */}

                <div
                  className="tl-card-head"
                  style={{
                    margin:
                      "22px 0 10px",
                  }}
                >
                  <h2>
                    ROUTE DECISION
                  </h2>
                </div>

                {workflowIndex ===
                  -1 && (
                  <div className="lead-route-notice">
                    <b>
                      Current stage:{" "}
                      {lead.stage}
                    </b>

                    <span>
                      Route-specific
                      workflow begins
                      after the lead
                      reaches Brief.
                    </span>
                  </div>
                )}

                <div className="workflow">
                  {workflow.map(
                    (
                      item,
                      index
                    ) => {
                      let state =
                        "";

                      if (
                        workflowIndex >=
                        0
                      ) {
                        if (
                          index <
                          workflowIndex
                        ) {
                          state =
                            "done";
                        }

                        if (
                          index ===
                          workflowIndex
                        ) {
                          state =
                            "current";
                        }
                      }

                      return (
                        <div
                          key={
                            item
                          }
                          className={`workflow-step ${state}`}
                        >
                          <i>
                            {index +
                              1}
                          </i>

                          <b>
                            {item}
                          </b>
                        </div>
                      );
                    }
                  )}
                </div>
              </article>

              {/* ---------------------------------------------------------- */}
              {/* Recent Activity */}
              {/* ---------------------------------------------------------- */}

              <aside className="tl-card">
                <div className="tl-card-head">
                  <h2>
                    RECENT ACTIVITY
                  </h2>

                  <button
                    type="button"
                    className="tl-link"
                    onClick={() =>
                      setActivityModalOpen(
                        true
                      )
                    }
                  >
                    + Add activity
                  </button>
                </div>

                {activitiesQuery
                  .isError ? (
                  renderActivityError()
                ) : (
                  <ActivityTimeline
                    activities={
                      activities
                    }
                    loading={
                      activitiesQuery
                        .isLoading
                    }
                    compact
                  />
                )}
              </aside>
            </div>
          );
        }

        /*
        |--------------------------------------------------------------------------
        | Contacts
        |--------------------------------------------------------------------------
        */

        if (
          activeTab ===
          "Contacts"
        ) {
          return (
            <article className="tl-card">
              <div className="tl-card-head">
                <h2>
                  CONTACTS ·{" "}
                  {contacts.length}
                </h2>

                <button
                  type="button"
                  className="tl-primary"
                  onClick={() =>
                    navigate(
                      "/contacts"
                    )
                  }
                >
                  + Add contact
                </button>
              </div>

              {contactsQuery
                .isLoading ? (
                <div className="empty-state">
                  <p>
                    Loading
                    contacts...
                  </p>
                </div>
              ) : contactsQuery
                  .isError ? (
                <div className="empty-state">
                  <h2>
                    Unable to load
                    contacts
                  </h2>

                  <p>
                    {contactsQuery
                      .error
                      ?.response
                      ?.data
                      ?.message ||
                      "Something went wrong while loading contacts."}
                  </p>

                  <button
                    type="button"
                    className="tl-secondary"
                    onClick={() =>
                      contactsQuery
                        .refetch()
                    }
                  >
                    Try again
                  </button>
                </div>
              ) : contacts.length ===
                0 ? (
                <div className="empty-state">
                  <h2>
                    No contacts
                  </h2>

                  <p>
                    No contacts are
                    attached to this
                    company.
                  </p>
                </div>
              ) : (
                <div className="table-wrap">
                  <table className="tl-table">
                    <thead>
                      <tr>
                        <th>
                          Contact ID
                        </th>

                        <th>
                          Name
                        </th>

                        <th>
                          Designation
                        </th>

                        <th>
                          Phone
                        </th>

                        <th>
                          Email
                        </th>

                        <th>
                          Decision
                          maker
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {contacts.map(
                        (
                          contact
                        ) => (
                          <tr
                            key={
                              contact.id
                            }
                          >
                            <td>
                              {contact.contactCode}
                            </td>

                            <td>
                              <b>
                                {contact.name}
                              </b>
                            </td>

                            <td>
                              {contact.designation ||
                                "—"}
                            </td>

                            <td>
                              {contact.phone ||
                                "—"}
                            </td>

                            <td>
                              {contact.email ||
                                "—"}
                            </td>

                            <td>
                              {contact.isDecisionMaker
                                ? "Yes"
                                : "No"}
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </article>
          );
        }

        /*
        |--------------------------------------------------------------------------
        | Activity Timeline
        |--------------------------------------------------------------------------
        */

        if (
          activeTab ===
          "Activity Timeline"
        ) {
          return (
            <article className="tl-card">
              <div className="tl-card-head">
                <h2>
                  ACTIVITY HISTORY
                </h2>

                <button
                  type="button"
                  className="tl-primary"
                  onClick={() =>
                    setActivityModalOpen(
                      true
                    )
                  }
                >
                  + Add activity
                </button>
              </div>

              {activitiesQuery
                .isError ? (
                  renderActivityError()
                ) : (
                  <ActivityTimeline
                    activities={
                      activities
                    }
                    loading={
                      activitiesQuery
                        .isLoading
                    }
                  />
                )}
            </article>
          );
        }

        /*
        |--------------------------------------------------------------------------
        | Meetings
        |--------------------------------------------------------------------------
        */

        if (
          activeTab ===
          "Meetings"
        ) {
          return (
            <LeadMeetingsPanel
              lead={lead}
            />
          );
        }

        /*
        |--------------------------------------------------------------------------
        | Follow-ups
        |--------------------------------------------------------------------------
        */

        if (
          activeTab ===
          "Follow-ups"
        ) {
          return (
            <LeadFollowupsPanel
              lead={lead}
            />
          );
        }

        /*
        |--------------------------------------------------------------------------
        | Brief
        |--------------------------------------------------------------------------
        */

        if (
          activeTab ===
          "Brief"
        ) {
          return (
            <article className="tl-card">
              <div className="tl-card-head">
                <h2>
                  BRIEF
                </h2>
              </div>

              <p className="muted">
                Capture a
                structured brief
                before the
                opportunity moves
                forward.
              </p>

              <div className="info-grid">
                <div className="info-field">
                  <small>
                    Status
                  </small>

                  <b>
                    Awaiting
                    clarification
                  </b>
                </div>

                <div className="info-field">
                  <small>
                    Known client /
                    industry
                  </small>

                  <b>
                    {lead.knownRelationship
                      ? "Known / Existing"
                      : "New / Unknown"}
                  </b>
                </div>
              </div>
            </article>
          );
        }

        /*
        |--------------------------------------------------------------------------
        | Remaining Lifecycle Tabs
        |--------------------------------------------------------------------------
        */

        const descriptions =
          {
            Pitch:
              "Versioned pitch records track team assignment, reviews and client feedback.",

            Commercials:
              "Commercial versions protect negotiation history instead of overwriting it.",

            "Contract / PO":
              "Track final scope, price, payment terms and documents.",

            Onboarding:
              "Mandatory checklist gates protect the move to Active Client.",

            Nurture:
              "Lost, later and no-response contacts stay in the database and can reconnect.",

            Documents:
              "Document storage is ready for a future secure file service.",
          };

        return (
          <LifecyclePlaceholder
            title={
              activeTab
            }
            description={
              descriptions[
                activeTab
              ] ||
              ""
            }
          />
        );
      };

    /*
    |--------------------------------------------------------------------------
    | Render
    |--------------------------------------------------------------------------
    */

    return (
      <div className="lead-detail-page">
        {/* --------------------------------------------------------------- */}
        {/* Back */}
        {/* --------------------------------------------------------------- */}

        <button
          type="button"
          className="lead-back-btn"
          onClick={() =>
            navigate(
              "/leads"
            )
          }
        >
          <span aria-hidden="true">
            ←
          </span>

          Back to leads
        </button>

        {/* --------------------------------------------------------------- */}
        {/* Detail Header */}
        {/* --------------------------------------------------------------- */}

        <article className="detail-header">
          {/* Meta */}

          <div className="detail-meta">
            <span
              className={`status ${statusClass(
                lead.stage
              )}`}
            >
              {lead.stage}
            </span>

            <span
              className={`priority ${statusClass(
                lead.priority
              )}`}
            >
              {lead.priority}
            </span>

            <span
              className={`status ${statusClass(
                lead.status
              )}`}
            >
              {lead.status}
            </span>

            <span className="lead-owner">
              Owner:{" "}
              <b>
                {lead.ownerName ||
                  "—"}
              </b>
            </span>
          </div>

          {/* Company */}

          <h1>
            {lead.companyName}
          </h1>

          <p>
            {lead.industry ||
              "—"}
            {" · "}

            {lead.city ||
              "—"}
            {" · "}

            {lead.primaryContactName ||
              "—"}

            {lead.primaryContactDesignation
              ? `, ${lead.primaryContactDesignation}`
              : ""}
          </p>

          {/* Actions */}

          <div className="detail-actions">
            {/* Call */}

            <button
              type="button"
              className="tl-secondary"
              disabled={
                !lead.primaryContactPhone
              }
              onClick={
                callContact
              }
            >
              Call
            </button>

            {/* Email */}

            <button
              type="button"
              className="tl-secondary"
              disabled={
                !lead.primaryContactEmail
              }
              onClick={
                emailContact
              }
            >
              Email
            </button>

            {/* WhatsApp */}

            <button
              type="button"
              className="tl-secondary"
              disabled={
                !lead.primaryContactPhone
              }
              onClick={
                whatsappContact
              }
            >
              WhatsApp
            </button>

            {/* Meeting */}

            <button
              type="button"
              className="tl-secondary"
              onClick={() =>
                setMeetingModalOpen(
                  true
                )
              }
            >
              Schedule Meeting
            </button>

            {/* Activity */}

            <button
              type="button"
              className="tl-secondary"
              onClick={() =>
                setActivityModalOpen(
                  true
                )
              }
            >
              Add Activity
            </button>

            {/* Owner */}

            {user?.role ===
              "SUPER_ADMIN" && (
              <button
                type="button"
                className="tl-secondary"
                onClick={() =>
                  setOwnerModalOpen(
                    true
                  )
                }
              >
                Change Owner
              </button>
            )}

            {/* Stage */}

            <button
              type="button"
              className="tl-primary"
              onClick={() =>
                openStageModal(
                  lead.stage
                )
              }
            >
              Change stage
            </button>

            {/* Lost */}

            <button
              type="button"
              className="tl-danger"
              onClick={() =>
                openStageModal(
                  "Lost"
                )
              }
            >
              Mark lost
            </button>
          </div>
        </article>

        {/* --------------------------------------------------------------- */}
        {/* Tabs */}
        {/* --------------------------------------------------------------- */}

        <div className="tl-tabs">
          {TABS.map(
            (
              tab
            ) => (
              <button
                key={
                  tab
                }
                type="button"
                className={`tl-tab ${
                  activeTab ===
                  tab
                    ? "active"
                    : ""
                }`}
                onClick={() =>
                  setActiveTab(
                    tab
                  )
                }
              >
                {tab}
              </button>
            )
          )}
        </div>

        {/* --------------------------------------------------------------- */}
        {/* Tab Content */}
        {/* --------------------------------------------------------------- */}

        <section>
          {renderTab()}
        </section>

        {/* --------------------------------------------------------------- */}
        {/* Change Stage Modal */}
        {/* --------------------------------------------------------------- */}

        <ChangeStageModal
          open={
            stageModalOpen
          }
          leadIds={[
            Number(
              lead.id
            ),
          ]}
          initialStage={
            requestedStage
          }
          onClose={() => {
            setStageModalOpen(
              false
            );

            /*
            |--------------------------------------------------------------------------
            | Stage change modifies:
            |
            | - Lead
            | - Stage history
            | - Activity history
            |--------------------------------------------------------------------------
            */

            leadQuery
              .refetch();

            activitiesQuery
              .refetch();
          }}
        />

        {/* --------------------------------------------------------------- */}
        {/* Assign Owner Modal */}
        {/* --------------------------------------------------------------- */}

        <AssignOwnerModal
          open={
            ownerModalOpen
          }
          leadIds={[
            Number(
              lead.id
            ),
          ]}
          onClose={() => {
            setOwnerModalOpen(
              false
            );

            /*
            |--------------------------------------------------------------------------
            | Owner change creates an activity too.
            |--------------------------------------------------------------------------
            */

            leadQuery
              .refetch();

            activitiesQuery
              .refetch();
          }}
        />

        {/* --------------------------------------------------------------- */}
        {/* Add Activity Modal */}
        {/* --------------------------------------------------------------- */}

        <AddActivityModal
          open={
            activityModalOpen
          }
          lead={
            lead
          }
          onClose={() => {
            setActivityModalOpen(
              false
            );

            /*
            |--------------------------------------------------------------------------
            | Adding activity may modify:
            |
            | - Last touch
            | - Next action
            | - Follow-up
            | - Activity timeline
            |--------------------------------------------------------------------------
            */

            leadQuery
              .refetch();

            activitiesQuery
              .refetch();
          }}
        />

        <ScheduleMeetingModal
          open={
            meetingModalOpen
          }
          lead={
            lead
          }
          onClose={() => {
            setMeetingModalOpen(
              false
            );

            leadQuery.refetch();

            activitiesQuery.refetch();
          }}
        />
      </div>
    );
  };

export default LeadDetailPage;