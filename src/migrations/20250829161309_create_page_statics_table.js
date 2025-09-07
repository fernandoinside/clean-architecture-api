/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('page_statics', table => {
    table.increments('id').primary();
    table.string('key', 100).unique().notNullable().comment('Identificador único da página');
    table.string('title', 255).notNullable().comment('Título da seção/página');
    table.text('content').nullable().comment('Conteúdo HTML/Markdown');
    table.enum('type', ['page', 'section', 'banner', 'config']).defaultTo('page').comment('Tipo do conteúdo');
    table.boolean('is_active').defaultTo(true).notNullable().comment('Se está ativo/visível');
    table.integer('order').defaultTo(0).comment('Ordem de exibição');
    table.jsonb('metadata').nullable().comment('Dados extras (SEO, configurações)');
    table.timestamps(true, true);
    table.timestamp('deleted_at').nullable();
    
    table.index('key');
    table.index('type');
    table.index('is_active');
    table.index('order');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTableIfExists('page_statics');
};
