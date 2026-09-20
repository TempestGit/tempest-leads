export async function up(knex) {
  await knex.schema.createTable('users', (table) => {
    table.engine('InnoDB');
    table.charset('utf8mb4');
    table.collate('utf8mb4_unicode_ci');

    table.bigIncrements('id');

    table.string('name', 150).notNullable();
    table.string('email', 190).notNullable().unique();
    table.string('password_hash', 255).notNullable();

    table.string('phone', 30).nullable();
    table.string('employee_id', 50).nullable().unique();
    table.string('department', 100).nullable();
    table.string('location', 100).nullable();

    table
      .enu('role', ['SUPER_ADMIN', 'OWNER'])
      .notNullable()
      .defaultTo('OWNER');

    table
      .enu('status', ['ACTIVE', 'INACTIVE'])
      .notNullable()
      .defaultTo('ACTIVE');

    table
      .integer('session_version')
      .unsigned()
      .notNullable()
      .defaultTo(1);

    table.dateTime('last_login_at', { precision: 3 }).nullable();
    table.dateTime('password_changed_at', { precision: 3 }).nullable();
    table.dateTime('deactivated_at', { precision: 3 }).nullable();

    table
      .dateTime('created_at', { precision: 3 })
      .notNullable()
      .defaultTo(knex.fn.now(3));

    table
      .dateTime('updated_at', { precision: 3 })
      .notNullable()
      .defaultTo(knex.fn.now(3));

    table.index(['status', 'role'], 'users_status_role_index');
  });
}

export async function down(knex) {
  await knex.schema.dropTable('users');
}