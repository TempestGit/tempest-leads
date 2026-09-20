export async function up(knex) {
  await knex.schema.createTable('companies', (table) => {
    table.engine('InnoDB');
    table.charset('utf8mb4');
    table.collate('utf8mb4_unicode_ci');

    table.bigIncrements('id');

    table.string('company_code', 50).notNullable().unique();
    table.string('name', 190).notNullable();
    table.string('normalized_name', 190).notNullable().unique();

    table.string('industry', 100).notNullable();
    table.string('sub_industry', 100).nullable();
    table.string('city', 100).nullable();
    table.string('geography', 150).nullable();
    table.string('website', 500).nullable();
    table.string('existing_agency', 190).nullable();

    table.text('marketing_activity').nullable();
    table.text('potential_requirement').nullable();
    table.string('lead_source', 100).nullable();

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

    table
      .enu('status', ['PROSPECT', 'ACTIVE', 'INACTIVE'])
      .notNullable()
      .defaultTo('PROSPECT');

    table.date('reconnect_date').nullable();

    table
      .dateTime('created_at', { precision: 3 })
      .notNullable()
      .defaultTo(knex.fn.now(3));

    table
      .dateTime('updated_at', { precision: 3 })
      .notNullable()
      .defaultTo(knex.fn.now(3));

    table.index(['owner_id', 'id']);
    table.index('industry');
  });
}

export async function down(knex) {
  await knex.schema.dropTable('companies');
}