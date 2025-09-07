import { Request, Response, NextFunction } from 'express';
import { RolePermissionService } from '../services/RolePermissionService';
import { IRolePermission } from '../models/RolePermission';
import BaseController from './BaseController';
import { ValidationError, NotFoundError } from '../utils/errors';
import logger from '../config/logger';

/**
 * @swagger
 * tags:
 *   name: Role Permissions
 *   description: Gerenciamento de associações entre papéis e permissões
 */
class RolePermissionController extends BaseController<IRolePermission> {
  private rolePermissionService: RolePermissionService;

  constructor() {
    const service = new RolePermissionService();
    super(service, 'Associação Role-Permission');
    this.rolePermissionService = service;
  }

  /**
   * @swagger
   * /role-permissions:
   *   get:
   *     summary: Lista todas as associações role-permission
   *     description: Retorna uma lista paginada de associações com dados detalhados
   *     tags: [Role Permissions]
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
   *         name: role_id
   *         schema: { type: integer }
   *         description: Filtrar por ID do papel
   *       - in: query
   *         name: permission_id
   *         schema: { type: integer }
   *         description: Filtrar por ID da permissão
   *       - in: query
   *         name: role_name
   *         schema: { type: string }
   *         description: Filtrar por nome do papel
   *       - in: query
   *         name: permission_name
   *         schema: { type: string }
   *         description: Filtrar por nome da permissão
   *       - in: query
   *         name: resource
   *         schema: { type: string }
   *         description: Filtrar por recurso da permissão
   *     responses:
   *       200:
   *         description: Lista de associações role-permission
   *       401:
   *         description: Não autorizado
   *       500:
   *         description: Erro interno do servidor
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

      // Converter filtros numéricos
      const processedFilters: any = { ...filters };
      if (filters.role_id) {
        processedFilters.role_id = parseInt(filters.role_id as string, 10);
      }
      if (filters.permission_id) {
        processedFilters.permission_id = parseInt(filters.permission_id as string, 10);
      }

      const result = await this.rolePermissionService.search(
        processedFilters,
        pageNumber,
        limitNumber
      );
      
      logger.info(`Consulta de associações role-permission realizada: ${result.data.length} itens, página ${pageNumber}`);

      res.json({
        success: true,
        data: result.data,
        meta: {
          total: result.pagination.total,
          page: result.pagination.page,
          limit: result.pagination.limit,
          totalPages: result.pagination.totalPages
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /role-permissions/{id}:
   *   get:
   *     summary: Busca uma associação role-permission pelo ID
   *     tags: [Role Permissions]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         schema: { type: integer }
   *         required: true
   *         description: ID da associação
   *     responses:
   *       200:
   *         description: Associação encontrada
   *       404:
   *         description: Associação não encontrada
   *       401:
   *         description: Não autorizado
   *       500:
   *         description: Erro interno do servidor
   */
  async show(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      
      if (!id) {
        throw new ValidationError('ID da associação não fornecido');
      }
      
      const associationId = Number(id);
      if (isNaN(associationId) || associationId < 1) {
        throw new ValidationError('ID da associação inválido');
      }
      
      const association = await this.rolePermissionService.findById(associationId);
      if (!association) {
        throw new NotFoundError('Associação role-permission não encontrada');
      }
      
      logger.info(`Associação role-permission consultada: ID ${associationId}`);
      
      res.json({ success: true, data: association });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /role-permissions:
   *   post:
   *     summary: Cria uma nova associação role-permission
   *     tags: [Role Permissions]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - role_id
   *               - permission_id
   *             properties:
   *               role_id:
   *                 type: integer
   *                 description: ID do papel
   *                 example: 1
   *               permission_id:
   *                 type: integer
   *                 description: ID da permissão
   *                 example: 5
   *     responses:
   *       201:
   *         description: Associação criada com sucesso
   *       400:
   *         description: Dados inválidos
   *       409:
   *         description: Associação já existe
   *       401:
   *         description: Não autorizado
   *       500:
   *         description: Erro interno do servidor
   */
  async store(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const associationData = req.body;
      
      logger.info(`Criando nova associação role-permission: Role ${associationData.role_id} - Permission ${associationData.permission_id}`);
      
      const newAssociation = await this.rolePermissionService.create(associationData);
      
      logger.info(`Associação role-permission criada com sucesso: ID ${newAssociation?.id}`);
      
      res.status(201).json({
        success: true,
        message: 'Associação role-permission criada com sucesso',
        data: newAssociation
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /role-permissions/{id}:
   *   delete:
   *     summary: Remove uma associação role-permission
   *     tags: [Role Permissions]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         schema: { type: integer }
   *         required: true
   *         description: ID da associação a ser removida
   *     responses:
   *       200:
   *         description: Associação removida com sucesso
   *       404:
   *         description: Associação não encontrada
   *       401:
   *         description: Não autorizado
   *       500:
   *         description: Erro interno do servidor
   */
  async destroy(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      
      if (!id) {
        throw new ValidationError('ID da associação não fornecido');
      }
      
      const associationId = Number(id);
      if (isNaN(associationId) || associationId < 1) {
        throw new ValidationError('ID da associação inválido');
      }
      
      logger.info(`Removendo associação role-permission: ID ${associationId}`);
      
      const deleted = await this.rolePermissionService.delete(associationId);
      if (!deleted) {
        throw new NotFoundError('Associação role-permission não encontrada');
      }
      
      logger.info(`Associação role-permission removida com sucesso: ID ${associationId}`);
      
      res.json({
        success: true,
        message: 'Associação role-permission removida com sucesso'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /role-permissions/roles/{roleId}/permissions:
   *   get:
   *     summary: Lista todas as permissões de um papel específico
   *     tags: [Role Permissions]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: roleId
   *         schema: { type: integer }
   *         required: true
   *         description: ID do papel
   *     responses:
   *       200:
   *         description: Lista de permissões do papel
   *       404:
   *         description: Papel não encontrado
   *       401:
   *         description: Não autorizado
   *       500:
   *         description: Erro interno do servidor
   */
  async getPermissionsByRole(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { roleId } = req.params;
      
      if (!roleId) {
        throw new ValidationError('ID do papel não fornecido');
      }
      
      const roleIdNumber = Number(roleId);
      if (isNaN(roleIdNumber) || roleIdNumber < 1) {
        throw new ValidationError('ID do papel inválido');
      }
      
      const permissions = await this.rolePermissionService.findPermissionsByRoleId(roleIdNumber);
      
      logger.info(`Consulta de permissões do papel ${roleIdNumber}: ${permissions.length} permissões encontradas`);
      
      res.json({
        success: true,
        data: permissions
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /role-permissions/permissions/{permissionId}/roles:
   *   get:
   *     summary: Lista todos os papéis que têm uma permissão específica
   *     tags: [Role Permissions]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: permissionId
   *         schema: { type: integer }
   *         required: true
   *         description: ID da permissão
   *     responses:
   *       200:
   *         description: Lista de papéis com a permissão
   *       404:
   *         description: Permissão não encontrada
   *       401:
   *         description: Não autorizado
   *       500:
   *         description: Erro interno do servidor
   */
  async getRolesByPermission(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { permissionId } = req.params;
      
      if (!permissionId) {
        throw new ValidationError('ID da permissão não fornecido');
      }
      
      const permissionIdNumber = Number(permissionId);
      if (isNaN(permissionIdNumber) || permissionIdNumber < 1) {
        throw new ValidationError('ID da permissão inválido');
      }
      
      const roles = await this.rolePermissionService.findRolesByPermissionId(permissionIdNumber);
      
      logger.info(`Consulta de papéis da permissão ${permissionIdNumber}: ${roles.length} papéis encontrados`);
      
      res.json({
        success: true,
        data: roles
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /role-permissions/roles/{roleId}/permissions:
   *   put:
   *     summary: Define todas as permissões de um papel (substitui as existentes)
   *     tags: [Role Permissions]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: roleId
   *         schema: { type: integer }
   *         required: true
   *         description: ID do papel
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - permission_ids
   *             properties:
   *               permission_ids:
   *                 type: array
   *                 items:
   *                   type: integer
   *                 description: Array com IDs das permissões
   *                 example: [1, 3, 5, 7]
   *     responses:
   *       200:
   *         description: Permissões do papel atualizadas com sucesso
   *       400:
   *         description: Dados inválidos
   *       404:
   *         description: Papel não encontrado
   *       401:
   *         description: Não autorizado
   *       500:
   *         description: Erro interno do servidor
   */
  async setRolePermissions(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { roleId } = req.params;
      const { permission_ids } = req.body;
      
      if (!roleId) {
        throw new ValidationError('ID do papel não fornecido');
      }
      
      const roleIdNumber = Number(roleId);
      if (isNaN(roleIdNumber) || roleIdNumber < 1) {
        throw new ValidationError('ID do papel inválido');
      }
      
      logger.info(`Definindo permissões do papel ${roleIdNumber}: ${permission_ids?.length || 0} permissões`);
      
      const updatedAssociations = await this.rolePermissionService.setRolePermissions(roleIdNumber, permission_ids || []);
      
      logger.info(`Permissões do papel ${roleIdNumber} atualizadas com sucesso`);
      
      res.json({
        success: true,
        message: 'Permissões do papel atualizadas com sucesso',
        data: updatedAssociations
      });
    } catch (error) {
      next(error);
    }
  }
}

export default RolePermissionController;