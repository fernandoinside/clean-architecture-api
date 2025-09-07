import BaseRouter from './BaseRouter';
import UserRoleController from '../controllers/UserRoleController';
import { createUserRoleSchema, setUserRolesSchema } from '../schemas/userRoleSchemas';

/**
 * @swagger
 * tags:
 *   name: User Roles
 *   description: Gestão de associações entre usuários e papéis
 */

class UserRoleRoutes extends BaseRouter<UserRoleController> {
  constructor() {
    super(new UserRoleController());
    this.setupRoutes();
  }

  private setupRoutes() {
    /**
     * @swagger
     * /user-roles:
     *   get:
     *     summary: Lista todas as associações user-role
     *     tags: [User Roles]
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
     *         name: user_id
     *         schema: { type: integer }
     *         description: Filtrar por ID do usuário
     *       - in: query
     *         name: role_id
     *         schema: { type: integer }
     *         description: Filtrar por ID do role
     *       - in: query
     *         name: user_name
     *         schema: { type: string }
     *         description: Filtrar por nome do usuário
     *       - in: query
     *         name: role_name
     *         schema: { type: string }
     *         description: Filtrar por nome do role
     *     responses:
     *       200:
     *         description: Lista de associações user-role
     *       401:
     *         description: Não autenticado
     */
    this.get('/', 'index', { auth: true, permissions: ['admin', 'manager', 'user'] });

    /**
     * @swagger
     * /user-roles/{id}:
     *   get:
     *     summary: Obtém uma associação user-role pelo ID
     *     tags: [User Roles]
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
     * /user-roles:
     *   post:
     *     summary: Cria uma nova associação user-role
     *     tags: [User Roles]
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - user_id
     *               - role_id
     *             properties:
     *               user_id:
     *                 type: integer
     *                 description: ID do usuário
     *                 example: 1
     *               role_id:
     *                 type: integer
     *                 description: ID do role
     *                 example: 2
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
    this.post('/', 'store', { auth: true, permissions: ['admin', 'manager', 'user'], validationSchema: createUserRoleSchema });

    /**
     * @swagger
     * /user-roles/{id}:
     *   delete:
     *     summary: Remove uma associação user-role
     *     tags: [User Roles]
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
     * /user-roles/users/{userId}/roles:
     *   get:
     *     summary: Lista todos os roles de um usuário específico
     *     tags: [User Roles]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: userId
     *         required: true
     *         schema:
     *           type: integer
     *         description: ID do usuário
     *     responses:
     *       200:
     *         description: Lista de roles do usuário
     *       404:
     *         description: Usuário não encontrado
     *       401:
     *         description: Não autenticado
     */
    this.get('/users/:userId/roles', 'getRolesByUser', { auth: true, permissions: ['admin', 'manager', 'user'] });

    /**
     * @swagger
     * /user-roles/roles/{roleId}/users:
     *   get:
     *     summary: Lista todos os usuários que têm um role específico
     *     tags: [User Roles]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: roleId
     *         required: true
     *         schema:
     *           type: integer
     *         description: ID do role
     *     responses:
     *       200:
     *         description: Lista de usuários com o role
     *       404:
     *         description: Role não encontrado
     *       401:
     *         description: Não autenticado
     */
    this.get('/roles/:roleId/users', 'getUsersByRole', { auth: true, permissions: ['admin', 'manager', 'user'] });

    /**
     * @swagger
     * /user-roles/users/{userId}/roles:
     *   put:
     *     summary: Define todos os roles de um usuário (substitui os existentes)
     *     tags: [User Roles]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: userId
     *         required: true
     *         schema:
     *           type: integer
     *         description: ID do usuário
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - role_ids
     *             properties:
     *               role_ids:
     *                 type: array
     *                 items:
     *                   type: integer
     *                 description: Array com IDs dos roles
     *                 example: [1, 2, 3]
     *     responses:
     *       200:
     *         description: Roles do usuário atualizados com sucesso
     *       400:
     *         description: Dados inválidos
     *       404:
     *         description: Usuário não encontrado
     *       401:
     *         description: Não autenticado
     */
    this.put('/users/:userId/roles', 'setUserRoles', { auth: true, permissions: ['admin', 'manager', 'user'], validationSchema: setUserRolesSchema });
  }
}

export default new UserRoleRoutes().router;