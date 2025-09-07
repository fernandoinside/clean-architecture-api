import BaseRouter from './BaseRouter';
import TicketController from '../controllers/TicketController';

/**
 * @swagger
 * tags:
 *   name: Tickets
 *   description: Sistema de tickets de suporte e contato
 */

class TicketRoutes extends BaseRouter<TicketController> {
  constructor() {
    super(new TicketController());
    this.setupRoutes();
  }

  private setupRoutes() {
    // ==================== ROTAS GERAIS ====================

    /**
     * @swagger
     * /tickets:
     *   get:
     *     summary: Lista todos os tickets com filtros e paginação
     *     tags: [Tickets]
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
     *       200:
     *         description: Lista de tickets
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/TicketsResponse'
     *       401:
     *         description: Não autenticado
     */
    this.get('/', 'index', { 
      auth: true, 
      permissions: ['admin', 'manager', 'support']
    });

    /**
     * @swagger
     * /tickets/{id}:
     *   get:
     *     summary: Obtém um ticket pelo ID
     *     tags: [Tickets]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: integer
     *         description: ID do ticket
     *     responses:
     *       200:
     *         description: Dados do ticket
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/TicketResponse'
     *       401:
     *         description: Não autenticado
     *       404:
     *         description: Ticket não encontrado
     */
    this.get('/:id', 'show', { 
      auth: true, 
      permissions: ['admin', 'manager', 'support', 'user']
    });

    /**
     * @swagger
     * /tickets:
     *   post:
     *     summary: Cria um novo ticket
     *     tags: [Tickets]
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/CreateTicketData'
     *     responses:
     *       201:
     *         description: Ticket criado com sucesso
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/TicketResponse'
     *       400:
     *         description: Dados inválidos
     *       401:
     *         description: Não autenticado
     */
    this.post('/', 'store', { 
      auth: true, 
      permissions: ['admin', 'manager', 'support', 'user']
    });

    /**
     * @swagger
     * /tickets/{id}:
     *   put:
     *     summary: Atualiza um ticket existente
     *     tags: [Tickets]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: integer
     *         description: ID do ticket
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/UpdateTicketData'
     *     responses:
     *       200:
     *         description: Ticket atualizado com sucesso
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/TicketResponse'
     *       400:
     *         description: Dados inválidos
     *       401:
     *         description: Não autenticado
     *       404:
     *         description: Ticket não encontrado
     */
    this.put('/:id', 'update', { 
      auth: true, 
      permissions: ['admin', 'manager', 'support']
    });

    /**
     * @swagger
     * /tickets/{id}:
     *   delete:
     *     summary: Remove um ticket
     *     tags: [Tickets]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: integer
     *         description: ID do ticket
     *     responses:
     *       200:
     *         description: Ticket removido com sucesso
     *       401:
     *         description: Não autenticado
     *       404:
     *         description: Ticket não encontrado
     */
    this.delete('/:id', 'delete', { 
      auth: true, 
      permissions: ['admin', 'manager']
    });

    // ==================== ROTAS ESPECÍFICAS ====================

    /**
     * @swagger
     * /tickets/{id}/assign:
     *   put:
     *     summary: Atribui um ticket a um usuário
     *     tags: [Tickets]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: integer
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
     *       200:
     *         description: Ticket atribuído com sucesso
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/TicketResponse'
     *       400:
     *         description: Dados inválidos
     *       401:
     *         description: Não autenticado
     *       404:
     *         description: Ticket não encontrado
     */
    this.put('/:id/assign', 'assign', { 
      auth: true, 
      permissions: ['admin', 'manager', 'support']
    });

    /**
     * @swagger
     * /tickets/{id}/status:
     *   put:
     *     summary: Altera o status de um ticket
     *     tags: [Tickets]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: integer
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
     *       200:
     *         description: Status do ticket atualizado com sucesso
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/TicketResponse'
     *       400:
     *         description: Dados inválidos
     *       401:
     *         description: Não autenticado
     *       404:
     *         description: Ticket não encontrado
     */
    this.put('/:id/status', 'changeStatus', { 
      auth: true, 
      permissions: ['admin', 'manager', 'support']
    });

    /**
     * @swagger
     * /tickets/stats:
     *   get:
     *     summary: Obter estatísticas dos tickets
     *     tags: [Tickets]
     *     security:
     *       - bearerAuth: []
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
     *       200:
     *         description: Estatísticas dos tickets
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/TicketStatsResponse'
     *       401:
     *         description: Não autenticado
     */
    this.get('/stats', 'stats', { 
      auth: true, 
      permissions: ['admin', 'manager', 'support']
    });
  }
}

export default new TicketRoutes().router;