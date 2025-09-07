/**
 * @swagger
 * components:
 *   schemas:
 *     File:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           format: int64
 *           description: ID único do arquivo
 *         filename:
 *           type: string
 *           minLength: 3
 *           maxLength: 255
 *           description: Nome do arquivo no sistema
 *         originalName:
 *           type: string
 *           minLength: 3
 *           maxLength: 255
 *           description: Nome original do arquivo
 *         mimeType:
 *           type: string
 *           maxLength: 100
 *           description: 'Tipo MIME do arquivo (ex. image/png, application/pdf)'
 *         size:
 *           type: integer
 *           minimum: 0
 *           description: Tamanho do arquivo em bytes
 *         path:
 *           type: string
 *           maxLength: 500
 *           description: Caminho do arquivo no servidor
 *         userId:
 *           type: string
 *           format: uuid
 *           description: ID do usuário que fez o upload
 *         entityType:
 *           type: string
 *           maxLength: 50
 *           nullable: true
 *           description: Tipo da entidade relacionada (opcional)
 *         entityId:
 *           type: string
 *           format: uuid
 *           nullable: true
 *           description: ID da entidade relacionada (opcional)
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *
 *     FileListResponse:
 *       type: object
 *       properties:
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/File'
 *         pagination:
 *           $ref: '#/components/schemas/Pagination'
 *
 *     FileResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         data:
 *           $ref: '#/components/schemas/File'
 */

import Joi from 'joi';

// Schema para upload de arquivo
export const createFileSchema = Joi.object({
  filename: Joi.string().min(3).max(255).required()
    .description('Nome do arquivo no sistema (3-255 caracteres)'),
  originalName: Joi.string().min(3).max(255).required()
    .description('Nome original do arquivo (3-255 caracteres)'),
  mimeType: Joi.string().max(100).required()
    .description('Tipo MIME do arquivo (ex. image/png, application/pdf)'),
  size: Joi.number().integer().min(0).required()
    .description('Tamanho do arquivo em bytes (maior ou igual a zero)'),
  path: Joi.string().max(500).required()
    .description('Caminho completo do arquivo no servidor'),
  userId: Joi.string().uuid().required()
    .description('ID do usuário que está fazendo o upload'),
  entityType: Joi.string().max(50).optional().allow(null, '')
    .description('Tipo da entidade relacionada (opcional)'),
  entityId: Joi.string().uuid().optional().allow(null, '')
    .description('ID da entidade relacionada (opcional)')
});

// Schema para atualização de arquivo
export const updateFileSchema = Joi.object({
  filename: Joi.string().min(3).max(255)
    .description('Novo nome do arquivo (3-255 caracteres)'),
  originalName: Joi.string().min(3).max(255)
    .description('Novo nome original do arquivo (3-255 caracteres)'),
  mimeType: Joi.string().max(100)
    .description('Novo tipo MIME do arquivo'),
  size: Joi.number().integer().min(0)
    .description('Novo tamanho do arquivo em bytes'),
  path: Joi.string().max(500)
    .description('Novo caminho do arquivo no servidor'),
  entityType: Joi.string().max(50).optional().allow(null, '')
    .description('Tipo da entidade relacionada (opcional)'),
  entityId: Joi.string().uuid().optional().allow(null, '')
    .description('ID da entidade relacionada (opcional)')
}).min(1);

// Schema para listagem de arquivos
export const listFilesSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1)
    .description('Número da página'),
  limit: Joi.number().integer().min(1).max(100).default(10)
    .description('Quantidade de itens por página'),
  search: Joi.string().max(255).optional()
    .description('Termo de busca pelo nome do arquivo'),
  mimeType: Joi.string().max(100).optional()
    .description('Filtrar por tipo MIME específico'),
  uploadedBy: Joi.number().integer().positive().optional()
    .description('Filtrar por ID do usuário que fez o upload'),
  minSize: Joi.number().integer().min(0).optional()
    .description('Tamanho mínimo do arquivo em bytes'),
  maxSize: Joi.number().integer().positive().optional()
    .description('Tamanho máximo do arquivo em bytes')
});

// Schema para obtenção de arquivo por ID
export const getFileSchema = Joi.object({
  id: Joi.number().integer().positive().required()
    .description('ID do arquivo')
});

// Schema para exclusão de arquivo
export const deleteFileSchema = Joi.object({
  id: Joi.number().integer().positive().required()
    .description('ID do arquivo a ser excluído')
});

/**
 * @swagger
 * components:
 *   schemas:
 *     FileCreate:
 *       type: object
 *       required:
 *         - filename
 *         - originalName
 *         - mimeType
 *         - size
 *         - path
 *         - userId
 *       properties:
 *         filename:
 *           type: string
 *           minLength: 3
 *           maxLength: 255
 *           description: Nome do arquivo no sistema
 *         originalName:
 *           type: string
 *           minLength: 3
 *           maxLength: 255
 *           description: Nome original do arquivo
 *         mimeType:
 *           type: string
 *           maxLength: 100
 *           description: 'Tipo MIME do arquivo (ex. image/png, application/pdf)'
 *         size:
 *           type: integer
 *           minimum: 0
 *           description: Tamanho do arquivo em bytes
 *         path:
 *           type: string
 *           maxLength: 500
 *           description: Caminho do arquivo no servidor
 *         userId:
 *           type: string
 *           format: uuid
 *           description: ID do usuário que fez o upload
 *         entityType:
 *           type: string
 *           maxLength: 50
 *           nullable: true
 *           description: Tipo da entidade relacionada (opcional)
 *         entityId:
 *           type: string
 *           format: uuid
 *           nullable: true
 *           description: ID da entidade relacionada (opcional)
 *
 *     FileUpdate:
 *       type: object
 *       properties:
 *         originalName:
 *           type: string
 *           minLength: 3
 *           maxLength: 255
 *           description: Novo nome para o arquivo
 *         entityType:
 *           type: string
 *           maxLength: 50
 *           nullable: true
 *           description: Tipo da entidade relacionada (opcional)
 *         entityId:
 *           type: string
 *           format: uuid
 *           nullable: true
 *           description: ID da entidade relacionada (opcional)
 *         isActive:
 *           type: boolean
 *           description: Indica se o arquivo está ativo
 */

// Schema para listagem de arquivos por usuário
export const getFilesByUserSchema = Joi.object({
  uploadedBy: Joi.number().integer().positive().required()
    .description('ID do usuário para filtrar os arquivos'),
  page: Joi.number().integer().min(1).default(1)
    .description('Número da página'),
  limit: Joi.number().integer().min(1).max(100).default(10)
    .description('Quantidade de itens por página')
});

// Schema para listagem de arquivos por tipo MIME
export const getFilesByMimeTypeSchema = Joi.object({
  mimeType: Joi.string().max(100).required()
    .description('Tipo MIME para filtrar os arquivos (ex: image/*, application/pdf)'),
  page: Joi.number().integer().min(1).default(1)
    .description('Número da página'),
  limit: Joi.number().integer().min(1).max(100).default(10)
    .description('Quantidade de itens por página')
});
