export async function up(knex) {
  await knex.schema.createTable(
    "activities",
    (table) => {
      /*
      |--------------------------------------------------------------------------
      | Primary Key
      |--------------------------------------------------------------------------
      */

      table.bigIncrements("id");

      /*
      |--------------------------------------------------------------------------
      | Lead
      |--------------------------------------------------------------------------
      */

      table
        .bigInteger("lead_id")
        .unsigned()
        .notNullable()
        .references("id")
        .inTable("leads")
        .onUpdate("CASCADE")
        .onDelete("CASCADE");

      /*
      |--------------------------------------------------------------------------
      | Contact
      |--------------------------------------------------------------------------
      |
      | Optional because an activity may relate to the lead generally rather
      | than one specific contact.
      |
      */

      table
        .bigInteger("contact_id")
        .unsigned()
        .nullable()
        .references("id")
        .inTable("contacts")
        .onUpdate("CASCADE")
        .onDelete("SET NULL");

      /*
      |--------------------------------------------------------------------------
      | Activity Type
      |--------------------------------------------------------------------------
      |
      | Examples:
      |
      | CALL
      | EMAIL
      | WHATSAPP
      | MEETING
      | NOTE
      | LINKEDIN
      | OTHER
      |
      */

      table
        .string(
          "activity_type",
          30,
        )
        .notNullable();

      /*
      |--------------------------------------------------------------------------
      | Direction
      |--------------------------------------------------------------------------
      |
      | INBOUND
      | OUTBOUND
      |
      | NULL for internal notes.
      |
      */

      table
        .string(
          "direction",
          20,
        )
        .nullable();

      /*
      |--------------------------------------------------------------------------
      | Subject
      |--------------------------------------------------------------------------
      */

      table
        .string(
          "subject",
          190,
        )
        .nullable();

      /*
      |--------------------------------------------------------------------------
      | Activity Notes
      |--------------------------------------------------------------------------
      */

      table
        .text("notes")
        .nullable();

      /*
      |--------------------------------------------------------------------------
      | Outcome
      |--------------------------------------------------------------------------
      |
      | Example:
      |
      | CONNECTED
      | NO_RESPONSE
      | INTERESTED
      | FOLLOW_UP_REQUIRED
      | NOT_INTERESTED
      |
      */

      table
        .string(
          "outcome",
          50,
        )
        .nullable();

      /*
      |--------------------------------------------------------------------------
      | Activity Time
      |--------------------------------------------------------------------------
      */

      table
        .dateTime(
          "occurred_at",
          {
            precision: 3,
          },
        )
        .notNullable();

      /*
      |--------------------------------------------------------------------------
      | Created By
      |--------------------------------------------------------------------------
      */

      table
        .bigInteger(
          "created_by_user_id",
        )
        .unsigned()
        .notNullable()
        .references("id")
        .inTable("users")
        .onUpdate("CASCADE")
        .onDelete("RESTRICT");

      /*
      |--------------------------------------------------------------------------
      | Timestamps
      |--------------------------------------------------------------------------
      */

      table
        .dateTime(
          "created_at",
          {
            precision: 3,
          },
        )
        .notNullable()
        .defaultTo(
          knex.raw(
            "CURRENT_TIMESTAMP(3)",
          ),
        );

      table
        .dateTime(
          "updated_at",
          {
            precision: 3,
          },
        )
        .notNullable()
        .defaultTo(
          knex.raw(
            "CURRENT_TIMESTAMP(3)",
          ),
        );

      /*
      |--------------------------------------------------------------------------
      | Indexes
      |--------------------------------------------------------------------------
      */

      table.index(
        [
          "lead_id",
          "occurred_at",
        ],
        "activities_lead_occurred_index",
      );

      table.index(
        [
          "contact_id",
        ],
        "activities_contact_index",
      );

      table.index(
        [
          "created_by_user_id",
        ],
        "activities_created_by_index",
      );

      table.index(
        [
          "activity_type",
        ],
        "activities_type_index",
      );

      table.index(
        [
          "occurred_at",
        ],
        "activities_occurred_index",
      );
    },
  );
}

export async function down(knex) {
  await knex.schema.dropTableIfExists(
    "activities",
  );
}