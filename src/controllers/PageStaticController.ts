import { Request, Response, NextFunction } from 'express';
import { PageStaticService } from '../services/PageStaticService';
import { IPageStatic } from '../models/PageStatic';
import BaseController from './BaseController';

/**
 * @swagger
 * tags:
 *   name: PageStatics
 *   description: Gerenciamento de páginas estáticas (CMS)
 */
class PageStaticController extends BaseController<IPageStatic> {
  private pageStaticService: PageStaticService;

  constructor() {
    const service = new PageStaticService();
    super(service, 'Página estática');
    this.pageStaticService = service;
  }

  /**
   * @swagger
   * /page-statics:
   *   get:
   *     summary: Lista e busca páginas estáticas com filtros e paginação
   *     tags: [PageStatics]
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
   *         description: Buscar por título, key ou conteúdo
   *       - in: query
   *         name: type
   *         schema: { type: string, enum: [page, section, banner, config] }
   *         description: Filtrar por tipo
   *       - in: query
   *         name: isActive
   *         schema: { type: boolean }
   *         description: Filtrar por status ativo
   *       - in: query
   *         name: orderBy
   *         schema: { type: string, enum: [id, key, title, type, is_active, order, created_at, updated_at], default: order }
   *         description: Campo para ordenação
   *       - in: query
   *         name: orderDirection
   *         schema: { type: string, enum: [asc, desc], default: asc }
   *         description: Direção da ordenação
   *     responses:
   *       200: { description: 'Lista de páginas estáticas.', content: { application/json: { schema: { $ref: '#/components/schemas/PageStaticListResponse' } } } }
   *       400: { description: 'Dados inválidos.' }
   *       401: { description: 'Não autorizado.' }
   *       500: { description: 'Erro interno do servidor.' }
   */
  index = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { search, type, isActive, orderBy, orderDirection } = req.query;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const filters = {
        search: search as string,
        type: type as 'page' | 'section' | 'banner' | 'config',
        isActive: isActive !== undefined ? isActive === 'true' : undefined,
        orderBy: orderBy as string,
        orderDirection: orderDirection as 'asc' | 'desc'
      };

      const result = await this.pageStaticService.search(filters, page, limit);
      res.status(200).json({ success: true, data: result.data, pagination: result.pagination });
    } catch (error) {
      next(error);
    }
  };

  /**
   * @swagger
   * /page-statics/{id}:
   *   get:
   *     summary: Busca uma página estática pelo ID
   *     tags: [PageStatics]
   *     security: [{ bearerAuth: [] }]
   *     parameters:
   *       - in: path
   *         name: id
   *         schema: { type: integer }
   *         required: true
   *         description: ID da página estática
   *     responses:
   *       200: { description: 'Página estática encontrada.', content: { application/json: { schema: { $ref: '#/components/schemas/PageStaticResponse' } } } }
   *       404: { description: 'Página estática não encontrada.' }
   *       400: { description: 'Dados inválidos.' }
   *       401: { description: 'Não autorizado.' }
   *       500: { description: 'Erro interno do servidor.' }
   */
  show = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const pageStatic = await this.pageStaticService.findById(Number(id));
      res.status(200).json({ success: true, data: pageStatic });
    } catch (error) {
      next(error);
    }
  };

  /**
   * @swagger
   * /page-statics:
   *   post:
   *     summary: Cria uma nova página estática
   *     tags: [PageStatics]
   *     security: [{ bearerAuth: [] }]
   *     requestBody:
   *       required: true
   *       content: { application/json: { schema: { $ref: '#/components/schemas/PageStaticCreate' } } }
   *     responses:
   *       201: { description: 'Página estática criada com sucesso.', content: { application/json: { schema: { $ref: '#/components/schemas/PageStaticResponse' } } } }
   *       400: { description: 'Dados inválidos.' }
   *       409: { description: 'Página com esta key já existe.' }
   *       401: { description: 'Não autorizado.' }
   *       500: { description: 'Erro interno do servidor.' }
   */
  store = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const newPageStatic = await this.pageStaticService.create(req.body);
      res.status(201).json({ success: true, message: 'Página estática criada com sucesso.', data: newPageStatic });
    } catch (error) {
      next(error);
    }
  };

  /**
   * @swagger
   * /page-statics/{id}:
   *   put:
   *     summary: Atualiza uma página estática existente
   *     tags: [PageStatics]
   *     security: [{ bearerAuth: [] }]
   *     parameters:
   *       - in: path
   *         name: id
   *         schema: { type: integer }
   *         required: true
   *         description: ID da página estática
   *     requestBody:
   *       required: true
   *       content: { application/json: { schema: { $ref: '#/components/schemas/PageStaticUpdate' } } }
   *     responses:
   *       200: { description: 'Página estática atualizada com sucesso.', content: { application/json: { schema: { $ref: '#/components/schemas/PageStaticResponse' } } } }
   *       400: { description: 'Dados inválidos.' }
   *       404: { description: 'Página estática não encontrada.' }
   *       409: { description: 'Página com esta key já existe.' }
   *       401: { description: 'Não autorizado.' }
   *       500: { description: 'Erro interno do servidor.' }
   */
  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const updatedPageStatic = await this.pageStaticService.update(Number(id), req.body);
      res.status(200).json({ success: true, message: 'Página estática atualizada com sucesso.', data: updatedPageStatic });
    } catch (error) {
      next(error);
    }
  };

  /**
   * @swagger
   * /page-statics/{id}:
   *   delete:
   *     summary: Remove uma página estática
   *     tags: [PageStatics]
   *     security: [{ bearerAuth: [] }]
   *     parameters:
   *       - in: path
   *         name: id
   *         schema: { type: integer }
   *         required: true
   *         description: ID da página estática
   *     responses:
   *       200: { description: 'Página estática removida com sucesso.', content: { application/json: { schema: { type: object, properties: { success: { type: boolean }, message: { type: string } } } } } }
   *       400: { description: 'Dados inválidos.' }
   *       404: { description: 'Página estática não encontrada.' }
   *       401: { description: 'Não autorizado.' }
   *       500: { description: 'Erro interno do servidor.' }
   */
  delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      await this.pageStaticService.delete(Number(id));
      res.status(200).json({ success: true, message: 'Página estática removida com sucesso.' });
    } catch (error) {
      next(error);
    }
  };

  /**
   * @swagger
   * /page-statics/public:
   *   get:
   *     summary: Busca conteúdo público de páginas ativas (sem autenticação)
   *     tags: [PageStatics]
   *     responses:
   *       200: 
   *         description: 'Conteúdo público das páginas ativas.'
   *         content: 
   *           application/json: 
   *             schema: 
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/PageStaticPublic'
   *       500: { description: 'Erro interno do servidor.' }
   */
  getPublicContent = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const content = await this.pageStaticService.getPublicContent();
      res.status(200).json({ success: true, data: content });
    } catch (error) {
      next(error);
    }
  };

  /**
   * @swagger
   * /page-statics/key/{key}:
   *   get:
   *     summary: Busca uma página estática pela key (público)
   *     tags: [PageStatics]
   *     parameters:
   *       - in: path
   *         name: key
   *         schema: { type: string }
   *         required: true
   *         description: Key da página estática
   *     responses:
   *       200: { description: 'Página estática encontrada.', content: { application/json: { schema: { type: object, properties: { success: { type: boolean }, data: { $ref: '#/components/schemas/PageStaticPublic' } } } } } }
   *       404: { description: 'Página estática não encontrada.' }
   *       500: { description: 'Erro interno do servidor.' }
   */
  getByKey = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      const { key } = req.params;
      if (!key) {
        return res.status(400).json({ success: false, message: 'Key é obrigatória' });
      }
      const pageStatic = await this.pageStaticService.findByKey(key);
      
      if (!pageStatic) {
        return res.status(404).json({ success: false, message: 'Página estática não encontrada' });
      }
      
      // Retornar apenas dados públicos
      const publicData = {
        id: pageStatic.id,
        key: pageStatic.key,
        title: pageStatic.title,
        content: pageStatic.content,
        type: pageStatic.type,
        order: pageStatic.order,
        metadata: pageStatic.metadata
      };
      
      res.status(200).json({ success: true, data: publicData });
    } catch (error) {
      next(error);
    }
  };

  /**
   * @swagger
   * /page-statics/type/{type}:
   *   get:
   *     summary: Busca páginas estáticas por tipo
   *     tags: [PageStatics]
   *     security: [{ bearerAuth: [] }]
   *     parameters:
   *       - in: path
   *         name: type
   *         schema: { type: string, enum: [page, section, banner, config] }
   *         required: true
   *         description: Tipo das páginas
   *       - in: query
   *         name: activeOnly
   *         schema: { type: boolean, default: true }
   *         description: Se deve retornar apenas páginas ativas
   *     responses:
   *       200: { description: 'Páginas estáticas encontradas.', content: { application/json: { schema: { type: object, properties: { success: { type: boolean }, data: { type: array, items: { $ref: '#/components/schemas/PageStatic' } } } } } } }
   *       400: { description: 'Dados inválidos.' }
   *       401: { description: 'Não autorizado.' }
   *       500: { description: 'Erro interno do servidor.' }
   */
  getByType = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { type } = req.params;
      const activeOnly = req.query.activeOnly !== 'false';
      
      const pages = await this.pageStaticService.getPagesByType(
        type as 'page' | 'section' | 'banner' | 'config',
        activeOnly
      );
      
      res.status(200).json({ success: true, data: pages });
    } catch (error) {
      next(error);
    }
  };

  /**
   * @swagger
   * /page-statics/{id}/activate:
   *   patch:
   *     summary: Ativa uma página estática
   *     tags: [PageStatics]
   *     security: [{ bearerAuth: [] }]
   *     parameters:
   *       - in: path
   *         name: id
   *         schema: { type: integer }
   *         required: true
   *         description: ID da página estática
   *     responses:
   *       200: { description: 'Página ativada com sucesso.' }
   *       404: { description: 'Página não encontrada.' }
   *       401: { description: 'Não autorizado.' }
   *       500: { description: 'Erro interno do servidor.' }
   */
  activate = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const success = await this.pageStaticService.activatePage(Number(id));
      
      if (success) {
        res.status(200).json({ success: true, message: 'Página ativada com sucesso.' });
      } else {
        res.status(404).json({ success: false, message: 'Página não encontrada.' });
      }
    } catch (error) {
      next(error);
    }
  };

  /**
   * @swagger
   * /page-statics/{id}/deactivate:
   *   patch:
   *     summary: Desativa uma página estática
   *     tags: [PageStatics]
   *     security: [{ bearerAuth: [] }]
   *     parameters:
   *       - in: path
   *         name: id
   *         schema: { type: integer }
   *         required: true
   *         description: ID da página estática
   *     responses:
   *       200: { description: 'Página desativada com sucesso.' }
   *       404: { description: 'Página não encontrada.' }
   *       401: { description: 'Não autorizado.' }
   *       500: { description: 'Erro interno do servidor.' }
   */
  deactivate = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const success = await this.pageStaticService.deactivatePage(Number(id));
      
      if (success) {
        res.status(200).json({ success: true, message: 'Página desativada com sucesso.' });
      } else {
        res.status(404).json({ success: false, message: 'Página não encontrada.' });
      }
    } catch (error) {
      next(error);
    }
  };

  /**
   * @swagger
   * /page-statics/bulk-status:
   *   patch:
   *     summary: Atualiza o status de múltiplas páginas
   *     tags: [PageStatics]
   *     security: [{ bearerAuth: [] }]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [ids, isActive]
   *             properties:
   *               ids:
   *                 type: array
   *                 items: { type: integer }
   *                 description: IDs das páginas
   *               isActive:
   *                 type: boolean
   *                 description: Status a ser aplicado
   *     responses:
   *       200: { description: 'Status atualizado com sucesso.' }
   *       400: { description: 'Dados inválidos.' }
   *       401: { description: 'Não autorizado.' }
   *       500: { description: 'Erro interno do servidor.' }
   */
  bulkUpdateStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { ids, isActive } = req.body;
      const updated = await this.pageStaticService.bulkUpdateStatus(ids, isActive);
      
      res.status(200).json({ 
        success: true, 
        message: `${updated} página(s) ${isActive ? 'ativada(s)' : 'desativada(s)'} com sucesso.`,
        data: { updated }
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * @swagger
   * /page-statics/{id}/duplicate:
   *   post:
   *     summary: Duplica uma página estática
   *     tags: [PageStatics]
   *     security: [{ bearerAuth: [] }]
   *     parameters:
   *       - in: path
   *         name: id
   *         schema: { type: integer }
   *         required: true
   *         description: ID da página a ser duplicada
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [newKey, newTitle]
   *             properties:
   *               newKey:
   *                 type: string
   *                 pattern: '^[a-z0-9-_]+$'
   *                 description: Nova key para a página duplicada
   *               newTitle:
   *                 type: string
   *                 description: Novo título para a página duplicada
   *     responses:
   *       201: { description: 'Página duplicada com sucesso.', content: { application/json: { schema: { $ref: '#/components/schemas/PageStaticResponse' } } } }
   *       400: { description: 'Dados inválidos.' }
   *       404: { description: 'Página original não encontrada.' }
   *       409: { description: 'Página com a nova key já existe.' }
   *       401: { description: 'Não autorizado.' }
   *       500: { description: 'Erro interno do servidor.' }
   */
  duplicate = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { newKey, newTitle } = req.body;
      
      const duplicated = await this.pageStaticService.duplicatePage(Number(id), newKey, newTitle);
      
      res.status(201).json({ 
        success: true, 
        message: 'Página duplicada com sucesso.', 
        data: duplicated 
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * @swagger
   * /page-statics/statistics:
   *   get:
   *     summary: Obtém estatísticas das páginas estáticas
   *     tags: [PageStatics]
   *     security: [{ bearerAuth: [] }]
   *     responses:
   *       200: 
   *         description: 'Estatísticas das páginas estáticas.'
   *         content: 
   *           application/json: 
   *             schema: 
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                 data:
   *                   $ref: '#/components/schemas/PageStaticStatistics'
   *       401: { description: 'Não autorizado.' }
   *       500: { description: 'Erro interno do servidor.' }
   */
  getStatistics = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const statistics = await this.pageStaticService.getStatistics();
      res.status(200).json({ success: true, data: statistics });
    } catch (error) {
      next(error);
    }
  };
}

export default PageStaticController;