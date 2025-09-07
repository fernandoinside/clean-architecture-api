import Setting, { ISetting } from '../models/Setting';
import BaseService from './BaseService';
import { ValidationError, NotFoundError, DatabaseError } from '../utils/errors';

class SettingService extends BaseService<ISetting> {
  constructor() {
    super(Setting);
  }

  /**
   * Cria uma nova configuração com validações adicionais
   * @param data Dados da configuração
   * @returns Configuração criada
   */
  async create(
    data: Omit<ISetting, 'id' | 'created_at' | 'updated_at' | 'deleted_at'>
  ): Promise<ISetting> {
    if (!data || !data.key || data.value === undefined) {
      throw new ValidationError(
        'Chave e valor da configuração são obrigatórios'
      );
    }

    try {
      const keyExists = await (this.model as any).keyExists(data.key);
      if (keyExists) {
        throw new ValidationError('Uma configuração com esta chave já existe');
      }

      const result = await super.create(data);
      if (!result) {
        throw new DatabaseError('Falha ao criar configuração');
      }
      await this.invalidateCache();
      return result;
    } catch (error) {
      if (error instanceof ValidationError) throw error;
      throw new DatabaseError('Erro ao criar configuração', error as Error);
    }
  }

  /**
   * Atualiza uma configuração existente
   * @param id ID da configuração
   * @param data Dados para atualização
   * @returns Configuração atualizada
   */
  async update(
    id: number,
    data: Partial<
      Omit<ISetting, 'id' | 'created_at' | 'updated_at' | 'deleted_at'>
    >
  ): Promise<ISetting> {
    if (!id) {
      throw new ValidationError('ID da configuração não fornecido');
    }

    try {
      if (data.key) {
        const existing = await this.model
          .db(this.model.tableName)
          .where({ key: data.key })
          .whereNot('id', id)
          .first();
        if (existing) {
          throw new ValidationError(
            'Uma configuração com esta chave já existe'
          );
        }
      }

      const result = await super.update(id, data);
      if (!result) {
        throw new DatabaseError('Falha ao atualizar configuração');
      }
      await this.invalidateCache();
      return result;
    } catch (error) {
      if (error instanceof ValidationError || error instanceof NotFoundError)
        throw error;
      throw new DatabaseError('Erro ao atualizar configuração', error as Error);
    }
  }

  /**
   * Busca uma configuração pelo ID
   * @param id ID da configuração
   * @returns Configuração encontrada
   */
  async findById(id: number): Promise<ISetting> {
    try {
      const result = await super.findById(id);
      if (!result) {
        throw new NotFoundError('Configuração não encontrada');
      }
      return result;
    } catch (error) {
      if (error instanceof NotFoundError) throw error;
      throw new DatabaseError('Erro ao buscar configuração', error as Error);
    }
  }

  /**
   * Remove uma configuração (soft delete)
   * @param id ID da configuração
   * @returns true se a configuração foi removida com sucesso
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
      throw new DatabaseError('Erro ao remover configuração', error as Error);
    }
  }

  /**
   * Busca configuração por chave
   * @param key Chave da configuração
   * @returns Configuração encontrada
   */
  async findByKey(key: string): Promise<ISetting | null> {
    if (!key) {
      throw new ValidationError('Chave é obrigatória');
    }

    try {
      const cacheKey = `settings:key:${key}`;
      const cachedData = await this.getFromCache(cacheKey);

      if (cachedData) {
        return cachedData;
      }

      const result = await (this.model as any).findByKey(key);
      if (result) {
        await this.setInCache(cacheKey, result);
      }

      return result || null;
    } catch (error) {
      throw new DatabaseError(
        'Erro ao buscar configuração por chave',
        error as Error
      );
    }
  }

  /**
   * Busca configurações por tipo
   * @param type Tipo da configuração
   * @returns Lista de configurações do tipo
   */
  async findByType(
    type: 'string' | 'number' | 'boolean' | 'json'
  ): Promise<ISetting[]> {
    try {
      const cacheKey = `settings:type:${type}`;
      const cachedData = await this.getFromCache(cacheKey);

      if (cachedData) {
        return cachedData;
      }

      const result = await (this.model as any).findByType(type);
      await this.setInCache(cacheKey, result);

      return result;
    } catch (error) {
      throw new DatabaseError(
        'Erro ao buscar configurações por tipo',
        error as Error
      );
    }
  }

  /**
   * Busca configurações por padrão de chave
   * @param pattern Padrão para buscar nas chaves
   * @returns Lista de configurações que correspondem ao padrão
   */
  async getSettingsByPattern(pattern: string): Promise<ISetting[]> {
    if (!pattern) {
      throw new ValidationError('Padrão é obrigatório');
    }

    try {
      const cacheKey = `settings:pattern:${pattern}`;
      const cachedData = await this.getFromCache(cacheKey);

      if (cachedData) {
        return cachedData;
      }

      const result = await (this.model as any).getSettingsByPattern(pattern);
      await this.setInCache(cacheKey, result);

      return result;
    } catch (error) {
      throw new DatabaseError(
        'Erro ao buscar configurações por padrão',
        error as Error
      );
    }
  }

  /**
   * Busca valor de configuração por chave
   * @param key Chave da configuração
   * @param defaultValue Valor padrão se não encontrar
   * @returns Valor da configuração parseado
   */
  async getValue(key: string, defaultValue?: any): Promise<any> {
    if (!key) {
      throw new ValidationError('Chave é obrigatória');
    }

    try {
      const cacheKey = `settings:value:${key}`;
      const cachedData = await this.getFromCache(cacheKey);

      if (cachedData !== undefined) {
        return cachedData;
      }

      const result = await (this.model as any).getValue(key, defaultValue);
      await this.setInCache(cacheKey, result);

      return result;
    } catch (error) {
      throw new DatabaseError(
        'Erro ao buscar valor da configuração',
        error as Error
      );
    }
  }

  /**
   * Define valor de configuração por chave
   * @param key Chave da configuração
   * @param value Valor a ser definido
   * @param type Tipo do valor (auto-detectado se não fornecido)
   * @returns true se definido com sucesso
   */
  async setValue(
    key: string,
    value: any,
    type?: 'string' | 'number' | 'boolean' | 'json'
  ): Promise<boolean> {
    if (!key || value === undefined) {
      throw new ValidationError('Chave e valor são obrigatórios');
    }

    try {
      const result = await (this.model as any).setValue(key, value, type);
      if (result) {
        await this.invalidateCache();
      }
      return result;
    } catch (error) {
      throw new DatabaseError(
        'Erro ao definir valor da configuração',
        error as Error
      );
    }
  }

  /**
   * Remove configuração por chave
   * @param key Chave da configuração
   * @returns true se removida com sucesso
   */
  async deleteSetting(key: string): Promise<boolean> {
    if (!key) {
      throw new ValidationError('Chave é obrigatória');
    }

    try {
      const result = await (this.model as any).deleteSetting(key);
      if (result) {
        await this.invalidateCache();
      }
      return result;
    } catch (error) {
      throw new DatabaseError(
        'Erro ao remover configuração por chave',
        error as Error
      );
    }
  }

  /**
   * Verifica se uma chave existe
   * @param key Chave a ser verificada
   * @returns true se a chave existe
   */
  async keyExists(key: string): Promise<boolean> {
    if (!key) {
      return false;
    }

    try {
      const result = await (this.model as any).keyExists(key);
      return result;
    } catch (error) {
      throw new DatabaseError(
        'Erro ao verificar existência da chave',
        error as Error
      );
    }
  }

  /**
   * Busca todas as configurações da aplicação
   * @returns Objeto com todas as configurações parseadas
   */
  async getAppSettings(): Promise<Record<string, any>> {
    try {
      const cacheKey = 'settings:app-settings';
      const cachedData = await this.getFromCache(cacheKey);

      if (cachedData) {
        return cachedData;
      }

      const result = await (this.model as any).getAppSettings();
      await this.setInCache(cacheKey, result, 1800); // Cache por 30 minutos

      return result;
    } catch (error) {
      throw new DatabaseError(
        'Erro ao buscar configurações da aplicação',
        error as Error
      );
    }
  }

  /**
   * Atualiza múltiplas configurações
   * @param settings Array de configurações para atualizar
   * @returns Número de configurações atualizadas
   */
  async updateMultipleSettings(
    settings: {
      key: string;
      value: any;
      type?: 'string' | 'number' | 'boolean' | 'json';
    }[]
  ): Promise<number> {
    if (!settings || settings.length === 0) {
      throw new ValidationError('Lista de configurações é obrigatória');
    }

    try {
      const result = await (this.model as any).updateMultipleSettings(settings);
      if (result > 0) {
        await this.invalidateCache();
      }
      return result;
    } catch (error) {
      throw new DatabaseError(
        'Erro ao atualizar múltiplas configurações',
        error as Error
      );
    }
  }

  /**
   * Busca quantidade total de configurações
   * @returns Quantidade de configurações
   */
  async getSettingsCount(): Promise<number> {
    try {
      const cacheKey = 'settings:count';
      const cachedData = await this.getFromCache(cacheKey);

      if (cachedData !== null) {
        return cachedData;
      }

      const result = await (this.model as any).getSettingsCount();
      await this.setInCache(cacheKey, result, 600); // Cache por 10 minutos

      return result;
    } catch (error) {
      throw new DatabaseError('Erro ao contar configurações', error as Error);
    }
  }

  // Métodos helper para configurações de sistema
  /**
   * Busca configuração de sistema
   * @param key Chave da configuração (sem prefixo 'system.')
   * @param defaultValue Valor padrão
   * @returns Valor da configuração de sistema
   */
  async getSystemSetting(key: string, defaultValue?: any): Promise<any> {
    if (!key) {
      throw new ValidationError('Chave é obrigatória');
    }

    try {
      return await (this.model as any).getSystemSetting(key, defaultValue);
    } catch (error) {
      throw new DatabaseError(
        'Erro ao buscar configuração de sistema',
        error as Error
      );
    }
  }

  /**
   * Define configuração de sistema
   * @param key Chave da configuração (sem prefixo 'system.')
   * @param value Valor a ser definido
   * @returns true se definida com sucesso
   */
  async setSystemSetting(key: string, value: any): Promise<boolean> {
    if (!key || value === undefined) {
      throw new ValidationError('Chave e valor são obrigatórios');
    }

    try {
      const result = await (this.model as any).setSystemSetting(key, value);
      if (result) {
        await this.invalidateCache();
      }
      return result;
    } catch (error) {
      throw new DatabaseError(
        'Erro ao definir configuração de sistema',
        error as Error
      );
    }
  }

  // Métodos helper para configurações de usuário
  /**
   * Busca configuração de usuário
   * @param userId ID do usuário
   * @param key Chave da configuração
   * @param defaultValue Valor padrão
   * @returns Valor da configuração do usuário
   */
  async getUserSetting(
    userId: number,
    key: string,
    defaultValue?: any
  ): Promise<any> {
    if (!userId || !key) {
      throw new ValidationError('ID do usuário e chave são obrigatórios');
    }

    try {
      return await (this.model as any).getUserSetting(
        userId,
        key,
        defaultValue
      );
    } catch (error) {
      throw new DatabaseError(
        'Erro ao buscar configuração de usuário',
        error as Error
      );
    }
  }

  /**
   * Define configuração de usuário
   * @param userId ID do usuário
   * @param key Chave da configuração
   * @param value Valor a ser definido
   * @returns true se definida com sucesso
   */
  async setUserSetting(
    userId: number,
    key: string,
    value: any
  ): Promise<boolean> {
    if (!userId || !key || value === undefined) {
      throw new ValidationError(
        'ID do usuário, chave e valor são obrigatórios'
      );
    }

    try {
      const result = await (this.model as any).setUserSetting(
        userId,
        key,
        value
      );
      if (result) {
        await this.invalidateCache();
      }
      return result;
    } catch (error) {
      throw new DatabaseError(
        'Erro ao definir configuração de usuário',
        error as Error
      );
    }
  }

  // Métodos helper para configurações de empresa
  /**
   * Busca configuração de empresa
   * @param companyId ID da empresa
   * @param key Chave da configuração
   * @param defaultValue Valor padrão
   * @returns Valor da configuração da empresa
   */
  async getCompanySetting(
    companyId: number,
    key: string,
    defaultValue?: any
  ): Promise<any> {
    if (!companyId || !key) {
      throw new ValidationError('ID da empresa e chave são obrigatórios');
    }

    try {
      return await (this.model as any).getCompanySetting(
        companyId,
        key,
        defaultValue
      );
    } catch (error) {
      throw new DatabaseError(
        'Erro ao buscar configuração de empresa',
        error as Error
      );
    }
  }

  /**
   * Define configuração de empresa
   * @param companyId ID da empresa
   * @param key Chave da configuração
   * @param value Valor a ser definido
   * @returns true se definida com sucesso
   */
  async setCompanySetting(
    companyId: number,
    key: string,
    value: any
  ): Promise<boolean> {
    if (!companyId || !key || value === undefined) {
      throw new ValidationError(
        'ID da empresa, chave e valor são obrigatórios'
      );
    }

    try {
      const result = await (this.model as any).setCompanySetting(
        companyId,
        key,
        value
      );
      if (result) {
        await this.invalidateCache();
      }
      return result;
    } catch (error) {
      throw new DatabaseError(
        'Erro ao definir configuração de empresa',
        error as Error
      );
    }
  }

  /**
   * Busca configurações com filtros e paginação
   * @param filters Filtros de busca
   * @param page Número da página (começa em 1)
   * @param limit Itens por página
   * @returns Lista paginada de configurações
   */
  async search(
    filters: { key?: string; value?: string; type?: string },
    page = 1,
    limit = 10
  ) {
    try {
      const { key, value, type } = filters;
      const query = this.model.db(this.model.tableName).whereNull('deleted_at');

      if (key) {
        query.where('key', 'ilike', `%${key}%`);
      }
      if (value) {
        query.where('value', 'ilike', `%${value}%`);
      }
      if (type) {
        query.where('type', type);
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
        .orderBy('key', 'asc');

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
      throw new DatabaseError('Erro ao buscar configurações', error as Error);
    }
  }
}

// Exporta a classe diretamente para permitir a criação de novas instâncias
export { SettingService };

// Exporta uma instância padrão para uso comum
const settingServiceInstance = new SettingService();
export default settingServiceInstance;
