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
  useLeadQuery,
} from "./leads.queries.js";

import {
  useActivitiesQuery,
} from "../activities/activities.queries.js";

/*
|--------------------------------------------------------------------------
| Lead Actions
|--------------------------------------------------------------------------
*/

import AssignOwnerModal from "./AssignOwnerModal.jsx";
import ChangeStageModal from "./ChangeStageModal.jsx";
import MarkLostModal from "./MarkLostModal.jsx";

/*
|--------------------------------------------------------------------------
| Activities
|--------------------------------------------------------------------------
*/

import ActivityTimeline from "../activities/ActivityTimeline.jsx";
import AddActivityModal from "../activities/AddActivityModal.jsx";

/*
|--------------------------------------------------------------------------
| Meetings
|--------------------------------------------------------------------------
*/

import LeadMeetingsPanel from "../meetings/LeadMeetingsPanel.jsx";
import ScheduleMeetingModal from "../meetings/ScheduleMeetingModal.jsx";

/*
|--------------------------------------------------------------------------
| Follow-ups
|--------------------------------------------------------------------------
*/

import LeadFollowupsPanel from "../followups/LeadFollowupsPanel.jsx";

/*
|--------------------------------------------------------------------------
| Brief
|--------------------------------------------------------------------------
*/

import LeadBriefPanel from "../briefs/LeadBriefPanel.jsx";

import TeamAssignmentsPanel from "../teamAssignments/TeamAssignmentsPanel.jsx";

/*
|--------------------------------------------------------------------------
| Nurture
|--------------------------------------------------------------------------
*/

import LeadNurturePanel from "../nurture/LeadNurturePanel.jsx";

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
| Format Date
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
  | Known / Existing
  |--------------------------------------------------------------------------
  */

  if (
    lead.knownRelationship
  ) {
    return [
      "Brief",
      "Scope Confirmation",
      "Commercials",
      "Contract / PO",
      "Team Assignment",
      "Pitch",
      "Onboarding",
      "Active Client",
    ];
  }

  /*
  |--------------------------------------------------------------------------
  | New / Unknown
  |--------------------------------------------------------------------------
  */

  return [
    "Brief",
    "Understand Client + Industry",
    "Team Assignment",
    "Pitch",
    "Commercials",
    "Contract / PO",
    "Onboarding",
    "Active Client",
  ];
};

/*
|--------------------------------------------------------------------------
| Lifecycle Placeholder
|--------------------------------------------------------------------------
*/

const LifecyclePlaceholder = ({
  title,
  description,
}) => (
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

/*
|--------------------------------------------------------------------------
| Lead Detail Page
|--------------------------------------------------------------------------
*/

const LeadDetailPage =
  () => {
    const {
      leadId,
    } =
      useParams();

    const navigate =
      useNavigate();

    const {
      user,
    } =
      useAuth();

    /*
    |--------------------------------------------------------------------------
    | Tab
    |--------------------------------------------------------------------------
    */

    const [
      activeTab,
      setActiveTab,
    ] = useState(
      "Overview"
    );

    /*
    |--------------------------------------------------------------------------
    | Modals
    |--------------------------------------------------------------------------
    */

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
      lostModalOpen,
      setLostModalOpen,
    ] = useState(
      false
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
    ] = useState(
      false
    );

    /*
    |--------------------------------------------------------------------------
    | Requested Stage
    |--------------------------------------------------------------------------
    */

    const [
      requestedStage,
      setRequestedStage,
    ] = useState(
      "New"
    );

    /*
    |--------------------------------------------------------------------------
    | Lead
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
    | Contacts Query Params
    |--------------------------------------------------------------------------
    */

    const contactParams =
      useMemo(
        () => ({
          companyId:
            lead?.companyId,

          page: 1,

          limit: 100,

          sort:
            "createdAt",

          direction:
            "asc",
        }),
        [
          lead?.companyId,
        ]
      );

    /*
    |--------------------------------------------------------------------------
    | Contacts
    |--------------------------------------------------------------------------
    */

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
    | Activity Query Params
    |--------------------------------------------------------------------------
    */

    const activityParams =
      useMemo(
        () => ({
          leadId:
            Number(
              leadId
            ),

          page: 1,

          limit: 100,
        }),
        [
          leadId,
        ]
      );

    /*
    |--------------------------------------------------------------------------
    | Activities
    |--------------------------------------------------------------------------
    */

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

    const recentActivities =
      activities.slice(
        0,
        5
      );

    /*
    |--------------------------------------------------------------------------
    | Loading
    |--------------------------------------------------------------------------
    */

    if (
      leadQuery.isLoading
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
    | Error
    |--------------------------------------------------------------------------
    */

    if (
      leadQuery.isError ||
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
    | Call
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
    | Email
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
    | WhatsApp
    |--------------------------------------------------------------------------
    */

    const whatsappContact =
      () => {
        if (
          !lead.primaryContactPhone
        ) {
          return;
        }

        const number =
          String(
            lead.primaryContactPhone
          ).replace(
            /\D/g,
            ""
          );

        window.open(
          `https://wa.me/${number}`,
          "_blank",
          "noopener,noreferrer"
        );
      };

    /*
    |--------------------------------------------------------------------------
    | Open Stage Modal
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
    | Overview
    |--------------------------------------------------------------------------
    */

    const renderOverview =
      () => (
        <div className="detail-grid">
          {/* --------------------------------------------------------------- */}
          {/* Opportunity */}
          {/* --------------------------------------------------------------- */}

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
                  {
                    lead.leadCode
                  }
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

              {/* Opportunity Value */}

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
                  {
                    lead.stage
                  }
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

              {/* Follow-up */}

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

              {/* Route */}

              <div className="info-field">
                <small>
                  Route
                </small>

                <b>
                  {lead.knownRelationship
                    ? "Known / Existing"
                    : "New / Unknown"}
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
            </div>

            {/* ------------------------------------------------------------- */}
            {/* Route Decision */}
            {/* ------------------------------------------------------------- */}

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
              <div className="lead-route-notice mb-3">
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

            {/* ------------------------------------------------------------- */}
            {/* Workflow */}
            {/* ------------------------------------------------------------- */}

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
                        {
                          item
                        }
                      </b>
                    </div>
                  );
                }
              )}
            </div>
          </article>

          {/* --------------------------------------------------------------- */}
          {/* Recent Activity */}
          {/* --------------------------------------------------------------- */}

          <aside className="tl-card">
            <div className="tl-card-head">
              <h2>
                RECENT ACTIVITY
              </h2>

              <button
                type="button"
                className="tl-link"
                onClick={() =>
                  setActiveTab(
                    "Activity Timeline"
                  )
                }
              >
                View all →
              </button>
            </div>

            {activitiesQuery
              .isLoading ? (
              <div className="empty-state">
                Loading
                activities...
              </div>
            ) : recentActivities.length ===
              0 ? (
              <div className="empty-state">
                <h2>
                  No activity yet
                </h2>

                <p>
                  Add the first
                  interaction for
                  this lead.
                </p>

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
            ) : (
              <>
                <div className="timeline">
                  {recentActivities.map(
                    (
                      activity
                    ) => (
                      <div
                        key={
                          activity.id
                        }
                        className="timeline-item"
                      >
                        <b>
                          {activity.activityType ||
                            activity.type ||
                            "Activity"}

                          {activity.outcome
                            ? ` · ${activity.outcome}`
                            : ""}
                        </b>

                        <small>
                          {formatDateTime(
                            activity.occurredAt ||
                              activity.createdAt
                          )}

                          {activity.createdByName
                            ? ` · ${activity.createdByName}`
                            : activity.ownerName
                              ? ` · ${activity.ownerName}`
                              : ""}
                        </small>

                        {activity.notes && (
                          <small>
                            {
                              activity.notes
                            }
                          </small>
                        )}
                      </div>
                    )
                  )}
                </div>

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
              </>
            )}
          </aside>
        </div>
      );

    /*
    |--------------------------------------------------------------------------
    | Contacts
    |--------------------------------------------------------------------------
    */

    const renderContacts =
      () => (
        <article className="tl-card">
          <div className="tl-card-head">
            <h2>
              CONTACTS ·{" "}
              {
                contacts.length
              }
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
              Loading contacts...
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
                          {contact.contactCode ||
                            `CON-${contact.id}`}
                        </td>

                        <td>
                          <b>
                            {contact.name ||
                              contact.fullName ||
                              "—"}
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

    /*
    |--------------------------------------------------------------------------
    | Activity Timeline
    |--------------------------------------------------------------------------
    */

    const renderActivities =
      () => (
        <article className="tl-card">
          <div className="tl-card-head">
            <h2>
              ACTIVITY TIMELINE
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
            <div className="empty-state">
              <h2>
                Unable to load
                activities
              </h2>

              <p>
                {activitiesQuery
                  .error
                  ?.response
                  ?.data
                  ?.message ||
                  "Something went wrong."}
              </p>

              <button
                type="button"
                className="tl-secondary"
                onClick={() =>
                  activitiesQuery.refetch()
                }
              >
                Try again
              </button>
            </div>
          ) : (
            <ActivityTimeline
              activities={
                activities
              }
              loading={
                activitiesQuery.isLoading
              }
              isLoading={
                activitiesQuery.isLoading
              }
            />
          )}
        </article>
      );

    /*
    |--------------------------------------------------------------------------
    | Tab Content
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
          return renderOverview();
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
          return renderContacts();
        }

        /*
        |--------------------------------------------------------------------------
        | Activity
        |--------------------------------------------------------------------------
        */

        if (
          activeTab ===
          "Activity Timeline"
        ) {
          return renderActivities();
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
              lead={
                lead
              }
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
              lead={
                lead
              }
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
            <LeadBriefPanel
              lead={
                lead
              }
            />
          );
        }

        if (
          activeTab ===
          "Pitch"
        ) {
          return (
            <div className="lead-lifecycle-stack">
              <TeamAssignmentsPanel
                lead={lead}
              />

              <LifecyclePlaceholder
                title="Pitch"
                description="Versioned pitch records track team assignment, reviews and client feedback."
              />
            </div>
          );
        }

        /*
        |--------------------------------------------------------------------------
        | Nurture
        |--------------------------------------------------------------------------
        */

        if (
          activeTab ===
          "Nurture"
        ) {
          return (
            <LeadNurturePanel
              lead={
                lead
              }
            />
          );
        }

        /*
        |--------------------------------------------------------------------------
        | Upcoming Modules
        |--------------------------------------------------------------------------
        */

        const descriptions = {
          Commercials:
            "Commercial versions protect negotiation history instead of overwriting it.",

          "Contract / PO":
            "Track final scope, price, payment terms and documents.",

          Onboarding:
            "Mandatory checklist gates protect the move to Active Client.",

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
        {/* Header */}
        {/* --------------------------------------------------------------- */}

        <article className="detail-header">
          {/* Meta */}

          <div className="detail-meta">
            {/* Stage */}

            <span
              className={`status ${statusClass(
                lead.stage
              )}`}
            >
              {lead.stage}
            </span>

            {/* Priority */}

            <span
              className={`priority ${statusClass(
                lead.priority
              )}`}
            >
              {
                lead.priority
              }
            </span>

            {/* Status */}

            <span
              className={`status ${statusClass(
                lead.status
              )}`}
            >
              {
                lead.status
              }
            </span>

            {/* Owner */}

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
            {
              lead.companyName
            }
          </h1>

          {/* Details */}

          <p>
            {lead.industry ||
              "—"}{" "}
            ·{" "}
            {lead.city ||
              "—"}{" "}
            ·{" "}
            {lead.primaryContactName ||
              "—"}

            {lead.primaryContactDesignation
              ? `, ${lead.primaryContactDesignation}`
              : ""}
          </p>

          {/* ------------------------------------------------------------- */}
          {/* Actions */}
          {/* ------------------------------------------------------------- */}

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
              disabled={
                lead.stage ===
                "Lost"
              }
              onClick={() =>
                setLostModalOpen(
                  true
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
        {/* Change Stage */}
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

            leadQuery.refetch();

            activitiesQuery.refetch();
          }}
        />

        {/* --------------------------------------------------------------- */}
        {/* Assign Owner */}
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

          lead={
            lead
          }

          onClose={() => {
            setOwnerModalOpen(
              false
            );

            leadQuery.refetch();
          }}
        />

        {/* --------------------------------------------------------------- */}
        {/* Mark Lost */}
        {/* --------------------------------------------------------------- */}

        <MarkLostModal
          open={
            lostModalOpen
          }
          lead={
            lead
          }
          onClose={() => {
            setLostModalOpen(
              false
            );

            leadQuery.refetch();

            activitiesQuery.refetch();
          }}
        />

        {/* --------------------------------------------------------------- */}
        {/* Add Activity */}
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

            activitiesQuery.refetch();

            leadQuery.refetch();
          }}
        />

        {/* --------------------------------------------------------------- */}
        {/* Schedule Meeting */}
        {/* --------------------------------------------------------------- */}

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
          }}
        />
      </div>
    );
  };

export default LeadDetailPage;