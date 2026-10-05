import {
  useMemo,
  useState,
} from "react";

import {
  useMeetingsQuery,
} from "./meetings.queries.js";

import MeetingsTable from "./MeetingsTable.jsx";

import ScheduleMeetingModal from "./ScheduleMeetingModal.jsx";

import CompleteMeetingModal from "./CompleteMeetingModal.jsx";

import RescheduleMeetingModal from "./RescheduleMeetingModal.jsx";

import MeetingStatusModal from "./MeetingStatusModal.jsx";

/*
|--------------------------------------------------------------------------
| Lead Meetings
|--------------------------------------------------------------------------
*/

const LeadMeetingsPanel = ({
  lead,
}) => {
  const [
    scheduleOpen,
    setScheduleOpen,
  ] = useState(
    false
  );

  const [
    completeMeeting,
    setCompleteMeeting,
  ] = useState(
    null
  );

  const [
    rescheduleMeeting,
    setRescheduleMeeting,
  ] = useState(
    null
  );

  const [
    statusMeeting,
    setStatusMeeting,
  ] = useState(
    null
  );

  const [
    statusAction,
    setStatusAction,
  ] = useState(
    null
  );

  /*
  |--------------------------------------------------------------------------
  | Query
  |--------------------------------------------------------------------------
  */

  const params =
    useMemo(
      () => ({
        leadId:
          Number(
            lead.id
          ),

        page:
          1,

        limit:
          100,
      }),
      [
        lead.id,
      ]
    );

  const query =
    useMeetingsQuery(
      params
    );

  const meetings =
    query.data
      ?.data
      ?.meetings ||
    [];

  /*
  |--------------------------------------------------------------------------
  | Status Modal
  |--------------------------------------------------------------------------
  */

  const openStatus =
    (
      meeting,
      action
    ) => {
      setStatusMeeting(
        meeting
      );

      setStatusAction(
        action
      );
    };

  const closeStatus =
    () => {
      setStatusMeeting(
        null
      );

      setStatusAction(
        null
      );

      query.refetch();
    };

  return (
    <>
      <article className="tl-card no-pad">
        <div className="meeting-panel-head">
          <div>
            <h2>
              MEETINGS ·{" "}
              {meetings.length}
            </h2>

            <p>
              Discovery and client
              conversations linked
              to this lead.
            </p>
          </div>

          {/* <button
            type="button"
            className="tl-primary"
            onClick={() =>
              setScheduleOpen(
                true
              )
            }
          >
            + Schedule meeting
          </button> */}
        </div>

        {query.isError ? (
          <div className="empty-state">
            <h2>
              Unable to load
              meetings
            </h2>

            <p>
              {query.error
                ?.response
                ?.data
                ?.message ||
                "Something went wrong while loading meetings."}
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
        ) : (
          <MeetingsTable
            meetings={
              meetings
            }
            loading={
              query.isLoading
            }
            onComplete={(
              meeting
            ) =>
              setCompleteMeeting(
                meeting
              )
            }
            onReschedule={(
              meeting
            ) =>
              setRescheduleMeeting(
                meeting
              )
            }
            onCancel={(
              meeting
            ) =>
              openStatus(
                meeting,
                "CANCEL"
              )
            }
            onNoShow={(
              meeting
            ) =>
              openStatus(
                meeting,
                "NO_SHOW"
              )
            }
          />
        )}
      </article>

      {/* Schedule */}

      <ScheduleMeetingModal
        open={
          scheduleOpen
        }
        lead={
          lead
        }
        onClose={() => {
          setScheduleOpen(
            false
          );

          query.refetch();
        }}
      />

      {/* Complete */}

      <CompleteMeetingModal
        open={
          Boolean(
            completeMeeting
          )
        }
        meeting={
          completeMeeting
        }
        onClose={() => {
          setCompleteMeeting(
            null
          );

          query.refetch();
        }}
      />

      {/* Reschedule */}

      <RescheduleMeetingModal
        open={
          Boolean(
            rescheduleMeeting
          )
        }
        meeting={
          rescheduleMeeting
        }
        onClose={() => {
          setRescheduleMeeting(
            null
          );

          query.refetch();
        }}
      />

      {/* Cancel / No-show */}

      <MeetingStatusModal
        open={
          Boolean(
            statusMeeting
          )
        }
        meeting={
          statusMeeting
        }
        action={
          statusAction
        }
        onClose={
          closeStatus
        }
      />
    </>
  );
};

export default LeadMeetingsPanel;