/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  // Atualizar tabela subscriptions
  await knex.schema.table('subscriptions', (table) => {
    // Adicionar campos do Pagar.me
    table.string('pagarme_subscription_id').nullable();
    table.string('pagarme_customer_id').nullable();
    table.string('pagarme_card_id').nullable();
    table.enum('payment_method', ['pix', 'credit_card']).nullable();
    
    // Renomear campos Stripe existentes para manter compatibilidade
    // Os dados existentes serão preservados para migração manual se necessário
  });

  // Atualizar tabela payments  
  await knex.schema.table('payments', (table) => {
    // Adicionar campos específicos do Pagar.me
    table.string('pagarme_transaction_id').nullable();
    table.string('pagarme_charge_id').nullable();
    table.text('pix_qr_code').nullable();
    table.string('pix_qr_code_url').nullable();
    table.string('pix_expires_at').nullable();
    table.string('card_last_digits', 4).nullable();
    table.string('card_brand').nullable();
    table.string('card_holder_name').nullable();
    table.json('pagarme_metadata').nullable();
    table.decimal('fee_amount', 10, 2).nullable().defaultTo(0);
    table.string('acquirer_response_code').nullable();
    table.text('acquirer_message').nullable();
    table.enum('payment_type', ['pix', 'credit_card']).nullable();
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
  // Reverter tabela subscriptions
  await knex.schema.table('subscriptions', (table) => {
    table.dropColumn('pagarme_subscription_id');
    table.dropColumn('pagarme_customer_id');
    table.dropColumn('pagarme_card_id');
    table.dropColumn('payment_method');
  });

  // Reverter tabela payments
  await knex.schema.table('payments', (table) => {
    table.dropColumn('pagarme_transaction_id');
    table.dropColumn('pagarme_charge_id');
    table.dropColumn('pix_qr_code');
    table.dropColumn('pix_qr_code_url');
    table.dropColumn('pix_expires_at');
    table.dropColumn('card_last_digits');
    table.dropColumn('card_brand');
    table.dropColumn('card_holder_name');
    table.dropColumn('pagarme_metadata');
    table.dropColumn('fee_amount');
    table.dropColumn('acquirer_response_code');
    table.dropColumn('acquirer_message');
    table.dropColumn('payment_type');
  });
};
