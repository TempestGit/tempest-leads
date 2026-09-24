import {
  useState,
} from "react";

import {
  useBriefQuery,
} from "./briefs.queries.js";

import BriefFormModal from "./BriefFormModal.jsx";

/*
|--------------------------------------------------------------------------
| Status
|--------------------------------------------------------------------------
*/

const STATUS_LABELS = {
  DRAFT:
    "Draft",

  AWAITING_CLARIFICATION:
    "Awaiting clarification",

  READY:
    "Ready",

  APPROVED:
    "Approved",
};

/*
|--------------------------------------------------------------------------
| Route
|--------------------------------------------------------------------------
*/

const ROUTE_LABELS = {
  KNOWN_EXISTING:
    "Known / Existing",

  NEW_UNKNOWN:
    "New / Unknown",
};

/*
|--------------------------------------------------------------------------
| Date
|--------------------------------------------------------------------------
*/

const formatDateTime =
  (
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
| Lead Brief Panel
|--------------------------------------------------------------------------
*/

const LeadBriefPanel = ({
  lead,
}) => {
  const [
    modalOpen,
    setModalOpen,
  ] = useState(
    false
  );

  const query =
    useBriefQuery(
      lead.id
    );

  /*
  |--------------------------------------------------------------------------
  | Loading
  |--------------------------------------------------------------------------
  */

  if (
    query.isLoading
  ) {
    return (
      <article className="tl-card">
        <div className="empty-state">
          Loading brief...
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
    query.isError
  ) {
    return (
      <article className="tl-card">
        <div className="empty-state">
          <h2>
            Unable to load brief
          </h2>

          <p>
            {query.error
              ?.response
              ?.data
              ?.message ||
              "Something went wrong."}
          </p>

          <button
            type="button"
            className="tl-secondary"
            onClick={() =>
              query.refetch()
            }
          >
            Try again
          </button>
        </div>
      </article>
    );
  }

  const brief =
    query.data
      ?.data
      ?.brief ||
    null;

  const completeness =
    brief?.completeness
      ?.percentage ||
    0;

  const complete =
    brief?.completeness
      ?.complete ||
    false;

  const routeLabel =
    brief?.routeType
      ? ROUTE_LABELS[
          brief.routeType
        ]
      : lead.knownRelationship
        ? "Known / Existing"
        : "New / Unknown";

  return (
    <>
      <article className="tl-card">
        {/* Header */}

        <div className="tl-card-head">
          <h2>
            BRIEF
          </h2>

          <button
            type="button"
            className="tl-primary"
            onClick={() =>
              setModalOpen(
                true
              )
            }
          >
            {brief
              ? "Edit brief"
              : "+ Add record"}
          </button>
        </div>

        <p className="muted">
          Capture a structured
          brief before the
          opportunity moves
          forward.
        </p>

        {/* Summary */}

        <div className="info-grid brief-summary-grid">
          <div className="info-field">
            <small>
              Status
            </small>

            <b>
              {brief
                ? STATUS_LABELS[
                    brief.status
                  ] ||
                  brief.status
                : "Not created"}
            </b>
          </div>

          <div className="info-field">
            <small>
              Known client /
              industry
            </small>

            <b>
              {
                routeLabel
              }
            </b>
          </div>

          <div className="info-field">
            <small>
              Completeness
            </small>

            <b>
              {brief
                ? `${completeness}%`
                : "0%"}
            </b>
          </div>

          <div className="info-field">
            <small>
              Last updated
            </small>

            <b>
              {brief
                ? formatDateTime(
                    brief.updatedAt
                  )
                : "—"}
            </b>
          </div>
        </div>

        {/* Progress */}

        {brief && (
          <div className="brief-panel-progress">
            <div className="brief-progress-track">
              <span
                style={{
                  width:
                    `${completeness}%`,
                }}
              />
            </div>

            <small>
              {complete
                ? "All required brief fields are complete."
                : `${brief.completeness?.missingFields?.length || 0} required field(s) still missing.`}
            </small>
          </div>
        )}

        {/* Clarification */}

        {brief?.status ===
          "AWAITING_CLARIFICATION" && (
          <div className="brief-clarification">
            <b>
              Return to client /
              clarification
            </b>

            <span>
              Complete the missing
              brief information
              before progressing
              this opportunity.
            </span>
          </div>
        )}

        {/* Route */}

        {brief?.routeType && (
          <div className="brief-route-card">
            <small>
              SELECTED ROUTE
            </small>

            <b>
              {ROUTE_LABELS[
                brief.routeType
              ]}
            </b>

            {brief.routeType ===
              "KNOWN_EXISTING" ? (
              <span>
                Brief → Scope
                Confirmation →
                Commercials →
                Contract / PO →
                Team Assignment →
                Pitch
              </span>
            ) : (
              <span>
                Brief → Understand
                Client + Industry →
                Team Assignment →
                Pitch →
                Commercials →
                Contract / PO →
                Onboarding
              </span>
            )}

            {brief.routeDecisionNote && (
              <p>
                {
                  brief.routeDecisionNote
                }
              </p>
            )}
          </div>
        )}

        {/* Empty */}

        {!brief && (
          <div className="empty-state brief-empty-state">
            <h2>
              No brief created
            </h2>

            <p>
              Add the structured
              client brief before
              progressing this
              opportunity.
            </p>

            <button
              type="button"
              className="tl-primary"
              onClick={() =>
                setModalOpen(
                  true
                )
              }
            >
              + Add brief
            </button>
          </div>
        )}
      </article>

      {/* Modal */}

      <BriefFormModal
        open={
          modalOpen
        }
        lead={
          lead
        }
        brief={
          brief
        }
        onClose={() => {
          setModalOpen(
            false
          );

          query.refetch();
        }}
      />
    </>
  );
};

export default LeadBriefPanel;