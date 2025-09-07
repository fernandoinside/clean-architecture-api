import { Request, Response, NextFunction } from 'express';
import { RoleService } from '../services/RoleService';
import { IRole } from '../models/Role';
import BaseController from './BaseController';
import { ValidationError, NotFoundError, ConflictError } from '../utils/errors';
import logger from '../config/logger';

/**
 * Controlador para gerenciamento de papéis/funções
 * @swagger
 * tags:
 *   name: Roles
 *   description: Endpoints para gerenciamento de papéis e funções de usuário
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
class RoleController extends BaseController<IRole> {
  private roleService: RoleService;

  constructor() {
    const service = new RoleService();
    super(service, 'Papel');
    this.roleService = service;
  }

  /**
   * @swagger
   * /roles:
   *   get:
   *     summary: Lista todos os papéis
   *     description: Retorna uma lista paginada de papéis com suporte a filtros
   *     tags: [Roles]
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
   *         description: Filtrar por nome do papel (busca parcial)
   *       - in: query
   *         name: description
   *         schema:
   *           type: string
   *         description: Filtrar por descrição do papel (busca parcial)
   *     responses:
   *       200:
   *         description: Lista de papéis obtida com sucesso
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
   *                     $ref: '#/components/schemas/Role'
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
      const { name, description } = req.query;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      // Validação de parâmetros
      if (page < 1 || limit < 1 || limit > 100) {
        throw new ValidationError('Parâmetros de paginação inválidos');
      }

      const filters = {
        name: name as string,
        description: description as string,
      };

      // Remover filtros vazios
      Object.keys(filters).forEach(key => {
        if ((filters as any)[key] === undefined || (filters as any)[key] === '') {
          delete (filters as any)[key];
        }
      });

      const result = await this.roleService.search(filters, page, limit);
      
      logger.info(`Consulta de papéis realizada: ${result.data.length} itens, página ${page}`);
      
      res.json({
        success: true,
        data: result.data,
        meta: {
          total: result.pagination.total,
          page: result.pagination.page,
          limit: result.pagination.limit,
          totalPages: Math.ceil(result.pagination.total / result.pagination.limit)
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /roles/{id}:
   *   get:
   *     summary: Busca um papel pelo ID
   *     description: Retorna os detalhes de um papel específico com base no ID fornecido
   *     tags: [Roles]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         schema:
   *           type: integer
   *           minimum: 1
   *         required: true
   *         description: ID numérico do papel
   *         example: 1
   *     responses:
   *       200:
   *         description: Papel encontrado com sucesso
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   $ref: '#/components/schemas/Role'
   *             example:
   *               success: true
   *               data:
   *                 id: 1
   *                 name: "Administrador"
   *                 description: "Acesso total ao sistema"
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
   *               message: "ID do papel inválido"
   *       401:
   *         $ref: '#/components/responses/UnauthorizedError'
   *       404:
   *         description: Papel não encontrado
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/responses/NotFoundError'
   *             example:
   *               success: false
   *               message: "Papel não encontrado"
   *       500:
   *         $ref: '#/components/responses/InternalServerError'
   */
  async show(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      
      if (!id) {
        throw new ValidationError('ID do papel não fornecido');
      }
      
      const roleId = Number(id);
      if (isNaN(roleId) || roleId < 1) {
        throw new ValidationError('ID do papel inválido');
      }
      
      const role = await this.roleService.findById(roleId);
      if (!role) {
        throw new NotFoundError('Papel não encontrado');
      }
      
      logger.info(`Papel consultado: ID ${roleId}`);
      
      res.json({ success: true, data: role });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /roles:
   *   post:
   *     summary: Cria um novo papel
   *     description: Cria um novo papel no sistema com os dados fornecidos
   *     tags: [Roles]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/RoleCreate'
   *           example:
   *             name: "Editor"
   *             description: "Pode editar conteúdo mas não gerenciar usuários"
   *     responses:
   *       201:
   *         description: Papel criado com sucesso
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
   *                   example: "Papel criado com sucesso"
   *                 data:
   *                   $ref: '#/components/schemas/Role'
   *             example:
   *               success: true
   *               message: "Papel criado com sucesso"
   *               data:
   *                 id: 3
   *                 name: "Editor"
   *                 description: "Pode editar conteúdo mas não gerenciar usuários"
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
   *         description: Papel com este nome já existe
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/responses/BadRequestError'
   *             example:
   *               success: false
   *               message: "Papel com este nome já existe"
   *       500:
   *         $ref: '#/components/responses/InternalServerError'
   */
  async store(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const roleData = req.body;
      
      logger.info(`Criando novo papel: ${roleData.name || 'N/A'}`);
      
      const newRole = await this.roleService.create(roleData);
      
      logger.info(`Papel criado com sucesso: ID ${newRole?.id}`);
      
      res.status(201).json({
        success: true,
        message: 'Papel criado com sucesso',
        data: newRole
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /roles/{id}:
   *   put:
   *     summary: Atualiza um papel existente
   *     description: Atualiza os dados de um papel existente no sistema
   *     tags: [Roles]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         schema:
   *           type: integer
   *           minimum: 1
   *         required: true
   *         description: ID numérico do papel
   *         example: 1
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/RoleUpdate'
   *           example:
   *             name: "Editor Sênior"
   *             description: "Editor com privilégios estendidos"
   *     responses:
   *       200:
   *         description: Papel atualizado com sucesso
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
   *                   example: "Papel atualizado com sucesso"
   *                 data:
   *                   $ref: '#/components/schemas/Role'
   *             example:
   *               success: true
   *               message: "Papel atualizado com sucesso"
   *               data:
   *                 id: 1
   *                 name: "Editor Sênior"
   *                 description: "Editor com privilégios estendidos"
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
   *                   message: "ID do papel inválido"
   *               validation:
   *                 value:
   *                   success: false
   *                   message: "Dados de entrada inválidos"
   *       401:
   *         $ref: '#/components/responses/UnauthorizedError'
   *       404:
   *         description: Papel não encontrado
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/responses/NotFoundError'
   *             example:
   *               success: false
   *               message: "Papel não encontrado"
   *       409:
   *         description: Papel com este nome já existe
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/responses/BadRequestError'
   *             example:
   *               success: false
   *               message: "Papel com este nome já existe"
   *       500:
   *         $ref: '#/components/responses/InternalServerError'
   */
  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      
      if (!id) {
        throw new ValidationError('ID do papel não fornecido');
      }
      
      const roleId = Number(id);
      if (isNaN(roleId) || roleId < 1) {
        throw new ValidationError('ID do papel inválido');
      }
      
      const updateData = req.body;
      
      logger.info(`Atualizando papel: ID ${roleId}`);
      
      const updatedRole = await this.roleService.update(roleId, updateData);
      if (!updatedRole) {
        throw new NotFoundError('Papel não encontrado');
      }
      
      logger.info(`Papel atualizado com sucesso: ID ${roleId}`);
      
      res.json({
        success: true,
        message: 'Papel atualizado com sucesso',
        data: updatedRole
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /roles/{id}:
   *   delete:
   *     summary: Remove um papel do sistema
   *     description: Remove um papel (soft delete - o registro é marcado como excluído, mas não é removido fisicamente)
   *     tags: [Roles]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         schema:
   *           type: integer
   *           minimum: 1
   *         required: true
   *         description: ID numérico do papel a ser removido
   *         example: 1
   *     responses:
   *       200:
   *         description: Papel removido com sucesso
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
   *                   example: "Papel removido com sucesso"
   *             example:
   *               success: true
   *               message: "Papel removido com sucesso"
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
   *                   message: "ID do papel não fornecido"
   *               invalidId:
   *                 value:
   *                   success: false
   *                   message: "ID do papel inválido"
   *       401:
   *         $ref: '#/components/responses/UnauthorizedError'
   *       404:
   *         description: Papel não encontrado
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/responses/NotFoundError'
   *             example:
   *               success: false
   *               message: "Papel não encontrado"
   *       500:
   *         $ref: '#/components/responses/InternalServerError'
   */
  async destroy(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      
      if (!id) {
        throw new ValidationError('ID do papel não fornecido');
      }
      
      const roleId = Number(id);
      if (isNaN(roleId) || roleId < 1) {
        throw new ValidationError('ID do papel inválido');
      }
      
      logger.info(`Removendo papel: ID ${roleId}`);
      
      const deleted = await this.roleService.delete(roleId);
      if (!deleted) {
        throw new NotFoundError('Papel não encontrado');
      }
      
      logger.info(`Papel removido com sucesso: ID ${roleId}`);
      
      res.json({
        success: true,
        message: 'Papel removido com sucesso'
      });
    } catch (error) {
      next(error);
    }
  }
}

export default RoleController;