import BaseModel from './BaseModel';

export interface ILog {
  id?: number;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  meta?: Record<string, any> | null;
  source?: 'frontend' | 'backend';
  created_at?: string;
  updated_at?: string;
}

class Log extends BaseModel<ILog> {
  constructor() {
    super('logs');
  }

  async findByLevel(level: 'info' | 'warn' | 'error' | 'debug'): Promise<ILog[]> {
    return this.db(this.tableName)
      .where({ level })
      .whereNull('deleted_at')
      .orderBy('created_at', 'desc')
      .select('*');
  }

  async findBySource(source: 'frontend' | 'backend'): Promise<ILog[]> {
    return this.db(this.tableName)
      .where({ source })
      .whereNull('deleted_at')
      .orderBy('created_at', 'desc')
      .select('*');
  }

  async findByDateRange(start: Date, end: Date): Promise<ILog[]> {
    return this.db(this.tableName)
      .whereNull('deleted_at')
      .whereBetween('created_at', [start, end])
      .orderBy('created_at', 'desc')
      .select('*');
  }

  async findErrors(): Promise<ILog[]> {
    return this.findByLevel('error');
  }

  async getLogStats(): Promise<{
    info: number;
    warn: number;
    error: number;
    debug: number;
  }> {
    const stats = await this.db(this.tableName)
      .whereNull('deleted_at')
      .groupBy('level')
      .count('* as count')
      .select('level');

    const result = { info: 0, warn: 0, error: 0, debug: 0 };
    
    for (const stat of stats) {
      if (stat.level && stat.level in result) {
        result[stat.level as keyof typeof result] = Number(stat.count);
      }
    }

    return result;
  }

  async cleanupOldLogs(daysOld: number = 30): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    return this.db(this.tableName)
      .where('created_at', '<', cutoffDate)
      .whereNull('deleted_at')
      .update({
        deleted_at: new Date(),
        updated_at: new Date()
      });
  }

  async getRecentLogs(limit: number = 100): Promise<ILog[]> {
    return this.db(this.tableName)
      .whereNull('deleted_at')
      .orderBy('created_at', 'desc')
      .limit(limit)
      .select('*');
  }

  async findLogsByUser(userId: number): Promise<ILog[]> {
    if (!userId) return [];
    return this.db(this.tableName)
      .whereRaw("meta->>'userId' = ?", [userId.toString()])
      .whereNull('deleted_at')
      .orderBy('created_at', 'desc')
      .select('*');
  }

  async findLogsByAction(action: string): Promise<ILog[]> {
    if (!action) return [];
    return this.db(this.tableName)
      .whereRaw("meta->>'action' = ?", [action])
      .whereNull('deleted_at')
      .orderBy('created_at', 'desc')
      .select('*');
  }

  async findLogsByTable(tableName: string): Promise<ILog[]> {
    if (!tableName) return [];
    return this.db(this.tableName)
      .whereRaw("meta->>'table' = ?", [tableName])
      .whereNull('deleted_at')
      .orderBy('created_at', 'desc')
      .select('*');
  }

  async searchLogs(query: string): Promise<ILog[]> {
    if (!query) return [];
    return this.db(this.tableName)
      .where('message', 'like', `%${query}%`)
      .orWhereRaw("meta::text like ?", [`%${query}%`])
      .whereNull('deleted_at')
      .orderBy('created_at', 'desc')
      .select('*');
  }

  async getTotalLogsCount(): Promise<number> {
    const result = await this.db(this.tableName)
      .whereNull('deleted_at')
      .count('* as count')
      .first();

    return Number(result?.count || 0);
  }

  async getErrorLogsInPeriod(hours: number = 24): Promise<ILog[]> {
    const since = new Date();
    since.setHours(since.getHours() - hours);

    return this.db(this.tableName)
      .where({ level: 'error' })
      .where('created_at', '>', since)
      .whereNull('deleted_at')
      .orderBy('created_at', 'desc')
      .select('*');
  }
}

export default new Log();