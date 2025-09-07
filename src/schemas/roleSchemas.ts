import Joi from 'joi';

export const createRoleSchema = Joi.object({
  name: Joi.string().min(3).max(100).required(),
  description: Joi.string().max(500).optional()
});

export const updateRoleSchema = Joi.object({
  name: Joi.string().min(3).max(100).optional(),
  description: Joi.string().max(500).optional()
});

export const listRolesSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().max(100).optional()
});

export const getRoleSchema = Joi.object({
  id: Joi.number().integer().positive().required()
});

export const deleteRoleSchema = Joi.object({
  id: Joi.number().integer().positive().required()
});

export const getRoleByNameSchema = Joi.object({
  name: Joi.string().min(3).max(100).required()
});

export const assignPermissionsToRoleSchema = Joi.object({
  roleId: Joi.number().integer().positive().required(),
  permissionIds: Joi.array().items(Joi.number().integer().positive()).min(1).required()
});

/**
 * @swagger
 * components:
 *   schemas:
 *     Role:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: ID único do papel
 *           example: 1
 *         name:
 *           type: string
 *           description: Nome do papel
 *           example: "admin"
 *         description:
 *           type: string
 *           description: Descrição do papel
 *           example: "Administrador do sistema com acesso total"
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
 *         - name
 *         - description
 *         - created_at
 *         - updated_at
 * 
 *     RoleCreate:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: Nome do papel
 *           example: "editor"
 *           minLength: 1
 *           maxLength: 50
 *         description:
 *           type: string
 *           description: Descrição do papel
 *           example: "Editor com permissões limitadas"
 *           minLength: 1
 *           maxLength: 255
 *       required:
 *         - name
 *         - description
 * 
 *     RoleUpdate:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: Nome do papel
 *           example: "editor_updated"
 *           minLength: 1
 *           maxLength: 50
 *         description:
 *           type: string
 *           description: Descrição do papel
 *           example: "Editor com permissões atualizadas"
 *           minLength: 1
 *           maxLength: 255
 * 
 *     RoleResponse:
 *       allOf:
 *         - $ref: '#/components/schemas/SuccessResponse'
 *         - type: object
 *           properties:
 *             data:
 *               $ref: '#/components/schemas/Role'
 * 
 *     RoleListResponse:
 *       allOf:
 *         - $ref: '#/components/schemas/SuccessResponse'
 *         - type: object
 *           properties:
 *             data:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Role'
 *             meta:
 *               $ref: '#/components/schemas/Pagination'
 */
