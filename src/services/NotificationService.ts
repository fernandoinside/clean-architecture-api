import Notification, { INotification } from '../models/Notification';
import BaseService from './BaseService';
import { ValidationError, NotFoundError, DatabaseError } from '../utils/errors';

class NotificationService extends BaseService<INotification> {
  constructor() {
    super(Notification);
  }

  /**
   * Cria uma nova notificação com validações adicionais
   * @param data Dados da notificação
   * @returns Notificação criada
   */
  async create(data: Omit<INotification, 'id' | 'created_at' | 'updated_at' | 'deleted_at'>): Promise<INotification> {
    if (!data || !data.user_id || !data.title || !data.message) {
      throw new ValidationError('ID do usuário, título e mensagem da notificação são obrigatórios');
    }

    try {
      const result = await super.create(data);
      if (!result) {
        throw new DatabaseError('Falha ao criar notificação');
      }
      await this.invalidateCache();
      return result;
    } catch (error) {
      if (error instanceof ValidationError) throw error;
      throw new DatabaseError('Erro ao criar notificação', error as Error);
    }
  }

  /**
   * Atualiza uma notificação existente
   * @param id ID da notificação
   * @param data Dados para atualização
   * @returns Notificação atualizada
   */
  async update(id: number, data: Partial<Omit<INotification, 'id' | 'created_at' | 'updated_at' | 'deleted_at'>>): Promise<INotification> {
    if (!id) {
      throw new ValidationError('ID da notificação não fornecido');
    }

    try {
      const result = await super.update(id, data);
      if (!result) {
        throw new DatabaseError('Falha ao atualizar notificação');
      }
      await this.invalidateCache();
      return result;
    } catch (error) {
      if (error instanceof ValidationError || error instanceof NotFoundError) throw error;
      throw new DatabaseError('Erro ao atualizar notificação', error as Error);
    }
  }

  /**
   * Busca uma notificação pelo ID
   * @param id ID da notificação
   * @returns Notificação encontrada
   */
  async findById(id: number): Promise<INotification> {
    try {
      const result = await super.findById(id);
      if (!result) {
        throw new NotFoundError('Notificação não encontrada');
      }
      return result;
    } catch (error) {
      if (error instanceof NotFoundError) throw error;
      throw new DatabaseError('Erro ao buscar notificação', error as Error);
    }
  }

  /**
   * Remove uma notificação (soft delete)
   * @param id ID da notificação
   * @returns true se a notificação foi removida com sucesso
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
      throw new DatabaseError('Erro ao remover notificação', error as Error);
    }
  }

  /**
   * Busca notificações com filtros e paginação
   * @param filters Filtros de busca
   * @param page Número da página (começa em 1)
   * @param limit Itens por página
   * @returns Lista paginada de notificações
   */
  async search(filters: { user_id?: number; title?: string; type?: string; is_read?: boolean }, page = 1, limit = 10) {
    try {
      const { user_id, title, type, is_read } = filters;
      const query = this.model.db(this.model.tableName).whereNull('deleted_at');

      if (user_id) {
        query.where('user_id', user_id);
      }
      if (title) {
        query.where('title', 'ilike', `%${title}%`);
      }
      if (type) {
        query.where('type', type);
      }
      if (typeof is_read === 'boolean') {
        query.where('is_read', is_read);
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
      throw new DatabaseError('Erro ao buscar notificações', error as Error);
    }
  }
}

// Exporta a classe diretamente para permitir a criação de novas instâncias
export { NotificationService };

// Exporta uma instância padrão para uso comum
const notificationServiceInstance = new NotificationService();
export default notificationServiceInstance;