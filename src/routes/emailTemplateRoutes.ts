import EmailTemplateController from '../controllers/EmailTemplateController';
import { createEmailTemplateSchema, updateEmailTemplateSchema } from '../schemas/emailTemplateSchemas';
import BaseRouter from './BaseRouter';

/**
 * @swagger
 * tags:
 *   name: EmailTemplates
 *   description: Gerenciamento de templates de e-mail
 */

class EmailTemplateRoutes extends BaseRouter<EmailTemplateController> {
  constructor() {
    super(new EmailTemplateController());
    this.setupRoutes();
  }

  private setupRoutes() {
    /**
     * @swagger
     * /email-templates:
     *   get:
     *     summary: Lista todos os modelos de e-mail
     *     tags: [Email Templates]
     *     security:
     *       - bearerAuth: []
     *     responses:
     *       200:
     *         description: Lista de modelos de e-mail
     *       401:
     *         description: Não autenticado
     */
    this.get('/', 'index', { auth: true, permissions: ['admin', 'manager', 'user'] });

    /**
     * @swagger
     * /email-templates/{id}:
     *   get:
     *     summary: Obtém um modelo de e-mail pelo ID
     *     tags: [Email Templates]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *         description: ID do modelo de e-mail
     *     responses:
     *       200:
     *         description: Dados do modelo de e-mail
     *       401:
     *         description: Não autenticado
     *       404:
     *         description: Modelo de e-mail não encontrado
     */
    this.get('/:id', 'show', { auth: true, permissions: ['admin', 'manager', 'user'] });

    /**
     * @swagger
     * /email-templates:
     *   post:
     *     summary: Cria um novo modelo de e-mail
     *     tags: [Email Templates]
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
     *         description: Modelo de e-mail criado com sucesso
     *       400:
     *         description: Dados inválidos
     *       401:
     *         description: Não autenticado
     */
    this.post('/', 'store', { auth: true, permissions: ['admin', 'manager', 'user'], validationSchema: createEmailTemplateSchema });

    /**
     * @swagger
     * /email-templates/{id}:
     *   put:
     *     summary: Atualiza um modelo de e-mail existente
     *     tags: [Email Templates]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *         description: ID do modelo de e-mail
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/EmailTemplateUpdate'
     *     responses:
     *       200:
     *         description: Modelo de e-mail atualizado com sucesso
     *       400:
     *         description: Dados inválidos
     *       401:
     *         description: Não autenticado
     *       404:
     *         description: Modelo de e-mail não encontrado
     */
    this.put('/:id', 'update', { auth: true, permissions: ['admin', 'manager', 'user'], validationSchema: updateEmailTemplateSchema });

    /**
     * @swagger
     * /email-templates/{id}:
     *   delete:
     *     summary: Remove um modelo de e-mail
     *     tags: [Email Templates]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *         description: ID do modelo de e-mail
     *     responses:
     *       204:
     *         description: Modelo de e-mail removido com sucesso
     *       401:
     *         description: Não autenticado
     *       404:
     *         description: Modelo de e-mail não encontrado
     */
    this.delete('/:id', 'destroy', { auth: true, permissions: ['admin', 'manager', 'user'] });
  }
}

export default new EmailTemplateRoutes().router;