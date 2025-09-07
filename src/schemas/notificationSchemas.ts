import Joi from 'joi';

export const createNotificationSchema = Joi.object({
  user_id: Joi.number().integer().positive().required(),
  title: Joi.string().min(3).max(255).required(),
  message: Joi.string().min(3).max(1000).required(),
  type: Joi.string().valid('system', 'alert', 'info').default('info'),
  is_read: Joi.boolean().default(false)
});

export const updateNotificationSchema = Joi.object({
  title: Joi.string().min(3).max(255).optional(),
  message: Joi.string().min(3).max(1000).optional(),
  type: Joi.string().valid('system', 'alert', 'info').optional(),
  is_read: Joi.boolean().optional()
});

export const listNotificationsSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  user_id: Joi.number().integer().positive().optional(),
  title: Joi.string().optional(),
  type: Joi.string().valid('system', 'alert', 'info').optional(),
  is_read: Joi.boolean().optional()
});

export const getNotificationSchema = Joi.object({
  id: Joi.number().integer().positive().required()
});

export const deleteNotificationSchema = Joi.object({
  id: Joi.number().integer().positive().required()
});

export const getNotificationsByUserSchema = Joi.object({
  user_id: Joi.number().integer().positive().required(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10)
});

export const markAsReadSchema = Joi.object({
  id: Joi.number().integer().positive().required()
});

export const markAllAsReadSchema = Joi.object({
  user_id: Joi.number().integer().positive().required()
});

/**
 * @swagger
 * components:
 *   schemas:
 *     NotificationCreate:
 *       type: object
 *       required:
 *         - user_id
 *         - title
 *         - message
 *       properties:
 *         user_id:
 *           type: number
 *           description: ID do usuário que receberá a notificação
 *           example: 1
 *         title:
 *           type: string
 *           minLength: 3
 *           maxLength: 255
 *           description: Título da notificação
 *           example: "Fatura Vencendo"
 *         message:
 *           type: string
 *           minLength: 3
 *           maxLength: 1000
 *           description: Conteúdo da mensagem da notificação
 *           example: "Sua fatura está vencendo em 3 dias."
 *         type:
 *           type: string
 *           enum: [system, alert, info]
 *           description: Tipo da notificação
 *           example: alert
 *         is_read:
 *           type: boolean
 *           description: Status de leitura da notificação
 *           default: false
 *           example: false
 *
 *     NotificationUpdate:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *           minLength: 3
 *           maxLength: 255
 *           description: Título da notificação
 *           example: "Título Atualizado"
 *         message:
 *           type: string
 *           minLength: 3
 *           maxLength: 1000
 *           description: Conteúdo da mensagem da notificação
 *           example: "Mensagem atualizada"
 *         type:
 *           type: string
 *           enum: [system, alert, info]
 *           description: Tipo da notificação
 *           example: info
 *         is_read:
 *           type: boolean
 *           description: Status de leitura da notificação
 *           example: true
 *
 *     NotificationResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           type: object
 *           properties:
 *             id:
 *               type: number
 *               description: ID único da notificação
 *               example: 1
 *             user_id:
 *               type: number
 *               description: ID do usuário que recebeu a notificação
 *               example: 1
 *             title:
 *               type: string
 *               description: Título da notificação
 *               example: "Fatura Vencendo"
 *             message:
 *               type: string
 *               description: Conteúdo da mensagem da notificação
 *               example: "Sua fatura está vencendo em 3 dias."
 *             type:
 *               type: string
 *               enum: [system, alert, info]
 *               description: Tipo da notificação
 *               example: alert
 *             is_read:
 *               type: boolean
 *               description: Status de leitura da notificação
 *               example: false
 *             created_at:
 *               type: string
 *               format: date-time
 *               description: Data e hora de criação
 *               example: "2024-01-15T10:30:00Z"
 *             updated_at:
 *               type: string
 *               format: date-time
 *               description: Data e hora da última atualização
 *               example: "2024-01-15T10:30:00Z"
 *
 *     NotificationListResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               id:
 *                 type: number
 *                 example: 1
 *               user_id:
 *                 type: number
 *                 example: 1
 *               title:
 *                 type: string
 *                 example: "Fatura Vencendo"
 *               message:
 *                 type: string
 *                 example: "Sua fatura está vencendo em 3 dias."
 *               type:
 *                 type: string
 *                 enum: [system, alert, info]
 *                 example: alert
 *               is_read:
 *                 type: boolean
 *                 example: false
 *               created_at:
 *                 type: string
 *                 format: date-time
 *                 example: "2024-01-15T10:30:00Z"
 *               updated_at:
 *                 type: string
 *                 format: date-time
 *                 example: "2024-01-15T10:30:00Z"
 *         pagination:
 *           $ref: '#/components/schemas/Pagination'
 */
