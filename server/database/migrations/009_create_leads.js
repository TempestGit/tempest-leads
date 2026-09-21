function addTimestamps(knex, table) {
  table
    .dateTime('created_at', { precision: 3 })
    .notNullable()
    .defaultTo(knex.raw('CURRENT_TIMESTAMP(3)'));

  table
    .dateTime('updated_at', { precision: 3 })
    .notNullable()
    .defaultTo(knex.raw('CURRENT_TIMESTAMP(3)'));
}

export async function up(knex) {
  await knex.schema.createTable('leads', (table) => {
    table.bigIncrements('id');

    table.string('lead_code', 50).notNullable().unique();

    table
      .bigInteger('company_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('companies')
      .onDelete('RESTRICT');

    table
      .bigInteger('primary_contact_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('contacts')
      .onDelete('RESTRICT');

    table
      .bigInteger('owner_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('users')
      .onDelete('RESTRICT');

    table
      .bigInteger('created_by')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('users')
      .onDelete('RESTRICT');

    // Opportunity-specific information.
    table.text('potential_requirement').notNullable();
    table.text('opportunity_description').nullable();
    table.string('service_interest', 190).notNullable();
    table.string('lead_source', 100).notNullable();

    table
      .enu('priority', ['LOW', 'MEDIUM', 'HIGH'])
      .notNullable()
      .defaultTo('MEDIUM');

    /*
     * Stage summarizes progress.
     * Later workflow rules will validate transitions and milestones.
     */
    table.string('stage', 50).notNullable().defaultTo('NEW');

    table
      .enu('status', [
        'OPEN',
        'LOST',
        'NURTURE',
        'ACTIVE_CLIENT',
      ])
      .notNullable()
      .defaultTo('OPEN');

    /*
     * Route is chosen after the brief.
     * Do not infer it from company status at creation.
     */
    table
      .enu('workflow_route', [
        'UNDECIDED',
        'KNOWN',
        'NEW',
      ])
      .notNullable()
      .defaultTo('UNDECIDED');

    table
      .bigInteger('route_decided_by')
      .unsigned()
      .nullable()
      .references('id')
      .inTable('users')
      .onDelete('RESTRICT');

    table
      .dateTime('route_decided_at', { precision: 3 })
      .nullable();

    table.text('route_decision_note').nullable();

    // Store decimal amounts as strings in API responses.
    table.decimal('opportunity_value', 15, 2).nullable();
    table.string('currency', 3).notNullable().defaultTo('INR');

    table.string('next_action', 500).notNullable();

    // All DATETIME values are stored in UTC.
    table
      .dateTime('next_follow_up_at', { precision: 3 })
      .notNullable();

    table
      .dateTime('last_touch_at', { precision: 3 })
      .nullable();

    table
      .dateTime('stage_entered_at', { precision: 3 })
      .notNullable()
      .defaultTo(knex.raw('CURRENT_TIMESTAMP(3)'));

    // Reserved for the later lost/closure workflow.
    table.string('lost_reason', 100).nullable();
    table.text('lost_notes').nullable();
    table.string('stage_lost', 50).nullable();

    table
      .dateTime('closed_at', { precision: 3 })
      .nullable();

    table
      .bigInteger('closed_by')
      .unsigned()
      .nullable()
      .references('id')
      .inTable('users')
      .onDelete('RESTRICT');

    table
      .integer('version')
      .unsigned()
      .notNullable()
      .defaultTo(1);

    addTimestamps(knex, table);

    table.index(
      ['owner_id', 'status', 'next_follow_up_at'],
      'leads_owner_status_follow_up_index',
    );

    table.index(
      ['company_id', 'id'],
      'leads_company_id_index',
    );

    table.index(
      ['stage', 'status'],
      'leads_stage_status_index',
    );

    table.index(
      ['status', 'next_follow_up_at'],
      'leads_status_follow_up_index',
    );
  });

  await knex.schema.createTable('lead_stage_history', (table) => {
    table.bigIncrements('id');

    table
      .bigInteger('lead_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('leads')
      .onDelete('RESTRICT');

    // Null for the initial lead-creation event.
    table.string('previous_stage', 50).nullable();
    table.string('new_stage', 50).notNullable();

    table
      .bigInteger('actor_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('users')
      .onDelete('RESTRICT');

    table.text('reason').notNullable();

    table
      .dateTime('created_at', { precision: 3 })
      .notNullable()
      .defaultTo(knex.raw('CURRENT_TIMESTAMP(3)'));

    table.index(
      ['lead_id', 'id'],
      'lead_stage_history_lead_id_index',
    );
  });

  /*
   * Separate follow-up records preserve completed/rescheduled work.
   * The fields on leads represent the current next-action summary.
   */
  await knex.schema.createTable('follow_ups', (table) => {
    table.bigIncrements('id');

    table
      .bigInteger('lead_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('leads')
      .onDelete('RESTRICT');

    table
      .bigInteger('contact_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('contacts')
      .onDelete('RESTRICT');

    table
      .bigInteger('owner_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('users')
      .onDelete('RESTRICT');

    table
      .bigInteger('created_by')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('users')
      .onDelete('RESTRICT');

    table.string('action', 500).notNullable();

    table
      .dateTime('due_at', { precision: 3 })
      .notNullable();

    table
      .enu('status', [
        'PENDING',
        'COMPLETED',
        'RESCHEDULED',
        'CANCELLED',
      ])
      .notNullable()
      .defaultTo('PENDING');

    table.string('outcome', 190).nullable();
    table.text('notes').nullable();

    table
      .dateTime('completed_at', { precision: 3 })
      .nullable();

    table
      .bigInteger('completed_by')
      .unsigned()
      .nullable()
      .references('id')
      .inTable('users')
      .onDelete('RESTRICT');

    table
      .bigInteger('previous_follow_up_id')
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

    addTimestamps(knex, table);

    table.index(
      ['lead_id', 'status', 'due_at'],
      'follow_ups_lead_status_due_index',
    );

    table.index(
      ['owner_id', 'status', 'due_at'],
      'follow_ups_owner_status_due_index',
    );
  });
}

export async function down(knex) {
  await knex.schema.dropTableIfExists('follow_ups');
  await knex.schema.dropTableIfExists('lead_stage_history');
  await knex.schema.dropTableIfExists('leads');
}