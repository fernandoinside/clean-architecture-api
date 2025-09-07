import BaseRouter from './BaseRouter';
import RolePermissionController from '../controllers/RolePermissionController';
import { createRolePermissionSchema, setRolePermissionsSchema } from '../schemas/rolePermissionSchemas';

/**
 * @swagger
 * tags:
 *   name: Role Permissions
 *   description: Gestão de associações entre papéis e permissões
 */

class RolePermissionRoutes extends BaseRouter<RolePermissionController> {
  constructor() {
    super(new RolePermissionController());
    this.setupRoutes();
  }

  private setupRoutes() {
    /**
     * @swagger
     * /role-permissions:
     *   get:
     *     summary: Lista todas as associações role-permission
     *     tags: [Role Permissions]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: query
     *         name: page
     *         schema: { type: integer, default: 1 }
     *         description: Número da página
     *       - in: query
     *         name: limit
     *         schema: { type: integer, default: 10 }
     *         description: Itens por página
     *       - in: query
     *         name: role_id
     *         schema: { type: integer }
     *         description: Filtrar por ID do papel
     *       - in: query
     *         name: permission_id
     *         schema: { type: integer }
     *         description: Filtrar por ID da permissão
     *       - in: query
     *         name: role_name
     *         schema: { type: string }
     *         description: Filtrar por nome do papel
     *       - in: query
     *         name: permission_name
     *         schema: { type: string }
     *         description: Filtrar por nome da permissão
     *       - in: query
     *         name: resource
     *         schema: { type: string }
     *         description: Filtrar por recurso da permissão
     *     responses:
     *       200:
     *         description: Lista de associações role-permission
     *       401:
     *         description: Não autenticado
     */
    this.get('/', 'index', { auth: true, permissions: ['admin', 'manager', 'user'] });

    /**
     * @swagger
     * /role-permissions/{id}:
     *   get:
     *     summary: Obtém uma associação role-permission pelo ID
     *     tags: [Role Permissions]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: integer
     *         description: ID da associação
     *     responses:
     *       200:
     *         description: Dados da associação
     *       401:
     *         description: Não autenticado
     *       404:
     *         description: Associação não encontrada
     */
    this.get('/:id', 'show', { auth: true, permissions: ['admin', 'manager', 'user'] });

    /**
     * @swagger
     * /role-permissions:
     *   post:
     *     summary: Cria uma nova associação role-permission
     *     tags: [Role Permissions]
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - role_id
     *               - permission_id
     *             properties:
     *               role_id:
     *                 type: integer
     *                 description: ID do papel
     *                 example: 1
     *               permission_id:
     *                 type: integer
     *                 description: ID da permissão
     *                 example: 5
     *     responses:
     *       201:
     *         description: Associação criada com sucesso
     *       400:
     *         description: Dados inválidos
     *       409:
     *         description: Associação já existe
     *       401:
     *         description: Não autenticado
     */
    this.post('/', 'store', { auth: true, permissions: ['admin', 'manager', 'user'], validationSchema: createRolePermissionSchema });

    /**
     * @swagger
     * /role-permissions/{id}:
     *   delete:
     *     summary: Remove uma associação role-permission
     *     tags: [Role Permissions]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: integer
     *         description: ID da associação
     *     responses:
     *       200:
     *         description: Associação removida com sucesso
     *       401:
     *         description: Não autenticado
     *       404:
     *         description: Associação não encontrada
     */
    this.delete('/:id', 'destroy', { auth: true, permissions: ['admin', 'manager', 'user'] });

    /**
     * @swagger
     * /role-permissions/roles/{roleId}/permissions:
     *   get:
     *     summary: Lista todas as permissões de um papel específico
     *     tags: [Role Permissions]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: roleId
     *         required: true
     *         schema:
     *           type: integer
     *         description: ID do papel
     *     responses:
     *       200:
     *         description: Lista de permissões do papel
     *       404:
     *         description: Papel não encontrado
     *       401:
     *         description: Não autenticado
     */
    this.get('/roles/:roleId/permissions', 'getPermissionsByRole', { auth: true, permissions: ['admin', 'manager', 'user'] });

    /**
     * @swagger
     * /role-permissions/permissions/{permissionId}/roles:
     *   get:
     *     summary: Lista todos os papéis que têm uma permissão específica
     *     tags: [Role Permissions]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: permissionId
     *         required: true
     *         schema:
     *           type: integer
     *         description: ID da permissão
     *     responses:
     *       200:
     *         description: Lista de papéis com a permissão
     *       404:
     *         description: Permissão não encontrada
     *       401:
     *         description: Não autenticado
     */
    this.get('/permissions/:permissionId/roles', 'getRolesByPermission', { auth: true, permissions: ['admin', 'manager', 'user'] });

    /**
     * @swagger
     * /role-permissions/roles/{roleId}/permissions:
     *   put:
     *     summary: Define todas as permissões de um papel (substitui as existentes)
     *     tags: [Role Permissions]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: roleId
     *         required: true
     *         schema:
     *           type: integer
     *         description: ID do papel
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - permission_ids
     *             properties:
     *               permission_ids:
     *                 type: array
     *                 items:
     *                   type: integer
     *                 description: Array com IDs das permissões
     *                 example: [1, 3, 5, 7]
     *     responses:
     *       200:
     *         description: Permissões do papel atualizadas com sucesso
     *       400:
     *         description: Dados inválidos
     *       404:
     *         description: Papel não encontrado
     *       401:
     *         description: Não autenticado
     */
    this.put('/roles/:roleId/permissions', 'setRolePermissions', { auth: true, permissions: ['admin', 'manager', 'user'], validationSchema: setRolePermissionsSchema });
  }
}

export default new RolePermissionRoutes().router;