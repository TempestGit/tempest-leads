import {
  useMemo,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  useNurtureQuery,
} from "./nurture.queries.js";

import NurtureTable from "./NurtureTable.jsx";

import ScheduleReconnectModal from "./ScheduleReconnectModal.jsx";

/*
|--------------------------------------------------------------------------
| Nurture Page
|--------------------------------------------------------------------------
*/

const NurturePage =
  () => {
    const navigate =
      useNavigate();

    const [
      reconnectOpen,
      setReconnectOpen,
    ] = useState(
      false
    );

    /*
    |--------------------------------------------------------------------------
    | Query
    |--------------------------------------------------------------------------
    */

    const params =
      useMemo(
        () => ({
          page: 1,
          limit: 100,
        }),
        []
      );

    const query =
      useNurtureQuery(
        params
      );

    const nurture =
      query.data
        ?.data
        ?.nurture ||
      [];

    return (
      <>
        {/* --------------------------------------------------------------- */}
        {/* Header */}
        {/* --------------------------------------------------------------- */}

        <div className="tl-title-row">
          <div>
            <h1>
              Nurture Database
            </h1>

            <p>
              Keep “later”,
              no-response and lost
              opportunities
              segmentable and ready
              to reconnect.
            </p>
          </div>

          <div className="button-row">
            <button
              type="button"
              className="tl-primary"
              onClick={() =>
                setReconnectOpen(
                  true
                )
              }
            >
              + Schedule reconnect
            </button>
          </div>
        </div>

        {/* --------------------------------------------------------------- */}
        {/* Table */}
        {/* --------------------------------------------------------------- */}

        {query.isError ? (
          <article className="tl-card">
            <div className="empty-state">
              <h2>
                Unable to load
                nurture records
              </h2>

              <p>
                {query.error
                  ?.response
                  ?.data
                  ?.message ||
                  "Something went wrong while loading nurture records."}
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
        ) : (
          <article className="tl-card no-pad">
            <NurtureTable
              nurture={
                nurture
              }
              loading={
                query.isLoading
              }
              onOpenLead={(
                leadId
              ) =>
                navigate(
                  `/leads/${leadId}`
                )
              }
            />
          </article>
        )}

        {/* --------------------------------------------------------------- */}
        {/* Reconnect */}
        {/* --------------------------------------------------------------- */}

        <ScheduleReconnectModal
          open={
            reconnectOpen
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

export default NurturePage;