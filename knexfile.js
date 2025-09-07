// Knex configuration for test environment
const path = require('path');

// Load environment variables from .env.test
require('dotenv').config({ path: '.env' });

module.exports = {
  development: {
    client: 'pg',
    connection: {
      host: process.env.POSTGRES_HOST || '127.0.0.1',
      port: parseInt(process.env.POSTGRES_PORT || '5433'),
      user: process.env.POSTGRES_USER || 'postgres',
      password: process.env.POSTGRES_PASSWORD || 'postgres',
      database: process.env.POSTGRES_DB || 'srmgestao_dev',
    },
    migrations: {
      directory: path.join(__dirname, 'src/migrations'),
      tableName: 'knex_migrations',
    },
    seeds: {
      directory: path.join(__dirname, 'dist/seeds'),
    },
  },
  
  // For running migrations from the command line
  test: {
    client: 'pg',
    connection: {
      host: process.env.POSTGRES_HOST || '127.0.0.1',
      port: parseInt(process.env.POSTGRES_PORT || '5433'),
      user: process.env.POSTGRES_USER || 'postgres',
      password: process.env.POSTGRES_PASSWORD || 'postgres',
      database: process.env.POSTGRES_DB || 'srmgestao_dev',
    },
    migrations: {
      directory: path.join(__dirname, 'src/migrations'),
      tableName: 'knex_migrations',
    },
    seeds: {
      directory: path.join(__dirname, 'dist/seeds'),
    },
  },
};
