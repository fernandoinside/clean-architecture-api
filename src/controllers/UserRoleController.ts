import { Request, Response, NextFunction } from 'express';
import { UserRoleService } from '../services/UserRoleService';
import { IUserRole } from '../models/UserRole';
import BaseController from './BaseController';
import { ValidationError, NotFoundError } from '../utils/errors';
import logger from '../config/logger';

/**
 * @swagger
 * tags:
 *   name: User Roles
 *   description: Gerenciamento de associações entre usuários e papéis
 */
class UserRoleController extends BaseController<IUserRole> {
  private userRoleService: UserRoleService;

  constructor() {
    const service = new UserRoleService();
    super(service, 'Associação User-Role');
    this.userRoleService = service;
  }

  /**
   * @swagger
   * /user-roles:
   *   get:
   *     summary: Lista todas as associações user-role
   *     description: Retorna uma lista paginada de associações com dados detalhados
   *     tags: [User Roles]
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
   *         name: user_id
   *         schema: { type: integer }
   *         description: Filtrar por ID do usuário
   *       - in: query
   *         name: role_id
   *         schema: { type: integer }
   *         description: Filtrar por ID do role
   *       - in: query
   *         name: user_name
   *         schema: { type: string }
   *         description: Filtrar por nome do usuário
   *       - in: query
   *         name: role_name
   *         schema: { type: string }
   *         description: Filtrar por nome do role
   *     responses:
   *       200:
   *         description: Lista de associações user-role
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
      if (filters.user_id) {
        processedFilters.user_id = parseInt(filters.user_id as string, 10);
      }
      if (filters.role_id) {
        processedFilters.role_id = parseInt(filters.role_id as string, 10);
      }

      const result = await this.userRoleService.search(
        processedFilters,
        pageNumber,
        limitNumber
      );
      
      logger.info(`Consulta de associações user-role realizada: ${result.data.length} itens, página ${pageNumber}`);

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
   * /user-roles/{id}:
   *   get:
   *     summary: Busca uma associação user-role pelo ID
   *     tags: [User Roles]
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
      
      const association = await this.userRoleService.findById(associationId);
      if (!association) {
        throw new NotFoundError('Associação user-role não encontrada');
      }
      
      logger.info(`Associação user-role consultada: ID ${associationId}`);
      
      res.json({ success: true, data: association });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /user-roles:
   *   post:
   *     summary: Cria uma nova associação user-role
   *     tags: [User Roles]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - user_id
   *               - role_id
   *             properties:
   *               user_id:
   *                 type: integer
   *                 description: ID do usuário
   *                 example: 1
   *               role_id:
   *                 type: integer
   *                 description: ID do role
   *                 example: 2
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
      
      logger.info(`Criando nova associação user-role: User ${associationData.user_id} - Role ${associationData.role_id}`);
      
      const newAssociation = await this.userRoleService.create(associationData);
      
      logger.info(`Associação user-role criada com sucesso: ID ${newAssociation?.id}`);
      
      res.status(201).json({
        success: true,
        message: 'Associação user-role criada com sucesso',
        data: newAssociation
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /user-roles/{id}:
   *   delete:
   *     summary: Remove uma associação user-role
   *     tags: [User Roles]
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
      
      logger.info(`Removendo associação user-role: ID ${associationId}`);
      
      const deleted = await this.userRoleService.delete(associationId);
      if (!deleted) {
        throw new NotFoundError('Associação user-role não encontrada');
      }
      
      logger.info(`Associação user-role removida com sucesso: ID ${associationId}`);
      
      res.json({
        success: true,
        message: 'Associação user-role removida com sucesso'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /user-roles/users/{userId}/roles:
   *   get:
   *     summary: Lista todos os roles de um usuário específico
   *     tags: [User Roles]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: userId
   *         schema: { type: integer }
   *         required: true
   *         description: ID do usuário
   *     responses:
   *       200:
   *         description: Lista de roles do usuário
   *       404:
   *         description: Usuário não encontrado
   *       401:
   *         description: Não autorizado
   *       500:
   *         description: Erro interno do servidor
   */
  async getRolesByUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId } = req.params;
      
      if (!userId) {
        throw new ValidationError('ID do usuário não fornecido');
      }
      
      const userIdNumber = Number(userId);
      if (isNaN(userIdNumber) || userIdNumber < 1) {
        throw new ValidationError('ID do usuário inválido');
      }
      
      const roles = await this.userRoleService.findRolesByUserId(userIdNumber);
      
      logger.info(`Consulta de roles do usuário ${userIdNumber}: ${roles.length} roles encontrados`);
      
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
   * /user-roles/roles/{roleId}/users:
   *   get:
   *     summary: Lista todos os usuários que têm um role específico
   *     tags: [User Roles]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: roleId
   *         schema: { type: integer }
   *         required: true
   *         description: ID do role
   *     responses:
   *       200:
   *         description: Lista de usuários com o role
   *       404:
   *         description: Role não encontrado
   *       401:
   *         description: Não autorizado
   *       500:
   *         description: Erro interno do servidor
   */
  async getUsersByRole(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { roleId } = req.params;
      
      if (!roleId) {
        throw new ValidationError('ID do role não fornecido');
      }
      
      const roleIdNumber = Number(roleId);
      if (isNaN(roleIdNumber) || roleIdNumber < 1) {
        throw new ValidationError('ID do role inválido');
      }
      
      const users = await this.userRoleService.findUsersByRoleId(roleIdNumber);
      
      logger.info(`Consulta de usuários do role ${roleIdNumber}: ${users.length} usuários encontrados`);
      
      res.json({
        success: true,
        data: users
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /user-roles/users/{userId}/roles:
   *   put:
   *     summary: Define todos os roles de um usuário (substitui os existentes)
   *     tags: [User Roles]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: userId
   *         schema: { type: integer }
   *         required: true
   *         description: ID do usuário
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - role_ids
   *             properties:
   *               role_ids:
   *                 type: array
   *                 items:
   *                   type: integer
   *                 description: Array com IDs dos roles
   *                 example: [1, 2, 3]
   *     responses:
   *       200:
   *         description: Roles do usuário atualizados com sucesso
   *       400:
   *         description: Dados inválidos
   *       404:
   *         description: Usuário não encontrado
   *       401:
   *         description: Não autorizado
   *       500:
   *         description: Erro interno do servidor
   */
  async setUserRoles(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId } = req.params;
      const { role_ids } = req.body;
      
      if (!userId) {
        throw new ValidationError('ID do usuário não fornecido');
      }
      
      const userIdNumber = Number(userId);
      if (isNaN(userIdNumber) || userIdNumber < 1) {
        throw new ValidationError('ID do usuário inválido');
      }
      
      logger.info(`Definindo roles do usuário ${userIdNumber}: ${role_ids?.length || 0} roles`);
      
      const updatedAssociations = await this.userRoleService.setUserRoles(userIdNumber, role_ids || []);
      
      logger.info(`Roles do usuário ${userIdNumber} atualizados com sucesso`);
      
      res.json({
        success: true,
        message: 'Roles do usuário atualizados com sucesso',
        data: updatedAssociations
      });
    } catch (error) {
      next(error);
    }
  }
}

export default UserRoleController;