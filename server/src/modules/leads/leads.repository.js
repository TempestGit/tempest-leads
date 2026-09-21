import { randomUUID } from "node:crypto";

import db from "../../database/knex.js";

/*
|--------------------------------------------------------------------------
| Repository Error
|--------------------------------------------------------------------------
*/

function repositoryError(code, message) {
  const error = new Error(message);
  error.code = code;

  return error;
}

/*
|--------------------------------------------------------------------------
| Positive Integer
|--------------------------------------------------------------------------
*/

function toPositiveInteger(value, fallback = null) {
  const parsed = Number.parseInt(value, 10);

  if (
    !Number.isInteger(parsed) ||
    parsed <= 0
  ) {
    return fallback;
  }

  return parsed;
}

/*
|--------------------------------------------------------------------------
| Pagination
|--------------------------------------------------------------------------
*/

function normalizePagination(query = {}) {
  const page =
    toPositiveInteger(
      query.page,
      1,
    );

  const requestedLimit =
    toPositiveInteger(
      query.limit,
      10,
    );

  const limit =
    Math.min(
      requestedLimit,
      100,
    );

  return {
    page,
    limit,
    offset:
      (page - 1) * limit,
  };
}

/*
|--------------------------------------------------------------------------
| Escape LIKE Search
|--------------------------------------------------------------------------
|
| Prevent %, _ and \ from becoming uncontrolled wildcard characters.
|
*/

function escapeLike(value) {
  return String(value)
    .replace(/\\/g, "\\\\")
    .replace(/%/g, "\\%")
    .replace(/_/g, "\\_");
}

/*
|--------------------------------------------------------------------------
| Repository Scope
|--------------------------------------------------------------------------
|
| SUPER_ADMIN:
|   can see every lead.
|
| OWNER:
|   can see only leads assigned to themselves.
|
*/

function scopedLeadQuery(
  user,
  executor = db,
) {
  const query = executor({
    l: "leads",
  })
    .leftJoin(
      { c: "companies" },
      "c.id",
      "l.company_id",
    )
    .leftJoin(
      { ct: "contacts" },
      "ct.id",
      "l.primary_contact_id",
    )
    .leftJoin(
      { owner: "users" },
      "owner.id",
      "l.owner_id",
    );

  if (
    user.role !==
    "SUPER_ADMIN"
  ) {
    query.where(
      "l.owner_id",
      Number(user.id),
    );
  }

  return query;
}

/*
|--------------------------------------------------------------------------
| Serialize Lead
|--------------------------------------------------------------------------
|
| MySQL BIGINT values may be returned as strings depending on the driver.
| We intentionally expose IDs consistently as strings.
|
| DECIMAL opportunity_value is also kept as a string so JavaScript does
| not introduce floating-point money errors.
|
*/

function serializeLead(row) {
  if (!row) {
    return null;
  }

  return {
    ...row,

    id:
      row.id !== null &&
      row.id !== undefined
        ? String(row.id)
        : null,

    company_id:
      row.company_id !== null &&
      row.company_id !== undefined
        ? String(
            row.company_id,
          )
        : null,

    primary_contact_id:
      row.primary_contact_id !==
        null &&
      row.primary_contact_id !==
        undefined
        ? String(
            row.primary_contact_id,
          )
        : null,

    owner_id:
      row.owner_id !== null &&
      row.owner_id !== undefined
        ? String(
            row.owner_id,
          )
        : null,

    created_by:
      row.created_by !== null &&
      row.created_by !== undefined
        ? String(
            row.created_by,
          )
        : null,

    route_decided_by:
      row.route_decided_by !==
        null &&
      row.route_decided_by !==
        undefined
        ? String(
            row.route_decided_by,
          )
        : null,

    closed_by:
      row.closed_by !== null &&
      row.closed_by !== undefined
        ? String(
            row.closed_by,
          )
        : null,

    opportunity_value:
      row.opportunity_value !==
        null &&
      row.opportunity_value !==
        undefined
        ? String(
            row.opportunity_value,
          )
        : null,

    version:
      row.version !== null &&
      row.version !== undefined
        ? Number(row.version)
        : null,
  };
}

/*
|--------------------------------------------------------------------------
| Future UTC Date/Time
|--------------------------------------------------------------------------
|
| Convert a valid ISO-compatible timestamp into UTC MySQL DATETIME(3).
|
*/

function toFutureUtcDateTime(
  value,
) {
  const date = new Date(value);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    throw repositoryError(
      "LEAD_INVALID_FOLLOW_UP",
      "Next follow-up date is invalid.",
    );
  }

  if (
    date.getTime() <=
    Date.now()
  ) {
    throw repositoryError(
      "LEAD_INVALID_FOLLOW_UP",
      "Next follow-up must be in the future.",
    );
  }

  return date
    .toISOString()
    .slice(0, 23)
    .replace("T", " ");
}

/*
|--------------------------------------------------------------------------
| Apply Lead Filters
|--------------------------------------------------------------------------
*/

function applyLeadFilters(
  query,
  filters = {},
) {
  if (filters.company_id) {
    query.andWhere(
      "l.company_id",
      Number(
        filters.company_id,
      ),
    );
  }

  if (filters.owner_id) {
    query.andWhere(
      "l.owner_id",
      Number(
        filters.owner_id,
      ),
    );
  }

  if (filters.priority) {
    query.andWhere(
      "l.priority",
      filters.priority,
    );
  }

  if (filters.status) {
    query.andWhere(
      "l.status",
      filters.status,
    );
  }

  if (filters.stage) {
    query.andWhere(
      "l.stage",
      filters.stage,
    );
  }

  const search =
    String(
      filters.search ?? "",
    ).trim();

  if (search) {
    const pattern =
      `%${escapeLike(
        search,
      )}%`;

    query.andWhere(
      (builder) => {
        builder
          .where(
            "l.lead_code",
            "like",
            pattern,
          )
          .orWhere(
            "c.name",
            "like",
            pattern,
          )
          .orWhere(
            "c.website",
            "like",
            pattern,
          )
          .orWhere(
            "ct.name",
            "like",
            pattern,
          )
          .orWhere(
            "ct.phone",
            "like",
            pattern,
          )
          .orWhere(
            "ct.whatsapp",
            "like",
            pattern,
          )
          .orWhere(
            "ct.email",
            "like",
            pattern,
          );
      },
    );
  }

  return query;
}

/*
|--------------------------------------------------------------------------
| List Leads
|--------------------------------------------------------------------------
*/

export async function listLeads(
  user,
  query = {},
) {
  const {
    page,
    limit,
    offset,
  } =
    normalizePagination(
      query,
    );

  /*
  |--------------------------------------------------------------------------
  | Base Scoped Query
  |--------------------------------------------------------------------------
  */

  const baseQuery =
    applyLeadFilters(
      scopedLeadQuery(
        user,
        db,
      ),
      query,
    );

  /*
  |--------------------------------------------------------------------------
  | Count
  |--------------------------------------------------------------------------
  */

  const countRow =
    await baseQuery
      .clone()
      .clearSelect()
      .clearOrder()
      .count({
        total: "l.id",
      })
      .first();

  const total =
    Number(
      countRow?.total ?? 0,
    );

  /*
  |--------------------------------------------------------------------------
  | Results
  |--------------------------------------------------------------------------
  */

  const rows =
    await baseQuery
      .clone()
      .select([
        "l.id",
        "l.lead_code",

        "l.company_id",
        "c.name as company_name",
        "c.industry",
        "c.city",

        "l.primary_contact_id",
        "ct.name as contact_name",
        "ct.phone as contact_phone",
        "ct.email as contact_email",

        "l.owner_id",
        "owner.name as owner_name",

        "l.lead_source",
        "l.service_interest",

        "l.priority",

        "l.stage",
        "l.status",
        "l.workflow_route",

        "l.opportunity_value",
        "l.currency",

        "l.next_action",
        "l.next_follow_up_at",

        "l.last_touch_at",
        "l.stage_entered_at",

        "l.version",

        "l.created_at",
        "l.updated_at",
      ])
      .orderBy(
        "l.id",
        "desc",
      )
      .limit(limit)
      .offset(offset);

  const totalPages =
    Math.max(
      1,
      Math.ceil(
        total / limit,
      ),
    );

  return {
    data:
      rows.map(
        serializeLead,
      ),

    pagination: {
      page,
      limit,
      total,
      totalPages,
    },
  };
}

/*
|--------------------------------------------------------------------------
| Find Lead
|--------------------------------------------------------------------------
*/

export async function findLead(
  user,
  leadId,
  executor = db,
) {
  const id =
    toPositiveInteger(
      leadId,
    );

  if (!id) {
    return null;
  }

  const query =
    scopedLeadQuery(
      user,
      executor,
    );

  query.leftJoin(
    {
      creator: "users",
    },
    "creator.id",
    "l.created_by",
  );

  const row =
    await query
      .select([
        "l.*",

        /*
         * Company
         */
        "c.name as company_name",
        "c.company_code",
        "c.industry",
        "c.city",
        "c.website",

        /*
         * Primary Contact
         */
        "ct.name as contact_name",
        "ct.designation as contact_designation",
        "ct.phone as contact_phone",
        "ct.whatsapp as contact_whatsapp",
        "ct.email as contact_email",
        "ct.linkedin as contact_linkedin",
        "ct.communication_status as contact_communication_status",

        /*
         * Owner
         */
        "owner.name as owner_name",

        /*
         * Creator
         */
        "creator.name as created_by_name",
      ])
      .where(
        "l.id",
        id,
      )
      .first();

  return serializeLead(
    row,
  );
}

/*
|--------------------------------------------------------------------------
| Assignable Lead Owners
|--------------------------------------------------------------------------
|
| SUPER_ADMIN:
|   can assign to any active SUPER_ADMIN or OWNER.
|
| OWNER:
|   can only assign leads to themselves.
|
*/

export async function listAssignableOwners(
  user,
) {
  const query =
    db("users")
      .select([
        "id",
        "name",
        "role",
      ])
      .where(
        "status",
        "ACTIVE",
      )
      .whereIn(
        "role",
        [
          "SUPER_ADMIN",
          "OWNER",
        ],
      );

  if (
    user.role !==
    "SUPER_ADMIN"
  ) {
    query.andWhere(
      "id",
      Number(user.id),
    );
  }

  const rows =
    await query
      .orderBy(
        "name",
        "asc",
      )
      .orderBy(
        "id",
        "asc",
      );

  return {
    data:
      rows.map(
        (row) => ({
          id: String(
            row.id,
          ),

          name:
            row.name,

          role:
            row.role,
        }),
      ),
  };
}

/*
|--------------------------------------------------------------------------
| Duplicate Entry Error
|--------------------------------------------------------------------------
*/

function isDuplicateEntryError(
  error,
) {
  return (
    error?.code ===
      "ER_DUP_ENTRY" ||
    Number(
      error?.errno,
    ) === 1062
  );
}

/*
|--------------------------------------------------------------------------
| Claim Lead Creation Request
|--------------------------------------------------------------------------
|
| Each frontend Create Lead submission receives one UUID.
|
| First request:
|
| actor_id + request_key does not exist
|     ↓
| create reservation
|
| Retry:
|
| actor_id + request_key already exists
|     ↓
| compare payload_hash
|
| Same hash:
|     return previously created lead
|
| Different hash:
|     conflict
|
| IMPORTANT:
| This function runs inside the SAME transaction used to create the lead.
|
*/

async function claimLeadCreationRequest(
  trx,
  {
    actorId,
    requestKey,
    payloadHash,
  },
) {
  try {
    await trx(
      "lead_creation_requests",
    ).insert({
      actor_id:
        actorId,

      request_key:
        requestKey,

      payload_hash:
        payloadHash,

      lead_id:
        null,
    });

    return {
      replayed: false,
      leadId: null,
    };
  } catch (error) {
    if (
      !isDuplicateEntryError(
        error,
      )
    ) {
      throw error;
    }

    /*
     * The unique constraint is:
     *
     * actor_id + request_key
     *
     * If another request is currently creating the same lead,
     * InnoDB waits for that transaction to finish before resolving
     * the duplicate-key insert.
     *
     * FOR UPDATE then locks the existing request row while this
     * transaction decides what to do.
     */

    const existingRequest =
      await trx(
        "lead_creation_requests",
      )
        .where({
          actor_id:
            actorId,

          request_key:
            requestKey,
        })
        .forUpdate()
        .first();

    if (!existingRequest) {
      throw error;
    }

    /*
    |--------------------------------------------------------------------------
    | Same Key + Different Payload
    |--------------------------------------------------------------------------
    */

    if (
      existingRequest
        .payload_hash !==
      payloadHash
    ) {
      throw repositoryError(
        "LEAD_IDEMPOTENCY_CONFLICT",
        "This Idempotency-Key has already been used with different lead data.",
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Existing Request Must Point To A Lead
    |--------------------------------------------------------------------------
    |
    | Since the request reservation and lead creation commit together,
    | a committed request should always contain lead_id.
    |
    */

    if (
      !existingRequest
        .lead_id
    ) {
      throw repositoryError(
        "LEAD_IDEMPOTENCY_INCOMPLETE",
        "This lead creation request has not completed.",
      );
    }

    return {
      replayed: true,

      leadId:
        Number(
          existingRequest
            .lead_id,
        ),
    };
  }
}

/*
|--------------------------------------------------------------------------
| Complete Lead Creation Request
|--------------------------------------------------------------------------
*/

async function completeLeadCreationRequest(
  trx,
  {
    actorId,
    requestKey,
    leadId,
  },
) {
  const updated =
    await trx(
      "lead_creation_requests",
    )
      .where({
        actor_id:
          actorId,

        request_key:
          requestKey,
      })
      .update({
        lead_id:
          leadId,
      });

  if (
    updated !== 1
  ) {
    throw repositoryError(
      "LEAD_IDEMPOTENCY_UPDATE_FAILED",
      "Could not finalize lead creation request.",
    );
  }
}

/*
|--------------------------------------------------------------------------
| Insert Lead
|--------------------------------------------------------------------------
|
| Entire operation:
|
| 1. validate actor
| 2. reserve idempotency key
| 3. validate owner
| 4. validate company
| 5. validate contact
| 6. create lead
| 7. create initial stage history
| 8. create first follow-up
| 9. connect request key to lead
| 10. commit
|
| If ANY step fails, everything rolls back.
|
*/

export async function insertLead(
  user,
  values,
  {
    requestKey,
    payloadHash,
  },
) {
  return db.transaction(
    async (trx) => {
      const actorId =
        Number(user.id);

      /*
      |--------------------------------------------------------------------------
      | Lock + Validate Actor
      |--------------------------------------------------------------------------
      */

      const actor =
        await trx(
          "users",
        )
          .select([
            "id",
            "role",
            "status",
          ])
          .where({
            id:
              actorId,
          })
          .forUpdate()
          .first();

      if (!actor) {
        throw repositoryError(
          "LEAD_ACTOR_NOT_FOUND",
          "Authenticated user was not found.",
        );
      }

      if (
        actor.status !==
        "ACTIVE"
      ) {
        throw repositoryError(
          "LEAD_ACTOR_INACTIVE",
          "Inactive users cannot create leads.",
        );
      }

      if (
        actor.role !==
          "SUPER_ADMIN" &&
        actor.role !==
          "OWNER"
      ) {
        throw repositoryError(
          "LEAD_ACTOR_FORBIDDEN",
          "You do not have permission to create leads.",
        );
      }

      /*
      |--------------------------------------------------------------------------
      | Claim Idempotency Request
      |--------------------------------------------------------------------------
      |
      | This happens before the lead is created.
      |
      | Because it is inside the same transaction, if anything later fails:
      |
      | - lead_creation_requests rolls back
      | - lead rolls back
      | - stage history rolls back
      | - follow-up rolls back
      |
      */

      const creationRequest =
        await claimLeadCreationRequest(
          trx,
          {
            actorId,
            requestKey,
            payloadHash,
          },
        );

      /*
      |--------------------------------------------------------------------------
      | Retry Of Previously Successful Request
      |--------------------------------------------------------------------------
      */

      if (
        creationRequest.replayed
      ) {
        const existingLead =
          await findLead(
            {
              id:
                actorId,

              role:
                actor.role,
            },
            creationRequest
              .leadId,
            trx,
          );

        if (!existingLead) {
          throw repositoryError(
            "LEAD_IDEMPOTENCY_LEAD_NOT_FOUND",
            "The previously created lead could not be found.",
          );
        }

        return existingLead;
      }

      /*
      |--------------------------------------------------------------------------
      | Determine Owner
      |--------------------------------------------------------------------------
      */

      const ownerId =
        values.owner_id !==
          undefined &&
        values.owner_id !==
          null
          ? Number(
              values.owner_id,
            )
          : actorId;

      /*
       * Normal OWNER users cannot assign a lead directly
       * to another user.
       */

      if (
        actor.role !==
          "SUPER_ADMIN" &&
        ownerId !==
          actorId
      ) {
        throw repositoryError(
          "LEAD_OWNER_FORBIDDEN",
          "You cannot assign this lead to another owner.",
        );
      }

      /*
      |--------------------------------------------------------------------------
      | Validate Owner
      |--------------------------------------------------------------------------
      */

      const owner =
        await trx(
          "users",
        )
          .select([
            "id",
            "role",
            "status",
          ])
          .where({
            id:
              ownerId,
          })
          .forUpdate()
          .first();

      if (!owner) {
        throw repositoryError(
          "LEAD_OWNER_NOT_FOUND",
          "Selected owner was not found.",
        );
      }

      if (
        owner.status !==
        "ACTIVE"
      ) {
        throw repositoryError(
          "LEAD_OWNER_INACTIVE",
          "Selected owner is not active.",
        );
      }

      if (
        owner.role !==
          "SUPER_ADMIN" &&
        owner.role !==
          "OWNER"
      ) {
        throw repositoryError(
          "LEAD_OWNER_INVALID_ROLE",
          "Selected user cannot own leads.",
        );
      }

      /*
      |--------------------------------------------------------------------------
      | Validate Company
      |--------------------------------------------------------------------------
      */

      const companyQuery =
        trx(
          "companies",
        )
          .select([
            "id",
            "owner_id",
          ])
          .where({
            id:
              Number(
                values.company_id,
              ),
          });

      /*
       * Normal OWNER users can only create opportunities
       * against companies available to them.
       */

      if (
        actor.role !==
        "SUPER_ADMIN"
      ) {
        companyQuery.andWhere(
          "owner_id",
          actorId,
        );
      }

      const company =
        await companyQuery
          .forUpdate()
          .first();

      if (!company) {
        throw repositoryError(
          "LEAD_COMPANY_NOT_FOUND",
          "Company was not found or is not accessible.",
        );
      }

      /*
      |--------------------------------------------------------------------------
      | Validate Primary Contact
      |--------------------------------------------------------------------------
      |
      | Contact must belong to the selected company.
      |
      */

      const contact =
        await trx(
          "contacts",
        )
          .select([
            "id",
            "company_id",
          ])
          .where({
            id:
              Number(
                values
                  .primary_contact_id,
              ),

            company_id:
              company.id,
          })
          .forUpdate()
          .first();

      if (!contact) {
        throw repositoryError(
          "LEAD_CONTACT_NOT_FOUND",
          "Primary contact was not found for the selected company.",
        );
      }

      /*
      |--------------------------------------------------------------------------
      | Follow-up Time
      |--------------------------------------------------------------------------
      */

      const nextFollowUpAt =
        toFutureUtcDateTime(
          values
            .next_follow_up_at,
        );

      /*
      |--------------------------------------------------------------------------
      | Generate Stable Lead Code
      |--------------------------------------------------------------------------
      */

      const leadCode =
        `LEAD-${randomUUID()}`;

      /*
      |--------------------------------------------------------------------------
      | Create Lead
      |--------------------------------------------------------------------------
      */

      await trx(
        "leads",
      ).insert({
        lead_code:
          leadCode,

        company_id:
          company.id,

        primary_contact_id:
          contact.id,

        owner_id:
          owner.id,

        created_by:
          actorId,

        potential_requirement:
          values
            .potential_requirement,

        opportunity_description:
          values
            .opportunity_description ??
          null,

        service_interest:
          values
            .service_interest ??
          null,

        lead_source:
          values
            .lead_source ??
          null,

        priority:
          values.priority ??
          "MEDIUM",

        opportunity_value:
          values
            .opportunity_value ??
          null,

        currency:
          values.currency ??
          "INR",

        /*
         * Workflow fields are controlled by backend.
         *
         * Never trust frontend values for these.
         */
        stage:
          "NEW",

        status:
          "OPEN",

        workflow_route:
          "UNDECIDED",

        version:
          1,

        next_action:
          values.next_action,

        next_follow_up_at:
          nextFollowUpAt,

        created_at:
          trx.raw(
            "CURRENT_TIMESTAMP(3)",
          ),

        updated_at:
          trx.raw(
            "CURRENT_TIMESTAMP(3)",
          ),
      });

      /*
      |--------------------------------------------------------------------------
      | Retrieve Inserted Lead
      |--------------------------------------------------------------------------
      |
      | lead_code is unique.
      |
      | Reading by lead_code avoids depending on driver-specific insert
      | return-value behaviour.
      |
      */

      const inserted =
        await trx(
          "leads",
        )
          .select(
            "id",
          )
          .where({
            lead_code:
              leadCode,
          })
          .first();

      if (!inserted) {
        throw repositoryError(
          "LEAD_INSERT_FAILED",
          "Lead could not be created.",
        );
      }

      const leadId =
        Number(
          inserted.id,
        );

      /*
      |--------------------------------------------------------------------------
      | Initial Stage History
      |--------------------------------------------------------------------------
      */

      await trx(
        "lead_stage_history",
      ).insert({
        lead_id:
          leadId,

        previous_stage:
          null,

        new_stage:
          "NEW",

        actor_id:
          actorId,

        reason:
          "Lead created.",

        created_at:
          trx.raw(
            "CURRENT_TIMESTAMP(3)",
          ),
      });

      /*
      |--------------------------------------------------------------------------
      | Initial Follow-up
      |--------------------------------------------------------------------------
      */

      await trx(
        "follow_ups",
      ).insert({
        lead_id:
          leadId,

        contact_id:
          contact.id,

        owner_id:
          owner.id,

        created_by:
          actorId,

        action:
          values.next_action,

        due_at:
          nextFollowUpAt,

        status:
          "PENDING",

        version:
          1,

        created_at:
          trx.raw(
            "CURRENT_TIMESTAMP(3)",
          ),

        updated_at:
          trx.raw(
            "CURRENT_TIMESTAMP(3)",
          ),
      });

      /*
      |--------------------------------------------------------------------------
      | Complete Idempotency Request
      |--------------------------------------------------------------------------
      |
      | The request record receives lead_id BEFORE commit.
      |
      | Therefore:
      |
      | lead_creation_requests
      | leads
      | lead_stage_history
      | follow_ups
      |
      | either all commit together or all roll back together.
      |
      */

      await completeLeadCreationRequest(
        trx,
        {
          actorId,

          requestKey,

          leadId,
        },
      );

      /*
      |--------------------------------------------------------------------------
      | Return Created Lead
      |--------------------------------------------------------------------------
      */

      const createdLead =
        await findLead(
          {
            id:
              actorId,

            role:
              actor.role,
          },
          leadId,
          trx,
        );

      if (!createdLead) {
        throw repositoryError(
          "LEAD_CREATED_BUT_NOT_FOUND",
          "Lead was created but could not be loaded.",
        );
      }

      return createdLead;
    },
  );
}