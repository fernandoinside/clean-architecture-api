/**
 * @swagger
 * components:
 *   schemas:
 *     PasswordReset:
 *       type: object
 *       properties:
 *         id: { type: integer }
 *         userId: { type: integer }
 *         token: { type: string }
 *         expiresAt: { type: string, format: date-time }
 *         isUsed: { type: boolean }
 *         created_at: { type: string, format: date-time }
 *       example:
 *         id: 1
 *         userId: 1
 *         token: "reset_token_123456"
 *         expiresAt: "2025-08-06T10:00:00Z"
 *         isUsed: false
 *         created_at: "2025-08-05T10:00:00Z"
 *
 *     PasswordResetResponse:
 *       type: object
 *       properties:
 *         success: { type: boolean }
 *         message: { type: string }
 *         data: { $ref: '#/components/schemas/PasswordReset' }
 *
 *     PasswordResetListResponse:
 *       type: object
 *       properties:
 *         success: { type: boolean }
 *         message: { type: string }
 *         data: { type: array, items: { $ref: '#/components/schemas/PasswordReset' } }
 *         meta: { $ref: '#/components/schemas/Pagination' }
 *
 *     PasswordResetCreate:
 *       type: object
 *       required: [userId, token, expiresAt]
 *       properties:
 *         userId: { type: integer }
 *         token: { type: string }
 *         expiresAt: { type: string, format: date-time }
 *         isUsed: { type: boolean }
 *       example:
 *         userId: 1
 *         token: "new_reset_token_789"
 *         expiresAt: "2025-08-06T12:00:00Z"
 *         isUsed: false
 *
 *     PasswordResetUpdate:
 *       type: object
 *       properties:
 *         token: { type: string }
 *         expiresAt: { type: string, format: date-time }
 *         isUsed: { type: boolean }
 *       example:
 *         isUsed: true
 */

import Joi from 'joi';

export const createPasswordResetSchema = Joi.object({
  userId: Joi.number().integer().positive().required(),
  token: Joi.string().min(32).max(255).required(),
  expiresAt: Joi.date().required(),
  isUsed: Joi.boolean().default(false)
});

export const updatePasswordResetSchema = Joi.object({
  token: Joi.string().min(32).max(255).optional(),
  expiresAt: Joi.date().optional(),
  isUsed: Joi.boolean().optional()
});

export const listPasswordResetsSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  userId: Joi.number().integer().positive().optional(),
  isUsed: Joi.boolean().optional()
});

export const getPasswordResetSchema = Joi.object({
  id: Joi.number().integer().positive().required()
});

export const deletePasswordResetSchema = Joi.object({
  id: Joi.number().integer().positive().required()
});

export const getPasswordResetByTokenSchema = Joi.object({
  token: Joi.string().min(32).max(255).required()
});

export const getPasswordResetsByUserSchema = Joi.object({
  userId: Joi.number().integer().positive().required(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10)
});

export const markAsUsedSchema = Joi.object({
  id: Joi.number().integer().positive().required()
});
