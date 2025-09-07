import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Create ENUM types first
  await knex.raw(`
    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_status') THEN
        CREATE TYPE user_status AS ENUM ('active', 'inactive', 'suspended');
      END IF;
      
      IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'customer_status') THEN
        CREATE TYPE customer_status AS ENUM ('active', 'inactive', 'suspended');
      END IF;
      
      IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'company_status') THEN
        CREATE TYPE company_status AS ENUM ('active', 'inactive', 'pending', 'suspended');
      END IF;
      
      IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'subscription_status') THEN
        CREATE TYPE subscription_status AS ENUM ('active', 'inactive', 'cancelled', 'pending');
      END IF;
      
      IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_status') THEN
        CREATE TYPE payment_status AS ENUM ('pending', 'completed', 'failed');
      END IF;
      
      IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'log_level') THEN
        CREATE TYPE log_level AS ENUM ('info', 'warn', 'error', 'debug');
      END IF;
      
      IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'notification_type') THEN
        CREATE TYPE notification_type AS ENUM ('system', 'alert', 'info');
      END IF;
      
      IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'address_type') THEN
        CREATE TYPE address_type AS ENUM ('billing', 'shipping', 'both');
      END IF;
      
      IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'plan_interval') THEN
        CREATE TYPE plan_interval AS ENUM ('monthly', 'yearly');
      END IF;
      
      IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'setting_type') THEN
        CREATE TYPE setting_type AS ENUM ('string', 'number', 'boolean', 'json');
      END IF;
      
      IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'log_source') THEN
        CREATE TYPE log_source AS ENUM ('frontend', 'backend');
      END IF;
    END
    $$;
  `);

  // Create roles table
  await knex.schema.createTable('roles', table => {
    table.increments('id').primary();
    table.string('name').notNullable().unique();
    table.text('description').nullable();
    table.timestamps(true, true);
    table.timestamp('deleted_at').nullable();
  });

  // Create permissions table
  await knex.schema.createTable('permissions', table => {
    table.increments('id').primary();
    table.string('name').notNullable().unique();
    table.string('resource').notNullable();
    table.string('action').notNullable();
    table.text('description').nullable();
    table.timestamps(true, true);
    table.timestamp('deleted_at').nullable();
  });

  // Create companies table
  await knex.schema.createTable('companies', table => {
    table.increments('id').primary();
    table.string('name').notNullable();
    table.string('email').unique().notNullable();
    table.string('document').unique().nullable();
    table.string('phone').nullable();
    table.string('website').nullable();
    table.string('industry').nullable();
    table
      .specificType('status', 'company_status')
      .notNullable()
      .defaultTo('active');
    table.timestamps(true, true);
    table.timestamp('deleted_at').nullable();
  });

  // Create users table
  await knex.schema.createTable('users', table => {
    table.increments('id').primary();
    table
      .integer('company_id')
      .references('id')
      .inTable('companies')
      .onDelete('SET NULL')
      .nullable();
    table.string('username').notNullable().unique();
    table.string('email').notNullable().unique();
    table.string('password').notNullable();
    table.string('first_name').nullable();
    table.string('last_name').nullable();
    table.boolean('is_active').defaultTo(true);
    table.boolean('email_verified').defaultTo(false);
    table.string('email_verification_token').nullable();
    table
      .integer('role_id')
      .references('id')
      .inTable('roles')
      .onDelete('SET NULL')
      .nullable();
    table.timestamps(true, true);
    table.timestamp('deleted_at').nullable();
  });

  // Create customers table
  await knex.schema.createTable('customers', table => {
    table.increments('id').primary();
    table
      .integer('company_id')
      .references('id')
      .inTable('companies')
      .onDelete('CASCADE')
      .notNullable();
    table.string('first_name').notNullable();
    table.string('last_name').notNullable();
    table.string('email').notNullable().unique();
    table.string('phone').nullable();
    table.string('document').nullable().unique();
    table
      .specificType('status', 'customer_status')
      .notNullable()
      .defaultTo('active');
    table.timestamps(true, true);
    table.timestamp('deleted_at').nullable();
  });

  // Create customer_addresses table
  await knex.schema.createTable('customer_addresses', table => {
    table.increments('id').primary();
    table
      .integer('customer_id')
      .references('id')
      .inTable('customers')
      .onDelete('CASCADE')
      .notNullable();
    table.string('street').nullable();
    table.string('city').nullable();
    table.string('state').nullable();
    table.string('zip_code').nullable();
    table.string('country').nullable();
    table.specificType('type', 'address_type').defaultTo('billing');
    table.boolean('is_default').defaultTo(false);
    table.timestamps(true, true);
    table.timestamp('deleted_at').nullable();
  });

  // Create plans table
  await knex.schema.createTable('plans', table => {
    table.increments('id').primary();
    table.string('name').notNullable().unique();
    table.text('description').nullable();
    table.decimal('price', 10, 2).notNullable();
    table.string('currency', 3).notNullable().defaultTo('USD');
    table
      .specificType('interval', 'plan_interval')
      .notNullable()
      .defaultTo('monthly');
    table.jsonb('features').nullable();
    table.boolean('is_active').defaultTo(true);
    table.integer('max_users').nullable();
    table.integer('max_storage_gb').nullable();
    table.timestamps(true, true);
    table.timestamp('deleted_at').nullable();
  });

  // Create subscriptions table
  await knex.schema.createTable('subscriptions', table => {
    table.increments('id').primary();
    table
      .integer('company_id')
      .references('id')
      .inTable('companies')
      .onDelete('CASCADE')
      .notNullable();
    table
      .integer('plan_id')
      .references('id')
      .inTable('plans')
      .onDelete('RESTRICT')
      .notNullable();
    table.string('stripe_subscription_id').nullable();
    table.string('stripe_customer_id').nullable();
    table
      .specificType('status', 'subscription_status')
      .notNullable()
      .defaultTo('active');
    table.timestamp('current_period_start').notNullable();
    table.timestamp('current_period_end').notNullable();
    table.timestamp('canceled_at').nullable();
    table.timestamp('ended_at').nullable();
    table.timestamp('trial_start').nullable();
    table.timestamp('trial_end').nullable();
    table.boolean('auto_renew').defaultTo(true);
    table.boolean('is_trial').defaultTo(false);
    table.timestamps(true, true);
    table.timestamp('deleted_at').nullable();
    table.unique(['company_id', 'plan_id']);
  });

  // Create payments table
  await knex.schema.createTable('payments', table => {
    table.increments('id').primary();
    table
      .integer('customer_id')
      .references('id')
      .inTable('customers')
      .onDelete('CASCADE')
      .notNullable();
    table
      .integer('plan_id')
      .references('id')
      .inTable('plans')
      .onDelete('RESTRICT')
      .notNullable();
    table.decimal('amount', 10, 2).notNullable();
    table.string('currency', 3).notNullable().defaultTo('USD');
    table
      .specificType('status', 'payment_status')
      .notNullable()
      .defaultTo('pending');
    table.string('payment_method').notNullable();
    table.string('transaction_id').notNullable().unique();
    table.timestamps(true, true);
    table.timestamp('deleted_at').nullable();
  });

  // Create sessions table
  await knex.schema.createTable('sessions', table => {
    table.increments('id').primary();
    table
      .integer('user_id')
      .references('id')
      .inTable('users')
      .onDelete('CASCADE')
      .notNullable();
    table.string('token').notNullable().unique();
    table.string('ip_address').nullable();
    table.text('user_agent').nullable();
    table.timestamp('last_activity').notNullable();
    table.boolean('is_active').defaultTo(true);
    table.timestamps(true, true);
    table.timestamp('deleted_at').nullable();
  });

  // Create password_resets table
  await knex.schema.createTable('password_resets', table => {
    table.increments('id').primary();
    table
      .integer('user_id')
      .references('id')
      .inTable('users')
      .onDelete('CASCADE')
      .notNullable();
    table.string('token').notNullable();
    table.timestamp('expires_at').notNullable();
    table.boolean('used').defaultTo(false);
    table.timestamps(true, true);
    table.timestamp('deleted_at').nullable();
  });

  // Create role_permissions table (junction table for many-to-many)
  await knex.schema.createTable('role_permissions', table => {
    table.increments('id').primary();
    table
      .integer('role_id')
      .references('id')
      .inTable('roles')
      .onDelete('CASCADE')
      .notNullable();
    table
      .integer('permission_id')
      .references('id')
      .inTable('permissions')
      .onDelete('CASCADE')
      .notNullable();
    table.timestamps(true, true);
    table.unique(['role_id', 'permission_id']);
  });

  // Create user_roles table (junction table for many-to-many)
  await knex.schema.createTable('user_roles', table => {
    table.increments('id').primary();
    table
      .integer('user_id')
      .references('id')
      .inTable('users')
      .onDelete('CASCADE')
      .notNullable();
    table
      .integer('role_id')
      .references('id')
      .inTable('roles')
      .onDelete('CASCADE')
      .notNullable();
    table.timestamps(true, true);
    table.timestamp('deleted_at').nullable();
    table.unique(['user_id', 'role_id']);
  });

  // Create logs table
  await knex.schema.createTable('logs', table => {
    table.increments('id').primary();
    table.specificType('level', 'log_level').notNullable();
    table.text('message').notNullable();
    table.jsonb('meta').nullable();
    table.specificType('source', 'log_source').nullable();
    table.timestamps(true, true);
    table.timestamp('deleted_at').nullable();
  });

  // Create notifications table
  await knex.schema.createTable('notifications', table => {
    table.increments('id').primary();
    table
      .integer('user_id')
      .references('id')
      .inTable('users')
      .onDelete('CASCADE')
      .notNullable();
    table.string('title').notNullable();
    table.text('message').notNullable();
    table
      .specificType('type', 'notification_type')
      .nullable()
      .defaultTo('info');
    table.boolean('is_read').defaultTo(false);
    table.timestamps(true, true);
    table.timestamp('deleted_at').nullable();
  });

  // Create files table
  await knex.schema.createTable('files', table => {
    table.increments('id').primary();
    table
      .integer('user_id')
      .references('id')
      .inTable('users')
      .onDelete('SET NULL')
      .nullable();
    table.string('file_name').notNullable();
    table.string('mime_type').notNullable();
    table.bigInteger('file_size').notNullable();
    table.string('file_path').notNullable();
    table.string('entity_type').nullable();
    table.integer('entity_id').nullable();
    table.timestamps(true, true);
    table.timestamp('deleted_at').nullable();
  });

  // Create email_templates table
  await knex.schema.createTable('email_templates', table => {
    table.increments('id').primary();
    table.string('name').notNullable().unique();
    table.string('subject').notNullable();
    table.text('body').notNullable();
    table.string('type').notNullable();
    table.timestamps(true, true);
    table.timestamp('deleted_at').nullable();
  });

  // Create settings table
  await knex.schema.createTable('settings', table => {
    table.increments('id').primary();
    table.string('key').notNullable().unique();
    table.text('value').nullable();
    table.specificType('type', 'setting_type').defaultTo('string');
    table.text('description').nullable();
    table.timestamps(true, true);
    table.timestamp('deleted_at').nullable();
  });

  // Create indexes for performance
  await knex.schema.raw(`
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
    CREATE INDEX IF NOT EXISTS idx_users_company_id ON users(company_id);
    CREATE INDEX IF NOT EXISTS idx_companies_email ON companies(email);
    CREATE INDEX IF NOT EXISTS idx_companies_document ON companies(document);
    CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
    CREATE INDEX IF NOT EXISTS idx_customers_company_id ON customers(company_id);
    CREATE INDEX IF NOT EXISTS idx_settings_key ON settings(key);
    CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);
    CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
    CREATE INDEX IF NOT EXISTS idx_subscriptions_company_id ON subscriptions(company_id);
    CREATE INDEX IF NOT EXISTS idx_subscriptions_plan_id ON subscriptions(plan_id);
    CREATE INDEX IF NOT EXISTS idx_payments_customer_id ON payments(customer_id);
    CREATE INDEX IF NOT EXISTS idx_payments_transaction_id ON payments(transaction_id);
    CREATE INDEX IF NOT EXISTS idx_logs_level ON logs(level);
    CREATE INDEX IF NOT EXISTS idx_logs_created_at ON logs(created_at);
    CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
    CREATE INDEX IF NOT EXISTS idx_files_user_id ON files(user_id);
    CREATE INDEX IF NOT EXISTS idx_files_entity ON files(entity_type, entity_id);
  `);
}

export async function down(knex: Knex): Promise<void> {
  // Drop tables in reverse order to avoid foreign key constraints
  await knex.schema.dropTableIfExists('settings');
  await knex.schema.dropTableIfExists('email_templates');
  await knex.schema.dropTableIfExists('files');
  await knex.schema.dropTableIfExists('notifications');
  await knex.schema.dropTableIfExists('logs');
  await knex.schema.dropTableIfExists('user_roles');
  await knex.schema.dropTableIfExists('role_permissions');
  await knex.schema.dropTableIfExists('password_resets');
  await knex.schema.dropTableIfExists('sessions');
  await knex.schema.dropTableIfExists('payments');
  await knex.schema.dropTableIfExists('subscriptions');
  await knex.schema.dropTableIfExists('plans');
  await knex.schema.dropTableIfExists('customer_addresses');
  await knex.schema.dropTableIfExists('customers');
  await knex.schema.dropTableIfExists('users');
  await knex.schema.dropTableIfExists('companies');
  await knex.schema.dropTableIfExists('permissions');
  await knex.schema.dropTableIfExists('roles');

  // Drop ENUM types
  await knex.raw(`
    DROP TYPE IF EXISTS setting_type CASCADE;
    DROP TYPE IF EXISTS plan_interval CASCADE;
    DROP TYPE IF EXISTS address_type CASCADE;
    DROP TYPE IF EXISTS log_source CASCADE;
    DROP TYPE IF EXISTS notification_type CASCADE;
    DROP TYPE IF EXISTS log_level CASCADE;
    DROP TYPE IF EXISTS payment_status CASCADE;
    DROP TYPE IF EXISTS subscription_status CASCADE;
    DROP TYPE IF EXISTS company_status CASCADE;
    DROP TYPE IF EXISTS customer_status CASCADE;
    DROP TYPE IF EXISTS user_status CASCADE;
  `);
}
