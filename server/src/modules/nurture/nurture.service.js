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
  insertFollowup,
} from "../followups/followups.repository.js";

import {
  findNurtureLead,
  listNurtureLeads,
  upsertNurtureProfile,
} from "./nurture.repository.js";

/*
|--------------------------------------------------------------------------
| List
|--------------------------------------------------------------------------
*/

export const getNurtureService =
  async (
    filters,
    currentUser
  ) => {
    const {
      rows,
      total,
    } =
      await listNurtureLeads({
        ...filters,

        currentUser,
      });

    return {
      nurture:
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
| Get One
|--------------------------------------------------------------------------
*/

export const getNurtureLeadService =
  async (
    leadId,
    currentUser
  ) => {
    const lead =
      await findNurtureLead(
        leadId,
        currentUser
      );

    if (!lead) {
      throw new ApiError(
        404,
        "Nurture lead not found.",
        [],
        "NURTURE_LEAD_NOT_FOUND"
      );
    }

    return lead;
  };

/*
|--------------------------------------------------------------------------
| Update Nurture Profile
|--------------------------------------------------------------------------
*/

export const updateNurtureService =
  async ({
    leadId,
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
      | Existing Record
      |--------------------------------------------------------------------------
      */

      const existing =
        await findNurtureLead(
          leadId,
          currentUser,
          connection
        );

      if (!existing) {
        throw new ApiError(
          404,
          "Nurture lead not found.",
          [],
          "NURTURE_LEAD_NOT_FOUND"
        );
      }

      /*
      |--------------------------------------------------------------------------
      | Merge
      |--------------------------------------------------------------------------
      */

      const merged = {
        category:
          data.category ??
          existing.category,

        reason:
          data.reason !==
          undefined
            ? data.reason
            : existing.reason,

        buyingStage:
          data.buyingStage !==
          undefined
            ? data.buyingStage
            : existing.buyingStage,

        communicationStatus:
          data.communicationStatus ??
          existing.communicationStatus ??
          "NOT_CONTACTED",

        reconnectAt:
          data.reconnectAt !==
          undefined
            ? data.reconnectAt
            : existing.reconnectAt,
      };

      /*
      |--------------------------------------------------------------------------
      | Save
      |--------------------------------------------------------------------------
      */

      await upsertNurtureProfile(
        {
          leadId,

          ...merged,

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
          leadId,

          activityType:
            "Activity",

          outcome:
            "Nurture profile updated",

          notes:
            merged.reason ||
            merged.category,

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

      const updated =
        await findNurtureLead(
          leadId,
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
          "NURTURE",

        entityId:
          leadId,

        action:
          "NURTURE_UPDATED",

        previousValues:
          existing,

        newValues:
          updated,

        metadata:
          null,

        ipAddress,
        userAgent,
        connection,
      });

      await connection.commit();

      return updated;
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
| Schedule Reconnect
|--------------------------------------------------------------------------
*/

export const scheduleReconnectService =
  async ({
    leadId,
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
      | Nurture Lead
      |--------------------------------------------------------------------------
      */

      const existing =
        await findNurtureLead(
          leadId,
          currentUser,
          connection
        );

      if (!existing) {
        throw new ApiError(
          404,
          "Nurture lead not found.",
          [],
          "NURTURE_LEAD_NOT_FOUND"
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

            leadId,

            assignedTo:
              existing.ownerId,

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
      | Nurture Profile
      |--------------------------------------------------------------------------
      */

      await upsertNurtureProfile(
        {
          leadId,

          category:
            existing.category,

          reason:
            existing.reason,

          buyingStage:
            existing.buyingStage,

          communicationStatus:
            existing.communicationStatus ||
            "NOT_CONTACTED",

          reconnectAt:
            data.dueAt,

          userId:
            currentUser.id,
        },

        connection
      );

      /*
      |--------------------------------------------------------------------------
      | Lead Next Action
      |--------------------------------------------------------------------------
      */

      await updateLeadFromActivity(
        {
          leadId,

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
      | Activity
      |--------------------------------------------------------------------------
      */

      await createActivity(
        {
          leadId,

          activityType:
            "Follow-up",

          outcome:
            "Nurture reconnect scheduled",

          notes:
            data.notes ||
            data.action,

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

      const updated =
        await findNurtureLead(
          leadId,
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
          "NURTURE",

        entityId:
          leadId,

        action:
          "NURTURE_RECONNECT_SCHEDULED",

        previousValues:
          existing,

        newValues:
          updated,

        metadata: {
          followupId,

          followupCode,

          dueAt:
            data.dueAt,

          action:
            data.action,
        },

        ipAddress,
        userAgent,
        connection,
      });

      await connection.commit();

      return {
        nurture:
          updated,

        followupId,

        followupCode,
      };
    } catch (
      error
    ) {
      try {
        await connection.rollback();
      } catch {
        // Ignore rollback error.
      }

      throw error;
    } finally {
      connection.release();
    }
  };