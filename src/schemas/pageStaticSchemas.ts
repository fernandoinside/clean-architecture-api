/**
 * @swagger
 * components:
 *   schemas:
 *     PageStatic:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           format: int64
 *           description: ID único da página
 *         key:
 *           type: string
 *           minLength: 3
 *           maxLength: 100
 *           description: Identificador único da página (slug)
 *         title:
 *           type: string
 *           minLength: 3
 *           maxLength: 255
 *           description: Título da página/seção
 *         content:
 *           type: string
 *           nullable: true
 *           description: Conteúdo HTML/Markdown da página
 *         type:
 *           type: string
 *           enum: [page, section, banner, config]
 *           default: 'page'
 *           description: Tipo de conteúdo
 *         isActive:
 *           type: boolean
 *           default: true
 *           description: Indica se a página está ativa/visível
 *         order:
 *           type: integer
 *           minimum: 0
 *           default: 0
 *           description: Ordem de exibição
 *         metadata:
 *           type: object
 *           nullable: true
 *           description: Dados extras (SEO, configurações)
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *
 *     PageStaticListResponse:
 *       type: object
 *       properties:
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/PageStatic'
 *         pagination:
 *           $ref: '#/components/schemas/Pagination'
 *
 *     PageStaticResponse:
 *       allOf:
 *         - $ref: '#/components/schemas/SuccessResponse'
 *         - type: object
 *           properties:
 *             data:
 *               $ref: '#/components/schemas/PageStatic'
 * 
 *     PageStaticCreate:
 *       type: object
 *       properties:
 *         key:
 *           type: string
 *           minLength: 3
 *           maxLength: 100
 *           pattern: '^[a-z0-9-_]+$'
 *           description: Identificador único da página (apenas letras minúsculas, números, hífens e underscores)
 *           example: "about-us"
 *         title:
 *           type: string
 *           minLength: 3
 *           maxLength: 255
 *           description: Título da página/seção
 *           example: "Sobre Nós"
 *         content:
 *           type: string
 *           description: Conteúdo HTML/Markdown da página
 *           example: "<h1>Sobre Nossa Empresa</h1><p>Somos uma empresa...</p>"
 *         type:
 *           type: string
 *           enum: [page, section, banner, config]
 *           description: Tipo de conteúdo
 *           example: "page"
 *           default: "page"
 *         isActive:
 *           type: boolean
 *           description: Se a página está ativa
 *           example: true
 *           default: true
 *         order:
 *           type: integer
 *           minimum: 0
 *           description: Ordem de exibição
 *           example: 1
 *           default: 0
 *         metadata:
 *           type: object
 *           description: Dados extras (SEO, configurações)
 *           example: {"seo": {"description": "Página sobre nossa empresa", "keywords": ["empresa", "sobre"]}}
 *       required:
 *         - key
 *         - title
 * 
 *     PageStaticUpdate:
 *       type: object
 *       properties:
 *         key:
 *           type: string
 *           minLength: 3
 *           maxLength: 100
 *           pattern: '^[a-z0-9-_]+$'
 *           description: Identificador único da página
 *           example: "about-us-updated"
 *         title:
 *           type: string
 *           minLength: 3
 *           maxLength: 255
 *           description: Título da página/seção
 *           example: "Sobre Nós - Atualizado"
 *         content:
 *           type: string
 *           description: Conteúdo HTML/Markdown da página
 *           example: "<h1>Sobre Nossa Empresa Atualizada</h1><p>Somos uma empresa líder...</p>"
 *         type:
 *           type: string
 *           enum: [page, section, banner, config]
 *           description: Tipo de conteúdo
 *           example: "section"
 *         isActive:
 *           type: boolean
 *           description: Se a página está ativa
 *           example: false
 *         order:
 *           type: integer
 *           minimum: 0
 *           description: Ordem de exibição
 *           example: 2
 *         metadata:
 *           type: object
 *           description: Dados extras (SEO, configurações)
 *           example: {"seo": {"description": "Página sobre nossa empresa atualizada", "keywords": ["empresa", "sobre", "líder"]}}
 *
 *     PageStaticPublic:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: ID da página
 *         key:
 *           type: string
 *           description: Identificador único da página
 *         title:
 *           type: string
 *           description: Título da página
 *         content:
 *           type: string
 *           description: Conteúdo da página
 *         type:
 *           type: string
 *           description: Tipo de conteúdo
 *         order:
 *           type: integer
 *           description: Ordem de exibição
 *         metadata:
 *           type: object
 *           description: Metadados da página
 *
 *     PageStaticStatistics:
 *       type: object
 *       properties:
 *         total:
 *           type: integer
 *           description: Total de páginas
 *         active:
 *           type: integer
 *           description: Páginas ativas
 *         inactive:
 *           type: integer
 *           description: Páginas inativas
 *         byType:
 *           type: object
 *           properties:
 *             page:
 *               type: integer
 *             section:
 *               type: integer
 *             banner:
 *               type: integer
 *             config:
 *               type: integer
 *           description: Estatísticas por tipo
 */

import Joi from 'joi';

// Schema para criação de página estática
export const createPageStaticSchema = Joi.object({
  key: Joi.string().min(3).max(100).pattern(/^[a-z0-9-_]+$/).required()
    .description('Identificador único da página (apenas letras minúsculas, números, hífens e underscores)'),
  title: Joi.string().min(3).max(255).required()
    .description('Título da página/seção'),
  content: Joi.string().optional().allow(null, '')
    .description('Conteúdo HTML/Markdown da página'),
  type: Joi.string().valid('page', 'section', 'banner', 'config').default('page')
    .description('Tipo de conteúdo'),
  is_active: Joi.boolean().default(true)
    .description('Se a página está ativa/visível'),
  order: Joi.number().integer().min(0).default(0)
    .description('Ordem de exibição'),
  metadata: Joi.object().optional().allow(null)
    .description('Dados extras (SEO, configurações)')
});

// Schema para atualização de página estática
export const updatePageStaticSchema = Joi.object({
  key: Joi.string().min(3).max(100).pattern(/^[a-z0-9-_]+$/)
    .description('Identificador único da página'),
  title: Joi.string().min(3).max(255)
    .description('Título da página/seção'),
  content: Joi.string().optional().allow(null, '')
    .description('Conteúdo HTML/Markdown da página'),
  type: Joi.string().valid('page', 'section', 'banner', 'config')
    .description('Tipo de conteúdo'),
  is_active: Joi.boolean()
    .description('Se a página está ativa/visível'),
  order: Joi.number().integer().min(0)
    .description('Ordem de exibição'),
  metadata: Joi.object().optional().allow(null)
    .description('Dados extras (SEO, configurações)')
}).min(1);

// Schema para listagem de páginas estáticas
export const listPageStaticsSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1)
    .description('Número da página'),
  limit: Joi.number().integer().min(1).max(100).default(10)
    .description('Quantidade de itens por página'),
  search: Joi.string().max(255).optional()
    .description('Termo de busca pelo título, key ou conteúdo'),
  type: Joi.string().valid('page', 'section', 'banner', 'config').optional()
    .description('Filtrar por tipo de conteúdo'),
  is_active: Joi.boolean().optional()
    .description('Filtrar por status de ativação'),
  order_by: Joi.string().valid('id', 'key', 'title', 'type', 'is_active', 'order', 'created_at', 'updated_at').default('order')
    .description('Campo para ordenação'),
  order_direction: Joi.string().valid('asc', 'desc').default('asc')
    .description('Direção da ordenação')
});

// Schema para obtenção de página estática por ID
export const getPageStaticSchema = Joi.object({
  id: Joi.number().integer().positive().required()
    .description('ID da página estática')
});

// Schema para obtenção de página estática por key
export const getPageStaticByKeySchema = Joi.object({
  key: Joi.string().min(3).max(100).required()
    .description('Key da página estática')
});

// Schema para exclusão de página estática
export const deletePageStaticSchema = Joi.object({
  id: Joi.number().integer().positive().required()
    .description('ID da página estática a ser excluída')
});

// Schema para filtro por tipo
export const getPageStaticsByTypeSchema = Joi.object({
  type: Joi.string().valid('page', 'section', 'banner', 'config').required()
    .description('Tipo de conteúdo para filtrar'),
  active_only: Joi.boolean().default(true)
    .description('Se deve retornar apenas páginas ativas')
});

// Schema para bulk update de status
export const bulkUpdateStatusSchema = Joi.object({
  ids: Joi.array().items(Joi.number().integer().positive()).min(1).required()
    .description('Array de IDs das páginas'),
  is_active: Joi.boolean().required()
    .description('Status a ser aplicado às páginas')
});

// Schema para duplicação de página
export const duplicatePageStaticSchema = Joi.object({
  id: Joi.number().integer().positive().required()
    .description('ID da página a ser duplicada'),
  new_key: Joi.string().min(3).max(100).pattern(/^[a-z0-9-_]+$/).required()
    .description('Nova key para a página duplicada'),
  new_title: Joi.string().min(3).max(255).required()
    .description('Novo título para a página duplicada')
});

// Schema para atualização de ordem
export const updateOrderSchema = Joi.object({
  id: Joi.number().integer().positive().required()
    .description('ID da página'),
  order: Joi.number().integer().min(0).required()
    .description('Nova ordem de exibição')
});

// Schema para busca por conteúdo
export const searchContentSchema = Joi.object({
  search_term: Joi.string().min(3).max(255).required()
    .description('Termo de busca no conteúdo das páginas')
});