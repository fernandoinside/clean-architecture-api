import express from 'express';
// Usando require para evitar problemas de tipo com pg
const { Client } = require('pg');
import * as path from 'path';
import * as dotenv from 'dotenv';

// Carregar variáveis de ambiente do arquivo .env se existir
const envPath = path.resolve(process.cwd(), '.env');
if (envPath) {
  dotenv.config({ path: envPath });
}

const banner = `
  ____  ____  __  __
 / ___||  _ \|  \/  |
 \___ \| |_) | |\/| |
  ___) |  _ <| |  | |
 |____/|_| \_\_|  |_|

SRM Gestão
`;

console.log(banner);
console.log(`Ambiente: ${process.env.NODE_ENV || 'development'}`);

import 'dotenv/config';
import redisClient from './config/redis';

import cors from 'cors';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import authMiddleware from './middleware/authMiddleware';

import rateLimit from 'express-rate-limit';

import Knex from 'knex';
import knexConfig from './config/knexfile';
import logger from './config/logger'; // Importar o logger para logs de migração

const app = express();
const port = process.env.PORT || 3000;

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 1000, // Limite de 100 requisições por IP a cada 15 minutos
  message: 'Muitas requisições a partir deste IP, por favor, tente novamente após 15 minutos'
});

app.use(limiter);
app.use(cors({
  origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : '*' ,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Template SaaS API',
      version: '1.0.0',
      description: 'API para o template SaaS',
    },
    servers: [
      {
        url: `http://localhost:${port}`,
        description: 'Servidor de desenvolvimento',
      },
    ],
  },
  apis: ['./src/routes/*.ts', './src/controllers/*.ts', './src/schemas/*.ts'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get('/', (req, res) => {
  res.send('API is running');
});

import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import roleRoutes from './routes/roleRoutes';
import permissionRoutes from './routes/permissionRoutes';
import rolePermissionRoutes from './routes/rolePermissionRoutes';
import userRoleRoutes from './routes/userRoleRoutes';
import companyRoutes from './routes/companyRoutes';
import customerRoutes from './routes/customerRoutes';
import customerAddressRoutes from './routes/customerAddressRoutes';
import planRoutes from './routes/planRoutes';
import subscriptionRoutes from './routes/subscriptionRoutes';
import paymentRoutes from './routes/paymentRoutes';
import settingRoutes from './routes/settingRoutes';
import logRoutes from './routes/logRoutes';
import notificationRoutes from './routes/notificationRoutes';
import fileRoutes from './routes/fileRoutes';
import sessionRoutes from './routes/sessionRoutes';
import passwordResetRoutes from './routes/passwordResetRoutes';
import emailTemplateRoutes from './routes/emailTemplateRoutes';
import checkoutRoutes from './routes/checkoutRoutes';
import pageStaticRoutes from './routes/pageStaticRoutes';
import ticketRoutes from './routes/ticketRoutes';

app.use('/auth', authRoutes);

app.use('/users', userRoutes);
app.use('/roles', roleRoutes);
app.use('/permissions', permissionRoutes);
app.use('/role-permissions', rolePermissionRoutes);
app.use('/user-roles', userRoleRoutes);
app.use('/companies', companyRoutes);
app.use('/customers', customerRoutes);
app.use('/customer-addresses', customerAddressRoutes);
app.use('/plans', planRoutes);
app.use('/subscriptions', subscriptionRoutes);
app.use('/payments', paymentRoutes);
app.use('/settings', settingRoutes);
app.use('/logs', logRoutes);
app.use('/notifications', notificationRoutes);
app.use('/files', fileRoutes);
app.use('/sessions', sessionRoutes);
app.use('/password-resets', passwordResetRoutes);
app.use('/email-templates', emailTemplateRoutes);
app.use('/checkout', checkoutRoutes);
app.use('/page-statics', pageStaticRoutes);
app.use('/tickets', ticketRoutes);

import {
  AppError,
  ValidationError,
  NotFoundError,
  ConflictError,
  UnauthorizedError,
  ForbiddenError,
  DatabaseError
} from './utils/errors';

// Middleware de tratamento de erros global
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (err instanceof AppError) {
    logger.warn(`[API Error] ${err.statusCode} - ${err.message}`, {
      path: req.path,
      method: req.method,
      details: err.details,
    });
    return res.status(err.statusCode).json({
      status: 'error',
      message: err.message,
      ...(err.details && { details: err.details }),
    });
  }

  // Erro inesperado (500)
  logger.error('[Unhandled Error] ', err);

  // Em ambiente de desenvolvimento, envie mais detalhes
  if (process.env.NODE_ENV === 'development') {
    return res.status(500).json({
      status: 'error',
      message: 'Erro interno do servidor.',
      error: {
        name: err.name,
        message: err.message,
        stack: err.stack,
      },
    });
  }

  // Em produção, envie uma mensagem genérica
  return res.status(500).json({
    status: 'error',
    message: 'Ocorreu um erro inesperado. Por favor, tente novamente mais tarde.',
  });
});

/**
 * Verifica se o banco de dados existe e o cria se necessário
 */
async function ensureDatabaseExists(dbName: string): Promise<void> {
  // Criar conexão com o banco de dados postgres padrão
  const client = new Client({
    host: process.env.POSTGRES_HOST || 'localhost',
    port: parseInt(process.env.POSTGRES_PORT || '5433'),
    user: process.env.POSTGRES_USER || 'postgres',
    password: process.env.POSTGRES_PASSWORD || 'postgres',
    database: 'postgres' // Conectar ao banco de dados postgres padrão primeiro
  });

  try {
    await client.connect();
    logger.info('✅ Conectado ao servidor PostgreSQL');

    // Verificar se o banco de dados existe
    const query = {
      text: 'SELECT 1 FROM pg_database WHERE datname = $1',
      values: [dbName]
    };
  
    const result = await client.query(query);
    const rowCount = result.rows ? result.rows.length : 0;

    if (rowCount === 0) {
      logger.info(`🔄 Banco de dados '${dbName}' não existe, criando...`);
      await client.query(`CREATE DATABASE ${dbName}`);
      logger.info(`✅ Banco de dados '${dbName}' criado com sucesso`);
    } else {
      logger.info(`✅ Banco de dados '${dbName}' já existe`);
    }
  } catch (error) {
    logger.error(`❌ Erro ao verificar/criar o banco de dados '${dbName}':`, error);
    throw error;
  } finally {
    await client.end();
  }
}

/**
 * Função para executar migrações e seeds com controle de integridade
 */
async function runMigrationsAndSeeds() {
  const environment = process.env.NODE_ENV || 'development';
  const config = knexConfig[environment];
  
  if (!config) {
    logger.error('❌ Configuração do ambiente não encontrada');
    process.exit(1);
  }
  
  // Obter o nome do banco de dados da configuração
  const dbName = config.connection && typeof config.connection === 'object' 
    ? (config.connection as any).database 
    : null;
  
  if (!dbName) {
    logger.error('❌ Nome do banco de dados não encontrado na configuração');
    process.exit(1);
  }
  
  // Verificar e criar o banco de dados se não existir
  try {
    await ensureDatabaseExists(dbName);
  } catch (error) {
    logger.error('❌ Falha ao verificar/criar o banco de dados:', error);
    process.exit(1);
  }
  
  // Agora que temos certeza que o banco existe, prosseguir com as migrações
  const knex = Knex(config);

  try {
    // Log da configuração (sem mostrar senha)
    const safeConfig = config.connection && typeof config.connection === 'object' ? {
      ...config.connection,
      password: '***'
    } : config.connection;
    logger.info('🔍 Configuração do banco de dados:', safeConfig);
    logger.info(`🌐 CORS habilitado para as origens: ${process.env.CORS_ORIGIN || 'Todas (*)'}`);

    // Verificar conexão com Redis
    try {
      await redisClient.ping();
      logger.info('✅ Conectado ao Redis!');
    } catch (redisError) {
      logger.warn('⚠️  Erro ao conectar ao Redis (continuando sem cache):', redisError);
    }

    // Verificar conexão com banco de dados
    logger.info('🔄 Verificando conexão com o banco de dados...');
    await knex.raw('SELECT 1');
    logger.info('✅ Conexão com o banco de dados estabelecida');

    // Executar migrações
    logger.info('🔄 Executando migrações...');
    const [batchNo, log] = await knex.migrate.latest();
    
    if (log.length === 0) {
      logger.info('✅ Nenhuma migração pendente. O banco de dados já está atualizado.');
    } else {
      logger.info(`✅ Migrações concluídas. Batch ${batchNo} - Total: ${log.length} migrações`);
      log.forEach((migration: string, index: number) => {
        logger.info(`   ${index + 1}. ${migration}`);
      });
    }

    // Verificar se as tabelas essenciais existem
    const requiredTables = ['users', 'roles', 'permissions', 'companies'];
    for (const table of requiredTables) {
      const exists = await knex.schema.hasTable(table);
      if (!exists) {
        throw new Error(`Tabela essencial '${table}' não encontrada após migrações`);
      }
    }
    logger.info('✅ Todas as tabelas essenciais verificadas');

    // Executar seeds com controle de transação
    logger.info('🌱 Executando seeds...');
    await knex.transaction(async (trx) => {
      // Usar a transação para os seeds
      const seedResult = await knex.seed.run({ specific: '00_master_seed.ts' });
      
      if (seedResult && Array.isArray(seedResult[0]) && seedResult[0].length > 0) {
        const seedFiles = seedResult[0] as string[];
        logger.info(`✅ Seeds executados com sucesso: ${seedFiles.length} arquivo(s)`);
        seedFiles.forEach((file: string, index: number) => {
          logger.info(`   ${index + 1}. ${file}`);
        });
      } else {
        logger.info('✅ Execução de seeds concluída');
      }
    });

    // Verificar integridade dos dados - Todas as tabelas
    const [
      userCount,
      roleCount,
      permissionCount,
      companyCount,
      customerCount,
      customerAddressCount,
      planCount,
      subscriptionCount,
      paymentCount,
      sessionCount,
      logCount,
      notificationCount,
      fileCount,
      settingCount,
      emailTemplateCount,
      passwordResetCount,
      userRoleCount,
      rolePermissionCount,
      ticketCount
    ] = await Promise.all([
      knex('users').count('id as count').first(),
      knex('roles').count('id as count').first(), 
      knex('permissions').count('id as count').first(),
      knex('companies').count('id as count').first(),
      knex('customers').count('id as count').first(),
      knex('customer_addresses').count('id as count').first(),
      knex('plans').count('id as count').first(),
      knex('subscriptions').count('id as count').first(),
      knex('payments').count('id as count').first(),
      knex('sessions').count('id as count').first(),
      knex('logs').count('id as count').first(),
      knex('notifications').count('id as count').first(),
      knex('files').count('id as count').first(),
      knex('settings').count('id as count').first(),
      knex('email_templates').count('id as count').first(),
      knex('password_resets').count('id as count').first(),
      knex('user_roles').count('id as count').first(),
      knex('role_permissions').count('id as count').first(),
      knex('tickets').count('id as count').first().catch(() => ({ count: 0 })) // Capturar erro caso a tabela não exista ainda
    ]);
    
    logger.info('📊 Estatísticas completas do banco de dados:');
    logger.info('   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    logger.info('   👤 USUÁRIOS & AUTENTICAÇÃO');
    logger.info(`   👥 Usuários: ${userCount?.count || 0}`);
    logger.info(`   👑 Roles: ${roleCount?.count || 0}`);
    logger.info(`   🔐 Permissões: ${permissionCount?.count || 0}`);
    logger.info(`   🔗 Usuário-Roles: ${userRoleCount?.count || 0}`);
    logger.info(`   🔗 Role-Permissões: ${rolePermissionCount?.count || 0}`);
    logger.info(`   🔑 Sessões: ${sessionCount?.count || 0}`);
    logger.info(`   🔄 Reset Senhas: ${passwordResetCount?.count || 0}`);
    logger.info('');
    logger.info('   🏢 EMPRESAS & CLIENTES');
    logger.info(`   🏢 Empresas: ${companyCount?.count || 0}`);
    logger.info(`   👨‍💼 Clientes: ${customerCount?.count || 0}`);
    logger.info(`   📍 Endereços: ${customerAddressCount?.count || 0}`);
    logger.info('');
    logger.info('   💰 PLANOS & PAGAMENTOS');
    logger.info(`   📋 Planos: ${planCount?.count || 0}`);
    logger.info(`   📑 Assinaturas: ${subscriptionCount?.count || 0}`);
    logger.info(`   💳 Pagamentos: ${paymentCount?.count || 0}`);
    logger.info('');
    logger.info('   🔧 SISTEMA & LOGS');
    logger.info(`   📊 Logs: ${logCount?.count || 0}`);
    logger.info(`   📬 Notificações: ${notificationCount?.count || 0}`);
    logger.info(`   📎 Arquivos: ${fileCount?.count || 0}`);
    logger.info(`   ⚙️ Configurações: ${settingCount?.count || 0}`);
    logger.info(`   📧 Templates Email: ${emailTemplateCount?.count || 0}`);
    logger.info(`   🎫 Tickets: ${ticketCount?.count || 0}`);
    logger.info('   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    // Verificar se existe pelo menos um admin
    const adminUser = await knex('users')
      .join('roles', 'users.role_id', 'roles.id')
      .where('roles.name', 'admin')
      .first();
    
    if (adminUser) {
      logger.info(`✅ Usuário admin encontrado: ${adminUser.username} (${adminUser.email})`);
    } else {
      logger.warn('⚠️  Nenhum usuário admin encontrado no sistema');
    }
    
    // Obter e exibir a versão atual do banco de dados
    const currentVersion = await knex.migrate.currentVersion();
    logger.info(`📌 Versão atual do banco de dados: ${currentVersion}`);
    
  } catch (error) {
    logger.error('❌ Erro ao executar migrações ou seeds:', error);
    
    // Log mais detalhado em desenvolvimento
    if (environment === 'development') {
      console.error('Detalhes do erro:', error);
    }
    
    process.exit(1);
  } finally {
    try {
      await knex.destroy();
      logger.info('🔌 Conexão com o banco de dados encerrada');
    } catch (error) {
      logger.error('⚠️  Erro ao encerrar a conexão:', error);
    }
  }
}

// Executar migrações e seeds antes de iniciar o servidor
runMigrationsAndSeeds().then(() => {
    app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}).catch(error => {
  logger.error('Failed to start server:', error);
  process.exit(1);
});

export default app;