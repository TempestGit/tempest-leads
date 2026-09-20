export async function up(knex) {
  await knex.schema.alterTable('companies', (table) => {
    table
      .integer('version')
      .unsigned()
      .notNullable()
      .defaultTo(1);
  });
}

export async function down(knex) {
  await knex.schema.alterTable('companies', (table) => {
    table.dropColumn('version');
  });
}