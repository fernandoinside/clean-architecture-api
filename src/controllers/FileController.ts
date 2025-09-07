import { Request, Response, NextFunction } from 'express';
import { FileService } from '../services/FileService';
import { IFile } from '../models/File';
import BaseController from './BaseController';

/**
 * @swagger
 * tags:
 *   name: Files
 *   description: Gerenciamento de arquivos
 */
class FileController extends BaseController<IFile> {
  private fileService: FileService;

  constructor() {
    const service = new FileService();
    super(service, 'Arquivo');
    this.fileService = service;
  }

  /**
   * @swagger
   * /files:
   *   get:
   *     summary: Lista e busca arquivos com filtros e paginação
   *     tags: [Files]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *           default: 1
   *         description: Número da página
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *           default: 10
   *         description: Itens por página
   *       - in: query
   *         name: userId
   *         schema:
   *           type: integer
   *         description: Filtrar por ID do usuário que fez o upload
   *       - in: query
   *         name: fileName
   *         schema:
   *           type: string
   *         description: Filtrar por nome do arquivo
   *       - in: query
   *         name: mimeType
   *         schema:
   *           type: string
   *         description: Filtrar por tipo MIME
   *       - in: query
   *         name: entityType
   *         schema:
   *           type: string
   *         description: Filtrar por tipo de entidade associada
   *       - in: query
   *         name: entityId
   *         schema:
   *           type: integer
   *         description: Filtrar por ID da entidade associada
   *     responses:
   *       200:
   *         description: Lista de arquivos.
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/FileListResponse'
   *       401:
   *         $ref: '#/components/responses/UnauthorizedError'
   *       500:
   *         $ref: '#/components/responses/InternalServerError'
   */
  async index(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { page = '1', limit = '10', ...filters } = req.query;
      const pageNumber = parseInt(page as string, 10) || 1;
      const limitNumber = parseInt(limit as string, 10) || 10;

      const result = await this.fileService.search(
        filters as any, // Usar 'any' para flexibilidade nos filtros
        pageNumber,
        limitNumber
      );

      res.json({
        success: true,
        data: result.data,
        meta: {
          total: result.pagination.total,
          page: result.pagination.page,
          limit: result.pagination.limit,
          totalPages: Math.ceil(result.pagination.total / result.pagination.limit)
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /files/{id}:
   *   get:
   *     summary: Busca um arquivo pelo ID
   *     tags: [Files]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         schema:
   *           type: integer
   *         required: true
   *         description: ID do arquivo
   *     responses:
   *       200:
   *         description: Arquivo encontrado.
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/FileResponse'
   *       401:
   *         $ref: '#/components/responses/UnauthorizedError'
   *       404:
   *         $ref: '#/components/responses/NotFoundError'
   *       500:
   *         $ref: '#/components/responses/InternalServerError'
   */
  async show(req: Request, res: Response, next: NextFunction): Promise<void> {
    return super.show(req, res, next);
  }

  /**
   * @swagger
   * /files:
   *   post:
   *     summary: Cria um novo arquivo
   *     tags: [Files]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/FileCreate'
   *     responses:
   *       201:
   *         description: Arquivo criado com sucesso.
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/FileResponse'
   *       400:
   *         $ref: '#/components/responses/BadRequestError'
   *       401:
   *         $ref: '#/components/responses/UnauthorizedError'
   *       500:
   *         $ref: '#/components/responses/InternalServerError'
   */
  async store(req: Request, res: Response, next: NextFunction): Promise<void> {
    return super.store(req, res, next);
  }

  /**
   * @swagger
   * /files/{id}:
   *   put:
   *     summary: Atualiza um arquivo existente
   *     tags: [Files]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         schema:
   *           type: integer
   *         required: true
   *         description: ID do arquivo
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/FileUpdate'
   *     responses:
   *       200:
   *         description: Arquivo atualizado com sucesso.
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/FileResponse'
   *       400:
   *         $ref: '#/components/responses/BadRequestError'
   *       401:
   *         $ref: '#/components/responses/UnauthorizedError'
   *       404:
   *         $ref: '#/components/responses/NotFoundError'
   *       500:
   *         $ref: '#/components/responses/InternalServerError'
   */
  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    return super.update(req, res, next);
  }

  /**
   * @swagger
   * /files/{id}:
   *   delete:
   *     summary: Remove um arquivo
   *     tags: [Files]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         schema:
   *           type: integer
   *         required: true
   *         description: ID do arquivo
   *     responses:
   *       204:
   *         description: Arquivo removido com sucesso.
   *       401:
   *         $ref: '#/components/responses/UnauthorizedError'
   *       404:
   *         $ref: '#/components/responses/NotFoundError'
   *       500:
   *         $ref: '#/components/responses/InternalServerError'
   */
  async destroy(req: Request, res: Response, next: NextFunction): Promise<void> {
    return super.destroy(req, res, next);
  }
}

export default FileController;
