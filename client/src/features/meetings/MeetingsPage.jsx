import {
  useMemo,
  useState,
} from "react";

import {
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import {
  useMeetingsQuery,
} from "./meetings.queries.js";

import ScheduleMeetingModal from "./ScheduleMeetingModal.jsx";

import CompleteMeetingModal from "./CompleteMeetingModal.jsx";

import RescheduleMeetingModal from "./RescheduleMeetingModal.jsx";

import MeetingStatusModal from "./MeetingStatusModal.jsx";

import MeetingsTable from "./MeetingsTable.jsx";

/*
|--------------------------------------------------------------------------
| Meetings Page
|--------------------------------------------------------------------------
*/

const MeetingsPage =
  () => {
    const navigate =
      useNavigate();

    const [
      searchParams,
    ] =
      useSearchParams();

    const leadIdFromUrl =
      searchParams.get(
        "leadId"
      );

    /*
    |--------------------------------------------------------------------------
    | Modal State
    |--------------------------------------------------------------------------
    */

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
          ...(leadIdFromUrl
            ? {
                leadId:
                  Number(
                    leadIdFromUrl
                  ),
              }
            : {}),

          page:
            1,

          limit:
            100,
        }),
        [
          leadIdFromUrl,
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
    | Status Modal Helper
    |--------------------------------------------------------------------------
    */

    const openStatusModal =
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

    const closeStatusModal =
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
        {/* Title */}

        <div className="tl-title-row">
          <div>
            <h1>
              Meetings
            </h1>

            <p>
              Schedule,
              complete and
              preserve every
              discovery or client
              conversation.
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
              + Schedule meeting
            </button>
          </div>
        </div>

        {/* Content */}

        {query.isError ? (
          <article className="tl-card">
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
          </article>
        ) : (
          <article className="tl-card no-pad">
            <MeetingsTable
              meetings={
                meetings
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
                openStatusModal(
                  meeting,
                  "CANCEL"
                )
              }
              onNoShow={(
                meeting
              ) =>
                openStatusModal(
                  meeting,
                  "NO_SHOW"
                )
              }
            />
          </article>
        )}

        {/* Schedule */}

        <ScheduleMeetingModal
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
            closeStatusModal
          }
        />
      </>
    );
  };

export default MeetingsPage;