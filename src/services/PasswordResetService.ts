import PasswordReset, { IPasswordReset } from '../models/PasswordReset';
import BaseService from './BaseService';
import { ValidationError, NotFoundError, DatabaseError } from '../utils/errors';

class PasswordResetService extends BaseService<IPasswordReset> {
  constructor() {
    super(PasswordReset);
  }

  /**
   * Cria um novo pedido de redefinição de senha com validações adicionais
   * @param data Dados do pedido de redefinição de senha
   * @returns Pedido de redefinição de senha criado
   */
  async create(data: Omit<IPasswordReset, 'id' | 'created_at' | 'updated_at' | 'deleted_at'>): Promise<IPasswordReset> {
    if (!data || !data.user_id || !data.token || !data.expires_at) {
      throw new ValidationError('ID do usuário, token e data de expiração são obrigatórios');
    }

    try {
      const result = await super.create(data);
      if (!result) {
        throw new DatabaseError('Falha ao criar pedido de redefinição de senha');
      }
      await this.invalidateCache();
      return result;
    } catch (error) {
      if (error instanceof ValidationError) throw error;
      throw new DatabaseError('Erro ao criar pedido de redefinição de senha', error as Error);
    }
  }

  /**
   * Atualiza um pedido de redefinição de senha existente
   * @param id ID do pedido de redefinição de senha
   * @param data Dados para atualização
   * @returns Pedido de redefinição de senha atualizado
   */
  async update(id: number, data: Partial<Omit<IPasswordReset, 'id' | 'created_at' | 'updated_at' | 'deleted_at'>>): Promise<IPasswordReset> {
    if (!id) {
      throw new ValidationError('ID do pedido de redefinição de senha não fornecido');
    }

    try {
      const result = await super.update(id, data);
      if (!result) {
        throw new DatabaseError('Falha ao atualizar pedido de redefinição de senha');
      }
      await this.invalidateCache();
      return result;
    } catch (error) {
      if (error instanceof ValidationError || error instanceof NotFoundError) throw error;
      throw new DatabaseError('Erro ao atualizar pedido de redefinição de senha', error as Error);
    }
  }

  /**
   * Busca um pedido de redefinição de senha pelo ID
   * @param id ID do pedido de redefinição de senha
   * @returns Pedido de redefinição de senha encontrado
   */
  async findById(id: number): Promise<IPasswordReset> {
    try {
      const result = await super.findById(id);
      if (!result) {
        throw new NotFoundError('Pedido de redefinição de senha não encontrado');
      }
      return result;
    } catch (error) {
      if (error instanceof NotFoundError) throw error;
      throw new DatabaseError('Erro ao buscar pedido de redefinição de senha', error as Error);
    }
  }

  /**
   * Remove um pedido de redefinição de senha (soft delete)
   * @param id ID do pedido de redefinição de senha
   * @returns true se o pedido de redefinição de senha foi removido com sucesso
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
      throw new DatabaseError('Erro ao remover pedido de redefinição de senha', error as Error);
    }
  }

  /**
   * Busca pedidos de redefinição de senha com filtros e paginação
   * @param filters Filtros de busca
   * @param page Número da página (começa em 1)
   * @param limit Itens por página
   * @returns Lista paginada de pedidos de redefinição de senha
   */
  async search(filters: { userId?: number; token?: string; used?: boolean }, page = 1, limit = 10) {
    try {
      const { userId, token, used } = filters;
      const query = this.model.db(this.model.tableName).whereNull('deleted_at');

      if (userId) {
        query.where('userId', userId);
      }
      if (token) {
        query.where('token', token);
      }
      if (typeof used === 'boolean') {
        query.where('used', used);
      }

      const offset = (page - 1) * limit;

      // Clonar a query para contar o total sem afetar a paginação
      const countQuery = query.clone().clearSelect().count('* as count').first();
      const dataQuery = query
        .clone()
        .select('*')
        .offset(offset)
        .limit(limit)
        .orderBy('created_at', 'desc');

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
      throw new DatabaseError('Erro ao buscar pedidos de redefinição de senha', error as Error);
    }
  }
}

// Exporta a classe diretamente para permitir a criação de novas instâncias
export { PasswordResetService };

// Exporta uma instância padrão para uso comum
const passwordResetServiceInstance = new PasswordResetService();
export default passwordResetServiceInstance;