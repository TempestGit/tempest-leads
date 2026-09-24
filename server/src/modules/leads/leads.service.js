import pool from "../../config/db.js";

import ApiError from "../../utils/ApiError.js";

import {
  createAuditLog,
} from "../../services/audit.service.js";

import {
  createActivity,
} from "../activities/activities.repository.js";

import {
  upsertNurtureProfile,
} from "../nurture/nurture.repository.js";

import {
  listAssignableLeadOwners,
} from "./leads.repository.js";

import {
  closeLeadState,
  createLeadFollowup,
  createLeadStageHistory,
  findContactForCompany,
  findLeadById,
  findLeadCompany,
  findLeadOwner,
  insertLead,
  listLeadOptions,
  listLeads,
  updateLead,
  updateLeadOwner,
  updateLeadStage,
} from "./leads.repository.js";

/*
|--------------------------------------------------------------------------
| Follow-up Code
|--------------------------------------------------------------------------
*/

const createFollowupCode =
  () =>
    `FUP-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 7)
      .toUpperCase()}`;

/*
|--------------------------------------------------------------------------
| Validate Company / Contact
|--------------------------------------------------------------------------
*/

const validateLeadRelations =
  async (
    {
      companyId,
      primaryContactId,
    },
    connection
  ) => {
    const company =
      await findLeadCompany(
        companyId,
        connection
      );

    if (!company) {
      throw new ApiError(
        404,
        "Company not found.",
        [],
        "COMPANY_NOT_FOUND"
      );
    }

    const contact =
      await findContactForCompany(
        primaryContactId,
        companyId,
        connection
      );

    if (!contact) {
      throw new ApiError(
        422,
        "Primary contact does not belong to the selected company.",
        [],
        "INVALID_PRIMARY_CONTACT"
      );
    }

    return {
      company,
      contact,
    };
  };

/*
|--------------------------------------------------------------------------
| Validate Owner
|--------------------------------------------------------------------------
*/

const validateOwner =
  async (
    ownerId,
    connection
  ) => {
    const owner =
      await findLeadOwner(
        ownerId,
        connection
      );

    if (!owner) {
      throw new ApiError(
        404,
        "Owner not found.",
        [],
        "OWNER_NOT_FOUND"
      );
    }

    return owner;
  };

/*
|--------------------------------------------------------------------------
| List Leads
|--------------------------------------------------------------------------
*/

export const getLeadsService =
  async (
    filters,
    currentUser
  ) => {
    const {
      leads,
      total,
    } =
      await listLeads({
        ...filters,

        currentUser,
      });

    return {
      leads,

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
| Lead Options
|--------------------------------------------------------------------------
*/

export const getLeadOptionsService =
  async (
    currentUser
  ) => {
    const leads =
      await listLeadOptions(
        currentUser
      );

    return {
      leads,
    };
  };

/*
|--------------------------------------------------------------------------
| Get One
|--------------------------------------------------------------------------
*/

export const getLeadService =
  async (
    leadId,
    currentUser
  ) => {
    const lead =
      await findLeadById(
        leadId,
        currentUser
      );

    if (!lead) {
      throw new ApiError(
        404,
        "Lead not found.",
        [],
        "LEAD_NOT_FOUND"
      );
    }

    return lead;
  };

/*
|--------------------------------------------------------------------------
| Create Lead
|--------------------------------------------------------------------------
*/

export const createLeadService =
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
      | Validate Relations
      |--------------------------------------------------------------------------
      */

      await validateLeadRelations(
        {
          companyId:
            data.companyId,

          primaryContactId:
            data.primaryContactId,
        },
        connection
      );

      await validateOwner(
        data.ownerId,
        connection
      );

      /*
      |--------------------------------------------------------------------------
      | Create Lead
      |--------------------------------------------------------------------------
      */

      const {
        leadId,
        leadCode,
      } =
        await insertLead(
          data,
          currentUser.id,
          connection
        );

      /*
      |--------------------------------------------------------------------------
      | Initial Stage History
      |--------------------------------------------------------------------------
      */

      await createLeadStageHistory(
        {
          leadId,

          previousStage:
            null,

          newStage:
            "New",

          reason:
            "Lead created.",

          userId:
            currentUser.id,
        },
        connection
      );

      /*
      |--------------------------------------------------------------------------
      | Initial Activity
      |--------------------------------------------------------------------------
      */

      await createActivity(
        {
          leadId,

          activityType:
            "Lead created",

          outcome:
            "New lead created",

          notes:
            "Company and primary contact captured.",

          userId:
            currentUser.id,
        },
        connection
      );

      /*
      |--------------------------------------------------------------------------
      | Initial Follow-up
      |--------------------------------------------------------------------------
      */

      await createLeadFollowup(
        {
          followupCode:
            createFollowupCode(),

          leadId,

          assignedTo:
            data.ownerId,

          action:
            data.nextAction,

          dueAt:
            data.followUpAt,

          priority:
            data.priority,

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

      const lead =
        await findLeadById(
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
          "LEAD",

        entityId:
          leadId,

        action:
          "LEAD_CREATED",

        previousValues:
          null,

        newValues:
          lead,

        metadata: {
          leadCode,
        },

        ipAddress,
        userAgent,
        connection,
      });

      await connection.commit();

      return lead;
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
| Update Lead
|--------------------------------------------------------------------------
*/

export const updateLeadService =
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

      const existing =
        await findLeadById(
          leadId,
          currentUser,
          connection
        );

      if (!existing) {
        throw new ApiError(
          404,
          "Lead not found.",
          [],
          "LEAD_NOT_FOUND"
        );
      }

      /*
      |--------------------------------------------------------------------------
      | Validate Company / Contact
      |--------------------------------------------------------------------------
      */

      const companyId =
        data.companyId ??
        existing.companyId;

      const contactId =
        data.primaryContactId ??
        existing.primaryContactId;

      await validateLeadRelations(
        {
          companyId,

          primaryContactId:
            contactId,
        },
        connection
      );

      /*
      |--------------------------------------------------------------------------
      | Update
      |--------------------------------------------------------------------------
      */

      await updateLead(
        leadId,
        data,
        currentUser.id,
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
            "Lead edited",

          outcome:
            "Lead details updated",

          notes:
            "Lead profile information was updated.",

          userId:
            currentUser.id,
        },
        connection
      );

      const updated =
        await findLeadById(
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
          "LEAD",

        entityId:
          leadId,

        action:
          "LEAD_UPDATED",

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
        // Ignore.
      }

      throw error;
    } finally {
      connection.release();
    }
  };

/*
|--------------------------------------------------------------------------
| Change Stage
|--------------------------------------------------------------------------
*/

export const changeLeadStageService =
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

      const existing =
        await findLeadById(
          leadId,
          currentUser,
          connection
        );

      if (!existing) {
        throw new ApiError(
          404,
          "Lead not found.",
          [],
          "LEAD_NOT_FOUND"
        );
      }

      /*
      |--------------------------------------------------------------------------
      | Lost Must Use Dedicated Flow
      |--------------------------------------------------------------------------
      */

      if (
        data.stage ===
        "Lost"
      ) {
        throw new ApiError(
          422,
          "Use the Mark Lost action to close a lead.",
          [],
          "USE_MARK_LOST_FLOW"
        );
      }

      /*
      |--------------------------------------------------------------------------
      | Same Stage
      |--------------------------------------------------------------------------
      */

      if (
        existing.stage ===
        data.stage
      ) {
        throw new ApiError(
          409,
          "Lead is already in this stage.",
          [],
          "LEAD_STAGE_UNCHANGED"
        );
      }

      /*
      |--------------------------------------------------------------------------
      | Status
      |--------------------------------------------------------------------------
      */

      let status =
        existing.status;

      if (
        data.stage ===
        "Nurture"
      ) {
        status =
          "Open";
      }

      if (
        data.stage ===
        "Active Client"
      ) {
        status =
          "Active Client";
      }

      /*
      |--------------------------------------------------------------------------
      | Update Stage
      |--------------------------------------------------------------------------
      */

      const changed =
        await updateLeadStage(
          {
            leadId,

            stage:
              data.stage,

            status,

            userId:
              currentUser.id,
          },
          connection
        );

      if (!changed) {
        throw new ApiError(
          409,
          "Lead stage could not be changed.",
          [],
          "LEAD_STAGE_CHANGE_FAILED"
        );
      }

      /*
      |--------------------------------------------------------------------------
      | Stage History
      |--------------------------------------------------------------------------
      */

      await createLeadStageHistory(
        {
          leadId,

          previousStage:
            existing.stage,

          newStage:
            data.stage,

          reason:
            data.reason,

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
            "Stage change",

          outcome:
            `Moved from ${existing.stage} to ${data.stage}`,

          notes:
            data.reason,

          userId:
            currentUser.id,
        },
        connection
      );

      /*
      |--------------------------------------------------------------------------
      | Automatically Create Nurture Profile
      |--------------------------------------------------------------------------
      */

      if (
        data.stage ===
        "Nurture"
      ) {
        await upsertNurtureProfile(
          {
            leadId,

            category:
              "LATER",

            reason:
              data.reason,

            buyingStage:
              null,

            communicationStatus:
              "NOT_CONTACTED",

            reconnectAt:
              existing.followUpAt ||
              null,

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
        await findLeadById(
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
          "LEAD",

        entityId:
          leadId,

        action:
          "LEAD_STAGE_CHANGED",

        previousValues: {
          stage:
            existing.stage,

          status:
            existing.status,
        },

        newValues: {
          stage:
            updated.stage,

          status:
            updated.status,
        },

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
| Change Owner
|--------------------------------------------------------------------------
*/

export const changeLeadOwnerService =
  async ({
    leadId,
    data,
    currentUser,
    ipAddress,
    userAgent,
  }) => {
    if (
      currentUser.role !==
      "SUPER_ADMIN"
    ) {
      throw new ApiError(
        403,
        "Only Super Admin can reassign lead ownership.",
        [],
        "FORBIDDEN"
      );
    }

    const connection =
      await pool.getConnection();

    try {
      await connection.beginTransaction();

      const existing =
        await findLeadById(
          leadId,
          currentUser,
          connection
        );

      if (!existing) {
        throw new ApiError(
          404,
          "Lead not found.",
          [],
          "LEAD_NOT_FOUND"
        );
      }

      const owner =
        await validateOwner(
          data.ownerId,
          connection
        );

      if (
        Number(
          existing.ownerId
        ) ===
        Number(
          data.ownerId
        )
      ) {
        throw new ApiError(
          409,
          "This user already owns the lead.",
          [],
          "LEAD_OWNER_UNCHANGED"
        );
      }

      await updateLeadOwner(
        {
          leadId,

          ownerId:
            data.ownerId,

          userId:
            currentUser.id,
        },
        connection
      );

      /*
      |--------------------------------------------------------------------------
      | Move Open Follow-ups To New Owner
      |--------------------------------------------------------------------------
      */

      await connection.query(
        `
          UPDATE followups

          SET
            assigned_to = ?,
            updated_by = ?

          WHERE
            lead_id = ?
            AND status =
              'PENDING'
        `,
        [
          data.ownerId,
          currentUser.id,
          leadId,
        ]
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
            "Owner changed",

          outcome:
            `Assigned to ${owner.fullName}`,

          notes:
            data.reason ||
            "Lead reassigned.",

          userId:
            currentUser.id,
        },
        connection
      );

      const updated =
        await findLeadById(
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
          "LEAD",

        entityId:
          leadId,

        action:
          "LEAD_OWNER_CHANGED",

        previousValues: {
          ownerId:
            existing.ownerId,

          ownerName:
            existing.ownerName,
        },

        newValues: {
          ownerId:
            updated.ownerId,

          ownerName:
            updated.ownerName,
        },

        metadata: {
          reason:
            data.reason ||
            null,
        },

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
        // Ignore.
      }

      throw error;
    } finally {
      connection.release();
    }
  };

/*
|--------------------------------------------------------------------------
| Mark Lead Lost
|--------------------------------------------------------------------------
*/

export const markLeadLostService =
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
      | Existing
      |--------------------------------------------------------------------------
      */

      const existing =
        await findLeadById(
          leadId,
          currentUser,
          connection
        );

      if (!existing) {
        throw new ApiError(
          404,
          "Lead not found.",
          [],
          "LEAD_NOT_FOUND"
        );
      }

      /*
      |--------------------------------------------------------------------------
      | Already Lost
      |--------------------------------------------------------------------------
      */

      if (
        existing.stage ===
          "Lost" &&
        !data.moveToNurture
      ) {
        throw new ApiError(
          409,
          "Lead is already marked as lost.",
          [],
          "LEAD_ALREADY_LOST"
        );
      }

      /*
      |--------------------------------------------------------------------------
      | Destination
      |--------------------------------------------------------------------------
      */

      const nextStage =
        data.moveToNurture
          ? "Nurture"
          : "Lost";

      /*
      |--------------------------------------------------------------------------
      | Reconnect
      |--------------------------------------------------------------------------
      |
      | Preserve current follow-up when moving to nurture.
      |
      */

      const reconnectAt =
        data.moveToNurture
          ? existing.followUpAt ||
            null
          : null;

      /*
      |--------------------------------------------------------------------------
      | Lead
      |--------------------------------------------------------------------------
      */

      const changed =
        await closeLeadState(
          {
            leadId,

            stage:
              nextStage,

            status:
              "Not interested",

            nextAction:
              data.moveToNurture
                ? "Reconnect when relevant"
                : null,

            followUpAt:
              reconnectAt,

            userId:
              currentUser.id,
          },
          connection
        );

      if (!changed) {
        throw new ApiError(
          409,
          "Lead could not be closed.",
          [],
          "LEAD_CLOSE_FAILED"
        );
      }

      /*
      |--------------------------------------------------------------------------
      | Stage History
      |--------------------------------------------------------------------------
      */

      await createLeadStageHistory(
        {
          leadId,

          previousStage:
            existing.stage,

          newStage:
            nextStage,

          reason:
            `${data.reason}: ${data.comment}`,

          userId:
            currentUser.id,
        },
        connection
      );

      /*
      |--------------------------------------------------------------------------
      | Nurture Profile
      |--------------------------------------------------------------------------
      |
      | Lost records are still preserved in the Nurture database so they can
      | later be segmented and reconnected.
      |
      */

      await upsertNurtureProfile(
        {
          leadId,

          category:
            "LOST_NOT_INTERESTED",

          reason:
            data.reason,

          buyingStage:
            null,

          communicationStatus:
            data.reason ===
            "No response"
              ? "NO_RESPONSE"
              : "NOT_CONTACTED",

          reconnectAt,

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
            "Stage change",

          outcome:
            data.moveToNurture
              ? "Lead closed and moved to nurture"
              : "Lead marked lost / not interested",

          notes:
            `${data.reason}: ${data.comment}`,

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
        await findLeadById(
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
          "LEAD",

        entityId:
          leadId,

        action:
          "LEAD_MARKED_LOST",

        previousValues: {
          stage:
            existing.stage,

          status:
            existing.status,

          nextAction:
            existing.nextAction,

          followUpAt:
            existing.followUpAt,
        },

        newValues: {
          stage:
            updated.stage,

          status:
            updated.status,

          nextAction:
            updated.nextAction,

          followUpAt:
            updated.followUpAt,
        },

        metadata: {
          reason:
            data.reason,

          comment:
            data.comment,

          moveToNurture:
            data.moveToNurture,

          nurtureCategory:
            "LOST_NOT_INTERESTED",
        },

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
| Get Assignable Owners
|--------------------------------------------------------------------------
*/

export const getLeadOwnersService =
  async (
    currentUser
  ) => {
    if (
      currentUser.role !==
      "SUPER_ADMIN"
    ) {
      throw new ApiError(
        403,
        "Only Super Admin can assign or reassign lead owners.",
        [],
        "FORBIDDEN"
      );
    }

    const owners =
      await listAssignableLeadOwners();

    return {
      owners,
    };
  };