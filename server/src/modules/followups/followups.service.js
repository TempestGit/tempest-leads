import pool from "../../config/db.js";

import ApiError from "../../utils/ApiError.js";

import generatePublicId from "../../utils/publicId.js";

import {
  createAuditLog,
} from "../../services/audit.service.js";

import {
  createActivity,
  updateLeadFromActivity,
} from "../activities/activities.repository.js";

import {
  findLeadById,
} from "../leads/leads.repository.js";

import {
  completeFollowup,
  findFollowupById,
  insertFollowup,
  linkSuccessorFollowup,
  listFollowups,
  markFollowupRescheduled,
} from "./followups.repository.js";

/*
|--------------------------------------------------------------------------
| List
|--------------------------------------------------------------------------
*/

export const getFollowupsService =
  async (
    filters,
    currentUser
  ) => {
    const {
      rows,
      total,
    } =
      await listFollowups({
        ...filters,
        currentUser,
      });

    return {
      followups:
        rows,

      pagination: {
        page:
          filters.page,

        limit:
          filters.limit,

        total,

        totalPages:
          total === 0
            ? 0
            : Math.ceil(
                total /
                  filters.limit
              ),
      },
    };
  };

/*
|--------------------------------------------------------------------------
| Schedule Follow-up
|--------------------------------------------------------------------------
*/

export const createFollowupService =
  async ({
    data,
    currentUser,
    ipAddress,
    userAgent,
  }) => {
    const connection =
      await pool.getConnection();

    try {
      await connection.beginTransaction();

      /*
      |--------------------------------------------------------------------------
      | Lead
      |--------------------------------------------------------------------------
      */

      const lead =
        await findLeadById(
          data.leadId,
          currentUser,
          connection
        );

      if (!lead) {
        throw new ApiError(
          404,
          "Lead not found.",
          [],
          "LEAD_NOT_FOUND"
        );
      }

      /*
      |--------------------------------------------------------------------------
      | Follow-up
      |--------------------------------------------------------------------------
      */

      const followupCode =
        generatePublicId(
          "FUP"
        );

      const followupId =
        await insertFollowup(
          {
            followupCode,

            leadId:
              lead.id,

            assignedTo:
              lead.ownerId,

            action:
              data.action,

            dueAt:
              data.dueAt,

            priority:
              data.priority,

            notes:
              data.notes,

            userId:
              currentUser.id,
          },

          connection
        );

      /*
      |--------------------------------------------------------------------------
      | Activity
      |--------------------------------------------------------------------------
      */

      await createActivity(
        {
          leadId:
            lead.id,

          activityType:
            "Follow-up",

          outcome:
            "Follow-up scheduled",

          notes:
            data.action,

          userId:
            currentUser.id,
        },

        connection
      );

      /*
      |--------------------------------------------------------------------------
      | Update Lead Next Action
      |--------------------------------------------------------------------------
      */

      await updateLeadFromActivity(
        {
          leadId:
            lead.id,

          nextAction:
            data.action,

          nextFollowUpAt:
            data.dueAt,

          userId:
            currentUser.id,
        },

        connection
      );

      /*
      |--------------------------------------------------------------------------
      | Reload
      |--------------------------------------------------------------------------
      */

      const followup =
        await findFollowupById(
          followupId,
          currentUser,
          connection
        );

      /*
      |--------------------------------------------------------------------------
      | Audit
      |--------------------------------------------------------------------------
      */

      await createAuditLog({
        actorUserId:
          currentUser.id,

        entityType:
          "FOLLOWUP",

        entityId:
          followupId,

        action:
          "FOLLOWUP_CREATED",

        previousValues:
          null,

        newValues:
          followup,

        metadata: {
          leadCode:
            lead.leadCode,

          followupCode,
        },

        ipAddress,
        userAgent,
        connection,
      });

      await connection.commit();

      return followup;
    } catch (
      error
    ) {
      try {
        await connection.rollback();
      } catch {
        // Ignore rollback failure.
      }

      throw error;
    } finally {
      connection.release();
    }
  };

/*
|--------------------------------------------------------------------------
| Complete Follow-up
|--------------------------------------------------------------------------
|
| Completion can now work in two ways:
|
| 1. Complete only
|    - outcome required
|    - notes required
|    - no successor follow-up is created
|    - lead next action is cleared
|
| 2. Complete + next follow-up
|    - outcome required
|    - notes required
|    - nextAction supplied
|    - nextFollowUpAt supplied
|    - successor follow-up is created
|    - lead points to the successor action/date
|
*/

export const completeFollowupService =
  async ({
    followupId,
    data,
    currentUser,
    ipAddress,
    userAgent,
  }) => {
    const connection =
      await pool.getConnection();

    try {
      await connection.beginTransaction();

      /*
      |--------------------------------------------------------------------------
      | Existing Follow-up
      |--------------------------------------------------------------------------
      */

      const existing =
        await findFollowupById(
          followupId,
          currentUser,
          connection
        );

      if (!existing) {
        throw new ApiError(
          404,
          "Follow-up not found.",
          [],
          "FOLLOWUP_NOT_FOUND"
        );
      }

      if (
        existing.status !==
        "PENDING"
      ) {
        throw new ApiError(
          409,
          "Only pending follow-ups can be completed.",
          [],
          "FOLLOWUP_NOT_PENDING"
        );
      }

      /*
      |--------------------------------------------------------------------------
      | Determine Whether Another Follow-up Was Requested
      |--------------------------------------------------------------------------
      |
      | Schema validation already guarantees that nextAction and
      | nextFollowUpAt are supplied together.
      |
      */

      const hasNextFollowup =
        Boolean(
          data.nextAction &&
            data.nextFollowUpAt
        );

      /*
      |--------------------------------------------------------------------------
      | Complete Existing Record
      |--------------------------------------------------------------------------
      */

      const completed =
        await completeFollowup(
          {
            followupId,

            outcome:
              data.outcome,

            notes:
              data.notes,

            userId:
              currentUser.id,
          },

          connection
        );

      if (!completed) {
        throw new ApiError(
          409,
          "Follow-up could not be completed.",
          [],
          "FOLLOWUP_COMPLETE_FAILED"
        );
      }

      /*
      |--------------------------------------------------------------------------
      | Activity
      |--------------------------------------------------------------------------
      */

      await createActivity(
        {
          leadId:
            existing.leadId,

          activityType:
            "Follow-up",

          outcome:
            data.outcome,

          notes:
            data.notes,

          userId:
            currentUser.id,
        },

        connection
      );

      /*
      |--------------------------------------------------------------------------
      | Successor Details
      |--------------------------------------------------------------------------
      |
      | These remain null when the follow-up is simply completed.
      |
      */

      let successorId =
        null;

      let nextCode =
        null;

      /*
      |--------------------------------------------------------------------------
      | Complete + Schedule Next Follow-up
      |--------------------------------------------------------------------------
      */

      if (hasNextFollowup) {
        /*
        |--------------------------------------------------------------------------
        | Update Lead With Next Action
        |--------------------------------------------------------------------------
        */

        await updateLeadFromActivity(
          {
            leadId:
              existing.leadId,

            nextAction:
              data.nextAction,

            nextFollowUpAt:
              data.nextFollowUpAt,

            userId:
              currentUser.id,
          },

          connection
        );

        /*
        |--------------------------------------------------------------------------
        | Create Successor Follow-up
        |--------------------------------------------------------------------------
        |
        | Preserve the completed record and create a new pending record.
        |
        */

        nextCode =
          generatePublicId(
            "FUP"
          );

        successorId =
          await insertFollowup(
            {
              followupCode:
                nextCode,

              leadId:
                existing.leadId,

              assignedTo:
                existing.ownerId,

              action:
                data.nextAction,

              dueAt:
                data.nextFollowUpAt,

              priority:
                data.nextPriority ||
                existing.priority,

              notes:
                null,

              userId:
                currentUser.id,
            },

            connection
          );

        /*
        |--------------------------------------------------------------------------
        | Link Old -> New
        |--------------------------------------------------------------------------
        */

        await linkSuccessorFollowup(
          {
            followupId,

            successorFollowupId:
              successorId,

            userId:
              currentUser.id,
          },

          connection
        );
      } else {
        /*
        |--------------------------------------------------------------------------
        | Complete Without Another Follow-up
        |--------------------------------------------------------------------------
        |
        | There is no next scheduled action, so clear the lead's
        | next-action fields instead of leaving the completed follow-up
        | displayed as the lead's upcoming action.
        |
        */

        await updateLeadFromActivity(
          {
            leadId:
              existing.leadId,

            nextAction:
              null,

            nextFollowUpAt:
              null,

            userId:
              currentUser.id,
          },

          connection
        );
      }

      /*
      |--------------------------------------------------------------------------
      | Reload Original
      |--------------------------------------------------------------------------
      */

      const updated =
        await findFollowupById(
          followupId,
          currentUser,
          connection
        );

      /*
      |--------------------------------------------------------------------------
      | Audit
      |--------------------------------------------------------------------------
      */

      await createAuditLog({
        actorUserId:
          currentUser.id,

        entityType:
          "FOLLOWUP",

        entityId:
          followupId,

        action:
          "FOLLOWUP_COMPLETED",

        previousValues:
          existing,

        newValues:
          updated,

        metadata: {
          successorFollowupId:
            successorId,

          successorFollowupCode:
            nextCode,

          nextAction:
            hasNextFollowup
              ? data.nextAction
              : null,
        },

        ipAddress,
        userAgent,
        connection,
      });

      /*
      |--------------------------------------------------------------------------
      | Commit
      |--------------------------------------------------------------------------
      */

      await connection.commit();

      /*
      |--------------------------------------------------------------------------
      | Response
      |--------------------------------------------------------------------------
      */

      return {
        completedFollowup:
          updated,

        successorFollowupId:
          successorId,

        successorFollowupCode:
          nextCode,
      };
    } catch (
      error
    ) {
      try {
        await connection.rollback();
      } catch {
        // Ignore rollback failure.
      }

      throw error;
    } finally {
      connection.release();
    }
  };

/*
|--------------------------------------------------------------------------
| Reschedule
|--------------------------------------------------------------------------
*/

export const rescheduleFollowupService =
  async ({
    followupId,
    data,
    currentUser,
    ipAddress,
    userAgent,
  }) => {
    const connection =
      await pool.getConnection();

    try {
      await connection.beginTransaction();

      const existing =
        await findFollowupById(
          followupId,
          currentUser,
          connection
        );

      if (!existing) {
        throw new ApiError(
          404,
          "Follow-up not found.",
          [],
          "FOLLOWUP_NOT_FOUND"
        );
      }

      if (
        existing.status !==
        "PENDING"
      ) {
        throw new ApiError(
          409,
          "Only pending follow-ups can be rescheduled.",
          [],
          "FOLLOWUP_NOT_PENDING"
        );
      }

      /*
      |--------------------------------------------------------------------------
      | Preserve Original
      |--------------------------------------------------------------------------
      */

      const changed =
        await markFollowupRescheduled(
          {
            followupId,

            reason:
              data.reason,

            userId:
              currentUser.id,
          },

          connection
        );

      if (!changed) {
        throw new ApiError(
          409,
          "Follow-up could not be rescheduled.",
          [],
          "FOLLOWUP_RESCHEDULE_FAILED"
        );
      }

      /*
      |--------------------------------------------------------------------------
      | New Pending Follow-up
      |--------------------------------------------------------------------------
      */

      const action =
        data.action ||
        existing.action;

      const priority =
        data.priority ||
        existing.priority;

      const nextCode =
        generatePublicId(
          "FUP"
        );

      const successorId =
        await insertFollowup(
          {
            followupCode:
              nextCode,

            leadId:
              existing.leadId,

            assignedTo:
              existing.ownerId,

            action,

            dueAt:
              data.dueAt,

            priority,

            notes:
              null,

            userId:
              currentUser.id,
          },

          connection
        );

      /*
      |--------------------------------------------------------------------------
      | Link Original -> Successor
      |--------------------------------------------------------------------------
      */

      await linkSuccessorFollowup(
        {
          followupId,

          successorFollowupId:
            successorId,

          userId:
            currentUser.id,
        },

        connection
      );

      /*
      |--------------------------------------------------------------------------
      | Activity
      |--------------------------------------------------------------------------
      */

      await createActivity(
        {
          leadId:
            existing.leadId,

          activityType:
            "Follow-up",

          outcome:
            "Follow-up rescheduled",

          notes:
            data.reason,

          userId:
            currentUser.id,
        },

        connection
      );

      /*
      |--------------------------------------------------------------------------
      | Lead
      |--------------------------------------------------------------------------
      */

      await updateLeadFromActivity(
        {
          leadId:
            existing.leadId,

          nextAction:
            action,

          nextFollowUpAt:
            data.dueAt,

          userId:
            currentUser.id,
        },

        connection
      );

      /*
      |--------------------------------------------------------------------------
      | Reload Original
      |--------------------------------------------------------------------------
      */

      const updated =
        await findFollowupById(
          followupId,
          currentUser,
          connection
        );

      /*
      |--------------------------------------------------------------------------
      | Audit
      |--------------------------------------------------------------------------
      */

      await createAuditLog({
        actorUserId:
          currentUser.id,

        entityType:
          "FOLLOWUP",

        entityId:
          followupId,

        action:
          "FOLLOWUP_RESCHEDULED",

        previousValues:
          existing,

        newValues:
          updated,

        metadata: {
          successorFollowupId:
            successorId,

          successorFollowupCode:
            nextCode,

          reason:
            data.reason,
        },

        ipAddress,
        userAgent,
        connection,
      });

      await connection.commit();

      return {
        previousFollowup:
          updated,

        successorFollowupId:
          successorId,

        successorFollowupCode:
          nextCode,
      };
    } catch (
      error
    ) {
      try {
        await connection.rollback();
      } catch {
        // Ignore rollback failure.
      }

      throw error;
    } finally {
      connection.release();
    }
  };