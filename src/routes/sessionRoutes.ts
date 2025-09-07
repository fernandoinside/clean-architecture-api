import BaseRouter from './BaseRouter';
import SessionController from '../controllers/SessionController';
import { createSessionSchema, updateSessionSchema } from '../schemas/sessionSchemas';

/**
 * @swagger
 * tags:
 *   name: Sessions
 *   description: Gestão de sessões de usuário
 */

class SessionRoutes extends BaseRouter<SessionController> {
  constructor() {
    super(new SessionController());
    this.setupRoutes();
  }

  private setupRoutes() {
    /**
     * @swagger
     * /sessions:
     *   get:
     *     summary: Lista todas as sessões
     *     tags: [Sessions]
     *     security:
     *       - bearerAuth: []
     *     responses:
     *       200:
     *         description: Lista de sessões
     *       401:
     *         description: Não autenticado
     */
    this.get('/', 'index', { auth: true, permissions: ['admin', 'manager', 'user'] });

    /**
     * @swagger
     * /sessions/{id}:
     *   get:
     *     summary: Obtém uma sessão pelo ID
     *     tags: [Sessions]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *         description: ID da sessão
     *     responses:
     *       200:
     *         description: Dados da sessão
     *       401:
     *         description: Não autenticado
     *       404:
     *         description: Sessão não encontrada
     */
    this.get('/:id', 'show', { auth: true, permissions: ['admin', 'manager', 'user'] });

    /**
     * @swagger
     * /sessions:
     *   post:
     *     summary: Cria uma nova sessão
     *     tags: [Sessions]
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/SessionCreate'
     *     responses:
     *       201:
     *         description: Sessão criada com sucesso
     *       400:
     *         description: Dados inválidos
     *       401:
     *         description: Não autenticado
     */
    this.post('/', 'store', { auth: true, permissions: ['admin', 'manager', 'user'], validationSchema: createSessionSchema });

    /**
     * @swagger
     * /sessions/{id}:
     *   put:
     *     summary: Atualiza uma sessão existente
     *     tags: [Sessions]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *         description: ID da sessão
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/SessionUpdate'
     *     responses:
     *       200:
     *         description: Sessão atualizada com sucesso
     *       400:
     *         description: Dados inválidos
     *       401:
     *         description: Não autenticado
     *       404:
     *         description: Sessão não encontrada
     */
    this.put('/:id', 'update', { auth: true, permissions: ['admin', 'manager', 'user'], validationSchema: updateSessionSchema });

    /**
     * @swagger
     * /sessions/{id}:
     *   delete:
     *     summary: Remove uma sessão
     *     tags: [Sessions]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *         description: ID da sessão
     *     responses:
     *       204:
     *         description: Sessão removida com sucesso
     *       401:
     *         description: Não autenticado
     *       404:
     *         description: Sessão não encontrada
     */
    this.delete('/:id', 'destroy', { auth: true, permissions: ['admin', 'manager', 'user'] });
  }
}

export default new SessionRoutes().router;