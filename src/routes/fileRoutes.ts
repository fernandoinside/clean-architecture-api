import FileController from '../controllers/FileController';
import { createFileSchema, updateFileSchema } from '../schemas/fileSchemas';
import BaseRouter from './BaseRouter';

/**
 * @swagger
 * tags:
 *   name: Files
 *   description: Gestão de arquivos
 */

class FileRoutes extends BaseRouter<FileController> {
  constructor() {
    super(new FileController());
    this.setupRoutes();
  }

  private setupRoutes() {
    /**
     * @swagger
     * /files:
     *   get:
     *     summary: Lista todos os arquivos
     *     tags: [Files]
     *     security:
     *       - bearerAuth: []
     *     responses:
     *       200:
     *         description: Lista de arquivos
     *       401:
     *         description: Não autenticado
     */
    this.get('/', 'index', { auth: true, permissions: ['admin', 'manager', 'user'] });

    /**
     * @swagger
     * /files/{id}:
     *   get:
     *     summary: Obtém um arquivo pelo ID
     *     tags: [Files]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *         description: ID do arquivo
     *     responses:
     *       200:
     *         description: Dados do arquivo
     *       401:
     *         description: Não autenticado
     *       404:
     *         description: Arquivo não encontrado
     */
    this.get('/:id', 'show', { auth: true, permissions: ['admin', 'manager', 'user'] });

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
     *         description: Arquivo criado com sucesso
     *       400:
     *         description: Dados inválidos
     *       401:
     *         description: Não autenticado
     */
    this.post('/', 'store', { auth: true, permissions: ['admin', 'manager', 'user'], validationSchema: createFileSchema });

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
     *         required: true
     *         schema:
     *           type: string
     *         description: ID do arquivo
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/FileUpdate'
     *     responses:
     *       200:
     *         description: Arquivo atualizado com sucesso
     *       400:
     *         description: Dados inválidos
     *       401:
     *         description: Não autenticado
     *       404:
     *         description: Arquivo não encontrado
     */
    this.put('/:id', 'update', { auth: true, permissions: ['admin', 'manager', 'user'], validationSchema: updateFileSchema });

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
     *         required: true
     *         schema:
     *           type: string
     *         description: ID do arquivo
     *     responses:
     *       204:
     *         description: Arquivo removido com sucesso
     *       401:
     *         description: Não autenticado
     *       404:
     *         description: Arquivo não encontrado
     */
    this.delete('/:id', 'destroy', { auth: true, permissions: ['admin', 'manager', 'user'] });
  }
}

export default new FileRoutes().router;