/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('tickets', function(table) {
    table.increments('id').primary();
    table.string('title', 200).notNullable().comment('Título do ticket');
    table.text('description').notNullable().comment('Descrição detalhada do ticket');
    table.enum('status', ['open', 'in_progress', 'pending', 'resolved', 'closed'])
         .defaultTo('open')
         .notNullable()
         .comment('Status atual do ticket');
    table.enum('priority', ['low', 'medium', 'high', 'urgent'])
         .defaultTo('medium')
         .notNullable()
         .comment('Prioridade do ticket');
    table.enum('category', ['support', 'contact', 'technical', 'billing', 'feature_request', 'bug_report'])
         .notNullable()
         .comment('Categoria do ticket');
    table.integer('user_id')
         .unsigned()
         .notNullable()
         .references('id')
         .inTable('users')
         .onUpdate('CASCADE')
         .onDelete('CASCADE')
         .comment('ID do usuário que criou o ticket');
    table.integer('assigned_to')
         .unsigned()
         .nullable()
         .references('id')
         .inTable('users')
         .onUpdate('CASCADE')
         .onDelete('SET NULL')
         .comment('ID do usuário responsável pelo ticket');
    table.integer('company_id')
         .unsigned()
         .nullable()
         .references('id')
         .inTable('companies')
         .onUpdate('CASCADE')
         .onDelete('CASCADE')
         .comment('ID da empresa relacionada ao ticket');
    table.json('attachments')
         .defaultTo('[]')
         .comment('URLs dos arquivos anexados');
    table.json('metadata')
         .defaultTo('{}')
         .comment('Dados extras e configurações');
    table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable();
    table.timestamp('updated_at').defaultTo(knex.fn.now()).notNullable();

    // Índices para melhor performance
    table.index(['user_id'], 'idx_tickets_user_id');
    table.index(['assigned_to'], 'idx_tickets_assigned_to');
    table.index(['company_id'], 'idx_tickets_company_id');
    table.index(['status'], 'idx_tickets_status');
    table.index(['priority'], 'idx_tickets_priority');
    table.index(['category'], 'idx_tickets_category');
    table.index(['created_at'], 'idx_tickets_created_at');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTableIfExists('tickets');
};
