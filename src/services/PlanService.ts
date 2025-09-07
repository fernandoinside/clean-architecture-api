import Plan, { IPlan } from '../models/Plan';
import BaseService from './BaseService';
import { ValidationError, NotFoundError, DatabaseError } from '../utils/errors';

class PlanService extends BaseService<IPlan> {
  constructor() {
    super(Plan);
  }

  /**
   * Cria um novo plano com validações adicionais
   * @param data Dados do plano
   * @returns Plano criado
   */
  async create(data: Omit<IPlan, 'id' | 'created_at' | 'updated_at' | 'deleted_at'>): Promise<IPlan> {
    if (!data || !data.name || !data.price || !data.currency || !data.interval) {
      throw new ValidationError('Nome, preço, moeda e intervalo do plano são obrigatórios');
    }

    try {
      const existing = await (this.model as any).findByName(data.name);
      if (existing) {
        throw new ValidationError('Um plano com este nome já existe');
      }

      const result = await super.create(data);
      if (!result) {
        throw new DatabaseError('Falha ao criar plano');
      }
      await this.invalidateCache();
      return result;
    } catch (error) {
      if (error instanceof ValidationError) throw error;
      throw new DatabaseError('Erro ao criar plano', error as Error);
    }
  }

  /**
   * Atualiza um plano existente
   * @param id ID do plano
   * @param data Dados para atualização
   * @returns Plano atualizado
   */
  async update(id: number, data: Partial<Omit<IPlan, 'id' | 'created_at' | 'updated_at' | 'deleted_at'>>): Promise<IPlan> {
    if (!id) {
      throw new ValidationError('ID do plano não fornecido');
    }

    try {
      if (data.name) {
        const existing = await (this.model as any).findByName(data.name);
        if (existing && existing.id !== id) {
          throw new ValidationError('Um plano com este nome já existe');
        }
      }

      const result = await super.update(id, data);
      if (!result) {
        throw new DatabaseError('Falha ao atualizar plano');
      }
      await this.invalidateCache();
      return result;
    } catch (error) {
      if (error instanceof ValidationError || error instanceof NotFoundError) throw error;
      throw new DatabaseError('Erro ao atualizar plano', error as Error);
    }
  }

  /**
   * Busca um plano pelo ID
   * @param id ID do plano
   * @returns Plano encontrado
   */
  async findById(id: number): Promise<IPlan> {
    try {
      const result = await super.findById(id);
      if (!result) {
        throw new NotFoundError('Plano não encontrado');
      }
      return result;
    } catch (error) {
      if (error instanceof NotFoundError) throw error;
      throw new DatabaseError('Erro ao buscar plano', error as Error);
    }
  }

  /**
   * Remove um plano (soft delete)
   * @param id ID do plano
   * @returns true se o plano foi removido com sucesso
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
      throw new DatabaseError('Erro ao remover plano', error as Error);
    }
  }

  /**
   * Busca planos com filtros e paginação
   * @param filters Filtros de busca
   * @param page Número da página (começa em 1)
   * @param limit Itens por página
   * @returns Lista paginada de planos
   */
  async search(filters: { name?: string; interval?: string; isActive?: boolean; minPrice?: number; maxPrice?: number }, page = 1, limit = 10) {
    try {
      const { name, interval, isActive, minPrice, maxPrice } = filters;
      
      // Usar métodos específicos do model quando possível
      if (interval && !name && isActive === undefined && !minPrice && !maxPrice) {
        const data = await (this.model as any).findByInterval(interval);
        return {
          data: data.slice((page - 1) * limit, page * limit),
          pagination: {
            total: data.length,
            page,
            limit,
            totalPages: Math.ceil(data.length / limit)
          }
        };
      }

      if (minPrice !== undefined && maxPrice !== undefined && !name && !interval && isActive === undefined) {
        const data = await (this.model as any).findByPriceRange(minPrice, maxPrice);
        return {
          data: data.slice((page - 1) * limit, page * limit),
          pagination: {
            total: data.length,
            page,
            limit,
            totalPages: Math.ceil(data.length / limit)
          }
        };
      }

      if (isActive === true && !name && !interval && !minPrice && !maxPrice) {
        const data = await (this.model as any).findActivePlans();
        return {
          data: data.slice((page - 1) * limit, page * limit),
          pagination: {
            total: data.length,
            page,
            limit,
            totalPages: Math.ceil(data.length / limit)
          }
        };
      }

      // Para queries mais complexas, usar query builder
      const query = this.model.db(this.model.tableName).whereNull('deleted_at');

      if (name) {
        query.where('name', 'ilike', `%${name}%`);
      }
      if (interval) {
        query.where('interval', interval);
      }
      if (typeof isActive === 'boolean') {
        query.where('is_active', isActive);
      }
      if (minPrice !== undefined) {
        query.where('price', '>=', minPrice);
      }
      if (maxPrice !== undefined) {
        query.where('price', '<=', maxPrice);
      }

      const offset = (page - 1) * limit;

      // Clonar a query para contar o total sem afetar a paginação
      const countQuery = query.clone().clearSelect().count('* as count').first();
      const dataQuery = query
        .clone()
        .select('*')
        .offset(offset)
        .limit(limit)
        .orderBy('price', 'asc');

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
      throw new DatabaseError('Erro ao buscar planos', error as Error);
    }
  }

  /**
   * Busca planos ativos
   * @returns Lista de planos ativos
   */
  async getActivePlans(): Promise<IPlan[]> {
    try {
      return await (this.model as any).findActivePlans();
    } catch (error) {
      throw new DatabaseError('Erro ao buscar planos ativos', error as Error);
    }
  }

  /**
   * Busca planos por faixa de preço
   * @param min Preço mínimo
   * @param max Preço máximo
   * @returns Lista de planos na faixa de preço
   */
  async getPlansByPriceRange(min: number, max: number): Promise<IPlan[]> {
    try {
      return await (this.model as any).findByPriceRange(min, max);
    } catch (error) {
      throw new DatabaseError('Erro ao buscar planos por faixa de preço', error as Error);
    }
  }

  /**
   * Busca o plano mais popular
   * @returns Plano mais popular
   */
  async getMostPopularPlan(): Promise<IPlan | null> {
    try {
      const plan = await (this.model as any).findMostPopular();
      return plan || null;
    } catch (error) {
      throw new DatabaseError('Erro ao buscar plano mais popular', error as Error);
    }
  }

  /**
   * Ativa um plano
   * @param id ID do plano
   * @returns true se ativado com sucesso
   */
  async activatePlan(id: number): Promise<boolean> {
    try {
      const success = await (this.model as any).activatePlan(id);
      if (success) {
        await this.invalidateCache();
      }
      return success;
    } catch (error) {
      throw new DatabaseError('Erro ao ativar plano', error as Error);
    }
  }

  /**
   * Desativa um plano
   * @param id ID do plano
   * @returns true se desativado com sucesso
   */
  async deactivatePlan(id: number): Promise<boolean> {
    try {
      const success = await (this.model as any).deactivatePlan(id);
      if (success) {
        await this.invalidateCache();
      }
      return success;
    } catch (error) {
      throw new DatabaseError('Erro ao desativar plano', error as Error);
    }
  }

  /**
   * Obtém estatísticas de um plano
   * @param planId ID do plano
   * @returns Estatísticas do plano
   */
  async getPlanStatistics(planId: number): Promise<{
    totalSubscriptions: number;
    activeSubscriptions: number;
    totalRevenue: number;
  }> {
    try {
      return await (this.model as any).getPlanStats(planId);
    } catch (error) {
      throw new DatabaseError('Erro ao buscar estatísticas do plano', error as Error);
    }
  }
}

// Exporta a classe diretamente para permitir a criação de novas instâncias
export { PlanService };

// Exporta uma instância padrão para uso comum
const planServiceInstance = new PlanService();
export default planServiceInstance;