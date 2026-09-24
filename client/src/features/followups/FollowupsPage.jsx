import {
  useMemo,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  useFollowupsQuery,
} from "./followups.queries.js";

import FollowupsTable from "./FollowupsTable.jsx";

import ScheduleFollowupModal from "./ScheduleFollowupModal.jsx";

import CompleteFollowupModal from "./CompleteFollowupModal.jsx";

import RescheduleFollowupModal from "./RescheduleFollowupModal.jsx";

const FollowupsPage =
  () => {
    const navigate =
      useNavigate();

    const [
      scheduleOpen,
      setScheduleOpen,
    ] = useState(false);

    const [
      completeItem,
      setCompleteItem,
    ] = useState(null);

    const [
      rescheduleItem,
      setRescheduleItem,
    ] = useState(null);

    /*
    |--------------------------------------------------------------------------
    | Keep prototype default page as one complete list.
    |--------------------------------------------------------------------------
    */

    const params =
      useMemo(
        () => ({
          view: "ALL",
          page: 1,
          limit: 100,
        }),
        []
      );

    const query =
      useFollowupsQuery(
        params
      );

    const followups =
      query.data
        ?.data
        ?.followups ||
      [];

    return (
      <>
        <div className="tl-title-row">
          <div>
            <h1>
              Follow-ups
            </h1>

            <p>
              Open records stay
              visible until you
              capture the outcome
              and the next move.
            </p>
          </div>

          <div className="button-row">
            <button
              type="button"
              className="tl-primary"
              onClick={() =>
                setScheduleOpen(
                  true
                )
              }
            >
              + Schedule follow-up
            </button>
          </div>
        </div>

        {query.isError ? (
          <article className="tl-card">
            <div className="empty-state">
              <h2>
                Unable to load
                follow-ups
              </h2>

              <p>
                {query.error
                  ?.response
                  ?.data
                  ?.message ||
                  "Something went wrong."}
              </p>
            </div>
          </article>
        ) : (
          <article className="tl-card no-pad">
            <FollowupsTable
              followups={
                followups
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
              onComplete={
                setCompleteItem
              }
              onReschedule={
                setRescheduleItem
              }
            />
          </article>
        )}

        <ScheduleFollowupModal
          open={
            scheduleOpen
          }
          onClose={() => {
            setScheduleOpen(
              false
            );

            query.refetch();
          }}
        />

        <CompleteFollowupModal
          open={
            Boolean(
              completeItem
            )
          }
          followup={
            completeItem
          }
          onClose={() => {
            setCompleteItem(
              null
            );

            query.refetch();
          }}
        />

        <RescheduleFollowupModal
          open={
            Boolean(
              rescheduleItem
            )
          }
          followup={
            rescheduleItem
          }
          onClose={() => {
            setRescheduleItem(
              null
            );

            query.refetch();
          }}
        />
      </>
    );
  };

export default FollowupsPage;