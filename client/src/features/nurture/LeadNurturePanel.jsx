
import { useState } from "react";

import {
  AlertCircle,
  BriefcaseBusiness,
  CalendarClock,
  Clock3,
  Globe2,
  HeartHandshake,
  Layers3,
  MessageCircle,
  RefreshCw,
  Tag,
  UserRound,
  Users,
} from "lucide-react";

import { useNurtureLeadQuery } from "./nurture.queries.js";
import ScheduleReconnectModal from "./ScheduleReconnectModal.jsx";

import "./nurture-glass.css";

const formatDateTime = (value) => {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

const communicationLabel = (value) =>
  String(value || "NOT_CONTACTED")
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/^\w/, (character) => character.toUpperCase());

const DetailField = ({ icon: Icon, label, value }) => (
  <div className="gn-detail-field rounded-xl p-4">
    <div className="flex items-center gap-2">
      <Icon size={16} className="gn-detail-icon" />

      <span className="gn-muted text-xs font-semibold">
        {label}
      </span>
    </div>

    <p className="gn-heading mt-3 break-words text-sm font-bold">
      {value || "—"}
    </p>
  </div>
);

const LeadNurturePanel = ({ lead }) => {
  const [reconnectOpen, setReconnectOpen] = useState(false);

  const eligible = ["Nurture", "Lost"].includes(lead?.stage);

  const query = useNurtureLeadQuery(lead?.id, {
    enabled: Boolean(eligible && lead?.id),
  });

  const nurture = query.data?.data?.nurture;

  if (!eligible) {
    return (
      <article className="gn-panel rounded-3xl p-6">
        <div className="flex items-center gap-3">
          <HeartHandshake size={22} className="gn-detail-icon" />

          <h2 className="gn-heading text-lg font-extrabold">
            Nurture
          </h2>
        </div>

        <div className="gn-empty mt-6 rounded-2xl p-8 text-center">
          <HeartHandshake
            size={36}
            className="gn-detail-icon mx-auto mb-4"
          />

          <h3 className="gn-heading text-base font-bold">
            Not in nurture
          </h3>

          <p className="gn-muted mt-2 text-sm leading-6">
            This lead is currently in the{" "}
            <strong>{lead?.stage || "unknown"}</strong> stage.
            Lost, later and no-response contacts can be
            managed through the nurture workflow.
          </p>
        </div>
      </article>
    );
  }

  if (query.isLoading) {
    return (
      <article className="gn-panel space-y-4 rounded-3xl p-6">
        <div className="gn-skeleton h-10 w-1/3 rounded-xl" />
        <div className="gn-skeleton h-24 rounded-xl" />
        <div className="gn-skeleton h-24 rounded-xl" />
      </article>
    );
  }

  if (query.isError) {
    return (
      <article className="gn-panel rounded-3xl p-8 text-center">
        <AlertCircle
          size={32}
          className="gn-detail-icon mx-auto mb-4"
        />

        <h3 className="gn-heading text-lg font-bold">
          Unable to load nurture profile
        </h3>

        <p className="gn-muted mt-2 text-sm">
          {query.error?.response?.data?.message ||
            "Something went wrong."}
        </p>

        <button
          type="button"
          className="gn-action mt-5 inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold"
          onClick={() => query.refetch()}
        >
          <RefreshCw size={16} />
          Try Again
        </button>
      </article>
    );
  }

  if (!nurture) {
    return (
      <article className="gn-panel rounded-3xl p-8 text-center">
        <HeartHandshake
          size={32}
          className="gn-detail-icon mx-auto mb-4"
        />

        <p className="gn-muted text-sm">
          No nurture profile is available for this lead.
        </p>
      </article>
    );
  }

  const details = [
    {
      label: "Category",
      value: nurture.categoryLabel,
      icon: Tag,
    },
    {
      label: "Reason",
      value: nurture.reason,
      icon: MessageCircle,
    },
    {
      label: "Industry",
      value: nurture.industry,
      icon: BriefcaseBusiness,
    },
    {
      label: "Designation",
      value: nurture.designation,
      icon: UserRound,
    },
    {
      label: "Service Interest",
      value: nurture.serviceInterest,
      icon: Layers3,
    },
    {
      label: "Geography",
      value: nurture.geography,
      icon: Globe2,
    },
    {
      label: "Buying Stage",
      value: nurture.buyingStage,
      icon: BriefcaseBusiness,
    },
    {
      label: "Communication Status",
      value: communicationLabel(nurture.communicationStatus),
      icon: MessageCircle,
    },
    {
      label: "Owner",
      value: nurture.ownerName,
      icon: Users,
    },
    {
      label: "Last Touch",
      value: formatDateTime(nurture.lastTouchAt),
      icon: Clock3,
    },
    {
      label: "Reconnect",
      value: formatDateTime(nurture.reconnectAt),
      icon: CalendarClock,
    },
  ];

  return (
    <>
      <article className="gn-panel overflow-hidden rounded-3xl">
        <header className="gn-panel-header flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="gn-panel-icon flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl">
              <HeartHandshake size={23} />
            </span>

            <div>
              <h2 className="gn-heading text-lg font-extrabold">
                Nurture Profile
              </h2>

              <p className="gn-muted mt-1 text-xs">
                Relationship context and reconnect planning
              </p>
            </div>
          </div>

          <button
            type="button"
            className="gn-action inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-bold"
            onClick={() => setReconnectOpen(true)}
          >
            <CalendarClock size={17} />
            Schedule Reconnect
          </button>
        </header>

        <div className="space-y-5 p-5 sm:p-6">
          <div className="gn-profile-banner flex items-start gap-4 rounded-2xl p-5">
            <span className="gn-profile-icon flex h-12 w-12 shrink-0 items-center justify-center rounded-xl">
              <HeartHandshake size={22} />
            </span>

            <div>
              <p className="gn-heading text-sm font-extrabold">
                Relationship Continuity
              </p>

              <p className="gn-muted mt-2 text-xs leading-6">
                Lost, later and no-response contacts remain
                available for future engagement and reconnects.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {details.map((item) => (
              <DetailField
                key={item.label}
                icon={item.icon}
                label={item.label}
                value={item.value}
              />
            ))}
          </div>
        </div>
      </article>

      <ScheduleReconnectModal
        open={reconnectOpen}
        nurture={nurture}
        onClose={() => {
          setReconnectOpen(false);
          query.refetch();
        }}
      />
    </>
  );
};

export default LeadNurturePanel;