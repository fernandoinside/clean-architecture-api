import { Request, Response, NextFunction } from 'express';
import { NotificationService } from '../services/NotificationService';
import { INotification } from '../models/Notification';
import BaseController from './BaseController';

/**
 * @swagger
 * tags:
 *   name: Notifications
 *   description: Gerenciamento de notificações
 */
class NotificationController extends BaseController<INotification> {
  private notificationService: NotificationService;

  constructor() {
    const service = new NotificationService();
    super(service, 'Notificação');
    this.notificationService = service;
  }

  /**
   * @swagger
   * /notifications:
   *   get:
   *     summary: Lista e busca notificações com filtros e paginação
   *     tags: [Notifications]
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
   *         name: user_id
   *         schema: { type: number }
   *         description: Filtrar por ID do usuário
   *       - in: query
   *         name: title
   *         schema: { type: string }
   *         description: Filtrar por título
   *       - in: query
   *         name: type
   *         schema: { type: string, enum: [system, alert, info] }
   *         description: Filtrar por tipo de notificação
   *       - in: query
   *         name: is_read
   *         schema: { type: boolean }
   *         description: Filtrar por status de leitura
   *     responses:
   *       200: { description: 'Lista de notificações.', content: { application/json: { schema: { $ref: '#/components/schemas/NotificationListResponse' } } } }
   *       400: { description: 'Dados inválidos.' }
   *       401: { description: 'Não autorizado.' }
   *       500: { description: 'Erro interno do servidor.' }
   */
  index = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { user_id, title, type, is_read } = req.query;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const filters = {
        user_id: user_id ? Number(user_id) : undefined,
        title: title as string,
        type: type as 'system' | 'alert' | 'info',
        is_read: is_read !== undefined ? is_read === 'true' : undefined,
      };

      const result = await this.notificationService.search(filters, page, limit);
      res.status(200).json({ success: true, data: result.data, pagination: result.pagination });
    } catch (error) {
      next(error);
    }
  };

  /**
   * @swagger
   * /notifications/{id}:
   *   get:
   *     summary: Busca uma notificação pelo ID
   *     tags: [Notifications]
   *     security: [{ bearerAuth: [] }]
   *     parameters:
   *       - in: path
   *         name: id
   *         schema: { type: number }
   *         required: true
   *         description: ID da notificação
   *     responses:
   *       200: { description: 'Notificação encontrada.', content: { application/json: { schema: { $ref: '#/components/schemas/NotificationResponse' } } } }
   *       404: { description: 'Notificação não encontrada.' }
   *       400: { description: 'Dados inválidos.' }
   *       401: { description: 'Não autorizado.' }
   *       500: { description: 'Erro interno do servidor.' }
   */
  show = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const notification = await this.notificationService.findById(Number(id));
      res.status(200).json({ success: true, data: notification });
    } catch (error) {
      next(error);
    }
  };

  /**
   * @swagger
   * /notifications:
   *   post:
   *     summary: Cria uma nova notificação
   *     tags: [Notifications]
   *     security: [{ bearerAuth: [] }]
   *     requestBody:
   *       required: true
   *       content: { application/json: { schema: { $ref: '#/components/schemas/NotificationCreate' } } }
   *     responses:
   *       201: { description: 'Notificação criada com sucesso.', content: { application/json: { schema: { $ref: '#/components/schemas/NotificationResponse' } } } }
   *       400: { description: 'Dados inválidos.' }
   *       401: { description: 'Não autorizado.' }
   *       500: { description: 'Erro interno do servidor.' }
   */
  store = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const newNotification = await this.notificationService.create(req.body);
      res.status(201).json({ success: true, message: 'Notificação criada com sucesso.', data: newNotification });
    } catch (error) {
      next(error);
    }
  };

  /**
   * @swagger
   * /notifications/{id}:
   *   put:
   *     summary: Atualiza uma notificação existente
   *     tags: [Notifications]
   *     security: [{ bearerAuth: [] }]
   *     parameters:
   *       - in: path
   *         name: id
   *         schema: { type: number }
   *         required: true
   *         description: ID da notificação
   *     requestBody:
   *       required: true
   *       content: { application/json: { schema: { $ref: '#/components/schemas/NotificationUpdate' } } }
   *     responses:
   *       200: { description: 'Notificação atualizada com sucesso.', content: { application/json: { schema: { $ref: '#/components/schemas/NotificationResponse' } } } }
   *       400: { description: 'Dados inválidos.' }
   *       404: { description: 'Notificação não encontrada.' }
   *       401: { description: 'Não autorizado.' }
   *       500: { description: 'Erro interno do servidor.' }
   */
  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const updatedNotification = await this.notificationService.update(Number(id), req.body);
      res.status(200).json({ success: true, message: 'Notificação atualizada com sucesso.', data: updatedNotification });
    } catch (error) {
      next(error);
    }
  };

  /**
   * @swagger
   * /notifications/{id}:
   *   delete:
   *     summary: Remove uma notificação
   *     tags: [Notifications]
   *     security: [{ bearerAuth: [] }]
   *     parameters:
   *       - in: path
   *         name: id
   *         schema: { type: number }
   *         required: true
   *         description: ID da notificação
   *     responses:
   *       204: { description: 'Notificação removida com sucesso (sem conteúdo).' }
   *       400: { description: 'Dados inválidos.' }
   *       404: { description: 'Notificação não encontrada.' }
   *       401: { description: 'Não autorizado.' }
   *       500: { description: 'Erro interno do servidor.' }
   */
  delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      await this.notificationService.delete(Number(id));
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };
}

export default NotificationController;