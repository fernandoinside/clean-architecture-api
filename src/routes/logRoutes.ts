import LogController from '../controllers/LogController';
import { createLogSchema, updateLogSchema } from '../schemas/logSchemas';
import BaseRouter from './BaseRouter';

/**
 * @swagger
 * tags:
 *   name: Logs
 *   description: Gestão de logs do sistema
 */

class LogRoutes extends BaseRouter<LogController> {
  constructor() {
    super(new LogController());
    this.setupRoutes();
  }

  private setupRoutes() {
    /**
     * @swagger
     * /logs:
     *   get:
     *     summary: Lista todos os logs
     *     tags: [Logs]
     *     security:
     *       - bearerAuth: []
     *     responses:
     *       200:
     *         description: Lista de logs
     *       401:
     *         description: Não autenticado
     */
    this.get('/', 'index', { auth: true, permissions: ['admin', 'manager', 'user'] });

    /**
     * @swagger
     * /logs/{id}:
     *   get:
     *     summary: Obtém um log pelo ID
     *     tags: [Logs]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *         description: ID do log
     *     responses:
     *       200:
     *         description: Dados do log
     *       401:
     *         description: Não autenticado
     *       404:
     *         description: Log não encontrado
     */
    this.get('/:id', 'show', { auth: true, permissions: ['admin', 'manager', 'user'] });

    /**
     * @swagger
     * /logs:
     *   post:
     *     summary: Cria um novo log
     *     tags: [Logs]
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/LogCreate'
     *     responses:
     *       201:
     *         description: Log criado com sucesso
     *       400:
     *         description: Dados inválidos
     *       401:
     *         description: Não autenticado
     */
    this.post('/', 'store', { auth: true, permissions: ['admin', 'manager', 'user'], validationSchema: createLogSchema });

    /**
     * @swagger
     * /logs/{id}:
     *   put:
     *     summary: Atualiza um log existente
     *     tags: [Logs]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *         description: ID do log
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/LogUpdate'
     *     responses:
     *       200:
     *         description: Log atualizado com sucesso
     *       400:
     *         description: Dados inválidos
     *       401:
     *         description: Não autenticado
     *       404:
     *         description: Log não encontrado
     */
    this.put('/:id', 'update', { auth: true, permissions: ['admin', 'manager', 'user'], validationSchema: updateLogSchema });

    /**
     * @swagger
     * /logs/{id}:
     *   delete:
     *     summary: Remove um log
     *     tags: [Logs]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *         description: ID do log
     *     responses:
     *       204:
     *         description: Log removido com sucesso
     *       401:
     *         description: Não autenticado
     *       404:
     *         description: Log não encontrado
     */
    this.delete('/:id', 'delete', { auth: true, permissions: ['admin', 'manager', 'user'] });
  }
}

export default new LogRoutes().router;