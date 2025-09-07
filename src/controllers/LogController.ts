import { Request, Response, NextFunction } from 'express';
import { LogService } from '../services/LogService';
import { ILog } from '../models/Log';
import BaseController from './BaseController';

/**
 * @swagger
 * tags:
 *   name: Logs
 *   description: Gerenciamento de logs do sistema
 */
class LogController extends BaseController<ILog> {
  private logService: LogService;

  constructor() {
    const service = new LogService();
    super(service, 'Log');
    this.logService = service;
  }

  /**
   * @swagger
   * /logs:
   *   get:
   *     summary: Lista e busca logs com filtros e paginação
   *     tags: [Logs]
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
   *         name: level
   *         schema: { type: string, enum: [info, warn, error, debug] }
   *         description: Filtrar por nível de log
   *       - in: query
   *         name: message
   *         schema: { type: string }
   *         description: Filtrar por mensagem de log
   *       - in: query
   *         name: source
   *         schema: { type: string, enum: [frontend, backend] }
   *         description: Filtrar por origem do log
   *     responses:
   *       200: { description: 'Lista de logs.', content: { application/json: { schema: { $ref: '#/components/schemas/LogListResponse' } } } }
   *       400: { description: 'Dados inválidos.' }
   *       401: { description: 'Não autorizado.' }
   *       500: { description: 'Erro interno do servidor.' }
   */
  index = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { level, message, source } = req.query;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const filters = {
        level: level as string,
        message: message as string,
        source: source as 'frontend' | 'backend',
      };

      const result = await this.logService.search(filters, page, limit);
      res.status(200).json({ success: true, data: result.data, pagination: result.pagination });
    } catch (error) {
      next(error);
    }
  };

  /**
   * @swagger
   * /logs/{id}:
   *   get:
   *     summary: Busca um log pelo ID
   *     tags: [Logs]
   *     security: [{ bearerAuth: [] }]
   *     parameters:
   *       - in: path
   *         name: id
   *         schema: { type: string, format: uuid }
   *         required: true
   *         description: ID do log
   *     responses:
   *       200: { description: 'Log encontrado.', content: { application/json: { schema: { $ref: '#/components/schemas/LogResponse' } } } }
   *       404: { description: 'Log não encontrado.' }
   *       400: { description: 'Dados inválidos.' }
   *       401: { description: 'Não autorizado.' }
   *       500: { description: 'Erro interno do servidor.' }
   */
  show = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const log = await this.logService.findById(Number(id));
      res.status(200).json({ success: true, data: log });
    } catch (error) {
      next(error);
    }
  };

  /**
   * @swagger
   * /logs:
   *   post:
   *     summary: Cria um novo log
   *     tags: [Logs]
   *     security: [{ bearerAuth: [] }]
   *     requestBody:
   *       required: true
   *       content: { application/json: { schema: { $ref: '#/components/schemas/LogCreate' } } }
   *     responses:
   *       201: { description: 'Log criado com sucesso.', content: { application/json: { schema: { $ref: '#/components/schemas/LogResponse' } } } }
   *       400: { description: 'Dados inválidos.' }
   *       401: { description: 'Não autorizado.' }
   *       500: { description: 'Erro interno do servidor.' }
   */
  store = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const newLog = await this.logService.create(req.body);
      res.status(201).json({ success: true, message: 'Log criado com sucesso.', data: newLog });
    } catch (error) {
      next(error);
    }
  };

  /**
   * @swagger
   * /logs/{id}:
   *   put:
   *     summary: Atualiza um log existente
   *     tags: [Logs]
   *     security: [{ bearerAuth: [] }]
   *     parameters:
   *       - in: path
   *         name: id
   *         schema: { type: string, format: uuid }
   *         required: true
   *         description: ID do log
   *     requestBody:
   *       required: true
   *       content: { application/json: { schema: { $ref: '#/components/schemas/LogUpdate' } } }
   *     responses:
   *       200: { description: 'Log atualizado com sucesso.', content: { application/json: { schema: { $ref: '#/components/schemas/LogResponse' } } } }
   *       400: { description: 'Dados inválidos.' }
   *       404: { description: 'Log não encontrado.' }
   *       401: { description: 'Não autorizado.' }
   *       500: { description: 'Erro interno do servidor.' }
   */
  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const updatedLog = await this.logService.update(Number(id), req.body);
      res.status(200).json({ success: true, message: 'Log atualizado com sucesso.', data: updatedLog });
    } catch (error) {
      next(error);
    }
  };

  /**
   * @swagger
   * /logs/{id}:
   *   delete:
   *     summary: Remove um log
   *     tags: [Logs]
   *     security: [{ bearerAuth: [] }]
   *     parameters:
   *       - in: path
   *         name: id
   *         schema: { type: string, format: uuid }
   *         required: true
   *         description: ID do log
   *     responses:
   *       200: { description: 'Log removido com sucesso.', content: { application/json: { schema: { type: object, properties: { success: { type: boolean }, message: { type: string } } } } } }
   *       400: { description: 'Dados inválidos.' }
   *       404: { description: 'Log não encontrado.' }
   *       401: { description: 'Não autorizado.' }
   *       500: { description: 'Erro interno do servidor.' }
   */
  delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      await this.logService.delete(Number(id));
      res.status(200).json({ success: true, message: 'Log removido com sucesso.' });
    } catch (error) {
      next(error);
    }
  };
}

export default LogController;