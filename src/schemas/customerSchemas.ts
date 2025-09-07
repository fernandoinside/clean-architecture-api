/**
 * @swagger
 * components:
 *   schemas:
 *     Customer:
 *       type: object
 *       properties:
 *         id: { type: integer, description: "ID único do cliente" }
 *         company_id: { type: integer, description: "ID da empresa à qual o cliente pertence" }
 *         name: { type: string, description: "Nome completo do cliente" }
 *         email: { type: string, format: "email", description: "E-mail do cliente" }
 *         phone: { type: string, nullable: true, description: "Telefone do cliente (opcional)" }
 *         document: { type: string, nullable: true, description: "CPF/CNPJ do cliente (opcional)" }
 *         status: { 
 *           type: "string", 
 *           enum: ["active", "inactive", "suspended"],
 *           description: "Status do cliente"
 *         }
 *         metadata: { type: object, nullable: true, description: "Dados adicionais em formato JSON" }
 *         created_at: { type: "string", format: "date-time", description: "Data de criação" }
 *         updated_at: { type: "string", format: "date-time", description: "Data da última atualização" }
 *         deleted_at: { type: "string", format: "date-time", nullable: true, description: "Data de remoção (soft delete)" }
 *       example:
 *         id: 1
 *         company_id: 1
 *         name: "João Silva"
 *         email: "joao.silva@example.com"
 *         phone: "+5511987654321"
 *         document: "123.456.789-09"
 *         status: "active"
 *         metadata: { "preferencias": "email", "origem": "website", "observacoes": "Cliente VIP" }
 *         created_at: "2025-08-05T10:00:00Z"
 *         updated_at: "2025-08-15T14:30:00Z"
 *         deleted_at: null
 *
 *     CustomerResponse:
 *       type: object
 *       properties:
 *         success: { type: boolean }
 *         message: { type: string }
 *         data: { $ref: '#/components/schemas/Customer' }
 *
 *     CustomerListResponse:
 *       type: object
 *       properties:
 *         success: { type: boolean }
 *         message: { type: string }
 *         data: { type: array, items: { $ref: '#/components/schemas/Customer' } }
 *         meta: { $ref: '#/components/schemas/Pagination' }
 *
 *     CustomerCreate:
 *       type: object
 *       required: [company_id, name, email]
 *       properties:
 *         company_id: { type: integer, description: "ID da empresa" }
 *         name: { type: string, description: "Nome completo do cliente" }
 *         email: { type: string, format: "email", description: "E-mail do cliente" }
 *         phone: { type: string, nullable: true, description: "Telefone do cliente (opcional)" }
 *         document: { type: string, nullable: true, description: "CPF/CNPJ do cliente (opcional)" }
 *         status: { 
 *           type: "string", 
 *           enum: ["active", "inactive", "suspended"],
 *           default: "active",
 *           description: "Status do cliente"
 *         }
 *         metadata: { type: object, nullable: true, description: "Dados adicionais em formato JSON" }
 *       example:
 *         company_id: 1
 *         name: "Fernando Machado"
 *         email: "fernando.machado@example.com"
 *         phone: "+5521912345678"
 *         document: "123.456.789-09"
 *         status: "active"
 *         metadata: { "origem": "indicacao", "observacoes": "Cliente interessado em plano premium" }
 *
 *     CustomerUpdate:
 *       type: object
 *       properties:
 *         name: { type: string, description: "Nome completo do cliente" }
 *         email: { type: string, format: "email", description: "E-mail do cliente" }
 *         phone: { type: string, nullable: true, description: "Telefone do cliente" }
 *         document: { type: string, nullable: true, description: "CPF/CNPJ do cliente" }
 *         status: { 
 *           type: "string", 
 *           enum: ["active", "inactive", "suspended"],
 *           description: "Status do cliente"
 *         }
 *         metadata: { type: object, nullable: true, description: "Dados adicionais em formato JSON" }
 *       example:
 *         name: "Fernando Machado Silva"
 *         email: "fernando.silva@example.com"
 *         phone: "+5521999999999"
 *         document: "987.654.321-00"
 *         status: "active"
 *         metadata: { "preferencias": "whatsapp", "observacoes": "Atualizado dados de contato" }
 */

import Joi from 'joi';

export const createCustomerSchema = Joi.object({
  company_id: Joi.number().integer().positive().required(),
  name: Joi.string().min(2).max(200).required(),
  email: Joi.string().email().max(255).required(),
  phone: Joi.string().min(10).max(20).optional().allow(null, ''),
  document: Joi.string().min(11).max(20).optional().allow(null, ''),
  status: Joi.string().valid('active', 'inactive', 'suspended').default('active'),
  metadata: Joi.object().optional().allow(null)
});

export const updateCustomerSchema = Joi.object({
  name: Joi.string().min(2).max(200).optional(),
  email: Joi.string().email().max(255).optional(),
  phone: Joi.string().min(10).max(20).optional().allow(null, ''),
  document: Joi.string().min(11).max(20).optional().allow(null, ''),
  status: Joi.string().valid('active', 'inactive', 'suspended').optional(),
  metadata: Joi.object().optional().allow(null)
});

export const listCustomersSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().max(255).optional(),
  status: Joi.string().valid('active', 'inactive', 'suspended').optional(),
  company_id: Joi.number().integer().positive().optional()
});

export const getCustomerSchema = Joi.object({
  id: Joi.number().integer().positive().required()
});

export const deleteCustomerSchema = Joi.object({
  id: Joi.number().integer().positive().required()
});

export const getCustomerByEmailSchema = Joi.object({
  email: Joi.string().email().required()
});

export const getCustomersByCompanySchema = Joi.object({
  company_id: Joi.number().integer().positive().required(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10)
});
