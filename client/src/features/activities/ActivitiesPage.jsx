import {
  useMemo,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  useActivitiesQuery,
} from "./activities.queries.js";

import ActivityTimeline from "./ActivityTimeline.jsx";

import AddActivityModal from "./AddActivityModal.jsx";

/*
|--------------------------------------------------------------------------
| Activities Page
|--------------------------------------------------------------------------
*/

const ActivitiesPage = () => {
  const navigate =
    useNavigate();

  const [
    addOpen,
    setAddOpen,
  ] = useState(false);

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

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } =
    useActivitiesQuery(
      params
    );

  const activities =
    data?.data
      ?.activities || [];

  return (
    <>
      {/* --------------------------------------------------------------- */}
      {/* Title */}
      {/* --------------------------------------------------------------- */}

      <div className="tl-title-row">
        <div>
          <h1>
            Activity Log
          </h1>

          <p>
            A chronological
            record of every
            material interaction
            and workflow change.
          </p>
        </div>

        <div className="button-row">
          <button
            type="button"
            className="tl-primary"
            onClick={() =>
              setAddOpen(
                true
              )
            }
          >
            + Add activity
          </button>
        </div>
      </div>

      {/* --------------------------------------------------------------- */}
      {/* Activity Timeline */}
      {/* --------------------------------------------------------------- */}

      <article className="tl-card">
        {isError ? (
          <div className="empty-state">
            <h2>
              Unable to load
              activities
            </h2>

            <p>
              {error
                ?.response
                ?.data
                ?.message ||
                "Something went wrong while loading activities."}
            </p>

            <button
              type="button"
              className="tl-secondary"
              onClick={() =>
                refetch()
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
              isLoading
            }
            showContext
            onLeadClick={(
              leadId
            ) =>
              navigate(
                `/leads/${leadId}`
              )
            }
          />
        )}
      </article>

      {/* --------------------------------------------------------------- */}
      {/* Add Activity */}
      {/* --------------------------------------------------------------- */}

      <AddActivityModal
        open={
          addOpen
        }
        onClose={() => {
          setAddOpen(
            false
          );

          refetch();
        }}
      />
    </>
  );
};

export default ActivitiesPage;