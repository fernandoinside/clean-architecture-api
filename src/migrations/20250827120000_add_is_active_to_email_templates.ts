import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  const hasColumn = await knex.schema.hasColumn('email_templates', 'is_active');
  if (!hasColumn) {
    await knex.schema.alterTable('email_templates', table => {
      table.boolean('is_active').notNullable().defaultTo(true);
    });
  }
}

export async function down(knex: Knex): Promise<void> {
  const hasColumn = await knex.schema.hasColumn('email_templates', 'is_active');
  if (hasColumn) {
    await knex.schema.alterTable('email_templates', table => {
      table.dropColumn('is_active');
    });
  }
}
