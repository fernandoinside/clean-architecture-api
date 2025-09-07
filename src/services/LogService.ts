import Log, { ILog } from '../models/Log';
import BaseService from './BaseService';
import { ValidationError, NotFoundError, DatabaseError } from '../utils/errors';
import logger from '../config/logger';
import path from 'path';
import winston from 'winston';

// Configuração do logger para logs de frontend
const frontendLogDirectory = path.resolve(__dirname, '../../logs'); // Ajuste o caminho conforme necessário

const frontendLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({
      filename: path.join(frontendLogDirectory, 'error.log'),
      level: 'error',
    }),
    new winston.transports.File({
      filename: path.join(frontendLogDirectory, 'combined.log'),
    }),
  ],
});

class LogService extends BaseService<ILog> {
  constructor() {
    super(Log);
  }

  /**
   * Cria um novo log com validações adicionais
   * @param data Dados do log
   * @returns Log criado ou mensagem de sucesso para logs de frontend
   */
  async create(
    data: Omit<ILog, 'id' | 'created_at' | 'updated_at' | 'deleted_at'>
  ): Promise<ILog | undefined> {
    if (!data || !data.level || !data.message) {
      throw new ValidationError('Nível e mensagem do log são obrigatórios');
    }

    if (data.source === 'frontend') {
      // Log de frontend é enviado para o arquivo, não para o banco de dados
      frontendLogger.log(data.level, data.message, { meta: data.meta });
      return undefined;
    } else {
      // Logs de backend são salvos no banco de dados
      try {
        const result = await super.create(data);
        if (!result) {
          throw new DatabaseError('Falha ao criar log');
        }
        await this.invalidateCache();
        return result;
      } catch (error) {
        if (error instanceof ValidationError) throw error;
        throw new DatabaseError('Erro ao criar log', error as Error);
      }
    }
  }

  /**
   * Atualiza um log existente
   * @param id ID do log
   * @param data Dados para atualização
   * @returns Log atualizado
   */
  async update(
    id: number,
    data: Partial<Omit<ILog, 'id' | 'created_at' | 'updated_at' | 'deleted_at'>>
  ): Promise<ILog> {
    if (!id) {
      throw new ValidationError('ID do log não fornecido');
    }

    try {
      const result = await super.update(id, data);
      if (!result) {
        throw new DatabaseError('Falha ao atualizar log');
      }
      await this.invalidateCache();
      return result;
    } catch (error) {
      if (error instanceof ValidationError || error instanceof NotFoundError)
        throw error;
      throw new DatabaseError('Erro ao atualizar log', error as Error);
    }
  }

  /**
   * Busca um log pelo ID
   * @param id ID do log
   * @returns Log encontrado
   */
  async findById(id: number): Promise<ILog> {
    try {
      const result = await super.findById(id);
      if (!result) {
        throw new NotFoundError('Log não encontrado');
      }
      return result;
    } catch (error) {
      if (error instanceof NotFoundError) throw error;
      throw new DatabaseError('Erro ao buscar log', error as Error);
    }
  }

  /**
   * Remove um log (soft delete)
   * @param id ID do log
   * @returns true se o log foi removido com sucesso
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
      throw new DatabaseError('Erro ao remover log', error as Error);
    }
  }

  /**
   * Busca logs por nível
   * @param level Nível do log
   * @returns Lista de logs do nível especificado
   */
  async findByLevel(
    level: 'info' | 'warn' | 'error' | 'debug'
  ): Promise<ILog[]> {
    try {
      const cacheKey = `logs:level:${level}`;
      const cachedData = await this.getFromCache(cacheKey);

      if (cachedData) {
        return cachedData;
      }

      const result = await (this.model as any).findByLevel(level);
      await this.setInCache(cacheKey, result, 300); // Cache por 5 minutos apenas

      return result;
    } catch (error) {
      throw new DatabaseError('Erro ao buscar logs por nível', error as Error);
    }
  }

  /**
   * Busca logs por fonte
   * @param source Fonte do log
   * @returns Lista de logs da fonte especificada
   */
  async findBySource(source: 'frontend' | 'backend'): Promise<ILog[]> {
    try {
      const cacheKey = `logs:source:${source}`;
      const cachedData = await this.getFromCache(cacheKey);

      if (cachedData) {
        return cachedData;
      }

      const result = await (this.model as any).findBySource(source);
      await this.setInCache(cacheKey, result, 600); // Cache por 10 minutos

      return result;
    } catch (error) {
      throw new DatabaseError('Erro ao buscar logs por fonte', error as Error);
    }
  }

  /**
   * Busca logs por intervalo de datas
   * @param start Data de início
   * @param end Data de fim
   * @returns Lista de logs no intervalo
   */
  async findByDateRange(start: Date, end: Date): Promise<ILog[]> {
    if (!start || !end) {
      throw new ValidationError('Datas de início e fim são obrigatórias');
    }

    try {
      const startStr = start.toISOString().split('T')[0];
      const endStr = end.toISOString().split('T')[0];
      const cacheKey = `logs:date-range:${startStr}:${endStr}`;
      const cachedData = await this.getFromCache(cacheKey);

      if (cachedData) {
        return cachedData;
      }

      const result = await (this.model as any).findByDateRange(start, end);
      await this.setInCache(cacheKey, result, 1800); // Cache por 30 minutos

      return result;
    } catch (error) {
      throw new DatabaseError(
        'Erro ao buscar logs por intervalo de datas',
        error as Error
      );
    }
  }

  /**
   * Busca apenas logs de erro
   * @returns Lista de logs de erro
   */
  async findErrors(): Promise<ILog[]> {
    try {
      const cacheKey = 'logs:errors';
      const cachedData = await this.getFromCache(cacheKey);

      if (cachedData) {
        return cachedData;
      }

      const result = await (this.model as any).findErrors();
      await this.setInCache(cacheKey, result, 300); // Cache por 5 minutos apenas

      return result;
    } catch (error) {
      throw new DatabaseError('Erro ao buscar logs de erro', error as Error);
    }
  }

  /**
   * Busca logs recentes
   * @param limit Limite de logs a retornar
   * @returns Lista de logs recentes
   */
  async getRecentLogs(limit: number = 100): Promise<ILog[]> {
    try {
      const cacheKey = `logs:recent:${limit}`;
      const cachedData = await this.getFromCache(cacheKey);

      if (cachedData) {
        return cachedData;
      }

      const result = await (this.model as any).getRecentLogs(limit);
      await this.setInCache(cacheKey, result, 300); // Cache por 5 minutos apenas

      return result;
    } catch (error) {
      throw new DatabaseError('Erro ao buscar logs recentes', error as Error);
    }
  }

  /**
   * Busca logs por usuário
   * @param userId ID do usuário
   * @returns Lista de logs do usuário
   */
  async findLogsByUser(userId: number): Promise<ILog[]> {
    if (!userId) {
      throw new ValidationError('ID do usuário é obrigatório');
    }

    try {
      const cacheKey = `logs:user:${userId}`;
      const cachedData = await this.getFromCache(cacheKey);

      if (cachedData) {
        return cachedData;
      }

      const result = await (this.model as any).findLogsByUser(userId);
      await this.setInCache(cacheKey, result, 900); // Cache por 15 minutos

      return result;
    } catch (error) {
      throw new DatabaseError('Erro ao buscar logs do usuário', error as Error);
    }
  }

  /**
   * Busca logs por ação
   * @param action Ação executada
   * @returns Lista de logs da ação
   */
  async findLogsByAction(action: string): Promise<ILog[]> {
    if (!action) {
      throw new ValidationError('Ação é obrigatória');
    }

    try {
      const cacheKey = `logs:action:${action}`;
      const cachedData = await this.getFromCache(cacheKey);

      if (cachedData) {
        return cachedData;
      }

      const result = await (this.model as any).findLogsByAction(action);
      await this.setInCache(cacheKey, result, 900); // Cache por 15 minutos

      return result;
    } catch (error) {
      throw new DatabaseError('Erro ao buscar logs por ação', error as Error);
    }
  }

  /**
   * Busca logs por tabela
   * @param tableName Nome da tabela
   * @returns Lista de logs da tabela
   */
  async findLogsByTable(tableName: string): Promise<ILog[]> {
    if (!tableName) {
      throw new ValidationError('Nome da tabela é obrigatório');
    }

    try {
      const cacheKey = `logs:table:${tableName}`;
      const cachedData = await this.getFromCache(cacheKey);

      if (cachedData) {
        return cachedData;
      }

      const result = await (this.model as any).findLogsByTable(tableName);
      await this.setInCache(cacheKey, result, 900); // Cache por 15 minutos

      return result;
    } catch (error) {
      throw new DatabaseError('Erro ao buscar logs por tabela', error as Error);
    }
  }

  /**
   * Busca logs por termo de pesquisa
   * @param query Termo de pesquisa
   * @returns Lista de logs que correspondem à pesquisa
   */
  async searchLogs(query: string): Promise<ILog[]> {
    if (!query) {
      throw new ValidationError('Termo de pesquisa é obrigatório');
    }

    try {
      const cacheKey = `logs:search:${query}`;
      const cachedData = await this.getFromCache(cacheKey);

      if (cachedData) {
        return cachedData;
      }

      const result = await (this.model as any).searchLogs(query);
      await this.setInCache(cacheKey, result, 600); // Cache por 10 minutos

      return result;
    } catch (error) {
      throw new DatabaseError('Erro ao pesquisar logs', error as Error);
    }
  }

  /**
   * Busca logs de erro em um período específico
   * @param hours Número de horas atrás para buscar
   * @returns Lista de logs de erro no período
   */
  async getErrorLogsInPeriod(hours: number = 24): Promise<ILog[]> {
    try {
      const cacheKey = `logs:errors-period:${hours}`;
      const cachedData = await this.getFromCache(cacheKey);

      if (cachedData) {
        return cachedData;
      }

      const result = await (this.model as any).getErrorLogsInPeriod(hours);
      await this.setInCache(cacheKey, result, 300); // Cache por 5 minutos apenas

      return result;
    } catch (error) {
      throw new DatabaseError(
        'Erro ao buscar logs de erro por período',
        error as Error
      );
    }
  }

  /**
   * Busca estatísticas dos logs
   * @returns Estatísticas dos logs por nível
   */
  async getLogStats(): Promise<{
    info: number;
    warn: number;
    error: number;
    debug: number;
  }> {
    try {
      const cacheKey = 'logs:stats';
      const cachedData = await this.getFromCache(cacheKey);

      if (cachedData) {
        return cachedData;
      }

      const result = await (this.model as any).getLogStats();
      await this.setInCache(cacheKey, result, 300); // Cache por 5 minutos apenas

      return result;
    } catch (error) {
      throw new DatabaseError(
        'Erro ao buscar estatísticas de logs',
        error as Error
      );
    }
  }

  /**
   * Busca quantidade total de logs
   * @returns Quantidade total de logs
   */
  async getTotalLogsCount(): Promise<number> {
    try {
      const cacheKey = 'logs:total-count';
      const cachedData = await this.getFromCache(cacheKey);

      if (cachedData !== null) {
        return cachedData;
      }

      const result = await (this.model as any).getTotalLogsCount();
      await this.setInCache(cacheKey, result, 600); // Cache por 10 minutos

      return result;
    } catch (error) {
      throw new DatabaseError('Erro ao contar logs', error as Error);
    }
  }

  /**
   * Limpa logs antigos
   * @param daysOld Número de dias para considerar como antigo
   * @returns Número de logs limpos
   */
  async cleanupOldLogs(daysOld: number = 30): Promise<number> {
    try {
      const result = await (this.model as any).cleanupOldLogs(daysOld);
      if (result > 0) {
        await this.invalidateCache();
      }
      return result;
    } catch (error) {
      throw new DatabaseError('Erro ao limpar logs antigos', error as Error);
    }
  }

  /**
   * Busca logs com filtros e paginação
   * @param filters Filtros de busca
   * @param page Número da página (começa em 1)
   * @param limit Itens por página
   * @returns Lista paginada de logs
   */
  async search(
    filters: { level?: string; message?: string; source?: string },
    page = 1,
    limit = 10
  ) {
    try {
      const { level, message, source } = filters;
      const query = this.model.db(this.model.tableName).whereNull('deleted_at');

      if (level) {
        query.where('level', level);
      }
      if (message) {
        query.where('message', 'ilike', `%${message}%`);
      }
      if (source) {
        query.where('source', source);
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
        .orderBy('created_at', 'desc');

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
      throw new DatabaseError('Erro ao buscar logs', error as Error);
    }
  }
}

// Exporta a classe diretamente para permitir a criação de novas instâncias
export { LogService };

// Exporta uma instância padrão para uso comum
const logServiceInstance = new LogService();
export default logServiceInstance;
