/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  // Verificar se as colunas existem antes de removê-las
  const hasStripeSubscriptionId = await knex.schema.hasColumn('subscriptions', 'stripe_subscription_id');
  const hasStripeCustomerId = await knex.schema.hasColumn('subscriptions', 'stripe_customer_id');

  if (hasStripeSubscriptionId || hasStripeCustomerId) {
    await knex.schema.table('subscriptions', (table) => {
      if (hasStripeSubscriptionId) {
        table.dropColumn('stripe_subscription_id');
      }
      if (hasStripeCustomerId) {
        table.dropColumn('stripe_customer_id');
      }
    });
  }
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
  // Readicionar campos Stripe para rollback
  await knex.schema.table('subscriptions', (table) => {
    table.string('stripe_subscription_id').nullable();
    table.string('stripe_customer_id').nullable();
  });
};
