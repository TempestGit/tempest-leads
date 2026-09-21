import test from "node:test";
import assert from "node:assert/strict";
import {
  randomUUID,
} from "node:crypto";

import db from "../../src/database/knex.js";

import {
  createLead,
} from "../../src/modules/leads/leads.service.js";

/*
|--------------------------------------------------------------------------
| Find Test Actor
|--------------------------------------------------------------------------
|
| Prefer SUPER_ADMIN because they can access any company.
|
*/

async function getTestActor() {
  let actor =
    await db("users")
      .select([
        "id",
        "name",
        "role",
        "status",
      ])
      .where({
        status:
          "ACTIVE",

        role:
          "SUPER_ADMIN",
      })
      .first();

  if (actor) {
    return actor;
  }

  actor =
    await db("users")
      .select([
        "id",
        "name",
        "role",
        "status",
      ])
      .where({
        status:
          "ACTIVE",

        role:
          "OWNER",
      })
      .first();

  if (!actor) {
    throw new Error(
      "Integration test requires at least one ACTIVE SUPER_ADMIN or OWNER user.",
    );
  }

  return actor;
}

/*
|--------------------------------------------------------------------------
| Find Company
|--------------------------------------------------------------------------
*/

async function getTestCompany(
  actor,
) {
  const query =
    db("companies")
      .select([
        "id",
        "name",
        "owner_id",
      ]);

  /*
   * Normal OWNER users may only create leads
   * for companies accessible to them.
   */
  if (
    actor.role !==
    "SUPER_ADMIN"
  ) {
    query.where(
      "owner_id",
      Number(
        actor.id,
      ),
    );
  }

  const company =
    await query
      .orderBy(
        "id",
        "asc",
      )
      .first();

  if (!company) {
    throw new Error(
      `No accessible company found for test user ${actor.id}.`,
    );
  }

  return company;
}

/*
|--------------------------------------------------------------------------
| Find Contact
|--------------------------------------------------------------------------
*/

async function getTestContact(
  companyId,
) {
  const contact =
    await db("contacts")
      .select([
        "id",
        "name",
        "company_id",
      ])
      .where({
        company_id:
          Number(
            companyId,
          ),
      })
      .orderBy(
        "id",
        "asc",
      )
      .first();

  if (!contact) {
    throw new Error(
      `Company ${companyId} needs at least one contact before running the lead integration test.`,
    );
  }

  return contact;
}

/*
|--------------------------------------------------------------------------
| Build Lead Payload
|--------------------------------------------------------------------------
*/

function createPayload({
  companyId,
  contactId,
}) {
  const futureDate =
    new Date(
      Date.now() +
        48 *
          60 *
          60 *
          1000,
    );

  return {
    company_id:
      Number(
        companyId,
      ),

    primary_contact_id:
      Number(
        contactId,
      ),

    potential_requirement:
      `Integration test ${randomUUID()}`,

    opportunity_description:
      "Temporary lead created by automated integration testing.",

    service_interest:
      "Digital Marketing",

    lead_source:
      "INTEGRATION_TEST",

    priority:
      "MEDIUM",

    opportunity_value:
      "100000",

    currency:
      "INR",

    next_action:
      "Automated integration test follow-up",

    next_follow_up_at:
      futureDate.toISOString(),
  };
}

/*
|--------------------------------------------------------------------------
| Cleanup Lead
|--------------------------------------------------------------------------
*/

async function cleanupLead({
  leadId,
  actorId,
  requestKey,
}) {
  if (!leadId) {
    return;
  }

  await db.transaction(
    async (
      trx,
    ) => {
      /*
       * Remove child records first.
       */

      await trx(
        "follow_ups",
      )
        .where({
          lead_id:
            Number(
              leadId,
            ),
        })
        .del();

      await trx(
        "lead_stage_history",
      )
        .where({
          lead_id:
            Number(
              leadId,
            ),
        })
        .del();

      /*
       * lead_creation_requests references leads
       * using ON DELETE RESTRICT, so remove it
       * before deleting the lead.
       */

      await trx(
        "lead_creation_requests",
      )
        .where({
          actor_id:
            Number(
              actorId,
            ),

          request_key:
            requestKey,
        })
        .del();

      await trx(
        "leads",
      )
        .where({
          id:
            Number(
              leadId,
            ),
        })
        .del();
    },
  );
}

/*
|--------------------------------------------------------------------------
| Test
|--------------------------------------------------------------------------
*/

test(
  "lead creation idempotency",
  async () => {
    /*
    |--------------------------------------------------------------------------
    | Fixtures
    |--------------------------------------------------------------------------
    */

    const actor =
      await getTestActor();

    const company =
      await getTestCompany(
        actor,
      );

    const contact =
      await getTestContact(
        company.id,
      );

    const user = {
      id:
        Number(
          actor.id,
        ),

      role:
        actor.role,
    };

    const payload =
      createPayload({
        companyId:
          company.id,

        contactId:
          contact.id,
      });

    const requestKey =
      randomUUID();

    let createdLeadId =
      null;

    try {
      /*
      |--------------------------------------------------------------------------
      | 1. First Request
      |--------------------------------------------------------------------------
      */

      const firstResult =
        await createLead(
          user,
          payload,
          {
            requestKey,
          },
        );

      assert.ok(
        firstResult,
        "First request should return a lead.",
      );

      assert.ok(
        firstResult.id,
        "Created lead should have an ID.",
      );

      createdLeadId =
        Number(
          firstResult.id,
        );

      console.log(
        "✓ First lead created:",
        createdLeadId,
      );

      /*
      |--------------------------------------------------------------------------
      | Verify Lead Row
      |--------------------------------------------------------------------------
      */

      const leadRows =
        await db(
          "leads",
        )
          .where({
            id:
              createdLeadId,
          })
          .count({
            total:
              "id",
          })
          .first();

      assert.equal(
        Number(
          leadRows.total,
        ),
        1,
        "Exactly one lead should exist.",
      );

      /*
      |--------------------------------------------------------------------------
      | Verify Request Reservation
      |--------------------------------------------------------------------------
      */

      const requestRows =
        await db(
          "lead_creation_requests",
        )
          .where({
            actor_id:
              Number(
                actor.id,
              ),

            request_key:
              requestKey,
          })
          .select([
            "id",
            "lead_id",
            "payload_hash",
          ]);

      assert.equal(
        requestRows.length,
        1,
        "Exactly one idempotency request should exist.",
      );

      assert.equal(
        Number(
          requestRows[0]
            .lead_id,
        ),
        createdLeadId,
        "Idempotency request should reference the created lead.",
      );

      assert.equal(
        String(
          requestRows[0]
            .payload_hash,
        ).length,
        64,
        "Payload hash should be a SHA-256 hash.",
      );

      /*
      |--------------------------------------------------------------------------
      | Verify Stage History
      |--------------------------------------------------------------------------
      */

      const stageHistory =
        await db(
          "lead_stage_history",
        )
          .where({
            lead_id:
              createdLeadId,
          });

      assert.equal(
        stageHistory.length,
        1,
        "Lead creation should create exactly one initial stage history record.",
      );

      /*
      |--------------------------------------------------------------------------
      | Verify Follow-up
      |--------------------------------------------------------------------------
      */

      const followUps =
        await db(
          "follow_ups",
        )
          .where({
            lead_id:
              createdLeadId,
          });

      assert.equal(
        followUps.length,
        1,
        "Lead creation should create exactly one initial follow-up.",
      );

      /*
      |--------------------------------------------------------------------------
      | 2. Same Key + Same Payload
      |--------------------------------------------------------------------------
      |
      | This simulates:
      |
      | database saved successfully
      |          ↓
      | response lost
      |          ↓
      | frontend retries
      |
      */

      const retryResult =
        await createLead(
          user,
          payload,
          {
            requestKey,
          },
        );

      assert.ok(
        retryResult,
      );

      assert.equal(
        Number(
          retryResult.id,
        ),
        createdLeadId,
        "Retry should return the original lead.",
      );

      console.log(
        "✓ Same key + same payload returned existing lead.",
      );

      /*
      |--------------------------------------------------------------------------
      | Verify No Duplicate Lead
      |--------------------------------------------------------------------------
      */

      const afterRetryRequests =
        await db(
          "lead_creation_requests",
        )
          .where({
            actor_id:
              Number(
                actor.id,
              ),

            request_key:
              requestKey,
          });

      assert.equal(
        afterRetryRequests.length,
        1,
        "Retry must not create another idempotency request.",
      );

      /*
      |--------------------------------------------------------------------------
      | Verify No Duplicate History
      |--------------------------------------------------------------------------
      */

      const afterRetryHistory =
        await db(
          "lead_stage_history",
        )
          .where({
            lead_id:
              createdLeadId,
          });

      assert.equal(
        afterRetryHistory.length,
        1,
        "Retry must not create another stage-history record.",
      );

      /*
      |--------------------------------------------------------------------------
      | Verify No Duplicate Follow-up
      |--------------------------------------------------------------------------
      */

      const afterRetryFollowUps =
        await db(
          "follow_ups",
        )
          .where({
            lead_id:
              createdLeadId,
          });

      assert.equal(
        afterRetryFollowUps.length,
        1,
        "Retry must not create another follow-up.",
      );

      /*
      |--------------------------------------------------------------------------
      | 3. Same Key + Changed Payload
      |--------------------------------------------------------------------------
      */

      const changedPayload = {
        ...payload,

        next_action:
          "Different action using same request key",
      };

      await assert.rejects(
        async () => {
          await createLead(
            user,
            changedPayload,
            {
              requestKey,
            },
          );
        },

        (
          error,
        ) => {
          assert.equal(
            error.code,
            "LEAD_IDEMPOTENCY_CONFLICT",
          );

          return true;
        },
      );

      console.log(
        "✓ Same key + different payload correctly rejected.",
      );

      /*
      |--------------------------------------------------------------------------
      | 4. Missing Key
      |--------------------------------------------------------------------------
      */

      await assert.rejects(
        async () => {
          await createLead(
            user,
            payload,
          );
        },

        (
          error,
        ) => {
          assert.equal(
            error.code,
            "LEAD_IDEMPOTENCY_KEY_REQUIRED",
          );

          return true;
        },
      );

      console.log(
        "✓ Missing idempotency key correctly rejected.",
      );

      /*
      |--------------------------------------------------------------------------
      | 5. Invalid Key
      |--------------------------------------------------------------------------
      */

      await assert.rejects(
        async () => {
          await createLead(
            user,
            payload,
            {
              requestKey:
                "invalid-key",
            },
          );
        },

        (
          error,
        ) => {
          assert.equal(
            error.code,
            "LEAD_IDEMPOTENCY_KEY_INVALID",
          );

          return true;
        },
      );

      console.log(
        "✓ Invalid idempotency key correctly rejected.",
      );
    } finally {
      /*
      |--------------------------------------------------------------------------
      | Cleanup
      |--------------------------------------------------------------------------
      */

      if (
        createdLeadId
      ) {
        await cleanupLead({
          leadId:
            createdLeadId,

          actorId:
            actor.id,

          requestKey,
        });

        console.log(
          "✓ Integration test data cleaned up.",
        );
      }

      await db.destroy();
    }
  },
);