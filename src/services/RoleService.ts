import Role, { IRole } from '../models/Role';
import BaseService from './BaseService';
import { ValidationError, NotFoundError, DatabaseError } from '../utils/errors';

class RoleService extends BaseService<IRole> {
  constructor() {
    super(Role);
  }

  /**
   * Cria um novo papel com validações adicionais
   * @param data Dados do papel
   * @returns Papel criado
   */
  async create(data: Omit<IRole, 'id' | 'created_at' | 'updated_at' | 'deleted_at'>): Promise<IRole> {
    if (!data || !data.name) {
      throw new ValidationError('Nome do papel é obrigatório');
    }

    try {
      const existing = await this.model.db(this.model.tableName).where({ name: data.name }).first();
      if (existing) {
        throw new ValidationError('Um papel com este nome já existe');
      }

      const result = await super.create(data);
      if (!result) {
        throw new DatabaseError('Falha ao criar papel');
      }
      await this.invalidateCache();
      return result;
    } catch (error) {
      if (error instanceof ValidationError) throw error;
      throw new DatabaseError('Erro ao criar papel', error as Error);
    }
  }

  /**
   * Atualiza um papel existente
   * @param id ID do papel
   * @param data Dados para atualização
   * @returns Papel atualizado
   */
  async update(id: number, data: Partial<Omit<IRole, 'id' | 'created_at' | 'updated_at' | 'deleted_at'>>): Promise<IRole> {
    if (!id) {
      throw new ValidationError('ID do papel não fornecido');
    }

    try {
      if (data.name) {
        const existing = await this.model.db(this.model.tableName).where({ name: data.name }).whereNot('id', id).first();
        if (existing) {
          throw new ValidationError('Um papel com este nome já existe');
        }
      }

      const result = await super.update(id, data);
      if (!result) {
        throw new DatabaseError('Falha ao atualizar papel');
      }
      await this.invalidateCache();
      return result;
    } catch (error) {
      if (error instanceof ValidationError || error instanceof NotFoundError) throw error;
      throw new DatabaseError('Erro ao atualizar papel', error as Error);
    }
  }

  /**
   * Busca um papel pelo ID
   * @param id ID do papel
   * @returns Papel encontrado
   */
  async findById(id: number): Promise<IRole> {
    try {
      const result = await super.findById(id);
      if (!result) {
        throw new NotFoundError('Papel não encontrado');
      }
      return result;
    } catch (error) {
      if (error instanceof NotFoundError) throw error;
      throw new DatabaseError('Erro ao buscar papel', error as Error);
    }
  }

  /**
   * Remove um papel (soft delete)
   * @param id ID do papel
   * @returns true se o papel foi removido com sucesso
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
      throw new DatabaseError('Erro ao remover papel', error as Error);
    }
  }

  /**
   * Busca papéis com filtros e paginação
   * @param filters Filtros de busca
   * @param page Número da página (começa em 1)
   * @param limit Itens por página
   * @returns Lista paginada de papéis
   */
  async search(filters: { name?: string; description?: string }, page = 1, limit = 10) {
    try {
      const { name, description } = filters;
      const query = this.model.db(this.model.tableName).whereNull('deleted_at');

      if (name) {
        query.where('name', 'ilike', `%${name}%`);
      }
      if (description) {
        query.where('description', 'ilike', `%${description}%`);
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
      throw new DatabaseError('Erro ao buscar papéis', error as Error);
    }
  }
}

// Exporta a classe diretamente para permitir a criação de novas instâncias
export { RoleService };

// Exporta uma instância padrão para uso comum
const roleServiceInstance = new RoleService();
export default roleServiceInstance;