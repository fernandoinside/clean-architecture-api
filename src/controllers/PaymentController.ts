import { Request, Response, NextFunction } from 'express';
import { PaymentService } from '../services/PaymentService';
import { IPayment } from '../models/Payment';
import BaseController from './BaseController';

/**
 * @swagger
 * tags:
 *   name: Payments
 *   description: Gerenciamento de pagamentos
 */
class PaymentController extends BaseController<IPayment> {
  private paymentService: PaymentService;

  constructor() {
    const service = new PaymentService();
    super(service, 'Pagamento');
    this.paymentService = service;
  }

  /**
   * @swagger
   * /payments:
   *   get:
   *     summary: Lista e busca pagamentos com filtros e paginação
   *     tags: [Payments]
   *     security: [{ bearerAuth: [] }]
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
   *         name: customerId
   *         schema: { type: string, format: uuid }
   *         description: Filtrar por ID do cliente
   *       - in: query
   *         name: planId
   *         schema: { type: string, format: uuid }
   *         description: Filtrar por ID do plano
   *       - in: query
   *         name: status
   *         schema: { type: string, enum: [pending, completed, failed] }
   *         description: Filtrar por status
   *       - in: query
   *         name: paymentMethod
   *         schema: { type: string }
   *         description: Filtrar por método de pagamento
   *       - in: query
   *         name: transactionId
   *         schema: { type: string }
   *         description: Filtrar por ID da transação
   *     responses:
   *       200: { description: 'Lista de pagamentos.', content: { application/json: { schema: { $ref: '#/components/schemas/PaymentListResponse' } } } }
   *       400: { description: 'Dados inválidos.' }
   *       401: { description: 'Não autorizado.' }
   *       500: { description: 'Erro interno do servidor.' }
   */
  index = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { customerId, planId, status, paymentMethod, transactionId } = req.query;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const filters = {
        customerId: customerId ? Number(customerId) : undefined,
        planId: planId ? Number(planId) : undefined,
        status: status as 'pending' | 'completed' | 'failed',
        paymentMethod: paymentMethod as string,
        transactionId: transactionId as string,
      };

      const result = await this.paymentService.search(filters, page, limit);
      res.status(200).json({ success: true, data: result.data, pagination: result.pagination });
    } catch (error) {
      next(error);
    }
  };

  /**
   * @swagger
   * /payments/{id}:
   *   get:
   *     summary: Busca um pagamento pelo ID
   *     tags: [Payments]
   *     security: [{ bearerAuth: [] }]
   *     parameters:
   *       - in: path
   *         name: id
   *         schema: { type: string, format: uuid }
   *         required: true
   *         description: ID do pagamento
   *     responses:
   *       200: { description: 'Pagamento encontrado.', content: { application/json: { schema: { $ref: '#/components/schemas/PaymentResponse' } } } }
   *       404: { description: 'Pagamento não encontrado.' }
   *       400: { description: 'Dados inválidos.' }
   *       401: { description: 'Não autorizado.' }
   *       500: { description: 'Erro interno do servidor.' }
   */
  show = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const payment = await this.paymentService.findById(Number(id));
      res.status(200).json({ success: true, data: payment });
    } catch (error) {
      next(error);
    }
  };

  /**
   * @swagger
   * /payments:
   *   post:
   *     summary: Cria um novo pagamento
   *     tags: [Payments]
   *     security: [{ bearerAuth: [] }]
   *     requestBody:
   *       required: true
   *       content: { application/json: { schema: { $ref: '#/components/schemas/PaymentCreate' } } }
   *     responses:
   *       201: { description: 'Pagamento criado com sucesso.', content: { application/json: { schema: { $ref: '#/components/schemas/PaymentResponse' } } } }
   *       400: { description: 'Dados inválidos.' }
   *       401: { description: 'Não autorizado.' }
   *       500: { description: 'Erro interno do servidor.' }
   */
  store = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const newPayment = await this.paymentService.create(req.body);
      res.status(201).json({ success: true, message: 'Pagamento criado com sucesso.', data: newPayment });
    } catch (error) {
      next(error);
    }
  };

  /**
   * @swagger
   * /payments/{id}:
   *   put:
   *     summary: Atualiza um pagamento existente
   *     tags: [Payments]
   *     security: [{ bearerAuth: [] }]
   *     parameters:
   *       - in: path
   *         name: id
   *         schema: { type: string, format: uuid }
   *         required: true
   *         description: ID do pagamento
   *     requestBody:
   *       required: true
   *       content: { application/json: { schema: { $ref: '#/components/schemas/PaymentUpdate' } } }
   *     responses:
   *       200: { description: 'Pagamento atualizado com sucesso.', content: { application/json: { schema: { $ref: '#/components/schemas/PaymentResponse' } } } }
   *       400: { description: 'Dados inválidos.' }
   *       404: { description: 'Pagamento não encontrado.' }
   *       401: { description: 'Não autorizado.' }
   *       500: { description: 'Erro interno do servidor.' }
   */
  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const updatedPayment = await this.paymentService.update(Number(id), req.body);
      res.status(200).json({ success: true, message: 'Pagamento atualizado com sucesso.', data: updatedPayment });
    } catch (error) {
      next(error);
    }
  };

  /**
   * @swagger
   * /payments/{id}:
   *   delete:
   *     summary: Remove um pagamento
   *     tags: [Payments]
   *     security: [{ bearerAuth: [] }]
   *     parameters:
   *       - in: path
   *         name: id
   *         schema: { type: string, format: uuid }
   *         required: true
   *         description: ID do pagamento
   *     responses:
   *       200: { description: 'Pagamento removido com sucesso.', content: { application/json: { schema: { type: object, properties: { success: { type: boolean }, message: { type: string } } } } } }
   *       400: { description: 'Dados inválidos.' }
   *       404: { description: 'Pagamento não encontrado.' }
   *       401: { description: 'Não autorizado.' }
   *       500: { description: 'Erro interno do servidor.' }
   */
  delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      await this.paymentService.delete(Number(id));
      res.status(200).json({ success: true, message: 'Pagamento removido com sucesso.' });
    } catch (error) {
      next(error);
    }
  };
}

export default PaymentController;