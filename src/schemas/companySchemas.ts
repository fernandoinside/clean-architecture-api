/**
 * @swagger
 * components:
 *   schemas:
 *     Company:
 *       type: object
 *       required:
 *         - id
 *         - name
 *         - email
 *         - status
 *         - created_at
 *         - updated_at
 *       properties:
 *         id:
 *           type: integer
 *           format: int64
 *           description: Identificador único da empresa
 *           example: 1
 *         name:
 *           type: string
 *           minLength: 3
 *           maxLength: 255
 *           description: Nome da empresa (obrigatório)
 *           example: "Empresa Exemplo LTDA"
 *         email:
 *           type: string
 *           format: email
 *           maxLength: 255
 *           description: Endereço de e-mail da empresa (deve ser único)
 *           example: "contato@empresaexemplo.com"
 *         document:
 *           type: string
 *           nullable: true
 *           minLength: 11
 *           maxLength: 18
 *           description: CNPJ (14 dígitos) ou CPF (11 dígitos) da empresa
 *           example: "12.345.678/0001-90"
 *         phone:
 *           type: string
 *           nullable: true
 *           minLength: 10
 *           maxLength: 20
 *           description: Telefone de contato da empresa (com DDD)
 *           example: "(11) 98765-4321"
 *         website:
 *           type: string
 *           nullable: true
 *           format: uri
 *           maxLength: 255
 *           description: URL do website da empresa
 *           example: "https://www.empresaexemplo.com.br"
 *         industry:
 *           type: string
 *           nullable: true
 *           maxLength: 100
 *           description: Setor de atuação da empresa
 *           example: "Tecnologia da Informação"
 *         status:
 *           type: string
 *           enum: [active, inactive, pending, suspended]
 *           default: active
 *           description: Status da empresa no sistema
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Data e hora de criação do registro
 *           example: "2023-01-01T10:00:00Z"
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: Data e hora da última atualização
 *           example: "2023-01-01T10:00:00Z"
 *         deleted_at:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           description: Data e hora da exclusão lógica (soft delete)
 *
 *     CompanyCreate:
 *       type: object
 *       required: [name, email]
 *       properties:
 *         name: 
 *           type: string
 *           minLength: 3
 *           maxLength: 255
 *           example: "Nova Empresa LTDA"
 *         email: 
 *           type: string
 *           format: email
 *           maxLength: 255
 *           example: "contato@novaempresa.com"
 *         document: 
 *           type: string
 *           nullable: true
 *           minLength: 11
 *           maxLength: 18
 *           example: "98.765.432/0001-10"
 *         phone: 
 *           type: string
 *           nullable: true
 *           minLength: 10
 *           maxLength: 20
 *           example: "(11) 91234-5678"
 *         website: 
 *           type: string
 *           nullable: true
 *           format: uri
 *           maxLength: 255
 *           example: "https://www.novaempresa.com.br"
 *         industry: 
 *           type: string
 *           nullable: true
 *           maxLength: 100
 *           example: "Tecnologia"
 *         status: 
 *           type: string
 *           enum: [active, inactive, pending, suspended]
 *           default: active
 *           example: "active"
 *       example:
 *         name: "Nova Empresa LTDA"
 *         email: "contato@novaempresa.com"
 *         document: "98.765.432/0001-10"
 *         phone: "(11) 91234-5678"
 *         website: "https://www.novaempresa.com.br"
 *         industry: "Tecnologia"
 *         status: "active"
 *
 *     CompanyUpdate:
 *       type: object
 *       properties:
 *         name: 
 *           type: string
 *           minLength: 3
 *           maxLength: 255
 *           example: "Empresa Atualizada LTDA"
 *         email: 
 *           type: string
 *           format: email
 *           maxLength: 255
 *           example: "novoemail@empresa.com"
 *         document: 
 *           type: string
 *           nullable: true
 *           minLength: 11
 *           maxLength: 18
 *           example: "12.345.678/0001-90"
 *         phone: 
 *           type: string
 *           nullable: true
 *           minLength: 10
 *           maxLength: 20
 *           example: "(11) 99876-5432"
 *         website: 
 *           type: string
 *           nullable: true
 *           format: uri
 *           maxLength: 255
 *           example: "https://www.empresa-atualizada.com.br"
 *         industry: 
 *           type: string
 *           nullable: true
 *           maxLength: 100
 *           example: "Tecnologia da Informação"
 *         status: 
 *           type: string
 *           enum: [active, inactive, pending, suspended]
 *           example: "active"
 *       example:
 *         name: "Empresa Atualizada LTDA"
 *         phone: "(11) 99876-5432"
 *         status: "active"
 *
 *     CompanyResponse:
 *       type: object
 *       properties:
 *         success: 
 *           type: boolean
 *           example: true
 *         message: 
 *           type: string
 *           example: "Operação realizada com sucesso"
 *         data: 
 *           $ref: '#/components/schemas/Company'
 *
 *     CompanyListResponse:
 *       type: object
 *       properties:
 *         success: 
 *           type: boolean
 *           example: true
 *         message: 
 *           type: string
 *           example: "Lista de empresas obtida com sucesso"
 *         data: 
 *           type: array
 *           items: 
 *             $ref: '#/components/schemas/Company'
 *         meta: 
 *           $ref: '#/components/schemas/Pagination'
 */

import Joi from 'joi';
import { customJoi } from '../validations/customJoi';

export const createCompanySchema = Joi.object({
  name: Joi.string()
    .min(3)
    .max(255)
    .required()
    .messages({
      'string.empty': 'O nome da empresa é obrigatório',
      'string.min': 'O nome deve ter pelo menos {#limit} caracteres',
      'string.max': 'O nome não pode ter mais de {#limit} caracteres',
      'any.required': 'O nome da empresa é obrigatório'
    }),
  
  email: Joi.string()
    .email()
    .max(255)
    .required()
    .messages({
      'string.email': 'O e-mail informado é inválido',
      'string.empty': 'O e-mail é obrigatório',
      'string.max': 'O e-mail não pode ter mais de {#limit} caracteres',
      'any.required': 'O e-mail é obrigatório'
    }),
    
  document: customJoi.document()
    .cpfCnpj()
    .allow(null, '')
    .optional()
    .messages({
      'document.cpf': 'CPF inválido',
      'document.cnpj': 'CNPJ inválido',
      'document.invalid': 'Documento inválido'
    }),
    
  phone: Joi.string()
    .min(10)
    .max(20)
    .allow(null, '')
    .optional()
    .messages({
      'string.min': 'O telefone deve ter pelo menos {#limit} dígitos',
      'string.max': 'O telefone não pode ter mais de {#limit} caracteres'
    }),
    
  website: Joi.string()
    .uri()
    .max(255)
    .allow(null, '')
    .optional()
    .messages({
      'string.uri': 'URL do site inválida',
      'string.max': 'A URL do site não pode ter mais de {#limit} caracteres'
    }),
    
  industry: Joi.string()
    .max(100)
    .allow(null, '')
    .optional()
    .messages({
      'string.max': 'O setor de atuação não pode ter mais de {#limit} caracteres'
    }),
    
  status: Joi.string()
    .valid('active', 'inactive', 'pending', 'suspended')
    .default('active')
    .messages({
      'any.only': 'O status deve ser um dos seguintes: active, inactive, pending, suspended'
    })
});

export const updateCompanySchema = Joi.object({
  name: Joi.string()
    .min(3)
    .max(255)
    .optional()
    .messages({
      'string.min': 'O nome deve ter pelo menos {#limit} caracteres',
      'string.max': 'O nome não pode ter mais de {#limit} caracteres',
      'string.empty': 'O nome não pode estar vazio'
    }),
    
  email: Joi.string()
    .email()
    .max(255)
    .optional()
    .messages({
      'string.email': 'O e-mail informado é inválido',
      'string.max': 'O e-mail não pode ter mais de {#limit} caracteres',
      'string.empty': 'O e-mail não pode estar vazio'
    }),
    
  document: customJoi.document()
    .cpfCnpj()
    .allow(null, '')
    .optional()
    .messages({
      'document.cpf': 'CPF inválido',
      'document.cnpj': 'CNPJ inválido',
      'document.invalid': 'Documento inválido'
    }),
    
  phone: Joi.string()
    .min(10)
    .max(20)
    .allow(null, '')
    .optional()
    .messages({
      'string.min': 'O telefone deve ter pelo menos {#limit} dígitos',
      'string.max': 'O telefone não pode ter mais de {#limit} caracteres'
    }),
    
  website: Joi.string()
    .uri()
    .max(255)
    .allow(null, '')
    .optional()
    .messages({
      'string.uri': 'URL do site inválida',
      'string.max': 'A URL do site não pode ter mais de {#limit} caracteres'
    }),
    
  industry: Joi.string()
    .max(100)
    .allow(null, '')
    .optional()
    .messages({
      'string.max': 'O setor de atuação não pode ter mais de {#limit} caracteres'
    }),
    
  status: Joi.string()
    .valid('active', 'inactive', 'pending', 'suspended')
    .optional()
    .messages({
      'any.only': 'O status deve ser um dos seguintes: active, inactive, pending, suspended'
    })
});

export const listCompaniesSchema = Joi.object({
  page: Joi.number()
    .integer()
    .min(1)
    .default(1)
    .messages({
      'number.base': 'O número da página deve ser um valor numérico',
      'number.min': 'O número da página deve ser maior ou igual a 1'
    }),
    
  limit: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .default(10)
    .messages({
      'number.base': 'O limite deve ser um valor numérico',
      'number.min': 'O limite deve ser maior ou igual a 1',
      'number.max': 'O limite não pode ser maior que 100'
    }),
    
  search: Joi.string()
    .max(255)
    .optional()
    .messages({
      'string.max': 'O termo de busca não pode ter mais de {#limit} caracteres'
    }),
    
  status: Joi.string()
    .valid('active', 'inactive', 'pending', 'suspended')
    .optional()
    .messages({
      'any.only': 'O status deve ser um dos seguintes: active, inactive, pending, suspended'
    }),
    
  industry: Joi.string()
    .max(100)
    .optional()
    .messages({
      'string.max': 'O setor de atuação não pode ter mais de {#limit} caracteres'
    })
});

export const getCompanySchema = Joi.object({
  id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'O ID deve ser um número',
      'number.integer': 'O ID deve ser um número inteiro',
      'number.positive': 'O ID deve ser um número positivo',
      'any.required': 'O ID é obrigatório'
    })
});

export const deleteCompanySchema = Joi.object({
  id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'O ID deve ser um número',
      'number.integer': 'O ID deve ser um número inteiro',
      'number.positive': 'O ID deve ser um número positivo',
      'any.required': 'O ID é obrigatório'
    })
});

export const getCompanyByDocumentSchema = Joi.object({
  document: customJoi.document()
    .cpfCnpj()
    .required()
    .messages({
      'document.cpf': 'CPF inválido',
      'document.cnpj': 'CNPJ inválido',
      'document.invalid': 'Documento inválido',
      'any.required': 'O documento é obrigatório'
    })
});

export const getCompanyByEmailSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'O e-mail informado é inválido',
      'string.empty': 'O e-mail é obrigatório',
      'any.required': 'O e-mail é obrigatório'
    })
});
