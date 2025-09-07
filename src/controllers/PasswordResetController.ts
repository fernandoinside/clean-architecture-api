import { Request, Response, NextFunction } from 'express';
import { PasswordResetService } from '../services/PasswordResetService';
import { IPasswordReset } from '../models/PasswordReset';
import BaseController from './BaseController';

/**
 * @swagger
 * tags:
 *   name: PasswordResets
 *   description: Gerenciamento de redefinição de senhas
 */
class PasswordResetController extends BaseController<IPasswordReset> {
  private passwordResetService: PasswordResetService;

  constructor() {
    const service = new PasswordResetService();
    super(service, 'Pedido de Redefinição de Senha');
    this.passwordResetService = service;
  }

  /**
   * @swagger
   * /password-resets:
   *   get:
   *     summary: Lista e busca pedidos de redefinição de senha com filtros e paginação
   *     tags: [PasswordResets]
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
   *         name: token
   *         schema: { type: string }
   *         description: Filtrar por token
   *       - in: query
   *         name: used
   *         schema: { type: boolean }
   *         description: Filtrar por status de uso
   *     responses:
   *       200: { description: 'Lista de pedidos de redefinição de senha.', content: { application/json: { schema: { $ref: '#/components/schemas/PasswordResetListResponse' } } } }
   *       400: { description: 'Dados inválidos.' }
   *       401: { description: 'Não autorizado.' }
   *       500: { description: 'Erro interno do servidor.' }
   */
  index = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId, token, used } = req.query;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const filters = {
        userId: userId ? Number(userId) : undefined,
        token: token as string,
        used: used !== undefined ? used === 'true' : undefined,
      };

      const result = await this.passwordResetService.search(filters, page, limit);
      res.status(200).json({ success: true, data: result.data, pagination: result.pagination });
    } catch (error) {
      next(error);
    }
  };

  /**
   * @swagger
   * /password-resets/{id}:
   *   get:
   *     summary: Busca um pedido de redefinição de senha pelo ID
   *     tags: [PasswordResets]
   *     security: [{ bearerAuth: [] }]
   *     parameters:
   *       - in: path
   *         name: id
   *         schema: { type: string, format: uuid }
   *         required: true
   *         description: ID do pedido de redefinição de senha
   *     responses:
   *       200: { description: 'Pedido de redefinição de senha encontrado.', content: { application/json: { schema: { $ref: '#/components/schemas/PasswordResetResponse' } } } }
   *       404: { description: 'Pedido de redefinição de senha não encontrado.' }
   *       400: { description: 'Dados inválidos.' }
   *       401: { description: 'Não autorizado.' }
   *       500: { description: 'Erro interno do servidor.' }
   */
  show = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const passwordReset = await this.passwordResetService.findById(Number(id));
      res.status(200).json({ success: true, data: passwordReset });
    } catch (error) {
      next(error);
    }
  };

  /**
   * @swagger
   * /password-resets:
   *   post:
   *     summary: Cria um novo pedido de redefinição de senha
   *     tags: [PasswordResets]
   *     security: [{ bearerAuth: [] }]
   *     requestBody:
   *       required: true
   *       content: { application/json: { schema: { $ref: '#/components/schemas/PasswordResetCreate' } } }
   *     responses:
   *       201: { description: 'Pedido de redefinição de senha criado com sucesso.', content: { application/json: { schema: { $ref: '#/components/schemas/PasswordResetResponse' } } } }
   *       400: { description: 'Dados inválidos.' }
   *       401: { description: 'Não autorizado.' }
   *       500: { description: 'Erro interno do servidor.' }
   */
  store = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const newPasswordReset = await this.passwordResetService.create(req.body);
      res.status(201).json({ success: true, message: 'Pedido de redefinição de senha criado com sucesso.', data: newPasswordReset });
    } catch (error) {
      next(error);
    }
  };

  /**
   * @swagger
   * /password-resets/{id}:
   *   put:
   *     summary: Atualiza um pedido de redefinição de senha existente
   *     tags: [PasswordResets]
   *     security: [{ bearerAuth: [] }]
   *     parameters:
   *       - in: path
   *         name: id
   *         schema: { type: string, format: uuid }
   *         required: true
   *         description: ID do pedido de redefinição de senha
   *     requestBody:
   *       required: true
   *       content: { application/json: { schema: { $ref: '#/components/schemas/PasswordResetUpdate' } } }
   *     responses:
   *       200: { description: 'Pedido de redefinição de senha atualizado com sucesso.', content: { application/json: { schema: { $ref: '#/components/schemas/PasswordResetResponse' } } } }
   *       400: { description: 'Dados inválidos.' }
   *       404: { description: 'Pedido de redefinição de senha não encontrado.' }
   *       401: { description: 'Não autorizado.' }
   *       500: { description: 'Erro interno do servidor.' }
   */
  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const updatedPasswordReset = await this.passwordResetService.update(Number(id), req.body);
      res.status(200).json({ success: true, message: 'Pedido de redefinição de senha atualizado com sucesso.', data: updatedPasswordReset });
    } catch (error) {
      next(error);
    }
  };

  /**
   * @swagger
   * /password-resets/{id}:
   *   delete:
   *     summary: Remove um pedido de redefinição de senha
   *     tags: [PasswordResets]
   *     security: [{ bearerAuth: [] }]
   *     parameters:
   *       - in: path
   *         name: id
   *         schema: { type: string, format: uuid }
   *         required: true
   *         description: ID do pedido de redefinição de senha
   *     responses:
   *       200: { description: 'Pedido de redefinição de senha removido com sucesso.', content: { application/json: { schema: { type: object, properties: { success: { type: boolean }, message: { type: string } } } } } }
   *       400: { description: 'Dados inválidos.' }
   *       404: { description: 'Pedido de redefinição de senha não encontrado.' }
   *       401: { description: 'Não autorizado.' }
   *       500: { description: 'Erro interno do servidor.' }
   */
  delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      await this.passwordResetService.delete(Number(id));
      res.status(200).json({ success: true, message: 'Pedido de redefinição de senha removido com sucesso.' });
    } catch (error) {
      next(error);
    }
  };
}

export default PasswordResetController;