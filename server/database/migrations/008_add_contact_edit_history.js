export async function up(knex) {
  await knex.schema.alterTable('contacts', (table) => {
    table
      .integer('version')
      .unsigned()
      .notNullable()
      .defaultTo(1);
  });

  await knex.schema.createTable('contact_change_history', (table) => {
    table.bigIncrements('id');

    table
      .bigInteger('contact_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('contacts')
      .onDelete('RESTRICT');

    table
      .bigInteger('actor_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('users')
      .onDelete('RESTRICT');

    table
      .integer('previous_version')
      .unsigned()
      .notNullable();

    table
      .integer('new_version')
      .unsigned()
      .notNullable();

    table.json('previous_values').notNullable();

    table.json('new_values').notNullable();

    table
      .dateTime('created_at', { precision: 3 })
      .notNullable()
      .defaultTo(knex.raw('CURRENT_TIMESTAMP(3)'));

    table.index(
      ['contact_id', 'id'],
      'contact_change_history_contact_id_id_index',
    );

    table.index(
      ['actor_id'],
      'contact_change_history_actor_id_index',
    );
  });
}

export async function down(knex) {
  await knex.schema.dropTableIfExists('contact_change_history');

  await knex.schema.alterTable('contacts', (table) => {
    table.dropColumn('version');
  });
}