import CustomerAddressController from '../controllers/CustomerAddressController';
import { createCustomerAddressSchema, updateCustomerAddressSchema } from '../schemas/customerAddressSchemas';
import BaseRouter from './BaseRouter';

/**
 * @swagger
 * tags:
 *   name: Customer Addresses
 *   description: Gestão de endereços de clientes
 */

class CustomerAddressRoutes extends BaseRouter<CustomerAddressController> {
  constructor() {
    super(new CustomerAddressController());
    this.setupRoutes();
  }

  private setupRoutes() {
    /**
     * @swagger
     * /customer-addresses:
     *   get:
     *     summary: Lista todos os endereços de clientes
     *     tags: [Customer Addresses]
     *     security:
     *       - bearerAuth: []
     *     responses:
     *       200:
     *         description: Lista de endereços de clientes
     *       401:
     *         description: Não autenticado
     */
    this.get('/', 'index', { auth: true, permissions: ['admin', 'manager', 'user'] });

    /**
     * @swagger
     * /customer-addresses/{id}:
     *   get:
     *     summary: Obtém um endereço de cliente pelo ID
     *     tags: [Customer Addresses]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *         description: ID do endereço do cliente
     *     responses:
     *       200:
     *         description: Dados do endereço do cliente
     *       401:
     *         description: Não autenticado
     *       404:
     *         description: Endereço de cliente não encontrado
     */
    this.get('/:id', 'show', { auth: true, permissions: ['admin', 'manager', 'user'] });

    /**
     * @swagger
     * /customer-addresses:
     *   post:
     *     summary: Cria um novo endereço de cliente
     *     tags: [Customer Addresses]
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/CustomerAddressCreate'
     *     responses:
     *       201:
     *         description: Endereço de cliente criado com sucesso
     *       400:
     *         description: Dados inválidos
     *       401:
     *         description: Não autenticado
     */
    this.post('/', 'store', { auth: true, permissions: ['admin', 'manager', 'user'], validationSchema: createCustomerAddressSchema });
 
    /**
     * @swagger
     * /customer-addresses/{id}:
     *   put:
     *     summary: Atualiza um endereço de cliente existente
     *     tags: [Customer Addresses]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *         description: ID do endereço do cliente
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/CustomerAddressUpdate'
     *     responses:
     *       200:
     *         description: Endereço de cliente atualizado com sucesso
     *       400:
     *         description: Dados inválidos
     *       401:
     *         description: Não autenticado
     *       404:
     *         description: Endereço de cliente não encontrado
     */
    this.put('/:id', 'update', { auth: true, permissions: ['admin', 'manager', 'user'], validationSchema: updateCustomerAddressSchema });

    /**
     * @swagger
     * /customer-addresses/{id}:
     *   delete:
     *     summary: Remove um endereço de cliente
     *     tags: [Customer Addresses]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *         description: ID do endereço do cliente
     *     responses:
     *       204:
     *         description: Endereço de cliente removido com sucesso
     *       401:
     *         description: Não autenticado
     *       404:
     *         description: Endereço de cliente não encontrado
     */
    this.delete('/:id', 'destroy', { auth: true, permissions: ['admin', 'manager', 'user'] });

    /**
     * @swagger
     * /customer-addresses/{id}/set-default:
     *   put:
     *     summary: Define um endereço de cliente como padrão
     *     tags: [Customer Addresses]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *         description: ID do endereço do cliente a ser definido como padrão
     *     responses:
     *       200:
     *         description: Endereço definido como padrão com sucesso
     *       401:
     *         description: Não autenticado
     *       404:
     *         description: Endereço de cliente não encontrado
     */
    this.put('/:id/set-default', 'setAsDefault', { auth: true, permissions: ['admin', 'manager', 'user'] });
  }
}

export default new CustomerAddressRoutes().router;