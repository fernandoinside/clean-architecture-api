import Joi from 'joi';

export const createPaymentSchema = Joi.object({
  customerId: Joi.number().integer().positive().required(),
  planId: Joi.number().integer().positive().required(),
  amount: Joi.number().positive().precision(2).required(),
  currency: Joi.string().length(3).default('BRL'),
  status: Joi.string().valid('pending', 'paid', 'failed', 'refunded').default('pending'),
  paymentMethod: Joi.string().max(100).required(),
  transactionId: Joi.string().max(255).required()
});

export const updatePaymentSchema = Joi.object({
  amount: Joi.number().positive().precision(2).optional(),
  currency: Joi.string().length(3).optional(),
  status: Joi.string().valid('pending', 'paid', 'failed', 'refunded').optional(),
  paymentMethod: Joi.string().max(100).optional(),
  transactionId: Joi.string().max(255).optional()
});

export const listPaymentsSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  customerId: Joi.number().integer().positive().optional(),
  planId: Joi.number().integer().positive().optional(),
  status: Joi.string().valid('pending', 'paid', 'failed', 'refunded').optional(),
  paymentMethod: Joi.string().max(100).optional(),
  minAmount: Joi.number().positive().precision(2).optional(),
  maxAmount: Joi.number().positive().precision(2).optional()
});

export const getPaymentSchema = Joi.object({
  id: Joi.number().integer().positive().required()
});

export const deletePaymentSchema = Joi.object({
  id: Joi.number().integer().positive().required()
});

/**
 * @swagger
 * components:
 *   schemas:
 *     PaginationMeta:
 *       type: object
 *       properties:
 *         total:
 *           type: integer
 *           description: Total de itens
 *         page:
 *           type: integer
 *           description: Página atual
 *         limit:
 *           type: integer
 *           description: Itens por página
 *         totalPages:
 *           type: integer
 *           description: Total de páginas
 *
 *     PaymentCreate:
 *       type: object
 *       required:
 *         - customerId
 *         - planId
 *         - amount
 *         - paymentMethod
 *         - transactionId
 *       properties:
 *         customerId:
 *           type: integer
 *           format: int64
 *           description: 'ID do cliente'
 *         planId:
 *           type: integer
 *           format: int64
 *           description: 'ID do plano'
 *         amount:
 *           type: number
 *           format: double
 *           description: 'Valor do pagamento'
 *         currency:
 *           type: string
 *           default: 'BRL'
 *           description: 'Moeda do pagamento (padrão: BRL)'
 *         status:
 *           type: string
 *           enum: [pending, paid, failed, refunded]
 *           default: 'pending'
 *           description: 'Status do pagamento'
 *         paymentMethod:
 *           type: string
 *           maxLength: 100
 *           description: 'Método de pagamento utilizado'
 *         transactionId:
 *           type: string
 *           maxLength: 255
 *           description: 'ID da transação no gateway de pagamento'
 *
 *     PaymentResponse:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           format: int64
 *           description: ID único do pagamento
 *         customerId:
 *           type: integer
 *           format: int64
 *           description: ID do cliente associado ao pagamento
 *         planId:
 *           type: integer
 *           format: int64
 *           description: ID do plano associado ao pagamento
 *         amount:
 *           type: number
 *           format: double
 *           description: Valor do pagamento
 *         currency:
 *           type: string
 *           default: 'BRL'
 *           description: 'Moeda do pagamento (padrão: BRL)'
 *         status:
 *           type: string
 *           enum: [pending, paid, failed, refunded]
 *           default: 'pending'
 *           description: Status do pagamento
 *         paymentMethod:
 *           type: string
 *           maxLength: 100
 *           description: Método de pagamento utilizado
 *         transactionId:
 *           type: string
 *           maxLength: 255
 *           description: ID da transação no gateway de pagamento
 *         paidAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           description: Data e hora em que o pagamento foi confirmado
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Data de criação do registro
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Data da última atualização
 *
 *     PaymentListResponse:
 *       type: object
 *       properties:
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/PaymentResponse'
 *         meta:
 *           $ref: '#/components/schemas/PaginationMeta'
 *
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         message:
 *           type: string
 *           description: Mensagem de erro
 *         errors:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               field:
 *                 type: string
 *               message:
 *                 type: string
 *
 *     PaymentUpdate:
 *       type: object
 *       properties:
 *         amount:
 *           type: number
 *           format: double
 *           description: Novo valor do pagamento
 *         currency:
 *           type: string
 *           default: 'BRL'
 *           description: 'Nova moeda do pagamento (padrão: BRL)'
 *         status:
 *           type: string
 *           enum: [pending, paid, failed, refunded]
 *           description: Novo status do pagamento
 *         paymentMethod:
 *           type: string
 *           maxLength: 100
 *           description: Novo método de pagamento
 *         transactionId:
 *           type: string
 *           maxLength: 255
 *           description: Novo ID da transação no gateway de pagamento
 */

export const getPaymentsByCustomerSchema = Joi.object({
  customerId: Joi.number().integer().positive().required(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10)
});

export const getPaymentsByPlanSchema = Joi.object({
  planId: Joi.number().integer().positive().required(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10)
});

export const updatePaymentStatusSchema = Joi.object({
  id: Joi.number().integer().positive().required(),
  status: Joi.string().valid('pending', 'paid', 'failed', 'refunded').required()
});
