import BaseRouter from './BaseRouter';
import SubscriptionController from '../controllers/SubscriptionController';
import { createSubscriptionSchema, updateSubscriptionSchema } from '../schemas/subscriptionSchemas';

/**
 * @swagger
 * tags:
 *   name: Subscriptions
 *   description: Gestão de assinaturas
 */

class SubscriptionRoutes extends BaseRouter<SubscriptionController> {
  constructor() {
    super(new SubscriptionController());
    this.setupRoutes();
  }

  private setupRoutes() {
    /**
     * @swagger
     * /subscriptions:
     *   get:
     *     summary: Lista todas as assinaturas
     *     tags: [Subscriptions]
     *     security:
     *       - bearerAuth: []
     *     responses:
     *       200:
     *         description: Lista de assinaturas
     *       401:
     *         description: Não autenticado
     */
    this.get('/', 'index', { auth: true, permissions: ['admin', 'manager', 'user'] });

    /**
     * @swagger
     * /subscriptions/{id}:
     *   get:
     *     summary: Obtém uma assinatura pelo ID
     *     tags: [Subscriptions]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *         description: ID da assinatura
     *     responses:
     *       200:
     *         description: Dados da assinatura
     *       401:
     *         description: Não autenticado
     *       404:
     *         description: Assinatura não encontrada
     */
    this.get('/:id', 'show', { auth: true, permissions: ['admin', 'manager', 'user'] });

    /**
     * @swagger
     * /subscriptions:
     *   post:
     *     summary: Cria uma nova assinatura
     *     tags: [Subscriptions]
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/SubscriptionCreate'
     *     responses:
     *       201:
     *         description: Assinatura criada com sucesso
     *       400:
     *         description: Dados inválidos
     *       401:
     *         description: Não autenticado
     */
    this.post('/', 'store', { auth: true, permissions: ['admin', 'manager', 'user'], validationSchema: createSubscriptionSchema });

    /**
     * @swagger
     * /subscriptions/{id}:
     *   put:
     *     summary: Atualiza uma assinatura existente
     *     tags: [Subscriptions]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *         description: ID da assinatura
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/SubscriptionUpdate'
     *     responses:
     *       200:
     *         description: Assinatura atualizada com sucesso
     *       400:
     *         description: Dados inválidos
     *       401:
     *         description: Não autenticado
     *       404:
     *         description: Assinatura não encontrada
     */
    this.put('/:id', 'update', { auth: true, permissions: ['admin', 'manager', 'user'], validationSchema: updateSubscriptionSchema });

    /**
     * @swagger
     * /subscriptions/{id}:
     *   delete:
     *     summary: Remove uma assinatura
     *     tags: [Subscriptions]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *         description: ID da assinatura
     *     responses:
     *       204:
     *         description: Assinatura removida com sucesso
     *       401:
     *         description: Não autenticado
     *       404:
     *         description: Assinatura não encontrada
     */
    this.delete('/:id', 'destroy', { auth: true, permissions: ['admin', 'manager', 'user'] });
  }
}

export default new SubscriptionRoutes().router;