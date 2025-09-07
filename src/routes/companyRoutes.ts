
import { NextFunction, Request, Response } from 'express';
import CompanyController from '../controllers/CompanyController';
import {
  createCompanySchema,
  listCompaniesSchema,
  updateCompanySchema
} from '../schemas/companySchemas';
import BaseRouter from './BaseRouter';

/**
 * @swagger
 * tags:
 *   name: Companies
 *   description: Gestão de empresas
 */

class CompanyRoutes extends BaseRouter<CompanyController> {
  constructor() {
    super(new CompanyController());
    this.setupRoutes();
  }

  private setupRoutes() {
    /**
     * @swagger
     * /companies:
     *   get:
     *     summary: Lista todas as empresas com paginação
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
     *         description: Número de itens por página
     *       - in: query
     *         name: name
     *         schema:
     *           type: string
     *         description: Filtrar por nome da empresa
     *       - in: query
     *         name: status
     *         schema:
     *           type: string
     *           enum: [active, inactive, pending]
     *         description: Filtrar por status
     *     responses:
     *       200:
     *         description: Lista de empresas
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/CompanyListResponse'
     *       401:
     *         description: Não autenticado
     *       403:
     *         description: Acesso negado
     */
    this.get(
      '/',
      'index',
      { 
        auth: true, 
        permissions: ['admin', 'manager'],
        customValidation: (req: Request, res: Response, next: NextFunction): void => {
          const { error } = listCompaniesSchema.validate(req.query, { abortEarly: false });
          if (error) {
            const errors = error.details.map(detail => ({
              field: detail.path.join('.'),
              message: detail.message,
              type: detail.type
            }));
            res.status(400).json({ 
              success: false, 
              message: 'Erro de validação', 
              errors 
            });
            return;
          }
          next();
        }
      }
    );

    /**
     * @swagger
     * /companies/{id}:
     *   get:
     *     summary: Obtém uma empresa pelo ID
     *     tags: [Companies]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: integer
     *         description: ID da empresa
     *     responses:
     *       200:
     *         description: Dados da empresa
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/CompanyResponse'
     *       401:
     *         description: Não autenticado
     *       403:
     *         description: Acesso negado
     *       404:
     *         description: Empresa não encontrada
     */
    this.get(
      '/:id',
      'show',
      { auth: true, permissions: ['admin', 'manager', 'user'] }
    );

    /**
     * @swagger
     * /companies:
     *   post:
     *     summary: Cria uma nova empresa
     *     tags: [Companies]
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/CompanyCreate'
     *     responses:
     *       201:
     *         description: Empresa criada com sucesso
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/CompanyResponse'
     *       400:
     *         description: Dados inválidos
     *       401:
     *         description: Não autenticado
     *       403:
     *         description: Acesso negado
     */
    this.post(
      '/',
      'store',
      { auth: true, permissions: ['admin', 'manager'], validationSchema: createCompanySchema, validationOptions: { allowUnknown: false } }
    );

    /**
     * @swagger
     * /companies/{id}:
     *   put:
     *     summary: Atualiza uma empresa existente
     *     tags: [Companies]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: integer
     *         description: ID da empresa
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/CompanyUpdate'
     *     responses:
     *       200:
     *         description: Empresa atualizada com sucesso
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/CompanyResponse'
     *       400:
     *         description: Dados inválidos
     *       401:
     *         description: Não autenticado
     *       403:
     *         description: Acesso negado
     *       404:
     *         description: Empresa não encontrada
     */
    this.put(
      '/:id',
      'update',
      { auth: true, permissions: ['admin', 'manager'], validationSchema: updateCompanySchema, validationOptions: { allowUnknown: false } }
    );

    /**
     * @swagger
     * /companies/{id}:
     *   delete:
     *     summary: Remove uma empresa
     *     tags: [Companies]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: integer
     *         description: ID da empresa
     *     responses:
     *       204:
     *         description: Empresa removida com sucesso
     *       401:
     *         description: Não autenticado
     *       403:
     *         description: Acesso negado
     *       404:
     *         description: Empresa não encontrada
     */
    this.delete(
      '/:id',
      'destroy',
      { auth: true, permissions: ['admin'] }
    );
  }
}

export default new CompanyRoutes().router;
