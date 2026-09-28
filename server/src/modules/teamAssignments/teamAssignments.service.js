import pool from "../../config/db.js";

import ApiError from "../../utils/ApiError.js";

import {
  createAuditLog,
} from "../../services/audit.service.js";

import {
  createActivity,
} from "../activities/activities.repository.js";

import {
  deleteTeamAssignment,
  findAssignableUser,
  findBranchById,
  findTeamAssignmentById,
  findTeamAssignmentByResponsibility,
  findTeamLead,
  listAssignableUsers,
  listBranches,
  listTeamAssignmentsByLead,
  updateTeamAssignmentStatus,
  upsertTeamAssignment,
} from "./teamAssignments.repository.js";

/*
|--------------------------------------------------------------------------
| Labels
|--------------------------------------------------------------------------
*/

const RESPONSIBILITY_LABELS = {
  ACCOUNT_SERVICING:
    "Account / Servicing",

  STRATEGY:
    "Strategy",

  CREATIVE:
    "Creative",

  DESIGN:
    "Design",

  COPY:
    "Copy",

  MEDIA_DIGITAL:
    "Media / Digital",

  PRODUCTION:
    "Production",

  PRESENTATION_OWNER:
    "Presentation Owner",
};

/*
|--------------------------------------------------------------------------
| Admin
|--------------------------------------------------------------------------
*/

const requireSuperAdmin =
  (
    currentUser
  ) => {
    if (
      currentUser.role !==
      "SUPER_ADMIN"
    ) {
      throw new ApiError(
        403,
        "Only Super Admin can assign or reassign team members.",
        [],
        "FORBIDDEN"
      );
    }
  };

/*
|--------------------------------------------------------------------------
| Options
|--------------------------------------------------------------------------
*/

export const getTeamAssignmentOptionsService =
  async ({
    branchId,
    currentUser,
  }) => {
    requireSuperAdmin(
      currentUser
    );

    const branches =
      await listBranches();

    let users = [];

    if (
      branchId
    ) {
      const branch =
        await findBranchById(
          branchId
        );

      if (!branch) {
        throw new ApiError(
          404,
          "Branch not found.",
          [],
          "BRANCH_NOT_FOUND"
        );
      }

      users =
        await listAssignableUsers(
          branchId
        );
    }

    return {
      branches,

      users,

      responsibilities:
        Object.entries(
          RESPONSIBILITY_LABELS
        ).map(
          (
            [
              value,
              label,
            ]
          ) => ({
            value,
            label,
          })
        ),

      statuses: [
        {
          value:
            "PENDING",
          label:
            "Pending",
        },
        {
          value:
            "IN_PROGRESS",
          label:
            "In Progress",
        },
        {
          value:
            "COMPLETED",
          label:
            "Completed",
        },
      ],
    };
  };

/*
|--------------------------------------------------------------------------
| List
|--------------------------------------------------------------------------
*/

export const getTeamAssignmentsService =
  async (
    leadId,
    currentUser
  ) => {
    const lead =
      await findTeamLead(
        leadId,
        currentUser
      );

    if (!lead) {
      throw new ApiError(
        404,
        "Lead not found or you do not have access.",
        [],
        "LEAD_NOT_FOUND"
      );
    }

    const assignments =
      await listTeamAssignmentsByLead(
        leadId
      );

    return {
      lead,
      assignments,
    };
  };

/*
|--------------------------------------------------------------------------
| Assign / Reassign
|--------------------------------------------------------------------------
*/

export const saveTeamAssignmentService =
  async ({
    leadId,
    data,
    currentUser,
    ipAddress,
    userAgent,
  }) => {
    requireSuperAdmin(
      currentUser
    );

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
        await findTeamLead(
          leadId,
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

      if (
        !lead.branchId
      ) {
        throw new ApiError(
          422,
          "Set the lead branch before assigning team members.",
          [],
          "LEAD_BRANCH_REQUIRED"
        );
      }

      /*
      |--------------------------------------------------------------------------
      | Selected Branch
      |--------------------------------------------------------------------------
      */

      const selectedBranch =
        await findBranchById(
          data.memberBranchId,
          connection
        );

      if (
        !selectedBranch
      ) {
        throw new ApiError(
          404,
          "Selected branch was not found.",
          [],
          "BRANCH_NOT_FOUND"
        );
      }

      /*
      |--------------------------------------------------------------------------
      | User
      |--------------------------------------------------------------------------
      */

      const selectedUser =
        await findAssignableUser(
          data.userId,
          connection
        );

      if (
        !selectedUser
      ) {
        throw new ApiError(
          404,
          "Selected team member was not found.",
          [],
          "TEAM_USER_NOT_FOUND"
        );
      }

      if (
        !selectedUser.branchId
      ) {
        throw new ApiError(
          422,
          "Selected team member does not have a branch assigned.",
          [],
          "USER_BRANCH_REQUIRED"
        );
      }

      /*
      |--------------------------------------------------------------------------
      | User Must Belong To Selected Branch
      |--------------------------------------------------------------------------
      */

      if (
        Number(
          selectedUser.branchId
        ) !==
        Number(
          data.memberBranchId
        )
      ) {
        throw new ApiError(
          422,
          "Selected team member does not belong to the selected branch.",
          [],
          "TEAM_BRANCH_MISMATCH"
        );
      }

      /*
      |--------------------------------------------------------------------------
      | Cross Branch Rules
      |--------------------------------------------------------------------------
      */

      const actuallyCrossBranch =
        Number(
          lead.branchId
        ) !==
        Number(
          data.memberBranchId
        );

      if (
        actuallyCrossBranch &&
        !data.isCrossBranch
      ) {
        throw new ApiError(
          422,
          "Enable cross-branch assignment before selecting a member from another branch.",
          [],
          "CROSS_BRANCH_REQUIRED"
        );
      }

      if (
        !actuallyCrossBranch &&
        data.isCrossBranch
      ) {
        throw new ApiError(
          422,
          "Cross-branch assignment is not required when the member belongs to the lead branch.",
          [],
          "INVALID_CROSS_BRANCH_FLAG"
        );
      }

      /*
      |--------------------------------------------------------------------------
      | Existing Responsibility
      |--------------------------------------------------------------------------
      */

      const existing =
        await findTeamAssignmentByResponsibility(
          leadId,
          data.responsibility,
          connection
        );

      /*
      |--------------------------------------------------------------------------
      | Save
      |--------------------------------------------------------------------------
      */

      const assignmentId =
        await upsertTeamAssignment(
          {
            leadId,

            userId:
              selectedUser.id,

            memberBranchId:
              selectedBranch.id,

            isCrossBranch:
              actuallyCrossBranch,

            responsibility:
              data.responsibility,

            dueAt:
              data.dueAt ||
              null,

            status:
              data.status ||
              "PENDING",

            assignedBy:
              currentUser.id,
          },
          connection
        );

      const updated =
        await findTeamAssignmentById(
          assignmentId,
          connection
        );

      const label =
        RESPONSIBILITY_LABELS[
          data.responsibility
        ] ||
        data.responsibility;

      /*
      |--------------------------------------------------------------------------
      | Activity
      |--------------------------------------------------------------------------
      */

      await createActivity(
        {
          leadId,

          activityType:
            "Team assignment",

          outcome:
            existing
              ? `${label} reassigned to ${selectedUser.fullName}`
              : `${label} assigned to ${selectedUser.fullName}`,

          notes:
            actuallyCrossBranch
              ? `Cross-branch assignment: ${lead.branchName} → ${selectedBranch.name}`
              : `Branch: ${selectedBranch.name}`,

          userId:
            currentUser.id,
        },
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
          "TEAM_ASSIGNMENT",

        entityId:
          assignmentId,

        action:
          existing
            ? "TEAM_ASSIGNMENT_UPDATED"
            : "TEAM_ASSIGNMENT_CREATED",

        previousValues:
          existing,

        newValues:
          updated,

        metadata: {
          leadId,

          leadBranchId:
            lead.branchId,

          memberBranchId:
            selectedBranch.id,

          crossBranch:
            actuallyCrossBranch,
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
        // Ignore rollback error.
      }

      throw error;
    } finally {
      connection.release();
    }
  };

/*
|--------------------------------------------------------------------------
| Update Status
|--------------------------------------------------------------------------
*/

export const updateTeamAssignmentStatusService =
  async ({
    assignmentId,
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
        await findTeamAssignmentById(
          assignmentId,
          connection
        );

      if (!existing) {
        throw new ApiError(
          404,
          "Team assignment not found.",
          [],
          "TEAM_ASSIGNMENT_NOT_FOUND"
        );
      }

      const isAdmin =
        currentUser.role ===
        "SUPER_ADMIN";

      const isAssignedUser =
        Number(
          existing.userId
        ) ===
        Number(
          currentUser.id
        );

      if (
        !isAdmin &&
        !isAssignedUser
      ) {
        throw new ApiError(
          403,
          "You cannot update this team assignment.",
          [],
          "FORBIDDEN"
        );
      }

      await updateTeamAssignmentStatus(
        {
          assignmentId,

          status:
            data.status,
        },
        connection
      );

      const updated =
        await findTeamAssignmentById(
          assignmentId,
          connection
        );

      await createActivity(
        {
          leadId:
            existing.leadId,

          activityType:
            "Team assignment",

          outcome:
            `${
              RESPONSIBILITY_LABELS[
                existing.responsibility
              ] ||
              existing.responsibility
            } status changed to ${data.status}`,

          notes:
            null,

          userId:
            currentUser.id,
        },
        connection
      );

      await createAuditLog({
        actorUserId:
          currentUser.id,

        entityType:
          "TEAM_ASSIGNMENT",

        entityId:
          assignmentId,

        action:
          "TEAM_ASSIGNMENT_STATUS_CHANGED",

        previousValues: {
          status:
            existing.status,
        },

        newValues: {
          status:
            updated.status,
        },

        metadata: {
          leadId:
            existing.leadId,
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
| Remove
|--------------------------------------------------------------------------
*/

export const removeTeamAssignmentService =
  async ({
    assignmentId,
    currentUser,
    ipAddress,
    userAgent,
  }) => {
    requireSuperAdmin(
      currentUser
    );

    const connection =
      await pool.getConnection();

    try {
      await connection.beginTransaction();

      const existing =
        await findTeamAssignmentById(
          assignmentId,
          connection
        );

      if (!existing) {
        throw new ApiError(
          404,
          "Team assignment not found.",
          [],
          "TEAM_ASSIGNMENT_NOT_FOUND"
        );
      }

      await deleteTeamAssignment(
        assignmentId,
        connection
      );

      await createActivity(
        {
          leadId:
            existing.leadId,

          activityType:
            "Team assignment",

          outcome:
            `${
              RESPONSIBILITY_LABELS[
                existing.responsibility
              ] ||
              existing.responsibility
            } assignment removed`,

          notes:
            `Removed ${existing.userName} (${existing.memberBranchName || "No branch"}).`,

          userId:
            currentUser.id,
        },
        connection
      );

      await createAuditLog({
        actorUserId:
          currentUser.id,

        entityType:
          "TEAM_ASSIGNMENT",

        entityId:
          assignmentId,

        action:
          "TEAM_ASSIGNMENT_REMOVED",

        previousValues:
          existing,

        newValues:
          null,

        metadata: {
          leadId:
            existing.leadId,
        },

        ipAddress,
        userAgent,
        connection,
      });

      await connection.commit();

      return {
        id:
          assignmentId,
      };
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