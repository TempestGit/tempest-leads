import pool from "../../config/db.js";

import ApiError from "../../utils/ApiError.js";

import generateMeetingCode from "../../utils/meetingCode.js";

import generatePublicId from "../../utils/publicId.js";

import {
  createAuditLog,
} from "../../services/audit.service.js";

import {
  createActivity,
  updateLeadFromActivity,
} from "../activities/activities.repository.js";

import {
  createLeadFollowup,
  findContactForCompany,
  findLeadById,
} from "../leads/leads.repository.js";

import {
  cancelMeeting,
  completeMeeting,
  createMeeting,
  findMeetingById,
  listMeetings,
  markMeetingNoShow,
  rescheduleMeeting,
  updateMeetingCode,
} from "./meetings.repository.js";

/*
|--------------------------------------------------------------------------
| List Meetings
|--------------------------------------------------------------------------
*/

export const getMeetingsService =
  async (
    filters,
    currentUser
  ) => {
    const {
      rows,
      total,
    } =
      await listMeetings({
        ...filters,

        currentUser,
      });

    return {
      meetings:
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
| Schedule Meeting
|--------------------------------------------------------------------------
*/

export const createMeetingService =
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
      | Contact
      |--------------------------------------------------------------------------
      */

      const contactId =
        data.contactId ||
        lead.primaryContactId;

      if (!contactId) {
        throw new ApiError(
          422,
          "A contact is required for the meeting.",
          [],
          "MEETING_CONTACT_REQUIRED"
        );
      }

      const contact =
        await findContactForCompany(
          contactId,
          lead.companyId,
          connection
        );

      if (!contact) {
        throw new ApiError(
          422,
          "Selected contact does not belong to this company.",
          [],
          "MEETING_CONTACT_INVALID"
        );
      }

      /*
      |--------------------------------------------------------------------------
      | Insert Meeting
      |--------------------------------------------------------------------------
      */

      const meetingId =
        await createMeeting(
          {
            leadId:
              lead.id,

            contactId,

            title:
              data.title,

            startsAt:
              data.startsAt,

            endsAt:
              data.endsAt,

            meetingType:
              data.meetingType,

            participants:
              data.participants,

            location:
              data.location,

            meetingUrl:
              data.meetingUrl,

            agenda:
              data.agenda,

            userId:
              currentUser.id,
          },

          connection
        );

      /*
      |--------------------------------------------------------------------------
      | Meeting Code
      |--------------------------------------------------------------------------
      */

      const meetingCode =
        generateMeetingCode(
          meetingId
        );

      await updateMeetingCode(
        meetingId,
        meetingCode,
        connection
      );

      /*
      |--------------------------------------------------------------------------
      | Activity
      |--------------------------------------------------------------------------
      |
      | Matches prototype behavior:
      | scheduling a meeting also creates an activity.
      |
      */

      await createActivity(
        {
          leadId:
            lead.id,

          activityType:
            "Meeting",

          outcome:
            "Meeting scheduled",

          notes:
            data.title,

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

      const meeting =
        await findMeetingById(
          meetingId,
          currentUser,
          connection
        );

      if (!meeting) {
        throw new ApiError(
          500,
          "Meeting was scheduled but could not be loaded.",
          [],
          "MEETING_CREATED_BUT_NOT_LOADED"
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
          "MEETING",

        entityId:
          meetingId,

        action:
          "MEETING_CREATED",

        previousValues:
          null,

        newValues:
          meeting,

        metadata: {
          meetingCode,
          leadCode:
            lead.leadCode,
        },

        ipAddress,

        userAgent,

        connection,
      });

      await connection.commit();

      return meeting;
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

/*
|--------------------------------------------------------------------------
| Complete Meeting
|--------------------------------------------------------------------------
*/

export const completeMeetingService =
  async ({
    meetingId,
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
      | Existing Meeting
      |--------------------------------------------------------------------------
      */

      const existing =
        await findMeetingById(
          meetingId,
          currentUser,
          connection
        );

      if (!existing) {
        throw new ApiError(
          404,
          "Meeting not found.",
          [],
          "MEETING_NOT_FOUND"
        );
      }

      if (
        existing.status ===
        "COMPLETED"
      ) {
        throw new ApiError(
          409,
          "Meeting is already completed.",
          [],
          "MEETING_ALREADY_COMPLETED"
        );
      }

      /*
      |--------------------------------------------------------------------------
      | Complete Meeting
      |--------------------------------------------------------------------------
      */

      const changed =
        await completeMeeting(
          {
            meetingId,

            outcome:
              data.outcome,

            notes:
              data.notes,

            nextAction:
              data.nextAction,

            followUpAt:
              data.followUpAt,

            userId:
              currentUser.id,
          },

          connection
        );

      if (!changed) {
        throw new ApiError(
          409,
          "Meeting could not be completed.",
          [],
          "MEETING_COMPLETION_FAILED"
        );
      }

      /*
      |--------------------------------------------------------------------------
      | Meeting Activity
      |--------------------------------------------------------------------------
      */

      await createActivity(
        {
          leadId:
            existing.leadId,

          activityType:
            "Meeting",

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
      | Lead Last Touch + Next Action
      |--------------------------------------------------------------------------
      */

      await updateLeadFromActivity(
        {
          leadId:
            existing.leadId,

          nextAction:
            data.nextAction,

          nextFollowUpAt:
            data.followUpAt,

          userId:
            currentUser.id,
        },

        connection
      );

      /*
      |--------------------------------------------------------------------------
      | Create Follow-up
      |--------------------------------------------------------------------------
      */

      let followupCode =
        null;

      if (
        data.nextAction &&
        data.followUpAt
      ) {
        followupCode =
          generatePublicId(
            "FUP"
          );

        const lead =
          await findLeadById(
            existing.leadId,
            currentUser,
            connection
          );

        await createLeadFollowup(
          {
            followupCode,

            leadId:
              existing.leadId,

            assignedTo:
              lead.ownerId,

            action:
              data.nextAction,

            dueAt:
              data.followUpAt,

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
      | Reload
      |--------------------------------------------------------------------------
      */

      const updated =
        await findMeetingById(
          meetingId,
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
          "MEETING",

        entityId:
          meetingId,

        action:
          "MEETING_COMPLETED",

        previousValues:
          existing,

        newValues:
          updated,

        metadata: {
          followupCode,
        },

        ipAddress,

        userAgent,

        connection,
      });

      await connection.commit();

      return updated;
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

  /*
|--------------------------------------------------------------------------
| Reschedule Meeting
|--------------------------------------------------------------------------
*/

export const rescheduleMeetingService =
  async ({
    meetingId,
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
        await findMeetingById(
          meetingId,
          currentUser,
          connection
        );

      if (!existing) {
        throw new ApiError(
          404,
          "Meeting not found.",
          [],
          "MEETING_NOT_FOUND"
        );
      }

      if (
        ![
          "SCHEDULED",
          "RESCHEDULED",
        ].includes(
          existing.status
        )
      ) {
        throw new ApiError(
          409,
          "Only scheduled meetings can be rescheduled.",
          [],
          "MEETING_CANNOT_RESCHEDULE"
        );
      }

      const changed =
        await rescheduleMeeting(
          {
            meetingId,

            startsAt:
              data.startsAt,

            endsAt:
              data.endsAt,

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
          "Meeting could not be rescheduled.",
          [],
          "MEETING_RESCHEDULE_FAILED"
        );
      }

      await createActivity(
        {
          leadId:
            existing.leadId,

          activityType:
            "Meeting",

          outcome:
            "Meeting rescheduled",

          notes:
            data.reason,

          userId:
            currentUser.id,
        },

        connection
      );

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

      const updated =
        await findMeetingById(
          meetingId,
          currentUser,
          connection
        );

      await createAuditLog({
        actorUserId:
          currentUser.id,

        entityType:
          "MEETING",

        entityId:
          meetingId,

        action:
          "MEETING_RESCHEDULED",

        previousValues:
          existing,

        newValues:
          updated,

        metadata: {
          reason:
            data.reason,
        },

        ipAddress,
        userAgent,
        connection,
      });

      await connection.commit();

      return updated;
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

/*
|--------------------------------------------------------------------------
| Cancel Meeting
|--------------------------------------------------------------------------
*/

export const cancelMeetingService =
  async ({
    meetingId,
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
        await findMeetingById(
          meetingId,
          currentUser,
          connection
        );

      if (!existing) {
        throw new ApiError(
          404,
          "Meeting not found.",
          [],
          "MEETING_NOT_FOUND"
        );
      }

      if (
        ![
          "SCHEDULED",
          "RESCHEDULED",
        ].includes(
          existing.status
        )
      ) {
        throw new ApiError(
          409,
          "This meeting cannot be cancelled.",
          [],
          "MEETING_CANNOT_CANCEL"
        );
      }

      const changed =
        await cancelMeeting(
          {
            meetingId,

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
          "Meeting could not be cancelled.",
          [],
          "MEETING_CANCEL_FAILED"
        );
      }

      await createActivity(
        {
          leadId:
            existing.leadId,

          activityType:
            "Meeting",

          outcome:
            "Meeting cancelled",

          notes:
            data.reason,

          userId:
            currentUser.id,
        },

        connection
      );

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

      const updated =
        await findMeetingById(
          meetingId,
          currentUser,
          connection
        );

      await createAuditLog({
        actorUserId:
          currentUser.id,

        entityType:
          "MEETING",

        entityId:
          meetingId,

        action:
          "MEETING_CANCELLED",

        previousValues:
          existing,

        newValues:
          updated,

        metadata: {
          reason:
            data.reason,
        },

        ipAddress,
        userAgent,
        connection,
      });

      await connection.commit();

      return updated;
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

/*
|--------------------------------------------------------------------------
| Mark Meeting No-show
|--------------------------------------------------------------------------
*/

export const noShowMeetingService =
  async ({
    meetingId,
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
        await findMeetingById(
          meetingId,
          currentUser,
          connection
        );

      if (!existing) {
        throw new ApiError(
          404,
          "Meeting not found.",
          [],
          "MEETING_NOT_FOUND"
        );
      }

      if (
        ![
          "SCHEDULED",
          "RESCHEDULED",
        ].includes(
          existing.status
        )
      ) {
        throw new ApiError(
          409,
          "This meeting cannot be marked as no-show.",
          [],
          "MEETING_CANNOT_NO_SHOW"
        );
      }

      const changed =
        await markMeetingNoShow(
          {
            meetingId,

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
          "Meeting could not be marked as no-show.",
          [],
          "MEETING_NO_SHOW_FAILED"
        );
      }

      await createActivity(
        {
          leadId:
            existing.leadId,

          activityType:
            "Meeting",

          outcome:
            "Client no-show",

          notes:
            data.reason,

          userId:
            currentUser.id,
        },

        connection
      );

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

      const updated =
        await findMeetingById(
          meetingId,
          currentUser,
          connection
        );

      await createAuditLog({
        actorUserId:
          currentUser.id,

        entityType:
          "MEETING",

        entityId:
          meetingId,

        action:
          "MEETING_NO_SHOW",

        previousValues:
          existing,

        newValues:
          updated,

        metadata: {
          reason:
            data.reason,
        },

        ipAddress,
        userAgent,
        connection,
      });

      await connection.commit();

      return updated;
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