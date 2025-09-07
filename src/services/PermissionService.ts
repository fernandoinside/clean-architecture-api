import { Permission, IPermission } from '../models/Permission';
import BaseService from './BaseService';
import { ValidationError, NotFoundError, DatabaseError } from '../utils/errors';

class PermissionService extends BaseService<IPermission> {
  constructor() {
    super(new Permission());
  }

  /**
   * Cria uma nova permissão com validações adicionais
   * @param data Dados da permissão
   * @returns Permissão criada
   */
  async create(data: Omit<IPermission, 'id' | 'created_at' | 'updated_at' | 'deleted_at'>): Promise<IPermission> {
    if (!data || !data.name || !data.resource || !data.action) {
      throw new ValidationError('Nome, recurso e ação da permissão são obrigatórios');
    }

    try {
      const existing = await this.model.db(this.model.tableName).where({ name: data.name }).first();
      if (existing) {
        throw new ValidationError('Uma permissão com este nome já existe');
      }

      const result = await super.create(data);
      if (!result) {
        throw new DatabaseError('Falha ao criar permissão');
      }
      await this.invalidateCache();
      return result;
    } catch (error) {
      if (error instanceof ValidationError) throw error;
      throw new DatabaseError('Erro ao criar permissão', error as Error);
    }
  }

  /**
   * Atualiza uma permissão existente
   * @param id ID da permissão
   * @param data Dados para atualização
   * @returns Permissão atualizada
   */
  async update(id: number, data: Partial<Omit<IPermission, 'id' | 'created_at' | 'updated_at' | 'deleted_at'>>): Promise<IPermission> {
    if (!id) {
      throw new ValidationError('ID da permissão não fornecido');
    }

    try {
      if (data.name) {
        const existing = await this.model.db(this.model.tableName).where({ name: data.name }).whereNot('id', id).first();
        if (existing) {
          throw new ValidationError('Uma permissão com este nome já existe');
        }
      }

      const result = await super.update(id, data);
      if (!result) {
        throw new DatabaseError('Falha ao atualizar permissão');
      }
      await this.invalidateCache();
      return result;
    } catch (error) {
      if (error instanceof ValidationError || error instanceof NotFoundError) throw error;
      throw new DatabaseError('Erro ao atualizar permissão', error as Error);
    }
  }

  /**
   * Busca uma permissão pelo ID
   * @param id ID da permissão
   * @returns Permissão encontrada
   */
  async findById(id: number): Promise<IPermission> {
    try {
      const result = await super.findById(id);
      if (!result) {
        throw new NotFoundError('Permissão não encontrada');
      }
      return result;
    } catch (error) {
      if (error instanceof NotFoundError) throw error;
      throw new DatabaseError('Erro ao buscar permissão', error as Error);
    }
  }

  /**
   * Remove uma permissão (soft delete)
   * @param id ID da permissão
   * @returns true se a permissão foi removida com sucesso
   */
  async delete(id: number): Promise<boolean> {
    try {
      const result = await super.delete(id);
      if (result) {
        await this.invalidateCache();
        return true;
      }
      return false;
    } catch (error) {
      throw new DatabaseError('Erro ao remover permissão', error as Error);
    }
  }

  /**
   * Busca permissões com filtros e paginação
   * @param filters Filtros de busca
   * @param page Número da página (começa em 1)
   * @param limit Itens por página
   * @returns Lista paginada de permissões
   */
  async search(
    filters: {
      name?: string;
      resource?: string;
      action?: string;
    } = {},
    page: number = 1,
    limit: number = 10
  ) {
    try {
      const { name, resource, action } = filters;
      const query = this.model.db(this.model.tableName).whereNull('deleted_at');

      if (name) {
        query.where('name', 'ilike', `%${name}%`);
      }
      if (resource) {
        query.where('resource', 'ilike', `%${resource}%`);
      }
      if (action) {
        query.where('action', 'ilike', `%${action}%`);
      }

      const offset = (page - 1) * limit;
      
      // Clonar a query para contar o total sem afetar a paginação
      const countQuery = query.clone().clearSelect().count('* as count').first();
      const dataQuery = query
        .clone()
        .select('*')
        .offset(offset)
        .limit(limit)
        .orderBy('name', 'asc');

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
      throw new DatabaseError('Erro ao buscar permissões', error as Error);
    }
  }
}

// Exporta a classe diretamente para permitir a criação de novas instâncias
export { PermissionService };

// Exporta uma instância padrão para uso comum
const permissionServiceInstance = new PermissionService();
export default permissionServiceInstance;