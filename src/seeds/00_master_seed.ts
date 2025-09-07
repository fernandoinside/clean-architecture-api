import bcrypt from 'bcryptjs';
import { Knex } from 'knex';
import logger from '../config/logger';

/**
 * Master seed que executa todos os seeds na ordem correta
 * e garante que as dependências sejam respeitadas
 */
export async function seed(knex: Knex): Promise<void> {
  try {
    logger.info('🌱 Iniciando execução do master seed...');

    // 1. Primeiro - Verificar se já existem dados
    const existingUsers = await knex('users').count('id as count').first();
    const userCount = parseInt(existingUsers?.count as string) || 0;

    if (userCount > 0) {
      logger.info('✅ Dados já existem no banco, pulando seeds iniciais');
      
      // Ainda assim, verificar e executar seeds independentes
      logger.info('📄 Verificando páginas estáticas...');
      await insertPageStatics(knex);
      
      return;
    }

    logger.info('🆕 Banco de dados vazio, executando seeds iniciais...');

    // 2. Inserir Roles primeiro (dependência de tudo)
    logger.info('📋 Inserindo roles...');
    await insertRoles(knex);

    // 3. Inserir Permissions (dependência de role_permissions)
    logger.info('🔐 Inserindo permissions...');
    await insertPermissions(knex);

    // 4. Inserir Companies (dependência de users)
    logger.info('🏢 Inserindo companies...');
    await insertCompanies(knex);

    // 5. Inserir Users (precisa de roles e companies)
    logger.info('👥 Inserindo users...');
    await insertUsers(knex);

    // 6. Inserir Role-Permissions (precisa de roles e permissions)
    logger.info('🔗 Associando roles e permissions...');
    await insertRolePermissions(knex);

    // 7. Inserir User-Roles (precisa de users e roles)
    logger.info('👤 Associando users e roles...');
    await insertUserRoles(knex);

    // 8. Inserir Plans (independente)
    logger.info('💰 Inserindo plans...');
    await insertPlans(knex);

    // 9. Inserir Customers (precisa de companies)
    logger.info('👨‍💼 Inserindo customers...');
    await insertCustomers(knex);

    // 11. Inserir Settings (independente)
    logger.info('⚙️ Inserindo settings...');
    await insertSettings(knex);

    // 12. Inserir Page Statics (independente)
    logger.info('📄 Inserindo páginas estáticas...');
    await insertPageStatics(knex);

    logger.info('✅ Master seed executado com sucesso!');
  } catch (error) {
    logger.error('❌ Erro no master seed:', error);
    throw error;
  }
}

async function insertRoles(knex: Knex) {
  const roles = [
    {
      id: 1,
      name: 'admin',
      description: 'Administrador do sistema com acesso total',
    },
    {
      id: 2,
      name: 'company_admin',
      description: 'Administrador da empresa com acesso gerencial',
    },
    {
      id: 3,
      name: 'user',
      description: 'Usuário comum com acesso limitado',
    },
    {
      id: 4,
      name: 'customer_user',
      description: 'Cliente com acesso muito restrito',
    },
  ];

  for (const role of roles) {
    await knex('roles').insert(role).onConflict('name').ignore();
  }
}

async function insertPermissions(knex: Knex) {
  const permissions = [
    // Auth permissions
    {
      name: 'auth_login',
      resource: 'auth',
      action: 'login',
      description: 'Fazer login no sistema',
    },
    {
      name: 'auth_logout',
      resource: 'auth',
      action: 'logout',
      description: 'Fazer logout do sistema',
    },
    {
      name: 'auth_refresh_token',
      resource: 'auth',
      action: 'refresh',
      description: 'Renovar token de autenticação',
    },

    // User permissions
    {
      name: 'users_read',
      resource: 'users',
      action: 'read',
      description: 'Visualizar usuários',
    },
    {
      name: 'users_create',
      resource: 'users',
      action: 'create',
      description: 'Criar usuários',
    },
    {
      name: 'users_update',
      resource: 'users',
      action: 'update',
      description: 'Atualizar usuários',
    },
    {
      name: 'users_delete',
      resource: 'users',
      action: 'delete',
      description: 'Excluir usuários',
    },
    {
      name: 'users_update_profile',
      resource: 'users',
      action: 'update_profile',
      description: 'Atualizar próprio perfil',
    },
    {
      name: 'users_change_password',
      resource: 'users',
      action: 'change_password',
      description: 'Alterar própria senha',
    },

    // Company permissions
    {
      name: 'companies_read',
      resource: 'companies',
      action: 'read',
      description: 'Visualizar empresas',
    },
    {
      name: 'companies_create',
      resource: 'companies',
      action: 'create',
      description: 'Criar empresas',
    },
    {
      name: 'companies_update',
      resource: 'companies',
      action: 'update',
      description: 'Atualizar empresas',
    },
    {
      name: 'companies_delete',
      resource: 'companies',
      action: 'delete',
      description: 'Excluir empresas',
    },

    // Customer permissions
    {
      name: 'customers_read',
      resource: 'customers',
      action: 'read',
      description: 'Visualizar clientes',
    },
    {
      name: 'customers_create',
      resource: 'customers',
      action: 'create',
      description: 'Criar clientes',
    },
    {
      name: 'customers_update',
      resource: 'customers',
      action: 'update',
      description: 'Atualizar clientes',
    },
    {
      name: 'customers_delete',
      resource: 'customers',
      action: 'delete',
      description: 'Excluir clientes',
    },

    // Customer Address permissions
    {
      name: 'customer_addresses_read',
      resource: 'customer_addresses',
      action: 'read',
      description: 'Visualizar endereços de clientes',
    },
    {
      name: 'customer_addresses_create',
      resource: 'customer_addresses',
      action: 'create',
      description: 'Criar endereços de clientes',
    },
    {
      name: 'customer_addresses_update',
      resource: 'customer_addresses',
      action: 'update',
      description: 'Atualizar endereços de clientes',
    },
    {
      name: 'customer_addresses_delete',
      resource: 'customer_addresses',
      action: 'delete',
      description: 'Excluir endereços de clientes',
    },

    // Role permissions
    {
      name: 'roles_read',
      resource: 'roles',
      action: 'read',
      description: 'Visualizar papéis',
    },
    {
      name: 'roles_create',
      resource: 'roles',
      action: 'create',
      description: 'Criar papéis',
    },
    {
      name: 'roles_update',
      resource: 'roles',
      action: 'update',
      description: 'Atualizar papéis',
    },
    {
      name: 'roles_delete',
      resource: 'roles',
      action: 'delete',
      description: 'Excluir papéis',
    },

    // Permission permissions
    {
      name: 'permissions_read',
      resource: 'permissions',
      action: 'read',
      description: 'Visualizar permissões',
    },
    {
      name: 'permissions_create',
      resource: 'permissions',
      action: 'create',
      description: 'Criar permissões',
    },
    {
      name: 'permissions_update',
      resource: 'permissions',
      action: 'update',
      description: 'Atualizar permissões',
    },
    {
      name: 'permissions_delete',
      resource: 'permissions',
      action: 'delete',
      description: 'Excluir permissões',
    },

    // Plan permissions
    {
      name: 'plans_read',
      resource: 'plans',
      action: 'read',
      description: 'Visualizar planos',
    },
    {
      name: 'plans_create',
      resource: 'plans',
      action: 'create',
      description: 'Criar planos',
    },
    {
      name: 'plans_update',
      resource: 'plans',
      action: 'update',
      description: 'Atualizar planos',
    },
    {
      name: 'plans_delete',
      resource: 'plans',
      action: 'delete',
      description: 'Excluir planos',
    },

    // Subscription permissions
    {
      name: 'subscriptions_read',
      resource: 'subscriptions',
      action: 'read',
      description: 'Visualizar assinaturas',
    },
    {
      name: 'subscriptions_create',
      resource: 'subscriptions',
      action: 'create',
      description: 'Criar assinaturas',
    },
    {
      name: 'subscriptions_update',
      resource: 'subscriptions',
      action: 'update',
      description: 'Atualizar assinaturas',
    },
    {
      name: 'subscriptions_delete',
      resource: 'subscriptions',
      action: 'delete',
      description: 'Excluir assinaturas',
    },

    // Payment permissions
    {
      name: 'payments_read',
      resource: 'payments',
      action: 'read',
      description: 'Visualizar pagamentos',
    },
    {
      name: 'payments_create',
      resource: 'payments',
      action: 'create',
      description: 'Criar pagamentos',
    },
    {
      name: 'payments_update',
      resource: 'payments',
      action: 'update',
      description: 'Atualizar pagamentos',
    },
    {
      name: 'payments_delete',
      resource: 'payments',
      action: 'delete',
      description: 'Excluir pagamentos',
    },

    // File permissions
    {
      name: 'files_read',
      resource: 'files',
      action: 'read',
      description: 'Visualizar arquivos',
    },
    {
      name: 'files_create',
      resource: 'files',
      action: 'create',
      description: 'Fazer upload de arquivos',
    },
    {
      name: 'files_update',
      resource: 'files',
      action: 'update',
      description: 'Atualizar arquivos',
    },
    {
      name: 'files_delete',
      resource: 'files',
      action: 'delete',
      description: 'Excluir arquivos',
    },

    // Notification permissions
    {
      name: 'notifications_read',
      resource: 'notifications',
      action: 'read',
      description: 'Visualizar notificações',
    },
    {
      name: 'notifications_create',
      resource: 'notifications',
      action: 'create',
      description: 'Criar notificações',
    },
    {
      name: 'notifications_update',
      resource: 'notifications',
      action: 'update',
      description: 'Atualizar notificações',
    },
    {
      name: 'notifications_delete',
      resource: 'notifications',
      action: 'delete',
      description: 'Excluir notificações',
    },

    // Log permissions
    {
      name: 'logs_read',
      resource: 'logs',
      action: 'read',
      description: 'Visualizar logs',
    },
    {
      name: 'logs_delete',
      resource: 'logs',
      action: 'delete',
      description: 'Excluir logs',
    },

    // Settings permissions
    {
      name: 'settings_read',
      resource: 'settings',
      action: 'read',
      description: 'Visualizar configurações',
    },
    {
      name: 'settings_update',
      resource: 'settings',
      action: 'update',
      description: 'Atualizar configurações',
    },

    // Dashboard permissions
    {
      name: 'dashboard_view',
      resource: 'dashboard',
      action: 'view',
      description: 'Visualizar dashboard',
    },

    // Reports permissions
    {
      name: 'reports_read',
      resource: 'reports',
      action: 'read',
      description: 'Visualizar relatórios',
    },
    {
      name: 'reports_create',
      resource: 'reports',
      action: 'create',
      description: 'Criar relatórios',
    },
    {
      name: 'reports_export',
      resource: 'reports',
      action: 'export',
      description: 'Exportar relatórios',
    },

    // Profile permissions
    {
      name: 'profile_read',
      resource: 'profile',
      action: 'read',
      description: 'Visualizar perfil',
    },
    {
      name: 'profile_update',
      resource: 'profile',
      action: 'update',
      description: 'Atualizar perfil',
    },
  ];

  for (const permission of permissions) {
    await knex('permissions').insert(permission).onConflict('name').ignore();
  }
}

async function insertCompanies(knex: Knex) {
  const companies = [
    {
      id: 1,
      name: 'SRM Gestão',
      email: 'contato@srmgestao.com.br',
      phone: '(11) 99999-9999',
      document: '12.345.678/0001-90',
      status: 'active',
    },
  ];

  for (const company of companies) {
    await knex('companies').insert(company).onConflict('document').ignore();
  }
}

async function insertUsers(knex: Knex) {
  // Hash das senhas
  const adminPassword = await bcrypt.hash('admin123', 12);
  const userPassword = await bcrypt.hash('user123', 12);

  const users = [
    {
      id: 1,
      username: 'admin',
      email: 'admin@srmgestao.com.br',
      password: adminPassword,
      first_name: 'Admin',
      last_name: 'Sistema',
      is_active: true,
      email_verified: true,
      role_id: 1, // admin
      company_id: 1,
    },
    {
      id: 2,
      username: 'company_admin',
      email: 'company.admin@srmgestao.com.br',
      password: adminPassword,
      first_name: 'Admin',
      last_name: 'Empresa',
      is_active: true,
      email_verified: true,
      role_id: 2, // company_admin
      company_id: 1,
    },
    {
      id: 3,
      username: 'user',
      email: 'user@srmgestao.com.br',
      password: userPassword,
      first_name: 'Usuário',
      last_name: 'Teste',
      is_active: true,
      email_verified: true,
      role_id: 3, // user
      company_id: 1,
    },
  ];

  for (const user of users) {
    await knex('users').insert(user).onConflict('email').ignore();
  }
}

async function insertRolePermissions(knex: Knex) {
  // Buscar IDs das roles e permissions
  const adminRole = await knex('roles').where('name', 'admin').first();
  const companyAdminRole = await knex('roles')
    .where('name', 'company_admin')
    .first();
  const userRole = await knex('roles').where('name', 'user').first();
  const customerRole = await knex('roles')
    .where('name', 'customer_user')
    .first();

  const allPermissions = await knex('permissions').select('id', 'name');

  if (!adminRole || !companyAdminRole || !userRole || !customerRole) {
    throw new Error('Roles não encontradas');
  }

  // ADMIN - Todas as permissões
  const adminPermissions = allPermissions.map(p => ({
    role_id: adminRole.id,
    permission_id: p.id,
  }));

  // COMPANY_ADMIN - Permissões específicas
  const companyAdminPermissionNames = [
    'auth_login',
    'auth_logout',
    'auth_refresh_token',
    'users_update_profile',
    'users_change_password',
    'users_read',
    'users_create',
    'users_update',
    'companies_read',
    'companies_update',
    'customers_read',
    'customers_create',
    'customers_update',
    'customers_delete',
    'customer_addresses_read',
    'customer_addresses_create',
    'customer_addresses_update',
    'customer_addresses_delete',
    'plans_read',
    'subscriptions_read',
    'subscriptions_create',
    'subscriptions_update',
    'payments_read',
    'payments_create',
    'payments_update',
    'settings_read',
    'settings_update',
    'logs_read',
    'notifications_read',
    'notifications_create',
    'notifications_update',
    'files_read',
    'files_create',
    'files_update',
    'files_delete',
    'dashboard_view',
    'reports_read',
    'reports_create',
    'reports_export',
    'profile_read',
    'profile_update',
  ];

  const companyAdminPermissions = allPermissions
    .filter(p => companyAdminPermissionNames.includes(p.name))
    .map(p => ({
      role_id: companyAdminRole.id,
      permission_id: p.id,
    }));

  // USER - Permissões básicas
  const userPermissionNames = [
    'auth_login',
    'auth_logout',
    'auth_refresh_token',
    'users_update_profile',
    'users_change_password',
    'users_read',
    'companies_read',
    'customers_read',
    'customer_addresses_read',
    'customers_create',
    'customers_update',
    'customer_addresses_create',
    'customer_addresses_update',
    'plans_read',
    'subscriptions_read',
    'payments_read',
    'settings_read',
    'logs_read',
    'notifications_read',
    'files_read',
    'dashboard_view',
    'reports_read',
    'profile_read',
    'profile_update',
  ];

  const userPermissions = allPermissions
    .filter(p => userPermissionNames.includes(p.name))
    .map(p => ({
      role_id: userRole.id,
      permission_id: p.id,
    }));

  // CUSTOMER_USER - Permissões mínimas
  const customerPermissionNames = [
    'auth_login',
    'auth_logout',
    'auth_refresh_token',
    'users_update_profile',
    'users_change_password',
    'profile_read',
    'profile_update',
    'dashboard_view',
  ];

  const customerPermissions = allPermissions
    .filter(p => customerPermissionNames.includes(p.name))
    .map(p => ({
      role_id: customerRole.id,
      permission_id: p.id,
    }));

  // Inserir todas as associações em lotes pequenos
  const allAssociations = [
    ...adminPermissions,
    ...companyAdminPermissions,
    ...userPermissions,
    ...customerPermissions,
  ];

  // Inserir em lotes de 50 para evitar problemas de performance
  const batchSize = 50;
  for (let i = 0; i < allAssociations.length; i += batchSize) {
    const batch = allAssociations.slice(i, i + batchSize);
    await knex('role_permissions')
      .insert(batch)
      .onConflict(['role_id', 'permission_id'])
      .ignore();
  }
}

async function insertUserRoles(knex: Knex) {
  const users = await knex('users').select('id', 'role_id');
  const userRoles = users.map(user => ({
    user_id: user.id,
    role_id: user.role_id,
  }));

  for (const userRole of userRoles) {
    await knex('user_roles')
      .insert(userRole)
      .onConflict(['user_id', 'role_id'])
      .ignore();
  }
}

async function insertPlans(knex: Knex) {
  const plans = [
    {
      id: 1,
      name: 'Básico',
      description: 'Plano básico para pequenas empresas',
      price: 29.9,
      currency: 'BRL',
      interval: 'monthly',
      features: JSON.stringify([
        'Até 5 usuários',
        'Suporte por email',
        '10GB de armazenamento',
        'Relatórios básicos',
      ]),
      is_active: true,
      max_users: 5,
      max_storage_gb: 10,
    },
    {
      id: 2,
      name: 'Profissional',
      description: 'Plano profissional para empresas em crescimento',
      price: 79.9,
      currency: 'BRL',
      interval: 'monthly',
      features: JSON.stringify([
        'Até 25 usuários',
        'Suporte prioritário',
        '100GB de armazenamento',
        'Relatórios avançados',
        'Integrações API',
        'Backup automático',
      ]),
      is_active: true,
      max_users: 25,
      max_storage_gb: 100,
    },
    {
      id: 3,
      name: 'Empresarial',
      description: 'Plano empresarial para grandes organizações',
      price: 199.9,
      currency: 'BRL',
      interval: 'monthly',
      features: JSON.stringify([
        'Usuários ilimitados',
        'Suporte 24/7',
        '1TB de armazenamento',
        'Relatórios personalizados',
        'Integrações avançadas',
        'Backup em tempo real',
        'Gerente de conta dedicado',
      ]),
      is_active: true,
      max_users: null,
      max_storage_gb: 1000,
    },
    {
      id: 4,
      name: 'Profissional Anual',
      description: 'Plano profissional com desconto anual',
      price: 799.0,
      currency: 'BRL',
      interval: 'yearly',
      features: JSON.stringify([
        'Até 25 usuários',
        'Suporte prioritário',
        '100GB de armazenamento',
        'Relatórios avançados',
        'Integrações API',
        'Backup automático',
        '2 meses grátis',
      ]),
      is_active: true,
      max_users: 25,
      max_storage_gb: 100,
    },
  ];

  for (const plan of plans) {
    await knex('plans').insert(plan).onConflict('name').ignore();
  }
}

async function insertCustomers(knex: Knex) {
  const customers = [
    {
      id: 1,
      name: 'João Silva',
      email: 'joao@email.com',
      phone: '(11) 99999-1111',
      document: '123.456.789-00',
      company_id: 1,
      status: 'active',
    },
    {
      id: 2,
      name: 'Maria Santos',
      email: 'maria@email.com',
      phone: '(11) 99999-2222',
      document: '987.654.321-00',
      company_id: 1,
      status: 'active',
    },
  ];

  for (const customer of customers) {
    await knex('customers').insert(customer).onConflict('email').ignore();
  }
}

async function insertSettings(knex: Knex) {
  const settings = [
    {
      key: 'app_name',
      value: 'SRM Gestão',
      type: 'string',
      description: 'Nome da aplicação',
    },
    {
      key: 'app_version',
      value: '1.0.0',
      type: 'string',
      description: 'Versão da aplicação',
    },
    {
      key: 'email_notifications',
      value: 'true',
      type: 'boolean',
      description: 'Habilitar notificações por email',
    },
    {
      key: 'max_file_size',
      value: '10485760',
      type: 'number',
      description: 'Tamanho máximo de arquivo em bytes (10MB)',
    },
  ];

  for (const setting of settings) {
    await knex('settings').insert(setting).onConflict('key').ignore();
  }
}

async function insertPageStatics(knex: Knex) {
  // Verificar se já existem dados na tabela
  const existingData = await knex('page_statics').count('* as count').first();
  const pageStaticsCount = parseInt(existingData?.count as string) || 0;
  
  if (pageStaticsCount > 0) {
    logger.info('✅ Páginas estáticas já existem, pulando inserção...');
    return;
  }

  const defaultPages = [
    // BANNERS PRINCIPAIS
    {
      key: 'hero-main-banner',
      title: 'Banner Principal',
      content: `<div class="hero-banner">
        <h1>SRM Gestão</h1>
        <p>Sistema completo de gestão para empresas e clientes com interface moderna e intuitiva</p>
        <div class="hero-buttons">
          <a href="/auth/login" class="btn-primary">Fazer Login</a>
          <a href="#plans" class="btn-secondary">Ver Planos</a>
        </div>
      </div>`,
      type: 'banner',
      is_active: true,
      order: 1,
      metadata: JSON.stringify({
        seo: {
          description: 'Sistema completo de gestão empresarial',
          keywords: ['gestão', 'sistema', 'empresas', 'SRM']
        },
        design: {
          background_color: '#f8fafc',
          text_color: '#1a202c'
        }
      })
    },
    
    // SEÇÕES DA LANDING PAGE
    {
      key: 'about-section',
      title: 'Sobre o SRM Gestão',
      content: `<section class="about">
        <h2>Sobre Nossa Plataforma</h2>
        <p>O SRM Gestão é uma solução completa para empresas que buscam modernizar sua gestão. Nossa plataforma oferece ferramentas avançadas para gerenciamento de clientes, usuários, financeiro e muito mais.</p>
        <div class="features-grid">
          <div class="feature">
            <h3>🏢 Gestão de Empresas</h3>
            <p>Gerencie empresas com informações completas e organizadas</p>
          </div>
          <div class="feature">
            <h3>👥 Clientes Integrados</h3>
            <p>Sistema completo de clientes com gestão de endereços</p>
          </div>
          <div class="feature">
            <h3>🔐 Segurança Avançada</h3>
            <p>Autenticação segura com controle de acesso granular</p>
          </div>
        </div>
      </section>`,
      type: 'section',
      is_active: true,
      order: 2,
      metadata: JSON.stringify({
        seo: {
          description: 'Conheça mais sobre o SRM Gestão',
          keywords: ['sobre', 'plataforma', 'recursos', 'gestão']
        }
      })
    },

    {
      key: 'features-section',
      title: 'Recursos da Plataforma',
      content: `<section class="features">
        <h2>Recursos Principais</h2>
        <div class="features-list">
          <div class="feature-item">
            <h3>Dashboard Intuitivo</h3>
            <p>Interface moderna e fácil de usar com métricas em tempo real</p>
          </div>
          <div class="feature-item">
            <h3>API RESTful Completa</h3>
            <p>Documentação Swagger e endpoints seguros para integração</p>
          </div>
          <div class="feature-item">
            <h3>Sistema de Permissões</h3>
            <p>Controle granular de acesso com roles e permissões</p>
          </div>
          <div class="feature-item">
            <h3>Gestão Financeira</h3>
            <p>Planos, assinaturas e pagamentos integrados</p>
          </div>
        </div>
      </section>`,
      type: 'section',
      is_active: true,
      order: 3,
      metadata: JSON.stringify({
        seo: {
          description: 'Principais recursos do SRM Gestão',
          keywords: ['recursos', 'funcionalidades', 'dashboard', 'API']
        }
      })
    },

    // PÁGINAS ESTÁTICAS
    {
      key: 'about-us',
      title: 'Sobre Nós',
      content: `<h1>Sobre o SRM Gestão</h1>
      <p>Somos uma empresa focada em desenvolver soluções tecnológicas inovadoras para gestão empresarial.</p>
      <h2>Nossa Missão</h2>
      <p>Simplificar a gestão empresarial através de tecnologia avançada e interface intuitiva.</p>
      <h2>Nossa Visão</h2>
      <p>Ser a principal plataforma de gestão empresarial no mercado nacional.</p>
      <h2>Nossos Valores</h2>
      <ul>
        <li>Inovação constante</li>
        <li>Foco no cliente</li>
        <li>Transparência</li>
        <li>Qualidade</li>
      </ul>`,
      type: 'page',
      is_active: true,
      order: 10,
      metadata: JSON.stringify({
        seo: {
          title: 'Sobre Nós - SRM Gestão',
          description: 'Conheça mais sobre a empresa SRM Gestão e nossos valores',
          keywords: ['sobre nós', 'empresa', 'missão', 'visão', 'valores']
        }
      })
    },

    {
      key: 'privacy-policy',
      title: 'Política de Privacidade',
      content: `<h1>Política de Privacidade</h1>
      <p>Esta política descreve como coletamos, usamos e protegemos suas informações.</p>
      <h2>Coleta de Informações</h2>
      <p>Coletamos apenas as informações necessárias para fornecer nossos serviços.</p>
      <h2>Uso das Informações</h2>
      <p>Suas informações são utilizadas exclusivamente para melhorar nossa plataforma e atendimento.</p>
      <h2>Proteção de Dados</h2>
      <p>Implementamos medidas de segurança rigorosas para proteger seus dados.</p>
      <h2>Contato</h2>
      <p>Para dúvidas sobre esta política, entre em contato conosco através do email: privacy@srmgestao.com</p>`,
      type: 'page',
      is_active: true,
      order: 11,
      metadata: JSON.stringify({
        seo: {
          title: 'Política de Privacidade - SRM Gestão',
          description: 'Política de privacidade e proteção de dados do SRM Gestão',
          keywords: ['privacidade', 'proteção de dados', 'LGPD', 'segurança']
        }
      })
    },

    {
      key: 'terms-of-service',
      title: 'Termos de Serviço',
      content: `<h1>Termos de Serviço</h1>
      <p>Estes termos regem o uso da plataforma SRM Gestão.</p>
      <h2>Aceitação dos Termos</h2>
      <p>Ao utilizar nossos serviços, você concorda com estes termos.</p>
      <h2>Descrição do Serviço</h2>
      <p>O SRM Gestão é uma plataforma de gestão empresarial baseada em nuvem.</p>
      <h2>Responsabilidades do Usuário</h2>
      <ul>
        <li>Manter suas credenciais seguras</li>
        <li>Usar o serviço de forma adequada</li>
        <li>Respeitar os direitos de outros usuários</li>
      </ul>
      <h2>Limitações de Responsabilidade</h2>
      <p>Nossos serviços são fornecidos "como estão", sem garantias expressas.</p>`,
      type: 'page',
      is_active: true,
      order: 12,
      metadata: JSON.stringify({
        seo: {
          title: 'Termos de Serviço - SRM Gestão',
          description: 'Termos de uso e condições de serviço do SRM Gestão',
          keywords: ['termos', 'condições', 'uso', 'serviço', 'contrato']
        }
      })
    },

    // CONFIGURAÇÕES DO SISTEMA
    {
      key: 'contact-info',
      title: 'Informações de Contato',
      content: `{
        "email": "contato@srmgestao.com",
        "phone": "+55 11 9999-9999",
        "address": "São Paulo, SP",
        "social": {
          "linkedin": "https://linkedin.com/company/srmgestao",
          "twitter": "https://twitter.com/srmgestao",
          "facebook": "https://facebook.com/srmgestao"
        }
      }`,
      type: 'config',
      is_active: true,
      order: 100,
      metadata: JSON.stringify({
        description: 'Configurações de contato da empresa'
      })
    },

    {
      key: 'footer-links',
      title: 'Links do Footer',
      content: `{
        "company": [
          {"label": "Sobre Nós", "url": "/about-us"},
          {"label": "Termos de Serviço", "url": "/terms-of-service"},
          {"label": "Política de Privacidade", "url": "/privacy-policy"}
        ],
        "support": [
          {"label": "Central de Ajuda", "url": "#"},
          {"label": "Documentação", "url": "/api-docs"},
          {"label": "Contato", "url": "#contact"}
        ],
        "social": [
          {"label": "LinkedIn", "url": "https://linkedin.com/company/srmgestao"},
          {"label": "Twitter", "url": "https://twitter.com/srmgestao"}
        ]
      }`,
      type: 'config',
      is_active: true,
      order: 101,
      metadata: JSON.stringify({
        description: 'Links organizados para o footer do site'
      })
    }
  ];

  for (const page of defaultPages) {
    await knex('page_statics').insert(page).onConflict('key').ignore();
  }

  logger.info('✅ Páginas estáticas inseridas com sucesso!');
}
