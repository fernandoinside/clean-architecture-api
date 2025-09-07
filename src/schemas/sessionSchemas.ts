import Joi from 'joi';

export const createSessionSchema = Joi.object({
  userId: Joi.number().integer().positive().required(),
  token: Joi.string().min(32).max(255).required(),
  expiresAt: Joi.date().required(),
  isActive: Joi.boolean().default(true)
});

export const updateSessionSchema = Joi.object({
  token: Joi.string().min(32).max(255).optional(),
  expiresAt: Joi.date().optional(),
  isActive: Joi.boolean().optional()
});

export const listSessionsSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  userId: Joi.number().integer().positive().optional(),
  isActive: Joi.boolean().optional()
});

export const getSessionSchema = Joi.object({
  id: Joi.number().integer().positive().required()
});

export const deleteSessionSchema = Joi.object({
  id: Joi.number().integer().positive().required()
});

export const getSessionsByUserSchema = Joi.object({
  userId: Joi.number().integer().positive().required(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10)
});

export const getSessionByTokenSchema = Joi.object({
  token: Joi.string().min(32).max(255).required()
});

export const deactivateSessionSchema = Joi.object({
  id: Joi.number().integer().positive().required()
});

/**
 * @swagger
 * components:
 *   schemas:
 *     Session:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: ID único da sessão
 *           example: 1
 *         user_id:
 *           type: integer
 *           description: ID do usuário
 *           example: 1
 *         token:
 *           type: string
 *           description: Token de sessão
 *           example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *         ip_address:
 *           type: string
 *           description: Endereço IP da sessão
 *           example: "192.168.1.100"
 *         user_agent:
 *           type: string
 *           description: User agent do navegador
 *           example: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
 *         is_active:
 *           type: boolean
 *           description: Status da sessão
 *           example: true
 *         last_activity:
 *           type: string
 *           format: date-time
 *           description: Última atividade
 *           example: "2025-08-22T10:30:00Z"
 *         expires_at:
 *           type: string
 *           format: date-time
 *           description: Data de expiração
 *           example: "2025-08-23T10:30:00Z"
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
 *         - user_id
 *         - token
 *         - ip_address
 *         - is_active
 *         - created_at
 *         - updated_at
 * 
 *     SessionCreate:
 *       type: object
 *       properties:
 *         user_id:
 *           type: integer
 *           description: ID do usuário
 *           example: 1
 *         token:
 *           type: string
 *           description: Token de sessão
 *           example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *         ip_address:
 *           type: string
 *           description: Endereço IP da sessão
 *           example: "192.168.1.100"
 *         user_agent:
 *           type: string
 *           description: User agent do navegador
 *           example: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
 *         expires_at:
 *           type: string
 *           format: date-time
 *           description: Data de expiração
 *           example: "2025-08-23T10:30:00Z"
 *       required:
 *         - user_id
 *         - token
 *         - ip_address
 * 
 *     SessionUpdate:
 *       type: object
 *       properties:
 *         is_active:
 *           type: boolean
 *           description: Status da sessão
 *           example: false
 *         last_activity:
 *           type: string
 *           format: date-time
 *           description: Última atividade
 *           example: "2025-08-22T10:30:00Z"
 *         expires_at:
 *           type: string
 *           format: date-time
 *           description: Data de expiração
 *           example: "2025-08-23T10:30:00Z"
 * 
 *     SessionResponse:
 *       allOf:
 *         - $ref: '#/components/schemas/SuccessResponse'
 *         - type: object
 *           properties:
 *             data:
 *               $ref: '#/components/schemas/Session'
 * 
 *     SessionListResponse:
 *       allOf:
 *         - $ref: '#/components/schemas/SuccessResponse'
 *         - type: object
 *           properties:
 *             data:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Session'
 *             meta:
 *               $ref: '#/components/schemas/Pagination'
 */
