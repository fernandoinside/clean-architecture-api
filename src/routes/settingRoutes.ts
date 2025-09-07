import BaseRouter from './BaseRouter';
import SettingController from '../controllers/SettingController';
import { createSettingSchema, updateSettingSchema } from '../schemas/settingSchemas';

/**
 * @swagger
 * tags:
 *   name: Settings
 *   description: Gestão de configurações do sistema
 */

class SettingRoutes extends BaseRouter<SettingController> {
  constructor() {
    super(new SettingController());
    this.setupRoutes();
  }

  private setupRoutes() {
    /**
     * @swagger
     * /settings:
     *   get:
     *     summary: Lista todas as configurações
     *     tags: [Settings]
     *     security:
     *       - bearerAuth: []
     *     responses:
     *       200:
     *         description: Lista de configurações
     *       401:
     *         description: Não autenticado
     */
    this.get('/', 'index', { auth: true, permissions: ['admin', 'manager'], requiredPermissions: ['settings_read'] });

    /**
     * @swagger
     * /settings/{id}:
     *   get:
     *     summary: Obtém uma configuração pelo ID
     *     tags: [Settings]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *         description: ID da configuração
     *     responses:
     *       200:
     *         description: Dados da configuração
     *       401:
     *         description: Não autenticado
     *       404:
     *         description: Configuração não encontrada
     */
    this.get('/:id', 'show', { auth: true, permissions: ['admin', 'manager', 'user'], requiredPermissions: ['settings_read'] });

    /**
     * @swagger
     * /settings:
     *   post:
     *     summary: Cria uma nova configuração
     *     tags: [Settings]
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/SettingCreate'
     *     responses:
     *       201:
     *         description: Configuração criada com sucesso
     *       400:
     *         description: Dados inválidos
     *       401:
     *         description: Não autenticado
     */
    this.post('/', 'store', { auth: true, permissions: ['admin', 'manager', 'user'], requiredPermissions: ['settings_create'], validationSchema: createSettingSchema });

    /**
     * @swagger
     * /settings/{id}:
     *   put:
     *     summary: Atualiza uma configuração existente
     *     tags: [Settings]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *         description: ID da configuração
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/SettingUpdate'
     *     responses:
     *       200:
     *         description: Configuração atualizada com sucesso
     *       400:
     *         description: Dados inválidos
     *       401:
     *         description: Não autenticado
     *       404:
     *         description: Configuração não encontrada
     */
    this.put('/:id', 'update', { auth: true, permissions: ['admin', 'manager', 'user'], requiredPermissions: ['settings_update'], validationSchema: updateSettingSchema });

    /**
     * @swagger
     * /settings/{id}:
     *   delete:
     *     summary: Remove uma configuração
     *     tags: [Settings]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *         description: ID da configuração
     *     responses:
     *       204:
     *         description: Configuração removida com sucesso
     *       401:
     *         description: Não autenticado
     *       404:
     *         description: Configuração não encontrada
     */
    this.delete('/:id', 'destroy', { auth: true, permissions: ['admin', 'manager', 'user'], requiredPermissions: ['settings_delete'] });
  }
}

export default new SettingRoutes().router;