/**
 * @swagger
 * components:
 *   schemas:
 *     # Requests
 *     AuthLogin:
 *       type: object
 *       required: [email, password]
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           description: Email do usuário
 *         password:
 *           type: string
 *           minLength: 6
 *           description: Senha do usuário
 *       example:
 *         email: "admin@example.com"
 *         password: "senha123"
 *
 *     AuthRegister:
 *       type: object
 *       required: [username, email, password, confirmPassword, firstName, lastName]
 *       properties:
 *         username:
 *           type: string
 *           minLength: 3
 *           maxLength: 50
 *           description: Nome de usuário único
 *         email:
 *           type: string
 *           format: email
 *           description: Email do usuário
 *         password:
 *           type: string
 *           minLength: 6
 *           description: Senha do usuário
 *         confirmPassword:
 *           type: string
 *           minLength: 6
 *           description: Confirmação da senha
 *         firstName:
 *           type: string
 *           maxLength: 100
 *           description: Primeiro nome
 *         lastName:
 *           type: string
 *           maxLength: 100
 *           description: Sobrenome
 *         companyId:
 *           type: integer
 *           minimum: 1
 *           description: ID da empresa (opcional)
 *       example:
 *         username: "joao123"
 *         email: "joao@example.com"
 *         password: "minhasenha123"
 *         confirmPassword: "minhasenha123"
 *         firstName: "João"
 *         lastName: "Silva"
 *         companyId: 1
 *
 *     RefreshTokenRequest:
 *       type: object
 *       required: [refreshToken]
 *       properties:
 *         refreshToken:
 *           type: string
 *           description: Token de atualização válido
 *       example:
 *         refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *
 *     ForgotPasswordRequest:
 *       type: object
 *       required: [email]
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           description: Email do usuário para recuperação
 *       example:
 *         email: "usuario@example.com"
 *
 *     ResetPasswordRequest:
 *       type: object
 *       required: [token, password, confirmPassword]
 *       properties:
 *         token:
 *           type: string
 *           description: Token de redefinição recebido por email
 *         password:
 *           type: string
 *           minLength: 6
 *           description: Nova senha
 *         confirmPassword:
 *           type: string
 *           minLength: 6
 *           description: Confirmação da nova senha
 *       example:
 *         token: "550e8400-e29b-41d4-a716-446655440000"
 *         password: "novaSenha123"
 *         confirmPassword: "novaSenha123"
 *
 *     # Responses
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: ID único do usuário
 *         username:
 *           type: string
 *           description: Nome de usuário
 *         email:
 *           type: string
 *           format: email
 *           description: Email do usuário
 *         firstName:
 *           type: string
 *           description: Primeiro nome
 *         lastName:
 *           type: string
 *           description: Sobrenome
 *         company_id:
 *           type: integer
 *           nullable: true
 *           description: ID da empresa vinculada
 *         email_verified:
 *           type: boolean
 *           description: Se o email foi verificado
 *         is_active:
 *           type: boolean
 *           description: Se o usuário está ativo
 *         role_id:
 *           type: integer
 *           nullable: true
 *           description: ID do papel/função
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Data de criação
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: Data da última atualização
 *       example:
 *         id: 1
 *         username: "joao123"
 *         email: "joao@example.com"
 *         firstName: "João"
 *         lastName: "Silva"
 *         company_id: 1
 *         email_verified: true
 *         is_active: true
 *         role_id: 2
 *         created_at: "2024-01-15T10:30:00Z"
 *         updated_at: "2024-01-15T10:30:00Z"
 *
 *     LoginResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           type: object
 *           properties:
 *             user:
 *               $ref: '#/components/schemas/User'
 *             token:
 *               type: string
 *               description: Token JWT de acesso
 *             refreshToken:
 *               type: string
 *               description: Token para renovação
 *       example:
 *         success: true
 *         data:
 *           user:
 *             id: 1
 *             username: "admin"
 *             email: "admin@example.com"
 *           token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *           refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *
 *     RegisterResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: "Usuário registrado com sucesso. Verifique seu email para ativar sua conta."
 *         data:
 *           $ref: '#/components/schemas/User'
 *
 *     RefreshTokenResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           type: object
 *           properties:
 *             token:
 *               type: string
 *               description: Novo token JWT de acesso
 *             refreshToken:
 *               type: string
 *               description: Novo token de atualização
 *       example:
 *         success: true
 *         data:
 *           token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *           refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *
 *     MessageResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         message:
 *           type: string
 *       example:
 *         success: true
 *         message: "Operação realizada com sucesso"
 *
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         message:
 *           type: string
 *           description: Descrição do erro
 *         errors:
 *           type: array
 *           items:
 *             type: object
 *           description: Detalhes dos erros (opcional)
 *       example:
 *         success: false
 *         message: "Erro de validação"
 */

import Joi from 'joi';

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required()
});

export const registerSchema = Joi.object({
  username: Joi.string().min(3).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  confirmPassword: Joi.string().valid(Joi.ref('password')).required(),
  firstName: Joi.string().max(100).optional(),
  lastName: Joi.string().max(100).optional(),
  companyId: Joi.number().integer().positive().optional()
});

export const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().required()
});

export const resetPasswordSchema = Joi.object({
  token: Joi.string().min(32).max(255).required(),
  password: Joi.string().min(6).required(),
  confirmPassword: Joi.string().valid(Joi.ref('password')).required()
});

export const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string().min(32).max(255).required()
});

export const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string().min(6).required(),
  confirmPassword: Joi.string().valid(Joi.ref('newPassword')).required()
});

export const verifyEmailSchema = Joi.object({
  token: Joi.string().min(32).max(255).required()
});

export const resendVerificationSchema = Joi.object({
  email: Joi.string().email().required()
});

export const logoutSchema = Joi.object({
  refreshToken: Joi.string().min(32).max(255).optional()
});