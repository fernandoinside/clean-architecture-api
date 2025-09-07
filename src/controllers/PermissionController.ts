import { Request, Response, NextFunction } from 'express';
import BaseController from './BaseController';
import { PermissionService } from '../services/PermissionService';
import { IPermission } from '../models/Permission';
import { ValidationError, NotFoundError, ConflictError } from '../utils/errors';
import logger from '../config/logger';

/**
 * Controlador para gerenciamento de permissões
 * @swagger
 * tags:
 *   name: Permissions
 *   description: Endpoints para gerenciamento de permissões do sistema
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *   responses:
 *     UnauthorizedError:
 *       description: Acesso não autorizado
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               success:
 *                 type: boolean
 *                 example: false
 *               message:
 *                 type: string
 *                 example: Não autorizado
 *     BadRequestError:
 *       description: Requisição inválida
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               success:
 *                 type: boolean
 *                 example: false
 *               message:
 *                 type: string
 *                 example: Dados inválidos
 *               errors:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     field:
 *                       type: string
 *                     message:
 *                       type: string
 *     NotFoundError:
 *       description: Recurso não encontrado
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               success:
 *                 type: boolean
 *                 example: false
 *               message:
 *                 type: string
 *                 example: Recurso não encontrado
 *     InternalServerError:
 *       description: Erro interno do servidor
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               success:
 *                 type: boolean
 *                 example: false
 *               message:
 *                 type: string
 *                 example: Ocorreu um erro interno no servidor
 */
class PermissionController extends BaseController<IPermission> {
  private permissionService: PermissionService;

  constructor() {
    const service = new PermissionService();
    super(service, 'Permissão');
    this.permissionService = service;
  }

  /**
   * @swagger
   * /permissions:
   *   get:
   *     summary: Lista todas as permissões
   *     description: Retorna uma lista paginada de permissões com suporte a filtros
   *     tags: [Permissions]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *           minimum: 1
   *           default: 1
   *         description: Número da página
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *           minimum: 1
   *           maximum: 100
   *           default: 10
   *         description: Quantidade de itens por página
   *       - in: query
   *         name: name
   *         schema:
   *           type: string
   *         description: Filtrar por nome da permissão (busca parcial)
   *       - in: query
   *         name: resource
   *         schema:
   *           type: string
   *         description: Filtrar por recurso (busca parcial)
   *       - in: query
   *         name: action
   *         schema:
   *           type: string
   *         description: Filtrar por ação (busca parcial)
   *     responses:
   *       200:
   *         description: Lista de permissões obtida com sucesso
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
   *                     $ref: '#/components/schemas/Permission'
   *                 meta:
   *                   type: object
   *                   properties:
   *                     total:
   *                       type: integer
   *                       description: Total de itens encontrados
   *                     page:
   *                       type: integer
   *                       description: Página atual
   *                     limit:
   *                       type: integer
   *                       description: Itens por página
   *             example:
   *               success: true
   *               data:
   *                 - id: 1
   *                   name: "users.read"
   *                   resource: "users"
   *                   action: "read"
   *                   description: "Visualizar usuários"
   *                 - id: 2
   *                   name: "users.write"
   *                   resource: "users"
   *                   action: "write"
   *                   description: "Criar e editar usuários"
   *               meta:
   *                 total: 50
   *                 page: 1
   *                 limit: 10
   *                 totalPages: 5
   *       400:
   *         description: Parâmetros de consulta inválidos
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/responses/BadRequestError'
   *             example:
   *               success: false
   *               message: "Parâmetros de paginação inválidos"
   *       401:
   *         $ref: '#/components/responses/UnauthorizedError'
   *       500:
   *         $ref: '#/components/responses/InternalServerError'
   */
  async index(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { page = '1', limit = '10', ...filters } = req.query;
      const pageNumber = parseInt(page as string, 10) || 1;
      const limitNumber = parseInt(limit as string, 10) || 10;

      // Validação de parâmetros
      if (pageNumber < 1 || limitNumber < 1 || limitNumber > 100) {
        throw new ValidationError('Parâmetros de paginação inválidos');
      }

      // Remover filtros vazios
      Object.keys(filters).forEach(key => {
        if (filters[key] === undefined || filters[key] === '') {
          delete filters[key];
        }
      });

      const result = await this.permissionService.search(
        filters as { [key: string]: string },
        pageNumber,
        limitNumber
      );
      
      logger.info(`Consulta de permissões realizada: ${result.data.length} itens, página ${pageNumber}`);

      res.status(200).json({
        success: true,
        data: result.data,
        // Mantém "meta" para compatibilidade com clientes que esperam este formato
        meta: {
          total: result.pagination.total,
          page: result.pagination.page,
          limit: result.pagination.limit,
          totalPages: result.pagination.totalPages ?? Math.ceil(result.pagination.total / result.pagination.limit)
        },
        // Adiciona "pagination" para alinhar com o formato usado em Logs
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /permissions/{id}:
   *   get:
   *     summary: Busca uma permissão pelo ID
   *     description: Retorna os detalhes de uma permissão específica com base no ID fornecido
   *     tags: [Permissions]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         schema:
   *           type: integer
   *           minimum: 1
   *         required: true
   *         description: ID numérico da permissão
   *         example: 1
   *     responses:
   *       200:
   *         description: Permissão encontrada com sucesso
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   $ref: '#/components/schemas/Permission'
   *             example:
   *               success: true
   *               data:
   *                 id: 1
   *                 name: "users.read"
   *                 resource: "users"
   *                 action: "read"
   *                 description: "Visualizar usuários"
   *                 created_at: "2024-01-15T10:30:00Z"
   *                 updated_at: "2024-01-15T10:30:00Z"
   *       400:
   *         description: ID inválido
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/responses/BadRequestError'
   *             example:
   *               success: false
   *               message: "ID da permissão inválido"
   *       401:
   *         $ref: '#/components/responses/UnauthorizedError'
   *       404:
   *         description: Permissão não encontrada
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/responses/NotFoundError'
   *             example:
   *               success: false
   *               message: "Permissão não encontrada"
   *       500:
   *         $ref: '#/components/responses/InternalServerError'
   */
  async show(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      
      if (!id) {
        throw new ValidationError('ID da permissão não fornecido');
      }
      
      const permissionId = Number(id);
      if (isNaN(permissionId) || permissionId < 1) {
        throw new ValidationError('ID da permissão inválido');
      }
      
      const permission = await this.permissionService.findById(permissionId);
      if (!permission) {
        throw new NotFoundError('Permissão não encontrada');
      }
      
      logger.info(`Permissão consultada: ID ${permissionId}`);
      
      res.json({ success: true, data: permission });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /permissions:
   *   post:
   *     summary: Cria uma nova permissão
   *     description: Cria uma nova permissão no sistema com os dados fornecidos
   *     tags: [Permissions]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/PermissionCreate'
   *           example:
   *             name: "customers.delete"
   *             resource: "customers"
   *             action: "delete"
   *             description: "Excluir clientes do sistema"
   *     responses:
   *       201:
   *         description: Permissão criada com sucesso
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 message:
   *                   type: string
   *                   example: "Permissão criada com sucesso"
   *                 data:
   *                   $ref: '#/components/schemas/Permission'
   *             example:
   *               success: true
   *               message: "Permissão criada com sucesso"
   *               data:
   *                 id: 10
   *                 name: "customers.delete"
   *                 resource: "customers"
   *                 action: "delete"
   *                 description: "Excluir clientes do sistema"
   *                 created_at: "2024-01-15T10:30:00Z"
   *                 updated_at: "2024-01-15T10:30:00Z"
   *       400:
   *         description: Dados de entrada inválidos
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/responses/BadRequestError'
   *             example:
   *               success: false
   *               message: "Dados obrigatórios não fornecidos"
   *       401:
   *         $ref: '#/components/responses/UnauthorizedError'
   *       409:
   *         description: Permissão com este nome já existe
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/responses/BadRequestError'
   *             example:
   *               success: false
   *               message: "Permissão com este nome já existe"
   *       500:
   *         $ref: '#/components/responses/InternalServerError'
   */
  async store(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const permissionData = req.body;
      
      logger.info(`Criando nova permissão: ${permissionData.name || 'N/A'}`);
      
      const newPermission = await this.permissionService.create(permissionData);
      
      logger.info(`Permissão criada com sucesso: ID ${newPermission?.id}`);
      
      res.status(201).json({
        success: true,
        message: 'Permissão criada com sucesso',
        data: newPermission
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /permissions/{id}:
   *   put:
   *     summary: Atualiza uma permissão existente
   *     description: Atualiza os dados de uma permissão existente no sistema
   *     tags: [Permissions]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         schema:
   *           type: integer
   *           minimum: 1
   *         required: true
   *         description: ID numérico da permissão
   *         example: 1
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/PermissionUpdate'
   *           example:
   *             name: "customers.manage"
   *             description: "Gerenciar todos os aspectos dos clientes"
   *     responses:
   *       200:
   *         description: Permissão atualizada com sucesso
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 message:
   *                   type: string
   *                   example: "Permissão atualizada com sucesso"
   *                 data:
   *                   $ref: '#/components/schemas/Permission'
   *             example:
   *               success: true
   *               message: "Permissão atualizada com sucesso"
   *               data:
   *                 id: 1
   *                 name: "customers.manage"
   *                 resource: "customers"
   *                 action: "manage"
   *                 description: "Gerenciar todos os aspectos dos clientes"
   *                 updated_at: "2024-01-15T15:45:00Z"
   *       400:
   *         description: Dados inválidos ou ID incorreto
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/responses/BadRequestError'
   *             examples:
   *               invalidId:
   *                 value:
   *                   success: false
   *                   message: "ID da permissão inválido"
   *               validation:
   *                 value:
   *                   success: false
   *                   message: "Dados de entrada inválidos"
   *       401:
   *         $ref: '#/components/responses/UnauthorizedError'
   *       404:
   *         description: Permissão não encontrada
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/responses/NotFoundError'
   *             example:
   *               success: false
   *               message: "Permissão não encontrada"
   *       409:
   *         description: Permissão com este nome já existe
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/responses/BadRequestError'
   *             example:
   *               success: false
   *               message: "Permissão com este nome já existe"
   *       500:
   *         $ref: '#/components/responses/InternalServerError'
   */
  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      
      if (!id) {
        throw new ValidationError('ID da permissão não fornecido');
      }
      
      const permissionId = Number(id);
      if (isNaN(permissionId) || permissionId < 1) {
        throw new ValidationError('ID da permissão inválido');
      }
      
      const updateData = req.body;
      
      logger.info(`Atualizando permissão: ID ${permissionId}`);
      
      const updatedPermission = await this.permissionService.update(permissionId, updateData);
      if (!updatedPermission) {
        throw new NotFoundError('Permissão não encontrada');
      }
      
      logger.info(`Permissão atualizada com sucesso: ID ${permissionId}`);
      
      res.json({
        success: true,
        message: 'Permissão atualizada com sucesso',
        data: updatedPermission
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /permissions/{id}:
   *   delete:
   *     summary: Remove uma permissão do sistema
   *     description: Remove uma permissão (soft delete - o registro é marcado como excluído, mas não é removido fisicamente)
   *     tags: [Permissions]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         schema:
   *           type: integer
   *           minimum: 1
   *         required: true
   *         description: ID numérico da permissão a ser removida
   *         example: 1
   *     responses:
   *       200:
   *         description: Permissão removida com sucesso
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 message:
   *                   type: string
   *                   example: "Permissão removida com sucesso"
   *             example:
   *               success: true
   *               message: "Permissão removida com sucesso"
   *       400:
   *         description: ID inválido
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/responses/BadRequestError'
   *             examples:
   *               noId:
   *                 value:
   *                   success: false
   *                   message: "ID da permissão não fornecido"
   *               invalidId:
   *                 value:
   *                   success: false
   *                   message: "ID da permissão inválido"
   *       401:
   *         $ref: '#/components/responses/UnauthorizedError'
   *       404:
   *         description: Permissão não encontrada
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/responses/NotFoundError'
   *             example:
   *               success: false
   *               message: "Permissão não encontrada"
   *       500:
   *         $ref: '#/components/responses/InternalServerError'
   */
  async destroy(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      
      if (!id) {
        throw new ValidationError('ID da permissão não fornecido');
      }
      
      const permissionId = Number(id);
      if (isNaN(permissionId) || permissionId < 1) {
        throw new ValidationError('ID da permissão inválido');
      }
      
      logger.info(`Removendo permissão: ID ${permissionId}`);
      
      const deleted = await this.permissionService.delete(permissionId);
      if (!deleted) {
        throw new NotFoundError('Permissão não encontrada');
      }
      
      logger.info(`Permissão removida com sucesso: ID ${permissionId}`);
      
      res.json({
        success: true,
        message: 'Permissão removida com sucesso'
      });
    } catch (error) {
      next(error);
    }
  }
}

export default PermissionController;
