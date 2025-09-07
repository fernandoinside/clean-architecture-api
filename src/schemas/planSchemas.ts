/**
 * @swagger
 * components:
 *   schemas:
 *     Plan:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           format: int64
 *           description: ID único do plano
 *         name:
 *           type: string
 *           minLength: 3
 *           maxLength: 100
 *           description: Nome do plano
 *         description:
 *           type: string
 *           maxLength: 255
 *           nullable: true
 *           description: Descrição detalhada do plano
 *         price:
 *           type: number
 *           format: float
 *           minimum: 0
 *           exclusiveMinimum: true
 *           description: Preço do plano
 *         currency:
 *           type: string
 *           minLength: 3
 *           maxLength: 3
 *           description: 'Código da moeda (ex. BRL, USD)'
 *         interval:
 *           type: string
 *           enum: [monthly, yearly]
 *           default: 'monthly'
 *           description: Intervalo de cobrança do plano
 *         features:
 *           type: array
 *           items:
 *             type: string
 *           description: Lista de recursos incluídos no plano
 *         isActive:
 *           type: boolean
 *           default: true
 *           description: Indica se o plano está ativo para contratação
 *         maxUsers:
 *           type: integer
 *           minimum: 1
 *           nullable: true
 *           description: Número máximo de usuários permitidos (se aplicável)
 *         maxStorageGb:
 *           type: integer
 *           minimum: 1
 *           nullable: true
 *           description: Armazenamento máximo em GB (se aplicável)
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *
 *     PlanListResponse:
 *       type: object
 *       properties:
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Plan'
 *         pagination:
 *           $ref: '#/components/schemas/Pagination'
 *
 *     PlanResponse:
 *       allOf:
 *         - $ref: '#/components/schemas/SuccessResponse'
 *         - type: object
 *           properties:
 *             data:
 *               $ref: '#/components/schemas/Plan'
 * 
 *     PlanCreate:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           minLength: 3
 *           maxLength: 100
 *           description: Nome do plano
 *           example: "Plano Premium"
 *         description:
 *           type: string
 *           maxLength: 255
 *           description: Descrição detalhada do plano
 *           example: "Plano com recursos avançados"
 *         price:
 *           type: number
 *           format: float
 *           minimum: 0
 *           exclusiveMinimum: true
 *           description: Preço do plano
 *           example: 99.90
 *         currency:
 *           type: string
 *           minLength: 3
 *           maxLength: 3
 *           description: Código da moeda
 *           example: "BRL"
 *         interval:
 *           type: string
 *           enum: [monthly, yearly]
 *           description: Intervalo de cobrança
 *           example: "monthly"
 *         features:
 *           type: array
 *           items:
 *             type: string
 *           description: Lista de recursos
 *           example: ["Usuários ilimitados", "Suporte 24/7"]
 *         isActive:
 *           type: boolean
 *           description: Se o plano está ativo
 *           example: true
 *           default: true
 *         maxUsers:
 *           type: integer
 *           minimum: 1
 *           description: Número máximo de usuários
 *           example: 100
 *         maxStorageGb:
 *           type: integer
 *           minimum: 1
 *           description: Armazenamento máximo em GB
 *           example: 500
 *       required:
 *         - name
 *         - price
 *         - currency
 *         - interval
 * 
 *     PlanUpdate:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           minLength: 3
 *           maxLength: 100
 *           description: Nome do plano
 *           example: "Plano Premium Atualizado"
 *         description:
 *           type: string
 *           maxLength: 255
 *           description: Descrição detalhada do plano
 *           example: "Plano com recursos avançados e atualizados"
 *         price:
 *           type: number
 *           format: float
 *           minimum: 0
 *           exclusiveMinimum: true
 *           description: Preço do plano
 *           example: 109.90
 *         currency:
 *           type: string
 *           minLength: 3
 *           maxLength: 3
 *           description: Código da moeda
 *           example: "BRL"
 *         interval:
 *           type: string
 *           enum: [monthly, yearly]
 *           description: Intervalo de cobrança
 *           example: "yearly"
 *         features:
 *           type: array
 *           items:
 *             type: string
 *           description: Lista de recursos
 *           example: ["Usuários ilimitados", "Suporte 24/7", "API Access"]
 *         isActive:
 *           type: boolean
 *           description: Se o plano está ativo
 *           example: true
 *         maxUsers:
 *           type: integer
 *           minimum: 1
 *           description: Número máximo de usuários
 *           example: 200
 *         maxStorageGb:
 *           type: integer
 *           minimum: 1
 *           description: Armazenamento máximo em GB
 *           example: 1000
 */

import Joi from 'joi';

// Schema para criação de plano
export const createPlanSchema = Joi.object({
  name: Joi.string().min(3).max(100).required()
    .description('Nome do plano (3-100 caracteres)'),
  description: Joi.string().max(255).optional().allow(null, '')
    .description('Descrição detalhada do plano'),
  price: Joi.number().positive().precision(2).required()
    .description('Preço do plano (maior que zero)'),
  currency: Joi.string().length(3).required()
    .description('Código da moeda (3 caracteres, ex: BRL, USD)'),
  interval: Joi.string().valid('monthly', 'yearly').required()
    .description('Intervalo de cobrança (monthly/yearly)'),
  features: Joi.array().items(Joi.string()).optional().default([])
    .description('Lista de recursos incluídos no plano'),
  is_active: Joi.boolean().default(true)
    .description('Se o plano está ativo para contratação'),
  max_users: Joi.number().integer().positive().optional()
    .description('Número máximo de usuários permitidos'),
  max_storage_gb: Joi.number().integer().positive().optional()
    .description('Armazenamento máximo em GB')
});

// Schema para atualização de plano
export const updatePlanSchema = Joi.object({
  name: Joi.string().min(3).max(100)
    .description('Nome do plano (3-100 caracteres)'),
  description: Joi.string().max(255).optional().allow(null, '')
    .description('Descrição detalhada do plano'),
  price: Joi.number().positive().precision(2)
    .description('Preço do plano (maior que zero)'),
  currency: Joi.string().length(3)
    .description('Código da moeda (3 caracteres, ex: BRL, USD)'),
  interval: Joi.string().valid('monthly', 'yearly')
    .description('Intervalo de cobrança (monthly/yearly)'),
  features: Joi.array().items(Joi.string())
    .description('Lista de recursos incluídos no plano'),
  is_active: Joi.boolean()
    .description('Se o plano está ativo para contratação'),
  max_users: Joi.number().integer().positive()
    .description('Número máximo de usuários permitidos'),
  max_storage_gb: Joi.number().integer().positive()
    .description('Armazenamento máximo em GB')
}).min(1);

// Schema para listagem de planos
export const listPlansSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1)
    .description('Número da página'),
  limit: Joi.number().integer().min(1).max(100).default(10)
    .description('Quantidade de itens por página'),
  search: Joi.string().max(255).optional()
    .description('Termo de busca pelo nome ou descrição'),
  interval: Joi.string().valid('monthly', 'yearly').optional()
    .description('Filtrar por intervalo de cobrança'),
  is_active: Joi.boolean().optional()
    .description('Filtrar por status de ativação'),
  minPrice: Joi.number().positive().precision(2).optional()
    .description('Preço mínimo para filtro'),
  maxPrice: Joi.number().positive().precision(2).optional()
    .description('Preço máximo para filtro')
});

// Schema para obtenção de plano por ID
export const getPlanSchema = Joi.object({
  id: Joi.number().integer().positive().required()
    .description('ID do plano')
});

// Schema para exclusão de plano
export const deletePlanSchema = Joi.object({
  id: Joi.number().integer().positive().required()
    .description('ID do plano a ser excluído')
});

// Schema para obtenção de plano por nome
export const getPlanByNameSchema = Joi.object({
  name: Joi.string().min(3).max(100).required()
    .description('Nome do plano')
});

// Schema para listagem de planos ativos
export const getActivePlansSchema = Joi.object({
  interval: Joi.string().valid('monthly', 'yearly').optional()
    .description('Filtrar por intervalo de cobrança')
});
