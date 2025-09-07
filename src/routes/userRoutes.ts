import BaseRouter from './BaseRouter';
import UserController from '../controllers/UserController';
import { createUserSchema, updateUserSchema } from '../schemas/userSchemas';

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: Gestão de usuários
 */

class UserRoutes extends BaseRouter<UserController> {
  constructor() {
    super(new UserController());
    this.setupRoutes();
  }

  private setupRoutes() {
    /**
     * @swagger
     * /users:
     *   get:
     *     summary: Lista todos os usuários
     *     tags: [Users]
     *     security:
     *       - bearerAuth: []
     *     responses:
     *       200:
     *         description: Lista de usuários
     *       401:
     *         description: Não autenticado
     *       403:
     *         description: Acesso negado
     */
    this.get('/', 'index', { auth: true, permissions: ['admin', 'manager', 'user'] });

    /**
     * @swagger
     * /users/{id}:
     *   get:
     *     summary: Obtém um usuário pelo ID
     *     tags: [Users]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *         description: ID do usuário
     *     responses:
     *       200:
     *         description: Dados do usuário
     *       401:
     *         description: Não autenticado
     *       403:
     *         description: Acesso negado
     *       404:
     *         description: Usuário não encontrado
     */
    this.get('/:id', 'show', { auth: true, permissions: ['admin', 'manager', 'user'] });

    /**
     * @swagger
     * /users:
     *   post:
     *     summary: Cria um novo usuário
     *     tags: [Users]
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/UserCreate'
     *     responses:
     *       201:
     *         description: Usuário criado com sucesso
     *       400:
     *         description: Dados inválidos
     *       401:
     *         description: Não autenticado
     *       403:
     *         description: Acesso negado
     */
    this.post('/', 'store', { auth: true, permissions: ['admin', 'manager', 'user'], validationSchema: createUserSchema });

    /**
     * @swagger
     * /users/{id}:
     *   put:
     *     summary: Atualiza um usuário existente
     *     tags: [Users]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *         description: ID do usuário
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/UserUpdate'
     *     responses:
     *       200:
     *         description: Usuário atualizado com sucesso
     *       400:
     *         description: Dados inválidos
     *       401:
     *         description: Não autenticado
     *       403:
     *         description: Acesso negado
     *       404:
     *         description: Usuário não encontrado
     */
    this.put('/:id', 'update', { auth: true, permissions: ['admin', 'manager', 'user'], validationSchema: updateUserSchema });

    /**
     * @swagger
     * /users/{id}:
     *   delete:
     *     summary: Remove um usuário
     *     tags: [Users]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *         description: ID do usuário
     *     responses:
     *       204:
     *         description: Usuário removido com sucesso
     *       401:
     *         description: Não autenticado
     *       403:
     *         description: Acesso negado
     *       404:
     *         description: Usuário não encontrado
     */
    this.delete('/:id', 'destroy', { auth: true, permissions: ['admin', 'manager', 'user'] });
  }
}

export default new UserRoutes().router;