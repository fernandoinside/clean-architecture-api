import { Request, Response, NextFunction } from 'express';
import { SettingService } from '../services/SettingService';
import { ISetting } from '../models/Setting';
import BaseController from './BaseController';

/**
 * @swagger
 * tags:
 *   name: Settings
 *   description: Gerenciamento de configurações
 */
class SettingController extends BaseController<ISetting> {
  private settingService: SettingService;

  constructor() {
    const service = new SettingService();
    super(service, 'Configuração');
    this.settingService = service;
  }

  /**
   * @swagger
   * /settings:
   *   get:
   *     summary: Lista e busca configurações com filtros e paginação
   *     tags: [Settings]
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
   *         name: key
   *         schema: { type: string }
   *         description: Filtrar por chave da configuração
   *       - in: query
   *         name: value
   *         schema: { type: string }
   *         description: Filtrar por valor da configuração
   *       - in: query
   *         name: type
   *         schema: { type: string, enum: [string, number, boolean, json] }
   *         description: Filtrar por tipo da configuração
   *     responses:
   *       200: { description: 'Lista de configurações.', content: { application/json: { schema: { $ref: '#/components/schemas/SettingListResponse' } } } }
   *       400: { description: 'Dados inválidos.' }
   *       401: { description: 'Não autorizado.' }
   *       500: { description: 'Erro interno do servidor.' }
   */
  index = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { key, value, type } = req.query;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const filters = {
        key: key as string,
        value: value as string,
        type: type as 'string' | 'number' | 'boolean' | 'json',
      };

      const result = await this.settingService.search(filters, page, limit);
      res.status(200).json({ success: true, data: result.data, pagination: result.pagination });
    } catch (error) {
      next(error);
    }
  };

  /**
   * @swagger
   * /settings/{id}:
   *   get:
   *     summary: Busca uma configuração pelo ID
   *     tags: [Settings]
   *     security: [{ bearerAuth: [] }]
   *     parameters:
   *       - in: path
   *         name: id
   *         schema: { type: string, format: uuid }
   *         required: true
   *         description: ID da configuração
   *     responses:
   *       200: { description: 'Configuração encontrada.', content: { application/json: { schema: { $ref: '#/components/schemas/SettingResponse' } } } } 
   *       404: { description: 'Configuração não encontrada.' }
   *       400: { description: 'Dados inválidos.' }
   *       401: { description: 'Não autorizado.' }
   *       500: { description: 'Erro interno do servidor.' }
   */
  show = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const setting = await this.settingService.findById(Number(id));
      res.status(200).json({ success: true, data: setting });
    } catch (error) {
      next(error);
    }
  };

  /**
   * @swagger
   * /settings:
   *   post:
   *     summary: Cria uma nova configuração
   *     tags: [Settings]
   *     security: [{ bearerAuth: [] }]
   *     requestBody:
   *       required: true
   *       content: { application/json: { schema: { $ref: '#/components/schemas/SettingCreate' } } }
   *     responses:
   *       201: { description: 'Configuração criada com sucesso.', content: { application/json: { schema: { $ref: '#/components/schemas/SettingResponse' } } } }
   *       400: { description: 'Dados inválidos.' }
   *       409: { description: 'Configuração com esta chave já existe.' }
   *       401: { description: 'Não autorizado.' }
   *       500: { description: 'Erro interno do servidor.' }
   */
  store = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const newSetting = await this.settingService.create(req.body);
      res.status(201).json({ success: true, message: 'Configuração criada com sucesso.', data: newSetting });
    } catch (error) {
      next(error);
    }
  };

  /**
   * @swagger
   * /settings/{id}:
   *   put:
   *     summary: Atualiza uma configuração existente
   *     tags: [Settings]
   *     security: [{ bearerAuth: [] }]
   *     parameters:
   *       - in: path
   *         name: id
   *         schema: { type: string, format: uuid }
   *         required: true
   *         description: ID da configuração
   *     requestBody:
   *       required: true
   *       content: { application/json: { schema: { $ref: '#/components/schemas/SettingUpdate' } } }
   *     responses:
   *       200: { description: 'Configuração atualizada com sucesso.', content: { application/json: { schema: { $ref: '#/components/schemas/SettingResponse' } } } }
   *       400: { description: 'Dados inválidos.' }
   *       404: { description: 'Configuração não encontrada.' }
   *       409: { description: 'Configuração com esta chave já existe.' }
   *       401: { description: 'Não autorizado.' }
   *       500: { description: 'Erro interno do servidor.' }
   */
  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const updatedSetting = await this.settingService.update(Number(id), req.body);
      res.status(200).json({ success: true, message: 'Configuração atualizada com sucesso.', data: updatedSetting });
    } catch (error) {
      next(error);
    }
  };

  /**
   * @swagger
   * /settings/{id}:
   *   delete:
   *     summary: Remove uma configuração
   *     tags: [Settings]
   *     security: [{ bearerAuth: [] }]
   *     parameters:
   *       - in: path
   *         name: id
   *         schema: { type: string, format: uuid }
   *         required: true
   *         description: ID da configuração
   *     responses:
   *       200: { description: 'Configuração removida com sucesso.', content: { application/json: { schema: { type: object, properties: { success: { type: boolean }, message: { type: string } } } } } }
   *       400: { description: 'Dados inválidos.' }
   *       404: { description: 'Configuração não encontrada.' }
   *       401: { description: 'Não autorizado.' }
   *       500: { description: 'Erro interno do servidor.' }
   */
  delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      await this.settingService.delete(Number(id));
      res.status(200).json({ success: true, message: 'Configuração removida com sucesso.' });
    } catch (error) {
      next(error);
    }
  };
}

export default SettingController;