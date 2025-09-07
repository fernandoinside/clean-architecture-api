/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.alterTable('customers', (table) => {
    table.json('metadata').nullable().comment('Campo flexível para armazenar dados adicionais em formato JSON');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.alterTable('customers', (table) => {
    table.dropColumn('metadata');
  });
};
