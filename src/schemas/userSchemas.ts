/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id: { type: integer }
 *         companyId: { type: integer }
 *         username: { type: string }
 *         email: { type: string, format: email }
 *         firstName: { type: string }
 *         lastName: { type: string }
 *         isActive: { type: boolean }
 *         emailVerified: { type: boolean }
 *         roleId: { type: integer }
 *         created_at: { type: string, format: date-time }
 *         updated_at: { type: string, format: date-time }
 *       example:
 *         id: 1
 *         companyId: 1
 *         username: "admin"
 *         email: "admin@example.com"
 *         firstName: "Admin"
 *         lastName: "User"
 *         isActive: true
 *         emailVerified: true
 *         roleId: 1
 *         created_at: "2025-08-05T10:00:00Z"
 *         updated_at: "2025-08-05T10:00:00Z"
 *
 *     UserResponse:
 *       type: object
 *       properties:
 *         success: { type: boolean }
 *         message: { type: string }
 *         data: { $ref: '#/components/schemas/User' }
 *
 *     UserListResponse:
 *       type: object
 *       properties:
 *         success: { type: boolean }
 *         message: { type: string }
 *         data: { type: array, items: { $ref: '#/components/schemas/User' } }
 *         meta: { $ref: '#/components/schemas/Pagination' }
 *
 *     UserCreate:
 *       type: object
 *       required: [username, email, password, roleId]
 *       properties:
 *         username: { type: string }
 *         email: { type: string, format: email }
 *         password: { type: string }
 *         firstName: { type: string }
 *         lastName: { type: string }
 *         isActive: { type: boolean }
 *         emailVerified: { type: boolean }
 *         roleId: { type: integer }
 *         companyId: { type: integer }
 *       example:
 *         username: "newuser"
 *         email: "newuser@example.com"
 *         password: "password123"
 *         firstName: "João"
 *         lastName: "Silva"
 *         isActive: true
 *         emailVerified: false
 *         roleId: 2
 *         companyId: 1
 *
 *     UserUpdate:
 *       type: object
 *       properties:
 *         username: { type: string }
 *         email: { type: string, format: email }
 *         firstName: { type: string }
 *         lastName: { type: string }
 *         isActive: { type: boolean }
 *         emailVerified: { type: boolean }
 *         roleId: { type: integer }
 *         companyId: { type: integer }
 *       example:
 *         firstName: "João Pedro"
 *         isActive: false
 */

import Joi from 'joi';

export const createUserSchema = Joi.object({
  username: Joi.string().min(3).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  first_name: Joi.string().max(100).optional(),
  last_name: Joi.string().max(100).optional(),
  is_active: Joi.boolean().default(true),
  email_verified: Joi.boolean().default(false),
  email_verification_token: Joi.string().optional().allow(null),
  role_id: Joi.number().integer().positive().required(),
  company_id: Joi.number().integer().positive().optional()
});

export const updateUserSchema = Joi.object({
  username: Joi.string().min(3).max(50).optional(),
  email: Joi.string().email().optional(),
  first_name: Joi.string().max(100).optional(),
  last_name: Joi.string().max(100).optional(),
  is_active: Joi.boolean().optional(),
  email_verified: Joi.boolean().optional(),
  email_verification_token: Joi.string().optional().allow(null),
  role_id: Joi.number().integer().positive().optional(),
  company_id: Joi.number().integer().positive().optional()
});

export const listUsersSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().max(100).optional(),
  isActive: Joi.boolean().optional(),
  roleId: Joi.number().integer().positive().optional(),
  companyId: Joi.number().integer().positive().optional()
});

export const getUserSchema = Joi.object({
  id: Joi.number().integer().positive().required()
});

export const deleteUserSchema = Joi.object({
  id: Joi.number().integer().positive().required()
});

export const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string().min(6).required(),
  confirmPassword: Joi.string().valid(Joi.ref('newPassword')).required()
});

export const resetPasswordSchema = Joi.object({
  email: Joi.string().email().required()
});

export const verifyEmailSchema = Joi.object({
  token: Joi.string().required()
});

export const resendVerificationSchema = Joi.object({
  email: Joi.string().email().required()
});
