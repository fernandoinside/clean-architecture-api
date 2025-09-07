import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Adiciona a nova coluna name
  await knex.schema.alterTable('customers', table => {
    table.string('name').nullable().after('company_id');
  });

  // Atualiza a coluna name com a concatenação de first_name e last_name
  await knex.raw(`
    UPDATE customers 
    SET name = CONCAT(first_name, ' ', last_name)
  `);

  // Torna a coluna name obrigatória
  await knex.schema.alterTable('customers', table => {
    table.string('name').notNullable().alter();
  });

  // Remove as colunas first_name e last_name
  await knex.schema.alterTable('customers', table => {
    table.dropColumn('first_name');
    table.dropColumn('last_name');
  });
}

export async function down(knex: Knex): Promise<void> {
  // Adiciona as colunas first_name e last_name novamente
  await knex.schema.alterTable('customers', table => {
    table.string('first_name').nullable();
    table.string('last_name').nullable();
  });

  // Tenta extrair o primeiro e último nome do campo name
  await knex.raw(`
    UPDATE customers 
    SET 
      first_name = SPLIT_PART(name, ' ', 1),
      last_name = TRIM(SUBSTRING(name, POSITION(' ' IN name) + 1))
    WHERE name LIKE '% %';
  `);

  // Para registros sem espaço no nome, coloca tudo no first_name
  await knex.raw(`
    UPDATE customers 
    SET first_name = name
    WHERE first_name IS NULL;
  `);

  // Torna as colunas first_name e last_name obrigatórias
  await knex.schema.alterTable('customers', table => {
    table.string('first_name').notNullable().alter();
    table.string('last_name').notNullable().alter();
  });

  // Remove a coluna name
  await knex.schema.alterTable('customers', table => {
    table.dropColumn('name');
  });
}
