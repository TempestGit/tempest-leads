import pool from "../../config/db.js";

import ApiError from "../../utils/ApiError.js";

import generatePublicId from "../../utils/publicId.js";

import {
  createAuditLog,
} from "../../services/audit.service.js";

import {
  createLeadFollowup,
  findLeadById,
} from "../leads/leads.repository.js";

import {
  createActivity,
  findActivityById,
  listActivities,
  updateLeadFromActivity,
} from "./activities.repository.js";

/*
|--------------------------------------------------------------------------
| List Activities
|--------------------------------------------------------------------------
*/

export const getActivitiesService =
  async (
    filters,
    currentUser
  ) => {
    const {
      rows,
      total,
    } =
      await listActivities({
        ...filters,

        currentUser,
      });

    return {
      activities:
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
| Create Activity
|--------------------------------------------------------------------------
*/

export const createActivityService =
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
      | Lead + Permission
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
      | Activity
      |--------------------------------------------------------------------------
      */

      const activityId =
        await createActivity(
          {
            leadId:
              data.leadId,

            activityType:
              data.activityType,

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
      | Last Touch / Next Action
      |--------------------------------------------------------------------------
      */

      await updateLeadFromActivity(
        {
          leadId:
            data.leadId,

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
      | Optional New Follow-up
      |--------------------------------------------------------------------------
      */

      let followupCode =
        null;

      if (
        data.nextAction &&
        data.nextFollowUpAt
      ) {
        followupCode =
          generatePublicId(
            "FUP"
          );

        await createLeadFollowup(
          {
            followupCode,

            leadId:
              data.leadId,

            assignedTo:
              lead.ownerId,

            action:
              data.nextAction,

            dueAt:
              data.nextFollowUpAt,

            priority:
              lead.priority,

            userId:
              currentUser.id,
          },

          connection
        );
      }

      /*
      |--------------------------------------------------------------------------
      | Reload Activity
      |--------------------------------------------------------------------------
      */

      const activity =
        await findActivityById(
          activityId,
          currentUser,
          connection
        );

      if (!activity) {
        throw new ApiError(
          500,
          "Activity was created but could not be loaded.",
          [],
          "ACTIVITY_CREATED_BUT_NOT_LOADED"
        );
      }

      /*
      |--------------------------------------------------------------------------
      | Audit
      |--------------------------------------------------------------------------
      */

      await createAuditLog({
        actorUserId:
          currentUser.id,

        entityType:
          "ACTIVITY",

        entityId:
          activityId,

        action:
          "ACTIVITY_CREATED",

        previousValues:
          null,

        newValues:
          activity,

        metadata: {
          leadId:
            data.leadId,

          leadCode:
            lead.leadCode,

          followupCode,
        },

        ipAddress,

        userAgent,

        connection,
      });

      await connection.commit();

      return {
        activity,

        followupCode,
      };
    } catch (error) {
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