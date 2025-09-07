import BaseRouter from './BaseRouter';
import PermissionController from '../controllers/PermissionController';
import { createPermissionSchema, updatePermissionSchema } from '../schemas/permissionSchemas';

/**
 * @swagger
 * tags:
 *   name: Permissions
 *   description: Gestão de permissões
 */

class PermissionRoutes extends BaseRouter<PermissionController> {
  constructor() {
    super(new PermissionController());
    this.setupRoutes();
  }

  private setupRoutes() {
    /**
     * @swagger
     * /permissions:
     *   get:
     *     summary: Lista todas as permissões
     *     tags: [Permissions]
     *     security:
     *       - bearerAuth: []
     *     responses:
     *       200:
     *         description: Lista de permissões
     *       401:
     *         description: Não autenticado
     */
    this.get('/', 'index', { auth: true, permissions: ['admin', 'manager', 'user'] });

    /**
     * @swagger
     * /permissions/{id}:
     *   get:
     *     summary: Obtém uma permissão pelo ID
     *     tags: [Permissions]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *         description: ID da permissão
     *     responses:
     *       200:
     *         description: Dados da permissão
     *       401:
     *         description: Não autenticado
     *       404:
     *         description: Permissão não encontrada
     */
    this.get('/:id', 'show', { auth: true, permissions: ['admin', 'manager', 'user'] });

    /**
     * @swagger
     * /permissions:
     *   post:
     *     summary: Cria uma nova permissão
     *     tags: [Permissions]
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/PermissionCreate'
     *     responses:
     *       201:
     *         description: Permissão criada com sucesso
     *       400:
     *         description: Dados inválidos
     *       401:
     *         description: Não autenticado
     */
    this.post('/', 'store', { auth: true, permissions: ['admin', 'manager', 'user'], validationSchema: createPermissionSchema });

    /**
     * @swagger
     * /permissions/{id}:
     *   put:
     *     summary: Atualiza uma permissão existente
     *     tags: [Permissions]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *         description: ID da permissão
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/PermissionUpdate'
     *     responses:
     *       200:
     *         description: Permissão atualizada com sucesso
     *       400:
     *         description: Dados inválidos
     *       401:
     *         description: Não autenticado
     *       404:
     *         description: Permissão não encontrada
     */
    this.put('/:id', 'update', { auth: true, permissions: ['admin', 'manager', 'user'], validationSchema: updatePermissionSchema });

    /**
     * @swagger
     * /permissions/{id}:
     *   delete:
     *     summary: Remove uma permissão
     *     tags: [Permissions]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *         description: ID da permissão
     *     responses:
     *       204:
     *         description: Permissão removida com sucesso
     *       401:
     *         description: Não autenticado
     *       404:
     *         description: Permissão não encontrada
     */
    this.delete('/:id', 'destroy', { auth: true, permissions: ['admin', 'manager', 'user'] });
  }
}

export default new PermissionRoutes().router;