import BaseRouter from './BaseRouter';
import PlanController from '../controllers/PlanController';
import { createPlanSchema, updatePlanSchema } from '../schemas/planSchemas';

/**
 * @swagger
 * tags:
 *   name: Plans
 *   description: Gestão de planos
 */

class PlanRoutes extends BaseRouter<PlanController> {
  constructor() {
    super(new PlanController());
    this.setupRoutes();
  }

  private setupRoutes() {
    /**
     * @swagger
     * /plans:
     *   get:
     *     summary: Lista todos os planos
     *     tags: [Plans]
     *     security:
     *       - bearerAuth: []
     *     responses:
     *       200:
     *         description: Lista de planos
     *       401:
     *         description: Não autenticado
     */
    this.get('/', 'index', { auth: true, permissions: ['admin', 'manager', 'user'] });

    /**
     * @swagger
     * /plans/{id}:
     *   get:
     *     summary: Obtém um plano pelo ID
     *     tags: [Plans]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *         description: ID do plano
     *     responses:
     *       200:
     *         description: Dados do plano
     *       401:
     *         description: Não autenticado
     *       404:
     *         description: Plano não encontrado
     */
    this.get('/:id', 'show', { auth: true, permissions: ['admin', 'manager', 'user'] });

    /**
     * @swagger
     * /plans:
     *   post:
     *     summary: Cria um novo plano
     *     tags: [Plans]
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/PlanCreate'
     *     responses:
     *       201:
     *         description: Plano criado com sucesso
     *       400:
     *         description: Dados inválidos
     *       401:
     *         description: Não autenticado
     */
    this.post('/', 'store', { auth: true, permissions: ['admin', 'manager', 'user'], validationSchema: createPlanSchema });

    /**
     * @swagger
     * /plans/{id}:
     *   put:
     *     summary: Atualiza um plano existente
     *     tags: [Plans]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *         description: ID do plano
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/PlanUpdate'
     *     responses:
     *       200:
     *         description: Plano atualizado com sucesso
     *       400:
     *         description: Dados inválidos
     *       401:
     *         description: Não autenticado
     *       404:
     *         description: Plano não encontrado
     */
    this.put('/:id', 'update', { auth: true, permissions: ['admin', 'manager', 'user'], validationSchema: updatePlanSchema });

    /**
     * @swagger
     * /plans/{id}:
     *   delete:
     *     summary: Remove um plano
     *     tags: [Plans]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *         description: ID do plano
     *     responses:
     *       204:
     *         description: Plano removido com sucesso
     *       401:
     *         description: Não autenticado
     *       404:
     *         description: Plano não encontrado
     */
    this.delete('/:id', 'destroy', { auth: true, permissions: ['admin', 'manager', 'user'] });
  }
}

export default new PlanRoutes().router;