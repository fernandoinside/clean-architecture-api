import PasswordResetController from '../controllers/PasswordResetController';
import { createPasswordResetSchema, updatePasswordResetSchema } from '../schemas/passwordResetSchemas';
import BaseRouter from './BaseRouter';

/**
 * @swagger
 * tags:
 *   name: PasswordResets
 *   description: Gerenciamento de redefinição de senhas
 */

class PasswordResetRoutes extends BaseRouter<PasswordResetController> {
  constructor() {
    super(new PasswordResetController());
    this.setupRoutes();
  }

  private setupRoutes() {
    /**
     * @swagger
     * /password-resets:
     *   get:
     *     summary: Lista todas as redefinições de senha
     *     tags: [Password Resets]
     *     security:
     *       - bearerAuth: []
     *     responses:
     *       200:
     *         description: Lista de redefinições de senha
     *       401:
     *         description: Não autenticado
     */
    this.get('/', 'index', { auth: true, permissions: ['admin', 'manager', 'user'] });

    /**
     * @swagger
     * /password-resets/{id}:
     *   get:
     *     summary: Obtém uma redefinição de senha pelo ID
     *     tags: [Password Resets]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *         description: ID da redefinição de senha
     *     responses:
     *       200:
     *         description: Dados da redefinição de senha
     *       401:
     *         description: Não autenticado
     *       404:
     *         description: Redefinição de senha não encontrada
     */
    this.get('/:id', 'show', { auth: true, permissions: ['admin', 'manager', 'user'] });

    /**
     * @swagger
     * /password-resets:
     *   post:
     *     summary: Cria uma nova redefinição de senha
     *     tags: [Password Resets]
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/PasswordResetCreate'
     *     responses:
     *       201:
     *         description: Redefinição de senha criada com sucesso
     *       400:
     *         description: Dados inválidos
     *       401:
     *         description: Não autenticado
     */
    this.post('/', 'store', { auth: true, permissions: ['admin', 'manager', 'user'], validationSchema: createPasswordResetSchema });

    /**
     * @swagger
     * /password-resets/{id}:
     *   put:
     *     summary: Atualiza uma redefinição de senha existente
     *     tags: [Password Resets]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *         description: ID da redefinição de senha
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/PasswordResetUpdate'
     *     responses:
     *       200:
     *         description: Redefinição de senha atualizada com sucesso
     *       400:
     *         description: Dados inválidos
     *       401:
     *         description: Não autenticado
     *       404:
     *         description: Redefinição de senha não encontrada
     */
    this.put('/:id', 'update', { auth: true, permissions: ['admin', 'manager', 'user'], validationSchema: updatePasswordResetSchema });

    /**
     * @swagger
     * /password-resets/{id}:
     *   delete:
     *     summary: Remove uma redefinição de senha
     *     tags: [Password Resets]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *         description: ID da redefinição de senha
     *     responses:
     *       204:
     *         description: Redefinição de senha removida com sucesso
     *       401:
     *         description: Não autenticado
     *       404:
     *         description: Redefinição de senha não encontrada
     */
    this.delete('/:id', 'destroy', { auth: true, permissions: ['admin', 'manager', 'user'] });
  }
}

export default new PasswordResetRoutes().router;