import { IBaseModel } from '../models/BaseModel';
import logger from '../config/logger';
import redisClient from '../config/redis';
import { DatabaseError, NotFoundError } from '../utils/errors';

export interface IBaseService<T> {
  getAll(): Promise<T[]>;
  findById(id: number): Promise<T | undefined>;
  create(
    data: Omit<T, 'id' | 'created_at' | 'updated_at' | 'deleted_at'>
  ): Promise<T | undefined>;
  update(
    id: number,
    data: Partial<Omit<T, 'id' | 'created_at' | 'updated_at' | 'deleted_at'>>
  ): Promise<T | undefined>;
  delete(id: number): Promise<boolean>;
  invalidateCache(): Promise<void>;
}

class BaseService<T> implements IBaseService<T> {
  protected model: IBaseModel<T>;

  constructor(model: IBaseModel<T>) {
    this.model = model;
  }

  /**
   * Obtém todos os registros
   * @returns Lista de registros
   */
  async getAll(): Promise<T[]> {
    const cacheKey = `${this.model.tableName}:all`;
    try {
      // Verificar se há dados em cache
      const cachedData = await redisClient.get(cacheKey);
      if (cachedData) {
        logger.info(`[${this.model.tableName}] Dados obtidos do cache.`);
        return JSON.parse(cachedData) as T[];
      }

      // Buscar dados do banco
      const result = await this.model.getAll();

      // Armazenar em cache por 1 hora
      if (result && result.length > 0) {
        await redisClient.set(cacheKey, JSON.stringify(result), 'EX', 3600);
        logger.info(
          `[${this.model.tableName}] Dados obtidos do banco e armazenados em cache.`
        );
      }

      return result;
    } catch (error) {
      const errorMessage = `Erro ao obter todos os registros de ${this.model.tableName}: ${error instanceof Error ? error.message : String(error)}`;
      logger.error(errorMessage);
      throw new DatabaseError(
        errorMessage,
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Invalida o cache
   */
  async invalidateCache(): Promise<void> {
    const cacheKey = `${this.model.tableName}:all`;
    try {
      await redisClient.del(cacheKey);
      logger.info(`[${this.model.tableName}] Cache invalidado.`);
    } catch (error) {
      logger.error(
        `Erro ao invalidar cache para ${this.model.tableName}: ${error instanceof Error ? error.message : String(error)}`
      );
      // Não lançamos o erro para não quebrar o fluxo principal
    }
  }

  /**
   * Busca dados do cache
   * @param key Chave do cache
   * @returns Dados do cache ou null se não encontrados
   */
  protected async getFromCache<TCache = any>(
    key: string
  ): Promise<TCache | null> {
    try {
      const cachedData = await redisClient.get(key);
      if (cachedData) {
        logger.info(
          `[${this.model.tableName}] Dados obtidos do cache para chave: ${key}`
        );
        return JSON.parse(cachedData) as TCache;
      }
      return null;
    } catch (error) {
      logger.error(
        `Erro ao obter dados do cache para chave ${key}: ${error instanceof Error ? error.message : String(error)}`
      );
      return null;
    }
  }

  /**
   * Armazena dados no cache
   * @param key Chave do cache
   * @param data Dados para armazenar
   * @param ttl Tempo de vida em segundos (padrão: 1 hora)
   */
  protected async setInCache(
    key: string,
    data: any,
    ttl: number = 3600
  ): Promise<void> {
    try {
      await redisClient.set(key, JSON.stringify(data), 'EX', ttl);
      logger.info(
        `[${this.model.tableName}] Dados armazenados em cache para chave: ${key} (TTL: ${ttl}s)`
      );
    } catch (error) {
      logger.error(
        `Erro ao armazenar dados no cache para chave ${key}: ${error instanceof Error ? error.message : String(error)}`
      );
      // Não lançamos o erro para não quebrar o fluxo principal
    }
  }

  /**
   * Busca um registro pelo ID
   * @param id ID do registro
   * @returns O registro encontrado ou undefined
   */
  async findById(id: number): Promise<T | undefined> {
    if (!id) return undefined;

    try {
      const result = await this.model.findById(id);
      if (result) {
        logger.info(
          `[${this.model.tableName}] Registro com ID ${id} encontrado.`
        );
      } else {
        logger.warn(
          `[${this.model.tableName}] Registro com ID ${id} não encontrado.`
        );
      }
      return result || undefined;
    } catch (error) {
      const errorMessage = `Erro ao buscar registro com ID ${id} em ${this.model.tableName}: ${error instanceof Error ? error.message : String(error)}`;
      logger.error(errorMessage);
      throw new DatabaseError(
        errorMessage,
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Cria um novo registro
   * @param data Dados do registro a ser criado
   * @returns O registro criado ou undefined em caso de erro
   */
  async create(
    data: Omit<T, 'id' | 'created_at' | 'updated_at' | 'deleted_at'>
  ): Promise<T | undefined> {
    try {
      const result = await this.model.create(data);
      if (result) {
        await this.invalidateCache();
        logger.info(
          `[${this.model.tableName}] Novo registro criado com sucesso.`
        );
        return result;
      }
      return undefined;
    } catch (error) {
      const errorMessage = `Erro ao criar registro em ${this.model.tableName}: ${error instanceof Error ? error.message : String(error)}`;
      logger.error(errorMessage);
      throw new DatabaseError(
        errorMessage,
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Atualiza um registro existente
   * @param id ID do registro a ser atualizado
   * @param data Dados parciais para atualização
   * @returns O registro atualizado ou undefined se não encontrado
   */
  async update(
    id: number,
    data: Partial<Omit<T, 'id' | 'created_at' | 'updated_at' | 'deleted_at'>>
  ): Promise<T | undefined> {
    if (!id) return undefined;

    try {
      const result = await this.model.update(id, data);
      if (result) {
        await this.invalidateCache();
        logger.info(
          `[${this.model.tableName}] Registro com ID ${id} atualizado com sucesso.`
        );
        return result;
      }

      logger.warn(
        `[${this.model.tableName}] Registro com ID ${id} não encontrado para atualização.`
      );
      return undefined;
    } catch (error) {
      const errorMessage = `Erro ao atualizar registro com ID ${id} em ${this.model.tableName}: ${error instanceof Error ? error.message : String(error)}`;
      logger.error(errorMessage);
      throw new DatabaseError(
        errorMessage,
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Exclui um registro pelo ID
   * @param id ID do registro a ser excluído
   * @returns true se o registro foi excluído, false caso contrário
   */
  async delete(id: number): Promise<boolean> {
    if (!id) return false;

    try {
      const deleted = await this.model.delete(id);
      if (deleted) {
        await this.invalidateCache();
        logger.info(
          `[${this.model.tableName}] Registro com ID ${id} excluído com sucesso.`
        );
        return true;
      }

      logger.warn(
        `[${this.model.tableName}] Registro com ID ${id} não encontrado para exclusão.`
      );
      return false;
    } catch (error) {
      const errorMessage = `Erro ao excluir registro com ID ${id} de ${this.model.tableName}: ${error instanceof Error ? error.message : String(error)}`;
      logger.error(errorMessage);
      throw new DatabaseError(
        errorMessage,
        error instanceof Error ? error : undefined
      );
    }
  }
}

export default BaseService;
