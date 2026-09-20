export async function up(knex) {
  await knex.schema.createTable('auth_tokens', (table) => {
    table.engine('InnoDB');
    table.charset('utf8mb4');
    table.collate('utf8mb4_unicode_ci');

    table.bigIncrements('id');

    table
      .bigInteger('user_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('users')
      .onDelete('CASCADE');

    table
      .enu('purpose', ['PASSWORD_RESET', 'INVITATION'])
      .notNullable();

    table.string('token_hash', 64).notNullable().unique();

    table.dateTime('expires_at', { precision: 3 }).notNullable();
    table.dateTime('used_at', { precision: 3 }).nullable();

    table
      .dateTime('created_at', { precision: 3 })
      .notNullable()
      .defaultTo(knex.fn.now(3));

    table.index(
      ['user_id', 'purpose'],
      'auth_tokens_user_purpose_index',
    );

    table.index('expires_at', 'auth_tokens_expiry_index');
  });
}

export async function down(knex) {
  await knex.schema.dropTable('auth_tokens');
}