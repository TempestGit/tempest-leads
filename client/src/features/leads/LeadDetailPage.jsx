
import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  BriefcaseBusiness,
  CalendarClock,
  Check,
  CheckCircle2,
  Clock3,
  FileText,
  IndianRupee,
  LoaderCircle,
  Mail,
  MapPin,
  MessageCircle,
  Pencil,
  Phone,
  Plus,
  RefreshCw,
  Sparkles,
  Trash2,
  UserRound,
  Users,
  X,
} from "lucide-react";

import useAuth from "../auth/useAuth.js";
import {
  useContactsQuery,
  useDeleteContactMutation,
} from "../contacts/contacts.queries.js";
import { useLeadQuery } from "./leads.queries.js";
import { useActivitiesQuery } from "../activities/activities.queries.js";

import ContactFormModal from "../contacts/ContactFormModal.jsx";
import LeadFormModal from "./LeadFormModal.jsx";
import AssignOwnerModal from "./AssignOwnerModal.jsx";
import ChangeStageModal from "./ChangeStageModal.jsx";
import MarkLostModal from "./MarkLostModal.jsx";

import ActivityTimeline from "../activities/ActivityTimeline.jsx";
import AddActivityModal from "../activities/AddActivityModal.jsx";
import LeadMeetingsPanel from "../meetings/LeadMeetingsPanel.jsx";
import ScheduleMeetingModal from "../meetings/ScheduleMeetingModal.jsx";
import LeadFollowupsPanel from "../followups/LeadFollowupsPanel.jsx";
import LeadBriefPanel from "../briefs/LeadBriefPanel.jsx";
import TeamAssignmentsPanel from "../teamAssignments/TeamAssignmentsPanel.jsx";
import LeadNurturePanel from "../nurture/LeadNurturePanel.jsx";

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

const WORKFLOW = [
  "Brief",
  "Pitch",
  "Commercials",
  "Contract / PO",
  "Onboarding",
  "Active Client",
];

const formatDateTime = (value) => {
  if (!value) return "—";

  const parsed = new Date(value);

  return Number.isNaN(parsed.getTime())
    ? "—"
    : parsed.toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
      });
};

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

const getInitials = (name) =>
  String(name || "?")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

const statusClass = (value) =>
  String(value || "")
    .toLowerCase()
    .replaceAll(" ", "-")
    .replaceAll("/", "-");

const TAB_ICONS = {
  Overview: BriefcaseBusiness,
  Contacts: Users,
  "Activity Timeline": Activity,
  Meetings: CalendarClock,
  "Follow-ups": Clock3,
  Brief: FileText,
  Pitch: Sparkles,
  Commercials: IndianRupee,
  "Contract / PO": FileText,
  Onboarding: CheckCircle2,
  Nurture: RefreshCw,
  Documents: FileText,
};

function DetailMetric({
  label,
  value,
  hint,
  icon: Icon,
  tone = "blue",
  featured = false,
}) {
  return (
    <article
      className={[
        "gld-metric",
        featured ? "gld-metric-featured" : "",
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="gld-metric-label">{label}</p>
          <h3 className="gld-metric-value mt-3 break-words">
            {value}
          </h3>
        </div>

        <span className="gld-metric-icon" data-tone={tone}>
          <Icon size={21} />
        </span>
      </div>

      <p className="gld-metric-hint mt-auto pt-4">
        {hint}
      </p>
    </article>
  );
}

function SectionHeading({
  title,
  subtitle,
  action,
  icon: Icon,
}) {
  return (
    <div className="gld-section-heading">
      <div className="flex min-w-0 items-center gap-3">
        {Icon && (
          <span className="gld-section-icon">
            <Icon size={19} />
          </span>
        )}

        <div className="min-w-0">
          <h2 className="text-base font-bold">
            {title}
          </h2>

          {subtitle && (
            <p className="gld-muted mt-1 text-xs">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {action}
    </div>
  );
}

function InfoField({ label, value }) {
  return (
    <div className="gld-info-field">
      <span className="gld-info-label">
        {label}
      </span>

      <span className="gld-info-value">
        {value ?? "—"}
      </span>
    </div>
  );
}

function LifecyclePlaceholder({
  title,
  description,
}) {
  return (
    <article className="gld-panel">
      <SectionHeading
        title={title}
        subtitle="Lifecycle workspace"
        icon={FileText}
      />

      <div className="gld-placeholder">
        <span className="gld-placeholder-icon">
          <FileText size={27} />
        </span>

        <h3 className="mt-4 text-base font-bold">
          {title}
        </h3>

        <p className="gld-muted mt-2 max-w-md text-sm">
          {description}
        </p>
      </div>
    </article>
  );
}

function WorkflowProgress({ stage }) {
  const activeIndex = WORKFLOW.indexOf(stage);

  return (
    <div className="gld-workflow">
      {WORKFLOW.map((step, index) => {
        const completed =
          activeIndex >= 0 && index < activeIndex;

        const current =
          activeIndex >= 0 && index === activeIndex;

        return (
          <div
            key={step}
            className={[
              "gld-workflow-step",
              completed ? "is-done" : "",
              current ? "is-current" : "",
            ].join(" ")}
          >
            <span className="gld-workflow-number">
              {completed ? (
                <Check size={15} />
              ) : (
                index + 1
              )}
            </span>

            <span className="gld-workflow-name">
              {step}
            </span>

            {index < WORKFLOW.length - 1 && (
              <span className="gld-workflow-line" />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function LeadDetailPage() {
  const { leadId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [activeTab, setActiveTab] =
    useState("Overview");

  const [editDetailsOpen, setEditDetailsOpen] =
    useState(false);
  const [stageModalOpen, setStageModalOpen] =
    useState(false);
  const [ownerModalOpen, setOwnerModalOpen] =
    useState(false);
  const [lostModalOpen, setLostModalOpen] =
    useState(false);
  const [activityModalOpen, setActivityModalOpen] =
    useState(false);
  const [meetingModalOpen, setMeetingModalOpen] =
    useState(false);
  const [contactModalOpen, setContactModalOpen] =
    useState(false);

  const [editingContact, setEditingContact] =
    useState(null);
  const [deletingContact, setDeletingContact] =
    useState(null);
  const [deleteError, setDeleteError] =
    useState("");

  const [requestedStage, setRequestedStage] =
    useState("New");

  const deleteContactMutation =
    useDeleteContactMutation();

  // Existing API hooks

  const leadQuery = useLeadQuery(leadId);

  const lead = leadQuery.data?.data?.lead || null;

  const contactParams = useMemo(
    () => ({
      companyId: lead?.companyId,
      page: 1,
      limit: 100,
      sort: "createdAt",
      direction: "asc",
    }),
    [lead?.companyId]
  );

  const contactsQuery =
    useContactsQuery(contactParams);

  const contacts = lead
    ? contactsQuery.data?.data?.contacts || []
    : [];

  const activityParams = useMemo(
    () => ({
      leadId: Number(leadId),
      page: 1,
      limit: 100,
    }),
    [leadId]
  );

  const activitiesQuery =
    useActivitiesQuery(activityParams);

  const activities =
    activitiesQuery.data?.data?.activities || [];

  const recentActivities = activities.slice(0, 5);

  // Keep mutations and refetch behavior unchanged.

  const confirmDeleteContact = async () => {
    if (!deletingContact) return;

    setDeleteError("");

    try {
      await deleteContactMutation.mutateAsync(
        deletingContact.id
      );

      setDeletingContact(null);

      await Promise.all([
        contactsQuery.refetch(),
        leadQuery.refetch(),
      ]);
    } catch (error) {
      setDeleteError(
        error?.response?.data?.message ||
          "Unable to delete contact."
      );
    }
  };

  const callContact = () => {
    if (!lead?.primaryContactPhone) return;

    window.location.href =
      `tel:${lead.primaryContactPhone}`;
  };

  const emailContact = () => {
    if (!lead?.primaryContactEmail) return;

    window.location.href =
      `mailto:${lead.primaryContactEmail}`;
  };

  const whatsappContact = () => {
    if (!lead?.primaryContactPhone) return;

    const number = String(
      lead.primaryContactPhone
    ).replace(/\D/g, "");

    window.open(
      `https://wa.me/${number}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  const openStageModal = (nextStage) => {
    setRequestedStage(nextStage || lead?.stage || "New");
    setStageModalOpen(true);
  };

  if (leadQuery.isLoading) {
    return (
      <div className="glass-lead-detail">
        <div className="gld-panel gld-state">
          <LoaderCircle
            size={28}
            className="animate-spin"
          />
          <h2 className="mt-4 text-lg font-bold">
            Loading lead
          </h2>
          <p className="gld-muted mt-2 text-sm">
            Loading CRM profile...
          </p>
        </div>
      </div>
    );
  }

  if (leadQuery.isError || !lead) {
    return (
      <div className="glass-lead-detail">
        <div className="gld-panel gld-state">
          <h2 className="text-lg font-bold">
            Unable to load lead
          </h2>

          <p className="gld-muted mt-2 text-sm">
            {leadQuery.error?.response?.data
              ?.message || "Lead not found."}
          </p>

          <button
            type="button"
            className="gld-button mt-5"
            onClick={() => navigate("/leads")}
          >
            <ArrowLeft size={16} />
            Back to leads
          </button>
        </div>
      </div>
    );
  }

  const renderOverview = () => (
    <div className="grid min-w-0 grid-cols-1 gap-5 xl:grid-cols-3">
      <article className="gld-panel min-w-0 xl:col-span-2">
        <SectionHeading
          title="Opportunity Details"
          subtitle="Commercial and relationship overview"
          icon={BriefcaseBusiness}
        />

        <div className="gld-info-grid">
          <InfoField
            label="Lead ID"
            value={lead.leadCode}
          />

          <InfoField
            label="Potential Requirement"
            value={lead.serviceRequired || "—"}
          />

          <InfoField
            label="Opportunity Value"
            value={formatCurrency(
              lead.estimatedValueRupees
            )}
          />

          <InfoField
            label="Lead Source"
            value={lead.source || "—"}
          />

          <InfoField
            label="Current Stage"
            value={lead.stage}
          />

          <InfoField
            label="Next Action"
            value={lead.nextAction || "—"}
          />

          <InfoField
            label="Follow-up"
            value={formatDateTime(
              lead.followUpAt
            )}
          />

          <InfoField
            label="Last Touch"
            value={formatDateTime(
              lead.lastTouchAt
            )}
          />

          <InfoField
            label="Route"
            value={
              lead.knownRelationship
                ? "Known / Existing"
                : "New / Unknown"
            }
          />

          <InfoField
            label="Stage Age"
            value={`${lead.stageAgeDays || 0} days`}
          />
        </div>

        <div className="gld-section-divider" />

        <SectionHeading
          title="Lifecycle Progress"
          subtitle="Current position in the sales journey"
          icon={TrendingUpIcon}
        />

        {!WORKFLOW.includes(lead.stage) && (
          <div className="gld-route-notice">
            <strong>
              Current stage: {lead.stage}
            </strong>

            <p className="mt-1">
              Route-specific workflow begins after
              the lead reaches Brief.
            </p>
          </div>
        )}

        <WorkflowProgress stage={lead.stage} />
      </article>

      <aside className="gld-panel min-w-0">
        <SectionHeading
          title="Recent Activity"
          subtitle="Latest CRM interactions"
          icon={Activity}
          action={
            <button
              type="button"
              className="gld-text-link"
              onClick={() =>
                setActiveTab("Activity Timeline")
              }
            >
              View all
              <ArrowRight size={15} />
            </button>
          }
        />

        {activitiesQuery.isLoading ? (
          <p className="gld-muted py-8 text-center text-sm">
            Loading activities...
          </p>
        ) : recentActivities.length === 0 ? (
          <div className="gld-placeholder">
            <Activity size={26} />
            <h3 className="mt-3 font-bold">
              No activity yet
            </h3>
            <p className="gld-muted mt-2 text-xs">
              Add the first interaction for this lead.
            </p>
          </div>
        ) : (
          <div className="gld-activity-list">
            {recentActivities.map((activity) => (
              <div
                key={activity.id}
                className="gld-activity-item"
              >
                <span className="gld-activity-marker" />

                <div className="min-w-0">
                  <p className="text-sm font-bold">
                    {activity.activityType ||
                      activity.type ||
                      "Activity"}

                    {activity.outcome
                      ? ` · ${activity.outcome}`
                      : ""}
                  </p>

                  <p className="gld-muted mt-1 text-xs">
                    {formatDateTime(
                      activity.occurredAt ||
                        activity.createdAt
                    )}
                  </p>

                  <p className="gld-muted mt-1 text-xs">
                    {activity.createdByName ||
                      activity.ownerName ||
                      ""}
                  </p>

                  {activity.notes && (
                    <p className="mt-2 break-words text-xs">
                      {activity.notes}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </aside>
    </div>
  );

  const renderContacts = () => (
    <article className="gld-panel">
      <SectionHeading
        title={`Contacts · ${contacts.length}`}
        subtitle="People associated with this company"
        icon={Users}
        action={
          <button
            type="button"
            className="gld-primary"
            onClick={() => {
              setEditingContact(null);
              setContactModalOpen(true);
            }}
          >
            <Plus size={16} />
            Add Contact
          </button>
        }
      />

      {contactsQuery.isLoading ? (
        <div className="gld-placeholder">
          Loading contacts...
        </div>
      ) : contacts.length === 0 ? (
        <div className="gld-placeholder">
          <Users size={28} />
          <h3 className="mt-3 font-bold">
            No contacts
          </h3>
          <p className="gld-muted mt-2 text-sm">
            No contacts are attached to this company.
          </p>
        </div>
      ) : (
        <div className="gld-table-wrap">
          <table className="gld-table">
            <thead>
              <tr>
                <th>Contact ID</th>
                <th>Name</th>
                <th>Designation</th>
                <th>Phone</th>
                <th>Email</th>
                <th>Decision Maker</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {contacts.map((contact) => (
                <tr key={contact.id}>
                  <td>
                    <span className="gld-code">
                      {contact.contactCode ||
                        `CON-${contact.id}`}
                    </span>
                  </td>

                  <td>
                    <div className="flex items-center gap-3">
                      <span className="gld-contact-avatar">
                        {getInitials(
                          contact.name ||
                            contact.fullName
                        )}
                      </span>

                      <strong>
                        {contact.name ||
                          contact.fullName ||
                          "—"}
                      </strong>
                    </div>
                  </td>

                  <td>
                    {contact.designation || "—"}
                  </td>

                  <td>
                    {contact.phone || "—"}
                  </td>

                  <td>
                    {contact.email || "—"}
                  </td>

                  <td>
                    <span
                      className={[
                        "gld-decision-badge",
                        contact.isDecisionMaker
                          ? "is-yes"
                          : "",
                      ].join(" ")}
                    >
                      {contact.isDecisionMaker
                        ? "Yes"
                        : "No"}
                    </span>
                  </td>

                  <td>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        className="gld-icon-button"
                        title="Edit contact"
                        aria-label={`Edit ${
                          contact.name || "contact"
                        }`}
                        onClick={() => {
                          setEditingContact(contact);
                          setContactModalOpen(true);
                        }}
                      >
                        <Pencil size={15} />
                      </button>

                      <button
                        type="button"
                        className="gld-icon-button is-danger"
                        title="Delete contact"
                        aria-label={`Delete ${
                          contact.name || "contact"
                        }`}
                        onClick={() => {
                          setDeleteError("");
                          setDeletingContact(contact);
                        }}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </article>
  );

  const renderActivities = () => (
    <article className="gld-panel">
      <SectionHeading
        title="Activity Timeline"
        subtitle="Complete interaction history"
        icon={Activity}
      />

      {activitiesQuery.isError ? (
        <div className="gld-placeholder">
          <h3 className="font-bold">
            Unable to load activities
          </h3>

          <p className="gld-muted mt-2 text-sm">
            {activitiesQuery.error?.response?.data
              ?.message || "Something went wrong."}
          </p>

          <button
            type="button"
            className="gld-button mt-4"
            onClick={() =>
              activitiesQuery.refetch()
            }
          >
            Try Again
          </button>
        </div>
      ) : (
        <ActivityTimeline
          activities={activities}
          loading={activitiesQuery.isLoading}
          isLoading={activitiesQuery.isLoading}
        />
      )}
    </article>
  );

  const renderTab = () => {
    switch (activeTab) {
      case "Overview":
        return renderOverview();

      case "Contacts":
        return renderContacts();

      case "Activity Timeline":
        return renderActivities();

      case "Meetings":
        return <LeadMeetingsPanel lead={lead} />;

      case "Follow-ups":
        return <LeadFollowupsPanel lead={lead} />;

      case "Brief":
        return <LeadBriefPanel lead={lead} />;

      case "Pitch":
        return (
          <div className="space-y-5">
            <TeamAssignmentsPanel lead={lead} />

            <LifecyclePlaceholder
              title="Pitch"
              description="Versioned pitch records track team assignment, reviews and client feedback."
            />
          </div>
        );

      case "Nurture":
        return <LeadNurturePanel lead={lead} />;

      default: {
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
            title={activeTab}
            description={
              descriptions[activeTab] || ""
            }
          />
        );
      }
    }
  };

  return (
    <div className="glass-lead-detail space-y-5">
      {/* Breadcrumb / Back */}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          className="gld-back"
          onClick={() => navigate("/leads")}
        >
          <ArrowLeft size={17} />
          Back to Leads
        </button>

        <span className="gld-breadcrumb">
          Workspace / Leads /{" "}
          {lead.leadCode || lead.id}
        </span>
      </div>

      {/* Company Hero */}

      <article className="gld-hero">
        <div className="flex flex-wrap items-start gap-4">
          <div className="gld-company-avatar">
            {getInitials(lead.companyName)}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className="gld-badge"
                data-kind="stage"
                data-value={statusClass(lead.stage)}
              >
                {lead.stage}
              </span>

              <span
                className="gld-badge"
                data-kind="priority"
                data-value={statusClass(lead.priority)}
              >
                {lead.priority || "—"}
              </span>

              <span
                className="gld-badge"
                data-kind="status"
                data-value={statusClass(lead.status)}
              >
                {lead.status || "—"}
              </span>
            </div>

            <h1 className="gld-company-name mt-4 break-words">
              {lead.companyName || "Unnamed company"}
            </h1>

            <div className="gld-company-meta mt-3">
              <span>
                <BriefcaseBusiness size={15} />
                {lead.industry || "—"}
              </span>

              <span>
                <MapPin size={15} />
                {lead.city || "—"}
              </span>

              <span>
                <UserRound size={15} />
                {lead.primaryContactName || "—"}
                {lead.primaryContactDesignation
                  ? `, ${lead.primaryContactDesignation}`
                  : ""}
              </span>
            </div>
          </div>

          <div className="gld-owner-card">
            <span className="gld-owner-avatar">
              {getInitials(lead.ownerName)}
            </span>

            <div>
              <p className="gld-muted text-xs">
                Lead Owner
              </p>

              <p className="mt-1 text-sm font-bold">
                {lead.ownerName || "Unassigned"}
              </p>
            </div>
          </div>
        </div>

        {/* Existing Actions */}

        <div className="gld-actions">
          <button
            type="button"
            className="gld-button"
            onClick={() =>
              setEditDetailsOpen(true)
            }
          >
            <Pencil size={15} />
            Edit Details
          </button>

          <button
            type="button"
            className="gld-button"
            disabled={!lead.primaryContactPhone}
            onClick={callContact}
          >
            <Phone size={15} />
            Call
          </button>

          <button
            type="button"
            className="gld-button"
            disabled={!lead.primaryContactEmail}
            onClick={emailContact}
          >
            <Mail size={15} />
            Email
          </button>

          <button
            type="button"
            className="gld-button"
            disabled={!lead.primaryContactPhone}
            onClick={whatsappContact}
          >
            <MessageCircle size={15} />
            WhatsApp
          </button>

          <button
            type="button"
            className="gld-button"
            onClick={() =>
              setMeetingModalOpen(true)
            }
          >
            <CalendarClock size={15} />
            Schedule Meeting
          </button>

          <button
            type="button"
            className="gld-button"
            onClick={() =>
              setActivityModalOpen(true)
            }
          >
            <Plus size={15} />
            Add Activity
          </button>

          {user?.role === "SUPER_ADMIN" && (
            <button
              type="button"
              className="gld-button"
              onClick={() =>
                setOwnerModalOpen(true)
              }
            >
              <Users size={15} />
              Change Owner
            </button>
          )}

          <button
            type="button"
            className="gld-primary"
            onClick={() =>
              openStageModal(lead.stage)
            }
          >
            <RefreshCw size={15} />
            Change Stage
          </button>

          <button
            type="button"
            className="gld-danger"
            disabled={lead.stage === "Lost"}
            onClick={() =>
              setLostModalOpen(true)
            }
          >
            <X size={15} />
            Mark Lost
          </button>
        </div>
      </article>

      {/* Bento Metrics */}

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <DetailMetric
          label="Opportunity Value"
          value={formatCurrency(
            lead.estimatedValueRupees
          )}
          hint="Estimated deal value"
          icon={IndianRupee}
          featured
        />

        <DetailMetric
          label="Current Stage"
          value={lead.stage || "—"}
          hint={`${lead.stageAgeDays || 0} days in stage`}
          icon={BriefcaseBusiness}
          tone="violet"
        />

        <DetailMetric
          label="Next Follow-up"
          value={formatDateTime(
            lead.followUpAt
          )}
          hint="Scheduled next interaction"
          icon={CalendarClock}
          tone="orange"
        />

        <DetailMetric
          label="Company Contacts"
          value={contacts.length}
          hint="Contacts linked to this company"
          icon={Users}
          tone="green"
        />
      </section>

      {/* Tabs */}

      <nav
        className="gld-tabs"
        aria-label="Lead detail sections"
      >
        {TABS.map((tab) => {
          const Icon = TAB_ICONS[tab];

          return (
            <button
              key={tab}
              type="button"
              className={[
                "gld-tab",
                activeTab === tab
                  ? "is-active"
                  : "",
              ].join(" ")}
              aria-current={
                activeTab === tab
                  ? "page"
                  : undefined
              }
              onClick={() => setActiveTab(tab)}
            >
              {/* <Icon size={10} /> */}
              {tab}
            </button>
          );
        })}
      </nav>

      {/* Active Tab */}

      <section className="min-w-0">
        {renderTab()}
      </section>

      {/* Existing Modals */}

      <LeadFormModal
        open={editDetailsOpen}
        mode="edit"
        lead={lead}
        onClose={() => {
          setEditDetailsOpen(false);
          leadQuery.refetch();
          contactsQuery.refetch();
        }}
      />

      <ChangeStageModal
        open={stageModalOpen}
        leadIds={[Number(lead.id)]}
        initialStage={requestedStage}
        onClose={() => {
          setStageModalOpen(false);
          leadQuery.refetch();
          activitiesQuery.refetch();
        }}
      />

      <AssignOwnerModal
        open={ownerModalOpen}
        leadIds={[Number(lead.id)]}
        lead={lead}
        onClose={() => {
          setOwnerModalOpen(false);
          leadQuery.refetch();
        }}
      />

      <MarkLostModal
        open={lostModalOpen}
        lead={lead}
        onClose={() => {
          setLostModalOpen(false);
          leadQuery.refetch();
          activitiesQuery.refetch();
        }}
      />

      <AddActivityModal
        open={activityModalOpen}
        lead={lead}
        onClose={() => {
          setActivityModalOpen(false);
          activitiesQuery.refetch();
          leadQuery.refetch();
        }}
      />

      <ContactFormModal
        open={contactModalOpen}
        contact={editingContact}
        fixedCompanyId={lead.companyId}
        fixedCompanyName={lead.companyName}
        onClose={() => {
          setContactModalOpen(false);
          setEditingContact(null);
          contactsQuery.refetch();
        }}
      />

      <ScheduleMeetingModal
        open={meetingModalOpen}
        lead={lead}
        onClose={() => {
          setMeetingModalOpen(false);
          leadQuery.refetch();
        }}
      />

      {/* Delete Contact Confirmation */}

      {deletingContact && (
        <div className="modal-backdrop">
          <section
            className="tl-modal gld-delete-modal"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-contact-title"
          >
            <header className="modal-head">
              <h2 id="delete-contact-title">
                Delete Contact
              </h2>

              <button
                type="button"
                className="gld-icon-button"
                disabled={
                  deleteContactMutation.isPending
                }
                aria-label="Close"
                onClick={() =>
                  setDeletingContact(null)
                }
              >
                <X size={17} />
              </button>
            </header>

            <div className="modal-body">
              <p>
                Delete{" "}
                <strong>
                  {deletingContact.name ||
                    deletingContact.fullName ||
                    "this contact"}
                </strong>
                ?
              </p>

              <p className="gld-muted mt-2 text-sm">
                The contact will be removed from
                active contact lists.
              </p>

              {deleteError && (
                <div className="error-box mt-4">
                  {deleteError}
                </div>
              )}
            </div>

            <footer className="modal-foot">
              <button
                type="button"
                className="tl-secondary"
                disabled={
                  deleteContactMutation.isPending
                }
                onClick={() =>
                  setDeletingContact(null)
                }
              >
                Cancel
              </button>

              <button
                type="button"
                className="tl-danger"
                disabled={
                  deleteContactMutation.isPending
                }
                onClick={confirmDeleteContact}
              >
                {deleteContactMutation.isPending ? (
                  <>
                    <LoaderCircle
                      size={15}
                      className="animate-spin"
                    />
                    Deleting...
                  </>
                ) : (
                  "Delete Contact"
                )}
              </button>
            </footer>
          </section>
        </div>
      )}
    </div>
  );
}

// Local icon alias used by the lifecycle section.
function TrendingUpIcon(props) {
  return <ArrowRight {...props} />;
}
