/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  // Esta migration foi convertida em seed
  // Os dados estão agora em src/seeds/00_master_seed.ts
  console.log('Migration vazia - dados movidos para seeds');
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
  // Remover apenas os dados inseridos pelo seed
  const seedKeys = [
    'hero-main-banner',
    'about-section', 
    'features-section',
    'about-us',
    'privacy-policy',
    'terms-of-service',
    'contact-info',
    'footer-links'
  ];
  
  await knex('page_statics').whereIn('key', seedKeys).del();
  console.log('✅ Seed de páginas estáticas removido com sucesso!');
};
