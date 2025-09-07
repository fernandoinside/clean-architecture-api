/**
 * @swagger
 * components:
 *   schemas:
 *     CustomerAddress:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           format: int64
 *         customerId:
 *           type: integer
 *           description: ID do cliente dono do endereço
 *         street:
 *           type: string
 *           maxLength: 255
 *           description: Nome da rua
 *         city:
 *           type: string
 *           maxLength: 100
 *           description: Cidade
 *         state:
 *           type: string
 *           maxLength: 100
 *           description: Estado
 *         zipCode:
 *           type: string
 *           maxLength: 20
 *           description: CEP
 *         country:
 *           type: string
 *           maxLength: 100
 *           description: País
 *         type:
 *           type: string
 *           enum: [billing, shipping, both]
 *           default: billing
 *           description: Tipo de endereço
 *         isDefault:
 *           type: boolean
 *           default: false
 *           description: Se é o endereço padrão
 *         metadata:
 *           type: object
 *           nullable: true
 *           description: Dados adicionais em formato JSON
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *
 *     CustomerAddressListResponse:
 *       type: object
 *       properties:
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/CustomerAddress'
 *         pagination:
 *           $ref: '#/components/schemas/Pagination'
 *
 *     CustomerAddressResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         data:
 *           $ref: '#/components/schemas/CustomerAddress'
 *
 *     CustomerAddressCreate:
 *       type: object
 *       required:
 *         - customerId
 *         - street
 *         - city
 *         - state
 *         - zipCode
 *         - country
 *         - type
 *       properties:
 *         customerId:
 *           type: integer
 *           format: int64
 *           description: ID do cliente dono do endereço
 *         street:
 *           type: string
 *           maxLength: 255
 *           description: Nome da rua
 *         city:
 *           type: string
 *           maxLength: 100
 *           description: Cidade
 *         state:
 *           type: string
 *           maxLength: 100
 *           description: Estado
 *         zipCode:
 *           type: string
 *           maxLength: 20
 *           description: CEP
 *         country:
 *           type: string
 *           maxLength: 100
 *           description: País
 *         type:
 *           type: string
 *           enum: [billing, shipping, both]
 *           default: billing
 *           description: Tipo de endereço
 *         isDefault:
 *           type: boolean
 *           default: false
 *           description: Se é o endereço padrão
 *         metadata:
 *           type: object
 *           nullable: true
 *           description: Dados adicionais em formato JSON
 *
 *     CustomerAddressUpdate:
 *       type: object
 *       properties:
 *         street:
 *           type: string
 *           maxLength: 255
 *           description: Nome da rua
 *         city:
 *           type: string
 *           maxLength: 100
 *           description: Cidade
 *         state:
 *           type: string
 *           maxLength: 100
 *           description: Estado
 *         zipCode:
 *           type: string
 *           maxLength: 20
 *           description: CEP
 *         country:
 *           type: string
 *           maxLength: 100
 *           description: País
 *         type:
 *           type: string
 *           enum: [billing, shipping, both]
 *           description: Tipo de endereço
 *         isDefault:
 *           type: boolean
 *           description: Se é o endereço padrão
 *         metadata:
 *           type: object
 *           nullable: true
 *           description: Dados adicionais em formato JSON
 */

import Joi from 'joi';

// Schema para criação de endereço
export const createCustomerAddressSchema = Joi.object({
  customerId: Joi.number().integer().positive().required()
    .description('ID do cliente dono do endereço'),
  street: Joi.string().max(255).required()
    .description('Nome da rua'),
  city: Joi.string().max(100).required()
    .description('Cidade'),
  state: Joi.string().max(100).required()
    .description('Estado'),
  zipCode: Joi.string().max(20).required()
    .description('CEP'),
  country: Joi.string().max(100).required()
    .description('País'),
  type: Joi.string().valid('billing', 'shipping', 'both').default('billing')
    .description('Tipo de endereço (billing, shipping, both)'),
  isDefault: Joi.boolean().default(false)
    .description('Se é o endereço padrão'),
  metadata: Joi.object().optional().allow(null)
    .description('Dados adicionais em formato JSON')
});

// Schema para atualização de endereço
export const updateCustomerAddressSchema = Joi.object({
  street: Joi.string().max(255)
    .description('Nome da rua'),
  city: Joi.string().max(100)
    .description('Cidade'),
  state: Joi.string().max(100)
    .description('Estado'),
  zipCode: Joi.string().max(20)
    .description('CEP'),
  country: Joi.string().max(100)
    .description('País'),
  type: Joi.string().valid('billing', 'shipping', 'both')
    .description('Tipo de endereço (billing, shipping, both)'),
  isDefault: Joi.boolean()
    .description('Se é o endereço padrão'),
  metadata: Joi.object().optional().allow(null)
    .description('Dados adicionais em formato JSON')
});

// Schema para listagem de endereços
export const listCustomerAddressesSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1)
    .description('Número da página'),
  limit: Joi.number().integer().min(1).max(100).default(10)
    .description('Quantidade de itens por página'),
  customerId: Joi.number().integer().positive()
    .description('Filtrar por ID do cliente'),
  type: Joi.string().valid('billing', 'shipping', 'both')
    .description('Filtrar por tipo de endereço'),
  isDefault: Joi.boolean()
    .description('Filtrar por endereço padrão')
});

export const getCustomerAddressSchema = Joi.object({
  id: Joi.number().integer().positive().required()
});

export const deleteCustomerAddressSchema = Joi.object({
  id: Joi.number().integer().positive().required()
});

export const getAddressesByCustomerSchema = Joi.object({
  customerId: Joi.number().integer().positive().required(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10)
});

export const setDefaultAddressSchema = Joi.object({
  id: Joi.number().integer().positive().required()
});
