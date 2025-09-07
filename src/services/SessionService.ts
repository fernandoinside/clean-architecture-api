import Session, { ISession } from '../models/Session';
import BaseService from './BaseService';
import { ValidationError, NotFoundError, DatabaseError } from '../utils/errors';

class SessionService extends BaseService<ISession> {
  constructor() {
    super(Session);
  }

  /**
   * Cria uma nova sessão com validações adicionais
   * @param data Dados da sessão
   * @returns Sessão criada
   */
  async create(
    data: Omit<ISession, 'id' | 'created_at' | 'updated_at' | 'deleted_at'>
  ): Promise<ISession> {
    if (!data || !data.user_id || !data.token || !data.last_activity) {
      throw new ValidationError(
        'ID do usuário, token e última atividade da sessão são obrigatórios'
      );
    }

    try {
      const result = await super.create(data);
      if (!result) {
        throw new DatabaseError('Falha ao criar sessão');
      }
      await this.invalidateCache();
      return result;
    } catch (error) {
      if (error instanceof ValidationError) throw error;
      throw new DatabaseError('Erro ao criar sessão', error as Error);
    }
  }

  /**
   * Atualiza uma sessão existente
   * @param id ID da sessão
   * @param data Dados para atualização
   * @returns Sessão atualizada
   */
  async update(
    id: number,
    data: Partial<
      Omit<ISession, 'id' | 'created_at' | 'updated_at' | 'deleted_at'>
    >
  ): Promise<ISession> {
    if (!id) {
      throw new ValidationError('ID da sessão não fornecido');
    }

    try {
      const result = await super.update(id, data);
      if (!result) {
        throw new DatabaseError('Falha ao atualizar sessão');
      }
      await this.invalidateCache();
      return result;
    } catch (error) {
      if (error instanceof ValidationError || error instanceof NotFoundError)
        throw error;
      throw new DatabaseError('Erro ao atualizar sessão', error as Error);
    }
  }

  /**
   * Busca uma sessão pelo ID
   * @param id ID da sessão
   * @returns Sessão encontrada
   */
  async findById(id: number): Promise<ISession> {
    try {
      const result = await super.findById(id);
      if (!result) {
        throw new NotFoundError('Sessão não encontrada');
      }
      return result;
    } catch (error) {
      if (error instanceof NotFoundError) throw error;
      throw new DatabaseError('Erro ao buscar sessão', error as Error);
    }
  }

  /**
   * Remove uma sessão (soft delete)
   * @param id ID da sessão
   * @returns true se a sessão foi removida com sucesso
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
      throw new DatabaseError('Erro ao remover sessão', error as Error);
    }
  }

  /**
   * Busca sessão por token
   * @param token Token da sessão
   * @returns Sessão encontrada
   */
  async findByToken(token: string): Promise<ISession | null> {
    if (!token) {
      throw new ValidationError('Token é obrigatório');
    }

    try {
      const cacheKey = `sessions:token:${token}`;
      const cachedData = await this.getFromCache(cacheKey);

      if (cachedData) {
        return cachedData;
      }

      const result = await (this.model as any).findByToken(token);
      if (result) {
        await this.setInCache(cacheKey, result, 900); // Cache por 15 minutos
      }

      return result || null;
    } catch (error) {
      throw new DatabaseError(
        'Erro ao buscar sessão por token',
        error as Error
      );
    }
  }

  /**
   * Busca sessões por ID do usuário
   * @param userId ID do usuário
   * @returns Lista de sessões do usuário
   */
  async findByUserId(userId: number): Promise<ISession[]> {
    if (!userId) {
      throw new ValidationError('ID do usuário é obrigatório');
    }

    try {
      const cacheKey = `sessions:user:${userId}`;
      const cachedData = await this.getFromCache(cacheKey);

      if (cachedData) {
        return cachedData;
      }

      const result = await (this.model as any).findByUserId(userId);
      await this.setInCache(cacheKey, result, 1800); // Cache por 30 minutos

      return result;
    } catch (error) {
      throw new DatabaseError(
        'Erro ao buscar sessões do usuário',
        error as Error
      );
    }
  }

  /**
   * Busca todas as sessões ativas
   * @returns Lista de sessões ativas
   */
  async findActiveSessions(): Promise<ISession[]> {
    try {
      const cacheKey = 'sessions:active';
      const cachedData = await this.getFromCache(cacheKey);

      if (cachedData) {
        return cachedData;
      }

      const result = await (this.model as any).findActiveSessions();
      await this.setInCache(cacheKey, result, 300); // Cache por 5 minutos apenas

      return result;
    } catch (error) {
      throw new DatabaseError('Erro ao buscar sessões ativas', error as Error);
    }
  }

  /**
   * Busca sessões expiradas
   * @returns Lista de sessões expiradas
   */
  async findExpiredSessions(): Promise<ISession[]> {
    try {
      const cacheKey = 'sessions:expired';
      const cachedData = await this.getFromCache(cacheKey);

      if (cachedData) {
        return cachedData;
      }

      const result = await (this.model as any).findExpiredSessions();
      await this.setInCache(cacheKey, result, 300); // Cache por 5 minutos apenas

      return result;
    } catch (error) {
      throw new DatabaseError(
        'Erro ao buscar sessões expiradas',
        error as Error
      );
    }
  }

  /**
   * Busca sessão com dados do usuário
   * @param sessionId ID da sessão
   * @returns Sessão com dados do usuário
   */
  async getSessionWithUser(
    sessionId: number
  ): Promise<(ISession & { user?: any }) | null> {
    if (!sessionId) {
      throw new ValidationError('ID da sessão é obrigatório');
    }

    try {
      const cacheKey = `sessions:with-user:${sessionId}`;
      const cachedData = await this.getFromCache(cacheKey);

      if (cachedData) {
        return cachedData;
      }

      const result = await (this.model as any).getSessionWithUser(sessionId);
      if (result) {
        await this.setInCache(cacheKey, result, 1800); // Cache por 30 minutos
      }

      return result || null;
    } catch (error) {
      throw new DatabaseError(
        'Erro ao buscar sessão com usuário',
        error as Error
      );
    }
  }

  /**
   * Busca sessão por token e atualiza última atividade
   * @param token Token da sessão
   * @returns Sessão atualizada
   */
  async findByTokenAndUpdate(token: string): Promise<ISession | null> {
    if (!token) {
      throw new ValidationError('Token é obrigatório');
    }

    try {
      const result = await (this.model as any).findByTokenAndUpdate(token);
      if (result) {
        await this.invalidateCache();
      }

      return result || null;
    } catch (error) {
      throw new DatabaseError(
        'Erro ao buscar e atualizar sessão',
        error as Error
      );
    }
  }

  /**
   * Atualiza última atividade da sessão
   * @param sessionId ID da sessão
   * @returns true se atualizada com sucesso
   */
  async updateLastActivity(sessionId: number): Promise<boolean> {
    if (!sessionId) {
      throw new ValidationError('ID da sessão é obrigatório');
    }

    try {
      const result = await (this.model as any).updateLastActivity(sessionId);
      if (result) {
        await this.invalidateCache();
      }
      return result;
    } catch (error) {
      throw new DatabaseError(
        'Erro ao atualizar última atividade',
        error as Error
      );
    }
  }

  /**
   * Invalida uma sessão
   * @param sessionId ID da sessão
   * @returns true se invalidada com sucesso
   */
  async invalidateSession(sessionId: number): Promise<boolean> {
    if (!sessionId) {
      throw new ValidationError('ID da sessão é obrigatório');
    }

    try {
      const result = await (this.model as any).invalidateSession(sessionId);
      if (result) {
        await this.invalidateCache();
      }
      return result;
    } catch (error) {
      throw new DatabaseError('Erro ao invalidar sessão', error as Error);
    }
  }

  /**
   * Invalida todas as sessões de um usuário
   * @param userId ID do usuário
   * @returns Número de sessões invalidadas
   */
  async invalidateAllUserSessions(userId: number): Promise<number> {
    if (!userId) {
      throw new ValidationError('ID do usuário é obrigatório');
    }

    try {
      const result = await (this.model as any).invalidateAllUserSessions(
        userId
      );
      if (result > 0) {
        await this.invalidateCache();
      }
      return result;
    } catch (error) {
      throw new DatabaseError(
        'Erro ao invalidar sessões do usuário',
        error as Error
      );
    }
  }

  /**
   * Limpa sessões expiradas
   * @returns Número de sessões limpas
   */
  async cleanupExpiredSessions(): Promise<number> {
    try {
      const result = await (this.model as any).cleanupExpiredSessions();
      if (result > 0) {
        await this.invalidateCache();
      }
      return result;
    } catch (error) {
      throw new DatabaseError(
        'Erro ao limpar sessões expiradas',
        error as Error
      );
    }
  }

  /**
   * Busca quantidade de sessões ativas de um usuário
   * @param userId ID do usuário
   * @returns Quantidade de sessões ativas
   */
  async getActiveSessionsCount(userId: number): Promise<number> {
    if (!userId) {
      throw new ValidationError('ID do usuário é obrigatório');
    }

    try {
      const cacheKey = `sessions:active-count:${userId}`;
      const cachedData = await this.getFromCache(cacheKey);

      if (cachedData !== null) {
        return cachedData;
      }

      const result = await (this.model as any).getActiveSessionsCount(userId);
      await this.setInCache(cacheKey, result, 600); // Cache por 10 minutos

      return result;
    } catch (error) {
      throw new DatabaseError('Erro ao contar sessões ativas', error as Error);
    }
  }

  /**
   * Busca estatísticas das sessões
   * @returns Estatísticas das sessões
   */
  async getSessionStats(): Promise<{
    total: number;
    active: number;
    expired: number;
  }> {
    try {
      const cacheKey = 'sessions:stats';
      const cachedData = await this.getFromCache(cacheKey);

      if (cachedData) {
        return cachedData;
      }

      const result = await (this.model as any).getSessionStats();
      await this.setInCache(cacheKey, result, 300); // Cache por 5 minutos apenas

      return result;
    } catch (error) {
      throw new DatabaseError(
        'Erro ao buscar estatísticas de sessões',
        error as Error
      );
    }
  }

  /**
   * Invalida sessão por token
   * @param token Token da sessão
   * @returns true se invalidada com sucesso
   */
  async invalidateByToken(token: string): Promise<boolean> {
    if (!token) {
      throw new ValidationError('Token é obrigatório');
    }

    try {
      const result = await this.model.db(this.model.tableName)
        .where('token', token)
        .whereNull('deleted_at')
        .update({
          is_active: false,
          updated_at: new Date()
        });
      
      if (result > 0) {
        await this.invalidateCache();
      }
      return result > 0;
    } catch (error) {
      throw new DatabaseError('Erro ao invalidar sessão por token', error as Error);
    }
  }

  /**
   * Invalida a sessão mais antiga de um usuário
   * @param userId ID do usuário
   * @returns true se invalidada com sucesso
   */
  async invalidateOldestSession(userId: number): Promise<boolean> {
    if (!userId) {
      throw new ValidationError('ID do usuário é obrigatório');
    }

    try {
      // Buscar a sessão mais antiga ativa do usuário
      const oldestSession = await this.model.db(this.model.tableName)
        .where({
          user_id: userId,
          is_active: true
        })
        .whereNull('deleted_at')
        .orderBy('last_activity', 'asc')
        .first();

      if (!oldestSession) {
        return false;
      }

      const result = await this.model.db(this.model.tableName)
        .where('id', oldestSession.id)
        .update({
          is_active: false,
          updated_at: new Date()
        });
      
      if (result > 0) {
        await this.invalidateCache();
      }
      return result > 0;
    } catch (error) {
      throw new DatabaseError('Erro ao invalidar sessão mais antiga', error as Error);
    }
  }

  /**
   * Busca sessões com filtros e paginação
   * @param filters Filtros de busca
   * @param page Número da página (começa em 1)
   * @param limit Itens por página
   * @returns Lista paginada de sessões
   */
  async search(
    filters: {
      user_id?: number;
      ip_address?: string;
      user_agent?: string;
      is_active?: boolean;
    },
    page = 1,
    limit = 10
  ) {
    try {
      const { user_id, ip_address, user_agent, is_active } = filters;
      const query = this.model.db(this.model.tableName).whereNull('deleted_at');

      if (user_id) {
        query.where('user_id', user_id);
      }
      if (ip_address) {
        query.where('ip_address', 'ilike', `%${ip_address}%`);
      }
      if (user_agent) {
        query.where('user_agent', 'ilike', `%${user_agent}%`);
      }
      if (typeof is_active === 'boolean') {
        query.where('is_active', is_active);
      }

      const offset = (page - 1) * limit;

      // Clonar a query para contar o total sem afetar a paginação
      const countQuery = query
        .clone()
        .clearSelect()
        .count('* as count')
        .first();
      const dataQuery = query
        .clone()
        .select('*')
        .offset(offset)
        .limit(limit)
        .orderBy('last_activity', 'desc');

      const [data, total] = await Promise.all([dataQuery, countQuery]);
      const totalCount = Number(total?.count) || 0;

      return {
        data,
        pagination: {
          total: totalCount,
          page,
          limit,
          totalPages: Math.ceil(totalCount / limit),
        },
      };
    } catch (error) {
      throw new DatabaseError('Erro ao buscar sessões', error as Error);
    }
  }
}

// Exporta a classe diretamente para permitir a criação de novas instâncias
export { SessionService };

// Exporta uma instância padrão para uso comum
const sessionServiceInstance = new SessionService();
export default sessionServiceInstance;
