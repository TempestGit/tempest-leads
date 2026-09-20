export async function up(knex) {
  await knex.schema.createTable('contacts', (table) => {
    table.engine('InnoDB');
    table.charset('utf8mb4');
    table.collate('utf8mb4_unicode_ci');

    table.bigIncrements('id');

    table.string('contact_code', 50).notNullable().unique();

    table
      .bigInteger('company_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('companies')
      .onDelete('RESTRICT');

    table.string('name', 150).notNullable();
    table.string('designation', 150).nullable();
    table.string('department', 100).nullable();

    table.string('phone', 30).nullable();
    table.string('whatsapp', 30).nullable();
    table.string('email', 190).nullable();
    table.string('linkedin', 500).nullable();

    table.boolean('decision_maker').notNullable().defaultTo(false);

    table
      .enu('communication_status', [
        'UNKNOWN',
        'CONTACTABLE',
        'DO_NOT_CONTACT',
      ])
      .notNullable()
      .defaultTo('UNKNOWN');

    table.text('notes').nullable();

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
      .dateTime('created_at', { precision: 3 })
      .notNullable()
      .defaultTo(knex.fn.now(3));

    table
      .dateTime('updated_at', { precision: 3 })
      .notNullable()
      .defaultTo(knex.fn.now(3));

    table.index(['company_id', 'id']);
    table.index(['owner_id', 'id']);
    table.index('email');
  });
}

export async function down(knex) {
  await knex.schema.dropTable('contacts');
}