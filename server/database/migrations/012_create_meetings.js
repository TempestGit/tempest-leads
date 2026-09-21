function userReference(table, column, nullable = false) {
  const field = table.bigInteger(column).unsigned();

  if (nullable) {
    field.nullable();
  } else {
    field.notNullable();
  }

  field
    .references('id')
    .inTable('users')
    .onDelete('RESTRICT');
}

export async function up(knex) {
  await knex.schema.createTable('meetings', (table) => {
    table.bigIncrements('id');

    table.string('meeting_code', 50).notNullable().unique();

    table
      .bigInteger('lead_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('leads')
      .onDelete('RESTRICT');

    // Company is derived from the linked lead.
    table
      .bigInteger('contact_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('contacts')
      .onDelete('RESTRICT');

    table.string('title', 190).notNullable();

    table
      .enu('meeting_type', [
        'IN_PERSON',
        'VIDEO_CALL',
        'PHONE_CALL',
      ])
      .notNullable();

    // All stored datetime values are UTC.
    table
      .dateTime('starts_at', { precision: 3 })
      .notNullable();

    table
      .dateTime('ends_at', { precision: 3 })
      .notNullable();

    table.string('location', 500).nullable();
    table.string('meeting_url', 2000).nullable();
    table.text('agenda').nullable();

    userReference(table, 'owner_id');
    userReference(table, 'created_by');

    table
      .enu('status', [
        'SCHEDULED',
        'COMPLETED',
        'RESCHEDULED',
        'CANCELLED',
        'NO_SHOW',
      ])
      .notNullable()
      .defaultTo('SCHEDULED');

    /*
     * Actual meeting notes and outcome.
     * Required by the completion API, not at scheduling time.
     */
    table.text('notes').nullable();
    table.string('outcome', 190).nullable();

    table
      .dateTime('completed_at', { precision: 3 })
      .nullable();

    userReference(table, 'completed_by', true);

    /*
     * Retain who changed the status and why.
     * Detailed changes also belong in meeting_history.
     */
    table.text('status_reason').nullable();

    table
      .dateTime('status_changed_at', { precision: 3 })
      .nullable();

    userReference(table, 'status_changed_by', true);

    /*
     * Rescheduling preserves the original meeting.
     * Its replacement points back to it.
     */
    table
      .bigInteger('previous_meeting_id')
      .unsigned()
      .nullable()
      .unique()
      .references('id')
      .inTable('meetings')
      .onDelete('RESTRICT');

    /*
     * Link the interaction and next follow-up created
     * when the meeting is completed.
     */
    table
      .bigInteger('completion_activity_id')
      .unsigned()
      .nullable()
      .unique()
      .references('id')
      .inTable('activities')
      .onDelete('RESTRICT');

    table
      .bigInteger('next_follow_up_id')
      .unsigned()
      .nullable()
      .unique()
      .references('id')
      .inTable('follow_ups')
      .onDelete('RESTRICT');

    table
      .integer('version')
      .unsigned()
      .notNullable()
      .defaultTo(1);

    table
      .dateTime('created_at', { precision: 3 })
      .notNullable()
      .defaultTo(knex.raw('CURRENT_TIMESTAMP(3)'));

    table
      .dateTime('updated_at', { precision: 3 })
      .notNullable()
      .defaultTo(knex.raw('CURRENT_TIMESTAMP(3)'));

    table.index(
      ['lead_id', 'starts_at', 'id'],
      'meetings_lead_start_index',
    );

    table.index(
      ['owner_id', 'status', 'starts_at'],
      'meetings_owner_status_start_index',
    );

    table.index(
      ['status', 'starts_at'],
      'meetings_status_start_index',
    );
  });

  /*
   * Participants are separate records.
   * Each participant links to either a CRM user or a company contact.
   * The API must enforce exactly one of user_id/contact_id.
   */
  await knex.schema.createTable(
    'meeting_participants',
    (table) => {
      table.bigIncrements('id');

      table
        .bigInteger('meeting_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('meetings')
        .onDelete('RESTRICT');

      userReference(table, 'user_id', true);

      table
        .bigInteger('contact_id')
        .unsigned()
        .nullable()
        .references('id')
        .inTable('contacts')
        .onDelete('RESTRICT');

      // Preserve the displayed identity at scheduling time.
      table.string('name_snapshot', 190).notNullable();
      table.string('email_snapshot', 190).nullable();

      table
        .dateTime('created_at', { precision: 3 })
        .notNullable()
        .defaultTo(knex.raw('CURRENT_TIMESTAMP(3)'));

      table.unique(
        ['meeting_id', 'user_id'],
        'meeting_participants_user_unique',
      );

      table.unique(
        ['meeting_id', 'contact_id'],
        'meeting_participants_contact_unique',
      );
    },
  );

  await knex.schema.createTable('meeting_history', (table) => {
    table.bigIncrements('id');

    table
      .bigInteger('meeting_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('meetings')
      .onDelete('RESTRICT');

    userReference(table, 'actor_id');

    table
      .enu('action', [
        'CREATED',
        'UPDATED',
        'RESCHEDULED',
        'COMPLETED',
        'CANCELLED',
        'NO_SHOW',
      ])
      .notNullable();

    table.text('reason').notNullable();

    table.json('previous_values').nullable();
    table.json('new_values').notNullable();

    table
      .dateTime('created_at', { precision: 3 })
      .notNullable()
      .defaultTo(knex.raw('CURRENT_TIMESTAMP(3)'));

    table.index(
      ['meeting_id', 'id'],
      'meeting_history_meeting_index',
    );
  });
}

export async function down(knex) {
  await knex.schema.dropTableIfExists('meeting_history');
  await knex.schema.dropTableIfExists('meeting_participants');
  await knex.schema.dropTableIfExists('meetings');
}