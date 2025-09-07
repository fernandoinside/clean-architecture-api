import { Request, Response, NextFunction } from 'express';
import { SessionService } from '../services/SessionService';
import { ISession } from '../models/Session';
import BaseController from './BaseController';

/**
 * @swagger
 * tags:
 *   name: Sessions
 *   description: Gerenciamento de sessões
 */
class SessionController extends BaseController<ISession> {
  private sessionService: SessionService;

  constructor() {
    const service = new SessionService();
    super(service, 'Sessão');
    this.sessionService = service;
  }

  /**
   * @swagger
   * /sessions:
   *   get:
   *     summary: Lista e busca sessões com filtros e paginação
   *     tags: [Sessions]
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
   *         name: userId
   *         schema: { type: string, format: uuid }
   *         description: Filtrar por ID do usuário
   *       - in: query
   *         name: ipAddress
   *         schema: { type: string }
   *         description: Filtrar por endereço IP
   *       - in: query
   *         name: userAgent
   *         schema: { type: string }
   *         description: Filtrar por user agent
   *       - in: query
   *         name: isActive
   *         schema: { type: boolean }
   *         description: Filtrar por status ativo
   *     responses:
   *       200: { description: 'Lista de sessões.', content: { application/json: { schema: { $ref: '#/components/schemas/SessionListResponse' } } } }
   *       400: { description: 'Dados inválidos.' }
   *       401: { description: 'Não autorizado.' }
   *       500: { description: 'Erro interno do servidor.' }
   */
  index = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId, ipAddress, userAgent, isActive } = req.query;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const filters: any = {
        userId: userId ? Number(userId) : undefined,
        ipAddress: ipAddress ? String(ipAddress) : undefined,
        userAgent: userAgent ? String(userAgent) : undefined,
        isActive: isActive !== undefined ? isActive === 'true' : undefined,
      };

      const result = await this.sessionService.search(filters, page, limit);
      res.status(200).json({ success: true, data: result.data, pagination: result.pagination });
    } catch (error) {
      next(error);
    }
  };

  /**
   * @swagger
   * /sessions/{id}:
   *   get:
   *     summary: Busca uma sessão pelo ID
   *     tags: [Sessions]
   *     security: [{ bearerAuth: [] }]
   *     parameters:
   *       - in: path
   *         name: id
   *         schema: { type: string, format: uuid }
   *         required: true
   *         description: ID da sessão
   *     responses:
   *       200: { description: 'Sessão encontrada.', content: { application/json: { schema: { $ref: '#/components/schemas/SessionResponse' } } } }
   *       404: { description: 'Sessão não encontrada.' }
   *       400: { description: 'Dados inválidos.' }
   *       401: { description: 'Não autorizado.' }
   *       500: { description: 'Erro interno do servidor.' }
   */
  show = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const session = await this.sessionService.findById(Number(id));
      res.status(200).json({ success: true, data: session });
    } catch (error) {
      next(error);
    }
  };

  /**
   * @swagger
   * /sessions:
   *   post:
   *     summary: Cria uma nova sessão
   *     tags: [Sessions]
   *     security: [{ bearerAuth: [] }]
   *     requestBody:
   *       required: true
   *       content: { application/json: { schema: { $ref: '#/components/schemas/SessionCreate' } } }
   *     responses:
   *       201: { description: 'Sessão criada com sucesso.', content: { application/json: { schema: { $ref: '#/components/schemas/SessionResponse' } } } }
   *       400: { description: 'Dados inválidos.' }
   *       401: { description: 'Não autorizado.' }
   *       500: { description: 'Erro interno do servidor.' }
   */
  store = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const newSession = await this.sessionService.create(req.body);
      res.status(201).json({ success: true, message: 'Sessão criada com sucesso.', data: newSession });
    } catch (error) {
      next(error);
    }
  };

  /**
   * @swagger
   * /sessions/{id}:
   *   put:
   *     summary: Atualiza uma sessão existente
   *     tags: [Sessions]
   *     security: [{ bearerAuth: [] }]
   *     parameters:
   *       - in: path
   *         name: id
   *         schema: { type: string, format: uuid }
   *         required: true
   *         description: ID da sessão
   *     requestBody:
   *       required: true
   *       content: { application/json: { schema: { $ref: '#/components/schemas/SessionUpdate' } } }
   *     responses:
   *       200: { description: 'Sessão atualizada com sucesso.', content: { application/json: { schema: { $ref: '#/components/schemas/SessionResponse' } } } }
   *       400: { description: 'Dados inválidos.' }
   *       404: { description: 'Sessão não encontrada.' }
   *       401: { description: 'Não autorizado.' }
   *       500: { description: 'Erro interno do servidor.' }
   */
  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const updatedSession = await this.sessionService.update(Number(id), req.body);
      res.status(200).json({ success: true, message: 'Sessão atualizada com sucesso.', data: updatedSession });
    } catch (error) {
      next(error);
    }
  };

  /**
   * @swagger
   * /sessions/{id}:
   *   delete:
   *     summary: Remove uma sessão
   *     tags: [Sessions]
   *     security: [{ bearerAuth: [] }]
   *     parameters:
   *       - in: path
   *         name: id
   *         schema: { type: string, format: uuid }
   *         required: true
   *         description: ID da sessão
   *     responses:
   *       200: { description: 'Sessão removida com sucesso.', content: { application/json: { schema: { type: object, properties: { success: { type: boolean }, message: { type: string } } } } } }
   *       400: { description: 'Dados inválidos.' }
   *       404: { description: 'Sessão não encontrada.' }
   *       401: { description: 'Não autorizado.' }
   *       500: { description: 'Erro interno do servidor.' }
   */
  delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      await this.sessionService.delete(Number(id));
      res.status(200).json({ success: true, message: 'Sessão removida com sucesso.' });
    } catch (error) {
      next(error);
    }
  };
}

export default SessionController;