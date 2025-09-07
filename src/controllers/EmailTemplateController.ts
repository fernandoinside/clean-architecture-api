import { Request, Response, NextFunction } from 'express';
import { EmailTemplateService } from '../services/EmailTemplateService';
import { IEmailTemplate } from '../models/EmailTemplate';
import BaseController from './BaseController';

/**
 * @swagger
 * tags:
 *   name: EmailTemplates
 *   description: Gerenciamento de templates de e-mail
 */
class EmailTemplateController extends BaseController<IEmailTemplate> {
  private emailTemplateService: EmailTemplateService;

  constructor() {
    const service = new EmailTemplateService();
    super(service, 'Template de E-mail');
    this.emailTemplateService = service;
  }

  /**
   * @swagger
   * /email-templates:
   *   get:
   *     summary: Lista e busca templates de e-mail com filtros e paginação
   *     tags: [EmailTemplates]
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
   *         name: name
   *         schema:
   *           type: string
   *         description: Filtrar por nome do template
   *       - in: query
   *         name: subject
   *         schema:
   *           type: string
   *         description: Filtrar por assunto do template
   *       - in: query
   *         name: type
   *         schema:
   *           type: string
   *         description: Filtrar por tipo de template
   *     responses:
   *       200:
   *         description: Lista de templates de e-mail.
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/EmailTemplateListResponse'
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

      const result = await this.emailTemplateService.search(
        filters as { [key: string]: string },
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
   * /email-templates/{id}:
   *   get:
   *     summary: Busca um template de e-mail pelo ID
   *     tags: [EmailTemplates]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         schema:
   *           type: integer
   *         required: true
   *         description: ID do template de e-mail
   *     responses:
   *       200:
   *         description: Template de e-mail encontrado.
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/EmailTemplateResponse'
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
   * /email-templates:
   *   post:
   *     summary: Cria um novo template de e-mail
   *     tags: [EmailTemplates]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/EmailTemplateCreate'
   *     responses:
   *       201:
   *         description: Template de e-mail criado com sucesso.
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/EmailTemplateResponse'
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
   * /email-templates/{id}:
   *   put:
   *     summary: Atualiza um template de e-mail existente
   *     tags: [EmailTemplates]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         schema:
   *           type: integer
   *         required: true
   *         description: ID do template de e-mail
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/EmailTemplateUpdate'
   *     responses:
   *       200:
   *         description: Template de e-mail atualizado com sucesso.
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/EmailTemplateResponse'
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
   * /email-templates/{id}:
   *   delete:
   *     summary: Remove um template de e-mail
   *     tags: [EmailTemplates]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         schema:
   *           type: integer
   *         required: true
   *         description: ID do template de e-mail
   *     responses:
   *       204:
   *         description: Template de e-mail removido com sucesso.
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

export default EmailTemplateController;
