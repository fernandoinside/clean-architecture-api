import Subscription, { ISubscription } from '../models/Subscription';
import BaseService from './BaseService';
import { ValidationError, NotFoundError, DatabaseError } from '../utils/errors';

class SubscriptionService extends BaseService<ISubscription> {
  constructor() {
    super(Subscription);
  }

  /**
   * Cria uma nova assinatura com validações adicionais
   * @param data Dados da assinatura
   * @returns Assinatura criada
   */
  async create(
    data: Omit<ISubscription, 'id' | 'created_at' | 'updated_at' | 'deleted_at'>
  ): Promise<ISubscription> {
    if (!data || (!data.company_id && !data.customer_id) || !data.plan_id || !data.current_period_start) {
      throw new ValidationError(
        'ID da empresa OU ID do cliente, ID do plano e data de início do período são obrigatórios'
      );
    }
    
    if (data.company_id && data.customer_id) {
      throw new ValidationError(
        'Deve ser fornecido apenas ID da empresa OU ID do cliente, não ambos'
      );
    }

    try {
      const result = await super.create(data);
      if (!result) {
        throw new DatabaseError('Falha ao criar assinatura');
      }
      await this.invalidateCache();
      return result;
    } catch (error) {
      if (error instanceof ValidationError) throw error;
      throw new DatabaseError('Erro ao criar assinatura', error as Error);
    }
  }

  /**
   * Atualiza uma assinatura existente
   * @param id ID da assinatura
   * @param data Dados para atualização
   * @returns Assinatura atualizada
   */
  async update(
    id: number,
    data: Partial<
      Omit<ISubscription, 'id' | 'created_at' | 'updated_at' | 'deleted_at'>
    >
  ): Promise<ISubscription> {
    if (!id) {
      throw new ValidationError('ID da assinatura não fornecido');
    }

    try {
      const result = await super.update(id, data);
      if (!result) {
        throw new DatabaseError('Falha ao atualizar assinatura');
      }
      await this.invalidateCache();
      return result;
    } catch (error) {
      if (error instanceof ValidationError || error instanceof NotFoundError)
        throw error;
      throw new DatabaseError('Erro ao atualizar assinatura', error as Error);
    }
  }

  /**
   * Busca uma assinatura pelo ID
   * @param id ID da assinatura
   * @returns Assinatura encontrada
   */
  async findById(id: number): Promise<ISubscription> {
    try {
      const result = await super.findById(id);
      if (!result) {
        throw new NotFoundError('Assinatura não encontrada');
      }
      return result;
    } catch (error) {
      if (error instanceof NotFoundError) throw error;
      throw new DatabaseError('Erro ao buscar assinatura', error as Error);
    }
  }

  /**
   * Remove uma assinatura (soft delete)
   * @param id ID da assinatura
   * @returns true se a assinatura foi removida com sucesso
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
      throw new DatabaseError('Erro ao remover assinatura', error as Error);
    }
  }

  /**
   * Busca assinaturas ativas
   * @returns Lista de assinaturas ativas
   */
  async findActiveSubscriptions(): Promise<ISubscription[]> {
    try {
      const cacheKey = 'subscriptions:active';
      const cachedData = await this.getFromCache(cacheKey);

      if (cachedData) {
        return cachedData;
      }

      const result = await (this.model as any).findActiveSubscriptions();
      await this.setInCache(cacheKey, result);

      return result;
    } catch (error) {
      throw new DatabaseError(
        'Erro ao buscar assinaturas ativas',
        error as Error
      );
    }
  }

  /**
   * Busca assinaturas por ID do cliente
   * @param customerId ID do cliente
   * @returns Lista de assinaturas do cliente
   */
  async findByCustomerId(customerId: number): Promise<ISubscription[]> {
    if (!customerId) {
      throw new ValidationError('ID do cliente é obrigatório');
    }

    try {
      const cacheKey = `subscriptions:customer:${customerId}`;
      const cachedData = await this.getFromCache(cacheKey);

      if (cachedData) {
        return cachedData;
      }

      const result = await (this.model as any).findByCustomerId(customerId);
      await this.setInCache(cacheKey, result);

      return result;
    } catch (error) {
      throw new DatabaseError(
        'Erro ao buscar assinaturas do cliente',
        error as Error
      );
    }
  }

  /**
   * Busca assinaturas por ID da empresa
   * @param companyId ID da empresa
   * @returns Lista de assinaturas da empresa
   */
  async findByCompanyId(companyId: number): Promise<ISubscription[]> {
    if (!companyId) {
      throw new ValidationError('ID da empresa é obrigatório');
    }

    try {
      const cacheKey = `subscriptions:company:${companyId}`;
      const cachedData = await this.getFromCache(cacheKey);

      if (cachedData) {
        return cachedData;
      }

      const result = await (this.model as any).findByCompanyId(companyId);
      await this.setInCache(cacheKey, result);

      return result;
    } catch (error) {
      throw new DatabaseError(
        'Erro ao buscar assinaturas da empresa',
        error as Error
      );
    }
  }

  /**
   * Busca assinaturas por ID do plano
   * @param planId ID do plano
   * @returns Lista de assinaturas do plano
   */
  async findByPlanId(planId: number): Promise<ISubscription[]> {
    if (!planId) {
      throw new ValidationError('ID do plano é obrigatório');
    }

    try {
      const cacheKey = `subscriptions:plan:${planId}`;
      const cachedData = await this.getFromCache(cacheKey);

      if (cachedData) {
        return cachedData;
      }

      const result = await (this.model as any).findByPlanId(planId);
      await this.setInCache(cacheKey, result);

      return result;
    } catch (error) {
      throw new DatabaseError(
        'Erro ao buscar assinaturas do plano',
        error as Error
      );
    }
  }

  /**
   * Busca assinaturas que estão expirando
   * @param days Número de dias para considerar como "expirando"
   * @returns Lista de assinaturas expirando
   */
  async findExpiringSubscriptions(days: number = 7): Promise<ISubscription[]> {
    try {
      const cacheKey = `subscriptions:expiring:${days}`;
      const cachedData = await this.getFromCache(cacheKey);

      if (cachedData) {
        return cachedData;
      }

      const result = await (this.model as any).findExpiringSubscriptions(days);
      await this.setInCache(cacheKey, result, 300); // Cache por 5 minutos apenas

      return result;
    } catch (error) {
      throw new DatabaseError(
        'Erro ao buscar assinaturas expirando',
        error as Error
      );
    }
  }

  /**
   * Busca assinaturas expiradas
   * @returns Lista de assinaturas expiradas
   */
  async findExpiredSubscriptions(): Promise<ISubscription[]> {
    try {
      const cacheKey = 'subscriptions:expired';
      const cachedData = await this.getFromCache(cacheKey);

      if (cachedData) {
        return cachedData;
      }

      const result = await (this.model as any).findExpiredSubscriptions();
      await this.setInCache(cacheKey, result, 300); // Cache por 5 minutos apenas

      return result;
    } catch (error) {
      throw new DatabaseError(
        'Erro ao buscar assinaturas expiradas',
        error as Error
      );
    }
  }

  /**
   * Busca a assinatura atual de um cliente
   * @param customerId ID do cliente
   * @returns Assinatura atual do cliente
   */
  async getCurrentCustomerSubscription(
    customerId: number
  ): Promise<ISubscription | null> {
    if (!customerId) {
      throw new ValidationError('ID do cliente é obrigatório');
    }

    try {
      const cacheKey = `subscriptions:current-customer:${customerId}`;
      const cachedData = await this.getFromCache(cacheKey);

      if (cachedData) {
        return cachedData;
      }

      const result = await (this.model as any).getCurrentCustomerSubscription(
        customerId
      );
      await this.setInCache(cacheKey, result, 1800); // Cache por 30 minutos

      return result || null;
    } catch (error) {
      throw new DatabaseError(
        'Erro ao buscar assinatura atual do cliente',
        error as Error
      );
    }
  }

  /**
   * Busca a assinatura atual de uma empresa
   * @param companyId ID da empresa
   * @returns Assinatura atual da empresa
   */
  async getCurrentSubscription(
    companyId: number
  ): Promise<ISubscription | null> {
    if (!companyId) {
      throw new ValidationError('ID da empresa é obrigatório');
    }

    try {
      const cacheKey = `subscriptions:current:${companyId}`;
      const cachedData = await this.getFromCache(cacheKey);

      if (cachedData) {
        return cachedData;
      }

      const result = await (this.model as any).getCurrentSubscription(
        companyId
      );
      await this.setInCache(cacheKey, result, 1800); // Cache por 30 minutos

      return result || null;
    } catch (error) {
      throw new DatabaseError(
        'Erro ao buscar assinatura atual',
        error as Error
      );
    }
  }

  /**
   * Busca o histórico de assinaturas de um cliente
   * @param customerId ID do cliente
   * @returns Histórico de assinaturas do cliente
   */
  async getCustomerSubscriptionHistory(customerId: number): Promise<ISubscription[]> {
    if (!customerId) {
      throw new ValidationError('ID do cliente é obrigatório');
    }

    try {
      const cacheKey = `subscriptions:history-customer:${customerId}`;
      const cachedData = await this.getFromCache(cacheKey);

      if (cachedData) {
        return cachedData;
      }

      const result = await (this.model as any).getCustomerSubscriptionHistory(
        customerId
      );
      await this.setInCache(cacheKey, result);

      return result;
    } catch (error) {
      throw new DatabaseError(
        'Erro ao buscar histórico de assinaturas do cliente',
        error as Error
      );
    }
  }

  /**
   * Busca o histórico de assinaturas de uma empresa
   * @param companyId ID da empresa
   * @returns Histórico de assinaturas da empresa
   */
  async getSubscriptionHistory(companyId: number): Promise<ISubscription[]> {
    if (!companyId) {
      throw new ValidationError('ID da empresa é obrigatório');
    }

    try {
      const cacheKey = `subscriptions:history:${companyId}`;
      const cachedData = await this.getFromCache(cacheKey);

      if (cachedData) {
        return cachedData;
      }

      const result = await (this.model as any).getSubscriptionHistory(
        companyId
      );
      await this.setInCache(cacheKey, result);

      return result;
    } catch (error) {
      throw new DatabaseError(
        'Erro ao buscar histórico de assinaturas',
        error as Error
      );
    }
  }

  /**
   * Busca assinatura com dados do plano
   * @param id ID da assinatura
   * @returns Assinatura com dados do plano
   */
  async getSubscriptionWithPlan(
    id: number
  ): Promise<(ISubscription & { plan?: any }) | null> {
    if (!id) {
      throw new ValidationError('ID da assinatura é obrigatório');
    }

    try {
      const cacheKey = `subscriptions:with-plan:${id}`;
      const cachedData = await this.getFromCache(cacheKey);

      if (cachedData) {
        return cachedData;
      }

      const result = await (this.model as any).getSubscriptionWithPlan(id);
      await this.setInCache(cacheKey, result);

      return result || null;
    } catch (error) {
      throw new DatabaseError(
        'Erro ao buscar assinatura com plano',
        error as Error
      );
    }
  }

  /**
   * Renova uma assinatura
   * @param id ID da assinatura
   * @param endDate Nova data de fim
   * @returns true se renovada com sucesso
   */
  async renewSubscription(id: number, endDate: string): Promise<boolean> {
    if (!id || !endDate) {
      throw new ValidationError(
        'ID da assinatura e nova data de fim são obrigatórios'
      );
    }

    try {
      const result = await (this.model as any).renewSubscription(id, endDate);
      if (result) {
        await this.invalidateCache();
      }
      return result;
    } catch (error) {
      throw new DatabaseError('Erro ao renovar assinatura', error as Error);
    }
  }

  /**
   * Cancela uma assinatura
   * @param id ID da assinatura
   * @returns true se cancelada com sucesso
   */
  async cancelSubscription(id: number): Promise<boolean> {
    if (!id) {
      throw new ValidationError('ID da assinatura é obrigatório');
    }

    try {
      const result = await (this.model as any).cancelSubscription(id);
      if (result) {
        await this.invalidateCache();
      }
      return result;
    } catch (error) {
      throw new DatabaseError('Erro ao cancelar assinatura', error as Error);
    }
  }

  /**
   * Ativa uma assinatura
   * @param id ID da assinatura
   * @returns true se ativada com sucesso
   */
  async activateSubscription(id: number): Promise<boolean> {
    if (!id) {
      throw new ValidationError('ID da assinatura é obrigatório');
    }

    try {
      const result = await (this.model as any).activateSubscription(id);
      if (result) {
        await this.invalidateCache();
      }
      return result;
    } catch (error) {
      throw new DatabaseError('Erro ao ativar assinatura', error as Error);
    }
  }

  /**
   * Expira uma assinatura
   * @param id ID da assinatura
   * @returns true se expirada com sucesso
   */
  async expireSubscription(id: number): Promise<boolean> {
    if (!id) {
      throw new ValidationError('ID da assinatura é obrigatório');
    }

    try {
      const result = await (this.model as any).expireSubscription(id);
      if (result) {
        await this.invalidateCache();
      }
      return result;
    } catch (error) {
      throw new DatabaseError('Erro ao expirar assinatura', error as Error);
    }
  }

  /**
   * Atualiza configuração de auto-renovação
   * @param id ID da assinatura
   * @param autoRenew Se deve auto-renovar
   * @returns true se atualizada com sucesso
   */
  async updateAutoRenew(id: number, autoRenew: boolean): Promise<boolean> {
    if (!id || autoRenew === undefined) {
      throw new ValidationError(
        'ID da assinatura e configuração de auto-renovação são obrigatórios'
      );
    }

    try {
      const result = await (this.model as any).updateAutoRenew(id, autoRenew);
      if (result) {
        await this.invalidateCache();
      }
      return result;
    } catch (error) {
      throw new DatabaseError(
        'Erro ao atualizar auto-renovação',
        error as Error
      );
    }
  }

  /**
   * Busca estatísticas das assinaturas
   * @returns Estatísticas das assinaturas
   */
  async getSubscriptionStats(): Promise<{
    total: number;
    active: number;
    expiring: number;
    cancelled: number;
  }> {
    try {
      const cacheKey = 'subscriptions:stats';
      const cachedData = await this.getFromCache(cacheKey);

      if (cachedData) {
        return cachedData;
      }

      const result = await (this.model as any).getSubscriptionStats();
      await this.setInCache(cacheKey, result, 300); // Cache por 5 minutos apenas

      return result;
    } catch (error) {
      throw new DatabaseError(
        'Erro ao buscar estatísticas de assinaturas',
        error as Error
      );
    }
  }

  /**
   * Busca assinaturas com filtros e paginação
   * @param filters Filtros de busca
   * @param page Número da página (começa em 1)
   * @param limit Itens por página
   * @returns Lista paginada de assinaturas
   */
  async search(
    filters: { company_id?: number; customer_id?: number; plan_id?: number; status?: string },
    page = 1,
    limit = 10
  ) {
    try {
      const { company_id, customer_id, plan_id, status } = filters;
      // Importante: usar nomes de colunas em snake_case conforme a migration
      const query = this.model
        .db(this.model.tableName)
        .whereNull('deleted_at');

      if (company_id) {
        query.where('company_id', company_id);
      }
      if (customer_id) {
        query.where('customer_id', customer_id);
      }
      if (plan_id) {
        query.where('plan_id', plan_id);
      }
      if (status) {
        query.where('status', status);
      }

      const offset = (page - 1) * limit;

      // Clonar a query para contar o total sem afetar a paginação
      const countQuery = query.clone().clearSelect().count('* as count').first();
      const dataQuery = query
        .clone()
        .select('*')
        .orderBy('created_at', 'desc')
        .offset(offset)
        .limit(limit);

      const [data, total] = await Promise.all([dataQuery, countQuery]);
      const totalCount = Number((total as any)?.count) || 0;

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
      throw new DatabaseError('Erro ao buscar assinaturas', error as Error);
    }
  }
}

// Exporta a classe diretamente para permitir a criação de novas instâncias
export { SubscriptionService };

// Exporta uma instância padrão para uso comum
const subscriptionServiceInstance = new SubscriptionService();
export default subscriptionServiceInstance;
