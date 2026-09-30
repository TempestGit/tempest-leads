import pool from "../../config/db.js";

import ApiError from "../../utils/ApiError.js";

import {
  createAuditLog,
} from "../../services/audit.service.js";

import {
  createActivity,
} from "../activities/activities.repository.js";

import {
  BRIEF_REQUIRED_FIELDS,
  findBriefByLeadId,
  findBriefLead,
  updateLeadKnownRelationship,
  upsertBrief,
} from "./briefs.repository.js";

/*
|--------------------------------------------------------------------------
| Empty
|--------------------------------------------------------------------------
*/

const emptyValue =
  (value) =>
    value === null ||
    value === undefined ||
    String(value).trim() === "";

/*
|--------------------------------------------------------------------------
| Completeness
|--------------------------------------------------------------------------
*/

const calculateCompleteness =
  (brief) => {
    const missingFields =
      BRIEF_REQUIRED_FIELDS.filter(
        (field) =>
          emptyValue(
            brief[field]
          )
      );

    const completed =
      BRIEF_REQUIRED_FIELDS.length -
      missingFields.length;

    const percentage =
      Math.round(
        (
          completed /
          BRIEF_REQUIRED_FIELDS.length
        ) *
          100
      );

    return {
      complete:
        missingFields.length ===
        0,

      percentage,

      missingFields,
    };
  };

/*
|--------------------------------------------------------------------------
| Empty Brief Shape
|--------------------------------------------------------------------------
|
| Decision makers are NOT stored in the Brief.
|
| Decision makers come from Contacts where:
|
| contacts.is_decision_maker = 1
|
*/

const emptyBrief =
  (leadId) => ({
    leadId,

    businessObjective:
      null,

    clientProblem:
      null,

    targetAudience:
      null,

    campaignRequirement:
      null,

    currentActivity:
      null,

    potentialScope:
      null,

    timeline:
      null,

    budget:
      null,

    approvalProcess:
      null,

    expectedDeliverables:
      null,

    clientExpectations:
      null,

    competitors:
      null,

    categoryInsights:
      null,

    mandatoryRequirements:
      null,

    status:
      "DRAFT",

    routeType:
      null,

    routeDecisionNote:
      null,

    routeDecidedBy:
      null,

    routeDecidedAt:
      null,

    approvedBy:
      null,

    approvedAt:
      null,
  });

/*
|--------------------------------------------------------------------------
| Merge
|--------------------------------------------------------------------------
*/

const mergeBrief =
  (
    existing,
    incoming
  ) => {
    const fields = [
      "businessObjective",
      "clientProblem",
      "targetAudience",
      "campaignRequirement",
      "currentActivity",
      "potentialScope",
      "timeline",
      "budget",
      "approvalProcess",
      "expectedDeliverables",
      "clientExpectations",
      "competitors",
      "categoryInsights",
      "mandatoryRequirements",
      "status",
      "routeType",
      "routeDecisionNote",
    ];

    const result = {
      ...existing,
    };

    fields.forEach(
      (field) => {
        if (
          incoming[field] !==
          undefined
        ) {
          result[field] =
            incoming[field];
        }
      }
    );

    return result;
  };

/*
|--------------------------------------------------------------------------
| Response Shape
|--------------------------------------------------------------------------
*/

const withCompleteness =
  (brief) => {
    if (!brief) {
      return null;
    }

    return {
      ...brief,

      completeness:
        calculateCompleteness(
          brief
        ),
    };
  };

/*
|--------------------------------------------------------------------------
| Get Brief
|--------------------------------------------------------------------------
*/

export const getBriefService =
  async (
    leadId,
    currentUser
  ) => {
    const lead =
      await findBriefLead(
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

    const brief =
      await findBriefByLeadId(
        leadId,
        currentUser
      );

    return {
      brief:
        withCompleteness(
          brief
        ),

      lead,
    };
  };

/*
|--------------------------------------------------------------------------
| Save Brief
|--------------------------------------------------------------------------
*/

export const saveBriefService =
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
      | Lead
      |--------------------------------------------------------------------------
      */

      const lead =
        await findBriefLead(
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

      /*
      |--------------------------------------------------------------------------
      | Existing
      |--------------------------------------------------------------------------
      */

      const existing =
        await findBriefByLeadId(
          leadId,
          currentUser,
          connection
        );

      const base =
        existing ||
        emptyBrief(
          leadId
        );

      const merged =
        mergeBrief(
          base,
          data
        );

      /*
      |--------------------------------------------------------------------------
      | Route Metadata
      |--------------------------------------------------------------------------
      */

      if (
        data.routeType !==
        undefined
      ) {
        merged.routeDecidedBy =
          currentUser.id;

        merged.routeDecidedAt =
          new Date();
      }

      /*
      |--------------------------------------------------------------------------
      | Completeness Gate
      |--------------------------------------------------------------------------
      |
      | BRIEF_REQUIRED_FIELDS now contains only the 14 actual Brief fields.
      |
      | Decision Maker is intentionally excluded because it belongs to Contacts.
      |
      */

      const completeness =
        calculateCompleteness(
          merged
        );

      if (
        [
          "READY",
          "APPROVED",
        ].includes(
          merged.status
        ) &&
        !completeness.complete
      ) {
        throw new ApiError(
          422,
          "Brief is incomplete. Complete all required brief fields before marking it Ready or Approved.",
          completeness.missingFields.map(
            (field) => ({
              field,

              message:
                "This brief field is required before progression.",
            })
          ),
          "BRIEF_INCOMPLETE"
        );
      }

      /*
      |--------------------------------------------------------------------------
      | Route Required For Ready / Approved
      |--------------------------------------------------------------------------
      */

      if (
        [
          "READY",
          "APPROVED",
        ].includes(
          merged.status
        ) &&
        !merged.routeType
      ) {
        throw new ApiError(
          422,
          "Select whether the client / industry is Known / Existing or New / Unknown before progressing the brief.",
          [],
          "BRIEF_ROUTE_REQUIRED"
        );
      }

      /*
      |--------------------------------------------------------------------------
      | Approved
      |--------------------------------------------------------------------------
      */

      if (
        merged.status ===
        "APPROVED"
      ) {
        merged.approvedBy =
          existing
            ?.approvedBy ||
          currentUser.id;

        merged.approvedAt =
          existing
            ?.approvedAt ||
          new Date();
      } else {
        merged.approvedBy =
          null;

        merged.approvedAt =
          null;
      }

      /*
      |--------------------------------------------------------------------------
      | Save
      |--------------------------------------------------------------------------
      */

      await upsertBrief(
        {
          leadId,

          data:
            merged,

          userId:
            currentUser.id,
        },
        connection
      );

      /*
      |--------------------------------------------------------------------------
      | Keep Lead Route Synchronized
      |--------------------------------------------------------------------------
      |
      | KNOWN_EXISTING -> known_relationship = 1
      | NEW_UNKNOWN    -> known_relationship = 0
      |
      */

      if (
        merged.routeType
      ) {
        await updateLeadKnownRelationship(
          {
            leadId,

            knownRelationship:
              merged.routeType ===
              "KNOWN_EXISTING",

            userId:
              currentUser.id,
          },
          connection
        );
      }

      /*
      |--------------------------------------------------------------------------
      | Activity
      |--------------------------------------------------------------------------
      */

      await createActivity(
        {
          leadId,

          activityType:
            "Brief",

          outcome:
            existing
              ? "Brief updated"
              : "Brief created",

          notes:
            `Brief status: ${merged.status}`,

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
        await findBriefByLeadId(
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
          "BRIEF",

        entityId:
          updated.id,

        action:
          existing
            ? "BRIEF_UPDATED"
            : "BRIEF_CREATED",

        previousValues:
          existing,

        newValues:
          updated,

        metadata: {
          leadId,

          completeness:
            completeness.percentage,

          missingFields:
            completeness.missingFields,
        },

        ipAddress,
        userAgent,
        connection,
      });

      await connection.commit();

      return withCompleteness(
        updated
      );
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
| Update Status
|--------------------------------------------------------------------------
*/

export const updateBriefStatusService =
  async ({
    leadId,
    data,
    currentUser,
    ipAddress,
    userAgent,
  }) =>
    saveBriefService({
      leadId,

      data: {
        status:
          data.status,
      },

      currentUser,
      ipAddress,
      userAgent,
    });

/*
|--------------------------------------------------------------------------
| Route Decision
|--------------------------------------------------------------------------
*/

export const updateBriefRouteService =
  async ({
    leadId,
    data,
    currentUser,
    ipAddress,
    userAgent,
  }) =>
    saveBriefService({
      leadId,

      data: {
        routeType:
          data.routeType,

        routeDecisionNote:
          data.note,
      },

      currentUser,
      ipAddress,
      userAgent,
    });