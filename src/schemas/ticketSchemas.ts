/**
 * @swagger
 * components:
 *   schemas:
 *     Ticket:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           format: int64
 *           description: ID único do ticket
 *         title:
 *           type: string
 *           minLength: 1
 *           maxLength: 200
 *           description: Título do ticket
 *         description:
 *           type: string
 *           minLength: 1
 *           maxLength: 10000
 *           description: Descrição detalhada do ticket
 *         status:
 *           type: string
 *           enum: [open, in_progress, pending, resolved, closed]
 *           default: 'open'
 *           description: Status atual do ticket
 *         priority:
 *           type: string
 *           enum: [low, medium, high, urgent]
 *           default: 'medium'
 *           description: Prioridade do ticket
 *         category:
 *           type: string
 *           enum: [support, contact, technical, billing, feature_request, bug_report]
 *           description: Categoria do ticket
 *         user_id:
 *           type: integer
 *           format: int64
 *           description: ID do usuário que criou o ticket
 *         assigned_to:
 *           type: integer
 *           format: int64
 *           nullable: true
 *           description: ID do usuário responsável pelo ticket
 *         company_id:
 *           type: integer
 *           format: int64
 *           nullable: true
 *           description: ID da empresa relacionada ao ticket
 *         attachments:
 *           type: array
 *           items:
 *             type: string
 *             format: uri
 *           nullable: true
 *           description: URLs dos arquivos anexados
 *         metadata:
 *           type: object
 *           nullable: true
 *           description: Dados extras e configurações
 *         user:
 *           $ref: '#/components/schemas/UserBasic'
 *         assigned_user:
 *           $ref: '#/components/schemas/UserBasic'
 *         company:
 *           $ref: '#/components/schemas/CompanyBasic'
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 * 
 *     CreateTicketData:
 *       type: object
 *       required:
 *         - title
 *         - description
 *         - category
 *       properties:
 *         title:
 *           type: string
 *           minLength: 1
 *           maxLength: 200
 *           description: Título do ticket
 *           example: "Problema com login na aplicação"
 *         description:
 *           type: string
 *           minLength: 1
 *           maxLength: 10000
 *           description: Descrição detalhada do problema ou solicitação
 *           example: "Não consigo fazer login na aplicação usando minhas credenciais. Aparece erro 'Usuário não encontrado'."
 *         priority:
 *           type: string
 *           enum: [low, medium, high, urgent]
 *           default: 'medium'
 *           description: Prioridade do ticket
 *           example: "high"
 *         category:
 *           type: string
 *           enum: [support, contact, technical, billing, feature_request, bug_report]
 *           description: Categoria do ticket
 *           example: "technical"
 *         attachments:
 *           type: array
 *           items:
 *             type: string
 *             format: uri
 *           description: URLs dos arquivos anexados (opcional)
 *           example: ["https://example.com/screenshot.png"]
 *         metadata:
 *           type: object
 *           description: Dados extras (opcional)
 *           example: {"browser": "Chrome 120", "os": "Windows 11"}
 * 
 *     UpdateTicketData:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *           minLength: 1
 *           maxLength: 200
 *           description: Título do ticket
 *         description:
 *           type: string
 *           minLength: 1
 *           maxLength: 10000
 *           description: Descrição detalhada do ticket
 *         status:
 *           type: string
 *           enum: [open, in_progress, pending, resolved, closed]
 *           description: Status do ticket
 *         priority:
 *           type: string
 *           enum: [low, medium, high, urgent]
 *           description: Prioridade do ticket
 *         category:
 *           type: string
 *           enum: [support, contact, technical, billing, feature_request, bug_report]
 *           description: Categoria do ticket
 *         assigned_to:
 *           type: integer
 *           format: int64
 *           nullable: true
 *           description: ID do usuário responsável pelo ticket
 *         attachments:
 *           type: array
 *           items:
 *             type: string
 *             format: uri
 *           description: URLs dos arquivos anexados
 *         metadata:
 *           type: object
 *           description: Dados extras
 * 
 *     TicketResponse:
 *       allOf:
 *         - $ref: '#/components/schemas/ApiResponse'
 *         - type: object
 *           properties:
 *             data:
 *               $ref: '#/components/schemas/Ticket'
 * 
 *     TicketsResponse:
 *       allOf:
 *         - $ref: '#/components/schemas/ApiResponse'
 *         - type: object
 *           properties:
 *             data:
 *               type: object
 *               properties:
 *                 items:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Ticket'
 *                 total:
 *                   type: integer
 *                   description: Total de tickets
 *                 page:
 *                   type: integer
 *                   description: Página atual
 *                 limit:
 *                   type: integer
 *                   description: Itens por página
 *                 pages:
 *                   type: integer
 *                   description: Total de páginas
 * 
 *     TicketStatsResponse:
 *       allOf:
 *         - $ref: '#/components/schemas/ApiResponse'
 *         - type: object
 *           properties:
 *             data:
 *               type: object
 *               properties:
 *                 total:
 *                   type: integer
 *                   description: Total de tickets
 *                 byStatus:
 *                   type: object
 *                   description: Contagem por status
 *                   additionalProperties:
 *                     type: integer
 *                 byPriority:
 *                   type: object
 *                   description: Contagem por prioridade
 *                   additionalProperties:
 *                     type: integer
 *                 byCategory:
 *                   type: object
 *                   description: Contagem por categoria
 *                   additionalProperties:
 *                     type: integer
 * 
 *     UserBasic:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           format: int64
 *         name:
 *           type: string
 *         email:
 *           type: string
 *           format: email
 * 
 *     CompanyBasic:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           format: int64
 *         name:
 *           type: string
 */