import Joi from 'joi';

export const createSubscriptionSchema = Joi.object({
  // Either company_id OR customer_id is required, but not both
  company_id: Joi.number().integer().positive().optional(),
  customer_id: Joi.number().integer().positive().optional(),
  plan_id: Joi.number().integer().positive().required(),
  current_period_start: Joi.date().iso().required(),
  current_period_end: Joi.date().iso().required(),
  status: Joi.string()
    .valid('active', 'inactive', 'cancelled', 'pending')
    .default('active'),
  stripe_subscription_id: Joi.string().optional().allow(null),
  stripe_customer_id: Joi.string().optional().allow(null),
  trial_start: Joi.date().iso().optional().allow(null),
  trial_end: Joi.date().iso().optional().allow(null),
  auto_renew: Joi.boolean().default(true),
  is_trial: Joi.boolean().default(false),
}).xor('company_id', 'customer_id'); // Exactly one of these must be provided

export const updateSubscriptionSchema = Joi.object({
  plan_id: Joi.number().integer().positive().optional(),
  current_period_start: Joi.date().iso().optional(),
  current_period_end: Joi.date().iso().optional(),
  status: Joi.string()
    .valid('active', 'inactive', 'cancelled', 'pending')
    .optional(),
  stripe_subscription_id: Joi.string().optional().allow(null),
  stripe_customer_id: Joi.string().optional().allow(null),
  trial_start: Joi.date().iso().optional().allow(null),
  trial_end: Joi.date().iso().optional().allow(null),
  auto_renew: Joi.boolean().optional(),
  is_trial: Joi.boolean().optional(),
  canceled_at: Joi.date().iso().optional().allow(null),
  ended_at: Joi.date().iso().optional().allow(null),
});

export const listSubscriptionsSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  company_id: Joi.number().integer().positive().optional(),
  customer_id: Joi.number().integer().positive().optional(),
  plan_id: Joi.number().integer().positive().optional(),
  status: Joi.string()
    .valid('active', 'inactive', 'cancelled', 'pending')
    .optional(),
  auto_renew: Joi.boolean().optional(),
});

export const getSubscriptionSchema = Joi.object({
  id: Joi.number().integer().positive().required(),
});

export const deleteSubscriptionSchema = Joi.object({
  id: Joi.number().integer().positive().required(),
});

export const getSubscriptionsByCompanySchema = Joi.object({
  company_id: Joi.number().integer().positive().required(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
});

export const cancelSubscriptionSchema = Joi.object({
  id: Joi.number().integer().positive().required(),
  reason: Joi.string().max(500).optional(),
});

export const renewSubscriptionSchema = Joi.object({
  id: Joi.number().integer().positive().required(),
  auto_renew: Joi.boolean().default(true),
});

/**
 * @swagger
 * components:
 *   schemas:
 *     SubscriptionCreate:
 *       type: object
 *       required:
 *         - company_id
 *         - plan_id
 *         - current_period_start
 *         - current_period_end
 *       properties:
 *         company_id:
 *           type: integer
 *           format: int64
 *           description: 'ID da empresa'
 *         plan_id:
 *           type: integer
 *           format: int64
 *           description: 'ID do plano'
 *         current_period_start:
 *           type: string
 *           format: date-time
 *           description: 'Data de início do período atual'
 *         current_period_end:
 *           type: string
 *           format: date-time
 *           description: 'Data de fim do período atual'
 *         status:
 *           type: string
 *           enum: [active, inactive, cancelled, pending]
 *           default: 'active'
 *           description: 'Status da assinatura'
 *         stripe_subscription_id:
 *           type: string
 *           nullable: true
 *           description: 'ID da assinatura no Stripe'
 *         stripe_customer_id:
 *           type: string
 *           nullable: true
 *           description: 'ID do cliente no Stripe'
 *         trial_start:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           description: 'Data de início do período de trial'
 *         trial_end:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           description: 'Data de fim do período de trial'
 *         auto_renew:
 *           type: boolean
 *           default: true
 *           description: 'Se a assinatura deve renovar automaticamente'
 *         is_trial:
 *           type: boolean
 *           default: false
 *           description: 'Se a assinatura está em período de trial'
 *
 *     SubscriptionResponse:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           format: int64
 *           description: 'ID da assinatura'
 *         companyId:
 *           type: integer
 *           format: int64
 *           description: 'ID da empresa'
 *         planId:
 *           type: integer
 *           format: int64
 *           description: 'ID do plano'
 *         startDate:
 *           type: string
 *           format: date
 *           description: 'Data de início da assinatura'
 *         endDate:
 *           type: string
 *           format: date
 *           nullable: true
 *           description: 'Data de término da assinatura'
 *         status:
 *           type: string
 *           enum: [active, canceled, expired, trial]
 *           description: 'Status da assinatura'
 *         autoRenew:
 *           type: boolean
 *           description: 'Se a assinatura deve renovar automaticamente'
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: 'Data de criação do registro'
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: 'Data da última atualização'
 *
 *     SubscriptionListResponse:
 *       type: object
 *       properties:
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/SubscriptionResponse'
 *         meta:
 *           type: object
 *           properties:
 *             total:
 *               type: integer
 *               description: 'Total de itens encontrados'
 *             page:
 *               type: integer
 *               description: 'Página atual'
 *             limit:
 *               type: integer
 *               description: 'Itens por página'
 *
 *     SubscriptionUpdate:
 *       type: object
 *       properties:
 *         planId:
 *           type: integer
 *           format: int64
 *           description: 'Novo ID do plano (opcional)'
 *         endDate:
 *           type: string
 *           format: date
 *           description: 'Nova data de término (opcional)'
 *         status:
 *           type: string
 *           enum: [active, canceled, expired, trial]
 *           description: 'Novo status (opcional)'
 *         autoRenew:
 *           type: boolean
 *           description: 'Se a assinatura deve renovar automaticamente (opcional)'
 */
