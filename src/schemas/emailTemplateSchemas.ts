/**
 * @swagger
 * components:
 *   schemas:
 *     EmailTemplate:
 *       type: object
 *       properties:
 *         id: { type: integer }
 *         name: { type: string }
 *         subject: { type: string }
 *         body: { type: string }
 *         type: { type: string }
 *         isActive: { type: boolean }
 *         created_at: { type: string, format: date-time }
 *         updated_at: { type: string, format: date-time }
 *       example:
 *         id: 1
 *         name: "welcome_email"
 *         subject: "Bem-vindo ao nosso serviço!"
 *         body: "<h1>Olá {{username}}, bem-vindo!</h1>"
 *         type: "welcome"
 *         isActive: true
 *         created_at: "2025-08-05T10:00:00Z"
 *         updated_at: "2025-08-05T10:00:00Z"
 *
 *     EmailTemplateResponse:
 *       type: object
 *       properties:
 *         success: { type: boolean }
 *         message: { type: string }
 *         data: { $ref: '#/components/schemas/EmailTemplate' }
 *
 *     EmailTemplateListResponse:
 *       type: object
 *       properties:
 *         success: { type: boolean }
 *         message: { type: string }
 *         data: { type: array, items: { $ref: '#/components/schemas/EmailTemplate' } }
 *         meta: { $ref: '#/components/schemas/Pagination' }
 *
 *     EmailTemplateCreate:
 *       type: object
 *       required: [name, subject, body]
 *       properties:
 *         name: { type: string }
 *         subject: { type: string }
 *         body: { type: string }
 *         type: { type: string }
 *         isActive: { type: boolean }
 *       example:
 *         name: "password_reset"
 *         subject: "Redefinição de Senha"
 *         body: "<p>Clique no link para redefinir sua senha: {{resetLink}}</p>"
 *         type: "password_reset"
 *         isActive: true
 *
 *     EmailTemplateUpdate:
 *       type: object
 *       properties:
 *         name: { type: string }
 *         subject: { type: string }
 *         body: { type: string }
 *         type: { type: string }
 *         isActive: { type: boolean }
 *       example:
 *         subject: "Sua senha foi redefinida"
 *         body: "<p>Sua senha foi alterada com sucesso.</p>"
 *         isActive: false
 */

import Joi from 'joi';

export const createEmailTemplateSchema = Joi.object({
  name: Joi.string().min(3).max(100).required(),
  subject: Joi.string().min(3).max(255).required(),
  body: Joi.string().min(10).max(5000).required(),
  type: Joi.string().max(50).optional(),
  isActive: Joi.boolean().default(true)
});

export const updateEmailTemplateSchema = Joi.object({
  name: Joi.string().min(3).max(100).optional(),
  subject: Joi.string().min(3).max(255).optional(),
  body: Joi.string().min(10).max(5000).optional(),
  type: Joi.string().max(50).optional(),
  isActive: Joi.boolean().optional()
});

export const listEmailTemplatesSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().max(100).optional(),
  type: Joi.string().max(50).optional(),
  isActive: Joi.boolean().optional()
});

export const getEmailTemplateSchema = Joi.object({
  id: Joi.number().integer().positive().required()
});

export const deleteEmailTemplateSchema = Joi.object({
  id: Joi.number().integer().positive().required()
});

export const getEmailTemplateByNameSchema = Joi.object({
  name: Joi.string().min(3).max(100).required()
});

export const getEmailTemplatesByTypeSchema = Joi.object({
  type: Joi.string().max(50).required()
});
