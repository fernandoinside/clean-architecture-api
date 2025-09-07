import { Request, Response, NextFunction } from 'express';
import { TicketService } from '../services/TicketService';
import { ITicket } from '../models/Ticket';
import BaseController from './BaseController';

// Extend Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        email: string;
        company_id?: number;
      };
    }
  }
}

/**
 * @swagger
 * tags:
 *   name: Tickets
 *   description: Sistema de tickets de suporte e contato
 */
class TicketController extends BaseController<ITicket> {
  private ticketService: TicketService;

  constructor() {
    const service = new TicketService();
    super(service, 'Ticket');
    this.ticketService = service;
  }

  /**
   * @swagger
   * /tickets:
   *   get:
   *     summary: Lista e busca tickets com filtros e paginação
   *     tags: [Tickets]
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
   *         name: search
   *         schema: { type: string }
   *         description: Buscar por título ou descrição
   *       - in: query
   *         name: status
   *         schema: { type: string, enum: [open, in_progress, pending, resolved, closed] }
   *         description: Filtrar por status
   *       - in: query
   *         name: priority
   *         schema: { type: string, enum: [low, medium, high, urgent] }
   *         description: Filtrar por prioridade
   *       - in: query
   *         name: category
   *         schema: { type: string, enum: [support, contact, technical, billing, feature_request, bug_report] }
   *         description: Filtrar por categoria
   *       - in: query
   *         name: user_id
   *         schema: { type: integer }
   *         description: Filtrar por usuário criador
   *       - in: query
   *         name: assigned_to
   *         schema: { type: integer }
   *         description: Filtrar por usuário responsável
   *       - in: query
   *         name: company_id
   *         schema: { type: integer }
   *         description: Filtrar por empresa
   *       - in: query
   *         name: orderBy
   *         schema: { type: string, enum: [id, title, status, priority, category, created_at, updated_at], default: created_at }
   *         description: Campo para ordenação
   *       - in: query
   *         name: orderDirection
   *         schema: { type: string, enum: [ASC, DESC], default: DESC }
   *         description: Direção da ordenação
   *     responses:
   *       200: { description: 'Lista de tickets retornada com sucesso.', content: { application/json: { schema: { $ref: '#/components/schemas/TicketsResponse' } } } }
   *       400: { description: 'Parâmetros inválidos.' }
   *       401: { description: 'Não autorizado.' }
   *       500: { description: 'Erro interno do servidor.' }
   */
  index = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {
        page = 1,
        limit = 10,
        search,
        status,
        priority,
        category,
        user_id,
        assigned_to,
        company_id,
        orderBy = 'created_at',
        orderDirection = 'DESC'
      } = req.query;

      const filters = {
        search: search as string,
        status: status as ITicket['status'],
        priority: priority as ITicket['priority'],
        category: category as ITicket['category'],
        user_id: user_id ? Number(user_id) : undefined,
        assigned_to: assigned_to ? Number(assigned_to) : undefined,
        company_id: company_id ? Number(company_id) : undefined,
      };

      const options = {
        page: Number(page),
        limit: Number(limit),
        orderBy: orderBy as string,
        orderDirection: orderDirection as 'ASC' | 'DESC',
      };

      const result = await this.ticketService.findWithFilters(filters, options);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };

  /**
   * @swagger
   * /tickets/{id}:
   *   get:
   *     summary: Busca um ticket por ID
   *     tags: [Tickets]
   *     security: [{ bearerAuth: [] }]
   *     parameters:
   *       - in: path
   *         name: id
   *         schema: { type: integer }
   *         required: true
   *         description: ID do ticket
   *     responses:
   *       200: { description: 'Ticket encontrado com sucesso.', content: { application/json: { schema: { $ref: '#/components/schemas/TicketResponse' } } } }
   *       404: { description: 'Ticket não encontrado.' }
   *       400: { description: 'Dados inválidos.' }
   *       401: { description: 'Não autorizado.' }
   *       500: { description: 'Erro interno do servidor.' }
   */
  show = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const ticket = await this.ticketService.findByIdWithDetails(Number(id));
      res.status(200).json({ success: true, data: ticket });
    } catch (error) {
      next(error);
    }
  };

  /**
   * @swagger
   * /tickets:
   *   post:
   *     summary: Cria um novo ticket
   *     tags: [Tickets]
   *     security: [{ bearerAuth: [] }]
   *     requestBody:
   *       required: true
   *       content: { application/json: { schema: { $ref: '#/components/schemas/CreateTicketData' } } }
   *     responses:
   *       201: { description: 'Ticket criado com sucesso.', content: { application/json: { schema: { $ref: '#/components/schemas/TicketResponse' } } } }
   *       400: { description: 'Dados inválidos.' }
   *       401: { description: 'Não autorizado.' }
   *       500: { description: 'Erro interno do servidor.' }
   */
  store = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Adicionar user_id do usuário autenticado
      const ticketData = {
        ...req.body,
        user_id: req.user?.id, // Assumindo que o middleware de auth adiciona o user ao request
        company_id: req.user?.company_id // Opcional: associar à empresa do usuário
      };

      const newTicket = await this.ticketService.createTicket(ticketData);
      res.status(201).json({ success: true, message: 'Ticket criado com sucesso.', data: newTicket });
    } catch (error) {
      next(error);
    }
  };

  /**
   * @swagger
   * /tickets/{id}:
   *   put:
   *     summary: Atualiza um ticket existente
   *     tags: [Tickets]
   *     security: [{ bearerAuth: [] }]
   *     parameters:
   *       - in: path
   *         name: id
   *         schema: { type: integer }
   *         required: true
   *         description: ID do ticket
   *     requestBody:
   *       required: true
   *       content: { application/json: { schema: { $ref: '#/components/schemas/UpdateTicketData' } } }
   *     responses:
   *       200: { description: 'Ticket atualizado com sucesso.', content: { application/json: { schema: { $ref: '#/components/schemas/TicketResponse' } } } }
   *       400: { description: 'Dados inválidos.' }
   *       404: { description: 'Ticket não encontrado.' }
   *       401: { description: 'Não autorizado.' }
   *       500: { description: 'Erro interno do servidor.' }
   */
  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const updatedTicket = await this.ticketService.updateTicket(Number(id), req.body);
      res.status(200).json({ success: true, message: 'Ticket atualizado com sucesso.', data: updatedTicket });
    } catch (error) {
      next(error);
    }
  };

  /**
   * @swagger
   * /tickets/{id}:
   *   delete:
   *     summary: Remove um ticket
   *     tags: [Tickets]
   *     security: [{ bearerAuth: [] }]
   *     parameters:
   *       - in: path
   *         name: id
   *         schema: { type: integer }
   *         required: true
   *         description: ID do ticket
   *     responses:
   *       200: { description: 'Ticket removido com sucesso.', content: { application/json: { schema: { type: object, properties: { success: { type: boolean }, message: { type: string } } } } } }
   *       400: { description: 'Dados inválidos.' }
   *       404: { description: 'Ticket não encontrado.' }
   *       401: { description: 'Não autorizado.' }
   *       500: { description: 'Erro interno do servidor.' }
   */
  delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      await this.ticketService.delete(Number(id));
      res.status(200).json({ success: true, message: 'Ticket removido com sucesso.' });
    } catch (error) {
      next(error);
    }
  };

  /**
   * @swagger
   * /tickets/{id}/assign:
   *   put:
   *     summary: Atribui um ticket a um usuário
   *     tags: [Tickets]
   *     security: [{ bearerAuth: [] }]
   *     parameters:
   *       - in: path
   *         name: id
   *         schema: { type: integer }
   *         required: true
   *         description: ID do ticket
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               assigned_to:
   *                 type: integer
   *                 nullable: true
   *                 description: ID do usuário responsável (null para desatribuir)
   *     responses:
   *       200: { description: 'Ticket atribuído com sucesso.', content: { application/json: { schema: { $ref: '#/components/schemas/TicketResponse' } } } }
   *       400: { description: 'Dados inválidos.' }
   *       404: { description: 'Ticket não encontrado.' }
   *       401: { description: 'Não autorizado.' }
   *       500: { description: 'Erro interno do servidor.' }
   */
  assign = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { assigned_to } = req.body;

      const updatedTicket = await this.ticketService.assignTicket(Number(id), assigned_to);
      res.status(200).json({ success: true, message: 'Ticket atribuído com sucesso.', data: updatedTicket });
    } catch (error) {
      next(error);
    }
  };

  /**
   * @swagger
   * /tickets/{id}/status:
   *   put:
   *     summary: Altera o status de um ticket
   *     tags: [Tickets]
   *     security: [{ bearerAuth: [] }]
   *     parameters:
   *       - in: path
   *         name: id
   *         schema: { type: integer }
   *         required: true
   *         description: ID do ticket
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [status]
   *             properties:
   *               status:
   *                 type: string
   *                 enum: [open, in_progress, pending, resolved, closed]
   *                 description: Novo status do ticket
   *     responses:
   *       200: { description: 'Status do ticket atualizado com sucesso.', content: { application/json: { schema: { $ref: '#/components/schemas/TicketResponse' } } } }
   *       400: { description: 'Dados inválidos.' }
   *       404: { description: 'Ticket não encontrado.' }
   *       401: { description: 'Não autorizado.' }
   *       500: { description: 'Erro interno do servidor.' }
   */
  changeStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const updatedTicket = await this.ticketService.changeStatus(Number(id), status);
      res.status(200).json({ success: true, message: 'Status do ticket atualizado com sucesso.', data: updatedTicket });
    } catch (error) {
      next(error);
    }
  };

  /**
   * @swagger
   * /tickets/stats:
   *   get:
   *     summary: Obter estatísticas dos tickets
   *     tags: [Tickets]
   *     security: [{ bearerAuth: [] }]
   *     parameters:
   *       - in: query
   *         name: user_id
   *         schema: { type: integer }
   *         description: Filtrar por usuário criador
   *       - in: query
   *         name: assigned_to
   *         schema: { type: integer }
   *         description: Filtrar por usuário responsável
   *       - in: query
   *         name: company_id
   *         schema: { type: integer }
   *         description: Filtrar por empresa
   *     responses:
   *       200: { description: 'Estatísticas dos tickets.', content: { application/json: { schema: { $ref: '#/components/schemas/TicketStatsResponse' } } } }
   *       400: { description: 'Parâmetros inválidos.' }
   *       401: { description: 'Não autorizado.' }
   *       500: { description: 'Erro interno do servidor.' }
   */
  stats = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { user_id, assigned_to, company_id } = req.query;

      const filters = {
        user_id: user_id ? Number(user_id) : undefined,
        assigned_to: assigned_to ? Number(assigned_to) : undefined,
        company_id: company_id ? Number(company_id) : undefined,
      };

      const stats = await this.ticketService.getTicketStats(filters);
      res.status(200).json({ success: true, data: stats });
    } catch (error) {
      next(error);
    }
  };
}

export default TicketController;