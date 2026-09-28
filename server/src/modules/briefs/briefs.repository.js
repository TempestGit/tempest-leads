import pool from "../../config/db.js";

/*
|--------------------------------------------------------------------------
| Required Fields
|--------------------------------------------------------------------------
*/

export const BRIEF_REQUIRED_FIELDS = [
  "businessObjective",
  "clientProblem",
  "targetAudience",
  "campaignRequirement",
  "currentActivity",
  "potentialScope",
  "timeline",
  "budget",
  "decisionMaker",
  "approvalProcess",
  "expectedDeliverables",
  "clientExpectations",
  "competitors",
  "categoryInsights",
  "mandatoryRequirements",
];

/*
|--------------------------------------------------------------------------
| Map
|--------------------------------------------------------------------------
*/

const mapBrief =
  (row) => {
    if (!row) {
      return null;
    }

    return {
      id:
        Number(
          row.id
        ),

      leadId:
        Number(
          row.leadId
        ),

      leadCode:
        row.leadCode,

      companyName:
        row.companyName,

      ownerId:
        row.ownerId
          ? Number(
              row.ownerId
            )
          : null,

      ownerName:
        row.ownerName,

      businessObjective:
        row.businessObjective,

      clientProblem:
        row.clientProblem,

      targetAudience:
        row.targetAudience,

      campaignRequirement:
        row.campaignRequirement,

      currentActivity:
        row.currentActivity,

      potentialScope:
        row.potentialScope,

      timeline:
        row.timeline,

      budget:
        row.budget,

      decisionMaker:
        row.decisionMaker,

      approvalProcess:
        row.approvalProcess,

      expectedDeliverables:
        row.expectedDeliverables,

      clientExpectations:
        row.clientExpectations,

      competitors:
        row.competitors,

      categoryInsights:
        row.categoryInsights,

      mandatoryRequirements:
        row.mandatoryRequirements,

      status:
        row.status,

      routeType:
        row.routeType,

      routeDecisionNote:
        row.routeDecisionNote,

      routeDecidedBy:
        row.routeDecidedBy
          ? Number(
              row.routeDecidedBy
            )
          : null,

      routeDecidedByName:
        row.routeDecidedByName,

      routeDecidedAt:
        row.routeDecidedAt,

      approvedBy:
        row.approvedBy
          ? Number(
              row.approvedBy
            )
          : null,

      approvedByName:
        row.approvedByName,

      approvedAt:
        row.approvedAt,

      createdBy:
        Number(
          row.createdBy
        ),

      createdByName:
        row.createdByName,

      updatedBy:
        Number(
          row.updatedBy
        ),

      updatedByName:
        row.updatedByName,

      createdAt:
        row.createdAt,

      updatedAt:
        row.updatedAt,
    };
  };

/*
|--------------------------------------------------------------------------
| SELECT
|--------------------------------------------------------------------------
*/

const BRIEF_SELECT = `
  SELECT
    b.id,

    b.lead_id
      AS leadId,

    l.lead_code
      AS leadCode,

    c.name
      AS companyName,

    l.owner_id
      AS ownerId,

    owner.full_name
      AS ownerName,

    b.business_objective
      AS businessObjective,

    b.client_problem
      AS clientProblem,

    b.target_audience
      AS targetAudience,

    b.campaign_requirement
      AS campaignRequirement,

    b.current_activity
      AS currentActivity,

    b.potential_scope
      AS potentialScope,

    b.timeline,

    b.budget,

    b.decision_maker
      AS decisionMaker,

    b.approval_process
      AS approvalProcess,

    b.expected_deliverables
      AS expectedDeliverables,

    b.client_expectations
      AS clientExpectations,

    b.competitors,

    b.category_insights
      AS categoryInsights,

    b.mandatory_requirements
      AS mandatoryRequirements,

    b.status,

    b.route_type
      AS routeType,

    b.route_decision_note
      AS routeDecisionNote,

    b.route_decided_by
      AS routeDecidedBy,

    route_user.full_name
      AS routeDecidedByName,

    b.route_decided_at
      AS routeDecidedAt,

    b.approved_by
      AS approvedBy,

    approved_user.full_name
      AS approvedByName,

    b.approved_at
      AS approvedAt,

    b.created_by
      AS createdBy,

    created_user.full_name
      AS createdByName,

    b.updated_by
      AS updatedBy,

    updated_user.full_name
      AS updatedByName,

    b.created_at
      AS createdAt,

    b.updated_at
      AS updatedAt

  FROM briefs b

  INNER JOIN leads l
    ON l.id =
      b.lead_id

    AND l.deleted_at
      IS NULL

  INNER JOIN companies c
    ON c.id =
      l.company_id

    AND c.deleted_at
      IS NULL

  LEFT JOIN users owner
    ON owner.id =
      l.owner_id

  LEFT JOIN users route_user
    ON route_user.id =
      b.route_decided_by

  LEFT JOIN users approved_user
    ON approved_user.id =
      b.approved_by

  LEFT JOIN users created_user
    ON created_user.id =
      b.created_by

  LEFT JOIN users updated_user
    ON updated_user.id =
      b.updated_by
`;

/*
|--------------------------------------------------------------------------
| Find Brief
|--------------------------------------------------------------------------
*/

export const findBriefByLeadId =
  async (
    leadId,
    currentUser,
    connection = pool
  ) => {
    const conditions = [
      "b.lead_id = ?",
    ];

    const values = [
      leadId,
    ];

    if (
      currentUser.role !==
      "SUPER_ADMIN"
    ) {
      conditions.push(
        "l.owner_id = ?"
      );

      values.push(
        currentUser.id
      );
    }

    const [
      rows,
    ] =
      await connection.query(
        `
          ${BRIEF_SELECT}

          WHERE
            ${conditions.join(
              " AND "
            )}

          LIMIT 1
        `,
        values
      );

    return mapBrief(
      rows[0] ||
        null
    );
  };

/*
|--------------------------------------------------------------------------
| Verify Lead Access
|--------------------------------------------------------------------------
*/

export const findBriefLead =
  async (
    leadId,
    currentUser,
    connection = pool
  ) => {
    const conditions = [
      "l.id = ?",
      "l.deleted_at IS NULL",
    ];

    const values = [
      leadId,
    ];

    if (
      currentUser.role !==
      "SUPER_ADMIN"
    ) {
      conditions.push(
        "l.owner_id = ?"
      );

      values.push(
        currentUser.id
      );
    }

    const [
      rows,
    ] =
      await connection.query(
        `
          SELECT
            l.id,

            l.lead_code
              AS leadCode,

            l.company_id
              AS companyId,

            l.owner_id
              AS ownerId,

            l.stage,

            l.status,

            l.known_relationship
              AS knownRelationship,

            l.next_action
              AS nextAction,

            l.follow_up_at
              AS followUpAt

          FROM leads l

          WHERE
            ${conditions.join(
              " AND "
            )}

          LIMIT 1
        `,
        values
      );

    const row =
      rows[0];

    if (!row) {
      return null;
    }

    return {
      id:
        Number(
          row.id
        ),

      leadCode:
        row.leadCode,

      companyId:
        Number(
          row.companyId
        ),

      ownerId:
        Number(
          row.ownerId
        ),

      stage:
        row.stage,

      status:
        row.status,

      knownRelationship:
        Boolean(
          Number(
            row.knownRelationship ||
              0
          )
        ),

      nextAction:
        row.nextAction,

      followUpAt:
        row.followUpAt,
    };
  };

/*
|--------------------------------------------------------------------------
| Upsert Brief
|--------------------------------------------------------------------------
*/

export const upsertBrief =
  async (
    {
      leadId,
      data,
      userId,
    },
    connection = pool
  ) => {
    await connection.query(
      `
        INSERT INTO briefs (
          lead_id,

          business_objective,
          client_problem,
          target_audience,
          campaign_requirement,
          current_activity,
          potential_scope,
          timeline,
          budget,
          decision_maker,
          approval_process,
          expected_deliverables,
          client_expectations,
          competitors,
          category_insights,
          mandatory_requirements,

          status,

          route_type,
          route_decision_note,

          route_decided_by,
          route_decided_at,

          approved_by,
          approved_at,

          created_by,
          updated_by
        )

        VALUES (
          ?,

          ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?,

          ?,

          ?, ?,

          ?,
          ?,

          ?,
          ?,

          ?,
          ?
        )

        ON DUPLICATE KEY UPDATE

          business_objective =
            VALUES(
              business_objective
            ),

          client_problem =
            VALUES(
              client_problem
            ),

          target_audience =
            VALUES(
              target_audience
            ),

          campaign_requirement =
            VALUES(
              campaign_requirement
            ),

          current_activity =
            VALUES(
              current_activity
            ),

          potential_scope =
            VALUES(
              potential_scope
            ),

          timeline =
            VALUES(
              timeline
            ),

          budget =
            VALUES(
              budget
            ),

          decision_maker =
            VALUES(
              decision_maker
            ),

          approval_process =
            VALUES(
              approval_process
            ),

          expected_deliverables =
            VALUES(
              expected_deliverables
            ),

          client_expectations =
            VALUES(
              client_expectations
            ),

          competitors =
            VALUES(
              competitors
            ),

          category_insights =
            VALUES(
              category_insights
            ),

          mandatory_requirements =
            VALUES(
              mandatory_requirements
            ),

          status =
            VALUES(status),

          route_type =
            VALUES(
              route_type
            ),

          route_decision_note =
            VALUES(
              route_decision_note
            ),

          route_decided_by =
            VALUES(
              route_decided_by
            ),

          route_decided_at =
            VALUES(
              route_decided_at
            ),

          approved_by =
            VALUES(
              approved_by
            ),

          approved_at =
            VALUES(
              approved_at
            ),

          updated_by =
            VALUES(
              updated_by
            )
      `,
      [
        leadId,

        data.businessObjective,
        data.clientProblem,
        data.targetAudience,
        data.campaignRequirement,
        data.currentActivity,
        data.potentialScope,
        data.timeline,
        data.budget,
        data.decisionMaker,
        data.approvalProcess,
        data.expectedDeliverables,
        data.clientExpectations,
        data.competitors,
        data.categoryInsights,
        data.mandatoryRequirements,

        data.status,

        data.routeType,
        data.routeDecisionNote,

        data.routeDecidedBy,
        data.routeDecidedAt,

        data.approvedBy,
        data.approvedAt,

        userId,
        userId,
      ]
    );
  };

/*
|--------------------------------------------------------------------------
| Update Lead Route
|--------------------------------------------------------------------------
*/

export const updateLeadKnownRelationship =
  async (
    {
      leadId,
      knownRelationship,
      userId,
    },
    connection = pool
  ) => {
    const [
      result,
    ] =
      await connection.query(
        `
          UPDATE leads

          SET
            known_relationship = ?,
            updated_by = ?

          WHERE
            id = ?

            AND deleted_at
              IS NULL
        `,
        [
          knownRelationship
            ? 1
            : 0,

          userId,

          leadId,
        ]
      );

    return (
      result.affectedRows >
      0
    );
  };