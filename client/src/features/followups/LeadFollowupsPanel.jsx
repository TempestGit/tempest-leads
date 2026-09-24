import {
  useMemo,
  useState,
} from "react";

import {
  useFollowupsQuery,
} from "./followups.queries.js";

import FollowupsTable from "./FollowupsTable.jsx";

import ScheduleFollowupModal from "./ScheduleFollowupModal.jsx";

import CompleteFollowupModal from "./CompleteFollowupModal.jsx";

import RescheduleFollowupModal from "./RescheduleFollowupModal.jsx";

const LeadFollowupsPanel = ({
  lead,
}) => {
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

  const params =
    useMemo(
      () => ({
        leadId:
          Number(
            lead.id
          ),

        view:
          "ALL",

        page: 1,

        limit: 100,
      }),
      [
        lead.id,
      ]
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
      <article className="tl-card no-pad">
        <div className="meeting-panel-head">
          <div>
            <h2>
              FOLLOW-UPS ·{" "}
              {
                followups.length
              }
            </h2>
          </div>

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

        <FollowupsTable
          followups={
            followups
          }
          loading={
            query.isLoading
          }
          onComplete={
            setCompleteItem
          }
          onReschedule={
            setRescheduleItem
          }
        />
      </article>

      <ScheduleFollowupModal
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

export default LeadFollowupsPanel;