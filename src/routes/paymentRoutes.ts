import BaseRouter from './BaseRouter';
import PaymentController from '../controllers/PaymentController';
import { createPaymentSchema, updatePaymentSchema } from '../schemas/paymentSchemas';

/**
 * @swagger
 * tags:
 *   name: Payments
 *   description: Gestão de pagamentos
 */

class PaymentRoutes extends BaseRouter<PaymentController> {
  constructor() {
    super(new PaymentController());
    this.setupRoutes();
  }

  private setupRoutes() {
    /**
     * @swagger
     * /payments:
     *   get:
     *     summary: Lista todos os pagamentos
     *     tags: [Payments]
     *     security:
     *       - bearerAuth: []
     *     responses:
     *       200:
     *         description: Lista de pagamentos
     *       401:
     *         description: Não autenticado
     */
    this.get('/', 'index', { auth: true, permissions: ['admin', 'manager', 'user'] });

    /**
     * @swagger
     * /payments/{id}:
     *   get:
     *     summary: Obtém um pagamento pelo ID
     *     tags: [Payments]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *         description: ID do pagamento
     *     responses:
     *       200:
     *         description: Dados do pagamento
     *       401:
     *         description: Não autenticado
     *       404:
     *         description: Pagamento não encontrado
     */
    this.get('/:id', 'show', { auth: true, permissions: ['admin', 'manager', 'user'] });

    /**
     * @swagger
     * /payments:
     *   post:
     *     summary: Cria um novo pagamento
     *     tags: [Payments]
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/PaymentCreate'
     *     responses:
     *       201:
     *         description: Pagamento criado com sucesso
     *       400:
     *         description: Dados inválidos
     *       401:
     *         description: Não autenticado
     */
    this.post('/', 'store', { auth: true, permissions: ['admin', 'manager', 'user'], validationSchema: createPaymentSchema });

    /**
     * @swagger
     * /payments/{id}:
     *   put:
     *     summary: Atualiza um pagamento existente
     *     tags: [Payments]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *         description: ID do pagamento
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/PaymentUpdate'
     *     responses:
     *       200:
     *         description: Pagamento atualizado com sucesso
     *       400:
     *         description: Dados inválidos
     *       401:
     *         description: Não autenticado
     *       404:
     *         description: Pagamento não encontrado
     */
    this.put('/:id', 'update', { auth: true, permissions: ['admin', 'manager', 'user'], validationSchema: updatePaymentSchema });

    /**
     * @swagger
     * /payments/{id}:
     *   delete:
     *     summary: Remove um pagamento
     *     tags: [Payments]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *         description: ID do pagamento
     *     responses:
     *       204:
     *         description: Pagamento removido com sucesso
     *       401:
     *         description: Não autenticado
     *       404:
     *         description: Pagamento não encontrado
     */
    this.delete('/:id', 'destroy', { auth: true, permissions: ['admin', 'manager', 'user'] });
  }
}

export default new PaymentRoutes().router;