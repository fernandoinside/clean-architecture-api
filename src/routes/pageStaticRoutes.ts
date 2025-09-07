import BaseRouter from './BaseRouter';
import PageStaticController from '../controllers/PageStaticController';
import { 
  createPageStaticSchema, 
  updatePageStaticSchema, 
  listPageStaticsSchema,
  getPageStaticSchema,
  getPageStaticByKeySchema,
  getPageStaticsByTypeSchema,
  bulkUpdateStatusSchema,
  duplicatePageStaticSchema
} from '../schemas/pageStaticSchemas';

/**
 * @swagger
 * tags:
 *   name: PageStatics
 *   description: Gestão de páginas estáticas (Sistema CMS)
 */

class PageStaticRoutes extends BaseRouter<PageStaticController> {
  constructor() {
    super(new PageStaticController());
    this.setupRoutes();
  }

  private setupRoutes() {
    // ==================== ROTAS PÚBLICAS ====================
    
    /**
     * @swagger
     * /page-statics/public:
     *   get:
     *     summary: Lista conteúdo público das páginas ativas (sem autenticação)
     *     tags: [PageStatics]
     *     responses:
     *       200:
     *         description: Conteúdo público das páginas ativas
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                 data:
     *                   type: array
     *                   items:
     *                     $ref: '#/components/schemas/PageStaticPublic'
     */
    this.get('/public', 'getPublicContent', { auth: false });

    /**
     * @swagger
     * /page-statics/key/{key}:
     *   get:
     *     summary: Obtém uma página pela key (rota pública)
     *     tags: [PageStatics]
     *     parameters:
     *       - in: path
     *         name: key
     *         required: true
     *         schema:
     *           type: string
     *         description: Key da página estática
     *     responses:
     *       200:
     *         description: Página estática encontrada
     *       404:
     *         description: Página não encontrada
     */
    this.get('/key/:key', 'getByKey', { auth: false });

    // ==================== ROTAS ADMINISTRATIVAS ====================

    /**
     * @swagger
     * /page-statics:
     *   get:
     *     summary: Lista todas as páginas estáticas com filtros
     *     tags: [PageStatics]
     *     security:
     *       - bearerAuth: []
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
     *     responses:
     *       200:
     *         description: Lista de páginas estáticas
     *       401:
     *         description: Não autenticado
     */
    this.get('/', 'index', { 
      auth: true, 
      permissions: ['admin', 'manager']
    });

    /**
     * @swagger
     * /page-statics/{id}:
     *   get:
     *     summary: Obtém uma página estática pelo ID
     *     tags: [PageStatics]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: integer
     *         description: ID da página estática
     *     responses:
     *       200:
     *         description: Dados da página estática
     *       401:
     *         description: Não autenticado
     *       404:
     *         description: Página não encontrada
     */
    this.get('/:id', 'show', { 
      auth: true, 
      permissions: ['admin', 'manager']
    });

    /**
     * @swagger
     * /page-statics:
     *   post:
     *     summary: Cria uma nova página estática
     *     tags: [PageStatics]
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/PageStaticCreate'
     *     responses:
     *       201:
     *         description: Página estática criada com sucesso
     *       400:
     *         description: Dados inválidos
     *       401:
     *         description: Não autenticado
     *       409:
     *         description: Página com esta key já existe
     */
    this.post('/', 'store', { 
      auth: true, 
      permissions: ['admin', 'manager'],
      validationSchema: createPageStaticSchema 
    });

    /**
     * @swagger
     * /page-statics/{id}:
     *   put:
     *     summary: Atualiza uma página estática existente
     *     tags: [PageStatics]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: integer
     *         description: ID da página estática
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/PageStaticUpdate'
     *     responses:
     *       200:
     *         description: Página estática atualizada com sucesso
     *       400:
     *         description: Dados inválidos
     *       401:
     *         description: Não autenticado
     *       404:
     *         description: Página não encontrada
     */
    this.put('/:id', 'update', { 
      auth: true, 
      permissions: ['admin', 'manager'],
      validationSchema: updatePageStaticSchema 
    });

    /**
     * @swagger
     * /page-statics/{id}:
     *   delete:
     *     summary: Remove uma página estática
     *     tags: [PageStatics]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: integer
     *         description: ID da página estática
     *     responses:
     *       200:
     *         description: Página estática removida com sucesso
     *       401:
     *         description: Não autenticado
     *       404:
     *         description: Página não encontrada
     */
    this.delete('/:id', 'delete', { 
      auth: true, 
      permissions: ['admin', 'manager']
    });

    // ==================== ROTAS ESPECÍFICAS ====================

    /**
     * @swagger
     * /page-statics/type/{type}:
     *   get:
     *     summary: Lista páginas por tipo específico
     *     tags: [PageStatics]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: type
     *         required: true
     *         schema:
     *           type: string
     *           enum: [page, section, banner, config]
     *         description: Tipo das páginas
     *       - in: query
     *         name: activeOnly
     *         schema: { type: boolean, default: true }
     *         description: Se deve retornar apenas páginas ativas
     *     responses:
     *       200:
     *         description: Páginas do tipo especificado
     *       401:
     *         description: Não autenticado
     */
    this.get('/type/:type', 'getByType', { 
      auth: true, 
      permissions: ['admin', 'manager']
    });

    /**
     * @swagger
     * /page-statics/{id}/activate:
     *   patch:
     *     summary: Ativa uma página estática
     *     tags: [PageStatics]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: integer
     *         description: ID da página estática
     *     responses:
     *       200:
     *         description: Página ativada com sucesso
     *       401:
     *         description: Não autenticado
     *       404:
     *         description: Página não encontrada
     */
    this.put('/:id/activate', 'activate', { 
      auth: true, 
      permissions: ['admin', 'manager']
    });

    /**
     * @swagger
     * /page-statics/{id}/deactivate:
     *   patch:
     *     summary: Desativa uma página estática
     *     tags: [PageStatics]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: integer
     *         description: ID da página estática
     *     responses:
     *       200:
     *         description: Página desativada com sucesso
     *       401:
     *         description: Não autenticado
     *       404:
     *         description: Página não encontrada
     */
    this.put('/:id/deactivate', 'deactivate', { 
      auth: true, 
      permissions: ['admin', 'manager']
    });

    /**
     * @swagger
     * /page-statics/bulk-status:
     *   patch:
     *     summary: Atualiza o status de múltiplas páginas
     *     tags: [PageStatics]
     *     security:
     *       - bearerAuth: []
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
     *       200:
     *         description: Status atualizado com sucesso
     *       400:
     *         description: Dados inválidos
     *       401:
     *         description: Não autenticado
     */
    this.put('/bulk-status', 'bulkUpdateStatus', { 
      auth: true, 
      permissions: ['admin', 'manager'],
      validationSchema: bulkUpdateStatusSchema
    });

    /**
     * @swagger
     * /page-statics/{id}/duplicate:
     *   post:
     *     summary: Duplica uma página estática
     *     tags: [PageStatics]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: integer
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
     *       201:
     *         description: Página duplicada com sucesso
     *       400:
     *         description: Dados inválidos
     *       401:
     *         description: Não autenticado
     *       404:
     *         description: Página original não encontrada
     */
    this.post('/:id/duplicate', 'duplicate', { 
      auth: true, 
      permissions: ['admin', 'manager'],
      validationSchema: duplicatePageStaticSchema
    });

    /**
     * @swagger
     * /page-statics/statistics:
     *   get:
     *     summary: Obtém estatísticas das páginas estáticas
     *     tags: [PageStatics]
     *     security:
     *       - bearerAuth: []
     *     responses:
     *       200:
     *         description: Estatísticas das páginas estáticas
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                 data:
     *                   $ref: '#/components/schemas/PageStaticStatistics'
     *       401:
     *         description: Não autenticado
     */
    this.get('/statistics', 'getStatistics', { 
      auth: true, 
      permissions: ['admin', 'manager']
    });
  }
}

export default new PageStaticRoutes().router;