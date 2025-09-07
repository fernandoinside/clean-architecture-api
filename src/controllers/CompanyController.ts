import { Request, Response, NextFunction } from 'express';
import BaseController from './BaseController';
import { CompanyService } from '../services/CompanyService';
import { ICompany } from '../models/Company';
import { ValidationError, NotFoundError, ConflictError } from '../utils/errors';
import logger from '../config/logger';

/**
 * Controlador para gerenciamento de empresas
 * @swagger
 * tags:
 *   name: Companies
 *   description: Endpoints para gerenciamento de empresas
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
class CompanyController extends BaseController<ICompany> {
  private companyService: CompanyService;

  constructor() {
    const service = new CompanyService();
    super(service, 'Empresa');
    this.companyService = service;
  }

  /**
   * @swagger
   * /companies:
   *   get:
   *     summary: Lista todas as empresas
   *     description: Retorna uma lista paginada de empresas com suporte a filtros
   *     tags: [Companies]
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
   *         name: status
   *         schema:
   *           type: string
   *           enum: [active, inactive, pending]
   *         description: Filtrar por status da empresa
   *     responses:
   *       200:
   *         description: Lista de empresas obtida com sucesso
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
   *                     $ref: '#/components/schemas/Company'
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
      
      // Sempre usar o método search para consistência
      const result = await this.companyService.search(
        filters as { [key: string]: string },
        pageNumber,
        limitNumber
      );
      
      logger.info(`Consulta de empresas realizada: ${result.data.length} itens, página ${pageNumber}`);
      
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
   * /companies/{id}:
   *   get:
   *     summary: Busca uma empresa pelo ID
   *     description: Retorna os detalhes de uma empresa específica com base no ID fornecido
   *     tags: [Companies]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         schema:
   *           type: integer
   *         required: true
   *         description: ID da empresa a ser obtida
   *     responses:
   *       200:
   *         description: Dados da empresa obtidos com sucesso
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   $ref: '#/components/schemas/Company'
   *       400:
   *         $ref: '#/components/responses/BadRequestError'
   *       401:
   *         $ref: '#/components/responses/UnauthorizedError'
   *       404:
   *         $ref: '#/components/responses/NotFoundError'
   *       500:
   *         $ref: '#/components/responses/InternalServerError'
   */
  async show(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      if (!id) {
        throw new ValidationError('ID da empresa não fornecido');
      }
      
      const companyId = Number(id);
      if (isNaN(companyId)) {
        throw new ValidationError('ID da empresa inválido');
      }
      
      const company = await this.companyService.findById(companyId);
      if (!company) {
        throw new NotFoundError('Empresa não encontrada');
      }
      
      res.json({
        success: true,
        data: company
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /companies:
   *   post:
   *     summary: Cria uma nova empresa
   *     description: Cria uma nova empresa no sistema com os dados fornecidos
   *     tags: [Companies]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/CompanyCreate'
   *           example:
   *             name: "Tech Solutions Ltda"
   *             email: "contato@techsolutions.com"
   *             document: "12.345.678/0001-90"
   *             phone: "(11) 98765-4321"
   *             website: "https://techsolutions.com"
   *             industry: "Tecnologia"
   *             status: "active"
   *     responses:
   *       201:
   *         description: Empresa criada com sucesso
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
   *                   example: "Empresa criada com sucesso"
   *                 data:
   *                   $ref: '#/components/schemas/Company'
   *             example:
   *               success: true
   *               message: "Empresa criada com sucesso"
   *               data:
   *                 id: 1
   *                 name: "Tech Solutions Ltda"
   *                 email: "contato@techsolutions.com"
   *                 document: "12.345.678/0001-90"
   *                 phone: "(11) 98765-4321"
   *                 website: "https://techsolutions.com"
   *                 industry: "Tecnologia"
   *                 status: "active"
   *                 created_at: "2024-01-15T10:30:00Z"
   *                 updated_at: "2024-01-15T10:30:00Z"
   *       400:
   *         description: Dados inválidos
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/responses/BadRequestError'
   *             examples:
   *               validation:
   *                 value:
   *                   success: false
   *                   message: "Dados obrigatórios não fornecidos"
   *               invalidCnpj:
   *                 value:
   *                   success: false
   *                   message: "CNPJ inválido"
   *       401:
   *         $ref: '#/components/responses/UnauthorizedError'
   *       409:
   *         description: CNPJ já cadastrado
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/responses/BadRequestError'
   *             example:
   *               success: false
   *               message: "CNPJ já cadastrado no sistema"
   *       500:
   *         $ref: '#/components/responses/InternalServerError'
   */
  async store(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const companyData = req.body;
      
      logger.info(`Criando nova empresa: ${companyData.name || 'N/A'}`);
      
      const newCompany = await this.companyService.create(companyData);
      
      logger.info(`Empresa criada com sucesso: ID ${newCompany?.id}`);
      
      res.status(201).json({
        success: true,
        message: 'Empresa criada com sucesso',
        data: newCompany
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /companies/{id}:
   *   put:
   *     summary: Atualiza uma empresa existente
   *     description: Atualiza os dados de uma empresa existente no sistema
   *     tags: [Companies]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         schema:
   *           type: integer
   *           minimum: 1
   *         required: true
   *         description: ID numérico da empresa
   *         example: 1
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/CompanyUpdate'
   *           example:
   *             name: "Tech Solutions Ltda - Updated"
   *             email: "novo.contato@techsolutions.com"
   *             document: "12.345.678/0001-90"
   *             phone: "(11) 99999-8888"
   *             website: "https://techsolutions.com/updated"
   *             industry: "Tecnologia da Informação"
   *             status: "inactive"
   *     responses:
   *       200:
   *         description: Empresa atualizada com sucesso
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
   *                   example: "Empresa atualizada com sucesso"
   *                 data:
   *                   $ref: '#/components/schemas/Company'
   *             example:
   *               success: true
   *               message: "Empresa atualizada com sucesso"
   *               data:
   *                 id: 1
   *                 name: "Tech Solutions Ltda - Updated"
   *                 email: "novo.contato@techsolutions.com"
   *                 document: "12.345.678/0001-90"
   *                 phone: "(11) 99999-8888"
   *                 website: "https://techsolutions.com"
   *                 industry: "Tecnologia"
   *                 status: "inactive"
   *                 created_at: "2024-01-15T10:30:00Z"
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
   *                   message: "ID da empresa inválido"
   *               validation:
   *                 value:
   *                   success: false
   *                   message: "Dados de entrada inválidos"
   *       401:
   *         $ref: '#/components/responses/UnauthorizedError'
   *       404:
   *         description: Empresa não encontrada
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/responses/NotFoundError'
   *             example:
   *               success: false
   *               message: "Empresa não encontrada"
   *       409:
   *         description: Conflito - CNPJ já em uso
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/responses/BadRequestError'
   *             example:
   *               success: false
   *               message: "CNPJ já está sendo usado por outra empresa"
   *       500:
   *         $ref: '#/components/responses/InternalServerError'
   */
  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      
      if (!id) {
        throw new ValidationError('ID da empresa não fornecido');
      }
      
      const companyId = Number(id);
      if (isNaN(companyId) || companyId < 1) {
        throw new ValidationError('ID da empresa inválido');
      }
      
      const updateData = req.body;
      
      logger.info(`Atualizando empresa: ID ${companyId}`);
      
      const updatedCompany = await this.companyService.update(companyId, updateData);
      if (!updatedCompany) {
        throw new NotFoundError('Empresa não encontrada');
      }
      
      logger.info(`Empresa atualizada com sucesso: ID ${companyId}`);
      
      res.json({
        success: true,
        message: 'Empresa atualizada com sucesso',
        data: updatedCompany
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /companies/{id}:
   *   delete:
   *     summary: Remove uma empresa do sistema
   *     description: Remove uma empresa (soft delete - o registro é marcado como excluído, mas não é removido fisicamente)
   *     tags: [Companies]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         schema:
   *           type: integer
   *           minimum: 1
   *         required: true
   *         description: ID numérico da empresa a ser removida
   *         example: 1
   *     responses:
   *       200:
   *         description: Empresa removida com sucesso
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
   *                   example: "Empresa removida com sucesso"
   *             example:
   *               success: true
   *               message: "Empresa removida com sucesso"
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
   *                   message: "ID da empresa não fornecido"
   *               invalidId:
   *                 value:
   *                   success: false
   *                   message: "ID da empresa inválido"
   *       401:
   *         $ref: '#/components/responses/UnauthorizedError'
   *       404:
   *         description: Empresa não encontrada
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/responses/NotFoundError'
   *             example:
   *               success: false
   *               message: "Empresa não encontrada"
   *       500:
   *         $ref: '#/components/responses/InternalServerError'
   */
  async destroy(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      
      if (!id) {
        throw new ValidationError('ID da empresa não fornecido');
      }
      
      const companyId = Number(id);
      if (isNaN(companyId) || companyId < 1) {
        throw new ValidationError('ID da empresa inválido');
      }
      
      logger.info(`Removendo empresa: ID ${companyId}`);
      
      const deleted = await this.companyService.delete(companyId);
      if (!deleted) {
        throw new NotFoundError('Empresa não encontrada');
      }
      
      logger.info(`Empresa removida com sucesso: ID ${companyId}`);
      
      res.json({
        success: true,
        message: 'Empresa removida com sucesso'
      });
    } catch (error) {
      next(error);
    }
  }
}

export default CompanyController;
