import { Request, Response, NextFunction } from 'express';
import { SubscriptionService } from '../services/SubscriptionService';
import { ISubscription } from '../models/Subscription';
import BaseController from './BaseController';

/**
 * @swagger
 * tags:
 *   name: Subscriptions
 *   description: Gerenciamento de assinaturas
 */
class SubscriptionController extends BaseController<ISubscription> {
  private subscriptionService: SubscriptionService;

  constructor() {
    const service = new SubscriptionService();
    super(service, 'Assinatura');
    this.subscriptionService = service;
  }

  /**
   * @swagger
   * /subscriptions:
   *   get:
   *     summary: Lista e busca assinaturas com filtros e paginação
   *     tags: [Subscriptions]
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
   *         name: companyId
   *         schema: { type: string, format: uuid }
   *         description: Filtrar por ID da empresa
   *       - in: query
   *         name: planId
   *         schema: { type: string, format: uuid }
   *         description: Filtrar por ID do plano
   *       - in: query
   *         name: status
   *         schema: { type: string, enum: [active, inactive, cancelled, pending] }
   *         description: Filtrar por status
   *     responses:
   *       200: { description: 'Lista de assinaturas.', content: { application/json: { schema: { $ref: '#/components/schemas/SubscriptionListResponse' } } } }
   *       400: { description: 'Dados inválidos.' }
   *       401: { description: 'Não autorizado.' }
   *       500: { description: 'Erro interno do servidor.' }
   */
  index = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { companyId, customerId, planId, status } = req.query;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const filters = {
        company_id: companyId ? Number(companyId) : undefined,
        customer_id: customerId ? Number(customerId) : undefined,
        plan_id: planId ? Number(planId) : undefined,
        status: status as 'active' | 'inactive' | 'cancelled' | 'pending',
      };

      const result = await this.subscriptionService.search(filters, page, limit);
      res.status(200).json({ success: true, data: result.data, pagination: result.pagination });
    } catch (error) {
      next(error);
    }
  };

  /**
   * @swagger
   * /subscriptions/{id}:
   *   get:
   *     summary: Busca uma assinatura pelo ID
   *     tags: [Subscriptions]
   *     security: [{ bearerAuth: [] }]
   *     parameters:
   *       - in: path
   *         name: id
   *         schema: { type: string, format: uuid }
   *         required: true
   *         description: ID da assinatura
   *     responses:
   *       200: { description: 'Assinatura encontrada.', content: { application/json: { schema: { $ref: '#/components/schemas/SubscriptionResponse' } } } }
   *       404: { description: 'Assinatura não encontrada.' }
   *       400: { description: 'Dados inválidos.' }
   *       401: { description: 'Não autorizado.' }
   *       500: { description: 'Erro interno do servidor.' }
   */
  show = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const subscription = await this.subscriptionService.findById(Number(id));
      res.status(200).json({ success: true, data: subscription });
    } catch (error) {
      next(error);
    }
  };

  /**
   * @swagger
   * /subscriptions:
   *   post:
   *     summary: Cria uma nova assinatura
   *     tags: [Subscriptions]
   *     security: [{ bearerAuth: [] }]
   *     requestBody:
   *       required: true
   *       content: { application/json: { schema: { $ref: '#/components/schemas/SubscriptionCreate' } } }
   *     responses:
   *       201: { description: 'Assinatura criada com sucesso.', content: { application/json: { schema: { $ref: '#/components/schemas/SubscriptionResponse' } } } }
   *       400: { description: 'Dados inválidos.' }
   *       401: { description: 'Não autorizado.' }
   *       500: { description: 'Erro interno do servidor.' }
   */
  store = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const newSubscription = await this.subscriptionService.create(req.body);
      res.status(201).json({ success: true, message: 'Assinatura criada com sucesso.', data: newSubscription });
    } catch (error) {
      next(error);
    }
  };

  /**
   * @swagger
   * /subscriptions/{id}:
   *   put:
   *     summary: Atualiza uma assinatura existente
   *     tags: [Subscriptions]
   *     security: [{ bearerAuth: [] }]
   *     parameters:
   *       - in: path
   *         name: id
   *         schema: { type: string, format: uuid }
   *         required: true
   *         description: ID da assinatura
   *     requestBody:
   *       required: true
   *       content: { application/json: { schema: { $ref: '#/components/schemas/SubscriptionUpdate' } } }
   *     responses:
   *       200: { description: 'Assinatura atualizada com sucesso.', content: { application/json: { schema: { $ref: '#/components/schemas/SubscriptionResponse' } } } }
   *       400: { description: 'Dados inválidos.' }
   *       404: { description: 'Assinatura não encontrada.' }
   *       401: { description: 'Não autorizado.' }
   *       500: { description: 'Erro interno do servidor.' }
   */
  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const updatedSubscription = await this.subscriptionService.update(Number(id), req.body);
      res.status(200).json({ success: true, message: 'Assinatura atualizada com sucesso.', data: updatedSubscription });
    } catch (error) {
      next(error);
    }
  };

  /**
   * @swagger
   * /subscriptions/{id}:
   *   delete:
   *     summary: Remove uma assinatura
   *     tags: [Subscriptions]
   *     security: [{ bearerAuth: [] }]
   *     parameters:
   *       - in: path
   *         name: id
   *         schema: { type: string, format: uuid }
   *         required: true
   *         description: ID da assinatura
   *     responses:
   *       200: { description: 'Assinatura removida com sucesso.', content: { application/json: { schema: { type: object, properties: { success: { type: boolean }, message: { type: string } } } } } }
   *       400: { description: 'Dados inválidos.' }
   *       404: { description: 'Assinatura não encontrada.' }
   *       401: { description: 'Não autorizado.' }
   *       500: { description: 'Erro interno do servidor.' }
   */
  delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      await this.subscriptionService.delete(Number(id));
      res.status(200).json({ success: true, message: 'Assinatura removida com sucesso.' });
    } catch (error) {
      next(error);
    }
  };
}

export default SubscriptionController;
