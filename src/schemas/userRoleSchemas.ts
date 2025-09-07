import Joi from 'joi';

/**
 * @swagger
 * components:
 *   schemas:
 *     UserRole:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: ID único da associação
 *           example: 1
 *         user_id:
 *           type: integer
 *           description: ID do usuário
 *           example: 1
 *         role_id:
 *           type: integer
 *           description: ID do papel
 *           example: 2
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
 *         - role_id
 *         - created_at
 *         - updated_at
 * 
 *     UserRoleDetailed:
 *       allOf:
 *         - $ref: '#/components/schemas/UserRole'
 *         - type: object
 *           properties:
 *             user_name:
 *               type: string
 *               description: Nome do usuário
 *               example: "admin"
 *             user_email:
 *               type: string
 *               description: Email do usuário
 *               example: "admin@example.com"
 *             role_name:
 *               type: string
 *               description: Nome do papel
 *               example: "admin"
 *             role_description:
 *               type: string
 *               description: Descrição do papel
 *               example: "Administrador do sistema"
 * 
 *     UserRoleCreate:
 *       type: object
 *       properties:
 *         user_id:
 *           type: integer
 *           description: ID do usuário
 *           example: 1
 *         role_id:
 *           type: integer
 *           description: ID do papel
 *           example: 2
 *       required:
 *         - user_id
 *         - role_id
 * 
 *     UserRoleSetRoles:
 *       type: object
 *       properties:
 *         role_ids:
 *           type: array
 *           items:
 *             type: integer
 *           description: Array com IDs dos papéis
 *           example: [1, 2, 3]
 *       required:
 *         - role_ids
 * 
 *     UserRoleResponse:
 *       allOf:
 *         - $ref: '#/components/schemas/SuccessResponse'
 *         - type: object
 *           properties:
 *             data:
 *               $ref: '#/components/schemas/UserRole'
 * 
 *     UserRoleListResponse:
 *       allOf:
 *         - $ref: '#/components/schemas/SuccessResponse'
 *         - type: object
 *           properties:
 *             data:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/UserRoleDetailed'
 *             meta:
 *               $ref: '#/components/schemas/Pagination'
 * 
 *     UserRoleDetailedListResponse:
 *       allOf:
 *         - $ref: '#/components/schemas/SuccessResponse'
 *         - type: object
 *           properties:
 *             data:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/UserRoleDetailed'
 */

// Validações Joi para UserRole
export const createUserRoleSchema = Joi.object({
  user_id: Joi.number().integer().positive().required()
    .messages({
      'number.base': 'User ID deve ser um número',
      'number.integer': 'User ID deve ser um número inteiro',
      'number.positive': 'User ID deve ser um número positivo',
      'any.required': 'User ID é obrigatório'
    }),
  role_id: Joi.number().integer().positive().required()
    .messages({
      'number.base': 'Role ID deve ser um número',
      'number.integer': 'Role ID deve ser um número inteiro',
      'number.positive': 'Role ID deve ser um número positivo',
      'any.required': 'Role ID é obrigatório'
    })
});

export const setUserRolesSchema = Joi.object({
  role_ids: Joi.array().items(
    Joi.number().integer().positive()
  ).required()
    .messages({
      'array.base': 'Role IDs deve ser um array',
      'any.required': 'Role IDs é obrigatório'
    })
});

export const getUserRolesSchema = Joi.object({
  userId: Joi.number().integer().positive().required()
    .messages({
      'number.base': 'User ID deve ser um número',
      'number.integer': 'User ID deve ser um número inteiro',
      'number.positive': 'User ID deve ser um número positivo',
      'any.required': 'User ID é obrigatório'
    })
});

export const getRoleUsersSchema = Joi.object({
  roleId: Joi.number().integer().positive().required()
    .messages({
      'number.base': 'Role ID deve ser um número',
      'number.integer': 'Role ID deve ser um número inteiro',
      'number.positive': 'Role ID deve ser um número positivo',
      'any.required': 'Role ID é obrigatório'
    })
});