export async function up(knex) {
  await knex.schema.createTable('sessions', (table) => {
    table.engine('InnoDB');
    table.charset('utf8mb4');
    table.collate('utf8mb4_bin');

    table.string('sid', 128).primary();

    table
      .bigInteger('user_id')
      .unsigned()
      .nullable()
      .references('id')
      .inTable('users')
      .onDelete('CASCADE');

    table.json('data').notNullable();

    table.dateTime('expires_at', { precision: 3 }).notNullable();

    table
      .dateTime('created_at', { precision: 3 })
      .notNullable()
      .defaultTo(knex.fn.now(3));

    table
      .dateTime('updated_at', { precision: 3 })
      .notNullable()
      .defaultTo(knex.fn.now(3));

    table.index('expires_at', 'sessions_expiry_index');
    table.index('user_id', 'sessions_user_index');
  });
}

export async function down(knex) {
  await knex.schema.dropTable('sessions');
}