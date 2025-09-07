import BaseRouter from './BaseRouter';
import RoleController from '../controllers/RoleController';
import { createRoleSchema, updateRoleSchema } from '../schemas/roleSchemas';

/**
 * @swagger
 * tags:
 *   name: Roles
 *   description: Gestão de papéis de usuário
 */

class RoleRoutes extends BaseRouter<RoleController> {
  constructor() {
    super(new RoleController());
    this.setupRoutes();
  }

  private setupRoutes() {
    /**
     * @swagger
     * /roles:
     *   get:
     *     summary: Lista todos os papéis
     *     tags: [Roles]
     *     security:
     *       - bearerAuth: []
     *     responses:
     *       200:
     *         description: Lista de papéis
     *       401:
     *         description: Não autenticado
     */
    this.get('/', 'index', { auth: true, permissions: ['admin', 'manager', 'user'] });

    /**
     * @swagger
     * /roles/{id}:
     *   get:
     *     summary: Obtém um papel pelo ID
     *     tags: [Roles]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *         description: ID do papel
     *     responses:
     *       200:
     *         description: Dados do papel
     *       401:
     *         description: Não autenticado
     *       404:
     *         description: Papel não encontrado
     */
    this.get('/:id', 'show', { auth: true, permissions: ['admin', 'manager', 'user'] });

    /**
     * @swagger
     * /roles:
     *   post:
     *     summary: Cria um novo papel
     *     tags: [Roles]
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/RoleCreate'
     *     responses:
     *       201:
     *         description: Papel criado com sucesso
     *       400:
     *         description: Dados inválidos
     *       401:
     *         description: Não autenticado
     */
    this.post('/', 'store', { auth: true, permissions: ['admin', 'manager'], validationSchema: createRoleSchema });

    /**
     * @swagger
     * /roles/{id}:
     *   put:
     *     summary: Atualiza um papel existente
     *     tags: [Roles]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *         description: ID do papel
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/RoleUpdate'
     *     responses:
     *       200:
     *         description: Papel atualizado com sucesso
     *       400:
     *         description: Dados inválidos
     *       401:
     *         description: Não autenticado
     *       404:
     *         description: Papel não encontrado
     */
    this.put('/:id', 'update', { auth: true, permissions: ['admin', 'manager'], validationSchema: updateRoleSchema });

    /**
     * @swagger
     * /roles/{id}:
     *   delete:
     *     summary: Remove um papel
     *     tags: [Roles]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *         description: ID do papel
     *     responses:
     *       204:
     *         description: Papel removido com sucesso
     *       401:
     *         description: Não autenticado
     *       404:
     *         description: Papel não encontrado
     */
    this.delete('/:id', 'destroy', { auth: true, permissions: ['admin'] });
  }
}

export default new RoleRoutes().router;