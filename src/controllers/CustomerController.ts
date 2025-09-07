import { NextFunction, Request, Response } from 'express';
import logger from '../config/logger';
import { ICustomer } from '../models/Customer';
import { CustomerService } from '../services/CustomerService';
import { NotFoundError, ValidationError } from '../utils/errors';
import BaseController from './BaseController';

/**
 * Controlador para gerenciamento de clientes
 * @swagger
 * tags:
 *   name: Customers
 *   description: Endpoints para gerenciamento de clientes
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
class CustomerController extends BaseController<ICustomer> {
  private customerService: CustomerService;

  constructor() {
    const service = new CustomerService();
    super(service, 'Cliente');
    this.customerService = service;
  }

  /**
   * @swagger
   * /customers:
   *   get:
   *     summary: Lista todos os clientes
   *     description: Retorna uma lista paginada de clientes com suporte a filtros
   *     tags: [Customers]
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
   *         name: company_id
   *         schema:
   *           type: integer
   *         description: Filtrar por ID da empresa
   *       - in: query
   *         name: name
   *         schema:
   *           type: string
   *         description: Filtrar por nome (busca parcial)
   *       - in: query
   *         name: email
   *         schema:
   *           type: string
   *           format: email
   *         description: Filtrar por e-mail (busca parcial)
   *       - in: query
   *         name: phone
   *         schema:
   *           type: string
   *         description: Filtrar por telefone
   *       - in: query
   *         name: status
   *         schema:
   *           type: string
   *           enum: [active, inactive, pending]
   *         description: Filtrar por status do cliente
   *     responses:
   *       200:
   *         description: Lista de clientes obtida com sucesso
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
   *                     $ref: '#/components/schemas/Customer'
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
      const { company_id, name, email, phone, status } = req.query;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      // Validação de parâmetros
      if (page < 1 || limit < 1 || limit > 100) {
        throw new ValidationError('Parâmetros de paginação inválidos');
      }

      const filters = {
        company_id: company_id ? Number(company_id) : undefined,
        name: name as string,
        email: email as string,
        phone: phone as string,
        status: status as 'active' | 'inactive' | 'suspended',
      };

      // Remover filtros vazios
      Object.keys(filters).forEach(key => {
        if ((filters as any)[key] === undefined || (filters as any)[key] === '') {
          delete (filters as any)[key];
        }
      });

      const result = await this.customerService.search(filters, page, limit);
      
      logger.info(`Consulta de clientes realizada: ${result.data.length} itens, página ${page}`);
      
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
   * /customers/{id}:
   *   get:
   *     summary: Busca um cliente pelo ID
   *     description: Retorna os detalhes de um cliente específico com base no ID fornecido
   *     tags: [Customers]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         schema:
   *           type: integer
   *           minimum: 1
   *         required: true
   *         description: ID numérico do cliente
   *         example: 1
   *     responses:
   *       200:
   *         description: Cliente encontrado com sucesso
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   $ref: '#/components/schemas/Customer'
   *             example:
   *               success: true
   *               data:
   *                 id: 1
   *                 company_id: 1
   *                 name: "João Silva"
   *                 email: "joao.silva@example.com"
   *                 phone: "(11) 99999-9999"
   *                 document: "12345678901"
   *                 status: "active"
   *                 metadata:
   *                   origem: "website"
   *                   preferencias: "email"
   *                   observacoes: "Cliente VIP"
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
   *               message: "ID do cliente inválido"
   *       401:
   *         $ref: '#/components/responses/UnauthorizedError'
   *       404:
   *         description: Cliente não encontrado
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/responses/NotFoundError'
   *             example:
   *               success: false
   *               message: "Cliente não encontrado"
   *       500:
   *         $ref: '#/components/responses/InternalServerError'
   */
  async show(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      
      if (!id) {
        throw new ValidationError('ID do cliente não fornecido');
      }
      
      const customerId = Number(id);
      if (isNaN(customerId) || customerId < 1) {
        throw new ValidationError('ID do cliente inválido');
      }
      
      const customer = await this.customerService.findById(customerId);
      if (!customer) {
        throw new NotFoundError('Cliente não encontrado');
      }
      
      logger.info(`Cliente consultado: ID ${customerId}`);
      
      res.json({ success: true, data: customer });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /customers:
   *   post:
   *     summary: Cria um novo cliente
   *     description: Cria um novo cliente no sistema com os dados fornecidos
   *     tags: [Customers]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/CustomerCreate'
   *           example:
   *             company_id: 1
   *             name: "Maria Santos"
   *             email: "maria.santos@example.com"
   *             phone: "(11) 98765-4321"
   *             document: "12345678901"
   *             status: "active"
   *             metadata:
   *               origem: "website"
   *               preferencias: "email"
   *               observacoes: "Cliente interessado em plano premium"
   *               tags: ["vip", "corporativo"]
   *     responses:
   *       201:
   *         description: Cliente criado com sucesso
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
   *                   example: "Cliente criado com sucesso"
   *                 data:
   *                   $ref: '#/components/schemas/Customer'
   *             example:
   *               success: true
   *               message: "Cliente criado com sucesso"
   *               data:
   *                 id: 1
   *                 company_id: 1
   *                 name: "Maria Santos"
   *                 email: "maria.santos@example.com"
   *                 phone: "(11) 98765-4321"
   *                 document: "12345678901"
   *                 status: "active"
   *                 metadata:
   *                   origem: "website"
   *                   preferencias: "email"
   *                   observacoes: "Cliente interessado em plano premium"
   *                   tags: ["vip", "corporativo"]
   *                 created_at: "2024-01-15T10:30:00Z"
   *                 updated_at: "2024-01-15T10:30:00Z"
   *       400:
   *         description: Dados de entrada inválidos
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/responses/BadRequestError'
   *             examples:
   *               validation:
   *                 value:
   *                   success: false
   *                   message: "Dados obrigatórios não fornecidos"
   *               invalidEmail:
   *                 value:
   *                   success: false
   *                   message: "E-mail inválido"
   *       401:
   *         $ref: '#/components/responses/UnauthorizedError'
   *       409:
   *         description: Conflito - cliente já existe
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/responses/BadRequestError'
   *             example:
   *               success: false
   *               message: "E-mail já cadastrado no sistema"
   *       500:
   *         $ref: '#/components/responses/InternalServerError'
   */
  async store(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { company_id, name, email, phone, document, status, metadata } = req.body;
      
      // Filtrar apenas os campos que pertencem à tabela customers
      const customerData = {
        company_id,
        name,
        email,
        phone,
        document,
        status,
        metadata
      };
      
      logger.info(`Criando novo cliente: ${customerData.name || 'N/A'}`);
      
      const newCustomer = await this.customerService.create(customerData);
      
      logger.info(`Cliente criado com sucesso: ID ${newCustomer?.id}`);
      
      res.status(201).json({
        success: true,
        message: 'Cliente criado com sucesso',
        data: newCustomer
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /customers/{id}:
   *   put:
   *     summary: Atualiza um cliente existente
   *     description: Atualiza os dados de um cliente existente no sistema
   *     tags: [Customers]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         schema:
   *           type: integer
   *           minimum: 1
   *         required: true
   *         description: ID numérico do cliente
   *         example: 1
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/CustomerUpdate'
   *           example:
   *             name: "Maria Santos Atualizada"
   *             email: "maria.nova@example.com"
   *             phone: "(11) 99999-8888"
   *             document: "98765432100"
   *             status: "inactive"
   *             metadata:
   *               observacoes: "Cliente atualizado - preferência por WhatsApp"
   *               ultima_interacao: "2025-08-27"
   *               score: 85
   *     responses:
   *       200:
   *         description: Cliente atualizado com sucesso
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
   *                   example: "Cliente atualizado com sucesso"
   *                 data:
   *                   $ref: '#/components/schemas/Customer'
   *             example:
   *               success: true
   *               message: "Cliente atualizado com sucesso"
   *               data:
   *                 id: 1
   *                 name: "Maria Santos Atualizada"
   *                 email: "maria.nova@example.com"
   *                 phone: "(11) 99999-8888"
   *                 document: "98765432100"
   *                 status: "inactive"
   *                 metadata:
   *                   observacoes: "Cliente atualizado - preferência por WhatsApp"
   *                   ultima_interacao: "2025-08-27"
   *                   score: 85
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
   *                   message: "ID do cliente inválido"
   *               validation:
   *                 value:
   *                   success: false
   *                   message: "Dados de entrada inválidos"
   *       401:
   *         $ref: '#/components/responses/UnauthorizedError'
   *       404:
   *         description: Cliente não encontrado
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/responses/NotFoundError'
   *             example:
   *               success: false
   *               message: "Cliente não encontrado"
   *       409:
   *         description: Conflito - email já em uso
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/responses/BadRequestError'
   *             example:
   *               success: false
   *               message: "E-mail já está sendo usado por outro cliente"
   *       500:
   *         $ref: '#/components/responses/InternalServerError'
   */
  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      
      if (!id) {
        throw new ValidationError('ID do cliente não fornecido');
      }
      
      const customerId = Number(id);
      if (isNaN(customerId) || customerId < 1) {
        throw new ValidationError('ID do cliente inválido');
      }
      
      // Filtrar apenas os campos que pertencem à tabela customers
      const { name, email, phone, document, status, metadata } = req.body;
      const updateData = {
        name,
        email,
        phone,
        document,
        status,
        metadata
      };
      
      logger.info(`Atualizando cliente: ID ${customerId}`);
      
      const updatedCustomer = await this.customerService.update(customerId, updateData);
      if (!updatedCustomer) {
        throw new NotFoundError('Cliente não encontrado');
      }
      
      logger.info(`Cliente atualizado com sucesso: ID ${customerId}`);
      
      res.json({
        success: true,
        message: 'Cliente atualizado com sucesso',
        data: updatedCustomer
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /customers/{id}:
   *   delete:
   *     summary: Remove um cliente do sistema
   *     description: Remove um cliente (soft delete - o registro é marcado como excluído, mas não é removido fisicamente)
   *     tags: [Customers]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         schema:
   *           type: integer
   *           minimum: 1
   *         required: true
   *         description: ID numérico do cliente a ser removido
   *         example: 1
   *     responses:
   *       200:
   *         description: Cliente removido com sucesso
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
   *                   example: "Cliente removido com sucesso"
   *             example:
   *               success: true
   *               message: "Cliente removido com sucesso"
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
   *                   message: "ID do cliente não fornecido"
   *               invalidId:
   *                 value:
   *                   success: false
   *                   message: "ID do cliente inválido"
   *       401:
   *         $ref: '#/components/responses/UnauthorizedError'
   *       404:
   *         description: Cliente não encontrado
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/responses/NotFoundError'
   *             example:
   *               success: false
   *               message: "Cliente não encontrado"
   *       500:
   *         $ref: '#/components/responses/InternalServerError'
   */
  async destroy(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      
      if (!id) {
        throw new ValidationError('ID do cliente não fornecido');
      }
      
      const customerId = Number(id);
      if (isNaN(customerId) || customerId < 1) {
        throw new ValidationError('ID do cliente inválido');
      }
      
      logger.info(`Removendo cliente: ID ${customerId}`);
      
      const deleted = await this.customerService.delete(customerId);
      if (!deleted) {
        throw new NotFoundError('Cliente não encontrado');
      }
      
      logger.info(`Cliente removido com sucesso: ID ${customerId}`);
      
      res.json({
        success: true,
        message: 'Cliente removido com sucesso'
      });
    } catch (error) {
      next(error);
    }
  }
}

export default CustomerController;