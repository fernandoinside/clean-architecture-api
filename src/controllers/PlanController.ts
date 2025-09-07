import { Request, Response, NextFunction } from 'express';
import { PlanService } from '../services/PlanService';
import { IPlan } from '../models/Plan';
import BaseController from './BaseController';

/**
 * @swagger
 * tags:
 *   name: Plans
 *   description: Gerenciamento de planos
 */
class PlanController extends BaseController<IPlan> {
  private planService: PlanService;

  constructor() {
    const service = new PlanService();
    super(service, 'Plano');
    this.planService = service;
  }

  /**
   * @swagger
   * /plans:
   *   get:
   *     summary: Lista e busca planos com filtros e paginação
   *     tags: [Plans]
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
   *         name: name
   *         schema: { type: string }
   *         description: Filtrar por nome do plano
   *       - in: query
   *         name: interval
   *         schema: { type: string, enum: [monthly, yearly] }
   *         description: Filtrar por intervalo
   *       - in: query
   *         name: isActive
   *         schema: { type: boolean }
   *         description: Filtrar por status ativo
   *     responses:
   *       200: { description: 'Lista de planos.', content: { application/json: { schema: { $ref: '#/components/schemas/PlanListResponse' } } } }
   *       400: { description: 'Dados inválidos.' }
   *       401: { description: 'Não autorizado.' }
   *       500: { description: 'Erro interno do servidor.' }
   */
  index = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, interval, isActive } = req.query;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const filters = {
        name: name as string,
        interval: interval as 'monthly' | 'yearly',
        isActive: isActive !== undefined ? isActive === 'true' : undefined,
      };

      const result = await this.planService.search(filters, page, limit);
      res.status(200).json({ success: true, data: result.data, pagination: result.pagination });
    } catch (error) {
      next(error);
    }
  };

  /**
   * @swagger
   * /plans/{id}:
   *   get:
   *     summary: Busca um plano pelo ID
   *     tags: [Plans]
   *     security: [{ bearerAuth: [] }]
   *     parameters:
   *       - in: path
   *         name: id
   *         schema: { type: string, format: uuid }
   *         required: true
   *         description: ID do plano
   *     responses:
   *       200: { description: 'Plano encontrado.', content: { application/json: { schema: { $ref: '#/components/schemas/PlanResponse' } } } }
   *       404: { description: 'Plano não encontrado.' }
   *       400: { description: 'Dados inválidos.' }
   *       401: { description: 'Não autorizado.' }
   *       500: { description: 'Erro interno do servidor.' }
   */
  show = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const plan = await this.planService.findById(Number(id));
      res.status(200).json({ success: true, data: plan });
    } catch (error) {
      next(error);
    }
  };

  /**
   * @swagger
   * /plans:
   *   post:
   *     summary: Cria um novo plano
   *     tags: [Plans]
   *     security: [{ bearerAuth: [] }]
   *     requestBody:
   *       required: true
   *       content: { application/json: { schema: { $ref: '#/components/schemas/PlanCreate' } } }
   *     responses:
   *       201: { description: 'Plano criado com sucesso.', content: { application/json: { schema: { $ref: '#/components/schemas/PlanResponse' } } } }
   *       400: { description: 'Dados inválidos.' }
   *       409: { description: 'Plano com este nome já existe.' }
   *       401: { description: 'Não autorizado.' }
   *       500: { description: 'Erro interno do servidor.' }
   */
  store = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const newPlan = await this.planService.create(req.body);
      res.status(201).json({ success: true, message: 'Plano criado com sucesso.', data: newPlan });
    } catch (error) {
      next(error);
    }
  };

  /**
   * @swagger
   * /plans/{id}:
   *   put:
   *     summary: Atualiza um plano existente
   *     tags: [Plans]
   *     security: [{ bearerAuth: [] }]
   *     parameters:
   *       - in: path
   *         name: id
   *         schema: { type: string, format: uuid }
   *         required: true
   *         description: ID do plano
   *     requestBody:
   *       required: true
   *       content: { application/json: { schema: { $ref: '#/components/schemas/PlanUpdate' } } }
   *     responses:
   *       200: { description: 'Plano atualizado com sucesso.', content: { application/json: { schema: { $ref: '#/components/schemas/PlanResponse' } } } }
   *       400: { description: 'Dados inválidos.' }
   *       404: { description: 'Plano não encontrado.' }
   *       409: { description: 'Plano com este nome já existe.' }
   *       401: { description: 'Não autorizado.' }
   *       500: { description: 'Erro interno do servidor.' }
   */
  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const updatedPlan = await this.planService.update(Number(id), req.body);
      res.status(200).json({ success: true, message: 'Plano atualizado com sucesso.', data: updatedPlan });
    } catch (error) {
      next(error);
    }
  };

  /**
   * @swagger
   * /plans/{id}:
   *   delete:
   *     summary: Remove um plano
   *     tags: [Plans]
   *     security: [{ bearerAuth: [] }]
   *     parameters:
   *       - in: path
   *         name: id
   *         schema: { type: string, format: uuid }
   *         required: true
   *         description: ID do plano
   *     responses:
   *       200: { description: 'Plano removido com sucesso.', content: { application/json: { schema: { type: object, properties: { success: { type: boolean }, message: { type: string } } } } } }
   *       400: { description: 'Dados inválidos.' }
   *       404: { description: 'Plano não encontrado.' }
   *       401: { description: 'Não autorizado.' }
   *       500: { description: 'Erro interno do servidor.' }
   */
  delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      await this.planService.delete(Number(id));
      res.status(200).json({ success: true, message: 'Plano removido com sucesso.' });
    } catch (error) {
      next(error);
    }
  };
}

export default PlanController;