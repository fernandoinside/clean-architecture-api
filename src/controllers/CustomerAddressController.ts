import { NextFunction, Request, Response } from 'express';
import logger from '../config/logger';
import { ICustomerAddress } from '../models/CustomerAddress';
import { CustomerAddressService } from '../services/CustomerAddressService';
import { NotFoundError, ValidationError } from '../utils/errors';
import BaseController from './BaseController';

/**
 * Controlador para gerenciamento de endereços de clientes
 * @swagger
 * tags:
 *   - name: Customer Addresses
 *     description: Endpoints para gerenciamento de endereços de clientes
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *   responses:
 *     UnauthorizedError:
 *       description: Acesso não autorizado
 *     BadRequestError:
 *       description: Requisição inválida
 *     NotFoundError:
 *       description: Recurso não encontrado
 *     InternalServerError:
 *       description: Erro interno do servidor
 */
class CustomerAddressController extends BaseController<ICustomerAddress> {
  private customerAddressService: CustomerAddressService;

  constructor() {
    const service = new CustomerAddressService();
    super(service, 'Endereço de Cliente');
    this.customerAddressService = service;
  }

  /**
   * @swagger
   * /customer-addresses:
   *   get:
   *     summary: Lista todos os endereços de clientes
   *     description: Retorna uma lista paginada de endereços de clientes com suporte a filtros
   *     tags: [Customer Addresses]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *           default: 1
   *         description: Número da página para paginação
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *           default: 10
   *           maximum: 100
   *         description: Número de itens por página (máx. 100)
   *       - in: query
   *         name: customer_id
   *         schema:
   *           type: integer
   *         description: Filtrar por ID do cliente
   *       - in: query
   *         name: is_default
   *         schema:
   *           type: boolean
   *         description: Filtrar por endereço padrão
   *       - in: query
   *         name: type
   *         schema:
   *           type: string
   *           enum: [billing, shipping, both]
   *         description: Tipo de endereço (cobrança, entrega ou ambos)
   *       - in: query
   *         name: street
   *         schema:
   *           type: string
   *         description: Filtrar por rua (busca parcial)
   *       - in: query
   *         name: city
   *         schema:
   *           type: string
   *         description: Filtrar por cidade
   *       - in: query
   *         name: state
   *         schema:
   *           type: string
   *         description: Filtrar por estado (UF)
   *       - in: query
   *         name: zip_code
   *         schema:
   *           type: string
   *         description: Filtrar por CEP
   *       - in: query
   *         name: country
   *         schema:
   *           type: string
   *         description: Filtrar por país
   *     responses:
   *       200:
   *         description: Lista de endereços de clientes
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
   *                     $ref: '#/components/schemas/CustomerAddress'
   *                 pagination:
   *                   $ref: '#/components/schemas/Pagination'
   *       400:
   *         $ref: '#/components/responses/BadRequestError'
   *       401:
   *         $ref: '#/components/responses/UnauthorizedError'
   *       500:
   *         $ref: '#/components/responses/InternalServerError'
   */
  index = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { 
        customer_id, 
        street, 
        city, 
        state, 
        zip_code, 
        country, 
        type, 
        is_default,
        page = '1',
        limit = '10'
      } = req.query;

      const filters = {
        customer_id: customer_id ? Number(customer_id) : undefined,
        street: street as string,
        city: city as string,
        state: state as string,
        zip_code: zip_code as string,
        country: country as string,
        type: type as string,
        is_default: is_default !== undefined ? is_default === 'true' : undefined,
      };

      const pageNumber = parseInt(page as string, 10) || 1;
      const limitNumber = Math.min(parseInt(limit as string, 10) || 10, 100);

      const result = await this.customerAddressService.search(filters, pageNumber, limitNumber);
      
      res.status(200).json({
        success: true,
        data: result.data,
        pagination: result.pagination
      });
    } catch (error) {
      logger.error('Erro ao listar endereços de clientes:', error);
      next(error);
    }
  };

  /**
   * @swagger
   * /customer-addresses/{id}:
   *   get:
   *     summary: Busca um endereço de cliente pelo ID
   *     tags: [Customer Addresses]
   *     security: [{ bearerAuth: [] }]
   *     parameters:
   *       - in: path
   *         name: id
   *         schema: { type: integer }
   *         required: true
   *         description: ID do endereço de cliente
   *     responses:
   *       200: { description: 'Endereço de cliente encontrado.', content: { application/json: { schema: { $ref: '#/components/schemas/CustomerAddressResponse' } } } }
   *       404: { description: 'Endereço de cliente não encontrado.' }
   *       400: { description: 'Dados inválidos.' }
   *       401: { description: 'Não autorizado.' }
   *       500: { description: 'Erro interno do servidor.' }
   */
  show = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const address = await this.customerAddressService.findById(Number(id));
      res.status(200).json({ success: true, data: address });
    } catch (error) {
      next(error);
    }
  };

  /**
   * @swagger
   * /customer-addresses:
   *   post:
   *     summary: Cria um novo endereço de cliente
   *     tags: [Customer Addresses]
   *     security: [{ bearerAuth: [] }]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/CustomerAddressCreate'
   *           example:
   *             customerId: 1
   *             street: "Rua das Flores, 123"
   *             city: "São Paulo"
   *             state: "SP"
   *             zipCode: "01234-567"
   *             country: "Brasil"
   *             type: "billing"
   *             isDefault: true
   *             metadata:
   *               complemento: "Apto 45"
   *               referencia: "Próximo ao mercado"
   *               observacoes: "Portão azul"
   *     responses:
   *       201: { description: 'Endereço de cliente criado com sucesso.', content: { application/json: { schema: { $ref: '#/components/schemas/CustomerAddressResponse' } } } }
   *       400: { description: 'Dados inválidos.' }
   *       401: { description: 'Não autorizado.' }
   *       500: { description: 'Erro interno do servidor.' }
   */
  store = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { customerId, street, city, state, zipCode, country, type, isDefault, metadata } = req.body;
      
      // Filtrar apenas os campos que pertencem à tabela customer_addresses
      const addressData = {
        customer_id: customerId,
        street,
        city,
        state,
        zip_code: zipCode,
        country,
        type,
        is_default: isDefault,
        metadata
      };
      
      logger.info(`Criando novo endereço para cliente: ${customerId}`);
      
      const newAddress = await this.customerAddressService.create(addressData);
      
      logger.info(`Endereço criado com sucesso: ID ${newAddress?.id}`);
      
      res.status(201).json({ success: true, message: 'Endereço de cliente criado com sucesso.', data: newAddress });
    } catch (error) {
      next(error);
    }
  };

  /**
   * @swagger
   * /customer-addresses/{id}:
   *   put:
   *     summary: Atualiza um endereço de cliente existente
   *     tags: [Customer Addresses]
   *     security: [{ bearerAuth: [] }]
   *     parameters:
   *       - in: path
   *         name: id
   *         schema: { type: integer }
   *         required: true
   *         description: ID do endereço de cliente
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/CustomerAddressUpdate'
   *           example:
   *             street: "Rua das Palmeiras, 456"
   *             city: "Rio de Janeiro"
   *             state: "RJ"
   *             zipCode: "22222-333"
   *             type: "shipping"
   *             isDefault: false
   *             metadata:
   *               complemento: "Casa 2"
   *               observacoes: "Endereço atualizado para entrega"
   *               validado: true
   *     responses:
   *       200: { description: 'Endereço de cliente atualizado com sucesso.', content: { application/json: { schema: { $ref: '#/components/schemas/CustomerAddressResponse' } } } }
   *       400: { description: 'Dados inválidos.' }
   *       404: { description: 'Endereço de cliente não encontrado.' }
   *       401: { description: 'Não autorizado.' }
   *       500: { description: 'Erro interno do servidor.' }
   */
  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      
      if (!id) {
        throw new ValidationError('ID do endereço não fornecido');
      }
      
      const addressId = Number(id);
      if (isNaN(addressId) || addressId < 1) {
        throw new ValidationError('ID do endereço inválido');
      }
      
      // Filtrar apenas os campos que pertencem à tabela customer_addresses
      const { street, city, state, zipCode, country, type, isDefault, metadata } = req.body;
      const updateData = {
        street,
        city,
        state,
        zip_code: zipCode,
        country,
        type,
        is_default: isDefault,
        metadata
      };
      
      logger.info(`Atualizando endereço: ID ${addressId}`);
      
      const updatedAddress = await this.customerAddressService.update(addressId, updateData);
      if (!updatedAddress) {
        throw new NotFoundError('Endereço de cliente não encontrado');
      }
      
      logger.info(`Endereço atualizado com sucesso: ID ${addressId}`);
      
      res.status(200).json({ success: true, message: 'Endereço de cliente atualizado com sucesso.', data: updatedAddress });
    } catch (error) {
      next(error);
    }
  };

  /**
   * @swagger
   * /customer-addresses/{id}:
   *   delete:
   *     summary: Remove um endereço de cliente
   *     tags: [Customer Addresses]
   *     security: [{ bearerAuth: [] }]
   *     parameters:
   *       - in: path
   *         name: id
   *         schema: { type: integer }
   *         required: true
   *         description: ID do endereço de cliente
   *     responses:
   *       200: { description: 'Endereço de cliente removido com sucesso.', content: { application/json: { schema: { type: object, properties: { success: { type: boolean }, message: { type: string } } } } } }
   *       400: { description: 'Dados inválidos.' }
   *       404: { description: 'Endereço de cliente não encontrado.' }
   *       401: { description: 'Não autorizado.' }
   *       500: { description: 'Erro interno do servidor.' }
   */
  delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      await this.customerAddressService.delete(Number(id));
      res.status(200).json({ success: true, message: 'Endereço de cliente removido com sucesso.' });
    } catch (error) {
      next(error);
    }
  };

  /**
   * @swagger
   * /customer-addresses/{id}/set-default:
   *   put:
   *     summary: Define um endereço como padrão para o cliente
   *     tags: [Customer Addresses]
   *     security: [{ bearerAuth: [] }]
   *     parameters:
   *       - in: path
   *         name: id
   *         schema: { type: integer }
   *         required: true
   *         description: ID do endereço a ser definido como padrão
   *       - in: query
   *         name: customer_id
   *         schema: { type: integer }
   *         required: true
   *         description: ID do cliente ao qual o endereço pertence
   *     responses:
   *       200: { description: 'Endereço definido como padrão com sucesso.', content: { application/json: { schema: { $ref: '#/components/schemas/CustomerAddressResponse' } } } }
   *       400: { description: 'Dados inválidos.' }
   *       404: { description: 'Endereço ou cliente não encontrado.' }
   *       401: { description: 'Não autorizado.' }
   *       500: { description: 'Erro interno do servidor.' }
   */
  setAsDefault = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { customer_id } = req.query;

      if (!customer_id) {
        throw new ValidationError('ID do cliente é obrigatório para definir endereço padrão.');
      }

      const updatedAddress = await this.customerAddressService.setAsDefault(Number(id), Number(customer_id));
      res.status(200).json({ success: true, message: 'Endereço definido como padrão com sucesso.', data: updatedAddress });
    } catch (error) {
      next(error);
    }
  };
}

export default CustomerAddressController;