import { NextFunction, Request, Response } from 'express';
import logger from '../config/logger';
import { IUser } from '../models/User';
import { UserService } from '../services/UserService';
import { NotFoundError, ValidationError } from '../utils/errors';
import BaseController from './BaseController';

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: Gerenciamento de usuários
 */
class UserController extends BaseController<IUser> {
  private userService: UserService;

  constructor() {
    const service = new UserService();
    super(service, 'Usuário');
    this.userService = service;
  }

  /**
   * @swagger
   * /users:
   *   get:
   *     summary: Lista usuários com filtros e paginação
   *     description: Retorna uma lista paginada de usuários do sistema com opções de filtragem
   *     tags: [Users]
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
   *         name: username
   *         schema:
   *           type: string
   *         description: Filtrar por nome de usuário (busca parcial)
   *       - in: query
   *         name: email
   *         schema:
   *           type: string
   *           format: email
   *         description: Filtrar por e-mail (busca parcial)
   *       - in: query
   *         name: first_name
   *         schema:
   *           type: string
   *         description: Filtrar por primeiro nome
   *       - in: query
   *         name: last_name
   *         schema:
   *           type: string
   *         description: Filtrar por sobrenome
   *       - in: query
   *         name: is_active
   *         schema:
   *           type: boolean
   *         description: Filtrar por status ativo (true/false)
   *       - in: query
   *         name: role_id
   *         schema:
   *           type: integer
   *         description: Filtrar por ID da função/papel
   *       - in: query
   *         name: company_id
   *         schema:
   *           type: integer
   *         description: Filtrar por ID da empresa
   *     responses:
   *       200:
   *         description: Lista de usuários obtida com sucesso
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/UserListResponse'
   *             example:
   *               success: true
   *               data:
   *                 - id: 1
   *                   username: "admin"
   *                   email: "admin@example.com"
   *                   first_name: "Administrador"
   *                   last_name: "Sistema"
   *                   is_active: true
   *                   email_verified: true
   *                   role_id: 1
   *                   company_id: null
   *                 - id: 2
   *                   username: "user1"
   *                   email: "user1@example.com"
   *                   first_name: "Usuário"
   *                   last_name: "Teste"
   *                   is_active: true
   *                   email_verified: false
   *                   role_id: 2
   *                   company_id: 1
   *               pagination:
   *                 total: 25
   *                 page: 1
   *                 limit: 10
   *                 totalPages: 3
   *       400:
   *         description: Parâmetros de consulta inválidos
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *             example:
   *               success: false
   *               message: "Parâmetros de paginação inválidos"
   *       401:
   *         $ref: '#/components/responses/UnauthorizedError'
   *       403:
   *         $ref: '#/components/responses/ForbiddenError'
   *       500:
   *         $ref: '#/components/responses/InternalServerError'
   */
  async index(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { username, email, first_name, last_name, is_active, role_id, company_id } = req.query;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      // Validação de parâmetros
      if (page < 1 || limit < 1 || limit > 100) {
        throw new ValidationError('Parâmetros de paginação inválidos');
      }

      const filters = {
        username: username as string,
        email: email as string,
        first_name: first_name as string,
        last_name: last_name as string,
        is_active: is_active !== undefined ? is_active === 'true' : undefined,
        role_id: role_id ? Number(role_id) : undefined,
        company_id: company_id ? Number(company_id) : undefined
      };

      // Remover filtros vazios
      Object.keys(filters).forEach(key => {
        if ((filters as any)[key] === undefined || (filters as any)[key] === '') {
          delete (filters as any)[key];
        }
      });

      const result = await this.userService.search(filters, page, limit);
      
      logger.info(`Consulta de usuários realizada: ${result.data.length} itens, página ${page}`);
      
      res.json({
        success: true,
        data: result.data,
        pagination: {
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
   * /users/{id}:
   *   get:
   *     summary: Busca um usuário pelo ID
   *     description: Retorna os dados detalhados de um usuário específico
   *     tags: [Users]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         schema:
   *           type: integer
   *           minimum: 1
   *         required: true
   *         description: ID numérico do usuário
   *         example: 1
   *     responses:
   *       200:
   *         description: Usuário encontrado com sucesso
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/UserResponse'
   *             example:
   *               success: true
   *               data:
   *                 id: 1
   *                 username: "admin"
   *                 email: "admin@example.com"
   *                 first_name: "Administrador"
   *                 last_name: "Sistema"
   *                 is_active: true
   *                 email_verified: true
   *                 role_id: 1
   *                 company_id: null
   *                 created_at: "2024-01-15T10:30:00Z"
   *                 updated_at: "2024-01-15T10:30:00Z"
   *       400:
   *         description: ID inválido
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *             example:
   *               success: false
   *               message: "ID do usuário inválido"
   *       401:
   *         $ref: '#/components/responses/UnauthorizedError'
   *       403:
   *         $ref: '#/components/responses/ForbiddenError'
   *       404:
   *         description: Usuário não encontrado
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *             example:
   *               success: false
   *               message: "Usuário não encontrado"
   *       500:
   *         $ref: '#/components/responses/InternalServerError'
   */
  async show(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      
      if (!id) {
        throw new ValidationError('ID do usuário não fornecido');
      }
      
      const userId = Number(id);
      if (isNaN(userId) || userId < 1) {
        throw new ValidationError('ID do usuário inválido');
      }
      
      const user = await this.userService.findById(userId);
      if (!user) {
        throw new NotFoundError('Usuário não encontrado');
      }
      
      logger.info(`Usuário consultado: ID ${userId}`);
      
      res.json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /users:
   *   post:
   *     summary: Cria um novo usuário
   *     description: Cria um novo usuário no sistema com dados fornecidos
   *     tags: [Users]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/UserCreate'
   *           example:
   *             username: "novouser"
   *             email: "novo@example.com"
   *             password: "senha123"
   *             first_name: "Novo"
   *             last_name: "Usuário"
   *             role_id: 2
   *             company_id: 1
   *             is_active: true
   *     responses:
   *       201:
   *         description: Usuário criado com sucesso
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/UserResponse'
   *             example:
   *               success: true
   *               message: "Usuário criado com sucesso"
   *               data:
   *                 id: 3
   *                 username: "novouser"
   *                 email: "novo@example.com"
   *                 first_name: "Novo"
   *                 last_name: "Usuário"
   *                 is_active: true
   *                 email_verified: false
   *                 role_id: 2
   *                 company_id: 1
   *       400:
   *         description: Dados de entrada inválidos
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *             examples:
   *               validation:
   *                 value:
   *                   success: false
   *                   message: "Dados obrigatórios não fornecidos"
   *               weakPassword:
   *                 value:
   *                   success: false
   *                   message: "A senha deve ter pelo menos 6 caracteres"
   *       401:
   *         $ref: '#/components/responses/UnauthorizedError'
   *       403:
   *         $ref: '#/components/responses/ForbiddenError'
   *       409:
   *         description: Conflito - usuário já existe
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *             examples:
   *               duplicateUsername:
   *                 value:
   *                   success: false
   *                   message: "Nome de usuário já está em uso"
   *               duplicateEmail:
   *                 value:
   *                   success: false
   *                   message: "E-mail já cadastrado no sistema"
   *       500:
   *         $ref: '#/components/responses/InternalServerError'
   */
  async store(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userData = req.body;
      
      logger.info(`Criando novo usuário: ${userData.username || 'N/A'}`);
      
      const newUser = await this.userService.create(userData);
      
      logger.info(`Usuário criado com sucesso: ID ${newUser?.id}`);
      
      res.status(201).json({
        success: true,
        message: 'Usuário criado com sucesso',
        data: newUser
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /users/{id}:
   *   put:
   *     summary: Atualiza um usuário existente
   *     description: Atualiza os dados de um usuário existente no sistema
   *     tags: [Users]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         schema:
   *           type: integer
   *           minimum: 1
   *         required: true
   *         description: ID numérico do usuário
   *         example: 1
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/UserUpdate'
   *           example:
   *             first_name: "Nome Atualizado"
   *             last_name: "Sobrenome Atualizado"
   *             email: "novo.email@example.com"
   *             is_active: false
   *             role_id: 3
   *     responses:
   *       200:
   *         description: Usuário atualizado com sucesso
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/UserResponse'
   *             example:
   *               success: true
   *               message: "Usuário atualizado com sucesso"
   *               data:
   *                 id: 1
   *                 username: "admin"
   *                 email: "novo.email@example.com"
   *                 first_name: "Nome Atualizado"
   *                 last_name: "Sobrenome Atualizado"
   *                 is_active: false
   *                 email_verified: true
   *                 role_id: 3
   *                 updated_at: "2024-01-15T15:45:00Z"
   *       400:
   *         description: Dados inválidos ou ID incorreto
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *             examples:
   *               invalidId:
   *                 value:
   *                   success: false
   *                   message: "ID do usuário inválido"
   *               validation:
   *                 value:
   *                   success: false
   *                   message: "Dados de entrada inválidos"
   *       401:
   *         $ref: '#/components/responses/UnauthorizedError'
   *       403:
   *         $ref: '#/components/responses/ForbiddenError'
   *       404:
   *         description: Usuário não encontrado
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *             example:
   *               success: false
   *               message: "Usuário não encontrado"
   *       409:
   *         description: Conflito - email já em uso
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *             example:
   *               success: false
   *               message: "E-mail já está sendo usado por outro usuário"
   *       500:
   *         $ref: '#/components/responses/InternalServerError'
   */
  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      
      if (!id) {
        throw new ValidationError('ID do usuário não fornecido');
      }
      
      const userId = Number(id);
      if (isNaN(userId) || userId < 1) {
        throw new ValidationError('ID do usuário inválido');
      }
      
      const updateData = req.body;
      
      logger.info(`Atualizando usuário: ID ${userId}`);
      
      const updatedUser = await this.userService.update(userId, updateData);
      if (!updatedUser) {
        throw new NotFoundError('Usuário não encontrado');
      }
      
      logger.info(`Usuário atualizado com sucesso: ID ${userId}`);
      
      res.json({
        success: true,
        message: 'Usuário atualizado com sucesso',
        data: updatedUser
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /users/{id}:
   *   delete:
   *     summary: Remove um usuário do sistema
   *     description: Remove um usuário (soft delete - o registro é marcado como excluído, mas não é removido fisicamente)
   *     tags: [Users]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         schema:
   *           type: integer
   *           minimum: 1
   *         required: true
   *         description: ID numérico do usuário a ser removido
   *         example: 1
   *     responses:
   *       200:
   *         description: Usuário removido com sucesso
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/MessageResponse'
   *             example:
   *               success: true
   *               message: "Usuário removido com sucesso"
   *       400:
   *         description: ID inválido
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *             examples:
   *               noId:
   *                 value:
   *                   success: false
   *                   message: "ID do usuário não fornecido"
   *               invalidId:
   *                 value:
   *                   success: false
   *                   message: "ID do usuário inválido"
   *       401:
   *         $ref: '#/components/responses/UnauthorizedError'
   *       403:
   *         $ref: '#/components/responses/ForbiddenError'
   *       404:
   *         description: Usuário não encontrado
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *             example:
   *               success: false
   *               message: "Usuário não encontrado"
   *       500:
   *         $ref: '#/components/responses/InternalServerError'
   */
  async destroy(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      
      if (!id) {
        throw new ValidationError('ID do usuário não fornecido');
      }
      
      const userId = Number(id);
      if (isNaN(userId) || userId < 1) {
        throw new ValidationError('ID do usuário inválido');
      }
      
      logger.info(`Removendo usuário: ID ${userId}`);
      
      const deleted = await this.userService.delete(userId);
      if (!deleted) {
        throw new NotFoundError('Usuário não encontrado');
      }
      
      logger.info(`Usuário removido com sucesso: ID ${userId}`);
      
      res.json({
        success: true,
        message: 'Usuário removido com sucesso'
      });
    } catch (error) {
      next(error);
    }
  }
}

export default UserController;
