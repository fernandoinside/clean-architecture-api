import PageStatic, { IPageStatic } from '../models/PageStatic';
import BaseService from './BaseService';
import { ValidationError, NotFoundError, DatabaseError } from '../utils/errors';

class PageStaticService extends BaseService<IPageStatic> {
  constructor() {
    super(PageStatic);
  }

  /**
   * Cria uma nova página estática com validações adicionais
   * @param data Dados da página
   * @returns Página criada
   */
  async create(data: Omit<IPageStatic, 'id' | 'created_at' | 'updated_at' | 'deleted_at'>): Promise<IPageStatic> {
    if (!data || !data.key || !data.title) {
      throw new ValidationError('Key e título da página são obrigatórios');
    }

    // Validar formato da key
    const keyPattern = /^[a-z0-9-_]+$/;
    if (!keyPattern.test(data.key)) {
      throw new ValidationError('Key deve conter apenas letras minúsculas, números, hífens e underscores');
    }

    try {
      const existing = await (this.model as any).findByKey(data.key);
      if (existing) {
        throw new ValidationError('Uma página com esta key já existe');
      }

      const result = await super.create(data);
      if (!result) {
        throw new DatabaseError('Falha ao criar página estática');
      }
      await this.invalidateCache();
      return result;
    } catch (error) {
      if (error instanceof ValidationError) throw error;
      throw new DatabaseError('Erro ao criar página estática', error as Error);
    }
  }

  /**
   * Atualiza uma página estática existente
   * @param id ID da página
   * @param data Dados para atualização
   * @returns Página atualizada
   */
  async update(id: number, data: Partial<Omit<IPageStatic, 'id' | 'created_at' | 'updated_at' | 'deleted_at'>>): Promise<IPageStatic> {
    if (!id) {
      throw new ValidationError('ID da página não fornecido');
    }

    try {
      if (data.key) {
        // Validar formato da key
        const keyPattern = /^[a-z0-9-_]+$/;
        if (!keyPattern.test(data.key)) {
          throw new ValidationError('Key deve conter apenas letras minúsculas, números, hífens e underscores');
        }

        const existing = await (this.model as any).findByKey(data.key);
        if (existing && existing.id !== id) {
          throw new ValidationError('Uma página com esta key já existe');
        }
      }

      const result = await super.update(id, data);
      if (!result) {
        throw new DatabaseError('Falha ao atualizar página estática');
      }
      await this.invalidateCache();
      return result;
    } catch (error) {
      if (error instanceof ValidationError || error instanceof NotFoundError) throw error;
      throw new DatabaseError('Erro ao atualizar página estática', error as Error);
    }
  }

  /**
   * Busca uma página pelo ID
   * @param id ID da página
   * @returns Página encontrada
   */
  async findById(id: number): Promise<IPageStatic> {
    try {
      const result = await super.findById(id);
      if (!result) {
        throw new NotFoundError('Página não encontrada');
      }
      return result;
    } catch (error) {
      if (error instanceof NotFoundError) throw error;
      throw new DatabaseError('Erro ao buscar página', error as Error);
    }
  }

  /**
   * Busca uma página pela key
   * @param key Key da página
   * @returns Página encontrada
   */
  async findByKey(key: string): Promise<IPageStatic> {
    if (!key) {
      throw new ValidationError('Key da página não fornecida');
    }

    try {
      const result = await (this.model as any).findByKey(key);
      if (!result) {
        throw new NotFoundError('Página não encontrada');
      }
      return result;
    } catch (error) {
      if (error instanceof NotFoundError) throw error;
      throw new DatabaseError('Erro ao buscar página por key', error as Error);
    }
  }

  /**
   * Remove uma página (soft delete)
   * @param id ID da página
   * @returns true se a página foi removida com sucesso
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
      throw new DatabaseError('Erro ao remover página', error as Error);
    }
  }

  /**
   * Busca páginas com filtros e paginação
   * @param filters Filtros de busca
   * @param page Número da página (começa em 1)
   * @param limit Itens por página
   * @returns Lista paginada de páginas
   */
  async search(filters: { 
    search?: string; 
    type?: 'page' | 'section' | 'banner' | 'config'; 
    isActive?: boolean;
    orderBy?: string;
    orderDirection?: 'asc' | 'desc';
  }, page = 1, limit = 10) {
    try {
      const { search, type, isActive, orderBy = 'order', orderDirection = 'asc' } = filters;
      
      // Usar métodos específicos do model quando possível
      if (type && !search && isActive === true) {
        const data = await (this.model as any).findActiveByType(type);
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

      if (type && !search && isActive === undefined) {
        const data = await (this.model as any).findByType(type);
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

      if (search && !type && isActive === undefined) {
        const data = await (this.model as any).searchByContent(search);
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

      if (search) {
        query.where(function() {
          this.where('title', 'ilike', `%${search}%`)
              .orWhere('content', 'ilike', `%${search}%`)
              .orWhere('key', 'ilike', `%${search}%`);
        });
      }

      if (type) {
        query.where('type', type);
      }

      if (typeof isActive === 'boolean') {
        query.where('is_active', isActive);
      }

      const offset = (page - 1) * limit;

      // Ordenação
      const validOrderFields = ['id', 'key', 'title', 'type', 'is_active', 'order', 'created_at', 'updated_at'];
      const orderField = validOrderFields.includes(orderBy) ? orderBy : 'order';
      const orderDir = ['asc', 'desc'].includes(orderDirection) ? orderDirection : 'asc';

      // Clonar a query para contar o total sem afetar a paginação
      const countQuery = query.clone().clearSelect().count('* as count').first();
      const dataQuery = query
        .clone()
        .select('*')
        .offset(offset)
        .limit(limit)
        .orderBy(orderField, orderDir)
        .orderBy('id', 'asc'); // Ordem secundária para consistência

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
      throw new DatabaseError('Erro ao buscar páginas', error as Error);
    }
  }

  /**
   * Busca páginas ativas (para uso público)
   * @returns Lista de páginas ativas
   */
  async getActivePages(): Promise<IPageStatic[]> {
    try {
      return await (this.model as any).findActivePages();
    } catch (error) {
      throw new DatabaseError('Erro ao buscar páginas ativas', error as Error);
    }
  }

  /**
   * Busca conteúdo público (sem dados sensíveis)
   * @returns Lista de conteúdo público
   */
  async getPublicContent(): Promise<IPageStatic[]> {
    try {
      return await (this.model as any).findPublicContent();
    } catch (error) {
      throw new DatabaseError('Erro ao buscar conteúdo público', error as Error);
    }
  }

  /**
   * Busca páginas por tipo
   * @param type Tipo de página
   * @param activeOnly Se deve buscar apenas páginas ativas
   * @returns Lista de páginas do tipo especificado
   */
  async getPagesByType(type: 'page' | 'section' | 'banner' | 'config', activeOnly = true): Promise<IPageStatic[]> {
    try {
      if (activeOnly) {
        return await (this.model as any).findActiveByType(type);
      } else {
        return await (this.model as any).findByType(type);
      }
    } catch (error) {
      throw new DatabaseError(`Erro ao buscar páginas do tipo ${type}`, error as Error);
    }
  }

  /**
   * Ativa uma página
   * @param id ID da página
   * @returns true se ativada com sucesso
   */
  async activatePage(id: number): Promise<boolean> {
    try {
      const success = await (this.model as any).activatePage(id);
      if (success) {
        await this.invalidateCache();
      }
      return success;
    } catch (error) {
      throw new DatabaseError('Erro ao ativar página', error as Error);
    }
  }

  /**
   * Desativa uma página
   * @param id ID da página
   * @returns true se desativada com sucesso
   */
  async deactivatePage(id: number): Promise<boolean> {
    try {
      const success = await (this.model as any).deactivatePage(id);
      if (success) {
        await this.invalidateCache();
      }
      return success;
    } catch (error) {
      throw new DatabaseError('Erro ao desativar página', error as Error);
    }
  }

  /**
   * Atualiza a ordem de uma página
   * @param id ID da página
   * @param order Nova ordem
   * @returns true se atualizada com sucesso
   */
  async updatePageOrder(id: number, order: number): Promise<boolean> {
    try {
      const success = await (this.model as any).updateOrder(id, order);
      if (success) {
        await this.invalidateCache();
      }
      return success;
    } catch (error) {
      throw new DatabaseError('Erro ao atualizar ordem da página', error as Error);
    }
  }

  /**
   * Atualização em lote do status de páginas
   * @param ids Array de IDs das páginas
   * @param isActive Status a ser aplicado
   * @returns Número de páginas atualizadas
   */
  async bulkUpdateStatus(ids: number[], isActive: boolean): Promise<number> {
    if (!ids || ids.length === 0) {
      throw new ValidationError('Lista de IDs não fornecida ou vazia');
    }

    try {
      const updated = await (this.model as any).bulkUpdateStatus(ids, isActive);
      if (updated > 0) {
        await this.invalidateCache();
      }
      return updated;
    } catch (error) {
      throw new DatabaseError('Erro ao atualizar status das páginas', error as Error);
    }
  }

  /**
   * Duplica uma página existente
   * @param id ID da página a ser duplicada
   * @param newKey Nova key para a página duplicada
   * @param newTitle Novo título para a página duplicada
   * @returns Página duplicada
   */
  async duplicatePage(id: number, newKey: string, newTitle: string): Promise<IPageStatic> {
    if (!id || !newKey || !newTitle) {
      throw new ValidationError('ID, nova key e novo título são obrigatórios para duplicação');
    }

    // Validar formato da key
    const keyPattern = /^[a-z0-9-_]+$/;
    if (!keyPattern.test(newKey)) {
      throw new ValidationError('Nova key deve conter apenas letras minúsculas, números, hífens e underscores');
    }

    try {
      const duplicate = await (this.model as any).duplicate(id, newKey, newTitle);
      if (!duplicate) {
        throw new DatabaseError('Falha ao duplicar página');
      }
      await this.invalidateCache();
      return duplicate;
    } catch (error) {
      if (error instanceof ValidationError) throw error;
      throw new DatabaseError('Erro ao duplicar página', error as Error);
    }
  }

  /**
   * Obtém estatísticas das páginas
   * @returns Estatísticas gerais
   */
  async getStatistics(): Promise<{
    total: number;
    active: number;
    inactive: number;
    byType: Record<string, number>;
  }> {
    try {
      return await (this.model as any).getStatistics();
    } catch (error) {
      throw new DatabaseError('Erro ao buscar estatísticas das páginas', error as Error);
    }
  }

  /**
   * Busca banners ativos
   * @returns Lista de banners ativos
   */
  async getActiveBanners(): Promise<IPageStatic[]> {
    try {
      return await (this.model as any).findBanners();
    } catch (error) {
      throw new DatabaseError('Erro ao buscar banners ativos', error as Error);
    }
  }

  /**
   * Busca seções ativas
   * @returns Lista de seções ativas
   */
  async getActiveSections(): Promise<IPageStatic[]> {
    try {
      return await (this.model as any).findSections();
    } catch (error) {
      throw new DatabaseError('Erro ao buscar seções ativas', error as Error);
    }
  }

  /**
   * Busca configurações ativas
   * @returns Lista de configurações ativas
   */
  async getActiveConfigs(): Promise<IPageStatic[]> {
    try {
      return await (this.model as any).findConfigs();
    } catch (error) {
      throw new DatabaseError('Erro ao buscar configurações ativas', error as Error);
    }
  }

  /**
   * Busca páginas ativas
   * @returns Lista de páginas ativas
   */
  async getActiveStaticPages(): Promise<IPageStatic[]> {
    try {
      return await (this.model as any).findPages();
    } catch (error) {
      throw new DatabaseError('Erro ao buscar páginas ativas', error as Error);
    }
  }
}

// Exporta a classe diretamente para permitir a criação de novas instâncias
export { PageStaticService };

// Exporta uma instância padrão para uso comum
const pageStaticServiceInstance = new PageStaticService();
export default pageStaticServiceInstance;