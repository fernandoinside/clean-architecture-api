import Joi from 'joi';

export const createSettingSchema = Joi.object({
  key: Joi.string().min(3).max(100).required(),
  value: Joi.string().max(1000).optional(),
  type: Joi.string().valid('string', 'number', 'boolean', 'json').default('string'),
  description: Joi.string().max(500).optional(),
  isPublic: Joi.boolean().default(false)
});

export const updateSettingSchema = Joi.object({
  value: Joi.string().max(1000).optional(),
  type: Joi.string().valid('string', 'number', 'boolean', 'json').optional(),
  description: Joi.string().max(500).optional(),
  isPublic: Joi.boolean().optional()
});

export const listSettingsSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().max(100).optional(),
  type: Joi.string().valid('string', 'number', 'boolean', 'json').optional(),
  isPublic: Joi.boolean().optional()
});

export const getSettingSchema = Joi.object({
  id: Joi.number().integer().positive().required()
});

export const deleteSettingSchema = Joi.object({
  id: Joi.number().integer().positive().required()
});

export const getSettingByKeySchema = Joi.object({
  key: Joi.string().min(3).max(100).required()
});

export const getPublicSettingsSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10)
});

/**
 * @swagger
 * components:
 *   schemas:
 *     Setting:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: ID único da configuração
 *           example: 1
 *         key:
 *           type: string
 *           description: Chave da configuração
 *           example: "app_name"
 *         value:
 *           type: string
 *           description: Valor da configuração
 *           example: "SRM Gestão"
 *         type:
 *           type: string
 *           enum: [string, number, boolean, json]
 *           description: Tipo do valor
 *           example: "string"
 *         description:
 *           type: string
 *           description: Descrição da configuração
 *           example: "Nome da aplicação"
 *         is_public:
 *           type: boolean
 *           description: Se a configuração é pública
 *           example: true
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Data de criação
 *           example: "2025-08-22T10:30:00Z"
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: Data da última atualização
 *           example: "2025-08-22T10:30:00Z"
 *         deleted_at:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           description: Data de exclusão (soft delete)
 *           example: null
 *       required:
 *         - id
 *         - key
 *         - value
 *         - type
 *         - is_public
 *         - created_at
 *         - updated_at
 * 
 *     SettingCreate:
 *       type: object
 *       properties:
 *         key:
 *           type: string
 *           description: Chave da configuração
 *           example: "app_theme"
 *           minLength: 3
 *           maxLength: 100
 *         value:
 *           type: string
 *           description: Valor da configuração
 *           example: "dark"
 *           maxLength: 1000
 *         type:
 *           type: string
 *           enum: [string, number, boolean, json]
 *           description: Tipo do valor
 *           example: "string"
 *           default: "string"
 *         description:
 *           type: string
 *           description: Descrição da configuração
 *           example: "Tema da aplicação"
 *           maxLength: 500
 *         is_public:
 *           type: boolean
 *           description: Se a configuração é pública
 *           example: true
 *           default: false
 *       required:
 *         - key
 *         - value
 * 
 *     SettingUpdate:
 *       type: object
 *       properties:
 *         value:
 *           type: string
 *           description: Valor da configuração
 *           example: "light"
 *           maxLength: 1000
 *         type:
 *           type: string
 *           enum: [string, number, boolean, json]
 *           description: Tipo do valor
 *           example: "string"
 *         description:
 *           type: string
 *           description: Descrição da configuração
 *           example: "Tema da aplicação (atualizado)"
 *           maxLength: 500
 *         is_public:
 *           type: boolean
 *           description: Se a configuração é pública
 *           example: false
 * 
 *     SettingResponse:
 *       allOf:
 *         - $ref: '#/components/schemas/SuccessResponse'
 *         - type: object
 *           properties:
 *             data:
 *               $ref: '#/components/schemas/Setting'
 * 
 *     SettingListResponse:
 *       allOf:
 *         - $ref: '#/components/schemas/SuccessResponse'
 *         - type: object
 *           properties:
 *             data:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Setting'
 *             meta:
 *               $ref: '#/components/schemas/Pagination'
 */
