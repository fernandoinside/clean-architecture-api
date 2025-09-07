import NotificationController from '../controllers/NotificationController';
import { createNotificationSchema, updateNotificationSchema } from '../schemas/notificationSchemas';
import BaseRouter from './BaseRouter';

/**
 * @swagger
 * tags:
 *   name: Notifications
 *   description: Gestão de notificações
 */

class NotificationRoutes extends BaseRouter<NotificationController> {
  constructor() {
    super(new NotificationController());
    this.setupRoutes();
  }

  private setupRoutes() {
    /**
     * @swagger
     * /notifications:
     *   get:
     *     summary: Lista todas as notificações
     *     tags: [Notifications]
     *     security:
     *       - bearerAuth: []
     *     responses:
     *       200:
     *         description: Lista de notificações
     *       401:
     *         description: Não autenticado
     */
    this.get('/', 'index', { auth: true, permissions: ['admin', 'manager', 'user'] });

    /**
     * @swagger
     * /notifications/{id}:
     *   get:
     *     summary: Obtém uma notificação pelo ID
     *     tags: [Notifications]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *         description: ID da notificação
     *     responses:
     *       200:
     *         description: Dados da notificação
     *       401:
     *         description: Não autenticado
     *       404:
     *         description: Notificação não encontrada
     */
    this.get('/:id', 'show', { auth: true, permissions: ['admin', 'manager', 'user'] });

    /**
     * @swagger
     * /notifications:
     *   post:
     *     summary: Cria uma nova notificação
     *     tags: [Notifications]
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/NotificationCreate'
     *     responses:
     *       201:
     *         description: Notificação criada com sucesso
     *       400:
     *         description: Dados inválidos
     *       401:
     *         description: Não autenticado
     */
    this.post('/', 'store', { auth: true, permissions: ['admin', 'manager', 'user'], validationSchema: createNotificationSchema });

    /**
     * @swagger
     * /notifications/{id}:
     *   put:
     *     summary: Atualiza uma notificação existente
     *     tags: [Notifications]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *         description: ID da notificação
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/NotificationUpdate'
     *     responses:
     *       200:
     *         description: Notificação atualizada com sucesso
     *       400:
     *         description: Dados inválidos
     *       401:
     *         description: Não autenticado
     *       404:
     *         description: Notificação não encontrada
     */
    this.put('/:id', 'update', { auth: true, permissions: ['admin', 'manager', 'user'], validationSchema: updateNotificationSchema });

    /**
     * @swagger
     * /notifications/{id}:
     *   delete:
     *     summary: Remove uma notificação
     *     tags: [Notifications]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *         description: ID da notificação
     *     responses:
     *       204:
     *         description: Notificação removida com sucesso
     *       401:
     *         description: Não autenticado
     *       404:
     *         description: Notificação não encontrada
     */
    this.delete('/:id', 'destroy', { auth: true, permissions: ['admin', 'manager', 'user'] });
  }
}

export default new NotificationRoutes().router;