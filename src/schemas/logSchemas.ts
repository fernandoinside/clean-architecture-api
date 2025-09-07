/**
 * @swagger
 * components:
 *   schemas:
 *     Log:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: ID único do log
 *           example: 1
 *         level:
 *           type: string
 *           enum: [info, warn, error, debug]
 *           description: Nível do log
 *           example: info
 *         message:
 *           type: string
 *           description: Mensagem do log
 *           example: "Usuário logado com sucesso"
 *         meta:
 *           type: object
 *           nullable: true
 *           description: Dados adicionais do log
 *           example: { "user_id": 123, "ip": "192.168.1.1" }
 *         source:
 *           type: string
 *           enum: [frontend, backend]
 *           description: Origem do log
 *           example: backend
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Data de criação
 *           example: "2024-01-01T00:00:00Z"
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: Data da última atualização
 *           example: "2024-01-01T00:00:00Z"
 *
 *     LogCreate:
 *       type: object
 *       required:
 *         - level
 *         - message
 *       properties:
 *         level:
 *           type: string
 *           enum: [info, warn, error, debug]
 *           description: Nível do log
 *           example: info
 *         message:
 *           type: string
 *           description: Mensagem do log
 *           example: "Usuário logado com sucesso"
 *         meta:
 *           type: object
 *           nullable: true
 *           description: Dados adicionais do log
 *           example: { "user_id": 123, "ip": "192.168.1.1" }
 *         source:
 *           type: string
 *           enum: [frontend, backend]
 *           description: Origem do log
 *           default: backend
 *           example: backend
 *
 *     LogUpdate:
 *       type: object
 *       properties:
 *         level:
 *           type: string
 *           enum: [info, warn, error, debug]
 *           description: Nível do log
 *           example: info
 *         message:
 *           type: string
 *           description: Mensagem do log
 *           example: "Usuário logado com sucesso"
 *         meta:
 *           type: object
 *           nullable: true
 *           description: Dados adicionais do log
 *           example: { "user_id": 123, "ip": "192.168.1.1" }
 *         source:
 *           type: string
 *           enum: [frontend, backend]
 *           description: Origem do log
 *           example: backend
 *
 *     LogResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           $ref: '#/components/schemas/Log'
 *
 *     LogListResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Log'
 *         pagination:
 *           type: object
 *           properties:
 *             total:
 *               type: integer
 *               description: Total de registros
 *               example: 100
 *             page:
 *               type: integer
 *               description: Página atual
 *               example: 1
 *             limit:
 *               type: integer
 *               description: Itens por página
 *               example: 10
 *             totalPages:
 *               type: integer
 *               description: Total de páginas
 *               example: 10
 *
 *     LogError:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         error:
 *           type: object
 *           properties:
 *             message:
 *               type: string
 *               example: Mensagem de erro
 *             details:
 *               type: object
 *               example: {}
 */

import Joi from 'joi';

// Validações Joi para Logs
export const createLogSchema = Joi.object({
  level: Joi.string().valid('info', 'warn', 'error', 'debug').required(),
  message: Joi.string().required(),
  meta: Joi.object().optional().allow(null),
  source: Joi.string().valid('frontend', 'backend').default('backend'),
});

export const updateLogSchema = Joi.object({
  level: Joi.string().valid('info', 'warn', 'error', 'debug'),
  message: Joi.string(),
  meta: Joi.object().optional().allow(null),
  source: Joi.string().valid('frontend', 'backend'),
}).min(1);
