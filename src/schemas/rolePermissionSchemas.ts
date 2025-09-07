import Joi from 'joi';

/**
 * @swagger
 * components:
 *   schemas:
 *     RolePermission:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: ID único da associação
 *           example: 1
 *         role_id:
 *           type: integer
 *           description: ID do papel
 *           example: 1
 *         permission_id:
 *           type: integer
 *           description: ID da permissão
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
 *         - role_id
 *         - permission_id
 *         - created_at
 *         - updated_at
 * 
 *     RolePermissionDetailed:
 *       allOf:
 *         - $ref: '#/components/schemas/RolePermission'
 *         - type: object
 *           properties:
 *             role_name:
 *               type: string
 *               description: Nome do papel
 *               example: "admin"
 *             role_description:
 *               type: string
 *               description: Descrição do papel
 *               example: "Administrador do sistema"
 *             permission_name:
 *               type: string
 *               description: Nome da permissão
 *               example: "users.read"
 *             permission_resource:
 *               type: string
 *               description: Recurso da permissão
 *               example: "users"
 *             permission_action:
 *               type: string
 *               description: Ação da permissão
 *               example: "read"
 *             permission_description:
 *               type: string
 *               description: Descrição da permissão
 *               example: "Visualizar usuários"
 * 
 *     RolePermissionCreate:
 *       type: object
 *       properties:
 *         role_id:
 *           type: integer
 *           description: ID do papel
 *           example: 1
 *         permission_id:
 *           type: integer
 *           description: ID da permissão
 *           example: 2
 *       required:
 *         - role_id
 *         - permission_id
 * 
 *     RolePermissionSetPermissions:
 *       type: object
 *       properties:
 *         permission_ids:
 *           type: array
 *           items:
 *             type: integer
 *           description: Array com IDs das permissões
 *           example: [1, 2, 3]
 *       required:
 *         - permission_ids
 * 
 *     RolePermissionResponse:
 *       allOf:
 *         - $ref: '#/components/schemas/SuccessResponse'
 *         - type: object
 *           properties:
 *             data:
 *               $ref: '#/components/schemas/RolePermission'
 * 
 *     RolePermissionListResponse:
 *       allOf:
 *         - $ref: '#/components/schemas/SuccessResponse'
 *         - type: object
 *           properties:
 *             data:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/RolePermissionDetailed'
 *             meta:
 *               $ref: '#/components/schemas/Pagination'
 */

// Validações Joi para RolePermission
export const createRolePermissionSchema = Joi.object({
  role_id: Joi.number().integer().positive().required()
    .messages({
      'number.base': 'Role ID deve ser um número',
      'number.integer': 'Role ID deve ser um número inteiro',
      'number.positive': 'Role ID deve ser um número positivo',
      'any.required': 'Role ID é obrigatório'
    }),
  permission_id: Joi.number().integer().positive().required()
    .messages({
      'number.base': 'Permission ID deve ser um número',
      'number.integer': 'Permission ID deve ser um número inteiro',
      'number.positive': 'Permission ID deve ser um número positivo',
      'any.required': 'Permission ID é obrigatório'
    })
});

export const setRolePermissionsSchema = Joi.object({
  permission_ids: Joi.array().items(
    Joi.number().integer().positive()
  ).required()
    .messages({
      'array.base': 'Permission IDs deve ser um array',
      'any.required': 'Permission IDs é obrigatório'
    })
});

export const getRolePermissionsSchema = Joi.object({
  roleId: Joi.number().integer().positive().required()
    .messages({
      'number.base': 'Role ID deve ser um número',
      'number.integer': 'Role ID deve ser um número inteiro',
      'number.positive': 'Role ID deve ser um número positivo',
      'any.required': 'Role ID é obrigatório'
    })
});

export const getPermissionRolesSchema = Joi.object({
  permissionId: Joi.number().integer().positive().required()
    .messages({
      'number.base': 'Permission ID deve ser um número',
      'number.integer': 'Permission ID deve ser um número inteiro',
      'number.positive': 'Permission ID deve ser um número positivo',
      'any.required': 'Permission ID é obrigatório'
    })
});