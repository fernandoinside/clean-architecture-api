/**
 * @swagger
 * components:
 *   schemas:
 *     Pagination:
 *       type: object
 *       properties:
 *         total:
 *           type: integer
 *           description: Total de registros encontrados
 *           example: 100
 *         page:
 *           type: integer
 *           description: Página atual
 *           example: 1
 *         limit:
 *           type: integer
 *           description: Quantidade de itens por página
 *           example: 10
 *         totalPages:
 *           type: integer
 *           description: Total de páginas
 *           example: 10
 *
 *     SuccessResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: "Operação realizada com sucesso"
 *
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         error:
 *           type: object
 *           properties:
 *             message:
 *               type: string
 *               example: "Mensagem de erro"
 *             details:
 *               type: object
 *               example: {}
 *
 *     ValidationError:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         error:
 *           type: object
 *           properties:
 *             message:
 *               type: string
 *               example: "Dados de entrada inválidos"
 *             details:
 *               type: object
 *               properties:
 *                 field:
 *                   type: string
 *                   example: "email"
 *                 message:
 *                   type: string
 *                   example: "Email é obrigatório"
 *
 *     UnauthorizedError:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         error:
 *           type: object
 *           properties:
 *             message:
 *               type: string
 *               example: "Não autorizado"
 *
 *     NotFoundError:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         error:
 *           type: object
 *           properties:
 *             message:
 *               type: string
 *               example: "Recurso não encontrado"
 *
 *     InternalServerError:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         error:
 *           type: object
 *           properties:
 *             message:
 *               type: string
 *               example: "Erro interno do servidor"
 *
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *       description: JWT token obtido através do endpoint de login
 *
 *   responses:
 *     UnauthorizedError:
 *       description: Acesso não autorizado - Token JWT inválido ou ausente
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UnauthorizedError'
 *
 *     ValidationError:
 *       description: Dados de entrada inválidos
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ValidationError'
 *
 *     NotFoundError:
 *       description: Recurso não encontrado
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NotFoundError'
 *
 *     InternalServerError:
 *       description: Erro interno do servidor
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/InternalServerError'
 */