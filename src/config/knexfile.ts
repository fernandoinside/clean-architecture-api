
import { Knex } from 'knex';

const config: { [key: string]: Knex.Config } = {
  development: {
    client: 'pg',
    connection: {
      host: process.env.POSTGRES_HOST || '127.0.0.1',
      port: parseInt(process.env.POSTGRES_PORT || '5433'),
      user: process.env.POSTGRES_USER || 'postgres',
      password: process.env.POSTGRES_PASSWORD || 'postgres',
      database: process.env.POSTGRES_DB || 'srmgestao'
    },
    migrations: {
      directory: process.env.NODE_ENV === 'production' ? './dist/migrations' : './src/migrations'
    },
    seeds: {
      directory: process.env.NODE_ENV === 'production' ? './dist/seeds' : './src/seeds'
    }
  },
  production: {
    client: 'pg',
    connection: {
      host: process.env.POSTGRES_HOST || '127.0.0.1',
      port: parseInt(process.env.POSTGRES_PORT || '5433'),
      user: process.env.POSTGRES_USER || 'postgres',
      password: process.env.POSTGRES_PASSWORD || 'postgres',
      database: process.env.POSTGRES_DB || 'srmgestao'
    },
    migrations: {
      directory: './dist/migrations'
    },
    seeds: {
      directory: './dist/seeds'
    }
  }
};

export default config;






