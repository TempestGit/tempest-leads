import { z } from "zod";

/*
|--------------------------------------------------------------------------
| Responsibilities
|--------------------------------------------------------------------------
*/

export const TEAM_RESPONSIBILITIES = [
  "ACCOUNT_SERVICING",
  "STRATEGY",
  "CREATIVE",
  "DESIGN",
  "COPY",
  "MEDIA_DIGITAL",
  "PRODUCTION",
  "PRESENTATION_OWNER",
];

/*
|--------------------------------------------------------------------------
| Statuses
|--------------------------------------------------------------------------
*/

export const TEAM_ASSIGNMENT_STATUSES = [
  "PENDING",
  "IN_PROGRESS",
  "COMPLETED",
];

/*
|--------------------------------------------------------------------------
| Lead ID
|--------------------------------------------------------------------------
*/

export const teamLeadIdSchema =
  z.object({
    leadId:
      z.coerce
        .number()
        .int()
        .positive(),
  });

/*
|--------------------------------------------------------------------------
| Assignment ID
|--------------------------------------------------------------------------
*/

export const teamAssignmentIdSchema =
  z.object({
    assignmentId:
      z.coerce
        .number()
        .int()
        .positive(),
  });

/*
|--------------------------------------------------------------------------
| Options Query
|--------------------------------------------------------------------------
*/

export const teamAssignmentOptionsQuerySchema =
  z.object({
    branchId:
      z.coerce
        .number()
        .int()
        .positive()
        .optional(),
  });

/*
|--------------------------------------------------------------------------
| Create / Reassign
|--------------------------------------------------------------------------
*/

export const saveTeamAssignmentSchema =
  z.object({
    userId:
      z.coerce
        .number()
        .int()
        .positive(),

    responsibility:
      z.enum(
        TEAM_RESPONSIBILITIES
      ),

    memberBranchId:
      z.coerce
        .number()
        .int()
        .positive(),

    isCrossBranch:
      z
        .boolean()
        .default(false),

    dueAt:
      z.coerce
        .date()
        .nullable()
        .optional(),

    status:
      z
        .enum(
          TEAM_ASSIGNMENT_STATUSES
        )
        .default(
          "PENDING"
        ),
  });

/*
|--------------------------------------------------------------------------
| Status
|--------------------------------------------------------------------------
*/

export const updateTeamAssignmentStatusSchema =
  z.object({
    status:
      z.enum(
        TEAM_ASSIGNMENT_STATUSES
      ),
  });