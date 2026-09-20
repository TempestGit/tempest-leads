export async function up(knex) {
  await knex.schema.createTable('company_change_history', (table) => {
    table.engine('InnoDB');
    table.charset('utf8mb4');
    table.collate('utf8mb4_unicode_ci');

    table.bigIncrements('id');

    table
      .bigInteger('company_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('companies')
      .onDelete('RESTRICT');

    table
      .bigInteger('actor_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('users')
      .onDelete('RESTRICT');

    table.integer('previous_version').unsigned().notNullable();
    table.integer('new_version').unsigned().notNullable();

    table.json('previous_values').notNullable();
    table.json('new_values').notNullable();

    table
      .dateTime('created_at', { precision: 3 })
      .notNullable()
      .defaultTo(knex.fn.now(3));

    table.index(['company_id', 'id']);
  });
}

export async function down(knex) {
  await knex.schema.dropTable('company_change_history');
}