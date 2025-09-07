import File, { IFile } from '../models/File';
import BaseService from './BaseService';
import { ValidationError, NotFoundError, DatabaseError } from '../utils/errors';

class FileService extends BaseService<IFile> {
  constructor() {
    super(File); // Removed 'as any'
  }

  /**
   * Cria um novo arquivo com validações adicionais
   * @param data Dados do arquivo
   * @returns Arquivo criado
   */
  async create(data: Omit<IFile, 'id' | 'created_at' | 'updated_at' | 'deleted_at'>): Promise<IFile> {
    if (!data || !data.fileName || !data.filePath || !data.mimeType || data.fileSize === undefined) {
      throw new ValidationError('Nome, caminho, tipo e tamanho do arquivo são obrigatórios');
    }

    try {
      const result = await super.create(data);
      if (!result) { // Added check for undefined result
        throw new DatabaseError('Falha ao criar arquivo');
      }
      await this.invalidateCache();
      return result;
    } catch (error) {
      if (error instanceof ValidationError) throw error;
      throw new DatabaseError('Erro ao criar arquivo', error as Error);
    }
  }

  /**
   * Atualiza um arquivo existente
   * @param id ID do arquivo
   * @param data Dados para atualização
   * @returns Arquivo atualizado
   */
  async update(id: number, data: Partial<Omit<IFile, 'id' | 'created_at' | 'updated_at' | 'deleted_at'>>): Promise<IFile> {
    if (!id) {
      throw new ValidationError('ID do arquivo não fornecido');
    }

    try {
      const result = await super.update(id, data);
      if (!result) { // Added check for undefined result
        throw new DatabaseError('Falha ao atualizar arquivo');
      }
      await this.invalidateCache();
      return result;
    } catch (error) {
      if (error instanceof ValidationError || error instanceof NotFoundError) throw error;
      throw new DatabaseError('Erro ao atualizar arquivo', error as Error);
    }
  }

  /**
   * Busca um arquivo pelo ID
   * @param id ID do arquivo
   * @returns Arquivo encontrado
   */
  async findById(id: number): Promise<IFile> { // Changed id type to number
    try {
      const result = await super.findById(id);
      if (!result) {
        throw new NotFoundError('Arquivo não encontrado');
      }
      return result;
    } catch (error) {
      if (error instanceof NotFoundError) throw error;
      throw new DatabaseError('Erro ao buscar arquivo', error as Error);
    }
  }

  /**
   * Remove um arquivo (soft delete)
   * @param id ID do arquivo
   * @returns true se o arquivo foi removido com sucesso
   */
  async delete(id: number): Promise<boolean> { // Changed id type to number
    try {
      const result = await super.delete(id);
      if (result) {
        await this.invalidateCache();
        return true;
      }
      return false;
    } catch (error) {
      throw new DatabaseError('Erro ao remover arquivo', error as Error);
    }
  }

  /**
   * Busca arquivos com filtros e paginação
   * @param filters Filtros de busca
   * @param page Número da página (começa em 1)
   * @param limit Itens por página
   * @returns Lista paginada de arquivos
   */
  async search(filters: { userId?: number; fileName?: string; mimeType?: string; entityType?: string; entityId?: number }, page = 1, limit = 10) { // Changed userId and entityId to number
    try {
      const { userId, fileName, mimeType, entityType, entityId } = filters;
      const query = this.model.db(this.model.tableName).whereNull('deleted_at');

      if (userId) {
        query.where('userId', userId);
      }
      if (fileName) {
        query.where('fileName', 'ilike', `%${fileName}%`);
      }
      if (mimeType) {
        query.where('mimeType', 'ilike', `%${mimeType}%`);
      }
      if (entityType) {
        query.where('entityType', entityType);
      }
      if (entityId) {
        query.where('entityId', entityId);
      }

      const offset = (page - 1) * limit;

      // Clonar a query para contar o total sem afetar a paginação
      const countQuery = query.clone().clearSelect().count('* as count').first();
      const dataQuery = query
        .clone()
        .select('*')
        .offset(offset)
        .limit(limit)
        .orderBy('createdAt', 'desc'); // Assuming 'createdAt' is the correct field for ordering

      const [data, total] = await Promise.all([dataQuery, countQuery]);
      const totalCount = Number(total?.count) || 0;

      return {
        data,
        pagination: {
          total: totalCount,
          page,
          limit,
          totalPages: Math.ceil(totalCount / limit)
        }
      };
    } catch (error) {
      throw new DatabaseError('Erro ao buscar arquivos', error as Error);
    }
  }
}

// Exporta a classe diretamente para permitir a criação de novas instâncias
export { FileService };

// Exporta uma instância padrão para uso comum
const fileServiceInstance = new FileService();
export default fileServiceInstance;