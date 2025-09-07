/**
 * @swagger
 * components:
 *   schemas:
 *     Permission:
 *       type: object
 *       required:
 *         - id
 *         - name
 *         - resource
 *         - action
 *         - created_at
 *         - updated_at
 *       properties:
 *         id:
 *           type: integer
 *           format: int64
 *           description: Identificador único da permissão
 *           example: 1
 *         name:
 *           type: string
 *           minLength: 3
 *           maxLength: 100
 *           description: Nome único da permissão
 *           example: "users.read"
 *         resource:
 *           type: string
 *           minLength: 3
 *           maxLength: 100
 *           description: Recurso ao qual a permissão se aplica
 *           example: "users"
 *         action:
 *           type: string
 *           minLength: 3
 *           maxLength: 100
 *           description: Ação permitida no recurso
 *           example: "read"
 *         description:
 *           type: string
 *           maxLength: 255
 *           nullable: true
 *           description: Descrição detalhada da permissão
 *           example: "Visualizar usuários do sistema"
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Data de criação do registro
 *           readOnly: true
 *           example: "2024-01-15T10:30:00Z"
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: Data da última atualização do registro
 *           readOnly: true
 *           example: "2024-01-15T15:45:00Z"
 *
 *     PermissionCreate:
 *       type: object
 *       required:
 *         - name
 *         - resource
 *         - action
 *       properties:
 *         name:
 *           type: string
 *           minLength: 3
 *           maxLength: 100
 *           description: Nome único da permissão
 *           example: "customers.write"
 *         resource:
 *           type: string
 *           minLength: 3
 *           maxLength: 100
 *           description: Recurso ao qual a permissão se aplica
 *           example: "customers"
 *         action:
 *           type: string
 *           minLength: 3
 *           maxLength: 100
 *           description: Ação permitida no recurso
 *           example: "write"
 *         description:
 *           type: string
 *           maxLength: 255
 *           nullable: true
 *           description: Descrição detalhada da permissão (opcional)
 *           example: "Criar e editar clientes"
 *
 *     PermissionUpdate:
 *       type: object
 *       minProperties: 1
 *       properties:
 *         name:
 *           type: string
 *           minLength: 3
 *           maxLength: 100
 *           description: Nome único da permissão
 *           example: "customers.manage"
 *         resource:
 *           type: string
 *           minLength: 3
 *           maxLength: 100
 *           description: Recurso ao qual a permissão se aplica
 *           example: "customers"
 *         action:
 *           type: string
 *           minLength: 3
 *           maxLength: 100
 *           description: Ação permitida no recurso
 *           example: "manage"
 *         description:
 *           type: string
 *           maxLength: 255
 *           nullable: true
 *           description: Descrição detalhada da permissão (opcional)
 *           example: "Gerenciar todos os aspectos dos clientes"
 *
 *     PermissionListResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Permission'
 *         meta:
 *           type: object
 *           properties:
 *             total:
 *               type: integer
 *               description: Total de itens encontrados
 *               example: 50
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
 *               example: 5
 *       example:
 *         success: true
 *         data:
 *           - id: 1
 *             name: "users.read"
 *             resource: "users"
 *             action: "read"
 *             description: "Visualizar usuários"
 *             created_at: "2024-01-15T10:30:00Z"
 *             updated_at: "2024-01-15T10:30:00Z"
 *           - id: 2
 *             name: "users.write"
 *             resource: "users"
 *             action: "write"
 *             description: "Criar e editar usuários"
 *             created_at: "2024-01-15T10:30:00Z"
 *             updated_at: "2024-01-15T10:30:00Z"
 *         meta:
 *           total: 50
 *           page: 1
 *           limit: 10
 *           totalPages: 5
 *
 *     PermissionResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           $ref: '#/components/schemas/Permission'
 *       example:
 *         success: true
 *         data:
 *           id: 1
 *           name: "users.read"
 *           resource: "users"
 *           action: "read"
 *           description: "Visualizar usuários do sistema"
 *           created_at: "2024-01-15T10:30:00Z"
 *           updated_at: "2024-01-15T10:30:00Z"
 */

import Joi from 'joi';

// Validações Joi para Permissions
export const createPermissionSchema = Joi.object({
  name: Joi.string().max(100).required(),
  resource: Joi.string().max(100).required(),
  action: Joi.string().max(100).required(),
  description: Joi.string().max(255).optional().allow(null, ''),
});

export const updatePermissionSchema = Joi.object({
  name: Joi.string().max(100),
  resource: Joi.string().max(100),
  action: Joi.string().max(100),
  description: Joi.string().max(255).optional().allow(null, ''),
}).min(1);
