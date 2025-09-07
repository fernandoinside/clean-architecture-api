
import { NextFunction, Request, Response } from 'express';
import CustomerController from '../controllers/CustomerController';
import {
    createCustomerSchema,
    listCustomersSchema,
    updateCustomerSchema
} from '../schemas/customerSchemas';
import BaseRouter from './BaseRouter';

/**
 * @swagger
 * tags:
 *   name: Customers
 *   description: Gestão de clientes
 */

class CustomerRoutes extends BaseRouter<CustomerController> {
  constructor() {
    super(new CustomerController());
    this.setupRoutes();
  }

  private setupRoutes() {
    /**
     * @swagger
     * /customers:
     *   get:
     *     summary: Lista todos os clientes com paginação
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
     *         description: Número de itens por página
     *       - in: query
     *         name: name
     *         schema:
     *           type: string
     *         description: Filtrar por nome do cliente
     *       - in: query
     *         name: status
     *         schema:
     *           type: string
     *           enum: [active, inactive, pending]
     *         description: Filtrar por status
     *     responses:
     *       200:
     *         description: Lista de clientes
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/CustomerListResponse'
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
          const { error } = listCustomersSchema.validate(req.query, { abortEarly: false });
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
     * /customers/{id}:
     *   get:
     *     summary: Obtém um cliente pelo ID
     *     tags: [Customers]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: integer
     *         description: ID do cliente
     *     responses:
     *       200:
     *         description: Dados do cliente
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/CustomerResponse'
     *       401:
     *         description: Não autenticado
     *       403:
     *         description: Acesso negado
     *       404:
     *         description: Cliente não encontrado
     */
    this.get(
      '/:id',
      'show',
      { auth: true, permissions: ['admin', 'manager', 'user'] }
    );

    /**
     * @swagger
     * /customers:
     *   post:
     *     summary: Cria um novo cliente
     *     tags: [Customers]
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/CustomerCreate'
     *     responses:
     *       201:
     *         description: Cliente criado com sucesso
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/CustomerResponse'
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
      { auth: true, permissions: ['admin', 'manager'], validationSchema: createCustomerSchema, validationOptions: { allowUnknown: false } }
    );

    /**
     * @swagger
     * /customers/{id}:
     *   put:
     *     summary: Atualiza um cliente existente
     *     tags: [Customers]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: integer
     *         description: ID do cliente
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/CustomerUpdate'
     *     responses:
     *       200:
     *         description: Cliente atualizado com sucesso
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/CustomerResponse'
     *       400:
     *         description: Dados inválidos
     *       401:
     *         description: Não autenticado
     *       403:
     *         description: Acesso negado
     *       404:
     *         description: Cliente não encontrado
     */
    this.put(
      '/:id',
      'update',
      { auth: true, permissions: ['admin', 'manager'], validationSchema: updateCustomerSchema, validationOptions: { allowUnknown: false } }
    );

    /**
     * @swagger
     * /customers/{id}:
     *   delete:
     *     summary: Remove um cliente
     *     tags: [Customers]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: integer
     *         description: ID do cliente
     *     responses:
     *       204:
     *         description: Cliente removido com sucesso
     *       401:
     *         description: Não autenticado
     *       403:
     *         description: Acesso negado
     *       404:
     *         description: Cliente não encontrado
     */
    this.delete(
      '/:id',
      'destroy',
      { auth: true, permissions: ['admin'] }
    );
  }
}

export default new CustomerRoutes().router;
