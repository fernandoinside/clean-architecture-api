/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.alterTable('subscriptions', table => {
    // First, make company_id nullable since now it's optional
    table.integer('company_id').nullable().alter();
    
    // Add customer_id as nullable foreign key to customers table
    table
      .integer('customer_id')
      .references('id')
      .inTable('customers')
      .onDelete('CASCADE')
      .nullable();
  }).then(() => {
    // Add check constraint to ensure either company_id OR customer_id is provided, but not both
    return knex.raw(`
      ALTER TABLE subscriptions 
      ADD CONSTRAINT company_customer_check 
      CHECK ((company_id IS NOT NULL AND customer_id IS NULL) OR (company_id IS NULL AND customer_id IS NOT NULL))
    `);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.raw('ALTER TABLE subscriptions DROP CONSTRAINT company_customer_check')
    .then(() => {
      return knex.schema.alterTable('subscriptions', table => {
        // Drop the customer_id column
        table.dropColumn('customer_id');
        
        // Make company_id not nullable again
        table.integer('company_id').notNullable().alter();
      });
    });
};
