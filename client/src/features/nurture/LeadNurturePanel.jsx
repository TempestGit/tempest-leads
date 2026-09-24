import {
  useState,
} from "react";

import {
  useNurtureLeadQuery,
} from "./nurture.queries.js";

import ScheduleReconnectModal from "./ScheduleReconnectModal.jsx";

/*
|--------------------------------------------------------------------------
| Date
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
| Communication Label
|--------------------------------------------------------------------------
*/

const communicationLabel = (
  value
) =>
  String(
    value ||
      "NOT_CONTACTED"
  )
    .replaceAll(
      "_",
      " "
    )
    .toLowerCase()
    .replace(
      /^\w/,
      (
        character
      ) =>
        character.toUpperCase()
    );

/*
|--------------------------------------------------------------------------
| Lead Nurture Panel
|--------------------------------------------------------------------------
*/

const LeadNurturePanel = ({
  lead,
}) => {
  const eligible =
    [
      "Nurture",
      "Lost",
    ].includes(
      lead.stage
    );

  const [
    reconnectOpen,
    setReconnectOpen,
  ] = useState(
    false
  );

  /*
  |--------------------------------------------------------------------------
  | Only Load When Lead Is Actually In Nurture / Lost
  |--------------------------------------------------------------------------
  */

  const query =
    useNurtureLeadQuery(
      lead.id,
      {
        enabled:
          eligible,
      }
    );

  /*
  |--------------------------------------------------------------------------
  | Not Yet Nurture
  |--------------------------------------------------------------------------
  */

  if (!eligible) {
    return (
      <article className="tl-card">
        <div className="tl-card-head">
          <h2>
            NURTURE
          </h2>
        </div>

        <p className="muted">
          Lost, later and
          no-response contacts
          stay in the database and
          can reconnect.
        </p>

        <div className="empty-state">
          <h2>
            Not in nurture
          </h2>

          <p>
            This lead is currently
            in the{" "}
            <b>
              {lead.stage}
            </b>{" "}
            stage.
          </p>
        </div>
      </article>
    );
  }

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
          <p>
            Loading nurture
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
    query.isError
  ) {
    return (
      <article className="tl-card">
        <div className="empty-state">
          <h2>
            Unable to load
            nurture profile
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

  const nurture =
    query.data
      ?.data
      ?.nurture;

  if (!nurture) {
    return null;
  }

  return (
    <>
      <article className="tl-card">
        {/* Header */}

        <div className="tl-card-head">
          <h2>
            NURTURE
          </h2>

          <button
            type="button"
            className="tl-primary"
            onClick={() =>
              setReconnectOpen(
                true
              )
            }
          >
            Reconnect
          </button>
        </div>

        {/* Intro */}

        <p className="muted">
          Lost, later and
          no-response contacts
          stay in the database and
          can reconnect.
        </p>

        {/* Details */}

        <div className="info-grid">
          <div className="info-field">
            <small>
              Category
            </small>

            <b>
              {
                nurture.categoryLabel
              }
            </b>
          </div>

          <div className="info-field">
            <small>
              Reason
            </small>

            <b>
              {nurture.reason ||
                "—"}
            </b>
          </div>

          <div className="info-field">
            <small>
              Industry
            </small>

            <b>
              {nurture.industry ||
                "—"}
            </b>
          </div>

          <div className="info-field">
            <small>
              Designation
            </small>

            <b>
              {nurture.designation ||
                "—"}
            </b>
          </div>

          <div className="info-field">
            <small>
              Service interest
            </small>

            <b>
              {nurture.serviceInterest ||
                "—"}
            </b>
          </div>

          <div className="info-field">
            <small>
              Geography
            </small>

            <b>
              {nurture.geography ||
                "—"}
            </b>
          </div>

          <div className="info-field">
            <small>
              Buying stage
            </small>

            <b>
              {nurture.buyingStage ||
                "—"}
            </b>
          </div>

          <div className="info-field">
            <small>
              Communication status
            </small>

            <b>
              {communicationLabel(
                nurture.communicationStatus
              )}
            </b>
          </div>

          <div className="info-field">
            <small>
              Owner
            </small>

            <b>
              {nurture.ownerName ||
                "—"}
            </b>
          </div>

          <div className="info-field">
            <small>
              Last touch
            </small>

            <b>
              {formatDateTime(
                nurture.lastTouchAt
              )}
            </b>
          </div>

          <div className="info-field">
            <small>
              Reconnect
            </small>

            <b>
              {formatDateTime(
                nurture.reconnectAt
              )}
            </b>
          </div>
        </div>
      </article>

      {/* Reconnect Modal */}

      <ScheduleReconnectModal
        open={
          reconnectOpen
        }
        lead={
          nurture
        }
        onClose={() => {
          setReconnectOpen(
            false
          );

          query.refetch();
        }}
      />
    </>
  );
};

export default LeadNurturePanel;